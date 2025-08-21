import express from "express";
import type { Request, Response } from "express";
import { prisma } from "../utils/prisma-pagination";
import { z } from "zod";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { Member, ApiResponse, ApiErrorResponse, JwtPayload, LoginSuccessResponse } from "../interfaces";
import { loginSchema } from "../schemas";

const router = express.Router();

// JWT 設定
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

// Router 路由定義

router.post("/jwt-login", async (req: Request, res: Response) => {
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

    // 成功登入，生成 JWT token
    const payload: JwtPayload = {
      member_id: member.member_id,
      email: member.email,
      nickname: member.nickname,
      mobile: member.mobile
    };

    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    } as jwt.SignOptions);

    const response: LoginSuccessResponse = {
      success: true,
      data: {
        member: {
          member_id: member.member_id,
          email: member.email,
          nickname: member.nickname,
          mobile: member.mobile,
          create_at: member.create_at
        },
        token
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

router.get("/jwt-logged-in", async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: "未提供有效的 token"
      };
      return res.status(401).json(response);
    }

    const token = authorization.substring(7); // 移除 "Bearer " 前綴
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      const response: ApiResponse = {
        success: true,
        data: {
          member_id: decoded.member_id,
          email: decoded.email,
          nickname: decoded.nickname,
          mobile: decoded.mobile
        },
        message: "已登入"
      };
      res.status(200).json(response);
    } catch (jwtError) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: "token 無效或已過期"
      };
      res.status(401).json(response);
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


export default router;
