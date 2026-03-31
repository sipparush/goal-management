--
-- PostgreSQL database dump
--

\restrict 10rPU1QYIAUXtinnZfnAlXzlGQoNyfOckwAYk8myPBn5cAj5gc1HadqwPEPYNS1

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abilities; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.abilities (
    id uuid NOT NULL,
    project_id uuid,
    owner_user_id uuid,
    assign_to_user_id uuid,
    name text NOT NULL,
    target text NOT NULL,
    response_person text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.abilities OWNER TO pm_user;

--
-- Name: ability_files; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.ability_files (
    id uuid NOT NULL,
    ability_id uuid,
    project_id uuid,
    uploader_user_id uuid,
    original_name text NOT NULL,
    stored_name text NOT NULL,
    mime_type text,
    size_bytes integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    orphaned_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.ability_files OWNER TO pm_user;

--
-- Name: action_plan_rows; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.action_plan_rows (
    id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    phase text,
    item_no integer,
    action_text text NOT NULL,
    status text NOT NULL,
    duration_minutes integer DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    exp_start timestamp with time zone,
    exp_end timestamp with time zone,
    remark text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.action_plan_rows OWNER TO pm_user;

--
-- Name: goals; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.goals (
    id uuid NOT NULL,
    owner_user_id uuid,
    name text NOT NULL,
    target text NOT NULL,
    current_target text,
    expect text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.goals OWNER TO pm_user;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.permissions (
    key text NOT NULL,
    label text NOT NULL,
    page_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO pm_user;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.projects (
    id uuid NOT NULL,
    goal_id uuid NOT NULL,
    owner_user_id uuid,
    assign_to_user_id uuid,
    name text NOT NULL,
    target text NOT NULL,
    response_person text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.projects OWNER TO pm_user;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.role_permissions (
    role_name text NOT NULL,
    permission_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO pm_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.roles (
    name text NOT NULL,
    label text NOT NULL,
    is_super boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO pm_user;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.sessions (
    token text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO pm_user;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.tickets (
    id uuid NOT NULL,
    ability_id uuid NOT NULL,
    owner_user_id uuid,
    assign_to_user_id uuid,
    title text NOT NULL,
    target text NOT NULL,
    response_person text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tickets OWNER TO pm_user;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO pm_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: pm_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'staff'::text])))
);


ALTER TABLE public.users OWNER TO pm_user;

--
-- Data for Name: abilities; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.abilities (id, project_id, owner_user_id, assign_to_user_id, name, target, response_person, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ability_files; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.ability_files (id, ability_id, project_id, uploader_user_id, original_name, stored_name, mime_type, size_bytes, created_at, orphaned_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: action_plan_rows; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.action_plan_rows (id, ticket_id, phase, item_no, action_text, status, duration_minutes, sort_order, exp_start, exp_end, remark, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.goals (id, owner_user_id, name, target, current_target, expect, created_at, updated_at) FROM stdin;
0b498051-1a57-471d-8dfc-590b0f167cc6	98bd9e4c-9367-4057-aec2-0a448bed32a6	KPI-4-สำรองข้อมูลสำเร็จ ≥ 98%, DR Test ผ่าน	≥ 98% instances	\N	\N	2026-03-26 06:13:04.928278+00	2026-03-26 06:13:04.928278+00
88786b69-40f0-4ef7-a2f1-ec45899927a3	98bd9e4c-9367-4057-aec2-0a448bed32a6	KPI-3-แก้ไข Ticket ได้ ≥ 90% ภายใน SLA	≥ 90% tickets	\N	\N	2026-03-26 06:12:20.635208+00	2026-03-26 06:13:14.514659+00
66b528d8-66a4-4d2a-9da8-0f9c9f8a6a79	98bd9e4c-9367-4057-aec2-0a448bed32a6	KPI-1-ระบบเครือข่ายทำงานได้ต่อเนื่อง ≥ 99.9%	≥ 99.9%	\N	\N	2026-03-26 04:57:29.681883+00	2026-03-26 06:13:23.834179+00
a055d2a8-62d2-4e77-b194-09a5b0dc5107	98bd9e4c-9367-4057-aec2-0a448bed32a6	KPI-2-ไม่มี Incident ที่มีผลกระทบระดับสูง (Severity 1)	Incident ticket=0	\N	\N	2026-03-26 06:12:05.386263+00	2026-03-26 06:13:29.157971+00
d2e49bb9-39f0-4df8-adcf-7d40e14b1826	98bd9e4c-9367-4057-aec2-0a448bed32a6	KPI-5-ระบบ Critical มี Patch ล่าสุดภายใน 30 วัน	100% instances	\N	\N	2026-03-26 06:14:05.007144+00	2026-03-26 06:14:05.007144+00
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.permissions (key, label, page_path, created_at) FROM stdin;
overview.view	ดูหน้า Overview	/	2026-03-26 03:51:07.892873+00
goals.view	Goals: View	/goals	2026-03-26 03:51:07.892873+00
goals.add	Goals: Add		2026-03-26 03:51:07.892873+00
goals.edit	Goals: Edit		2026-03-26 03:51:07.892873+00
goals.delete	Goals: Delete		2026-03-26 03:51:07.892873+00
projects.view	Projects: View	/projects	2026-03-26 03:51:07.892873+00
projects.add	Projects: Add		2026-03-26 03:51:07.892873+00
projects.edit	Projects: Edit		2026-03-26 03:51:07.892873+00
projects.delete	Projects: Delete		2026-03-26 03:51:07.892873+00
abilities.view	Abilities: View	/abilities	2026-03-26 03:51:07.892873+00
abilities.add	Abilities: Add		2026-03-26 03:51:07.892873+00
abilities.edit	Abilities: Edit		2026-03-26 03:51:07.892873+00
abilities.delete	Abilities: Delete		2026-03-26 03:51:07.892873+00
tickets.view	Tickets: View	/tickets	2026-03-26 03:51:07.892873+00
tickets.add	Tickets: Add		2026-03-26 03:51:07.892873+00
tickets.edit	Tickets: Edit		2026-03-26 03:51:07.892873+00
tickets.delete	Tickets: Delete		2026-03-26 03:51:07.892873+00
action-plans.view	Action Plans: View	/action-plan	2026-03-26 03:51:07.892873+00
action-plans.add	Action Plans: Add		2026-03-26 03:51:07.892873+00
action-plans.edit	Action Plans: Edit		2026-03-26 03:51:07.892873+00
action-plans.delete	Action Plans: Delete		2026-03-26 03:51:07.892873+00
timeline.view	ดู Timeline	/timeline	2026-03-26 03:51:07.892873+00
users.view	Users: View	/users	2026-03-26 03:51:07.892873+00
users.add	Users: Add		2026-03-26 03:51:07.892873+00
users.edit	Users: Edit		2026-03-26 03:51:07.892873+00
users.delete	Users: Delete		2026-03-26 03:51:07.892873+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.projects (id, goal_id, owner_user_id, assign_to_user_id, name, target, response_person, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.role_permissions (role_name, permission_key, created_at) FROM stdin;
manager	overview.view	2026-03-26 03:51:07.900941+00
manager	goals.view	2026-03-26 03:51:07.900941+00
manager	goals.add	2026-03-26 03:51:07.900941+00
manager	goals.edit	2026-03-26 03:51:07.900941+00
manager	goals.delete	2026-03-26 03:51:07.900941+00
manager	projects.view	2026-03-26 03:51:07.900941+00
manager	projects.add	2026-03-26 03:51:07.900941+00
manager	projects.edit	2026-03-26 03:51:07.900941+00
manager	projects.delete	2026-03-26 03:51:07.900941+00
manager	abilities.view	2026-03-26 03:51:07.900941+00
manager	abilities.add	2026-03-26 03:51:07.900941+00
manager	abilities.edit	2026-03-26 03:51:07.900941+00
manager	abilities.delete	2026-03-26 03:51:07.900941+00
manager	timeline.view	2026-03-26 03:51:07.900941+00
staff	overview.view	2026-03-26 03:51:07.900941+00
staff	abilities.view	2026-03-26 03:51:07.900941+00
staff	abilities.add	2026-03-26 03:51:07.900941+00
staff	abilities.edit	2026-03-26 03:51:07.900941+00
staff	abilities.delete	2026-03-26 03:51:07.900941+00
staff	tickets.view	2026-03-26 03:51:07.900941+00
staff	tickets.add	2026-03-26 03:51:07.900941+00
staff	tickets.edit	2026-03-26 03:51:07.900941+00
staff	tickets.delete	2026-03-26 03:51:07.900941+00
staff	action-plans.view	2026-03-26 03:51:07.900941+00
staff	action-plans.add	2026-03-26 03:51:07.900941+00
staff	action-plans.edit	2026-03-26 03:51:07.900941+00
staff	action-plans.delete	2026-03-26 03:51:07.900941+00
staff	timeline.view	2026-03-26 03:51:07.900941+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.roles (name, label, is_super, created_at) FROM stdin;
admin	Admin	t	2026-03-26 03:51:07.88692+00
manager	Manager	f	2026-03-26 03:51:07.88692+00
staff	Staff	f	2026-03-26 03:51:07.88692+00
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.sessions (token, user_id, created_at) FROM stdin;
a6ce2a5f-1363-4a85-91af-87116c9b53bf	98bd9e4c-9367-4057-aec2-0a448bed32a6	2026-03-26 03:54:30.176989+00
47fc3cdd-28c3-4679-b923-db2543bf9790	98bd9e4c-9367-4057-aec2-0a448bed32a6	2026-03-26 03:58:58.243163+00
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.tickets (id, ability_id, owner_user_id, assign_to_user_id, title, target, response_person, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.user_roles (user_id, role_name, created_at) FROM stdin;
1e7543fd-0026-4f38-b839-fc7ec57cf018	staff	2026-03-26 03:51:07.916894+00
2a2111f4-28de-4dcf-92ff-4374af4f8c31	admin	2026-03-26 03:51:07.916894+00
31e00d76-5249-4ad1-b1cd-49032f48eec0	manager	2026-03-26 03:51:07.916894+00
42cd2dbb-6aa8-4ca7-bcd6-fcfef5cc95de	staff	2026-03-26 03:51:07.916894+00
f1032b9f-e129-4488-9f8e-5fda6caef5de	staff	2026-03-26 03:51:07.916894+00
98bd9e4c-9367-4057-aec2-0a448bed32a6	staff	2026-03-26 03:54:09.891956+00
98bd9e4c-9367-4057-aec2-0a448bed32a6	manager	2026-03-26 03:54:09.89752+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.users (id, username, password_hash, role, is_active, created_at) FROM stdin;
2a2111f4-28de-4dcf-92ff-4374af4f8c31	admin	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	admin	t	2026-03-26 03:51:07.912311+00
31e00d76-5249-4ad1-b1cd-49032f48eec0	manager	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	manager	t	2026-03-26 03:51:07.912311+00
f1032b9f-e129-4488-9f8e-5fda6caef5de	user1	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	staff	t	2026-03-26 03:51:07.912311+00
42cd2dbb-6aa8-4ca7-bcd6-fcfef5cc95de	user2	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	staff	t	2026-03-26 03:51:07.912311+00
1e7543fd-0026-4f38-b839-fc7ec57cf018	user3	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	staff	t	2026-03-26 03:51:07.912311+00
98bd9e4c-9367-4057-aec2-0a448bed32a6	sipparush.l	5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8	staff	t	2026-03-26 03:54:09.886112+00
\.


--
-- Name: abilities abilities_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.abilities
    ADD CONSTRAINT abilities_pkey PRIMARY KEY (id);


--
-- Name: ability_files ability_files_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.ability_files
    ADD CONSTRAINT ability_files_pkey PRIMARY KEY (id);


--
-- Name: ability_files ability_files_stored_name_key; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.ability_files
    ADD CONSTRAINT ability_files_stored_name_key UNIQUE (stored_name);


--
-- Name: action_plan_rows action_plan_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.action_plan_rows
    ADD CONSTRAINT action_plan_rows_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (key);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_name, permission_key);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (name);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_abilities_assign_to_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_abilities_assign_to_user_id ON public.abilities USING btree (assign_to_user_id);


--
-- Name: idx_abilities_end_date; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_abilities_end_date ON public.abilities USING btree (end_date);


--
-- Name: idx_abilities_owner_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_abilities_owner_user_id ON public.abilities USING btree (owner_user_id);


--
-- Name: idx_abilities_project_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_abilities_project_id ON public.abilities USING btree (project_id);


--
-- Name: idx_ability_files_ability_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_ability_files_ability_id ON public.ability_files USING btree (ability_id);


--
-- Name: idx_ability_files_deleted_at; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_ability_files_deleted_at ON public.ability_files USING btree (deleted_at);


--
-- Name: idx_ability_files_orphaned_at; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_ability_files_orphaned_at ON public.ability_files USING btree (orphaned_at);


--
-- Name: idx_ability_files_project_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_ability_files_project_id ON public.ability_files USING btree (project_id);


--
-- Name: idx_action_plan_rows_sort_order; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_action_plan_rows_sort_order ON public.action_plan_rows USING btree (ticket_id, sort_order);


--
-- Name: idx_action_plan_rows_ticket_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_action_plan_rows_ticket_id ON public.action_plan_rows USING btree (ticket_id);


--
-- Name: idx_goals_owner_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_goals_owner_user_id ON public.goals USING btree (owner_user_id);


--
-- Name: idx_projects_assign_to_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_projects_assign_to_user_id ON public.projects USING btree (assign_to_user_id);


--
-- Name: idx_projects_end_date; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_projects_end_date ON public.projects USING btree (end_date);


--
-- Name: idx_projects_goal_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_projects_goal_id ON public.projects USING btree (goal_id);


--
-- Name: idx_projects_owner_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_projects_owner_user_id ON public.projects USING btree (owner_user_id);


--
-- Name: idx_role_permissions_role_name; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_role_permissions_role_name ON public.role_permissions USING btree (role_name);


--
-- Name: idx_tickets_ability_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_tickets_ability_id ON public.tickets USING btree (ability_id);


--
-- Name: idx_tickets_assign_to_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_tickets_assign_to_user_id ON public.tickets USING btree (assign_to_user_id);


--
-- Name: idx_tickets_end_date; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_tickets_end_date ON public.tickets USING btree (end_date);


--
-- Name: idx_tickets_owner_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_tickets_owner_user_id ON public.tickets USING btree (owner_user_id);


--
-- Name: idx_user_roles_role_name; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_user_roles_role_name ON public.user_roles USING btree (role_name);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: pm_user
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: abilities abilities_assign_to_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.abilities
    ADD CONSTRAINT abilities_assign_to_fk FOREIGN KEY (assign_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: abilities abilities_owner_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.abilities
    ADD CONSTRAINT abilities_owner_fk FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: abilities abilities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.abilities
    ADD CONSTRAINT abilities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: ability_files ability_files_ability_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.ability_files
    ADD CONSTRAINT ability_files_ability_id_fkey FOREIGN KEY (ability_id) REFERENCES public.abilities(id) ON DELETE SET NULL;


--
-- Name: ability_files ability_files_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.ability_files
    ADD CONSTRAINT ability_files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: ability_files ability_files_uploader_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.ability_files
    ADD CONSTRAINT ability_files_uploader_fk FOREIGN KEY (uploader_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: action_plan_rows action_plan_rows_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.action_plan_rows
    ADD CONSTRAINT action_plan_rows_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: goals goals_owner_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_owner_fk FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects projects_assign_to_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_assign_to_fk FOREIGN KEY (assign_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: projects projects_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;


--
-- Name: projects projects_owner_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_fk FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_key_fkey FOREIGN KEY (permission_key) REFERENCES public.permissions(key) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_name_fkey FOREIGN KEY (role_name) REFERENCES public.roles(name) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_ability_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_ability_id_fkey FOREIGN KEY (ability_id) REFERENCES public.abilities(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_assign_to_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assign_to_fk FOREIGN KEY (assign_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_owner_fk; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_owner_fk FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_name_fkey FOREIGN KEY (role_name) REFERENCES public.roles(name) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO pm_user;


--
-- PostgreSQL database dump complete
--

\unrestrict 10rPU1QYIAUXtinnZfnAlXzlGQoNyfOckwAYk8myPBn5cAj5gc1HadqwPEPYNS1

