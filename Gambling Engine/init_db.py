import psycopg2
import os
import time

def init_database():
    """
    Reads the schema.sql file and applies it to the specified database.
    """
    db_name = os.getenv("DB_NAME", "mlb_engine")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_user = os.getenv("DB_USER", "admin")
    db_pass = os.getenv("DB_PASS", "password123")

    print(f"Connecting to database {db_name} on {db_host}:{db_port}...")
    try:
        # Connect to default postgres to create our target DB if it doesn't exist
        conn = psycopg2.connect(
            host=db_host,
            database="postgres",
            user=db_user,
            password=db_pass,
            port=db_port
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cur.fetchone()
        if not exists:
            cur.execute(f"CREATE DATABASE {db_name}")
            print(f"Created database {db_name}")
        cur.close()
        conn.close()

        # Connect to the target DB and apply schema
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_pass,
            port=db_port
        )
        cur = conn.cursor()
        
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
            
        cur.execute(schema_sql)
        conn.commit()
        print(f"✅ Database {db_name} initialized successfully with schema.sql")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Failed to initialize database {db_name}: {e}")

if __name__ == "__main__":
    init_database()
