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
- หน้า Action Plan ต้องแสดงข้อมูลในรูปแบบตารางแถว
- มีปุ่ม Edit และ Delete ในแต่ละแถวข้อมูล
- ปรับ flow ให้ใช้งานง่ายจาก Ticket -> Action Plan

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
