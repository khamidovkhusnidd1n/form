import smtplib

host = "mail.umail.uz"
port = 587
user = "uzbamalakamarkaz@umail.uz"
password = "F_meB67mGwVU8T"

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
