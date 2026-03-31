# UX Redesign & Dashboard Modernization – SA/UX Analysis

**Timestamp:** 20 มี.ค. 2026, 00:00

## 1. เป้าหมาย UX ใหม่
- Dashboard ต้องมี skeleton loading, card/grid layout, role-aware, responsive, UX metrics
- ต้องออกแบบ AppShell (Sidebar, Topbar, Main grid) รองรับทุก role

## 2. Pain Point/ข้อเสนอแนะ
- ปัญหาเดิม: โหลดช้า, ข้อมูลกระจาย, ไม่ responsive, UX ไม่สอดคล้อง role
- ข้อเสนอใหม่:
  - ใช้ skeleton loader ระหว่างโหลดข้อมูล
  - Dashboard card สรุปข้อมูลสำคัญ
  - Layout แบบ grid/card
  - Dashboard แยกตาม role (admin/manager/dev)
  - รองรับ mobile/touch

## 3. โครงสร้าง UI/Component (Wireframe)
- AppShell: Sidebar (navigation), Topbar (user/profile/role switch), Main grid (dashboard cards)
- DashboardCard: สรุป Goal, Project, Ability, Ticket, Status, Progress
- SkeletonLoader: แสดงระหว่างโหลดข้อมูล
- ResponsiveGrid: ปรับ layout ตามขนาดจอ
- RoleAwareDashboard: เปลี่ยนข้อมูล/การ์ดตาม role

## 4. Component Hierarchy
- AppShell
  - Sidebar
  - Topbar
  - MainContent
    - DashboardGrid
      - DashboardCard (หลายใบ)
      - SkeletonLoader (ถ้า loading)
- Role-aware: ใช้ context/props กำหนดสิทธิ์และข้อมูลที่แสดง

## 5. Staged Loading & Async State
- โหลดข้อมูลแบบ async ทีละส่วน (goal/project/ability/ticket)
- แสดง skeleton loader ระหว่างรอ
- Dashboard card แต่ละใบโหลดแยก, ไม่ block ทั้งหน้า

## 6. Responsive Plan
- Desktop: 4-5 card/row, Sidebar คงที่
- Tablet: 2-3 card/row, Sidebar ยุบ
- Mobile: 1 card/row, Topbar compact, Sidebar ซ่อน

## 7. UX Metrics & Validation
- วัดเวลา loading, interaction, completion rate
- UX KPI: loading < 1.5s, mobile usability, role-based access ถูกต้อง

## 8. Task Breakdown
- frontend_tasks.md: สร้าง/ปรับ component, responsive, skeleton, role-aware
- backend_tasks.md: API summary, role-aware data, async endpoint
- qa_tasks.md: test loading, responsive, role, UX metric

## 9. Progress Log
- 00:00: เริ่มต้นวิเคราะห์ requirement, สรุปเป้าหมาย UX ใหม่
- 00:01: ร่าง wireframe + component hierarchy
- 00:02: วาง responsive plan, UX metric
- 00:03: เตรียมแตกงานลง task file

