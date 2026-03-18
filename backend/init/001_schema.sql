CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  current_target TEXT,
  expect TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  owner_user_id UUID,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  response_person TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abilities (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_user_id UUID,
  name TEXT NOT NULL,
  target TEXT NOT NULL,
  response_person TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY,
  ability_id UUID NOT NULL REFERENCES abilities(id) ON DELETE CASCADE,
  owner_user_id UUID,
  title TEXT NOT NULL,
  target TEXT NOT NULL,
  response_person TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_plan_rows (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  action_text TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  exp_start TIMESTAMPTZ,
  exp_end TIMESTAMPTZ,
  remark TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ADD CONSTRAINT projects_owner_fk FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE abilities ADD CONSTRAINT abilities_owner_fk FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD CONSTRAINT tickets_owner_fk FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_goal_id ON projects(goal_id);
CREATE INDEX IF NOT EXISTS idx_abilities_project_id ON abilities(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ability_id ON tickets(ability_id);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);
CREATE INDEX IF NOT EXISTS idx_abilities_end_date ON abilities(end_date);
CREATE INDEX IF NOT EXISTS idx_tickets_end_date ON tickets(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_owner_user_id ON projects(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_abilities_owner_user_id ON abilities(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_owner_user_id ON tickets(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_rows_ticket_id ON action_plan_rows(ticket_id);

INSERT INTO users (id, username, password_hash, role)
VALUES
  ('2a2111f4-28de-4dcf-92ff-4374af4f8c31', 'admin', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'admin'),
  ('31e00d76-5249-4ad1-b1cd-49032f48eec0', 'manager', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'manager'),
  ('f1032b9f-e129-4488-9f8e-5fda6caef5de', 'user1', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'staff'),
  ('42cd2dbb-6aa8-4ca7-bcd6-fcfef5cc95de', 'user2', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'staff'),
  ('1e7543fd-0026-4f38-b839-fc7ec57cf018', 'user3', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'staff')
ON CONFLICT (username) DO NOTHING;
