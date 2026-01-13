import { Request, Response, Router } from "express";
import { getUserByEmail, insertUser, User } from "../models/todoModel";
import jwt from "jsonwebtoken";

const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "todo_secret_key_2026";

function sanitizeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
  };
}

function generateToken(user: User) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

authRouter.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = (req.body ?? {}) as {
    name?: string;
    email?: string;
    password?: string;
  };
  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password.trim() === ""
  ) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const existing = await getUserByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const user = await insertUser(name.trim(), email.trim(), password.trim());
    const token = generateToken(user);
    return res.status(201).json({
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error("Register failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", message });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
  if (typeof email !== "string" || email.trim() === "" || typeof password !== "string" || password.trim() === "") {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = await getUserByEmail(email.trim());
  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken(user);
  return res.json({
    user: sanitizeUser(user),
    token,
  });
});

export default authRouter;
