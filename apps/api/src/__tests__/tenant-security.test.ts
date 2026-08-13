import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OrganizationRole, WorkspaceRole } from "@prisma/client";
import { RequestContext } from "../core/context/request-context.js";
import { TenantContext } from "../core/security/tenant.context.js";
import { requireOrganizationRole, requireWorkspaceRole } from "../core/security/tenant.middleware.js";
import { OrganizationService } from "../modules/organizations/organization.service.js";

describe("Multi-Tenant Isolation & Role Enforcement", () => {
  it("should store and retrieve tenant scope in TenantContext", () => {
    RequestContext.run({ requestId: "req-1" }, () => {
      TenantContext.setTenantContext({
        organizationId: "org-123",
        workspaceId: "ws-456",
        organizationRole: OrganizationRole.ADMIN,
        workspaceRole: WorkspaceRole.ADMIN,
      });

      assert.equal(TenantContext.getOrganizationId(), "org-123");
      assert.equal(TenantContext.getWorkspaceId(), "ws-456");
      assert.equal(TenantContext.getOrganizationRole(), OrganizationRole.ADMIN);
      assert.equal(TenantContext.getWorkspaceRole(), WorkspaceRole.ADMIN);
    });
  });

  it("should allow request when user holds required organization role", () => {
    const middleware = requireOrganizationRole(OrganizationRole.OWNER, OrganizationRole.ADMIN);
    let nextCalled = false;
    let nextErr: any = null;

    const req: any = {
      user: { userId: "user-1", accountType: "MEMBER" },
      tenantContext: {
        organizationId: "org-1",
        organizationRole: OrganizationRole.ADMIN,
      },
    };

    middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextErr = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(nextErr, undefined);
  });

  it("should reject request when user lacks required organization role", () => {
    const middleware = requireOrganizationRole(OrganizationRole.OWNER);
    let nextCalled = false;
    let nextErr: any = null;

    const req: any = {
      user: { userId: "user-2", accountType: "MEMBER" },
      tenantContext: {
        organizationId: "org-1",
        organizationRole: OrganizationRole.MEMBER,
      },
    };

    middleware(req, {} as any, (err?: any) => {
      nextCalled = true;
      nextErr = err;
    });

    assert.equal(nextCalled, true);
    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
  });

  it("should prevent organization ADMIN from inviting user as OWNER", async () => {
    const mockOrgRepo: any = {
      getMember: async (orgId: string, userId: string) => {
        if (userId === "admin-1") {
          return { userId: "admin-1", role: OrganizationRole.ADMIN };
        }
        return null;
      },
    };

    const orgService = new OrganizationService(mockOrgRepo);

    await assert.rejects(
      async () => {
        await orgService.inviteMember("org-1", "admin-1", {
          email: "newowner@shaftech.com",
          role: OrganizationRole.OWNER,
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /Admins cannot invite users with the Owner role/);
        return true;
      }
    );
  });

  it("should prevent organization ADMIN from promoting target member to OWNER", async () => {
    const mockOrgRepo: any = {
      getMember: async (orgId: string, userId: string) => {
        if (userId === "admin-1") return { userId: "admin-1", role: OrganizationRole.ADMIN };
        if (userId === "member-1") return { userId: "member-1", role: OrganizationRole.MEMBER };
        return null;
      },
    };

    const orgService = new OrganizationService(mockOrgRepo);

    await assert.rejects(
      async () => {
        await orgService.updateMemberRole("org-1", "admin-1", "member-1", {
          role: OrganizationRole.OWNER,
        });
      },
      (err: any) => {
        assert.equal(err.statusCode, 403);
        assert.match(err.message, /Admins cannot assign the Owner role/);
        return true;
      }
    );
  });
});
