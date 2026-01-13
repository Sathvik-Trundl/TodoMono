import { Router, Request, Response } from "express";
import { getTodos } from "../models/todoModel";
import usersRouter from "./users";
import todosRouter from "./todos";
import authRouter from "./auth";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const result = await getTodos();
    return res.json({ status: "ok", db: "connected", count: result.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", db: "disconnected", message });
  }
});


router.use("/todos", todosRouter);
router.use("/users", usersRouter);  
router.use("/auth", authRouter);


export default router;
