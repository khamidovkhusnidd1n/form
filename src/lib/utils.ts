import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Language } from '../i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, lang: Language = 'uz'): string {
  if (!dateStr) return '';
  const localeMap: Record<Language, string> = {
    uz: 'uz-UZ',
    ru: 'ru-RU',
    en: 'en-US',
  };
  try {
    return new Date(dateStr).toLocaleDateString(localeMap[lang] || 'uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string, lang: Language = 'uz'): string {
  if (!dateStr) return '';
  const localeMap: Record<Language, string> = {
    uz: 'uz-UZ',
    ru: 'ru-RU',
    en: 'en-US',
  };
  try {
    return new Date(dateStr).toLocaleDateString(localeMap[lang] || 'uz-UZ');
  } catch {
    return dateStr;
  }
}

export function generateApplicationId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `CF-${year}-${num}`;
}

export const EVENT_TYPE_LABELS: Record<Language, Record<string, string>> = {
  uz: {
    conference: "Konferensiya",
    forum: "Forum",
    exhibition: "Ko'rgazma",
    symposium: "Simpozium",
    workshop: "Seminar-trening",
    seminar: "Seminar",
    article_call: "Ilmiy jurnal (maqola/tezis qabuli)",
  },
  en: {
    conference: "Conference",
    forum: "Forum",
    exhibition: "Exhibition",
    symposium: "Symposium",
    workshop: "Workshop",
    seminar: "Seminar",
    article_call: "Scientific Journal (Article/Abstract Call)",
  },
  ru: {
    conference: "Конференция",
    forum: "Форум",
    exhibition: "Выставка",
    symposium: "Симпозиум",
    workshop: "Семинар-тренинг",
    seminar: "Семинар",
    article_call: "Научный журнал (прием статей/тезисов)",
  },
};

export function getEventTypeLabel(type: string, lang: Language = 'uz'): string {
  return EVENT_TYPE_LABELS[lang]?.[type] || EVENT_TYPE_LABELS.uz[type] || type;
}

export const EVENT_STATUS_LABELS: Record<Language, Record<string, string>> = {
  uz: {
    planned: "Rejalashtirilgan",
    ongoing: "Jarayonda",
    completed: "Yakunlangan",
  },
  en: {
    planned: "Planned",
    ongoing: "Ongoing",
    completed: "Completed",
  },
  ru: {
    planned: "Запланировано",
    ongoing: "В процессе",
    completed: "Завершено",
  },
};

export function getEventStatusLabel(status: string, lang: Language = 'uz'): string {
  return EVENT_STATUS_LABELS[lang]?.[status] || EVENT_STATUS_LABELS.uz[status] || status;
}

export const APPLICATION_STATUS_LABELS: Record<Language, Record<string, string>> = {
  uz: {
    submitted: "Yuborildi",
    under_review: "Ko'rib chiqilmoqda",
    info_required: "Qo'shimcha ma'lumot kerak",
    approved: "Tasdiqlandi",
    rejected: "Rad etildi",
  },
  en: {
    submitted: "Submitted",
    under_review: "Under Review",
    info_required: "Info Required",
    approved: "Approved",
    rejected: "Rejected",
  },
  ru: {
    submitted: "Отправлено",
    under_review: "На рассмотрении",
    info_required: "Нужна информация",
    approved: "Одобрено",
    rejected: "Отклонено",
  },
};

export function getApplicationStatusLabel(status: string, lang: Language = 'uz'): string {
  return APPLICATION_STATUS_LABELS[lang]?.[status] || APPLICATION_STATUS_LABELS.uz[status] || status;
}

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  under_review: "bg-amber-100 text-amber-700 border-amber-200",
  info_required: "bg-orange-100 text-orange-700 border-orange-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export const ROLE_LABELS: Record<Language, Record<string, string>> = {
  uz: {
    super_admin: "Super Admin",
    administrator: "Administrator",
    moderator: "Moderator",
  },
  en: {
    super_admin: "Super Admin",
    administrator: "Administrator",
    moderator: "Moderator",
  },
  ru: {
    super_admin: "Супер Админ",
    administrator: "Администратор",
    moderator: "Модератор",
  },
};

export function getRoleLabel(role: string, lang: Language = 'uz'): string {
  return ROLE_LABELS[lang]?.[role] || ROLE_LABELS.uz[role] || role;
}

export const UZBEKISTAN_REGIONS_TRANSLATIONS: Record<
  Language,
  { id: number; name: string; districts: string[] }[]
> = {
  uz: [
    { id: 1, name: "Toshkent shahri", districts: ["Yunusobod", "Chilonzor", "Yakkasaroy", "Mirzo Ulug'bek", "Shayxontohur", "Olmazar", "Uchtepa", "Bektemir", "Sergeli", "Yashnobod"] },
    { id: 2, name: "Toshkent viloyati", districts: ["Angren", "Bekobod", "Bo'stonliq", "Chinoz", "Qibray", "Ohangaron", "Oqqo'rg'on", "Parkent", "Piskent", "Zangiota"] },
    { id: 3, name: "Samarqand viloyati", districts: ["Samarqand", "Urgut", "Kattaqo'rg'on", "Bulung'ur", "Ishtixon", "Jomboy", "Narpay", "Payariq", "Pastdarg'om", "Qo'shrabot"] },
    { id: 4, name: "Buxoro viloyati", districts: ["Buxoro", "G'ijduvon", "Jondor", "Kogon", "Peshku", "Qorovulbozor", "Romitan", "Shofirkon", "Vobkent", "Olot"] },
    { id: 5, name: "Namangan viloyati", districts: ["Namangan", "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Norin", "Pop", "To'raqo'rg'on", "Uychi", "Yangiqo'rg'on"] },
    { id: 6, name: "Andijon viloyati", districts: ["Andijon", "Asaka", "Baliqchi", "Buloqboshi", "Izboskan", "Jalaquduq", "Xo'jaobod", "Marhamat", "Oltinko'l", "Paxtaobod"] },
    { id: 7, name: "Farg'ona viloyati", districts: ["Farg'ona", "Quva", "Qo'qon", "Marg'ilon", "Beshariq", "Buvayda", "Dang'ara", "Furqat", "Oltiariq", "Rishton"] },
    { id: 8, name: "Qashqadaryo viloyati", districts: ["Qarshi", "G'uzor", "Kasbi", "Kitob", "Koson", "Mirishkor", "Muborak", "Nishon", "Shahrisabz", "Yakkabog'"] },
    { id: 9, name: "Surxondaryo viloyati", districts: ["Termiz", "Angor", "Bandixon", "Boysun", "Denov", "Jarqo'rg'on", "Qiziriq", "Oltinsoy", "Sherobod", "Sho'rchi"] },
    { id: 10, name: "Xorazm viloyati", districts: ["Urganch", "Bog'ot", "Gurlan", "Hazorasp", "Xiva", "Xonqa", "Qo'shko'pir", "Shovot", "Tuproqqal'a", "Yangiariq"] },
    { id: 11, name: "Qoraqalpog'iston", districts: ["Nukus", "Amudaryo", "Beruniy", "Chimboy", "Ellikqal'a", "Kegeyli", "Mo'ynoq", "Qanliko'l", "Shumanay", "Taxtako'pir"] },
    { id: 12, name: "Jizzax viloyati", districts: ["Jizzax", "Arnasoy", "Baxmal", "Do'stlik", "Forish", "G'allaorol", "Mirzacho'l", "Paxtakor", "Yangiobod", "Zomin"] },
    { id: 13, name: "Navoiy viloyati", districts: ["Navoiy", "Karmana", "Konimex", "Lyavlikan", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi"] },
    { id: 14, name: "Sirdaryo viloyati", districts: ["Guliston", "Boyovut", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Shirin", "Xovos", "Yangiyer", "Zafar"] },
  ],
  ru: [
    { id: 1, name: "г. Ташкент", districts: ["Юнусабад", "Чиланзар", "Яккасарай", "Мирзо Улугбек", "Шайхантахур", "Алмазар", "Учтепа", "Бектемир", "Сергели", "Яшнабад"] },
    { id: 2, name: "Ташкентская область", districts: ["Ангрен", "Бекабад", "Бостанлык", "Чиназ", "Кибрай", "Ахангаран", "Аккурган", "Паркент", "Пскент", "Зангиата"] },
    { id: 3, name: "Самаркандская область", districts: ["Самарканд", "Ургут", "Каттакурган", "Булунгур", "Иштихан", "Джамбай", "Нарпай", "Папариак", "Пастдаргом", "Кошрабад"] },
    { id: 4, name: "Бухарская область", districts: ["Бухара", "Гиждуван", "Жондор", "Каган", "Пешку", "Караулбазар", "Ромитан", "Шафиркан", "Вабкент", "Алат"] },
    { id: 5, name: "Наманганская область", districts: ["Наманган", " Чартак", "Чуст", "Касансай", "Мингбулак", "Нарын", "Пап", "Туракурган", "Уйчи", "Янгикурган"] },
    { id: 6, name: "Андижанская область", districts: ["Андижан", "Асака", "Балыкчи", "Булакбаши", "Избаскан", "Джалакудук", "Ходжаабад", "Мархамат", "Алтынкуль", "Пахтаабад"] },
    { id: 7, name: "Ферганская область", districts: ["Фергана", "Кува", "Коканд", "Маргилан", "Бешарык", "Бувайда", "Дангара", "Фуркат", "Алтыарык", "Риштан"] },
    { id: 8, name: "Кашкадарьинская область", districts: ["Карши", "Гузар", "Касби", "Китаб", "Касан", "Миришкор", "Мубарек", "Нишан", "Шахрисабз", "Яккабаг"] },
    { id: 9, name: "Сурхандарьинская область", districts: ["Термез", "Ангор", "Бандихан", "Байсун", "Денау", "Джаркурган", "Кизирик", "Алтынсай", "Шерабад", "Шурчи"] },
    { id: 10, name: "Хорезмская область", districts: ["Ургенч", "Багат", "Гурлен", "Хазарасп", "Хива", "Ханка", "Кошкупыр", "Шават", "Тупраккала", "Янгиарык"] },
    { id: 11, name: "Каракалпакстан", districts: ["Нукус", "Амударья", "Беруни", "Чимбай", "Элликкала", "Кегейли", "Муйнак", "Канлыкуль", "Шуманай", "Тахтакупыр"] },
    { id: 12, name: "Джизакская область", districts: ["Джизак", "Арнасай", "Бахмал", "Дустлик", "Фариш", "Галляарал", "Мирзачуль", "Пахтакор", "Янгиабад", "Замин"] },
    { id: 13, name: "Навоийская область", districts: ["Навои", "Кармана", "Канимех", "Лявликан", "Навбахор", "Нурата", "Кызылтепа", "Тамды", "Учкудук", "Хатырчи"] },
    { id: 14, name: "Сырдарьинская область", districts: ["Гулистан", "Баяут", "Мирзаабад", "Акалтын", "Сардоба", "Сайхунабад", "Ширин", "Хаваст", "Янгиер", "Зафар"] },
  ],
  en: [
    { id: 1, name: "Tashkent city", districts: ["Yunusabad", "Chilanzar", "Yakkasaray", "Mirzo Ulugbek", "Shaykhantahur", "Olmazar", "Uchtepa", "Bektemir", "Sergeli", "Yashnabad"] },
    { id: 2, name: "Tashkent region", districts: ["Angren", "Bekabad", "Bostanlyk", "Chinaz", "Kibray", "Ahangaran", "Akkurgan", "Parkent", "Piskent", "Zangiata"] },
    { id: 3, name: "Samarkand region", districts: ["Samarkand", "Urgut", "Kattakurgan", "Bulungur", "Ishtikhon", "Jomboy", "Narpay", "Payariq", "Pastdargom", "Koshrabot"] },
    { id: 4, name: "Bukhara region", districts: ["Bukhara", "Gijduvan", "Jondor", "Kagan", "Peshku", "Qarovulbazar", "Romitan", "Shafirkan", "Vabkent", "Olot"] },
    { id: 5, name: "Namangan region", districts: ["Namangan", "Chartak", "Chust", "Kasansay", "Mingbulak", "Naryn", "Pap", "Turakurgan", "Uychi", "Yangikurgan"] },
    { id: 6, name: "Andijan region", districts: ["Andijan", "Asaka", "Balikchi", "Bulaqbashi", "Izboskan", "Jalaquduq", "Khojaabad", "Marhamat", "Oltinkol", "Pakhtaabad"] },
    { id: 7, name: "Fergana region", districts: ["Fergana", "Quva", "Kokand", "Margilan", "Besharik", "Buvayda", "Dangara", "Furqat", "Oltiariq", "Rishtan"] },
    { id: 8, name: "Kashkadarya region", districts: ["Karshi", "Guzar", "Kasbi", "Kitab", "Kasan", "Mirishkor", "Mubarek", "Nishan", "Shakhrisabz", "Yakkabag"] },
    { id: 9, name: "Surkhandarya region", districts: ["Termez", "Angor", "Bandikhan", "Boysun", "Denau", "Jarkurgan", "Qiziriq", "Oltinsoy", "Sherabad", "Shurchi"] },
    { id: 10, name: "Khorezm region", districts: ["Urgench", "Bagat", "Gurlen", "Khazarasp", "Khiva", "Khanka", "Koshkupir", "Shavat", "Tuproqkala", "Yangiariq"] },
    { id: 11, name: "Karakalpakstan", districts: ["Nukus", "Amudarya", "Beruni", "Chimbay", "Ellikkala", "Kegeyli", "Muynak", "Kanlikul", "Shumanay", "Takhtakupir"] },
    { id: 12, name: "Jizzakh region", districts: ["Jizzakh", "Arnasay", "Bakhmal", "Dustlik", "Forish", "Gallaorol", "Mirzachul", "Pakhtakor", "Yangiobod", "Zamin"] },
    { id: 13, name: "Navoiy region", districts: ["Navoiy", "Karmana", "Konimex", "Lyavlikan", "Navbahor", "Nurata", "Qiziltepa", "Tomdi", "Uchquduq", "Khatirchi"] },
    { id: 14, name: "Syrdarya region", districts: ["Gulistan", "Bayaut", "Mirzaabad", "Aqaltin", "Sardoba", "Saykhunabad", "Shirin", "Khavast", "Yangiyer", "Zafar"] },
  ],
};

export function getLocalizedRegions(lang: Language = 'uz') {
  return UZBEKISTAN_REGIONS_TRANSLATIONS[lang] || UZBEKISTAN_REGIONS_TRANSLATIONS.uz;
}

export const UZBEKISTAN_REGIONS = UZBEKISTAN_REGIONS_TRANSLATIONS.uz;
