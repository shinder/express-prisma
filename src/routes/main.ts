import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-only";

const router = express.Router();

router.get("/login", async (req: Request, res: Response) => {
  if((req.session as any).member) {
    res.redirect('/');
    return;
  }
  res.render('login');
});


export default router;
