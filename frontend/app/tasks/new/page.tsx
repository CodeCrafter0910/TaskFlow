"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tasksApi } from "@/lib/tasksApi";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function NewTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", status: "todo" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tasksApi.create(form);
      toast.success("Task created");
      router.push("/dashboard");
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors?.length) {
        toast.error(serverErrors[0].message);
      } else {
        toast.error(err?.response?.data?.message || "Failed to create task");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a new task</h2>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={100}
              className="input-field"
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="input-field resize-none"
              placeholder="Add any relevant details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating..." : "Create task"}
            </button>
            <Link href="/dashboard" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
