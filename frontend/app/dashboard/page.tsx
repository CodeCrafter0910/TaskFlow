"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tasksApi } from "@/lib/tasksApi";
import { Task, Pagination } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [counts, setCounts] = useState({ todo: 0, "in-progress": 0, done: 0 });

  const fetchCounts = useCallback(async () => {
    try {
      const [todo, inProgress, done] = await Promise.all([
        tasksApi.getAll({ page: 1, limit: 1, status: "todo" }),
        tasksApi.getAll({ page: 1, limit: 1, status: "in-progress" }),
        tasksApi.getAll({ page: 1, limit: 1, status: "done" }),
      ]);
      setCounts({
        todo: todo.pagination.total,
        "in-progress": inProgress.pagination.total,
        done: done.pagination.total,
      });
    } catch {
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getAll({ page, limit: 8, status: status || undefined, search: search || undefined });
      setTasks(res.data);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 300);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    setDeleting(id);
    try {
      await tasksApi.delete(id);
      toast.success("Task deleted");
      fetchTasks();
      fetchCounts();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good day, {user?.name.split(" ")[0]} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s on your plate</p>
        </div>
        <Link href="/tasks/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Task
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["todo", "in-progress", "done"] as const).map((s) => (
          <div key={s} className="card p-5">
            <p className="text-sm text-gray-500 mb-1">{STATUS_LABELS[s]}</p>
            <p className="text-3xl font-bold text-gray-900">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="input-field pl-9"
            />
          </div>
          <select value={status} onChange={handleStatusChange} className="input-field w-auto min-w-36">
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm mt-1">
              {search || status ? "Try adjusting your filters" : "Create your first task to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{task.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(task.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[task.status]}`}>
                  {STATUS_LABELS[task.status]}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => router.push(`/tasks/${task._id}`)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    disabled={deleting === task._id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} tasks
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrev}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
