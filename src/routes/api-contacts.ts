import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";

const router = express.Router();

// TODO: RESTFul API
router.get("/", async (req: Request, res: Response) => {
  // TODO: 針對 prisma 模型 Contact 做列表分頁
});

router.get("/:ab_id", async (req: Request, res: Response) => {
  // TODO: 針對 prisma 模型 Contact 做讀取單筆
});

router.post("/", async (req: Request, res: Response) => {
  // TODO: 針對 prisma 模型 Contact 做新增資料
});

router.put("/:ab_id", async (req: Request, res: Response) => {
  // TODO: 針對 prisma 模型 Contact 做更新資料
});

router.delete("/:ab_id", async (req: Request, res: Response) => {
  // TODO: 針對 prisma 模型 Contact 做刪除資料
});
export default router;
