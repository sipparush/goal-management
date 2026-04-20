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
