import sqlite3

def get_all_schemas():
    conn = sqlite3.connect('atlas.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for table_name, schema in tables:
        print(f"--- {table_name} ---")
        print(schema)
        print()
    conn.close()

if __name__ == "__main__":
    get_all_schemas()
