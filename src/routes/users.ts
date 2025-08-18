import express from "express";
import type { NextFunction, Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import upload from "./../utils/upload-media";
import { prisma } from "../utils/prisma-only";
// import getClientIp from "../utils/get-client-ip";

const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

router.get("/create", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Wick",
        email: "john.wick@example.com",
      },
    });
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get("/read/:user_id?", async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id) || 1;
  const user = await prisma.user.findUnique({
    where: { id: user_id },
  });
  res.status(200).json(user);
});

router.get("/update/:user_id?", async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id) || 1;
  try {
    const user = await prisma.user.update({
      where: { id: user_id },
      data: { lastName: "Doe" },
    });

    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get("/delete/:user_id?", async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id) || 1;
  try {
    const user = await prisma.user.delete({
      where: { id: user_id },
    });
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});
export default router;
