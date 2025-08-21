import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";
import { z } from "zod";
import moment from "moment";
import bcrypt from "bcrypt";

const router = express.Router();

// 型別定義
interface Member {
  member_id: number;
  email: string;
  password_hash: string;
  mobile: string | null;
  nickname: string;
  create_at: Date;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Zod 驗證 schema
const loginSchema = z.object({
  email: z.string().email({ message: "請輸入有效的電子郵件格式" }),
  password: z.string().min(6, "密碼至少需要 6 個字元")
});

router.post("/login", async (req: Request, res: Response) => {
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

    // 成功登入，設定 session
    (req.session as any).member = {
      member_id: member.member_id,
      email: member.email,
      nickname: member.nickname,
      mobile: member.mobile
    };

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
  // TODO：若有登入，回傳 req.session.member 資料，若無回傳 null
});

router.get("/logout", async (req: Request, res: Response) => {
  // TODO：登出移除 req.session.member
});

export default router;
