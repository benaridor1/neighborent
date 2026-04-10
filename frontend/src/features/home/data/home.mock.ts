import { HomeCategory } from "../types/home";

const img = (seed: string) => `https://picsum.photos/seed/${seed}/640/420`;

export const homeCategories: HomeCategory[] = [
  {
    id: "photo",
    title: "צילום · מוצרים פופולריים",
    products: [
      { id: "p1", title: "Canon G7X MARK II", city: "תל אביב", rating: 4.9, pricePerDay: 150, imageUrl: img("canon-g7x"), providerType: "private" },
      { id: "p2", title: "Canon EOS 750D", city: "תל אביב", rating: 4.8, pricePerDay: 100, imageUrl: img("canon-750"), providerType: "company" },
      { id: "p3", title: "Sony A7 III", city: "נתניה", rating: 4.8, pricePerDay: 180, imageUrl: img("sony-a7"), providerType: "private" },
      { id: "p4", title: "FujiFilm X-T30", city: "רמת גן", rating: 4.4, pricePerDay: 135, imageUrl: img("fuji"), providerType: "company" },
      { id: "p5", title: "Coolpix P900", city: "חדרה", rating: 4.6, pricePerDay: 70, imageUrl: img("coolpix"), providerType: "private" },
      { id: "p6", title: "Go Pro 7 Black", city: "חיפה", rating: 4.7, pricePerDay: 90, imageUrl: img("gopro7"), providerType: "company" },
      { id: "p7", title: "Nikon D5600", city: "אשדוד", rating: 4.9, pricePerDay: 120, imageUrl: img("nikon-5600"), providerType: "private" },
    ],
  },
  {
    id: "computing",
    title: "מחשוב ורחפנים",
    products: [
      { id: "c1", title: "MacBook Pro M3", city: "תל אביב", rating: 4.8, pricePerDay: 180, imageUrl: img("mbp-m3"), providerType: "company" },
      { id: "c2", title: "Lenovo ThinkPad X1", city: "חיפה", rating: 4.6, pricePerDay: 210, imageUrl: img("thinkpad"), providerType: "private" },
      { id: "c5", title: "Asus Zenbook 14", city: "ירושלים", rating: 4.8, pricePerDay: 240, imageUrl: img("zenbook"), providerType: "private" },
      { id: "c6", title: "Surface Pro 9", city: "הרצליה", rating: 4.4, pricePerDay: 195, imageUrl: img("surface9"), providerType: "company" },
      { id: "c3", title: "DJI Mini 3 Pro", city: "ירושלים", rating: 5.0, pricePerDay: 250, imageUrl: img("dji-mini"), providerType: "company" },
      { id: "c7", title: "Dell XPS 13", city: "פתח תקווה", rating: 4.7, pricePerDay: 225, imageUrl: img("xps13"), providerType: "private" },
      { id: "c4", title: "iPad Pro 12.9", city: "מודיעין", rating: 4.9, pricePerDay: 180, imageUrl: img("ipad"), providerType: "private" },
    ],
  },
  {
    id: "tools",
    title: "כלי עבודה",
    products: [
      { id: "t1", title: "Bosch PSB 500", city: "רמת גן", rating: 4.5, pricePerDay: 200, imageUrl: img("bosch-psb"), providerType: "private" },
      { id: "t2", title: "Makita DDF482", city: "חולון", rating: 4.5, pricePerDay: 110, imageUrl: img("makita-dd"), providerType: "company" },
      { id: "t3", title: "DeWalt DCD777", city: "אשקלון", rating: 4.6, pricePerDay: 125, imageUrl: img("dewalt"), providerType: "private" },
      { id: "t4", title: "Bosch זווית משחזת", city: "רחובות", rating: 4.7, pricePerDay: 140, imageUrl: img("grinder"), providerType: "company" },
      { id: "t5", title: "פטיש מקדחה", city: "נתניה", rating: 4.8, pricePerDay: 155, imageUrl: img("hammer"), providerType: "private" },
      { id: "t6", title: "מסמרים אקדח", city: "חיפה", rating: 4.9, pricePerDay: 95, imageUrl: img("nailgun"), providerType: "company" },
      { id: "t7", title: "סט כלי עבודה", city: "באר שבע", rating: 4.4, pricePerDay: 110, imageUrl: img("toolset"), providerType: "private" },
    ],
  },
  {
    id: "events",
    title: "אירועים והפקות",
    products: [
      { id: "e1", title: "JBL EON רמקול", city: "תל אביב", rating: 4.8, pricePerDay: 220, imageUrl: img("jbl-eon"), providerType: "company" },
      { id: "e2", title: "מסך הקרנה 120", city: "ירושלים", rating: 4.7, pricePerDay: 185, imageUrl: img("screen120"), providerType: "private" },
      { id: "e3", title: "גנרטור שקט", city: "רעננה", rating: 4.4, pricePerDay: 155, imageUrl: img("generator"), providerType: "private" },
      { id: "e4", title: "ערכת תאורת LED", city: "חיפה", rating: 4.6, pricePerDay: 140, imageUrl: img("led"), providerType: "company" },
      { id: "e5", title: "מערכת קריוקי", city: "מודיעין", rating: 4.9, pricePerDay: 140, imageUrl: img("karaoke"), providerType: "private" },
      { id: "e6", title: "מקרן 4K לאירועים", city: "פתח תקווה", rating: 4.7, pricePerDay: 180, imageUrl: img("projector4k"), providerType: "company" },
      { id: "e7", title: "עמדת צילום 360", city: "אשדוד", rating: 4.8, pricePerDay: 200, imageUrl: img("photo360"), providerType: "private" },
    ],
  },
];
