import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add missingCertModal state
if 'const [missingCertModal, setMissingCertModal] = useState(false);' not in text:
    text = text.replace('const [bulkStatusModal, setBulkStatusModal] = useState(false);', 'const [bulkStatusModal, setBulkStatusModal] = useState(false);\n  const [missingCertModal, setMissingCertModal] = useState(false);')

# Replace certificate button
old_btn = """                        {app.status === 'approved' && (app as any).certificate_pdf && (
                          <a 
                            href={(app as any).certificate_pdf} 
                            target="_blank" 
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" 
                            title="Sertifikatni yuklash"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          </a>
                        )}"""

new_btn = """                        {app.status === 'approved' && (
                          (app as any).certificate_pdf ? (
                            <a 
                              href={(app as any).certificate_pdf} 
                              target="_blank" 
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" 
                              title="Sertifikatni yuklash"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </a>
                          ) : (
                            <button 
                              onClick={() => setMissingCertModal(true)} 
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors" 
                              title="Sertifikatni yuklash"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </button>
                          )
                        )}"""

text = text.replace(old_btn, new_btn)

# Add modal
modal_code = """
        {/* Missing Cert Modal */}
        <Modal open={missingCertModal} onClose={() => setMissingCertModal(false)} title="Ogohlantirish" size="sm">
          <div className="py-6 text-center">
            <p className="text-slate-700 font-medium text-lg mb-6">
              Hali sertifikatlar kiritilmadi, iltimos kuting.
            </p>
            <Button onClick={() => setMissingCertModal(false)} className="mx-auto flex justify-center !px-8">
              Tushundim
            </Button>
          </div>
        </Modal>
"""

if "Hali sertifikatlar kiritilmadi" not in text:
    text = text.replace('      </div>\n    </AdminLayout>\n  );\n}\n', f'{modal_code}      </div>\n    </AdminLayout>\n  );\n}}\n')

with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("ApplicationsPage.tsx patched successfully.")
