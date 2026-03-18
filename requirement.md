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
