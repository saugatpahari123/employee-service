from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

<<<<<<< HEAD
DATABASE_URL = "postgresql://postgres:test1234!@localhost:5432/employees"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
=======
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Use SQLite for local/Docker testing if DATABASE_URL is not set
    DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
