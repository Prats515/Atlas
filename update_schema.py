import sqlite3
conn = sqlite3.connect('atlas.db')
cursor = conn.cursor()
cursor.execute("ALTER TABLE applications ADD COLUMN company_id INTEGER REFERENCES companies(id);")
cursor.execute("ALTER TABLE applications ADD COLUMN recruiter_id INTEGER REFERENCES recruiters(id);")
conn.commit()
conn.close()
print("Schema updated successfully")
