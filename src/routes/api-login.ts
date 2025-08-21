import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";
import { z } from "zod";
import moment from "moment";

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => {
  // TODO: 前端送兩個欄位: email, password, 判斷資料庫資料。成功登入使用 session 記錄在 req.session.member
});

router.get("/logged-in", async (req: Request, res: Response) => {
  // TODO：若有登入，回傳 req.session.member 資料，若無回傳 null
});

router.get("/logout", async (req: Request, res: Response) => {
  // TODO：登出移除 req.session.member
});

export default router;
