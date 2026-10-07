import re

with open('src/pages/cabinet/UserCabinet.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix defaultValues
text = text.replace('defaultValue={editingApp.fullName}', 'defaultValue={editingApp.full_name || editingApp.fullName}')
text = text.replace('defaultValue={editingApp.dateOfBirth}', 'defaultValue={editingApp.date_of_birth || editingApp.dateOfBirth}')
text = text.replace('defaultValue={editingApp.regionName}', 'defaultValue={editingApp.region || editingApp.regionName}')
text = text.replace('defaultValue={editingApp.districtName}', 'defaultValue={editingApp.district || editingApp.districtName}')

# Add state for missing certificate modal
if 'const [missingCertModal, setMissingCertModal] = useState(false);' not in text:
    text = text.replace('const [editingApp, setEditingApp] = useState<any | null>(null);', 'const [editingApp, setEditingApp] = useState<any | null>(null);\n  const [missingCertModal, setMissingCertModal] = useState(false);')

# Replace the certificate button
old_cert_btn = """                {app.status === 'approved' && app.certificate_pdf && (
                  <a href={app.certificate_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Sertifikatni yuklab olish
                  </a>
                )}"""

new_cert_btn = """                {app.status === 'approved' && (
                  app.certificate_pdf ? (
                    <a href={app.certificate_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      Sertifikatni yuklab olish
                    </a>
                  ) : (
                    <button onClick={() => setMissingCertModal(true)} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      Sertifikatni yuklab olish
                    </button>
                  )
                )}"""
text = text.replace(old_cert_btn, new_cert_btn)

# Add the missing certificate modal at the end of the file, before the last closing div
modal_code = """
      <Modal isOpen={missingCertModal} onClose={() => setMissingCertModal(false)} title="Ogohlantirish">
        <div className="py-6 text-center">
          <p className="text-slate-700 font-medium text-lg">
            Hali sertifikatlar kiritilmadi, iltimos kuting.
          </p>
          <button 
            onClick={() => setMissingCertModal(false)}
            className="mt-6 px-6 py-2 bg-[#1a56db] text-white font-medium rounded-xl hover:bg-blue-700"
          >
            Tushundim
          </button>
        </div>
      </Modal>
"""

if "Hali sertifikatlar kiritilmadi" not in text:
    text = text.replace('    </div>\n  );\n}\n', f'{modal_code}    </div>\n  );\n}}\n')

with open('src/pages/cabinet/UserCabinet.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("UserCabinet.tsx patched successfully.")
