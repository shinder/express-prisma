import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-only";

const router = express.Router();

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

router.get("/transaction-1", async (req: Request, res: Response) => {
  try {
    const result = await prisma.$transaction([
      prisma.user.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john1@example.com",
        },
      }),
      prisma.user.create({
        data: {
          firstName: "Johnny",
          lastName: "Doe",
          email: "john2@example.com",
        },
      }),
    ]);
    res.json({ success: true, result });
  } catch (error) {
    console.error("交易失敗，資料已回滾");
    res.status(400).json({ success: false, error });
  }
});
router.get("/transaction-2", async (req: Request, res: Response) => {
  let user, post;
  try {
    await prisma.$transaction(async (tx) => {
      user = await tx.user.create({
        data: {
          firstName: "Shinder",
          lastName: "Lin",
          email: "shinder.lin@gmail.com",
        },
      });
      post = await tx.post.create({
        data: { content: "新貼文 1 內容", author_id: user.id },
      });
    });
    res.json({ success: true, user, post });
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

router.get("/shin", async (req: Request, res: Response) => {
  const email = "shinder.lin@gmail.com";
  const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email=${email} `;
  res.json(users);
});
export default router;
