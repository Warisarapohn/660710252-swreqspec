# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Slot
from tests.conftest import AUTH


def test_AC_BKG_01(client, make_slot):
    """AC-BKG-01: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง จองแล้วต้องสำเร็จ"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201


def test_TC_BKG_01_1_booking_success(client, make_slot, db):
    # Given ผู้ใช้ยืนยันตัวตนแล้ว และช่วง 09.00 น. ของวันถัดไปมีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1, days_from_today=1)

    # When ผู้ใช้ยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then บันทึกสำเร็จ; แสดงหมายเลขคิว (รอ Q-02); ที่นั่งว่างของช่วงนั้นเป็น 0
    assert res.status_code == 201
    body = res.json()
    assert "queue_no" in body
    assert body["queue_no"]
    assert db.get(Slot, slot.id).remaining == 0


def test_TC_BKG_01_2_exact_one_slot_remaining(client, make_slot, db):
    # Given ผู้ใช้ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่างพอดี 1 ที่เท่านั้นก่อนยืนยัน
    slot = make_slot(start="09:00", remaining=1, days_from_today=1)

    # When ผู้ใช้ยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then บันทึกสำเร็จ; แสดงหมายเลขคิว (รอ Q-02); ที่นั่งว่างของช่วงนั้นลดจาก 1 เป็น 0
    assert res.status_code == 201
    assert "queue_no" in res.json()
    assert db.get(Slot, slot.id).remaining == 0


def test_TC_BKG_01_3_unverified_user_rejected(client, make_slot, db):
    # Given ผู้ใช้ยังไม่ได้ยืนยันตัวตน และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1, days_from_today=1)

    # When ผู้ใช้พยายามยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then ระบบปฏิเสธการจองและไม่บันทึก (spec ไม่ได้บอก)
    assert res.status_code == 401
    assert db.get(Slot, slot.id).remaining == 1
