// ВРЕМЕННЫЕ данные циклов и модулей (только для features/planning). Удалить, когда подключим API.
import type { Cycle, Module } from "@/shared/api/types";

export const cycles: Cycle[] = [
  {
    id: "cy1",
    project_id: "p1",
    name: "Sprint 3",
    description: "Landing page polish and auth fixes",
    start_date: "2026-11-23T00:00:00Z",
    end_date: "2026-12-06T00:00:00Z",
    status: "active",
    progress: { total: 5, backlog: 0, unstarted: 2, started: 2, completed: 1, cancelled: 0, completion_percentage: 20 },
  },
  {
    id: "cy2",
    project_id: "p1",
    name: "Sprint 2",
    description: null,
    start_date: "2026-11-09T00:00:00Z",
    end_date: "2026-11-22T00:00:00Z",
    status: "completed",
    progress: { total: 1, backlog: 0, unstarted: 0, started: 0, completed: 1, cancelled: 0, completion_percentage: 100 },
  },
  {
    id: "cy3",
    project_id: "p1",
    name: "Sprint 4",
    description: "Pricing page",
    start_date: "2026-12-07T00:00:00Z",
    end_date: "2026-12-20T00:00:00Z",
    status: "upcoming",
    progress: { total: 0, backlog: 0, unstarted: 0, started: 0, completed: 0, cancelled: 0, completion_percentage: 0 },
  },
];

export const modules: Module[] = [
  {
    id: "m1",
    project_id: "p1",
    name: "Authentication",
    description: "Login, registration and token refresh",
    status: "in_progress",
    lead_id: "u1",
    start_date: "2026-11-15T00:00:00Z",
    target_date: "2026-12-05T00:00:00Z",
    progress: { total: 3, backlog: 0, unstarted: 1, started: 1, completed: 1, cancelled: 0, completion_percentage: 33 },
  },
  {
    id: "m2",
    project_id: "p1",
    name: "Landing page",
    description: "Hero, pricing and newsletter sections",
    status: "backlog",
    lead_id: "u2",
    start_date: null,
    target_date: "2026-12-20T00:00:00Z",
    progress: { total: 4, backlog: 1, unstarted: 2, started: 1, completed: 0, cancelled: 0, completion_percentage: 0 },
  },
  {
    id: "m3",
    project_id: "p1",
    name: "CI / Infrastructure",
    description: null,
    status: "completed",
    lead_id: "u3",
    start_date: "2026-11-01T00:00:00Z",
    target_date: "2026-11-20T00:00:00Z",
    progress: { total: 1, backlog: 0, unstarted: 0, started: 0, completed: 1, cancelled: 0, completion_percentage: 100 },
  },
];

