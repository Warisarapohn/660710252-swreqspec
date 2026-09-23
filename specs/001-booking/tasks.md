# Tasks: จองคิวตรวจสุขภาพ (Booking)
- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง plan.md: specs/001-booking/plan.md
- วันที่: 2569-09-23
- สรุป: ทำ 12 task, มี 1 task ที่ต้องรอ Open Questions

### T-01 สร้าง schema และ migration ฐานข้อมูล
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03
- ไฟล์ที่แตะ: backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/tests/conftest.py
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง slots, bookings และ audit_logs ที่เข้ากันกับ PostgreSQL และ bookings เก็บเฉพาะ hn ไม่เก็บเลขบัตรประชาชน
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 สร้าง API หาช่วงว่างตามแพ็กเกจ
- รองรับ: FR-BKG-01, FR-BKG-06, NFR-PERF-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: backend/app/slots/router.py, backend/app/slots/service.py, backend/tests/test_AC_BKG_05.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: GET /slots คืนข้อมูลช่วงเวลา 30 วันข้างหน้า พร้อม remaining และผ่าน benchmark 200 concurrent requests โดย p95 ไม่เกิน 2 วินาที
- สถานะ: พร้อมทำ

### T-03 สร้าง API จองคิวพื้นฐาน
- รองรับ: FR-BKG-04, IF-IDP-01
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: backend/app/booking/router.py, backend/app/booking/service.py, backend/tests/test_AC_BKG_01.py
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: POST /bookings บันทึกการจองและตัดจำนวนที่นั่งทันที พร้อมคืนข้อมูล booking และ queue_no placeholder สำหรับแสดงผลต่อไป
- สถานะ: พร้อมทำ

### T-04 ป้องกันการจองซ้ำวันเดียวกัน
- รองรับ: FR-BKG-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/tests/test_AC_BKG_02.py
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: เมื่อผู้ใช้มีคิวที่ยังไม่ได้ใช้ในวันเดียวกัน ระบบตอบ 409 พร้อมเลขคิวเดิมและไม่สร้างการจองใหม่
- สถานะ: พร้อมทำ

### T-05 จัดการช่วงเวลาเต็มและเสนอ 3 ตัวเลือกที่ใกล้ที่สุด
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: backend/app/slots/service.py, backend/app/booking/router.py, backend/tests/test_AC_BKG_03.py
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: เมื่อช่วงเวลาที่เลือกเต็ม ระบบคืน 409 พร้อม 3 ช่วงที่ว่างที่ใกล้ที่สุดภายในวันเดียวกันและวันถัดไป และไม่มีการจองซ้อนเกิดขึ้น
- สถานะ: พร้อมทำ

### T-06 สร้างคิวส่งข้อความยืนยันแบบ asynchronous และ retry
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02, ASM-03
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: backend/app/notify/queue.py, backend/app/booking/service.py, backend/tests/test_AC_BKG_04.py
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: ถ้าระบบแจ้งเตือนไม่สำเร็จ การจองยังถูกบันทึกไว้ และมีงานในคิวส่งซ้ำที่กำหนดส่งภายใน 5 นาที
- สถานะ: พร้อมทำ

### T-07 บันทึก audit log เมื่อเข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01, IF-IDP-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: backend/app/audit/middleware.py, backend/app/db/models.py, backend/tests/test_AC_BKG_06.py
- ต้องทำหลัง: T-01, T-03
- เสร็จเมื่อ: ทุก request ที่เข้าถึงข้อมูลการจองสร้าง audit log ที่มี actor_id, accessed_at และ hn ตามความต้องการของ PDPA
- สถานะ: พร้อมทำ

### T-08 ค้น HN จาก HIS และสลับไปใช้ HN แทนเลขบัตร
- รองรับ: IF-HIS-01, IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03
- ไฟล์ที่แตะ: backend/app/his/client.py, backend/app/auth/idp.py, backend/app/booking/service.py
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: ระบบรับเลขบัตรจากผู้ใช้ผ่าน lookup แล้วใช้ HN ในฐานข้อมูลการจอง โดยไม่เก็บเลขบัตรประชาชนในตาราง bookings
- สถานะ: พร้อมทำ

### T-09 ออกหมายเลขคิวและแสดงผลลัพธ์ให้ผู้ใช้เห็น
- รองรับ: FR-BKG-04, FR-BKG-05, Q-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03
- ไฟล์ที่แตะ: backend/app/booking/service.py, backend/app/booking/router.py, frontend/src/pages/BookingResult.jsx
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: ระบบกำหนด queue_no ตามรูปแบบที่ทีมตอบ Q-02 แล้วแสดงบนหน้าจอผลการจองอย่างถูกต้อง
- สถานะ: รอ Q-02

### T-10 สร้างหน้าเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-12
- ไฟล์ที่แตะ: frontend/src/pages/SlotPicker.jsx, frontend/src/App.jsx, frontend/src/api/client.js
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: ผู้ใช้เลือกแพ็กเกจและวัน/ช่วงเวลาได้จาก GET /slots และเมื่อเปลี่ยนแพ็กเกจจะโหลดช่วงว่างใหม่ทันที
- สถานะ: พร้อมทำ

### T-11 สร้างหน้ายืนยันและจัดการช่วงเวลาเต็ม
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: frontend/src/pages/ConfirmBooking.jsx, frontend/src/__tests__/AC-BKG-03.test.jsx
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: เมื่อกดยืนยันช่วงที่เต็ม หน้าจอแสดงข้อความ "ช่วงเวลาเต็ม" พร้อม 3 ตัวเลือกและให้ผู้ใช้เลือกได้อย่างถูกต้อง
- สถานะ: พร้อมทำ

### T-12 ต่อหน้าจอกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-10
- ไฟล์ที่แตะ: frontend/src/api/client.js, frontend/src/pages/SlotPicker.jsx, frontend/src/pages/ConfirmBooking.jsx, frontend/src/pages/BookingResult.jsx
- ต้องทำหลัง: T-02, T-05, T-10, T-11
- เสร็จเมื่อ: หน้าเลือกเวลาและยืนยันเชื่อมต่อกับ API จริงได้โดยไม่ใช้ mock และผ่าน test หน้าจอที่เกี่ยวข้อง
- สถานะ: พร้อมทำ

## ตารางตรวจความครบ AC
| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-03 |
| AC-BKG-02 | T-04 |
| AC-BKG-03 | T-05, T-11 |
| AC-BKG-04 | T-06 |
| AC-BKG-05 | T-02 |
| AC-BKG-06 | T-07 |

## ตารางตรวจความครบ Constraint
| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-07 |
| IF-IDP-01 | T-07, T-08 |
| IF-HIS-01 | T-01, T-08 |
| IF-NOT-01 | T-06 |

## สิ่งที่ยังไม่ทำ
- Q-02 หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร (เช่น A001)? -> ถามเจ้าหน้าที่เวชระเบียน
  - รออยู่: T-09
