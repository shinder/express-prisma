// 匯入套件及類型定義 (類別、介面)
import express from "express";
// *** verbatimModuleSyntax 為 true 時，標示匯入類型
import type { Request, Response, NextFunction } from "express";
// 截入環境變數設定檔
import "dotenv/config";

import cookieParser from "cookie-parser";
import session from "express-session";
import sessionFileStore from "session-file-store";

import usersRouter from "./routes/users";
import tryABRouter from "./routes/try_ab";
import apiContactsRouter from "./routes/api-contacts";
import apiLoginRouter from "./routes/api-login";
import apiJwtLoginRouter from "./routes/api-jwt-login";
import { jwtParseMiddleware } from "./middleware";


// 建立伺服器主物件
const app = express();
app.set("view engine", "ejs");

// 設定靜態內容資料夾
app.use(express.static("public"));
// 解析 JSON body 的中間件
app.use(express.json());
// 解析 URL-encoded body 的中間件
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser()); // 全域中介軟體：解析 cookies

const FileStore = sessionFileStore(session);
app.use(
    session({
      // 新用戶沒有使用到 session 物件時不會建立 session 和發送 cookie
      saveUninitialized: false,
      resave: false, // 沒變更內容是否強制回存
      secret: "雜湊 session id 的字串",
      // cookie: {
      //   maxAge: 1200_000, // 20分鐘，單位毫秒
      // },
      store: new FileStore({}), // 使用檔案作為 session 儲存媒介
    })
);


// ************* 自訂的頂層 "中間件, 中介軟體" *************
// JWT 解析 middleware (可選性驗證)
app.use(jwtParseMiddleware);

app.use((req, res, next) => {
  res.locals.pageName = "";
  res.locals.session = req.session; // 讓所有的 EJS 可以用 session 變數
  res.locals.query = req.query;
  res.locals.cookies = req.cookies;
  
  next();
});

// 網站根目錄頁面
app.get("/", (req: Request, res: Response) => {
  res.render("home", {name: 'prisma'});
});

app.use("/users", usersRouter);
app.use("/try-ab", tryABRouter);

app.use("/api", apiLoginRouter);
app.use("/api", apiJwtLoginRouter);
app.use("/api/contacts", apiContactsRouter);

const port = +(process.env.PORT || "3002");
app.listen(port, () => {
  console.log(`Express + Prisma 啟動 http://localhost:${port}`);
});