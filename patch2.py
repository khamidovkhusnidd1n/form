import re

with open('src/pages/cabinet/UserCabinet.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="F.I.SH (Ism familiya)" 
                defaultValue={editingApp.fullName}
                onChange={(e) => setEditData({...editData, full_name: e.target.value})} 
              />
              <Input 
                label="Tug'ilgan sana" 
                type="date"
                defaultValue={editingApp.dateOfBirth}
                onChange={(e) => setEditData({...editData, date_of_birth: e.target.value})} 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Jinsi</label>
                <select 
                  defaultValue={editingApp.gender}
                  onChange={(e) => setEditData({...editData, gender: e.target.value})}
                  className="w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm border-slate-200 outline-none focus:border-[#1a56db]"
                >
                  <option value="male">Erkak</option>
                  <option value="female">Ayol</option>
                </select>
              </div>
              <Input 
                label="Telefon raqami" 
                defaultValue={editingApp.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})} 
              />
              <Input 
                label="Email" 
                type="email"
                defaultValue={editingApp.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})} 
              />
              <Input 
                label="Tashkilot" 
                defaultValue={editingApp.organization}
                onChange={(e) => setEditData({...editData, organization: e.target.value})} 
              />
              <Input 
                label="Lavozim" 
                defaultValue={editingApp.position}
                onChange={(e) => setEditData({...editData, position: e.target.value})} 
              />
              <Input 
                label="Davlat" 
                defaultValue={editingApp.country}
                onChange={(e) => setEditData({...editData, country: e.target.value})} 
              />
              <Input 
                label="Viloyat" 
                defaultValue={editingApp.regionName}
                onChange={(e) => setEditData({...editData, region: e.target.value})} 
              />
              <Input 
                label="Tuman/Shahar" 
                defaultValue={editingApp.districtName}
                onChange={(e) => setEditData({...editData, district: e.target.value})} 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Ishtirok etish shakli</label>
                <select 
                  defaultValue={editingApp.attendance_type || editingApp.attendanceType}
                  onChange={(e) => setEditData({...editData, attendance_type: e.target.value})}
                  className="w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm border-slate-200 outline-none focus:border-[#1a56db]"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Input 
                  label="Maqola mavzusi" 
                  defaultValue={editingApp.presentation_title || editingApp.presentationTitle}
                  onChange={(e) => setEditData({...editData, presentation_title: e.target.value})} 
                />
              </div>
              <div className="md:col-span-2">
                <Textarea 
                  label="Annotatsiya (Abstract)" 
                  defaultValue={editingApp.abstract}
                  onChange={(e) => setEditData({...editData, abstract: e.target.value})} 
                  rows={4}
                />
              </div>
            </div>
"""

# Find where inputs start
start_marker = """<Input \n              label="F.I.SH"""
end_marker = """<Textarea \n              label="Annotatsiya"""

start_idx = text.find('<Input \n              label="F.I.SH')
end_idx = text.find('<div className="space-y-3 pt-2">\n              <label className="block text-sm font-medium text-slate-700">Maqola fayli')

if start_idx != -1 and end_idx != -1:
    new_text = text[:start_idx] + replacement + text[end_idx:]
    with open('src/pages/cabinet/UserCabinet.tsx', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Replaced successfully")
else:
    print("Not found")
