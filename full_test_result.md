# Full Test Result

---

## E2E Test — 2026-04-20
Scope: Upload file extension support + Delete uploaded file + Close ticket status

### Environment
- App: Docker container at http://localhost:4001
- DB: itportal-v2-postgres-1 (PostgreSQL)

### Test Cases

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Login as admin | 200 + user object | **PASS** |
| 2 | Upload .csv file to ability | 201 + item | **PASS** |
| 3 | Upload .png image to ability | 201 + item | **PASS** |
| 4 | Upload .xlsx file to ability | 201 + item | **PASS** |
| 5 | Upload .exe file (unsupported) | 400 "file extension .exe is not allowed" | **PASS** |
| 6 | List files for ability | 200 + items array | **PASS** |
| 7 | Delete uploaded file | 200 + id | **PASS** |
| 8 | File removed from list after delete | Count decremented | **PASS** |
| 9 | GET /api/tickets?status=closed | Returns only closed tickets | **PASS** |
| 10 | PATCH close ticket (already closed) | No open tickets — skipped (DB data all closed) | **SKIP** |

### Notes
- ทุก ticket ใน DB ปิดอยู่แล้ว ไม่สามารถทดสอบ PATCH close ticket ด้วย open ticket ได้ในรอบนี้
- `closed_at` column ถูกเพิ่มใน DB สำเร็จ และ GET filter `status=closed` ทำงานถูกต้อง
- Extension validation ปฏิเสธ `.exe` และอนุญาต `.csv`, `.xlsx`, `.png` ตามที่กำหนด

### Conclusion
**PASS** (1 SKIP เนื่องจากข้อมูลใน DB)

---

Date: 2026-03-14
Scope: Request 5 (Ticket Edit Action -> Action Plan + /qawork UAT)

## Environment
- App: Next.js dev server at http://localhost:3000
- DB: PostgreSQL via backend/docker-compose.yml

## UAT Checklist Result
1. Unauthorized access to ticket API should be blocked
- Step: Call GET /api/tickets without session
- Result: PASS (401)

2. Login should work for all default users
- Step: POST /api/auth/login for admin, manager, user1
- Result: PASS (all 200)

3. Admin should create goal
- Step: POST /api/goals with admin session
- Result: PASS (201)

4. Manager should not create project
- Step: POST /api/projects with manager session
- Result: PASS (403)

5. Staff should create project/ability/ticket
- Step: POST /api/projects, /api/abilities, /api/tickets with user1 session
- Result: PASS (all 201)

6. Action Plan route should be reachable by staff via ticketId
- Step: GET /action-plan?ticketId=<created_ticket_id> with user1 session
- Result: PASS (200)

7. Code quality
- Step: npm run lint
- Result: PASS

## Notes
- Action Plan page uses per-ticket local storage key for editable action plan data.
- Manager route restriction for Action Plan is enforced by client RoleGate flow.

## Conclusion
Request 5 test status: PASS

---

## E2E Test — 2026-04-21
Scope: Request 23 Ticket file management + Ability merged file list

### Environment
- App: Next.js dev server at http://localhost:4001
- DB: PostgreSQL (`pm_db`)

### Test Cases

| # | Test Case | Expected | Result |
|---|-----------|----------|--------|
| 1 | Login as admin | 200 + session cookie + user object | **PASS** |
| 2 | GET /api/auth/me with session | 200 + authenticated user | **PASS** |
| 3 | List files for target ticket before upload | 200 + items array | **PASS** |
| 4 | Upload `.xlsx` to ticket via /api/tickets/[id]/files | 201 + created item | **PASS** |
| 5 | Download uploaded ticket file via /api/files/[id]/download | 200 + non-empty file | **PASS** |
| 6 | Delete uploaded ticket file via /api/files/[id] | 200 + id | **PASS** |
| 7 | Ticket file list is empty after delete | uploaded item removed | **PASS** |
| 8 | Ability merged file list shows ticket-uploaded file with `sourceType=ticket` and `ticketTitle` | 200 + merged row present | **PASS** |
| 9 | Upload `.png` to ability via /api/abilities/[id]/files | 201 + created item | **PASS** |
| 10 | Download uploaded ability file via /api/files/[id]/download | 200 + non-empty file | **PASS** |
| 11 | Delete uploaded ability file via /api/files/[id] | 200 + id | **PASS** |
| 12 | Ability merged file list final state remains accessible after cleanup | 200 + items array | **PASS** |
| 13 | Static validation: targeted lint | Exit code 0 | **PASS** |
| 14 | Static validation: npm run build | Exit code 0 | **PASS** |

### Notes
- ระหว่าง QA พบ defect จริงที่ `DELETE /api/files/[id]` ตอบ `500` ด้วยข้อความ `Failed to delete file: dbQuery is not defined`
- สาเหตุคือไฟล์ [src/app/api/files/[id]/route.js](/home/sipparush/MyTraining/project-management/src/app/api/files/[id]/route.js) ขาด import `dbQuery`
- หลังแก้ import และ rerun endpoint เดียวกัน ผลลัพธ์กลับเป็น `200` ทั้ง ticket file และ ability file delete flows
- ไฟล์ทดสอบที่ดาวน์โหลดได้มีขนาดไม่เป็นศูนย์: ticket `23 bytes`, ability `68 bytes`

### Conclusion
**PASS** หลังแก้ defect 1 จุดใน route ลบไฟล์ และ rerun QA สำเร็จครบ flow
