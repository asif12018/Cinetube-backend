// import express, { Application, Request, Response } from "express";
// import cors from "cors";
// import config from "./app/config";
// import { toNodeHandler } from "better-auth/node";
// import { auth } from "./app/lib/auth";
// import cookieParser from "cookie-parser";
// import { IndexRoutes } from "./app/routes";

// import { globalErrorHandler } from "./app/middlewares/globalErrorhandler";
// import { notFount } from "./app/middlewares/notFountRoutes";
// import { PaymentRoutes } from "./app/modules/purchase/payment.routes";

// const app: Application = express();

// // parsers
// app.use(express.json());
// app.use(
//   cors({
//     origin: [config.BETTER_AUTH_URL, config.FRONTEND_URL] as string[],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );
// app.use('/api/v1/payment', PaymentRoutes);

// app.use("/api/auth", toNodeHandler(auth));

// app.use(express.urlencoded({ extended: true }));

// app.use(express.json());

// app.use(cookieParser());

// app.use(express.urlencoded({ extended: true }));

// //specify routes

// app.use("/api/v1", IndexRoutes);

// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello from Apollo Gears World!");
// });

// app.use(notFount);
// app.use(globalErrorHandler);

// export default app;


import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./app/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import cookieParser from "cookie-parser";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorhandler";
import { notFount } from "./app/middlewares/notFountRoutes";
import { PaymentRoutes } from "./app/modules/purchase/payment.routes";
import path from "path"; // 🚨 This is the missing piece

const app: Application = express();

// 🚨 1. SETUP EJS VIEW ENGINE (REQUIRED FOR CINETUBE TEMPLATE)
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`)); // Adjust path if your templates folder is elsewhere


// 1. GLOBALS (Must be at the very top)
// app.use(cors({
//     origin: [config.BETTER_AUTH_URL, config.FRONTEND_URL] as string[],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
// }));

const corsOptions = {
  origin: [
    config.BETTER_AUTH_URL,
    config.FRONTEND_URL,
    "http://localhost:3000",
  ] as string[],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("(.*)", cors(corsOptions));

app.use(cookieParser()); // Required for Better-Auth

// 2. AUTHENTICATION
// app.use("/api/auth", toNodeHandler(auth));
app.use("/api/v1/auth", toNodeHandler(auth));

// ✅ To this (Order matters! Put this BEFORE IndexRoutes):
// app.use("/api/v1/auth", toNodeHandler(auth));

app.use('/api/v1/payment/stripe/webhook', 
  express.raw({ type: 'application/json' })
);

// 3. THE STRIPE WEBHOOK (Must be before express.json!)
app.use('/api/v1/payment', PaymentRoutes);

// 4. GLOBAL PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. ALL OTHER ROUTES
app.use("/api/v1", IndexRoutes);

//remove if not work
// app.use("/api/v1/auth", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Apollo Gears World!");
});

app.use(notFount);
app.use(globalErrorHandler);

export default app;