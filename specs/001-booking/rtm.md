# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:31 | test: backend 7 ผ่าน 0 ไม่ผ่าน; frontend 1 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | backend/app/slots/router.py:get_slots; backend/app/slots/service.py:list_available_slots | backend/tests/test_AC_BKG_05.py: passed | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 | ไม่มีโค้ดที่ตรวจคิววันเดียวกัน | ไม่มี test | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 | ไม่มีโค้ดสำหรับแจ้งช่วงเวลาเต็มและ 3 ตัวเลือก | ไม่มี test | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | backend/app/booking/router.py:create_booking; backend/app/booking/service.py:create_booking | backend/tests/test_AC_BKG_01.py: passed (แต่ไม่ครอบคลุม remaining=0) | ช่องโหว่ |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่มีโค้ดคิวส่งข้อความซ้ำ | ไม่มี test | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC | T-10 | backend/app/slots/router.py:get_slots; backend/app/slots/service.py:list_available_slots (กรองตาม package_code) | ไม่มี test | ช่องโหว่ |
| NFR-PERF-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py:list_available_slots | backend/tests/test_AC_BKG_05.py: passed | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | ไม่มี TLS/HTTPS config ที่แสดงชัดเจนในโค้ด | ไม่มี test | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่มีโค้ดคิวส่งซ้ำ ภายใน 5 นาที | ไม่มี test | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่มี test/โค้ดสำหรับ 8 ใน 10 คน | ไม่มี test | ยังไม่ถึง |
| CON-TECH-01 | T-01 | T-01 | backend/app/config.py:DATABASE_URL; backend/app/db/session.py:get_db | backend/tests/test_T01_schema.py: passed | ยังไม่ถึง |
| DOM-PDPA-01 | AC-BKG-06 | T-08 | backend/app/db/models.py:AuditLog ที่มีโครงสร้าง แต่ไม่มี middleware/request logging จริง | ไม่มี test | ยังไม่ถึง |
| IF-IDP-01 | AC-BKG-01 | T-03 | backend/app/auth/idp.py:get_verified_hn | backend/tests/test_AC_BKG_01.py: passed | ครบ |
| IF-HIS-01 | ไม่มี AC | T-09 | backend/app/db/models.py:Booking เก็บ hn แต่ไม่มี client ค้น HN จาก HIS อย่างจริงจัง | ไม่มี test | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 | T-07 | ไม่มีโค้ดคิวส่งข้อความ async/ส่งซ้ำ | ไม่มี test | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| backend/app/slots/service.py:list_available_slots | FR-BKG-01 | ไม่ตรง | `DAYS_AHEAD = 14` ให้แสดงแค่ 14 วัน ขณะที่ spec ระบุ “ภายใน 30 วันข้างหน้า” |
| backend/app/booking/router.py:create_booking | IF-HIS-01, DOM-PDPA-01 | ไม่ตรง | request model มี `national_id` และพิมพ์ log ด้วย `national_id` แม้ spec ระบุไม่เก็บเลขบัตรประชาชนในตารางการจอง |
| backend/app/booking/service.py:create_booking | FR-BKG-03, FR-BKG-04 | ไม่ตรง | ใช้ `if slot.remaining < 0` แทน `<= 0` ทำให้ `remaining == 0` ยังจองได้ และอาจเกินที่นั่ง |
| backend/app/config.py:DATABASE_URL | CON-TECH-01 | ไม่ครบ | default เป็น SQLite สำหรับ dev/testing ไม่บังคับให้ใช้ PostgreSQL ในระบบจริง |
| backend/app/db/models.py:Booking | IF-HIS-01 | ตรงบางส่วน | เก็บเฉพาะ `hn` แต่ไม่มีการค้น HN จาก HIS แบบจริง; ด้านความปลอดภัยยังไม่มีการป้องกัน field อื่น ๆ |
| frontend/src/App.jsx | FR-BKG-01, FR-BKG-03 | ไม่ตรง | หน้าแสดงค่าเริ่มต้นอย่างง่ายเท่านั้น ยังไม่มีหน้าจอเลือกแพ็กเกจ/ช่วงเวลา/ยืนยันจริง |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | backend/app/slots/service.py:DAYS_AHEAD | FR-BKG-01 | โค้ดแสดงเฉพาะ 14 วัน ขณะที่ spec ต้องแสดงภายใน 30 วันข้างหน้า ทั้งยังไม่มี test ตรวจ 30 วัน | แก้โค้ด |
| F-002 | ละเมิด Constraint | backend/app/booking/router.py:BookingRequest; backend/app/booking/router.py:create_booking | IF-HIS-01, DOM-PDPA-01 | รับ field `national_id` และ log `national_id` ลงใน request แม้ spec ระบุไม่เก็บเลขบัตรประชาชนในตารางการจอง และต้องเฝ้าระวังข้อมูลสุขภาพ | แก้โค้ด |
| F-003 | โค้ดไม่มี FR / test อ่อน | backend/app/booking/service.py:create_booking | FR-BKG-03, FR-BKG-04 | `if slot.remaining < 0` ให้จองได้แม้ `remaining == 0` จนเกิดการ overbooking; test ที่มีอยู่ไม่ครอบคลุมกรณีเต็ม | แก้โค้ด |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| - | - | ไม่มีข้อค้นพบเดิมใน RTM เดิมเพราะยังไม่มีไฟล์นี้ |
