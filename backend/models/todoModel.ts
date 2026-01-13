import { SQL, InferModel, and, asc, eq, gte, lt } from "drizzle-orm";
import { db } from "../db";
import { todos, users } from "../db/schema";

export type User = InferModel<typeof users>;

export async function getTodos(filters: { completed?: "true" | "false"; date?: string; userId?: string } = {}) {
  const conditions: SQL[] = [];
  if (filters.userId) {
    conditions.push(eq(todos.createdBy, filters.userId));
  }
  if (filters.completed !== undefined) {
    conditions.push(eq(todos.completed, filters.completed === "true"));
  }
  if (filters.date) {
    const start = new Date(filters.date);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    conditions.push(gte(todos.createdAt, start));
    conditions.push(lt(todos.createdAt, end));
  }
  const query = db.select().from(todos);
  const filtered = conditions.length ? query.where(and(...conditions)) : query;
  return filtered.orderBy(asc(todos.id));
}

export async function getTodoById(id: number) {
  const rows = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
  return rows[0];
}

export async function insertTodo(name: string, description: string, createdBy: string) {
  const rows = await db
    .insert(todos)
    .values({
      name: name.trim(),
      description: description.trim(),
      createdBy,
    }).returning();
  return rows[0];
}

export async function updateTodo(
  id: number,
  data: { name?: string; description?: string; completed?: boolean }
) {
  if (data.name === undefined && data.description === undefined && data.completed === undefined) {
    throw new Error("No fields provided");
  }
  const updates: { name?: string; description?: string; completed?: boolean; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (data.name !== undefined) {
    updates.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updates.description = data.description.trim();
  }
  if (data.completed !== undefined) {
    updates.completed = data.completed;
  }
  const rows = await db.update(todos).set(updates).where(eq(todos.id, id)).returning();
  return rows[0];
}

export async function deleteTodo(id: number) {
  const rows = await db.delete(todos).where(eq(todos.id, id)).returning();
  return rows[0];
}

export async function getUsers() {
  return db.select().from(users).orderBy(asc(users.id));
}

export async function insertUser(name: string, email: string, password: string) {
  const date = new Date();
  const rows = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      createdAt: date,
      updatedAt: date,
    })
    .returning();
  return rows[0];
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}
