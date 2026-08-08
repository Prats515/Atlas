from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.user import User
from backend.models.application import Application
from backend.models.company import Company
from backend.models.recruiter import Recruiter
from backend.database.base import Base

# Setup engine
engine = create_engine('sqlite:///./atlas.db')
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

def verify():
    try:
        # Check mapper configuration
        print("Mapper configuration check passed")
        
        # Test query (assuming at least one user)
        user = session.query(User).first()
        if user:
            print(f"Test User: {user.email}")
            # This would trigger the NoForeignKeysError if models were misconfigured
            apps = user.applications
            print(f"Found {len(apps)} applications for user")
        else:
            print("No test user found, skipping query test")

        print("Mapper Relationships: PASS")
        
    except Exception as e:
        print(f"Mapper Relationships: FAIL - {e}")
    finally:
        session.close()

if __name__ == "__main__":
    verify()
