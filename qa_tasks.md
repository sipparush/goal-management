## Status (Request 21)
Completed
## /qawork - Request 22
- [ ] วิเคราะห์ test scenario: skeleton loader, staged loading, async fallback
- [ ] ทดสอบ dashboard summary cards, CTA prominence, grid/card layout
- [ ] ทดสอบ role-aware dashboard (Admin/Manager/Dev)
- [ ] ทดสอบ responsive/mobile UX (breakpoint, touch, drawer)
- [ ] ทดสอบ navigation discoverability (sidebar/topbar)
- [ ] ทดสอบ UX metric logging (task time, success, bounce)
- [ ] รวบรวม feedback จาก dev/PM จริง

## Status (Request 22)
Planned - Awaiting implementation
# QA Tasks

## /qawork - Request 5
- [x] สตาร์ท PostgreSQL ด้วย docker compose
- [x] รันระบบด้วย npm run dev
- [x] ทดสอบ login role ต่างๆ (admin/manager/staff)
- [x] ทดสอบ CRUD flow สำหรับ goal/project/ability/ticket
- [x] ทดสอบการเข้าหน้า Action Plan จาก ticketId
- [x] ตรวจสอบสิทธิ์ manager กับงาน project (ต้องถูกปฏิเสธ)
- [x] รัน lint เพื่อตรวจคุณภาพโค้ด
- [x] บันทึกผลใน full_test_result.md

## Status
Completed - Waiting for approval test passed

## /qawork - Request 9
- [x] วิเคราะห์ test flow สำหรับการเปลี่ยน role จากหน้า frontend
- [x] ทดสอบการเปลี่ยน role ผ่านปุ่ม Edit Role และ Save Role
- [x] ทดสอบว่า admin แก้ role ตัวเองไม่ได้
- [x] ทดสอบการ refresh ตารางหลังเปลี่ยน role สำเร็จ
- [x] ทดสอบ error handling กรณี forbidden


## /qawork - Request 20
- [ ] วิเคราะห์ test scenario สำหรับ rollback plan dragdrop + Edit/Delete
- [ ] เตรียม test case: dragdrop/edit/delete rollback rows
- [ ] รันทดสอบ UI + API behavior ของ rollback plan section หลังปรับใหม่

## Status (Request 20)
Planned - Awaiting implementation

## /qawork - Request 11
- [x] ทดสอบ migration: project เดิม owner=manager และ assign_to=sipparush.l ถูกต้อง
- [x] ทดสอบ CRUD Project/Ability/Ticket กับ owner + assign-to ครบ role matrix (API smoke)
- [x] ทดสอบ consistency ระหว่าง response person กับ assign-to
- [x] ทดสอบ permission boundary: เห็นเฉพาะข้อมูลใน scope ที่กำหนด (API smoke)

## Status (Request 11)
Completed

## /qawork - Request 12
- [x] ทดสอบ Overview summary แสดงเฉพาะ owner-related projects
- [x] ทดสอบตัวเลข summary เทียบกับข้อมูลจริงใน DB (API smoke)
- [x] ทดสอบ empty-state เมื่อไม่มี project ใน owner scope
- [x] ทดสอบ regression กับหน้าอื่นที่ใช้ bootstrap data

## Status (Request 12)
Completed

## /qawork - Request 13
- [x] ทดสอบ admin login และเข้าถึงทุกหน้าหลักได้
- [x] ทดสอบ admin เรียก bootstrap/overview/goals/projects/abilities/tickets ได้ 200
- [x] ทดสอบ regression ว่า manager/staff flow เดิมไม่พังจากการขยายสิทธิ์ admin

## Status (Request 13)
Completed

## /qawork - Request 14
- [x] ตรวจสอบ visual distinction ของ text/link/dropdown จาก global CSS
- [x] ทดสอบ focus state ของ select/input ใน form หลัก
- [x] ตรวจสอบผลกระทบบนหน้า login/navigation/forms ผ่าน smoke test

## Status (Request 14)
Completed

## /qawork - Request 15
- [x] ทดสอบ migrate ผู้ใช้เดิมเป็น multi-role สำเร็จ
- [x] ทดสอบ assign หลาย role แล้ว permissions เป็น union
- [x] ทดสอบ role-permission matrix ส่งผลกับ page access จริง
- [x] ทดสอบ admin เป็น super role (เข้าถึงทุกหน้าได้เสมอ)
- [x] ทดสอบ regression login/user management/route guard

## Status (Request 15)
Completed

## /qawork - Request 16
- [x] ทดสอบเชิงโค้ดว่า API scope เปลี่ยนจาก owner-only เป็น owner-or-assignee ครบจุดหลัก
- [x] ตรวจสอบ action-plan endpoints รองรับ manager และผู้ถูก assign
- [x] ตรวจสอบ syntax errors ของไฟล์ที่แก้ไข (ต้องไม่พบ error)
- [x] ตรวจสอบ dev startup (พบ instance เดิมรันอยู่และ lock ป้องกันการรันซ้ำ)

## Status (Request 16)
Completed (API-level verification)

## /qawork - Request 17
- [x] ตรวจสอบว่า role-permission matrix แสดงสิทธิ์แบบ view/add/edit/delete ครบ modules ที่กำหนด
- [x] ทดสอบ page access ต้องผูกกับสิทธิ์ view ของแต่ละโมดูล
- [x] ทดสอบ API authorization ราย method (GET/POST/PUT/DELETE) ตามสิทธิ์ action
- [x] ทดสอบ migration จาก `.manage` เดิมว่าแปลงเป็น CRUD ครบโดยไม่สูญเสียสิทธิ์
- [x] ทดสอบ multi-role union permissions หลังเปลี่ยน key ใหม่
- [x] ตรวจสอบ syntax/lint และ startup ของระบบ

## Status (Request 17)
Completed (implementation + static verification)

## /qawork - Request 18
- [x] จัดทำ test scenario สำหรับ rollback section หลัง Action Plan Rows
- [x] เตรียม test cases: import CSV มี phase=rollback, ไม่มี rollback, และ mixed phase
- [x] เตรียม regression cases สำหรับ edit/delete/reorder/import ของ rows เดิม
- [x] รออนุมัติแผนก่อนทดสอบจริง
- [ ] รันทดสอบ UI + API behavior ตาม scenario ที่กำหนด

## Status (Request 18)
In Progress - Waiting for QA execution results

## /qawork - Request 19
- [x] จัดทำ scenario ทดสอบ Clear Current Action Plan Items สำหรับ ticket ที่มี rows
- [x] เตรียม test case clear แล้ว import CSV ใหม่ใน ticket เดิม
- [x] เตรียม test case permission boundary สำหรับ user นอก scope และ user ไม่มี actionPlansDelete
- [ ] รันทดสอบ UI + API behavior ของ clear all และ re-import
- [ ] รันทดสอบ regression ของ add/edit/delete/reorder/import หลังเพิ่ม clear all

## Status (Request 19)
In Progress - Waiting for QA execution results
