import base64
import os

with open('src/assets/logo.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

ts_content = f"export const logoBase64 = 'data:image/png;base64,{b64}';\n"
with open('src/assets/logo.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)
print("Created src/assets/logo.ts")
