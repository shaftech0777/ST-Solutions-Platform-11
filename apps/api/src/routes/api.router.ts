import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { permissionsRouter } from "../modules/permissions/index.js";
import { rolesRouter } from "../modules/roles/index.js";
import { usersRouter } from "../modules/users/index.js";
import { applicantsRouter } from "../modules/applicants/index.js";
import { membersRouter } from "../modules/members/index.js";

export const apiRouter = Router();

// Mount Domain Module Routers
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/permissions", permissionsRouter);
apiRouter.use("/applicants", applicantsRouter);
apiRouter.use("/members", membersRouter);


