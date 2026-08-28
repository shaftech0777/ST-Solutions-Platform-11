import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AuthorizationPolicy } from "../core/security/authorization.policy.js";
import { AuthorizationError } from "../core/errors/app-error.js";

describe("Organizational Hierarchy & Policy Engine", () => {
  const adminActor = { userId: "admin-1", accountType: "ADMIN" };
  const subAdminActor = { userId: "subadmin-1", accountType: "SUB_ADMIN" };
  const manager1Actor = { userId: "manager-1", accountType: "MANAGER" };
  const manager2Actor = { userId: "manager-2", accountType: "MANAGER" };
  const member1Actor = { userId: "member-1", accountType: "MEMBER" };
  const member2Actor = { userId: "member-2", accountType: "MEMBER" };
  const clientActor = { userId: "client-1", accountType: "CLIENT" };

  const subordinateMember = {
    id: "member-1",
    accountType: "MEMBER",
    managedByUserId: "manager-1",
    createdByUserId: "manager-1",
  };

  const unassignedMember = {
    id: "member-2",
    accountType: "MEMBER",
    managedByUserId: "manager-2",
    createdByUserId: "manager-2",
  };

  const managerUser = {
    id: "manager-1",
    accountType: "MANAGER",
    managedByUserId: "subadmin-1",
  };

  const adminUser = {
    id: "admin-1",
    accountType: "ADMIN",
  };

  it("should enforce hierarchy weights correctly", () => {
    assert.equal(AuthorizationPolicy.getHierarchyWeight("ADMIN"), 4);
    assert.equal(AuthorizationPolicy.getHierarchyWeight("SUB_ADMIN"), 3);
    assert.equal(AuthorizationPolicy.getHierarchyWeight("MANAGER"), 2);
    assert.equal(AuthorizationPolicy.getHierarchyWeight("MEMBER"), 1);
    assert.equal(AuthorizationPolicy.getHierarchyWeight("CLIENT"), 0);
  });

  it("should allow ADMIN to manage all lower and peer accounts", () => {
    assert.equal(AuthorizationPolicy.canManageUser(adminActor, managerUser), true);
    assert.equal(AuthorizationPolicy.canManageUser(adminActor, subordinateMember), true);
    assert.equal(AuthorizationPolicy.canManageUser(adminActor, adminUser), true);
  });

  it("should allow MANAGER to manage ONLY assigned subordinates", () => {
    // manager-1 manages subordinateMember
    assert.equal(AuthorizationPolicy.canManageUser(manager1Actor, subordinateMember), true);
    // manager-1 does NOT manage unassignedMember
    assert.equal(AuthorizationPolicy.canManageUser(manager1Actor, unassignedMember), false);
    // manager-1 CANNOT manage peer manager
    assert.equal(AuthorizationPolicy.canManageUser(manager1Actor, { id: "manager-2", accountType: "MANAGER" }), false);
    // manager-1 CANNOT manage admin
    assert.equal(AuthorizationPolicy.canManageUser(manager1Actor, adminUser), false);
  });

  it("should prevent privilege and role escalation", () => {
    // MANAGER cannot assign ADMIN role
    assert.equal(AuthorizationPolicy.canAssignRole(manager1Actor, subordinateMember, "ADMIN"), false);
    // MANAGER cannot assign SUB_ADMIN role
    assert.equal(AuthorizationPolicy.canAssignRole(manager1Actor, subordinateMember, "SUB_ADMIN"), false);
    // MANAGER cannot assign MANAGER role
    assert.equal(AuthorizationPolicy.canAssignRole(manager1Actor, subordinateMember, "MANAGER"), false);
    // MANAGER can only assign MEMBER or CLIENT to subordinate
    assert.equal(AuthorizationPolicy.canAssignRole(manager1Actor, subordinateMember, "MEMBER"), true);
    assert.equal(AuthorizationPolicy.canAssignRole(manager1Actor, subordinateMember, "CLIENT"), true);

    // SUB_ADMIN cannot assign ADMIN role
    assert.equal(AuthorizationPolicy.canAssignRole(subAdminActor, managerUser, "ADMIN"), false);
    // SUB_ADMIN can assign MANAGER role
    assert.equal(AuthorizationPolicy.canAssignRole(subAdminActor, subordinateMember, "MANAGER"), true);

    // ADMIN can assign any role
    assert.equal(AuthorizationPolicy.canAssignRole(adminActor, subordinateMember, "ADMIN"), true);
    assert.equal(AuthorizationPolicy.canAssignRole(adminActor, subordinateMember, "SUB_ADMIN"), true);
  });

  it("should prevent lower levels from deleting higher or peer levels", () => {
    // MEMBER cannot delete anyone
    assert.equal(AuthorizationPolicy.canDeleteUser(member1Actor, subordinateMember), false);
    // MANAGER cannot delete peer MANAGER
    assert.equal(AuthorizationPolicy.canDeleteUser(manager1Actor, { id: "manager-2", accountType: "MANAGER" }), false);
    // MANAGER cannot delete ADMIN
    assert.equal(AuthorizationPolicy.canDeleteUser(manager1Actor, adminUser), false);
    // MANAGER can delete own subordinate
    assert.equal(AuthorizationPolicy.canDeleteUser(manager1Actor, subordinateMember), true);
    // ADMIN can delete subordinate
    assert.equal(AuthorizationPolicy.canDeleteUser(adminActor, managerUser), true);
  });

  it("should enforce client isolation across managers and members", () => {
    const clientA = {
      id: "client-a",
      createdById: "member-1",
      ownerId: "member-1",
      supervisorId: "manager-1",
      ownership: {
        memberId: "member-record-1",
        assignedManagerId: "manager-1",
      },
    };

    const clientB = {
      id: "client-b",
      createdById: "member-2",
      ownerId: "member-2",
      supervisorId: "manager-2",
      ownership: {
        memberId: "member-record-2",
        assignedManagerId: "manager-2",
      },
    };

    // ADMIN has unrestricted access to all clients
    assert.equal(AuthorizationPolicy.canAccessClient(adminActor, clientA), true);
    assert.equal(AuthorizationPolicy.canAccessClient(adminActor, clientB), true);

    // SUB_ADMIN has access to all clients
    assert.equal(AuthorizationPolicy.canAccessClient(subAdminActor, clientA), true);
    assert.equal(AuthorizationPolicy.canAccessClient(subAdminActor, clientB), true);

    // MANAGER 1 can access clientA, but NOT clientB
    assert.equal(AuthorizationPolicy.canAccessClient(manager1Actor, clientA), true);
    assert.equal(AuthorizationPolicy.canAccessClient(manager1Actor, clientB), false);

    // MEMBER 1 can access clientA, but NOT clientB
    assert.equal(AuthorizationPolicy.canAccessClient(member1Actor, clientA), true);
    assert.equal(AuthorizationPolicy.canAccessClient(member1Actor, clientB), false);

    // Throwing enforcement tests
    assert.throws(() => {
      AuthorizationPolicy.enforceCanAccessClient(manager1Actor, clientB);
    }, AuthorizationError);
  });
});
