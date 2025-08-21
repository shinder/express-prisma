import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";
import { z } from "zod";
import type { Contact, ApiResponse, ApiErrorResponse, PaginatedResponse, DeleteResponse } from "../interfaces";
import { createContactSchema } from "../schemas";

const router = express.Router();

// Router 路由定義

router.get("/", async (req: Request, res: Response<PaginatedResponse<Contact> | ApiErrorResponse>) => {
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

    const response: PaginatedResponse<Contact> = {
      success: true,
      data: contacts as Contact[],
      meta: {
        ...meta,
        totalCount: meta.totalCount || 0,
        totalPages: meta.pageCount || 0,
        currentPage: page,
        limit: limit
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('獲取聯絡人列表失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: '獲取聯絡人列表失敗'
    };
    res.status(500).json(errorResponse);
  }
});

router.get("/:ab_id", async (req: Request, res: Response<ApiResponse<Contact> | ApiErrorResponse>) => {
  try {
    const ab_id = parseInt(req.params.ab_id);
    
    if (isNaN(ab_id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: '無效的聯絡人編號'
      };
      return res.status(400).json(errorResponse);
    }

    const contact = await prisma.contact.findUnique({
      where: { ab_id: ab_id }
    });

    if (!contact) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: '找不到該聯絡人'
      };
      return res.status(404).json(errorResponse);
    }

    const response: ApiResponse<Contact> = {
      success: true,
      data: contact as Contact
    };
    res.json(response);
  } catch (error) {
    console.error('獲取聯絡人失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: '獲取聯絡人失敗'
    };
    res.status(500).json(errorResponse);
  }
});

router.post("/", async (req: Request, res: Response<ApiResponse<Contact> | ApiErrorResponse>) => {
  try {
    const validatedData = createContactSchema.parse(req.body);
    
    const newContact = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        mobile: validatedData.mobile || "",
        address: validatedData.address || "",
        birthday: validatedData.birthday
      }
    });

    const response: ApiResponse<Contact> = {
      success: true,
      data: newContact as Contact,
      message: "聯絡人新增成功"
    };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "資料驗證失敗",
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
      return res.status(400).json(errorResponse);
    }

    console.error('新增聯絡人失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "新增聯絡人失敗"
    };
    res.status(500).json(errorResponse);
  }
});

router.put("/:ab_id", async (req: Request, res: Response<ApiResponse<Contact> | ApiErrorResponse>) => {
  try {
    const ab_id = parseInt(req.params.ab_id);
    
    if (isNaN(ab_id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: '無效的聯絡人 ID'
      };
      return res.status(400).json(errorResponse);
    }

    // 檢查聯絡人是否存在
    const existingContact = await prisma.contact.findUnique({
      where: { ab_id: ab_id }
    });

    if (!existingContact) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: '找不到該聯絡人'
      };
      return res.status(404).json(errorResponse);
    }

    // 驗證資料
    const validatedData = createContactSchema.parse(req.body);
    
    // 更新聯絡人資料
    const updatedContact = await prisma.contact.update({
      where: { ab_id: ab_id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        mobile: validatedData.mobile || "",
        address: validatedData.address || "",
        birthday: validatedData.birthday
      }
    });

    const response: ApiResponse<Contact> = {
      success: true,
      data: updatedContact as Contact,
      message: "聯絡人更新成功"
    };
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "資料驗證失敗",
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
      return res.status(400).json(errorResponse);
    }

    console.error('更新聯絡人失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "更新聯絡人失敗"
    };
    res.status(500).json(errorResponse);
  }
});

router.delete("/:ab_id", async (req: Request, res: Response<DeleteResponse | ApiErrorResponse>) => {
  try {
    const ab_id = parseInt(req.params.ab_id);
    
    if (isNaN(ab_id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: '無效的聯絡人 ID'
      };
      return res.status(400).json(errorResponse);
    }

    // 檢查聯絡人是否存在
    const existingContact = await prisma.contact.findUnique({
      where: { ab_id: ab_id }
    });

    if (!existingContact) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: '找不到該聯絡人'
      };
      return res.status(404).json(errorResponse);
    }

    // 刪除聯絡人
    await prisma.contact.delete({
      where: { ab_id: ab_id }
    });

    const response: DeleteResponse = {
      success: true,
      message: "聯絡人刪除成功",
      data: {
        ab_id: ab_id,
        name: existingContact.name
      }
    };
    res.json(response);
  } catch (error) {
    console.error('刪除聯絡人失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "刪除聯絡人失敗"
    };
    res.status(500).json(errorResponse);
  }
});
export default router;
