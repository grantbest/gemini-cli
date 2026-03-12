import psycopg2
import os
import time

def init_database():
    """
    Reads the schema.sql file and applies it to the running PostgreSQL database.
    """
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database="mlb_engine",
            user="admin",
            password="password123"
        )
        cur = conn.cursor()
        
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
            
        cur.execute(schema_sql)
        conn.commit()
        print("✅ Database initialized successfully with schema.sql")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")

if __name__ == "__main__":
    init_database()