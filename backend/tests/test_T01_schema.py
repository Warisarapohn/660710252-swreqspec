from sqlalchemy import inspect

from app.db.models import AuditLog, Base, Booking, Slot
from app.db.session import engine, init_db


init_db()


def test_schema_has_required_booking_tables_and_columns():
    inspector = inspect(engine)

    assert "slots" in inspector.get_table_names()
    assert "bookings" in inspector.get_table_names()
    assert "audit_logs" in inspector.get_table_names()

    slot_columns = {col["name"] for col in inspector.get_columns("slots")}
    booking_columns = {col["name"] for col in inspector.get_columns("bookings")}
    audit_columns = {col["name"] for col in inspector.get_columns("audit_logs")}

    assert {"id", "slot_date", "start_time", "package_code", "capacity", "remaining"}.issubset(slot_columns)
    assert {"id", "hn", "slot_id", "booking_date", "queue_no", "status", "created_at"}.issubset(booking_columns)
    assert {"id", "actor_id", "action", "hn", "accessed_at"}.issubset(audit_columns)
    assert "national_id" not in booking_columns


def test_schema_supports_constraint_requirements():
    booking_model = Booking.__table__
    slot_model = Slot.__table__
    audit_model = AuditLog.__table__

    assert booking_model.c.hn is not None
    assert booking_model.c.slot_id is not None
    assert slot_model.c.capacity is not None
    assert slot_model.c.remaining is not None
    assert audit_model.c.actor_id is not None
    assert audit_model.c.accessed_at is not None
