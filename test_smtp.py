import os
import smtplib

host = os.environ.get("EMAIL_HOST", "mail.umail.uz")
port = int(os.environ.get("EMAIL_PORT", 587))
user = os.environ.get("EMAIL_HOST_USER", "uzbamalakamarkaz@umail.uz")
password = os.environ.get("EMAIL_HOST_PASSWORD", "")

if not password:
    print("EMAIL_HOST_PASSWORD muhit o'zgaruvchisi o'rnatilmagan.")
    exit(1)

try:
    print(f"Connecting to {host}:{port}...")
    server = smtplib.SMTP(host, port, timeout=5)
    server.ehlo()
    server.starttls()
    server.login(user, password)
    print("Login successful!")
    server.quit()
except Exception as e:
    print("Error:", e)

