/**
 * Task API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with Cloudflare Worker API at /api/tasks
 * - Uses existing apiClient with Firebase ID token authentication (Bearer header)
 * - Maps between database snake_case and frontend camelCase CrmTask
 * - Provides non-destructive migration helper for local storage tasks
 * - Fail-fast and robust error propagation
 */

import { apiClient, ApiError } from '@/lib/apiClient';
import type { CrmTask, TaskActivityLog, TaskComment, TaskStatus, TaskPriority, TaskType } from '@/types/enterprise-crm';

export interface BackendTaskRow {
  id: string;
  sl_no: number | null;
  title: string | null;
  task_details: string;
  description: string | null;
  department: string | null;
  location: string | null;
  site_location: string | null;
  equipment_tag: string | null;
  permit_required: number;
  sla_deadline: string | null;
  worker_contact: string | null;
  customer_id: string | null;
  customer_name: string | null;
  task_under: string | null;
  task_type: string;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  status: string;
  progress: number;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_email: string | null;
  assignee_role: string | null;
  assignee_avatar: string | null;
  assigned_by_id: string | null;
  assigned_by_name: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  updated_by_id: string | null;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  service_type: string | null;
  estimated_hours: number | null;
  actual_hours_spent: number | null;
  technician_notes: string | null;
  customer_signature: string | null;
  customer_signed_by: string | null;
  signed_at: string | null;
  completion_rating: number | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
  checklist?: Array<{
    id: string;
    label: string;
    is_completed: number;
    is_required: number;
  }>;
  history?: Array<{
    id: string;
    user_name: string;
    user_role: string | null;
    action: string;
    note: string | null;
    progress: number | null;
    created_at: string;
  }>;
  comments?: Array<{
    id: string;
    author_name: string;
    author_role: string | null;
    author_avatar: string | null;
    comment_text: string;
    created_at: string;
  }>;
}

export function mapBackendTaskToFrontend(row: BackendTaskRow): CrmTask {
  return {
    id: row.id,
    slNo: row.sl_no || 1,
    title: row.title || row.task_details,
    taskDetails: row.task_details,
    description: row.description || '',
    department: row.department || 'Operations',
    location: row.location || '',
    siteLocation: row.site_location || row.location || '',
    equipmentTag: row.equipment_tag || undefined,
    permitRequired: Boolean(row.permit_required),
    slaDeadline: row.sla_deadline || undefined,
    workerContact: row.worker_contact || undefined,
    customer: row.customer_name || 'Client Facility',
    taskUnder: row.task_under || 'General Maintenance',
    taskType: (row.task_type || 'Service Order') as TaskType,
    dueDate: row.due_date || new Date().toISOString().split('T')[0],
    dueTime: row.due_time || '04:00 PM',
    priority: (row.priority || 'Medium') as TaskPriority,
    status: (row.status || 'Pending') as TaskStatus,
    progress: row.progress || 0,
    assignedEmployee: row.assignee_name || undefined,
    assignedBy: row.assigned_by_name || undefined,
    createdBy: row.created_by_name || undefined,
    assignee: {
      name: row.assignee_name || 'Unassigned',
      email: row.assignee_email || undefined,
      role: row.assignee_role || 'Technician',
      avatar: row.assignee_avatar || undefined,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || undefined,
    reviewedAt: row.reviewed_at || undefined,
    history: Array.isArray(row.history)
      ? row.history.map((h) => ({
          id: h.id,
          timestamp: h.created_at,
          user: h.user_name,
          userRole: h.user_role || 'Staff',
          action: h.action,
          note: h.note || undefined,
          progress: h.progress || undefined,
        }))
      : [],
    comments: Array.isArray(row.comments)
      ? row.comments.map((c) => ({
          id: c.id,
          author: c.author_name,
          role: c.author_role || 'Staff',
          avatar: c.author_avatar || undefined,
          text: c.comment_text,
          timestamp: c.created_at,
        }))
      : [],
  };
}

export const taskApiService = {
  async getTasks(params: {
    limit?: number;
    page?: number;
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    assignee?: string;
    customerId?: string;
  } = {}) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;
    if (params.search) queryParams.search = params.search;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.priority && params.priority !== 'All') queryParams.priority = params.priority;
    if (params.type && params.type !== 'All') queryParams.type = params.type;
    if (params.assignee && params.assignee !== 'All') queryParams.assignee = params.assignee;
    if (params.customerId) queryParams.customerId = params.customerId;

    const res = await apiClient.get<{
      success: boolean;
      tasks: BackendTaskRow[];
      total: number;
      page: number;
      limit: number;
    }>('/api/tasks', { params: queryParams });

    return {
      success: res.success,
      tasks: (res.tasks || []).map(mapBackendTaskToFrontend),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  },

  async getTaskById(id: string) {
    const res = await apiClient.get<{
      success: boolean;
      task: BackendTaskRow;
    }>(`/api/tasks/${encodeURIComponent(id)}`);

    return {
      success: res.success,
      task: mapBackendTaskToFrontend(res.task),
      raw: res.task,
    };
  },

  async createTask(taskData: Partial<CrmTask> & { taskDetails?: string; title?: string }) {
    const payload = {
      id: taskData.id,
      title: taskData.title,
      taskDetails: taskData.taskDetails || taskData.title,
      description: taskData.description,
      department: taskData.department,
      location: taskData.location || taskData.siteLocation,
      siteLocation: taskData.siteLocation,
      equipmentTag: taskData.equipmentTag,
      permitRequired: taskData.permitRequired,
      slaDeadline: taskData.slaDeadline,
      workerContact: taskData.workerContact,
      customer: taskData.customer,
      taskUnder: taskData.taskUnder,
      taskType: taskData.taskType,
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      priority: taskData.priority,
      status: taskData.status,
      progress: taskData.progress,
      assignedEmployee: taskData.assignedEmployee || taskData.assignee?.name,
      assigneeId: (taskData as any).assigneeId || (taskData.assignee as any)?.id,
      assigneeEmail: taskData.assignee?.email,
      assigneeRole: taskData.assignee?.role,
      assigneeAvatar: taskData.assignee?.avatar,
      checklist: (taskData as any).checklist,
    };

    const res = await apiClient.post<{
      success: boolean;
      task: BackendTaskRow;
      message?: string;
    }>('/api/tasks', { body: payload });

    return {
      success: res.success,
      task: mapBackendTaskToFrontend(res.task),
    };
  },

  async updateTask(id: string, updated: Partial<CrmTask>) {
    const payload: Record<string, any> = {
      title: updated.title,
      taskDetails: updated.taskDetails,
      description: updated.description,
      department: updated.department,
      location: updated.location,
      siteLocation: updated.siteLocation,
      equipmentTag: updated.equipmentTag,
      permitRequired: updated.permitRequired,
      slaDeadline: updated.slaDeadline,
      workerContact: updated.workerContact,
      customer: updated.customer,
      taskUnder: updated.taskUnder,
      taskType: updated.taskType,
      dueDate: updated.dueDate,
      dueTime: updated.dueTime,
      priority: updated.priority,
      status: updated.status,
      progress: updated.progress,
      assignedEmployee: updated.assignedEmployee || updated.assignee?.name,
      assigneeEmail: updated.assignee?.email,
      assigneeRole: updated.assignee?.role,
      assigneeAvatar: updated.assignee?.avatar,
    };

    const res = await apiClient.put<{
      success: boolean;
      task: BackendTaskRow;
      message?: string;
    }>(`/api/tasks/${encodeURIComponent(id)}`, { body: payload });

    return {
      success: res.success,
      task: mapBackendTaskToFrontend(res.task),
    };
  },

  async updateTaskStatus(
    id: string,
    data: {
      status: TaskStatus;
      progress?: number;
      notes?: string;
      customerSignature?: string;
      customerSignedBy?: string;
      rating?: number;
    }
  ) {
    const res = await apiClient.patch<{
      success: boolean;
      task: BackendTaskRow;
      message?: string;
    }>(`/api/tasks/${encodeURIComponent(id)}/status`, { body: data });

    return {
      success: res.success,
      task: mapBackendTaskToFrontend(res.task),
    };
  },

  async addComment(id: string, text: string, authorAvatar?: string) {
    const res = await apiClient.post<{
      success: boolean;
      comment: any;
      message?: string;
    }>(`/api/tasks/${encodeURIComponent(id)}/comments`, {
      body: { text, avatar: authorAvatar },
    });

    return res;
  },

  async deleteTask(id: string) {
    const res = await apiClient.delete<{
      success: boolean;
      message?: string;
    }>(`/api/tasks/${encodeURIComponent(id)}`);

    return res;
  },

  /**
   * Safe, Non-Destructive LocalStorage Migration Helper
   * Reads from 'crm_tasks_data' and uploads missing tasks to D1.
   * Never deletes or wipes local storage data.
   */
  async migrateLocalTasksToDatabase(): Promise<{ synced: number; skipped: number }> {
    if (typeof window === 'undefined') return { synced: 0, skipped: 0 };

    try {
      const stored = localStorage.getItem('crm_tasks_data');
      if (!stored) return { synced: 0, skipped: 0 };

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) return { synced: 0, skipped: 0 };

      const res = await apiClient.post<{
        success: boolean;
        synced: number;
        skipped: number;
      }>('/api/tasks/sync-batch', { body: { tasks: parsed } });

      if (res && res.success) {
        localStorage.setItem(
          'crm_tasks_sync_meta',
          JSON.stringify({
            syncedAt: new Date().toISOString(),
            syncedCount: res.synced,
            skippedCount: res.skipped,
          })
        );
        return { synced: res.synced, skipped: res.skipped };
      }
      return { synced: 0, skipped: 0 };
    } catch (e) {
      console.warn('[taskApiService] Local storage tasks migration encountered error:', e);
      return { synced: 0, skipped: 0 };
    }
  },
};
