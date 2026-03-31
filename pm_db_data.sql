--
-- PostgreSQL database dump
--

\restrict KjsZN1PZlDv0YafX3vjhoAueCe8vaS8r6Oyuug4UHei5tIDyG1gbCbhdNdovT7R

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
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.projects (id, goal_id, owner_user_id, assign_to_user_id, name, target, response_person, start_date, end_date, created_at, updated_at) FROM stdin;
\.


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
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.tickets (id, ability_id, owner_user_id, assign_to_user_id, title, target, response_person, start_date, end_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: action_plan_rows; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.action_plan_rows (id, ticket_id, phase, item_no, action_text, status, duration_minutes, sort_order, exp_start, exp_end, remark, created_at, updated_at) FROM stdin;
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
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.roles (name, label, is_super, created_at) FROM stdin;
admin	Admin	t	2026-03-26 03:51:07.88692+00
manager	Manager	f	2026-03-26 03:51:07.88692+00
staff	Staff	f	2026-03-26 03:51:07.88692+00
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
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: pm_user
--

COPY public.sessions (token, user_id, created_at) FROM stdin;
a6ce2a5f-1363-4a85-91af-87116c9b53bf	98bd9e4c-9367-4057-aec2-0a448bed32a6	2026-03-26 03:54:30.176989+00
47fc3cdd-28c3-4679-b923-db2543bf9790	98bd9e4c-9367-4057-aec2-0a448bed32a6	2026-03-26 03:58:58.243163+00
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
-- PostgreSQL database dump complete
--

\unrestrict KjsZN1PZlDv0YafX3vjhoAueCe8vaS8r6Oyuug4UHei5tIDyG1gbCbhdNdovT7R

