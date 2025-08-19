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
  res.status(200).json(contacts);
});

router.get("/where-2", async (req: Request, res: Response) => {
  const contacts = await prisma.contact.findMany({
    where: {
      email: "diego75@gmail.com",
      name: "李雅婷",
    },
  });
  res.status(200).json(contacts);
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
  res.status(200).json(contacts);
});

router.get("/where-4", async (req: Request, res: Response) => {
  const beginBirth = new Date("1995-01-01 00:00:00");
  const contacts = await prisma.contact.findMany({
    select: { ab_id: true, name: true, email: true, mobile: true, address: true },
    where: {
      birthday: { gte: beginBirth },
      email: { contains: "@gmail.com" },
      address: { in: ["宜蘭縣", "高雄市"] },
    },
  });
  res.status(200).json(contacts);
});

router.get("/where-5", async (req: Request, res: Response) => {
  const beginBirth = new Date("1995-01-01 00:00:00");
  const members = await prisma.member.findMany({
    where: {
      favorites: { notEquals: null  },
    },
  });
  res.status(200).json(members);
});

router.get("/where-n", async (req: Request, res: Response) => {
  const beginBirth = new Date("1995-01-01 00:00:00");
  const members = await prisma.member.findMany({

    where: {
      favorites: { none:{} },
    },
  });
  res.status(200).json(members);
});
export default router;
