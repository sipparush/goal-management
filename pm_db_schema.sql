--
-- PostgreSQL database dump
--

\restrict zq9jK8qWfxeWtp3Js981ott5bnBaJjZL56BzZIfmONou3Oz8Pfb3Zw3fdiXWnoc

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

\unrestrict zq9jK8qWfxeWtp3Js981ott5bnBaJjZL56BzZIfmONou3Oz8Pfb3Zw3fdiXWnoc

