/**
 * Worker Operations API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with Cloudflare Worker API at /api/worker/*
 * - Uses existing apiClient with Firebase ID token authentication (Bearer header)
 * - Attendance clock-in/out, timesheets, and material requests
 * - Non-destructive local storage sync
 */

import { apiClient } from '@/lib/apiClient';
import type {
  WorkerShiftAttendance,
  WorkerTimesheetEntry,
  WorkerMaterialRequest,
} from '@/types/worker';

export const workerApiService = {
  // ==========================================================================
  // 1. ATTENDANCE & SHIFT
  // ==========================================================================
  async getAttendance(date?: string): Promise<WorkerShiftAttendance> {
    const params: Record<string, string> = {};
    if (date) params.date = date;

    const res = await apiClient.get<{
      success: boolean;
      attendance: WorkerShiftAttendance;
    }>('/api/worker/attendance', { params });

    return res.attendance;
  },

  async clockIn(location?: string): Promise<WorkerShiftAttendance> {
    const res = await apiClient.post<{
      success: boolean;
      attendance: WorkerShiftAttendance;
      message?: string;
    }>('/api/worker/attendance/clock-in', {
      body: { location },
    });

    return res.attendance;
  },

  async clockOut(): Promise<WorkerShiftAttendance> {
    const res = await apiClient.post<{
      success: boolean;
      attendance: WorkerShiftAttendance;
      message?: string;
    }>('/api/worker/attendance/clock-out');

    return res.attendance;
  },

  // ==========================================================================
  // 2. TIMESHEETS
  // ==========================================================================
  async getTimesheets(params: { workerId?: string; status?: string; date?: string } = {}): Promise<WorkerTimesheetEntry[]> {
    const queryParams: Record<string, string> = {};
    if (params.workerId) queryParams.workerId = params.workerId;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.date) queryParams.date = params.date;

    const res = await apiClient.get<{
      success: boolean;
      timesheets: WorkerTimesheetEntry[];
    }>('/api/worker/timesheets', { params: queryParams });

    return res.timesheets || [];
  },

  async addTimesheetEntry(entry: Omit<WorkerTimesheetEntry, 'id' | 'status'>): Promise<WorkerTimesheetEntry> {
    const res = await apiClient.post<{
      success: boolean;
      timesheet: any;
      message?: string;
    }>('/api/worker/timesheets', { body: entry });

    return {
      id: res.timesheet.id,
      date: res.timesheet.date,
      taskNumber: res.timesheet.task_number || '',
      taskTitle: res.timesheet.task_title || '',
      clientName: res.timesheet.client_name || '',
      regularHours: res.timesheet.regular_hours,
      overtimeHours: res.timesheet.overtime_hours,
      status: res.timesheet.status,
      workSummary: res.timesheet.work_summary || '',
    };
  },

  async updateTimesheetStatus(id: string, status: 'Approved' | 'Rejected' | 'Pending Review') {
    const res = await apiClient.patch<{
      success: boolean;
      message?: string;
    }>(`/api/worker/timesheets/${encodeURIComponent(id)}/status`, {
      body: { status },
    });

    return res;
  },

  // ==========================================================================
  // 3. MATERIAL REQUESTS
  // ==========================================================================
  async getMaterialRequests(params: { status?: string } = {}): Promise<WorkerMaterialRequest[]> {
    const queryParams: Record<string, string> = {};
    if (params.status && params.status !== 'All') queryParams.status = params.status;

    const res = await apiClient.get<{
      success: boolean;
      requests: WorkerMaterialRequest[];
    }>('/api/worker/material-requests', { params: queryParams });

    return res.requests || [];
  },

  async createMaterialRequest(
    request: Omit<WorkerMaterialRequest, 'id' | 'requestNumber' | 'requestedAt' | 'status'>
  ): Promise<WorkerMaterialRequest> {
    const res = await apiClient.post<{
      success: boolean;
      request: any;
      message?: string;
    }>('/api/worker/material-requests', { body: request });

    return {
      id: res.request.id,
      requestNumber: res.request.request_number,
      taskNumber: res.request.task_number,
      itemCode: res.request.item_code,
      itemName: res.request.item_name,
      category: res.request.category || 'General',
      quantity: res.request.quantity,
      unit: res.request.unit,
      urgency: res.request.urgency,
      status: res.request.status,
      requestedAt: res.request.created_at,
      notes: res.request.notes,
    };
  },

  async updateMaterialRequestStatus(
    id: string,
    status: 'Pending Approval' | 'Approved' | 'Dispatched' | 'Collected' | 'Rejected'
  ) {
    const res = await apiClient.patch<{
      success: boolean;
      message?: string;
    }>(`/api/worker/material-requests/${encodeURIComponent(id)}/status`, {
      body: { status },
    });

    return res;
  },
};
