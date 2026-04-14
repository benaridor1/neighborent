import { demoProductCardImage, registerRentalCompanySectors, type DemoCategoryKey } from "../../../lib/demo-category-images";
import { HomeCategory, RentalCompanyCategory } from "../types/home";

const img = (category: DemoCategoryKey, productId: string) => demoProductCardImage(category, productId);

export const homeCategories: HomeCategory[] = [
  {
    id: "photo",
    title: "צילום · מוצרים פופולריים",
    privateListingTotal: 156,
    products: [
      { id: "p1", name: "Canon G7X Mark II", city: "תל אביב", rating: 4.9, pricePerDay: 150, imageUrl: img("photo", "p1"), lenderType: "private" },
      { id: "p3", name: "Sony A7 III", city: "נתניה", rating: 4.8, pricePerDay: 180, imageUrl: img("photo", "p3"), lenderType: "private" },
      { id: "p5", name: "Coolpix P900", city: "חדרה", rating: 4.6, pricePerDay: 70, imageUrl: img("photo", "p5"), lenderType: "private" },
      { id: "p7", name: "Nikon D5600", city: "אשדוד", rating: 4.9, pricePerDay: 120, imageUrl: img("photo", "p7"), lenderType: "private" },
      { id: "p8", name: "Sony ZV-1", city: "רעננה", rating: 4.7, pricePerDay: 125, imageUrl: img("photo", "p8"), lenderType: "private" },
      { id: "p9", name: "Canon EOS R10", city: "הרצליה", rating: 4.8, pricePerDay: 165, imageUrl: img("photo", "p9"), lenderType: "private" },
      { id: "p11", name: "Panasonic Lumix G9", city: "כפר סבא", rating: 4.7, pricePerDay: 140, imageUrl: img("photo", "p11"), lenderType: "private" },
      { id: "p2", name: "Canon EOS 750D", city: "תל אביב", rating: 4.8, pricePerDay: 100, imageUrl: img("photo", "p2"), lenderType: "company" },
      { id: "p4", name: "FujiFilm X-T30", city: "רמת גן", rating: 4.4, pricePerDay: 135, imageUrl: img("photo", "p4"), lenderType: "company" },
      { id: "p6", name: "GoPro 7 Black", city: "חיפה", rating: 4.7, pricePerDay: 90, imageUrl: img("photo", "p6"), lenderType: "company" },
    ],
  },
  {
    id: "compute",
    title: "מחשוב ורחפנים",
    privateListingTotal: 248,
    products: [
      { id: "c2", name: "Lenovo ThinkPad X1", city: "חיפה", rating: 4.6, pricePerDay: 210, imageUrl: img("compute", "c2"), lenderType: "private" },
      { id: "c4", name: "Surface Pro 9", city: "הרצליה", rating: 4.4, pricePerDay: 195, imageUrl: img("compute", "c4"), lenderType: "private" },
      { id: "c6", name: "Dell XPS 13", city: "פתח תקווה", rating: 4.7, pricePerDay: 225, imageUrl: img("compute", "c6"), lenderType: "private" },
      { id: "c8", name: "MacBook Air M2", city: "תל אביב", rating: 4.8, pricePerDay: 175, imageUrl: img("compute", "c8"), lenderType: "private" },
      { id: "c9", name: "LG Gram 16", city: "נתניה", rating: 4.5, pricePerDay: 188, imageUrl: img("compute", "c9"), lenderType: "private" },
      { id: "c10", name: "HP Pavilion 15", city: "ירושלים", rating: 4.3, pricePerDay: 95, imageUrl: img("compute", "c10"), lenderType: "private" },
      { id: "c11", name: "Samsung Galaxy Book3", city: "רחובות", rating: 4.5, pricePerDay: 102, imageUrl: img("compute", "c11"), lenderType: "private" },
      { id: "c1", name: "MacBook Pro M3", city: "תל אביב", rating: 4.8, pricePerDay: 180, imageUrl: img("compute", "c1"), lenderType: "company" },
      { id: "c3", name: "Asus Zenbook 14", city: "ירושלים", rating: 4.8, pricePerDay: 240, imageUrl: img("compute", "c3"), lenderType: "company" },
      { id: "c5", name: "DJI Mini 3 Pro", city: "ירושלים", rating: 5.0, pricePerDay: 250, imageUrl: img("compute", "c5"), lenderType: "company" },
      { id: "c7", name: "iPad Pro 12.9", city: "מודיעין", rating: 4.9, pricePerDay: 180, imageUrl: img("compute", "c7"), lenderType: "company" },
    ],
  },
  {
    id: "construction",
    title: "ציוד בנייה · מוצרים פופולריים",
    privateListingTotal: 124,
    products: [
      { id: "t1", name: "Bosch PSB 500", city: "רמת גן", rating: 4.5, pricePerDay: 200, imageUrl: img("construction", "t1"), lenderType: "private" },
      { id: "t3", name: "DeWalt DCD777", city: "אשקלון", rating: 4.6, pricePerDay: 125, imageUrl: img("construction", "t3"), lenderType: "private" },
      { id: "t5", name: "פטיש מקדחה", city: "נתניה", rating: 4.8, pricePerDay: 155, imageUrl: img("construction", "t5"), lenderType: "private" },
      { id: "t7", name: "סט כלי עבודה", city: "באר שבע", rating: 4.4, pricePerDay: 110, imageUrl: img("construction", "t7"), lenderType: "private" },
      { id: "t8", name: "משחזת זווית 125מ״מ", city: "חולון", rating: 4.6, pricePerDay: 85, imageUrl: img("construction", "t8"), lenderType: "private" },
      { id: "t9", name: "מברגה אימפקט", city: "אשדוד", rating: 4.7, pricePerDay: 72, imageUrl: img("construction", "t9"), lenderType: "private" },
      { id: "t11", name: "מסור אורביטלי 190מ״מ", city: "רמת השרון", rating: 4.5, pricePerDay: 68, imageUrl: img("construction", "t11"), lenderType: "private" },
      { id: "t2", name: "Makita DDF482", city: "חולון", rating: 4.5, pricePerDay: 110, imageUrl: img("construction", "t2"), lenderType: "company" },
      { id: "t4", name: "Bosch זווית משחזת", city: "רחובות", rating: 4.7, pricePerDay: 140, imageUrl: img("construction", "t4"), lenderType: "company" },
      { id: "t6", name: "מסמרים אקדח", city: "חיפה", rating: 4.9, pricePerDay: 95, imageUrl: img("construction", "t6"), lenderType: "company" },
    ],
  },
  {
    id: "garden",
    title: "ציוד גינון · מוצרים פופולריים",
    privateListingTotal: 96,
    products: [
      { id: "g1", name: "מכסחת דשא חשמלית", city: "רעננה", rating: 4.6, pricePerDay: 85, imageUrl: img("garden", "g1"), lenderType: "private" },
      { id: "g2", name: "גוזם גדר חיה", city: "הרצליה", rating: 4.5, pricePerDay: 45, imageUrl: img("garden", "g2"), lenderType: "private" },
      { id: "g3", name: "מפוח עלים", city: "כפר סבא", rating: 4.4, pricePerDay: 55, imageUrl: img("garden", "g3"), lenderType: "private" },
      { id: "g4", name: "מכונת שטיפה בלחץ", city: "נתניה", rating: 4.7, pricePerDay: 95, imageUrl: img("garden", "g4"), lenderType: "private" },
      { id: "g5", name: "גלגלת השקיה 50מ׳", city: "חדרה", rating: 4.3, pricePerDay: 28, imageUrl: img("garden", "g5"), lenderType: "private" },
      { id: "g6", name: "מחרשה לכיסא גינה", city: "רמת גן", rating: 4.2, pricePerDay: 120, imageUrl: img("garden", "g6"), lenderType: "private" },
      { id: "g7", name: "מפזר דשן ידני", city: "פתח תקווה", rating: 4.4, pricePerDay: 35, imageUrl: img("garden", "g7"), lenderType: "private" },
      { id: "g8", name: "רכיב קומפוסט מתכת", city: "ירושלים", rating: 4.5, pricePerDay: 40, imageUrl: img("garden", "g8"), lenderType: "company" },
      { id: "g9", name: "מסור שרשרת לעצים", city: "באר שבע", rating: 4.8, pricePerDay: 110, imageUrl: img("garden", "g9"), lenderType: "company" },
      { id: "g10", name: "עריסת שתילים", city: "אשקלון", rating: 4.1, pricePerDay: 22, imageUrl: img("garden", "g10"), lenderType: "company" },
    ],
  },
  {
    id: "sports",
    title: "ספורט ואאוטדור · מוצרים פופולריים",
    privateListingTotal: 82,
    products: [
      { id: "s1", name: "אופני הרים", city: "תל אביב", rating: 4.7, pricePerDay: 65, imageUrl: img("sports", "s1"), lenderType: "private" },
      { id: "s2", name: "אוהל 4 אנשים", city: "חיפה", rating: 4.5, pricePerDay: 48, imageUrl: img("sports", "s2"), lenderType: "private" },
      { id: "s3", name: "סאפ מתנפח", city: "אילת", rating: 4.8, pricePerDay: 90, imageUrl: img("sports", "s3"), lenderType: "private" },
      { id: "s4", name: "ערסל קמפינג", city: "צפת", rating: 4.3, pricePerDay: 25, imageUrl: img("sports", "s4"), lenderType: "private" },
      { id: "s5", name: "זוג מחבטי פיקל", city: "רחובות", rating: 4.9, pricePerDay: 35, imageUrl: img("sports", "s5"), lenderType: "private" },
      { id: "s6", name: "שולחן פינג-פונג מתקפל", city: "נתניה", rating: 4.4, pricePerDay: 140, imageUrl: img("sports", "s6"), lenderType: "private" },
      { id: "s7", name: "קרחון נייד 28 ליטר", city: "הרצליה", rating: 4.6, pricePerDay: 42, imageUrl: img("sports", "s7"), lenderType: "private" },
      { id: "s8", name: "מזרון יוגה Pro", city: "מודיעין", rating: 4.5, pricePerDay: 18, imageUrl: img("sports", "s8"), lenderType: "company" },
      { id: "s9", name: "סט משקולות 20 ק״ג", city: "לוד", rating: 4.4, pricePerDay: 55, imageUrl: img("sports", "s9"), lenderType: "company" },
      { id: "s10", name: "קורקינט חשמלי", city: "בני ברק", rating: 4.2, pricePerDay: 75, imageUrl: img("sports", "s10"), lenderType: "company" },
    ],
  },
  {
    id: "events",
    title: "אירועים ומסיבות · מוצרים פופולריים",
    privateListingTotal: 71,
    products: [
      { id: "e1", name: "רמקול Bluetooth 200W", city: "תל אביב", rating: 4.6, pricePerDay: 85, imageUrl: img("events", "e1"), lenderType: "private" },
      { id: "e2", name: "מקרן Full HD", city: "רמת גן", rating: 4.5, pricePerDay: 120, imageUrl: img("events", "e2"), lenderType: "private" },
      { id: "e3", name: "עמדת DJ קומפקטית", city: "חיפה", rating: 4.7, pricePerDay: 220, imageUrl: img("events", "e3"), lenderType: "private" },
      { id: "e4", name: "סט כיסאות מתקפלים ×12", city: "ירושלים", rating: 4.4, pricePerDay: 95, imageUrl: img("events", "e4"), lenderType: "private" },
      { id: "e5", name: "שולחן קוקטייל עגול", city: "נתניה", rating: 4.3, pricePerDay: 38, imageUrl: img("events", "e5"), lenderType: "private" },
      { id: "e6", name: "גנרטור שקט 3KVA", city: "אשדוד", rating: 4.8, pricePerDay: 180, imageUrl: img("events", "e6"), lenderType: "private" },
      { id: "e7", name: "מכונת בועות סבון", city: "פתח תקווה", rating: 4.2, pricePerDay: 55, imageUrl: img("events", "e7"), lenderType: "private" },
      { id: "e8", name: "מסך LED 55״", city: "באר שבע", rating: 4.6, pricePerDay: 160, imageUrl: img("events", "e8"), lenderType: "company" },
      { id: "e9", name: "מיקרופון אלחוטי זוגי", city: "רחובות", rating: 4.5, pricePerDay: 48, imageUrl: img("events", "e9"), lenderType: "company" },
      { id: "e10", name: "עריסת ציוד לייט", city: "חולון", rating: 4.4, pricePerDay: 32, imageUrl: img("events", "e10"), lenderType: "company" },
    ],
  },
];

export const rentalCompanyCategories: RentalCompanyCategory[] = [
  {
    id: "camera-companies",
    title: "צילום · חברות השכרה",
    companies: [
      { id: "rc1", category: "ציוד צילום", region: "תל אביב והמרכז", rating: 4.8, imageUrl: img("photo", "rc1") },
      { id: "rc2", category: "מצלמות ועדשות", region: "חיפה והצפון", rating: 4.7, imageUrl: img("photo", "rc2") },
      { id: "rc3", category: "וידאו והפקות", region: "ירושלים", rating: 4.6, imageUrl: img("photo", "rc3") },
      { id: "rc4", category: "צילום סטודיו", region: "באר שבע והדרום", rating: 4.9, imageUrl: img("photo", "rc4") },
      { id: "rc13", category: "תאורת סטודיו", region: "רעננה", rating: 4.5, imageUrl: img("photo", "rc13") },
      { id: "rc14", category: "צילום אווירי", region: "הרצליה", rating: 4.8, imageUrl: img("photo", "rc14") },
      { id: "rc15", category: "עדשות קולנוע", region: "תל אביב", rating: 4.9, imageUrl: img("photo", "rc15") },
    ],
  },
  {
    id: "tech-companies",
    title: "מחשוב ורחפנים · חברות השכרה",
    companies: [
      { id: "rc5", category: "לפטופים וטאבלטים", region: "תל אביב והמרכז", rating: 4.8, imageUrl: img("compute", "rc5") },
      { id: "rc6", category: "רחפנים מקצועיים", region: "ירושלים והסביבה", rating: 4.7, imageUrl: img("compute", "rc6") },
      { id: "rc7", category: "ציוד סטרימינג", region: "חיפה והצפון", rating: 4.5, imageUrl: img("compute", "rc7") },
      { id: "rc8", category: "תחנות עבודה", region: "אשדוד והשפלה", rating: 4.6, imageUrl: img("compute", "rc8") },
      { id: "rc16", category: "מסכים ומקרנים", region: "נתניה", rating: 4.6, imageUrl: img("compute", "rc16") },
      { id: "rc17", category: "שרתים ורשת", region: "פתח תקווה", rating: 4.4, imageUrl: img("compute", "rc17") },
      { id: "rc18", category: "VR ומציאות רבודה", region: "חולון", rating: 4.7, imageUrl: img("compute", "rc18") },
    ],
  },
  {
    id: "construction-companies",
    title: "ציוד בנייה · חברות השכרה",
    companies: [
      { id: "rc9", category: "כלי עבודה כבדים", region: "חולון ובת ים", rating: 4.7, imageUrl: img("construction", "rc9") },
      { id: "rc10", category: "ציוד נגרות", region: "פתח תקווה", rating: 4.4, imageUrl: img("construction", "rc10") },
      { id: "rc11", category: "ציוד שיפוצים", region: "נתניה והשרון", rating: 4.8, imageUrl: img("construction", "rc11") },
      { id: "rc12", category: "חשמל וגנרטורים", region: "אשקלון והדרום", rating: 4.6, imageUrl: img("construction", "rc12") },
      { id: "rc20", category: "השכרת פיגומים", region: "בני ברק", rating: 4.6, imageUrl: img("construction", "rc20") },
      { id: "rc21", category: "כלים לריתוך", region: "לוד", rating: 4.3, imageUrl: img("construction", "rc21") },
      { id: "rc30", category: "בטון וערבוב", region: "ראשון לציון", rating: 4.5, imageUrl: img("construction", "rc30") },
    ],
  },
  {
    id: "garden-companies",
    title: "ציוד גינון · חברות השכרה",
    companies: [
      { id: "rc19", category: "ציוד גינון כללי", region: "רמת גן", rating: 4.5, imageUrl: img("garden", "rc19") },
      { id: "rc32", category: "מדשאות ומכסחות", region: "כפר סבא", rating: 4.6, imageUrl: img("garden", "rc32") },
      { id: "rc33", category: "השקיה וטיפוח", region: "הרצליה", rating: 4.4, imageUrl: img("garden", "rc33") },
      { id: "rc34", category: "כריתום ועצים", region: "רעננה", rating: 4.7, imageUrl: img("garden", "rc34") },
      { id: "rc35", category: "קומפוסט ואדמה", region: "מודיעין", rating: 4.3, imageUrl: img("garden", "rc35") },
      { id: "rc36", category: "גינון אורגני", region: "זכרון יעקב", rating: 4.8, imageUrl: img("garden", "rc36") },
      { id: "rc37", category: "ציוד גג ירוק", region: "תל אביב", rating: 4.5, imageUrl: img("garden", "rc37") },
    ],
  },
  {
    id: "sports-companies",
    title: "ספורט ואאוטדור · חברות השכרה",
    companies: [
      { id: "rc60", category: "אופניים וקורקינטים", region: "תל אביב והמרכז", rating: 4.7, imageUrl: img("sports", "rc60") },
      { id: "rc61", category: "קמפינג והשכרת ציוד", region: "חיפה והצפון", rating: 4.5, imageUrl: img("sports", "rc61") },
      { id: "rc62", category: "סאפ וקיאקים", region: "אילת והדרום", rating: 4.8, imageUrl: img("sports", "rc62") },
      { id: "rc63", category: "כושר בחוץ", region: "ירושלים", rating: 4.4, imageUrl: img("sports", "rc63") },
      { id: "rc64", category: "משחקים בחוץ", region: "רעננה", rating: 4.3, imageUrl: img("sports", "rc64") },
      { id: "rc65", category: "ציוד סקי וחורף", region: "צפת", rating: 4.6, imageUrl: img("sports", "rc65") },
      { id: "rc66", category: "ריצה ומירוצים", region: "נתניה", rating: 4.5, imageUrl: img("sports", "rc66") },
    ],
  },
  {
    id: "events-companies",
    title: "אירועים והשכרה · חברות השכרה",
    companies: [
      { id: "rc50", category: "אוהלים וצל", region: "תל אביב והמרכז", rating: 4.7, imageUrl: img("events", "rc50") },
      { id: "rc51", category: "שולחנות וכיסאות", region: "פתח תקווה", rating: 4.6, imageUrl: img("events", "rc51") },
      { id: "rc52", category: "קול ותאורה", region: "חיפה והצפון", rating: 4.8, imageUrl: img("events", "rc52") },
      { id: "rc53", category: "הפקות חוץ", region: "ירושלים", rating: 4.5, imageUrl: img("events", "rc53") },
      { id: "rc54", category: "מטבח נייד לאירוע", region: "אשדוד", rating: 4.4, imageUrl: img("events", "rc54") },
      { id: "rc55", category: "דקורציה ובלונים", region: "נתניה", rating: 4.3, imageUrl: img("events", "rc55") },
      { id: "rc56", category: "רחפן לצילום אירוע", region: "באר שבע", rating: 4.9, imageUrl: img("events", "rc56") },
    ],
  },
];

registerRentalCompanySectors(rentalCompanyCategories);

export default function HomeMockPage() {
  return null;
}
