-- Migration: 0005_create_tasks_and_worker_ops.sql
-- Description: Schema for Tasks, Worker Field Operations, Attendance, Timesheets, and Material Requests
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Strictly additive. Preserves all existing tables (users, customers, leads, opportunities, quotations, sales_orders, invoices).

-- ============================================================================
-- 1. TASKS TABLE
-- Primary operational tasks and field service dispatch orders
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    sl_no INTEGER,
    title TEXT,
    task_details TEXT NOT NULL,
    description TEXT,
    department TEXT,
    location TEXT,
    site_location TEXT,
    equipment_tag TEXT,
    permit_required INTEGER NOT NULL DEFAULT 0 CHECK (permit_required IN (0, 1)),
    sla_deadline TEXT,
    worker_contact TEXT,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    task_under TEXT DEFAULT 'General Maintenance',
    task_type TEXT NOT NULL DEFAULT 'Service Order',
    due_date TEXT,
    due_time TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    progress INTEGER NOT NULL DEFAULT 0,
    
    -- Assignee / Technician allocation
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    assignee_name TEXT,
    assignee_email TEXT,
    assignee_role TEXT,
    assignee_avatar TEXT,
    
    -- Ownership & Management
    assigned_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_name TEXT,
    created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_by_name TEXT,
    updated_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TEXT,
    completed_at TEXT,

    -- Field Execution & Sign-off Fields
    service_type TEXT,
    estimated_hours REAL DEFAULT 2.0,
    actual_hours_spent REAL,
    technician_notes TEXT,
    customer_signature TEXT,
    customer_signed_by TEXT,
    signed_at TEXT,
    completion_rating INTEGER,

    -- Soft Deletion & Audit Trail
    is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
    deleted_at TEXT,
    deleted_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by_id ON tasks(assigned_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);

-- ============================================================================
-- 2. TASK CHECKLISTS TABLE
-- Itemized procedural checklist attached to a task
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_checklists (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
    is_required INTEGER NOT NULL DEFAULT 0 CHECK (is_required IN (0, 1)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_task_checklists_task_id ON task_checklists(task_id);

-- ============================================================================
-- 3. TASK PARTS USED TABLE
-- Spare parts and materials consumed on-site during task execution
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_parts_used (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    part_code TEXT NOT NULL,
    part_name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit_cost REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_task_parts_used_task_id ON task_parts_used(task_id);

-- ============================================================================
-- 4. TASK ACTIVITY LOGS TABLE
-- Audit trail of task workflow transitions, progress changes, and re-assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_activity_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT,
    action TEXT NOT NULL,
    note TEXT,
    progress INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_task_activity_logs_task_id ON task_activity_logs(task_id);

-- ============================================================================
-- 5. TASK COMMENTS TABLE
-- Collaborative discussion thread between managers and technicians on a task
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_role TEXT,
    author_avatar TEXT,
    comment_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- ============================================================================
-- 6. WORKER ATTENDANCE TABLE
-- Daily shift clock-in/out records for technicians
-- ============================================================================
CREATE TABLE IF NOT EXISTS worker_attendance (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_name TEXT NOT NULL,
    date TEXT NOT NULL,
    clock_in_time TEXT,
    clock_out_time TEXT,
    active_duration_seconds INTEGER NOT NULL DEFAULT 0,
    break_duration_minutes INTEGER NOT NULL DEFAULT 0,
    current_location TEXT,
    is_clocked_in INTEGER NOT NULL DEFAULT 1 CHECK (is_clocked_in IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_worker_attendance_worker_date ON worker_attendance(worker_id, date);

-- ============================================================================
-- 7. WORKER TIMESHEETS TABLE
-- Hours logged by technicians against operational tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS worker_timesheets (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_name TEXT NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    task_number TEXT,
    task_title TEXT,
    client_name TEXT,
    date TEXT NOT NULL,
    regular_hours REAL NOT NULL DEFAULT 0,
    overtime_hours REAL NOT NULL DEFAULT 0,
    work_summary TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Pending Review', 'Approved', 'Rejected')),
    approved_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_worker_timesheets_worker_date ON worker_timesheets(worker_id, date);
CREATE INDEX IF NOT EXISTS idx_worker_timesheets_task_id ON worker_timesheets(task_id);
CREATE INDEX IF NOT EXISTS idx_worker_timesheets_status ON worker_timesheets(status);

-- ============================================================================
-- 8. MATERIAL REQUESTS TABLE
-- Parts and equipment requests submitted by technicians from job sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    worker_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    worker_name TEXT NOT NULL,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    task_number TEXT,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'Pcs',
    urgency TEXT NOT NULL DEFAULT 'Standard' CHECK (urgency IN ('Standard', 'Urgent', 'Critical (Site Stopped)')),
    status TEXT NOT NULL DEFAULT 'Pending Approval' CHECK (status IN ('Pending Approval', 'Approved', 'Dispatched', 'Collected', 'Rejected')),
    notes TEXT,
    approved_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_material_requests_worker_id ON material_requests(worker_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_task_id ON material_requests(task_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(status);
