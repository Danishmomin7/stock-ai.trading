"""
Database initialization script
Run this once to set up the database with tables and a default user
"""
from database import init_db, SessionLocal
from models.database_models import User, Portfolio
from sqlalchemy.orm import Session
import os


def create_default_user():
    """Create a default demo user"""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "demo").first()
        if existing_user:
            print("Demo user already exists!")
            return

        # Create default user
        demo_user = User(
            username="demo",
            email="demo@stockai.com",
            password_hash="hashed_password_here"  # In production, use proper hashing
        )
        db.add(demo_user)
        db.flush()

        # Create portfolio for user
        portfolio = Portfolio(
            user_id=demo_user.id,
            cash=100000.0,
            total_value=100000.0
        )
        db.add(portfolio)
        db.commit()

        print("✅ Demo user created successfully!")
        print(f"   Username: demo")
        print(f"   Email: demo@stockai.com")
        print(f"   Initial Cash: $100,000")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("🗄️  Initializing database...")
    init_db()
    print("✅ Tables created!")
    
    print("\n👤 Creating demo user...")
    create_default_user()
    
    print("\n✅ Database setup complete!")
    print("\nDatabase file: stock_ai.db (SQLite)")
    print("To use PostgreSQL, set DATABASE_URL environment variable:")
    print("  export DATABASE_URL='postgresql+psycopg2://user:password@localhost:5432/stock_ai'")
