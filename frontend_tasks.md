# Frontend Tasks
## Request 22 (/sawork): UX Redesign & Dashboard Modernization
- [ ] ออกแบบ/สร้าง Skeleton Loader (table, card, form)
- [ ] ปรับ AppShell: Navbar, Sidebar, Main grid/card layout
- [ ] เพิ่ม Dashboard Summary Cards (Active Goals, Due Tickets, Blocked Tasks)
- [ ] ปรับ primary CTA (Create Goal/Ticket) ให้อยู่ตำแหน่งเด่น
- [ ] ปรับ typography/spacing ให้ hierarchy ชัดเจน
- [ ] ปรับ layout ให้ responsive (breakpoint, touch target, mobile drawer)
- [ ] ปรับ navigation discoverability (sidebar/topbar/breadcrumb)
- [ ] ปรับ role-aware dashboard (Admin/Manager/Dev)
- [ ] เพิ่ม micro-interaction (button, loading, feedback)
- [ ] เพิ่ม async state + timeout fallback
- [ ] เตรียม UX metric logging (task time, success, bounce)

## Status (Request 22)
Planned - Awaiting implementation
## Request 5: Ticket Action Plan Link
- [x] เพิ่มปุ่ม Edit Action ในแต่ละแถวของตารางหน้า Ticket
- [x] ส่ง ticketId ผ่าน query string ไปหน้า Action Plan
- [x] เพิ่มเมนู Action Plan ใน navigation สำหรับ role ที่เข้าถึงได้
- [x] สร้างหน้า Action Plan สำหรับเลือก Ticket และแก้ไข Action Plan
- [x] รองรับบันทึก Action Plan ฝั่ง client storage ต่อ ticket

## Status
Completed

## Request 7: Ability No-Project Flow
- [x] ปรับฟอร์ม Ability ให้ช่อง Project เป็น optional
- [x] เพิ่มตัวเลือก "No Project" ในตัวกรอง Project Filter
- [x] ปรับตารางและ export ให้รองรับ Ability ที่ยังไม่ผูก Project
- [x] ทดสอบการเพิ่ม/แก้ไข Ability โดยไม่เลือก Project จากหน้า UI

## Status (Request 7)
Completed
## Request 10: File and Action Plan UX
- [x] หน้า Ability เพิ่ม Upload Result File และ List Files
- [x] หน้า Ability แสดงรายการไฟล์และคลิกชื่อเพื่อดาวน์โหลด
- [x] หน้า Project เพิ่ม List Files รวมไฟล์จาก abilities ภายใต้ project
- [x] หน้า Action Plan เพิ่ม Import CSV พร้อม summary partial success/fail
- [x] หน้า Action Plan รองรับ drag-and-drop reorder item
- [x] หน้า User Management เพิ่มปุ่ม Delete User


## Request 20 (/devwork): Rollback plan dragdrop + Edit/Delete
- [ ] วิเคราะห์ requirement และ UI parity กับ Action Plan Rows
- [ ] ปรับโค้ด Rollback plan section ให้รองรับ drag & drop, Edit, Delete
- [ ] ทดสอบ UX กรณี dragdrop/edit/delete rollback rows

## Status (Request 20)
Planned - Awaiting implementation
## Request 9 (/sawork): Clarify Role Change Flow on Frontend
- [x] วิเคราะห์ flow ปัจจุบันหน้า `/users` สำหรับการเปลี่ยน role
- [x] ระบุ UX ปัจจุบัน: คลิกข้อความ role ในคอลัมน์ Role เพื่อเปิด dropdown
- [x] ปรับ UX: เพิ่มปุ่ม "Edit Role" ชัดเจนในคอลัมน์ Actions
- [x] เพิ่ม feedback หลังบันทึก role สำเร็จ (notice)

## Status (Request 9)
Completed

## Request 11 (/sawork): Owner + Assign-to UI Alignment
- [x] ออกแบบฟอร์ม Project/Ability/Ticket ให้มีทั้ง Owner และ Assign To
- [x] กำหนดการแสดงผล `responsePerson` ให้สอดคล้องกับ `assign_to`
- [x] ปรับตาราง/รายละเอียดให้แสดง owner และ assign-to ชัดเจน
- [x] เพิ่ม validation ฝั่ง UI กรณีค่า owner/assign-to ไม่ครบ

## Status (Request 11)
Completed

## Request 12 (/sawork): Overview Owner-Scoped Summary
- [x] ปรับหน้า Overview ให้ดึง summary แบบ owner-scoped
- [x] แสดง KPI เฉพาะ project ที่เกี่ยวข้องกับผู้ใช้ในฐานะ owner
- [x] เพิ่ม empty state เมื่อผู้ใช้ไม่มี project ใน scope
- [x] ทดสอบ UX ทั้ง desktop/mobile

## Status (Request 12)
Completed

## Request 13 (/devwork): Admin Full-Access UX
- [x] เปิด navigation ของ admin ให้เข้าทุกหน้าในระบบ
- [x] ตรวจสอบว่า overview/management pages แสดงผลได้เมื่อ admin เข้าใช้งาน
- [x] ทดสอบหน้าใช้งานหลักครบเส้นทางสำหรับ admin

## Status (Request 13)
Completed

## Request 14 (/devwork): Distinct Text / Link / Dropdown Styling
- [x] ปรับ global link style ให้ต่างจาก text ปกติชัดเจน
- [x] ปรับ select/dropdown ให้มี visual treatment และ focus state ชัดเจน
- [x] ทดสอบผลกระทบกับ navigation, forms, และ login state บนหน้าหลัก

## Status (Request 14)
Completed

## Request 15 (/devwork): Multi-Role + Role Permission UI
- [x] ปรับ App context ให้รองรับ roles[] และ effective permissions
- [x] ปรับ RoleGate/AppShell ให้ใช้ permission-based page access
- [x] ปรับหน้า User Management ให้ assign ได้หลาย role ต่อ user
- [x] เพิ่ม UI จัดการ role-permission matrix (module/page actions)
- [x] ปรับ form สร้าง user ให้รองรับ multi-role
- [x] ทดสอบ UX ครบ flow admin จัดการ role/permission

## Status (Request 15)
Completed

## Request 17 (/devwork): CRUD Permission Matrix UI
- [x] ปรับ permission constants และ path access ให้ใช้ view/add/edit/delete
- [x] ปรับ RoleGate/AppShell ให้เข้าเพจตามสิทธิ์ view
- [x] ปรับหน้า User Management matrix เป็นสิทธิ์ CRUD ต่อโมดูล
- [x] ปรับหน้า Goals/Projects/Abilities/Tickets/Action Plans ให้ซ่อนหรือ disable ปุ่มตามสิทธิ์ add/edit/delete
- [x] ทดสอบ flow หน้าใช้งานหลักกับสิทธิ์แบบ action-level

## Status (Request 17)
Completed

## Request 18 (/sawork): Action Plan Rollback Section
- [x] วิเคราะห์ UX ตำแหน่งการแสดง Rollback plan section ใต้ Action Plan Rows
- [x] กำหนดเงื่อนไขแยกรายการ rollback จากค่า phase (case-insensitive)
- [x] จัดทำแผน UI rendering สำหรับ rollback items หลัง import และหลัง reload
- [x] รออนุมัติแผนก่อนพัฒนา
- [x] พัฒนา Rollback plan section และเชื่อมกับ rows state ปัจจุบัน
- [ ] ทดสอบ UX กรณีมี rollback items และไม่มี rollback items

## Status (Request 18)
In Progress - Implemented, pending QA verification

## Request 19 (/devwork): Clear Current Action Plan + Re-import Flow
- [x] เพิ่มปุ่ม `Clear Current Action Plan Items` ในหน้า Action Plan
- [x] ผูกปุ่มกับ selected ticket และสิทธิ์ `actionPlansDelete`
- [x] จัดการ state ระหว่าง clear (disable ปุ่ม + loading text)
- [x] หลัง clear ให้ reload rows, reset import result/file, และ reset edit form
- [ ] ทดสอบ UX กรณี clear แล้ว import ต่อทันที และกรณีไม่มี ticket selected

## Status (Request 19)
In Progress - Implemented, pending QA verification
