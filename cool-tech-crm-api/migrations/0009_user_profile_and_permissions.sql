-- Migration: 0009_user_profile_and_permissions.sql
-- Description: Extend CRM users table with rich profile fields and dynamic RBAC permissions
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Dedicated CRM database only. No e-commerce resources touched.

ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN avatar_image TEXT;
ALTER TABLE users ADD COLUMN dob TEXT;
ALTER TABLE users ADD COLUMN designation TEXT;
ALTER TABLE users ADD COLUMN business_opportunity TEXT;
ALTER TABLE users ADD COLUMN store TEXT;
ALTER TABLE users ADD COLUMN sales_visit_permission INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN permissions TEXT;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
