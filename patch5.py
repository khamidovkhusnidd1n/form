import re

with open('src/pages/admin/ApplicationsPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r"\{app\.status === 'approved' && \(app as any\)\.certificate_pdf && \(\s*<a\s*href=\{\(app as any\)\.certificate_pdf\}\s*target=\"_blank\"\s*rel=\"noopener noreferrer\"\s*className=\"p\.1\.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors\"\s*title=\"Sertifikatni yuklash\"\s*>\s*<svg[^>]+><path[^>]+></path></svg>\s*</a>\s*\)\}", re.DOTALL)

# simpler approach, just find start and end
start_idx = text.find("{app.status === 'approved' && (app as any).certificate_pdf && (")
if start_idx != -1:
    end_idx = text.find("</a>\n                        )}", start_idx)
    if end_idx != -1:
        end_idx += len("</a>\n                        )}")
        
        new_btn = """{app.status === 'approved' && (
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
        
        text = text[:start_idx] + new_btn + text[end_idx:]
        with open('src/pages/admin/ApplicationsPage.tsx', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Patched successfully!")
    else:
        print("End not found")
else:
    print("Start not found")
