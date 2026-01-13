import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  useTodos,
  useAddTodo,
  useUpdateTodo,
  useDeleteTodo,
  Todo,
} from "../hooks/useTodos";

export default function TodosPage() {
  const { user, logout } = useAuth();
  const todos = useTodos();
  const addTodo = useAddTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addTodo.mutate(
      {
        name: newName,
        description: newDescription,
      },
      {
        onSuccess: () => {
          console.log("Todo added successfully");
          todos.refetch();
        },
      }
    );
    setNewName("");
    setNewDescription("");
  };

  const handleToggle = (todo: Todo) => {
    updateTodo.mutate({ id: todo.id, completed: !todo.completed });
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditName(todo.name);
    setEditDescription(todo.description);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    updateTodo.mutate({
      id: editingId,
      name: editName,
      description: editDescription,
    });
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      deleteTodo.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <form
          onSubmit={handleAddTodo}
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Todo Name"
              required
              className="border p-2 rounded"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              className="border p-2 rounded"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Add Todo
          </button>
        </form>

        {todos.isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {todos?.data?.map((todo: Todo) => (
              <div
                key={todo.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                    className="h-5 w-5 text-indigo-600"
                  />
                  {editingId === todo.id ? (
                    <form onSubmit={handleUpdate} className="flex-1 flex gap-2">
                      <input
                        type="text"
                        className="border p-1 rounded flex-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <input
                        type="text"
                        className="border p-1 rounded flex-1"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="text-green-600 font-medium"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-gray-500"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          todo.completed
                            ? "line-through text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {todo.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {todo.description}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
