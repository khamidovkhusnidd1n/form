import re

with open('src/pages/public/TrackApplicationPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_old = "import { StatusBadge } from '../../components/ui/Badge';"
import_new = "import { StatusBadge } from '../../components/ui/Badge';\nimport { QRCodeSVG } from 'qrcode.react';"
content = content.replace(import_old, import_new)

# Add QR Code display
qr_code_section = '''
            {result.status === 'approved' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2">Sizning QR-kod ruxsatnomangiz</h3>
                <p className="text-sm text-slate-500 mb-6">Ushbu QR-kodni telefoningizga saqlab oling yoki skrinshot qiling. Tadbirga kelganingizda uni mas'ul xodimga ko'rsating.</p>
                <div className="inline-block p-4 border-2 border-[#1a56db] rounded-2xl bg-white shadow-md">
                  <QRCodeSVG 
                    value={https://form.uzbamalaka.uz/admin/check-in/} 
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#1a56db"
                  />
                </div>
                <p className="mt-4 text-xs font-mono text-slate-400">{result.applicationId}</p>
              </div>
            )}
'''

content = content.replace("            {result.adminComment && (", qr_code_section + "\n            {result.adminComment && (")

with open('src/pages/public/TrackApplicationPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
