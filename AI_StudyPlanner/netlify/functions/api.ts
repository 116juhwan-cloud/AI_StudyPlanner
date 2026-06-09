import express from "express";
import serverless from "serverless-http";
import { apiRouter } from "../../api-router.js";

const api = express();

api.use(express.json());
api.use("/api", apiRouter);
api.use("/.netlify/functions/api", apiRouter);

export const handler = serverless(api);
