import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prisma-only";

const router = express.Router();

router.get("/where-1", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      email: "diego75@gmail.com",
    },
  });
  res.json(contacts);
});

router.get("/where-2", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      email: "diego75@gmail.com",
      name: "李雅婷",
    },
  });
  res.json(contacts);
});
// 林柏翰

router.get("/where-3", async (req: Request, res: Response) => {
  const beginBirth = new Date("1960-01-01 00:00:00");
  const endBirth = new Date("1970-01-01 00:00:00");
  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        { birthday: { gte: beginBirth, lt: endBirth } },
        { name: "林柏翰" },
      ],
      NOT: [{ address: "花蓮縣" }],
    },
  });
  res.json(contacts);
});

router.get("/where-4", async (req: Request, res: Response) => {
  const beginBirth = new Date("1995-01-01 00:00:00");
  const contacts = await prisma.contact.findMany({
    select: {
      ab_id: true,
      name: true,
      email: true,
      mobile: true,
      address: true,
    },
    where: {
      birthday: { gte: beginBirth },
      email: { contains: "@gmail.com" },
      address: { in: ["宜蘭縣", "高雄市"] },
    },
  });
  res.json(contacts);
});

router.get("/where-5", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      birthday: { equals: null }, // birthday 欄為空值
    },
  });
  res.json(contacts);
});

router.get("/where-6", async (req: Request, res: Response) => {
  const members = await prisma.member.findMany({
    where: {
      // 找到擁有 favorites 的 Member
      favorites: { some: {} },
    },
  });
  res.json(members);
});

router.get("/where-7", async (req: Request, res: Response) => {
  const members = await prisma.member.findMany({
    where: {
      // 找到沒有 favorites 資料的 Member
      favorites: { none: {} },
    },
  });
  res.json(members);
});
router.get("/include", async (req: Request, res: Response) => {
  const members = await prisma.member.findMany({
    where: {
      favorites: { some: {} },
    },
    include: {
      // Member 包含 favorites 資料
      favorites: {
        include: {
          // favorite 資料包含 contact 資料
          contact: true,
        },
      },
    },
  });
  res.json(members);
});

router.get("/order-by", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      name: { in: ["劉佳穎", "鄭雅筑", "林柏翰"] },
    },
    orderBy: [{ name: "asc" }, { birthday: "desc" }],
  });
  res.json(contacts);
});

router.get("/take-skip/:page?", async (req: Request, res: Response) => {
  const perPage = 12;
  let page = parseInt(req.params.page);
  if (!page || page < 1) {
    page = 1;
  }
  const contacts = await prisma.contact.findMany({
    take: perPage, // 返回前幾筆記錄
    skip: (page - 1) * perPage, // 跳過前幾筆記錄
    orderBy: { ab_id: "desc" },
  });
  res.json(contacts);
});

router.get("/count", async (req: Request, res: Response) => {
  const totalContacts = await prisma.contact.count();
  const aggregate = await prisma.contact.aggregate({
    _avg: { ab_id: true },
    _count: { ab_id: true },
    _sum: { ab_id: true },
    _min: { ab_id: true },
    _max: { ab_id: true },
  });
  res.json({ totalContacts, aggregate });
});
export default router;
