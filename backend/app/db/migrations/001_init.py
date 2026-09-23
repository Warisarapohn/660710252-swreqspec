from app.db.models import Base


# รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
def upgrade(engine) -> None:
    Base.metadata.create_all(bind=engine)
