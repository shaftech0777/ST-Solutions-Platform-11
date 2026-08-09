import { Router } from "express";
import { authRouter } from "../modules/auth/index.js";
import { usersRouter } from "../modules/users/index.js";

export const apiRouter = Router();

// Mount Domain Module Routers
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

