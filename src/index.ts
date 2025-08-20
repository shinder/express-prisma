// 匯入套件及類型定義 (類別、介面)
import express from "express";
// *** verbatimModuleSyntax 為 true 時，標示匯入類型
import type { Request, Response, NextFunction } from "express";
// 截入環境變數設定檔
import "dotenv/config";

import usersRouter from "./routes/users";
import tryABRouter from "./routes/try_ab";
import apiContactsRouter from "./routes/api-contacts";


// 建立伺服器主物件
const app = express();
// 設定靜態內容資料夾
app.use(express.static("public"));
// 解析 JSON body 的中間件
app.use(express.json());
// 解析 URL-encoded body 的中間件
app.use(express.urlencoded({ extended: true }));
// 網站根目錄頁面
app.get("/", (req: Request, res: Response) => {
  res.send("歡迎來到 Express + TS !");
});

app.use("/users", usersRouter);
app.use("/try-ab", tryABRouter);
app.use("/api/contacts", apiContactsRouter);

const port = +(process.env.PORT || "3002");
app.listen(port, () => {
  console.log(`Express + TS 啟動 http://localhost:${port}`);
});