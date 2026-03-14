import api from "./api";
import { Task, TasksResponse, TaskFilters } from "@/types";

export const tasksApi = {
  getAll: async (filters: TaskFilters = {}): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    const res = await api.get(`/tasks?${params.toString()}`);
    return res.data;
  },

  getOne: async (id: string): Promise<Task> => {
    const res = await api.get(`/tasks/${id}`);
    return res.data.data;
  },

  create: async (data: { title: string; description?: string; status?: string }): Promise<Task> => {
    const res = await api.post("/tasks", data);
    return res.data.data;
  },

  update: async (id: string, data: { title?: string; description?: string; status?: string }): Promise<Task> => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
