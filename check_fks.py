import sqlite3
conn = sqlite3.connect('atlas.db')
cursor = conn.cursor()
cursor.execute("PRAGMA foreign_key_list(applications);")
print(cursor.fetchall())
conn.close()
