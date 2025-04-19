
-- Add columns for project type and category display names
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_type_name TEXT GENERATED ALWAYS AS (
  (SELECT name FROM project_types WHERE id = project_type_id)
) STORED,
ADD COLUMN IF NOT EXISTS project_category_name TEXT GENERATED ALWAYS AS (
  (SELECT name FROM project_categories WHERE id = project_category_id)
) STORED;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_projects_type_category ON projects(project_type_id, project_category_id);
CREATE INDEX IF NOT EXISTS idx_projects_payments ON payments(project_id, payment_date DESC);
