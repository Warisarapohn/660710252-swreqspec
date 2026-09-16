# แผนงาน: จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง
การทำฟีเจอร์นี้จะเริ่มจากการแสดงช่วงเวลาและจำนวนที่นั่งคงเหลือให้ผู้รับบริการเห็นก่อนเลือกคิว จากนั้นจะตรวจสอบว่าผู้รับบริการมีคิวที่ยังไม่ได้ใช้ในวันเดียวกันหรือไม่ และเมื่อยืนยันการจอง จะบันทึกการจอง ตัดจำนวนที่นั่ง และสร้างหมายเลขคิวแบบรีเซ็ตทุกวัน ระบบจะส่งข้อความยืนยันแบบ asynchronous ผ่านคิวแจ้งเตือน และพยายามส่งซ้ำได้สูงสุด 3 ครั้ง พร้อมบันทึก audit log ทุกครั้งที่เข้าถึงข้อมูลการจอง

ฟีเจอร์นี้ตอบสนองต่อผู้รับบริการที่ยืนยันตัวตนแล้ว และกำหนดให้มีความเร็วสำหรับการค้นหาช่วงว่างภายใน 2 วินาทีที่ผู้ใช้พร้อมกัน 200 คน โดยไม่รวมเรื่องยกเลิก/เลื่อนคิวและการจัดการโควตาเข้าสู่ขอบเขตของฟีเจอร์นี้

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| MySQL | CON-TECH-01 | ใช้ตามมาตรฐานฝ่าย IT ของโรงพยาบาล |
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | สำหรับหน้าจอเลือกแพ็กเกจ วัน และช่วงเวลา |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | สำหรับ API จองคิว การคำนวณเวลาและคิว |
| Background worker / queue | IF-NOT-01, ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้สำหรับส่งข้อความยืนยันแบบ asynchronous และ retry 3 ครั้ง |
| Redis หรือ message broker ที่มีอยู่แล้ว | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เป็นคิวส่งข้อความยืนยัน หากทีมมีสภาพแวดล้อมที่เหมาะสม |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | ใช้รองรับ FR/Constraint |
|---|---|---|
| UserProfile | HN, verified_at, identity_status | IF-IDP-01, FR-BKG-02, FR-BKG-04 |
| Package | package_id, name, duration, active_flag | FR-BKG-01, FR-BKG-06 |
| BookingSlot | slot_date, start_time, end_time, quota, remaining_seats, package_id | FR-BKG-01, FR-BKG-03, FR-BKG-04, NFR-PERF-01 |
| Booking | booking_id, HN, package_id, slot_date, slot_time, queue_no, status, created_at, confirmed_at | FR-BKG-02, FR-BKG-04, FR-BKG-05, AC-BKG-01 ถึง AC-BKG-04 |
| BookingAuditLog | booking_id, actor_user_id, accessed_at, target_hn, action | DOM-PDPA-01, AC-BKG-06 |
| NotificationOutbox | booking_id, channel, payload, status, retry_count, scheduled_at, last_error | FR-BKG-05, NFR-REL-02, IF-NOT-01 |

หมายเหตุสำคัญ:
- ไม่เก็บเลขบัตรประชาชนในตารางการจอง ตาม IF-HIS-01
- จะเก็บข้อมูล HN เท่านั้นเพื่ออ้างอิงกับ HIS
- ระบบจะใช้ slot_date + slot_time เป็นคีย์หลักในการตรวจความเต็มของช่วงเวลา
- queue_no จะเริ่มนับใหม่ทุกวันตาม ASM-03

## 4. API / หน้าจอ

### หน้าจอ
- หน้ารายการแพ็กเกจ: เลือกแพ็กเกจก่อนทำการจอง
- หน้ารายการวันและช่วงเวลา: แสดงวันภายใน 30 วัน พร้อมที่นั่งคงเหลือ
- หน้าตรวจสอบก่อนยืนยัน: แสดงคิวเดิมหากมีคิวที่ยังไม่ได้ใช้, หรือแสดง “ช่วงเวลาเต็ม” และตัวเลือกใกล้เคียง
- หน้าผลการจอง: แสดงหมายเลขคิวและสถานะส่งข้อความยืนยัน

### API
| Method | Path | Input / Output หลัก | รองรับ |
|---|---|---|---|
| GET | /api/booking/slots | packageId, fromDate, toDate | FR-BKG-01 |
| GET | /api/booking/availability | packageId, date, timeSlot | FR-BKG-01, FR-BKG-06 |
| POST | /api/booking/check-duplicate | HN, bookingDate | FR-BKG-02 |
| POST | /api/booking/confirm | HN, packageId, bookingDate, slotId | FR-BKG-03, FR-BKG-04, FR-BKG-05 |
| POST | /api/booking/notifications/retry | bookingId | FR-BKG-05, NFR-REL-02 |
| GET | /api/booking/audit-log | bookingId | DOM-PDPA-01 |

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | MySQL เป็นฐานข้อมูลหลักสำหรับ Booking, Slot, AuditLog, Outbox | ใช้แล้ว |
| DOM-PDPA-01 | BookingAuditLog และบันทึกการเข้าถึงข้อมูลสุขภาพทุกครั้ง | ใช้แล้ว |
| IF-IDP-01 | UserProfile หรือ Booking API ตรวจว่า identity_verified = true ก่อนเปิดฟีเจอร์ | ใช้แล้ว |
| IF-HIS-01 | Booking เก็บ HN เท่านั้น ไม่เก็บเลขบัตรประชาชน และอ้างอิงข้อมูลผู้รับบริการจาก HIS | ใช้แล้ว |
| IF-NOT-01 | NotificationOutbox + background worker เพื่อส่ง SMS/LINE แบบ asynchronous | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | test_AC_BKG_01_success_booking_reduces_remaining_seats | เลียนแบบช่วง 09.00 มีที่นั่ง 1 ที่ แล้วยืนยันการจอง ให้ตรวจว่ารายการถูกบันทึก หมายเลขคิวแสดง และ remaining_seats เป็น 0 |
| AC-BKG-02 | test_AC_BKG_02_duplicate_booking_blocked | ให้ผู้รับบริการที่มีคิวที่ยังไม่ได้ใช้ในวันเดียวกันพยายามจองใหม่ ต้องปฏิเสธและแสดงหมายเลขคิวเดิม |
| AC-BKG-03 | test_AC_BKG_03_slot_full_recommend_alternatives | ปลอมสถานะว่าช่วงเวลาที่เลือกเต็ม และมีผู้ใช้อีกคนยืนยันก่อน ให้ตรวจว่าระบบแจ้ง “ช่วงเวลาเต็ม” และแสดง 3 ตัวเลือกล่าสุด |
| AC-BKG-04 | test_AC_BKG_04_message_retry_queue_keeps_booking | จำลอง SMS/LINE ไม่ตอบสนอง ให้ตรวจว่าการจองยังถูกบันทึก แสดงหมายเลขคิว และมีรายการใน outbox ที่กำหนดส่งภายใน 5 นาที เฉพาะ 3 ครั้ง |
| AC-BKG-05 | test_AC_BKG_05_slot_lookup_p95_under_2s | ใช้ load test 200 concurrent users ไปที่ GET /api/booking/slots และวัด p95 <= 2 วินาที |
| AC-BKG-06 | test_AC_BKG_06_audit_log_written | จำลองการเปิดดูข้อมูลการจอง แล้วตรวจว่ามี audit log ที่บันทึก actor, time และ HN |

## 7. ลำดับงาน

1. สร้าง schema และ migration สำหรับ Booking, Slot, NotificationOutbox, AuditLog ตามข้อมูลที่รองรับ FR-BKG-01 ถึง FR-BKG-05 และ ASM-03
2. สร้าง API แสดงช่วงเวลาและจำนวนที่นั่งคงเหลือภายใน 30 วัน พร้อม cache/query optimization สำหรับ NFR-PERF-01
3. สร้างเงื่อนไขป้องกันการจองซ้ำในวันเดียวกันสำหรับ FR-BKG-02 และตรวจสอบคิวที่ยังไม่ได้ใช้
4. สร้าง flow ยืนยันการจอง เพื่อบันทึก booking, ลด remaining_seats และสร้าง queue_no ต่อวันตาม ASM-03
5. สร้างรหัสจัดการช่วงเวลาที่เต็มและแนะนำ 3 ตัวเลือกใกล้เคียงสำหรับ FR-BKG-03 และ AC-BKG-03
6. สร้าง notification outbox และ background worker สำหรับส่ง SMS/LINE แบบ asynchronous พร้อม retry 3 ครั้ง ตาม FR-BKG-05 และ NFR-REL-02
7. เพิ่ม audit log สำหรับทุกการเข้าถึงข้อมูลการจองตาม DOM-PDPA-01 และตรวจสอบ AC-BKG-06
8. ทดสอบ end-to-end สำหรับทุก AC และตรวจสอบประสิทธิภาพและความปลอดภัยก่อนยอมรับฟีเจอร์

## 8. สิ่งที่ยังไม่ทำ
- Q-01: "ช่วงเวลาใกล้เคียง" นับเฉพาะวันเดียวกัน หรือรวมวันถัดไปด้วย? -> ยังไม่สร้าง logic ที่เลือกวันถัดไปจนกว่าจะได้คำตอบจากพยาบาลคัดกรอง

ส่วนที่เกี่ยวข้องกับ Q-01 จะยังไม่สร้างจนกว่าจะได้รับคำตอบจากทีมก่อนทำงานในช่วงนี้
