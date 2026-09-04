import re
import datetime

with open('src/pages/admin/UpdatesPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_update = '''
  {
    version: "v1.3.0",
    date: "4-Sentabr, 2026",
    sections: [
      {
        title: "Dizayn va Logotiplar",
        icon: Sparkles,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
        items: [
          "Tizim bo'ylab barcha eski logotiplar (Favicon, Sidebar va h.k.) yangi rasmiy logotipga almashtirildi.",
          "Platformaning hamma qismida 'CENTR FORM' nomi 'CENTRE FORM' qilib to'g'rilab chiqildi.",
          "Saytning dastlabki yuklanish jarayoniga (loading) oq ekran o'rniga aylanuvchi chiroyli animatsiya qo'shildi."
        ]
      },
      {
        title: "Administratorlar va Rollar",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bgColor: "bg-emerald-100",
        items: [
          "Super Adminlar endilikda boshqa Super Adminlarni ham bemalol tahrirlay olishi va o'chira olishi tizimga joriy qilindi.",
          "Moderator darajasidagi foydalanuvchilar uchun 'Administratorlar' va 'Sozlamalar' bo'limlari yashirildi. Ularga faqat tadbirlar va arizalar bilan ishlash muhiti qoldirildi.",
          "Arizalar bo'limiga yangi ariza kelib tushganda, Administratorlar menyusida vizual bildirishnoma (qizil pulsatsiya va soni) paydo bo'lishi qo'shildi."
        ]
      },
      {
        title: "Ma'lumotlar va Integratsiya",
        icon: Zap,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        items: [
          "Tizimga 'Ko'p so'raladigan savollar (FAQ)' bo'limi uchun 4 ta boshlang'ich muhim ma'lumotlar 3 xil tilda (O'zbek, Rus, Ingliz) kiritildi."
        ]
      }
    ]
  },'''

content = content.replace("const UPDATES = [", "const UPDATES = [" + new_update)

with open('src/pages/admin/UpdatesPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated UpdatesPage.tsx")
