1. เชื่อมต่อและตั้งค่าฐานข้อมูล PostgreSQL ด้วย Docker
	- [ ] 1.1 เชื่อมต่อเข้า PostgreSQL ด้วย docker exec
	- [ ] 1.2 สร้าง user: pm_user, password: pm_password
	- [ ] 1.3 สร้าง database: pm_db
	- [ ] 1.4 กำหนดสิทธิ์ user ให้กับ database
	- [ ] 1.5 นำเข้า schema จากไฟล์ backend/init/001_schema.sql ไปยัง pm_db โดยเพิ่ม table จากฐานข้อมูลเดิม (ไม่ลบของเดิม)
22. /sawork: UX Redesign & Dashboard Modernization
- [ ] วิเคราะห์ข้อเสนอ BA และจัดทำ UI/Component structure (skeleton, card, grid, role-aware)
- [ ] ออกแบบ staged loading, async state, skeleton loader, dashboard summary cards
- [ ] วางแผน layout system (AppShell, Sidebar, Topbar, Main grid)
- [ ] กำหนด role-aware dashboard (Admin/Manager/Dev)
- [ ] วาง responsive breakpoints, touch target, mobile UX
- [ ] เสนอ UX KPI & validation method
- [ ] แตกงานลง frontend_tasks.md, backend_tasks.md, qa_tasks.md
- [ ] สรุปแผน implement_plan.md พร้อม checklist รออนุมัติ
### SA/UX Requirement: Inline Edit Action Plan Rows
- ผู้ใช้สามารถแก้ไขข้อมูลแต่ละแถว (Action Plan Row) ได้ทันทีในตาราง โดยไม่ต้องย้ายข้อมูลไปฟอร์มด้านบน
- เมื่อกดปุ่ม Edit ในแถว จะเปลี่ยน cell ของแถวนั้นเป็น input field (text, number, datetime, textarea) ตามชนิดข้อมูล
- มีปุ่ม Save/Cancel ในแถวนั้น (แทนที่ Edit/Delete ชั่วคราว)
- เมื่อ Save จะ validate ข้อมูลและส่ง API PUT เพื่ออัปเดตแถวเดียว, เมื่อ Cancel จะคืนค่าเดิม
- ขณะกำลังแก้ไขแถวอื่น ปุ่ม Edit ของแถวอื่นจะถูก disable หรือซ่อน
- UX: กด Enter ใน input (ยกเว้น textarea) = Save, กด Esc = Cancel
- รองรับสิทธิ์ canEditActionPlan เท่านั้น
21. /sawork: ปรับ Action Plan Rows ให้แก้ไขข้อมูลแต่ละแถวแบบ inline (editable in its line)
- [x] บันทึกคำขอและเพิ่มลงแผน
- [x] วิเคราะห์ requirement และแนวทาง inline edit
- [x] ออกแบบ/ปรับโค้ด Action Plan Rows ให้แก้ไข inline
- [x] ทดสอบและอัปเดตเอกสารสถานะ
# Implement Plan

## Request List
1. สร้าง Web App ระบบ Project Management โดยมีหน้าและความสามารถดังนี้
- First page แสดง Goal, Target, Expect, Target ปัจจุบัน
- Goal management: สร้าง Goal และ Target ได้หลายรายการ
- Project management: ภายใต้ Goal/Target สร้าง Project และ Target ได้หลายรายการ พร้อมเวลาดำเนินการ, เวลาเริ่ม, เวลาเสร็จ, สถานะ in-time/delay, และผู้รับผิดชอบ
- Ability management: ภายใต้ Project/Target สร้าง Ability และ Target ได้หลายรายการ พร้อมเวลาดำเนินการ, เวลาเริ่ม, เวลาเสร็จ, สถานะ in-time/delay, และผู้รับผิดชอบ
- Ticket management: ภายใต้ Ability/Target สร้าง Implement Ticket ได้หลายรายการ พร้อมเวลาดำเนินการ, เวลาเริ่ม, เวลาเสร็จ, สถานะ in-time/delay, และผู้รับผิดชอบ
- Timeline page: ตารางรวม Project timeline ทุกโปรเจกต์
- รองรับบทบาทผู้ใช้: Project Manager, Developer, DBA
2. เพิ่ม backend folder และระบบ PostgreSQL พร้อมทำ Option 1 และ 3
- Option 1: เพิ่ม backend API + database เพื่อรองรับการใช้งานหลายเครื่อง
- Option 3: เพิ่มความสามารถ edit/delete/filter/search/export สำหรับ Goal, Project, Ability, Ticket
- ยังไม่บังคับ role จริง ให้เป็นระบบสำหรับผู้ใช้กลุ่ม Project Manager, Developer, DBA เหมือนเดิม
3. เดินหน้าทดสอบระบบจริงด้วย Docker/PostgreSQL และยืนยันการทำงาน end-to-end
4. ปรับ role ใหม่และเพิ่มผู้ใช้เริ่มต้นพร้อมรหัสผ่าน default
- admin role: จัดการได้ทั้งหมด
- manager role: จัดการเฉพาะ goal
- staff role: จัดการเฉพาะ project/ability/ticket ของตัวเอง
- เพิ่มผู้ใช้: admin (admin role), manager (manager role), user1/user2/user3 (staff role)
- รหัสผ่านเริ่มต้นของทุกผู้ใช้: password
5. ปรับ Ticket ให้มีปุ่ม Edit Action และสามารถไปหน้า Action Plan ได้ พร้อมทำ /qawork และจัดทำ UAT checklist
- ในแต่ละ Ticket เพิ่มปุ่มสำหรับแก้ไข Action Plan
- ปุ่มต้องพาไปหน้า Action Plan ตามดีไซน์อ้างอิง
- ทำ /qawork และสรุป UAT checklist ให้ครบ
6. /bawork: ปรับหน้า Action Plan ให้แก้ไขและลบข้อมูลแบบรายแถว (row-level edit/delete) ตามภาพอ้างอิง

## Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement เชิงลึก
- [x] สรุปโครงสร้างข้อมูลและสิทธิ์ตาม role
- [x] ออกแบบหน้า UI/UX และ flow การใช้งาน
- [x] พัฒนา frontend และ backend
- [x] ทดสอบการทำงานครบทุกหน้าและทุกลิงก์
- [x] รันระบบและยืนยันการเริ่มต้นระบบ

## Current Status
งาน request ลำดับ 1, 2, 3 และ 4 ดำเนินการเสร็จแล้ว

## Request 2 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] ออกแบบโครงสร้าง backend และ schema PostgreSQL
- [x] ติดตั้งและตั้งค่าเครื่องมือฐานข้อมูลและ migration
- [x] พัฒนา API สำหรับ Goal, Project, Ability, Ticket
- [x] เชื่อม frontend กับ API และย้ายจาก localStorage ไปใช้ backend
- [x] เพิ่ม edit/delete/filter/search/export ครบทุกหน้า
- [x] ทดสอบการทำงาน API, UI, และการเริ่มระบบ

## Current Status (Request 2)
พัฒนาเสร็จแล้วทั้ง backend API + PostgreSQL setup และ frontend option 3
หมายเหตุ: เครื่องปัจจุบันยังไม่มี docker ใน WSL จึงไม่สามารถสตาร์ท PostgreSQL container ได้ในเครื่องนี้ แต่ไฟล์ setup พร้อมใช้งาน

## Request 3 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] ตรวจสอบ Docker runtime และสตาร์ท PostgreSQL
- [x] ทดสอบ API health และ endpoint หลัก
- [x] รันระบบหน้าเว็บและยืนยันการเชื่อม DB จริง
- [x] สรุปผลและอัปเดตเอกสารสถานะ

## Current Status (Request 3)
Docker และ PostgreSQL ทำงานได้แล้ว, API health ผ่าน, และทดสอบ CRUD แบบ end-to-end ผ่านครบเส้นทาง Goal -> Project -> Ability -> Ticket พร้อม cascade delete

## Request 4 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] ออกแบบ schema ผู้ใช้และความสัมพันธ์ owner ของข้อมูล
- [x] เพิ่มระบบ login แบบพื้นฐานด้วย username/password
- [x] เพิ่ม seed ผู้ใช้เริ่มต้นตามที่กำหนด
- [x] ปรับสิทธิ์ role ใน frontend และ API ตามกติกาใหม่
- [x] ทดสอบ role behavior ครบทุกกรณีใช้งาน
- [x] อัปเดตเอกสารการใช้งานและสถานะงาน

## Current Status (Request 4)
ระบบ role ใหม่พร้อม login ใช้งานได้จริง พร้อมผู้ใช้เริ่มต้นและการบังคับสิทธิ์ตาม owner สำหรับ staff

## Request 5 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ flow ของหน้า Ticket และ Action Plan
- [x] เพิ่มปุ่ม Edit Action ในแต่ละ Ticket และเชื่อมลิงก์ไป Action Plan
- [x] ตรวจสอบสิทธิ์การเข้าถึงหน้า Action Plan ตาม role
- [x] ทำ /qawork และจัดทำ UAT checklist
- [x] สรุปผลทดสอบและอัปเดตเอกสารสถานะ

## Current Status (Request 5)
เสร็จสิ้น: Ticket มีปุ่ม Edit Action เชื่อมหน้า Action Plan แล้ว และทำ UAT checklist ตาม /qawork เรียบร้อย

## Request 6 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /bawork
- [x] สรุป requirement และ acceptance criteria ลง requirement.md
- [x] รออนุมัติแผนก่อนเริ่มพัฒนา
- [x] พัฒนา Action Plan row-level edit/delete
- [x] ทดสอบการทำงานและอัปเดตเอกสารสถานะ

## Current Status (Request 6)
เสร็จสิ้น: หน้า Action Plan รองรับตารางรายแถวตามคอลัมน์ที่ยืนยันแล้ว พร้อม Edit/Delete รายแถว, popup ยืนยันก่อนลบ และบันทึกข้อมูลลง backend database

7. ปรับ Ability Management ให้สร้าง Ability ได้โดยไม่ต้องเลือก Project และสามารถผูก Project ในภายหลังได้

## Request 7 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /bawork
- [x] สรุป requirement และ acceptance criteria ลง requirement.md
- [x] รออนุมัติแผนก่อนเริ่มพัฒนา
- [x] ปรับ DB schema ให้ project_id เป็น nullable
- [x] ปรับ Backend API (POST/PUT/GET) รองรับ project_id เป็น null
- [x] ปรับ Frontend form ให้ projectId เป็น optional
- [x] ทดสอบและอัปเดตเอกสารสถานะ

## Current Status (Request 7)
เสร็จสิ้น: Ability Management รองรับการสร้าง Ability แบบไม่ผูก Project, รองรับ bind Project ภายหลัง, และเพิ่มตัวกรอง No Project เรียบร้อย

8. /bawork: เพิ่ม User-Role Management Module สำหรับ admin จัดการ user-role binding

## Request 8 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /bawork
- [x] สรุป requirement และ acceptance criteria ลง requirement.md
- [x] รออนุมัติแผนก่อนเริ่มพัฒนา
- [x] เพิ่มหน้า User Management ใน frontend
- [x] เพิ่ม Backend API สำหรับ User Management
- [x] ทดสอบและอัปเดตเอกสารสถานะ

## Current Status (Request 8)
เสร็จสิ้น: User Management Module พร้อมใช้งาน — admin จัดการ user/role/disable/reset password ได้ครบ

9. /sawork: วิเคราะห์ flow การเปลี่ยน user role จากหน้า frontend และจัดทำแผนปรับ UX ให้ชัดเจน

## Request 9 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /sawork
- [x] จัดทำ frontend/backend/qa artifacts
- [x] รออนุมัติแผนก่อนพัฒนา
- [x] พัฒนา UX เพิ่มความชัดเจนของการเปลี่ยน role (ถ้าอนุมัติ)


## Request 20 Checklist Status
- [ ] รับคำขอและบันทึกลงแผน
- [ ] วิเคราะห์ requirement และ UI parity
- [ ] ปรับโค้ด Rollback plan section ให้รองรับ drag & drop, Edit, Delete
- [ ] ทดสอบการทำงานและอัปเดตเอกสารสถานะ

## Current Status (Request 20)
รอดำเนินการ: ปรับ Rollback plan section ให้สามารถ drag & drop, Edit, Delete ได้เหมือน Action Plan Rows

23. /devwork: เพิ่ม ticket file management แบบ table แยก `ticket_files` และรวม file list ในหน้า Ability

## Request 23 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement และยืนยันใช้ table แยก `ticket_files`
- [x] รออนุมัติแผนก่อนเริ่มพัฒนา
- [x] เพิ่ม schema และ storage flow สำหรับ ticket files
- [x] เพิ่ม API upload/list/download/delete สำหรับ ticket files
- [x] ปรับหน้า Ticket ให้แก้ไขและจัดการไฟล์แนบได้
- [x] ปรับหน้า Ability ให้รวม ability files และ ticket files ใน list เดียว
- [x] ทดสอบเชิงโค้ด (lint/build) และอัปเดตเอกสารสถานะ
- [x] ทำ /qawork สำหรับ Ticket/Ability file flow และแก้ defect ที่พบ

## Current Status (Request 23)
เสร็จสิ้น: เพิ่ม `ticket_files`, API upload/list/download/delete สำหรับ ticket files, หน้า Ticket จัดการไฟล์แนบได้ระหว่าง edit, หน้า Ability แสดง merged file list จาก ability/ticket แล้ว และ /qawork ผ่านหลังแก้ defect `DELETE /api/files/[id]` ที่ขาด import `dbQuery`

10. /bawork: เพิ่มปุ่ม Delete User, ทบทวนการคุมสิทธิ์การมองเห็นข้อมูลตาม owner, และเพิ่มปุ่ม Import CSV เพื่อสร้าง Action Plan Rows

## Request 10 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /bawork
- [x] สรุป requirement และ acceptance criteria ลง requirement.md
- [x] รออนุมัติแผนก่อนเริ่มพัฒนา
- [x] พัฒนา Delete User + Owner Visibility Controls + CSV Import Action Plan
- [x] ทดสอบและอัปเดตเอกสารสถานะ

## Current Status (Request 10)
เสร็จสิ้น: เพิ่ม Delete User (hard delete + set no owner), เพิ่ม Ability/Project file list+download, และเพิ่ม Action Plan CSV import + drag reorder แล้ว

11. /sawork: ปรับ data model ของ Project/Ability/Ticket ให้มีทั้ง owner และ assign_to (ผูกกับ response person) และทำ data migration สำหรับข้อมูลเดิม

## Request 11 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /sawork
- [x] จัดทำ frontend/backend/qa artifacts
- [x] รออนุมัติแผนก่อนพัฒนา
- [x] พัฒนา schema/API/UI สำหรับ owner + assign_to
- [x] ทำ data migration: project เดิม owner=manager และ assign_to=sipparush.l
- [x] ทดสอบและอัปเดตเอกสารสถานะ

## SA Notes (Request 11)
- Scope ครอบคลุม `projects`, `abilities`, `tickets` ให้มี 2 ฟิลด์เชิงสิทธิ์: `owner_user_id` และ `assign_to_user_id`
- `assign_to_user_id` ต้องสะท้อนแนวคิดเดียวกับ `response_person` (ต้องกำหนด source of truth ชัดเจน)
- Data migration ที่ร้องขอ: records เดิมของ project ให้ตั้ง owner เป็น user `manager` และ assign_to เป็น user `sipparush.l`
- ต้องกำหนดกติกา migration สำหรับ ability/ticket ที่มีอยู่แล้วให้ชัดเจน (ใช้ owner/assign_to จาก project แม่ หรือ mapping อื่น)

## Current Status (Request 11)
เสร็จสิ้น: Project/Ability/Ticket รองรับ owner + assign-to แล้ว และ response person เปลี่ยนเป็น dropdown อ้างอิงผู้ใช้จากฐานข้อมูล

12. /sawork: ปรับหน้า Overview ให้แสดงสรุปข้อมูลจาก project ที่เกี่ยวข้องกับผู้ใช้คนนั้นในฐานะ owner

## Request 12 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /sawork
- [x] จัดทำ frontend/backend/qa artifacts
- [x] รออนุมัติแผนก่อนพัฒนา
- [x] พัฒนา API summary แบบ owner-scoped
- [x] ปรับ Overview UI ให้แสดงผลตาม scope ผู้ใช้
- [x] ทดสอบและอัปเดตเอกสารสถานะ

## SA Notes (Request 12)
- Overview ต้องคำนวณ summary เฉพาะ project ที่ผู้ใช้เป็น owner (ไม่ใช่ global)
- หาก role ไม่มี project ใน scope ให้แสดง empty-state ที่ชัดเจน
- ต้องตรวจสอบความสอดคล้องกับ role policy ปัจจุบันที่จำกัดสิทธิ์ admin/manager/staff

## Current Status (Request 12)
เสร็จสิ้น: Overview page แสดง summary ตาม owner-related projects ของผู้ใช้เรียบร้อย

13. /devwork: ปรับสิทธิ์ role `admin` ให้สามารถจัดการได้ทุกฟังก์ชัน เพื่อรองรับการดูแลรายการที่ยังไม่มี owner

## Request 13 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ผลกระทบของ role policy (frontend + backend)
- [x] ปรับสิทธิ์ `admin` ให้จัดการได้ทุก module และทุก endpoint ที่เกี่ยวข้อง
- [x] ทดสอบการจัดการรายการที่ไม่มี owner ด้วยสิทธิ์ admin
- [x] ยืนยันว่า manager/staff ยังถูกจำกัดสิทธิ์ตามนโยบายเดิม
- [x] อัปเดตเอกสารสถานะ

## Current Status (Request 13)
เสร็จสิ้น: admin สามารถจัดการทุกฟังก์ชันได้แล้ว รวมถึงการเข้าถึงรายการที่ไม่มี owner ผ่าน frontend navigation และ API หลักทั้งหมด

14. /devwork: ปรับ frontend CSS ให้มีความแตกต่างชัดเจนระหว่างข้อความปกติ กับลิงก์/dropdown

## Request 14 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์จุดใช้งาน text/link/dropdown ที่กระทบหลายหน้า
- [x] ปรับสไตล์ลิงก์ให้แยกจากข้อความทั่วไปอย่างชัดเจน
- [x] ปรับสไตล์ dropdown/select ให้มี visual state ชัดเจน (default/focus/disabled)
- [x] ทดสอบบน desktop และ mobile
- [x] อัปเดตเอกสารสถานะ

## Current Status (Request 14)
เสร็จสิ้น: frontend ปรับ CSS ให้ลิงก์และ dropdown มี visual distinction ชัดเจนจากข้อความปกติแล้ว

15. /devwork: เพิ่ม Role-Permission Management และรองรับ Multi-Role ต่อผู้ใช้ (union permissions)

## Request 15 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] ยืนยันขอบเขตและกติกา (Page-level only, module actions, union allow, admin super role)
- [x] เพิ่ม data model สำหรับ roles, permissions, role-permission, user-roles
- [x] migrate ผู้ใช้เดิมจาก role เดี่ยวเป็น multi-role
- [x] เพิ่ม API จัดการ role-permission matrix และ user multi-role assignment
- [x] ปรับ auth/session ให้คืน effective permissions จากหลาย role
- [x] ปรับ frontend gate/navigation ให้ใช้ permissions แทน role เดี่ยว
- [x] ปรับหน้า User Management ให้จัดการ multi-role และ permission matrix
- [x] ทดสอบ regression ของ login/page access/user management
- [x] อัปเดตเอกสารสถานะ

## Current Status (Request 15)
เสร็จสิ้น: รองรับ multi-role, role-permission matrix, และ effective permissions (union allow) พร้อม admin super role แล้ว

16. /devwork: แก้สิทธิ์การมองเห็นข้อมูลให้ owner และผู้ที่ถูก assign เห็นข้อมูลได้ครบทั้งระบบ

## Request 16 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ root cause ของ owner-only scope ในทุก endpoint ที่เกี่ยวข้อง
- [x] ปรับ API list/scope ให้รองรับ `(owner_user_id OR assign_to_user_id)`
- [x] ปรับ API update/delete และ access-check helper ให้รองรับ assign scope
- [x] ปรับ action-plan endpoints ให้ manager ใช้งานได้ตามสิทธิ์
- [x] ตรวจสอบ syntax/errors ของไฟล์ที่แก้ไขทั้งหมด
- [x] รันระบบและยืนยันสถานะ startup

## Current Status (Request 16)
เสร็จสิ้น: แก้ owner-only visibility เป็น owner-or-assignee ครอบคลุม Projects/Abilities/Tickets/Overview/Bootstrap/Action Plans/Files APIs และเคลียร์ไฟล์ CSV ชั่วคราวที่ค้างแล้ว

17. /devwork: ปรับ Role-Permission Matrix โดยเพิ่มสิทธิ์แยกเป็น view/add/edit/delete

## Request 17 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ผลกระทบของ permission model เดิม (manage) ต่อ frontend/backend/database
- [x] ออกแบบ permission keys ใหม่แบบแยก view/add/edit/delete ต่อ module
- [x] รออนุมัติแผนก่อนเริ่มพัฒนา
- [x] ปรับ backend schema/seed/migration และ API permissions ให้รองรับ matrix ใหม่
- [x] ปรับ frontend matrix UI และ gate checks ให้รองรับสิทธิ์ใหม่
- [x] ทดสอบ regression ของ role matrix, page access, CRUD action ตามสิทธิ์ใหม่
- [x] รันระบบและยืนยันการเริ่มต้นระบบ

## Current Status (Request 17)
เสร็จสิ้น: ระบบ role-permission matrix ปรับเป็น view/add/edit/delete ครบ modules หลัก พร้อม migration จาก manage เดิม, ปรับ API guards ตาม action, และปรับ UI controls ตามสิทธิ์ใหม่แล้ว

18. /sawork: หน้า Action Plan เพิ่มส่วน Rollback plan ใต้ Action Plan Rows และเมื่อ import CSV เจอ phase = rollback ให้แสดงรายการในส่วนนี้

## Request 18 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /sawork
- [x] จัดทำ frontend/backend/qa artifacts
- [x] รออนุมัติแผนก่อนพัฒนา
- [x] พัฒนา UI Rollback plan section ในหน้า Action Plan
- [x] ปรับ data shaping ของ Action Plan rows ให้แยก rollback items จาก phase
- [ ] ทดสอบ import CSV กรณีมี phase = rollback และกรณีทั่วไป
- [ ] ทดสอบ regression ของ Action Plan Rows เดิม (edit/delete/reorder/import)
- [x] อัปเดตเอกสารสถานะหลังพัฒนา

## SA Notes (Request 18)
- Rollback plan section ต้องแสดงหลังตาราง Action Plan Rows เสมอ
- เงื่อนไขการคัดรายการ: phase เท่ากับ rollback โดยไม่สนตัวพิมพ์เล็ก/ใหญ่ และ trim ช่องว่างก่อนเปรียบเทียบ
- แหล่งข้อมูล rollback มาจาก rows ชุดเดียวกับ Action Plan (ไม่เพิ่ม table ใหม่)
- พฤติกรรม import เดิมคงไว้ แต่รายการที่ phase=rollback ต้องปรากฏในส่วนใหม่ทันทีหลัง import
- ขอบเขตรอบนี้เป็นการแสดงผลและจัดกลุ่มข้อมูลในหน้า Action Plan เท่านั้น ไม่เปลี่ยน permission model เพิ่ม

## Current Status (Request 18)
พัฒนาเสร็จในส่วน UI: เพิ่ม Rollback plan section ใต้ Action Plan Rows และคัดแยกรายการจาก `phase=rollback` (trim + case-insensitive) แล้ว; คงเหลือการทดสอบ import/regression เชิง QA

19. /bawork + /devwork: ให้ staff สามารถล้างรายการ Action Plan ปัจจุบันทั้งหมด และ re-import ไฟล์เพื่อเพิ่มรายการใหม่

## Request 19 Checklist Status
- [x] รับคำขอและบันทึกลงแผน
- [x] วิเคราะห์ requirement ในโหมด /bawork
- [x] จัดทำ frontend/backend/qa artifacts
- [x] รออนุมัติแผนก่อนพัฒนา
- [x] เพิ่ม API clear all action plan rows ตาม ticket ที่เลือก
- [x] เพิ่มปุ่ม Clear Current Action Plan Items ในหน้า Action Plan
- [x] เชื่อม flow clear -> reload rows -> re-import ต่อได้
- [ ] ทดสอบ regression ของ add/edit/delete/reorder/import หลังเพิ่ม clear all
- [x] อัปเดตเอกสารสถานะหลังพัฒนา

## BA/SA Notes (Request 19)
- Flow ที่ยืนยัน: แยก 2 ขั้นตอน (Clear All และ Import CSV) ไม่รวมเป็นปุ่มเดียว
- ความหมายของ clear: ลบ action plan rows ทั้งหมดของ ticket ปัจจุบัน
- ยืนยัน UX: ไม่ใช้ popup ยืนยัน (single-click action)
- ใช้ permission เดิม `actionPlansDelete` สำหรับ clear all โดยไม่เพิ่ม permission key ใหม่

## Current Status (Request 19)
พัฒนาเสร็จในส่วน frontend+backend: staff ที่มีสิทธิ์ลบสามารถ Clear Current Action Plan Items ของ ticket ที่เลือก และ import ไฟล์ใหม่ได้ทันที; คงเหลือการทดสอบ regression เชิง QA
