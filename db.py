import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    conn = pymysql.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DB"),
        charset="utf8mb4"
    )
    return conn

if __name__ == "__main__":
    try:
        db = get_db_connection()
        print("数据库连接成功！")
        db.close()
    except Exception as e:
        print("数据库连接失败：", e)
