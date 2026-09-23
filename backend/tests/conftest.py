import pytest
from sqlalchemy.orm import Session

from app.db.models import Base
from app.db.session import SessionLocal, engine


@pytest.fixture
def db_session() -> Session:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
