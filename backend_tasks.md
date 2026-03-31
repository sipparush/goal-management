## Status (Request 21)
Completed
## Request 22 (/sawork): UX Redesign & Dashboard Modernization
- [ ] ปรับ API summary cards (Active Goals, Due Tickets, Blocked Tasks)
- [ ] เพิ่ม endpoint สำหรับ UX metric logging (task time, success, bounce)
- [ ] ปรับ API ให้รองรับ role-aware dashboard (filter ตาม user/role)
- [ ] ปรับ API ให้รองรับ async state/fallback (timeout, error)
- [ ] ทดสอบ endpoint ใหม่และ regression
# Backend Tasks

## Request 5: Backend Impact Review
- [x] ตรวจสอบว่า API ticket ปัจจุบันรองรับข้อมูลสำหรับหน้า Action Plan แล้ว
- [x] ตรวจสอบ auth/role policy ที่เกี่ยวข้องกับ staff/admin/manager
- [x] ตรวจสอบว่าไม่มีการเปลี่ยน schema เพิ่มเติมที่จำเป็น

## Status
Completed

## Request 7: Ability Nullable Project Binding
- [x] ปรับ schema ให้ `abilities.project_id` เป็น nullable
- [x] ปรับ foreign key เป็น `ON DELETE SET NULL`
- [x] ปรับ API abilities (GET/POST/PUT) ให้รองรับ projectId = null
- [x] เพิ่มการ query ด้วย `projectId=no-project`
- [x] ทดสอบ API flow: create without project -> bind later -> filter no-project

## Status (Request 7)
Completed
## Request 10: API and Data Model
- [x] เพิ่ม schema `ability_files` และ index ที่เกี่ยวข้อง
- [x] เพิ่มคอลัมน์ `phase`, `item_no`, `sort_order` ใน action_plan_rows
- [x] เพิ่ม API upload/list/download ไฟล์ใน ability/project
- [x] เพิ่ม API import CSV และ reorder action plan rows
- [x] ปรับ API users ให้รองรับ DELETE hard delete + set owner null
- [x] เพิ่ม orphan-file policy (mark orphan และ cleanup ครบ 30 วัน)

## Status (Request 10)
Completed
## Request 9 (/sawork): Role Change API Verification
- [x] ทบทวน endpoint เปลี่ยน role: `PUT /api/users/[id]` (`action=role`)
- [x] ทบทวน validation role และข้อจำกัด admin แก้ role ตัวเองไม่ได้
- [x] ทบทวน response pattern และ error code สำหรับการผูกกับ frontend
- [x] รองรับ UX ใหม่ด้วย endpoint เดิมโดยไม่ต้องเพิ่ม field ใหม่

## Status (Request 9)
Completed

## Request 11 (/sawork): Owner + Assign-to Data/Permission Design
- [x] ออกแบบ schema เพิ่ม `assign_to_user_id` ใน projects/abilities/tickets
- [x] วางแผน migration และ backfill ข้อมูลเดิมตามนโยบายที่อนุมัติ
- [x] ปรับ API CRUD ให้รองรับ owner + assign-to พร้อม validation
- [x] ปรับ access-control rule ให้รองรับ owner scope และ assign scope ตาม requirement

## Status (Request 11)
Completed

## Request 12 (/sawork): Owner-Scoped Overview API
- [x] ออกแบบ summary query สำหรับ overview แบบ owner-scoped
- [x] ปรับ endpoint bootstrap/overview ให้คืนข้อมูลตาม role และ owner policy
- [x] เพิ่ม guard กรณีผู้ใช้ไม่มี project ใน scope
- [x] เตรียม test case สำหรับ performance และ correctness ของ summary

## Status (Request 12)
Completed

## Request 13 (/devwork): Admin Full-Access Permission Expansion
- [x] ปรับ role guard ของ goals/projects/abilities/tickets/action-plan/files ให้ admin ผ่านได้
- [x] ปรับ bootstrap และ overview ให้ admin เห็นข้อมูลรวมทั้งระบบ
- [x] รองรับการจัดการรายการที่ไม่มี owner โดยไม่ติด owner-scope check เดิม
- [x] ทดสอบ API smoke ด้วย admin login

## Status (Request 13)
Completed

## Request 14 (/devwork): Shared UI Styling Support
- [x] ตรวจสอบว่า backend ไม่มีผลกระทบจากการเปลี่ยนแปลง CSS frontend

## Status (Request 14)
Completed

## Request 15 (/devwork): Multi-Role + Permission Backend
- [x] เพิ่ม schema/tables: roles, permissions, role_permissions, user_roles
- [x] seed ค่า default roles/permissions และ default matrix
- [x] backfill users.role เดิม -> user_roles
- [x] ปรับ auth-server ให้ resolve roles และ effective permissions
- [x] เพิ่ม API role-permission management (admin only)
- [x] ปรับ API users ให้รองรับ set_roles (multi-role)
- [x] คง admin เป็น super role และ union allow ตามนโยบาย

## Status (Request 15)
Completed

## Request 16 (/devwork): Owner-or-Assignee Visibility Fix
- [x] ปรับ scope ของ projects/abilities/tickets list ให้รองรับ owner หรือ assign_to
- [x] ปรับ bootstrap/overview query ให้รวมข้อมูลตาม assign scope
- [x] ปรับ access-check helper ใน action-plans และ files endpoints
- [x] ปรับ update/delete guards ใน endpoints แบบ `[id]` ให้รองรับ assign scope
- [x] เพิ่ม manager role access สำหรับ action-plans routes ที่เกี่ยวข้อง
- [x] ตรวจสอบ syntax error ของไฟล์ backend ที่แก้ทั้งหมด

## Status (Request 16)
Completed

## Request 17 (/devwork): CRUD Permission Matrix Backend
- [x] ออกแบบ permission keys ใหม่แบบ view/add/edit/delete ต่อโมดูล
- [x] เพิ่ม migration mapping สิทธิ์เก่า `.manage` ไปสิทธิ์ CRUD ใหม่
- [x] ปรับ schema init seed ใน permissions/role_permissions ให้เป็น key ใหม่
- [x] ปรับ API guards ของ goals/projects/abilities/tickets/action-plans/users ตามสิทธิ์ราย action
- [x] ปรับ API permissions matrix ให้ validate/save key รูปแบบใหม่
- [x] ปรับ bootstrap/overview และไฟล์ endpoints ให้สอดคล้องกับสิทธิ์ view/edit ที่เกี่ยวข้อง

## Status (Request 17)
Completed

## Request 18 (/sawork): Rollback Data Grouping Contract
- [x] วิเคราะห์ contract ข้อมูล action plan rows ว่ารองรับ phase แล้ว
- [x] กำหนด rule การตีความ rollback: `phase` = rollback (trim + lower-case)
- [x] ยืนยันว่าไม่ต้องเปลี่ยน schema หรือ endpoint ใหม่
- [x] วางแผนให้ import/reload ส่งข้อมูลเดิม โดย frontend เป็นผู้แยก section
- [x] รออนุมัติแผนก่อนพัฒนา
- [ ] ตรวจ regression ของ import/reorder/update/delete หลังปรับการแสดงผล

## Status (Request 18)
In Progress - No backend changes required, pending regression verification

## Request 19 (/devwork): Clear All Action Plan Rows API
- [x] เพิ่ม endpoint `DELETE /api/action-plans?ticketId=...` สำหรับ clear rows ทั้ง ticket
- [x] บังคับสิทธิ์ `actionPlansDelete` ก่อนลบ
- [x] ใช้ access check แบบ owner-or-assignee/admin ผ่าน `canAccessTicket`
- [x] คืนผลลัพธ์เป็น `clearedCount` เพื่อให้ frontend แสดงผลได้
- [ ] ทดสอบ regression กับ endpoints เดิมของ action-plans (GET/POST/PUT/DELETE row/import/reorder)

## Status (Request 19)
In Progress - Implemented, pending regression verification
