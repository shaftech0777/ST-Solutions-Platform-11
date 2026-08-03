import express, { Express, Request, Response } from "express";
import { errorHandler } from "./middlewares/index.js";

const app: Express = express();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "st-solutions-api", version: "1.0.0" });
});

app.use(errorHandler);

export default app;
