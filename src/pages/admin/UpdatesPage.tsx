import { Clock, ShieldCheck, Sparkles, CheckCircle2, Zap } from 'lucide-react';

const UPDATES = [
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
  },
  {
    version: "v1.2.0",
    date: "27-Avgust, 2026",
    sections: [
      {
        title: "Dizayn va Qulayliklar",
        icon: Sparkles,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
        items: [
          "Bosh sahifadagi Navbar logotipi va yozuvlari Markazning asosiy sayti (uzbamalaka.uz) bilan to'liq bir xil ko'rinishga keltirildi (yozuvlar ixcham 4 qatorga ajratildi).",
          "Saytning ishlash tezligi keskin oshirildi: sahifalar yuklanishi va arizalarni yuborishdagi sun'iy animatsiya (timeout) kutish vaqtlari olib tashlandi.",
          "Bosh sahifadagi '0% tasdiqlangan' qismi arizalar mavjud bo'lmagan paytda 100% deb chiroyli namoyish etilishi sozlangan."
        ]
      },
      {
        title: "Administrator bo'limi (Admin Panel)",
        icon: Clock,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        items: [
          "Arizalar ro'yxati oynasida bir nechta arizalarni birato'la belgilab (Guruhlab / Bulk) holatini o'zgartirish qulayligi qo'shildi.",
          "Ko'plab arizalarni birdaniga o'chirish jarayonida yuzaga keladigan server xatosi (Nginx DELETE body xatosi) to'liq tuzatildi.",
          "Endi 'Moderator' darajasidagi adminlar ham tadbirlar yaratishi, tahrirlashi va o'chirishi mumkin (Bu huquq oldin faqat Super Adminlarda edi)."
        ]
      },
      {
        title: "Xavfsizlik va Barqarorlik",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bgColor: "bg-emerald-100",
        items: [
          "Ariza yuborish sahifasiga Matematik Captcha kiritildi. Endilikda tizim turli xil spam botlardan to'liq himoyalangan.",
          "Tizimning asosiy ma'lumotlar bazasi (db.sqlite3) cPanel'da yuzaga keladigan Git versiyalari to'qnashuvidan ajratildi. Endi kod yangilanganda baza aslo o'chib ketmaydi va xavfsiz saqlanadi.",
          "Foydalanuvchi arizasi 'Tasdiqlandi' yoki 'Rad etildi' holatiga o'tkazilganda uning elektron pochtasiga avtomatik ravishda bildirishnoma (Email) ketishi to'liq yo'lga qo'yildi."
        ]
      }
    ]
  }
];

export default function UpdatesPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">So'nggi yangilanishlar</h1>
        <p className="text-slate-500 mt-1">Platformada amalga oshirilgan eng so'nggi texnik va dizayn o'zgarishlari bilan tanishing.</p>
      </div>

      <div className="space-y-8">
        {UPDATES.map((update, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-[#1a56db] text-white text-sm font-bold px-3 py-1 rounded-full">
                  {update.version}
                </span>
                <span className="text-slate-500 font-medium">
                  {update.date}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {update.sections.map((section, sIdx) => {
                const Icon = section.icon;
                return (
                  <div key={sIdx}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl ${section.bgColor}`}>
                        <Icon className={`w-5 h-5 ${section.color}`} />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-lg">{section.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {section.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex gap-3 text-slate-600">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Zap className="w-4 h-4" /> Barcha tizimlar muammosiz ishlamoqda.
      </div>
    </div>
  );
}
