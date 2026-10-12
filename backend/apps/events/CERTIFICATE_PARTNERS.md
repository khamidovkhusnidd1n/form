# Tadbir sertifikatlari

Serverga chiqarishdan oldin yangi jadvalni yarating:

```sh
python manage.py migrate events
```

Admin → Tadbirlar → Qo‘shish / Tahrirlash → Sertifikat hamkorlari:
hamkor nomini kiriting, PNG/JPEG/WebP logosini yuklang va tartibini tanlang.
Har bir logo 5 MB gacha, tadbirda 12 tagacha hamkor bo‘lishi mumkin.
Markaz logosi ham kerakli tadbirga hamkor/tashkilotchi sifatida qo‘shiladi.

Saqlangan tadbirda sertifikat namunasi PDF shaklida yuklanadi. Namuna haqiqiy
sertifikat bermaydi. Yangi sertifikatlar aynan shu tadbirning logolarini oladi.
Avval berilgan PDF sertifikatlar qayta yozilmaydi.

API multipart create/update: `partner_data` JSON ro‘yxati (`id`, `name`),
rasmlar `partner_logo_0`, `partner_logo_1`, ... maydonlarida yuboriladi.
Ro‘yxat berilmasa hamkorlar saqlanadi; bo‘sh ro‘yxat ularni olib tashlaydi.
Mavjud hamkor IDsi faqat o‘z tadbiri ichida qabul qilinadi.
Preview: `GET /api/v1/events/admin/{id}/certificate-preview/` (admin/moderator).

Tekshiruv: `python manage.py test apps.events.test_partners`.
