import { PrismaClient } from "../generated/prisma";
import { pagination } from "prisma-extension-pagination";

export const prisma = new PrismaClient().$extends(pagination());
