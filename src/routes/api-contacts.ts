import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";

const router = express.Router();

// TODO: RESTFul API
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [contacts, meta] = await prisma.contact
      .paginate({
        orderBy: { created_at: 'desc' }
      })
      .withPages({
        limit: limit,
        page: page,
        includePageCount: true
      });

    res.json({
      success: true,
      data: contacts,
      meta: {
        ...meta,
        totalCount: meta.totalCount || 0,
        totalPages: meta.pageCount || 0,
        currentPage: page,
        limit: limit
      }
    });
  } catch (error) {
    console.error('獲取聯絡人列表失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取聯絡人列表失敗'
    });
  }
});

router.get("/:ab_id", async (req: Request, res: Response) => {
  try {
    const ab_id = parseInt(req.params.ab_id);
    
    if (isNaN(ab_id)) {
      return res.status(400).json({
        success: false,
        error: '無效的聯絡人編號'
      });
    }

    const contact = await prisma.contact.findUnique({
      where: { ab_id: ab_id }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: '找不到該聯絡人'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('獲取聯絡人失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取聯絡人失敗'
    });
  }
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
