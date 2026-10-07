import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_btn = """                        {app.status === 'approved' && (app as any).certificate_pdf && (
                          <a 
                            href={(app as any).certificate_pdf} 
                            target="_blank" 
                            rel="noopener noreferrer" 
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
                              rel="noopener noreferrer" 
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

if old_btn in text:
    text = text.replace(old_btn, new_btn)
    with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("ApplicationsPage.tsx patched successfully.")
else:
    print("Could not find the target string in ApplicationsPage.tsx")
