import sqlite3

db_path = "aether.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Attempting to add project_id column to datasets table...")
    cursor.execute("ALTER TABLE datasets ADD COLUMN project_id INTEGER")
    conn.commit()
    print("Successfully added project_id column.")
    
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column project_id already exists.")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
finally:
    if conn:
        conn.close()
