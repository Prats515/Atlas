import sqlite3

def check_schema():
    conn = sqlite3.connect('atlas.db')
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE name='applications';")
    result = cursor.fetchone()
    if result:
        print(result[0])
    else:
        print("Table 'applications' not found.")
    conn.close()

if __name__ == "__main__":
    check_schema()
