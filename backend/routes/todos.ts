import {
  deleteTodo,
  getTodos,
  insertTodo,
  updateTodo,
  getTodoById,
} from "../models/todoModel";
import { Request, Response, Router } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const todosRouter = Router();

// Apply middleware to all todo routes
todosRouter.use(authenticateToken);

todosRouter.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const filters: Record<string, string> = {
      userId: req.user!.id
    };
    if (req.query.completed !== undefined) {
      const completed = req.query.completed;
      if (completed !== "true" && completed !== "false") {
        return res
          .status(400)
          .json({ error: "completed must be true or false" });
      }
      filters.completed = completed as "true" | "false";
    }
    if (typeof req.query.date === "string") {
      filters.date = req.query.date;
    }
    const result = await getTodos(filters);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ status: "error", message });
  }
});

todosRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const row = await getTodoById(id);
  if (!row) {
    return res.status(404).json({ error: "Todo not found" });
  }
  
  // Security check: ensure the todo belongs to the user
  if (row.createdBy !== req.user!.id) {
    return res.status(403).json({ error: "Unauthorized access to this todo" });
  }
  
  return res.json(row);
});

todosRouter.post("/", async (req: AuthRequest, res: Response) => {
  const { name, description = "", completed = false } = (req.body ?? {}) as {
    name: string;
    description?: string;
    completed?: boolean;
  };
  
  const createdBy = req.user!.id;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }
  if (typeof description !== "string") {
    return res.status(400).json({ error: "Description must be a string" });
  }
  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "Completed must be a boolean" });
  }
  
  const result = await insertTodo(name, description, createdBy);
  return res.status(201).json(result);
});

todosRouter.patch("/:id", async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  
  // Security check: check ownership before updating
  const existing = await getTodoById(id);
  if (!existing) {
    return res.status(404).json({ error: "Todo not found" });
  }
  if (existing.createdBy !== req.user!.id) {
    return res.status(403).json({ error: "Unauthorized access to this todo" });
  }

  const { name, description, completed } = (req.body ?? {}) as {
    name?: string;
    description?: string;
    completed?: boolean;
  };
  try {
    const updated = await updateTodo(id, { name, description, completed });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

todosRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  // Security check: check ownership before deleting
  const existing = await getTodoById(id);
  if (!existing) {
    return res.status(404).json({ error: "Todo not found" });
  }
  if (existing.createdBy !== req.user!.id) {
    return res.status(403).json({ error: "Unauthorized access to this todo" });
  }

  const deleted = await deleteTodo(id);
  return res.json(deleted);
});

export default todosRouter;
