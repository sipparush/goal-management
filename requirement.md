# Requirement Analysis (BA Work)

## Request 6
ปรับหน้า Action Plan ให้สามารถแก้ไขและลบข้อมูลแบบรายแถว (row-level edit/delete) ตามภาพอ้างอิง

## Problem Statement
หน้า Action Plan ปัจจุบันใช้ฟอร์มเดี่ยวต่อ Ticket และไม่มีรายการข้อมูลแบบแถวที่แก้ไข/ลบได้ทันที ทำให้การจัดการข้อมูลหลายรายการใน Ticket เดียวไม่สะดวก

## Scope
- ปรับหน้า Action Plan ให้มีตารางรายการข้อมูล (row list)
- เพิ่มปุ่ม Edit และ Delete ในแต่ละแถว
- รองรับการเพิ่ม/บันทึกข้อมูลแถวใหม่
- คง flow การเข้าจาก Ticket ด้วย ticketId

## Proposed Functional Requirements
1. ผู้ใช้เลือก Ticket หรือเข้าหน้าด้วย ticketId ได้
2. ระบบแสดงรายการ Action Plan ของ Ticket นั้นเป็นหลายแถว
3. ผู้ใช้กด Edit ที่แถวใดก็ได้ เพื่อแก้ไขข้อมูลแถวนั้น
4. ผู้ใช้กด Delete ที่แถวใดก็ได้ เพื่อลบข้อมูลแถวนั้น
5. หลังบันทึก/ลบ ตารางต้องรีเฟรชทันทีและแสดงผลล่าสุด
6. หากไม่มีข้อมูล ให้แสดง empty state ชัดเจน

## Data Model (Draft)
ActionPlanRow ต่อ 1 Ticket ประกอบด้วย:
- id
- ticketId
- objective
- steps
- owner
- dueDate
- risk
- note
- updatedAt

## Non-Functional Requirements
- UI อ่านง่ายบน desktop และ mobile
- ไม่เปลี่ยน role policy เดิม
- ไม่กระทบ flow หน้า Ticket เดิม

## Acceptance Criteria (Draft)
- AC1: เมื่อเปิดหน้า Action Plan ของ ticketId ใด ต้องเห็นรายการเป็นตาราง
- AC2: ทุกแถวมีปุ่ม Edit และ Delete ใช้งานได้
- AC3: แก้ไขข้อมูลแล้วแถวที่แก้ต้องอัปเดตทันที
- AC4: ลบข้อมูลแล้วแถวนั้นต้องหายจากตารางทันที
- AC5: หากไม่มีข้อมูล ต้องแสดงข้อความว่าไม่มีรายการ Action Plan

## Confirmed Decisions
1. ต่อ 1 Ticket รองรับ Action Plan ได้หลายแถว
2. ต้องมี popup ยืนยันก่อนลบ
3. ต้องบันทึกข้อมูลลง backend database
4. คอลัมน์ที่ต้องการในตาราง Action Plan คือ:
- no: No
- action: Action
- status: Status
- duration: Duration(min)
- start: Exp.Start
- end: Exp.End
- remark: Remark

## Status
อนุมัติและยืนยัน requirement ครบแล้ว พร้อมส่งต่อพัฒนา

---

## Request 7
ปรับ Ability Management ให้สร้าง Ability ได้โดยไม่ต้องเลือก Project และสามารถผูก Project ในภายหลังได้

## Problem Statement
ปัจจุบัน Ability Management บังคับให้เลือก Project ก่อนสร้าง Ability เสมอ ทำให้ไม่สามารถสร้าง Ability ที่ยังไม่แน่ใจว่าสังกัด Project ไหนได้ ผู้ใช้ต้องการสร้าง Ability ล่วงหน้าแล้วผูก Project ทีหลัง

## Scope
- อนุญาตให้สร้าง Ability โดยไม่ต้องระบุ Project (projectId = null)
- สามารถแก้ไข Ability เพื่อผูก Project ภายหลังได้ (bind project later)
- Ability ที่ไม่มี Project ต้องแสดงในรายการด้วย (ไม่ถูกซ่อน)
- ช่องเลือก Project ในฟอร์มยังคงอยู่แต่เป็น optional

## Proposed Functional Requirements
1. ผู้ใช้สามารถสร้าง Ability โดยเว้น Project ว่าง (ไม่บังคับ)
2. Ability ที่ไม่มี Project ปรากฏในตารางรายการ โดยช่อง Project แสดง "—"
3. ผู้ใช้สามารถกด Edit บน Ability แล้วเลือก Project เพื่อผูกภายหลังได้
4. Ability ที่ไม่มี Project สามารถ filter ออกได้ด้วยตัวกรอง "No Project"
5. เมื่อลบ Project: Ability ที่ผูกอยู่กับ Project นั้นต้องไม่ถูกลบด้วย (project_id เป็น null แทน)

## Technical Scope (Draft)
- **DB**: เปลี่ยน `project_id` จาก `NOT NULL` เป็น nullable + เปลี่ยน `ON DELETE CASCADE` เป็น `ON DELETE SET NULL`
- **Backend GET**: เปลี่ยน `JOIN projects` เป็น `LEFT JOIN projects` เพื่อรวม Ability ที่ project_id = null
- **Backend POST**: นำ `projectId` ออกจาก required fields, อนุญาตค่า null
- **Backend PUT**: นำ `projectId` ออกจาก required fields, อนุญาตค่า null; ปรับ staff ownership check กรณี projectId เป็น null
- **Frontend form**: ทำให้ช่อง Project เป็น optional (มีตัวเลือก "— ไม่ระบุ Project —")
- **Frontend table**: แสดง "—" ในคอลัมน์ Project เมื่อ project_id = null
- **Frontend filter**: เพิ่มตัวกรอง "No Project" (Abilities ที่ยังไม่ผูก Project)

## Confirmed Decisions
1. ตอนสร้าง Ability โดยไม่มี Project ยังบังคับกรอก `name`, `target`, `responsePerson`, `startDate`, `endDate` เหมือนเดิม — ไม่มีช่องใหม่ที่ทำให้ optional
2. เมื่อสร้าง Ability โดยไม่มี Project ระบบเก็บ `owner_user_id` = current user อัตโนมัติ (เหมือน behavior ปัจจุบัน ไม่ต้องเพิ่ม logic ใหม่)

## Acceptance Criteria
- AC1: ฟอร์มสร้าง/แก้ไข Ability มีช่อง Project เป็น optional (มีตัวเลือก "— ไม่ระบุ Project —" เป็น default)
- AC2: สร้าง Ability สำเร็จโดยไม่เลือก Project — ระบบบันทึกได้และไม่ error
- AC3: Ability ที่ไม่มี Project แสดงในตารางรายการพร้อมช่อง Project แสดง "—"
- AC4: แก้ไข Ability ที่ไม่มี Project เพื่อเลือก Project ภายหลังได้
- AC5: ลบ Project ที่ผูกกับ Ability — Ability ยังคงอยู่ โดย project_id กลายเป็น null (ไม่ถูก cascade delete)
- AC6: ตัวกรอง "No Project" ใช้งานได้ แสดงเฉพาะ Ability ที่ยังไม่ผูก Project

## Status
ยืนยัน requirement ครบแล้ว และพัฒนาเสร็จตามขอบเขตที่อนุมัติ

---

## Request 19 (/bawork)
ให้ staff สามารถ clear current action plan items แล้ว re-import file เพื่อเพิ่มรายการใหม่

## Problem Statement
ปัจจุบันผู้ใช้ต้องลบ Action Plan ทีละแถวก่อน import ไฟล์ใหม่ ทำให้เสียเวลาและเสี่ยงตกหล่นรายการเมื่ออยากเริ่ม action plan ใหม่ทั้งชุดใน ticket เดิม

## Scope
- เพิ่มความสามารถลบ action plan rows ทั้งหมดของ ticket ที่เลือกในครั้งเดียว
- คง flow import CSV เดิม และให้ทำงานต่อจากการ clear ได้ทันที
- ใช้ permission model เดิม ไม่เพิ่ม role/permission ใหม่

## Functional Requirements
1. ผู้ใช้ที่มีสิทธิ์ลบ action plan ต้องกด Clear Current Action Plan Items ได้
2. การ clear ต้องลบ rows ทั้งหมดของ ticket ปัจจุบันเท่านั้น
3. หลัง clear สำเร็จ ตาราง Action Plan Rows และ Rollback plan ต้องรีเฟรชทันที
4. หลัง clear ผู้ใช้ต้อง import CSV ใหม่ได้ตาม flow เดิม
5. กรณีไม่มี ticket ที่เลือก ปุ่ม clear ต้องไม่ทำงาน

## Non-Functional Requirements
- ไม่เปลี่ยน schema ฐานข้อมูล
- ไม่เปลี่ยน endpoint import/reorder/update/delete รายแถวเดิม
- response ของ clear ต้องส่งจำนวนแถวที่ลบเพื่อใช้แสดงผลใน UI

## Acceptance Criteria
- AC1: มีปุ่ม Clear Current Action Plan Items ในหน้า Action Plan
- AC2: กด clear แล้ว rows ของ ticket ปัจจุบันถูกลบทั้งหมด และแสดง empty state
- AC3: กด clear แล้วสามารถ import CSV ใหม่ได้ทันทีใน ticket เดิม
- AC4: user นอก scope ticket หรือไม่มีสิทธิ์ลบ ต้องถูกปฏิเสธการ clear (403)
- AC5: ฟังก์ชันเดิม add/edit/delete/reorder/import ยังทำงานได้

## Confirmed Decisions
1. Flow แยกเป็น 2 ขั้นตอน: Clear All และ Import CSV
2. Clear หมายถึงลบทุกแถวของ ticket ปัจจุบัน
3. ไม่ต้องมี popup ยืนยันก่อน clear

## Status
ยืนยัน requirement ครบแล้ว และเริ่มพัฒนาตาม /devwork เรียบร้อย

---

## Request 18 (/sawork)
หน้า Action Plan เพิ่มส่วน Rollback plan ต่อจาก Action Plan Rows และเมื่อ import CSV พบ phase เป็น rollback ให้เพิ่มรายการในส่วนนี้

## Problem Statement
ปัจจุบัน Action Plan Rows แสดงรายการรวมทุก phase ในตารางเดียว ทำให้รายการ rollback ไม่โดดเด่นและติดตามยากหลัง import CSV

## Scope
- เพิ่ม section ใหม่ชื่อ Rollback plan ใต้ตาราง Action Plan Rows
- ใช้ข้อมูลจาก rows เดิม ไม่สร้างตารางข้อมูลใหม่
- หาก row มี phase เท่ากับ rollback ให้แสดงใน Rollback plan section
- รองรับการแสดงผลทันทีหลัง import CSV และหลัง reload หน้า

## Functional Requirements
1. ระบบต้องคัด rows ที่มี phase = rollback (ไม่สนตัวพิมพ์เล็ก/ใหญ่ และ trim ช่องว่าง)
2. Rollback plan section ต้องอยู่หลัง Action Plan Rows section เสมอ
3. หากไม่มี rollback rows ให้แสดง empty state ที่ชัดเจน
4. หลัง import CSV สำเร็จ รายการ rollback ต้องถูกแสดงใน section ใหม่ทันที

## Non-Functional Requirements
- ไม่เปลี่ยน permission model หรือการเข้าถึง endpoint เดิม
- ไม่กระทบ behavior เดิมของ add/edit/delete/reorder/import action plan rows

## Acceptance Criteria (Draft)
- AC1: มี section Rollback plan ต่อจาก Action Plan Rows บนหน้า Action Plan
- AC2: import CSV ที่มี phase = rollback แล้วรายการดังกล่าวต้องแสดงใน Rollback plan
- AC3: phase ที่ไม่ใช่ rollback ต้องไม่ถูกแสดงใน Rollback plan
- AC4: กรณีไม่มี rollback rows ต้องแสดงข้อความว่าไม่มีรายการ rollback
- AC5: ฟังก์ชันเดิมของ Action Plan Rows ยังทำงานครบ

## Status
วิเคราะห์ requirement เสร็จแล้วในโหมด /sawork และรออนุมัติแผนก่อนเริ่มพัฒนา

---

## Request 8
เพิ่ม User-Role Management Module สำหรับให้ admin จัดการ user-role binding

## Problem Statement
ปัจจุบันการสร้างและกำหนด role ให้ user ทำได้ผ่าน seed data เท่านั้น ไม่มีหน้า UI ให้ admin จัดการผู้ใช้หรือเปลี่ยน role ได้ ทำให้ไม่สามารถบริหารจัดการทีมได้ในระบบ

## Scope
- เพิ่มหน้า User Management เข้าถึงได้เฉพาะ admin เท่านั้น
- admin สามารถดูรายชื่อผู้ใช้ทั้งหมดพร้อม role ปัจจุบันได้
- admin สามารถสร้างผู้ใช้ใหม่พร้อมกำหนด role ได้
- admin สามารถเปลี่ยน role ของผู้ใช้ที่มีอยู่ได้
- admin สามารถลบผู้ใช้ได้ (ยกเว้นตัวเอง)
- การตั้งรหัสผ่านตอนสร้างผู้ใช้ใหม่

## Confirmed Decisions
1. **รหัสผ่าน**: ระบบกำหนดรหัสผ่านเริ่มต้น `"password"` อัตโนมัติเมื่อ admin สร้าง user ใหม่ — user เปลี่ยนเองในภายหลัง
2. **Reset password**: admin สามารถ reset รหัสผ่าน user คนอื่นกลับเป็น `"password"` ได้
3. **ระงับ user**: ใช้ soft-disable — เพิ่มคอลัมน์ `is_active` (boolean) ใน `users` table; user ที่ถูก disable เข้าระบบไม่ได้แต่ข้อมูลยังอยู่
4. **ข้อมูลที่แสดงในตาราง**: `username`, `role`, `is_active`, `created_at`, จำนวน active sessions

## Technical Scope
- **DB**: เพิ่มคอลัมน์ `is_active BOOLEAN NOT NULL DEFAULT TRUE` ใน `users` table (runtime migration + schema init)
- **Auth**: ตรวจสอบ `is_active = TRUE` ตอน login และ session validation; ถ้า disabled → ปฏิเสธ 401
- **Backend GET** `GET /api/users`: คืน user ทั้งหมดพร้อม active session count — admin only
- **Backend POST** `POST /api/users`: สร้าง user (username + role), password = `"password"` อัตโนมัติ — admin only
- **Backend PUT** `PUT /api/users/[id]`: เปลี่ยน role และ/หรือ toggle `is_active` และ/หรือ reset password — admin only; admin ห้ามเปลี่ยน role หรือ disable ตัวเอง
- **Frontend** `/users`: ตารางรายการ user; ปุ่ม Edit role / Reset password / Enable-Disable / (no hard-delete); admin only page
- **roles.js + layout**: เพิ่ม `/users` ใน ROLE_PAGE_ACCESS ของ admin และ NAV_ITEMS

## Acceptance Criteria
- AC1: หน้า `/users` แสดงได้เฉพาะ admin; role อื่น redirect หรือ forbidden
- AC2: ตารางแสดง username, role, สถานะ (Active/Disabled), วันที่สร้าง, จำนวน active sessions
- AC3: สร้าง user ใหม่สำเร็จ (username + role) รหัสผ่านเริ่มต้น = `"password"` อัตโนมัติ
- AC4: เปลี่ยน role ของ user ได้ และ role ใหม่มีผลทันที
- AC5: admin กด Reset Password แล้ว user นั้นต้องใช้ `"password"` ล็อกอินได้อีกครั้ง
- AC6: Disable user แล้ว user นั้นเข้าระบบไม่ได้ (401)
- AC7: Enable user แล้ว user นั้นเข้าระบบได้ตามปกติ
- AC8: admin ไม่สามารถ disable หรือเปลี่ยน role ของตัวเองได้
- AC9: username ต้อง unique; ถ้าซ้ำระบบแสดง error

## Status
ยืนยัน requirement ครบแล้ว — รอการอนุมัติแผนก่อนเริ่มพัฒนา

---

## Request 9 (/sawork)
จากหน้า frontend เปลี่ยน user role ยังไง และควรปรับ UX เพิ่มไหม

## Current Flow (As-Is)
1. login ด้วย admin
2. เข้าเมนู `User Management` ที่หน้า `/users`
3. ในตารางผู้ใช้ ไปที่คอลัมน์ `Role`
4. คลิกข้อความ role ของแถวที่ต้องการ (ยกเว้นตัวเอง)
5. ระบบเปิด dropdown role ใน cell เดิม
6. เลือก role ใหม่ ระบบยิง `PUT /api/users/{id}` ด้วย body `{ action: "role", role: "..." }`
7. เมื่อสำเร็จ ตาราง reload และแสดง role ล่าสุด

## Problem Statement
flow ปัจจุบันใช้งานได้ แต่ discoverability ต่ำ เพราะผู้ใช้ต้องรู้ก่อนว่า "คลิกข้อความ role ได้" ซึ่งไม่ชัดเจนเท่าปุ่ม action โดยตรง

## SA Proposal (To-Be)
- คง backend endpoint เดิม (ไม่ต้องเปลี่ยนสัญญา API)
- ปรับ frontend ให้มีปุ่ม `Edit Role` ในคอลัมน์ Actions เพื่อให้เข้าใจง่ายขึ้น
- เพิ่ม success notice หลังบันทึก role สำเร็จ
- คงข้อจำกัดเดิม: admin ห้ามแก้ role ตัวเอง

## Acceptance Criteria (Draft)
- AC1: admin เปลี่ยน role user อื่นผ่านหน้า `/users` ได้ในไม่เกิน 3 คลิก
- AC2: มี UI element ชัดเจนสำหรับการแก้ role (ปุ่ม/ไอคอน)
- AC3: เปลี่ยน role สำเร็จแล้วมี feedback ชัดเจน
- AC4: admin แก้ role ตัวเองไม่ได้ และระบบแสดงข้อความ error ที่เข้าใจง่าย

## Status
วิเคราะห์ระบบเสร็จแล้ว — รออนุมัติแผนก่อนพัฒนา

---

## Request 10 (/bawork)
1) เพิ่มปุ่ม Delete User
2) กำหนด/อธิบายการคุมสิทธิ์ให้ user เห็นเฉพาะ project, ability, ticket, action plan ของตัวเอง
3) เพิ่มปุ่ม Import Excel แล้วสร้าง Action Plan Rows

## Problem Statement
- ปัจจุบันหน้า User Management ยังไม่มีปุ่มลบ user โดยตรง
- เรื่อง owner visibility ต้องชัดเจนทั้งระดับ API และ UI ว่าคุมสิทธิ์อย่างไร
- หน้า Action Plan ยังต้องกรอกแถวด้วยมือทีละรายการ ไม่มี import จากไฟล์

## As-Is Access Control Analysis (ข้อ 2)
- Projects: staff เห็นเฉพาะ `projects.owner_user_id = current_user`
- Abilities: staff เห็นเฉพาะ `abilities.owner_user_id = current_user`
- Tickets: staff เห็นเฉพาะ `tickets.owner_user_id = current_user`
- Action Plan: staff เข้าถึงได้เฉพาะ row ที่อยู่ใต้ ticket ของตัวเอง (join กับ `tickets.owner_user_id`)
- สรุป: ฝั่ง API มีการคุม owner visibility อยู่แล้วตามที่ต้องการ

## Scope (Draft)
- เพิ่มปุ่ม Delete User ในหน้า `/users` (admin only)
- Backend รองรับการลบผู้ใช้พร้อมกติกาความปลอดภัย (ห้ามลบตัวเอง)
- ยืนยัน/ทำเอกสาร owner visibility policy ให้ชัดเจน (API + UI)
- เพิ่มปุ่ม Import Excel ในหน้า Action Plan
- เพิ่ม API รับไฟล์และแปลงเป็น Action Plan Rows ตาม ticket ที่เลือก

## Proposed Functional Requirements
1. admin สามารถกด Delete user ได้จากหน้า User Management
2. ระบบต้องแสดง confirm dialog ก่อนลบ user
3. admin ห้ามลบตัวเอง
4. เมื่อ user ถูกลบ ต้องจัดการ session และข้อมูลที่เกี่ยวข้องตาม policy ที่ยืนยัน
5. staff เห็นเฉพาะข้อมูลของตัวเองในหน้า Project/Ability/Ticket/Action Plan
6. ผู้ใช้ import ไฟล์ Excel ได้จากหน้า Action Plan
7. ระบบ parse ไฟล์และสร้างหลาย action plan rows ในครั้งเดียว
8. แถวที่นำเข้าไม่ถูกต้องต้องรายงานรายการที่ fail อย่างชัดเจน

## Acceptance Criteria (Draft)
- AC1: ปุ่ม Delete แสดงเฉพาะ admin ในหน้า User Management
- AC2: ลบ user สำเร็จแล้ว user นั้น login ไม่ได้และ session ถูกล้าง
- AC3: admin ลบตัวเองไม่ได้
- AC4: staff เมื่อเรียกดู Project/Ability/Ticket/Action Plan จะเห็นเฉพาะ owner ของตนเอง
- AC5: Import Excel สำเร็จแล้วจำนวนแถวในตาราง Action Plan เพิ่มตามไฟล์
- AC6: ถ้าไฟล์ไม่ถูกต้อง ระบบแจ้งสาเหตุแบบอ่านง่าย (schema/column/type)

## Open Questions
## Confirmed Decisions
1. Delete User ใช้ **hard delete**
2. ข้อมูลที่เคยผูก owner ให้เปลี่ยนเป็น **no owner** (`owner_user_id = NULL`)
3. Import รองรับไฟล์ **CSV**
4. คอลัมน์ import ยืนยันเป็น: `phase`, `No`, `action`, `status`, `duration`, `start`, `end`, `remark`
5. Import เป็น **1 file ต่อ 1 action plan** (อ้างอิง ticket/action plan ที่กำลังเปิดอยู่)
6. Import เป็น **partial success** และหลัง import ต้องสามารถ **edit** และ **drag item เพื่อเปลี่ยน order** ได้

## Data Policy (Confirmed)
- ลบ user แบบ hard delete แล้ว set `owner_user_id = NULL` ใน `projects`, `abilities`, `tickets`
- รายการที่เป็น no owner ยังคงแสดงในระบบได้สำหรับ admin

## Technical Scope (Updated)
- **User delete API**: เปลี่ยนจาก toggle เป็น hard delete endpoint พร้อม guard ห้ามลบตัวเอง
- **Ownership migration before delete**: update `projects/abilities/tickets` ให้ `owner_user_id = NULL` ก่อนลบ user
- **Action plan import API**: เพิ่ม endpoint รับ CSV แล้ว parse ตาม schema ที่ยืนยัน
- **Action plan ordering**: เพิ่มคอลัมน์ลำดับ (`sort_order`) และรองรับ drag-and-drop reorder
- **Action plan update API**: รองรับปรับ `sort_order` หลัง drag และแก้ไขแถวได้ตามปกติ
- **Action plan UI**: เพิ่มปุ่ม Import CSV + แสดงผล partial success (success count / fail rows)

## Acceptance Criteria (Final)
- AC1: admin มีปุ่ม Delete User และลบ user แบบ hard delete ได้
- AC2: admin ลบตัวเองไม่ได้
- AC3: เมื่อลบ user แล้วข้อมูล owner เดิมถูก set เป็น no owner (`owner_user_id = NULL`)
- AC4: staff ยังเห็นเฉพาะข้อมูลของตัวเอง, ส่วน no owner ไม่ปรากฏใน staff scope
- AC5: import CSV สำเร็จแบบ partial success และรายงานแถวที่ fail ชัดเจน
- AC6: schema CSV ต้องรองรับคอลัมน์ `phase`, `No`, `action`, `status`, `duration`, `start`, `end`, `remark`
- AC7: import จำกัด 1 file ต่อ 1 action plan
- AC8: หลัง import ผู้ใช้สามารถแก้ไขแถวได้
- AC9: หลัง import ผู้ใช้สามารถ drag item เพื่อเปลี่ยนลำดับได้ และระบบบันทึกลำดับใหม่

## Status
ยืนยัน requirement ครบแล้ว และพัฒนาเสร็จตามขอบเขตที่อนุมัติ
