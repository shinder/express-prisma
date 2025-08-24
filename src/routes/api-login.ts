import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";
import { z } from "zod";
import bcrypt from "bcrypt";
import type { Member, ApiResponse, ApiErrorResponse } from "../interfaces";
import { loginSchema } from "../schemas";
import { setSessionDataAsync, clearSessionFieldsAsync } from "../utils/session-utils";
import upload from "../utils/upload-images"

const router = express.Router();
// Router 路由定義

router.post("/login", upload.none(), async (req: Request, res: Response) => {
  try {
    // 驗證輸入資料
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 查詢會員資料
    const member = await prisma.member.findUnique({
      where: { email }
    });

    if (!member) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "帳號或密碼錯誤"
      };
      return res.status(401).json(errorResponse);
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, member.password_hash);
    
    if (!isPasswordValid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "帳號或密碼錯誤"
      };
      return res.status(401).json(errorResponse);
    }

    // 成功登入，設定 session 並確保儲存完成
    const sessionData = {
      member: {
        member_id: member.member_id,
        email: member.email,
        nickname: member.nickname,
        mobile: member.mobile
      }
    };

    // 使用工具函數安全地設定並儲存 session
    await setSessionDataAsync(req, sessionData);

    const response: ApiResponse<Omit<Member, 'password_hash'>> = {
      success: true,
      data: {
        member_id: member.member_id,
        email: member.email,
        nickname: member.nickname,
        mobile: member.mobile,
        create_at: member.create_at
      },
      message: "登入成功"
    };
    
    res.status(200).json(response);
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

    console.error('登入失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "伺服器內部錯誤，請稍後再試"
    };
    res.status(500).json(errorResponse);
  }
});

router.get("/logged-in", async (req: Request, res: Response) => {
  try {
    const sessionMember = (req.session as any).member;
    
    if (sessionMember) {
      const response: ApiResponse = {
        success: true,
        data: sessionMember,
        message: "已登入"
      };
      res.status(200).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: "未登入"
      };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('檢查登入狀態失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "伺服器內部錯誤，請稍後再試"
    };
    res.status(500).json(errorResponse);
  }
});

router.get("/logout", async (req: Request, res: Response) => {
  try {
    const sessionMember = (req.session as any).member;
    
    if (sessionMember) {
      // 安全地清除 session 中的 member 資料並確保儲存
      await clearSessionFieldsAsync(req, ['member']);
      
      const response: ApiResponse = {
        success: true,
        data: null,
        message: "登出成功"
      };
      res.status(200).json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: "您尚未登入"
      };
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('登出失敗:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "登出過程中發生錯誤，請稍後再試"
    };
    res.status(500).json(errorResponse);
  }
});

export default router;
