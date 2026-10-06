# "Markaz Form" Loyiha Tahlili va Arxitektura Xulosasi

## 1. Loyihaning umumiy maqsadi

Ushbu loyiha O'zbekiston Badiiy akademiyasi huzuridagi markaz tomonidan tashkil etiladigan xalqaro konferensiyalar, forumlar va tadbirlarga onlayn ariza qabul qilish, ishtirokchilarni boshqarish va ularga raqamli sertifikatlar taqdim etish uchun mo'ljallangan avtomatlashtirilgan web-platformadir.

Asosiy maqsad:
- Tadbirlarga qatnashish uchun jismoniy va onlayn arizalarni qabul qilish.
- Ishtirokchilarni elektron pochta va OTP orqali ro'yxatdan o'tkazish hamda xavfsiz autentifikatsiya (Shaxsiy Kabinet) tizimini ta'minlash.
- Arizalarni admin panel orqali ko'rib chiqish va tasdiqlash.
- Tasdiqlangan ishtirokchilar uchun avtomatik tarzda QR-kodli raqamli sertifikatlar (PDF) generatsiya qilish.
- Jamoatchilik uchun sertifikatlarning haqiqiyligini tekshirish sahifasini taqdim etish.

---

## 2. Metodologiya va Yondashuvlar

Loyiha mavjud legacy (eski) tizimni buzmagan holda zamonaviy **Modular** va **Service-oriented** (Xizmatlarga asoslangan) yondashuvlar bilan kengaytirildi:

- **Django + DRF** – Backend API ni xavfsiz va tezkor boshqarish.
- **React + TypeScript + Vite** – SPA (Single Page Application) asosidagi qulay interfeys (Frontend).
- **Service Layer Pattern** – Murakkab biznes logikalarni (masalan, PDF chizish va QR yaratish) API View lardan ajratib, alohida services.py qatlamida saqlash.
- **Security-First Approach** – Barcha ma'lumotlar o'zgarishi va shaxsiy kabinet so'rovlari JWT token va 
equest.user orqali tasdiqlanishi, Insecure Direct Object Reference (IDOR) zaifliklarining oldi olinishi.
- **Throttling (Rate Limiting)** – DDOS va Brute-force hujumlaridan himoyalanish uchun ro'yxatdan o'tish va tizimga kirish API lariga vaqt cheklovlari (sekundomer) qo'yilishi.
- **Transactional Integrity** – Database tranzaksiyalari orqali arizani tasdiqlash va sertifikat yaratish jarayonini bitta uzluksiz zanjirda ishlashi (xatolik bo'lsa orqaga qaytishi).

---

## 3. Sayt Strukturasi

### Frontend Asosiy Bo'limlar
- **Ommaviy sahifalar:**
  - Bosh sahifa va Tadbirlar ro'yxati.
  - Ariza topshirish (Foydalanuvchi tizimga kirgan bo'lishi shart, aks holda AuthModal ochiladi).
  - Sertifikatning holatini tekshirish (/certificate-check).
  - Eski 6-xonali ID orqali ariza holatini kuzatish (Backward compatibility).
- **Foydalanuvchi qismi (Shaxsiy Kabinet):**
  - Email va OTP orqali Ro'yxatdan o'tish va Login (Qalqib chiquvchi Modal yordamida).
  - Mening arizalarim (Faqat o'ziga tegishli arizalarni ko'rish va sertifikatni yuklash).
- **Admin/Management:**
  - Arizalarni boshqarish, holatini o'zgartirish (Tasdiqlash, Bekor qilish).
  - Arizalar ro'yxatidan to'g'ridan-to'g'ri tayyor Sertifikatni yuklab olish (Yashil tugma).
  - Tadbirlar va Tizim sozlamalarini boshqarish.

### Backend Asosiy Modullari (Apps)
- ccounts – Adminlar va Ishtirokchilar (Participant) rollari, OTP, ro'yxatdan o'tish va JWT boshqaruvi.
- pplications – Arizalarni qabul qilish, fayllar formati va hajmini tekshirish, shaxsiy arizalarni filtrlash (me/ endpoint).
- certificates – QR kod va PDF yaratish logikasi, sertifikat haqiqiyligini jamoatchilik uchun tasdiqlash (erify/ endpoint).

---

## 4. Texnologiyalar Stack-i

**Backend:**
- Python 3.12
- Django 5.x
- Django REST Framework (DRF) + SimpleJWT
- SQLite (DB)
- **ReportLab** va **Pillow** (PDF chizish va shriftlarni ulash uchun)
- **qrcode** (QR kod generatsiyasi)

**Frontend:**
- React 18/19
- TypeScript
- Vite 5/6
- Tailwind CSS (Stil va Dizayn)
- React Hook Form + Zod (Forma validatsiyasi)
- Lucide React (Ikonkalar)

---

## 5. Arxitektura (Backend)

Backend qat'iy tartibda quyidagi qatlamlarga bo'lingan:

1. **API View Layer (iews.py)** – Faqat tashqi so'rovlarni qabul qiladi, ruxsatlarni (Permissions) tekshiradi va natijani JSON qilib qaytaradi.
2. **Serializer Layer (serializers.py)** – Ma'lumotlarni validatsiya qiladi (masalan fayl 10 MB dan oshmasligi, .pdf/.docx bo'lishi).
3. **Service Layer (services.py)** – Eng asosiy qatlam. Masalan, certificates/services.py ichidagi generate_certificate() funksiyasi. Bu funksiya orqa fonda bo'sh PDF shablonni oladi, unga shriftlarni yuklaydi, foydalanuvchi ismi va QR kodni aniq koordinatalar bo'yicha bosib chiqaradi.
4. **Signal / Transaction Layer** – Ariza statusi pproved bo'lganda, tranzaksiya ichida avtomatik Sertifikat yaratilishini ta'minlaydi. 

---

## 6. Xavfsizlik va Himoya (Security)

Loyihada kiberxavfsizlik (Cybersecurity) eng yuqori darajada hisobga olingan:
- **Predictable ID Himoyasi:** Sertifikatlar 1, 2, 3 kabi ketma-ket raqamlar bilan emas, balki UUIDv4 (36 xonali tasodifiy string) bilan himoyalangan. Begona shaxs birovning QR kodini topa olmaydi.
- **IDOR (Insecure Direct Object Reference) Himoyasi:** Kabinetga kirilganda API hech qanday User ID so'ramaydi. Tizim to'g'ridan-to'g'ri yashirin JWT tokendagi 
equest.user ni o'qiydi va faqat uning o'ziga tegishli ma'lumotlarni beradi.
- **Brute-Force Protection:** Django REST Framework orqali ScopedRateThrottle ulanib, ro'yxatdan o'tish (soatiga 10 ta) va login qilish (soatiga 20 ta) sun'iy chegaralangan.
- **SQL Injection va XSS:** Django ORM va React JSX orqali avtomatik himoyalangan.

---

## 7. Xulosa
Markaz form loyihasi endilikda faqatgina "ariza qabul qilish" sayti emas, balki to'liq avtomatlashtirilgan, xavfsiz va o'zini-o'zi boshqaruvchi **Portalga** aylantirildi. Kod bazasi toza (Clean Code), keyinchalik kattalashtirish (Scale qilish) ga to'liq mos holatga keltirildi.
