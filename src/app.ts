import express from "express";
import type { Application } from "express";
import sendResponse from "./utils/sendResponse";
import { authRouter } from "./modules/auth/auth.route";
import config from "./config";
import { initDB } from "./db";
import CookieParser from "cookie-parser";
import { issueRoute } from "./modules/issue/issue.route";

const app: Application = express();

app.use(CookieParser());
app.use(express.json());

initDB();

app.get("/", (req, res) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Hello World!",
  });
});

app.use(`${config.baseUrl}/auth`, authRouter);
app.use(`${config.baseUrl}/issues`, issueRoute);

export default app;
