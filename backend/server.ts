import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import dbRouter from "./routes";
import { ensureDatabase } from "./dbPool";
import { runMigrations } from "./migrations/runMigrations";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:5173"],
  })
);
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Hello World" });
});

app.use("/api", dbRouter);

async function start() {
  try {
    await ensureDatabase();
    await runMigrations();
    app.listen(port, () => {
      console.log(`Todo API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to prepare database:", error);
    process.exit(1);
  }
}

start();
