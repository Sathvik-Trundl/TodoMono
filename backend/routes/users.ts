import { Request, Response, Router } from "express";
import { getUsers, insertUser } from "../models/todoModel";

const usersRouter = Router();

usersRouter.get("/", async (_req: Request, res: Response) => {
  const users = await getUsers();
  return res.json(users);
});

usersRouter.post("/", async (req: Request, res: Response) => {
  const { name, email, password } = (req.body ?? {}) as {
    name: string;
    email: string;
    password: string;
  };
  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password.trim() === ""
  ) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  try {
    const user = await insertUser(name.trim(), email.trim(), password.trim());
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Insert user failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", message });
  }
});

export default usersRouter;
