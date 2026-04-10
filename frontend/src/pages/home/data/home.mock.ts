import { HomeCategory } from "../types/home";

const image = (seed: string) => `https://picsum.photos/seed/${seed}/520/340`;

export const homeCategories: HomeCategory[] = [
  {
    id: "photo",
    title: "צילום · מוצרים פופולריים",
    products: [
      { id: "p1", name: "Canon G7X Mark II", city: "תל אביב", rating: 4.9, pricePerDay: 150, imageUrl: image("canon-g7"), lenderType: "private" },
      { id: "p2", name: "Canon EOS 750D", city: "תל אביב", rating: 4.8, pricePerDay: 100, imageUrl: image("canon-750d"), lenderType: "company" },
      { id: "p3", name: "Sony A7 III", city: "נתניה", rating: 4.8, pricePerDay: 180, imageUrl: image("sony-a7iii"), lenderType: "private" },
      { id: "p4", name: "FujiFilm X-T30", city: "רמת גן", rating: 4.4, pricePerDay: 135, imageUrl: image("fuji-xt30"), lenderType: "company" },
      { id: "p5", name: "Coolpix P900", city: "חדרה", rating: 4.6, pricePerDay: 70, imageUrl: image("coolpix"), lenderType: "private" },
      { id: "p6", name: "GoPro 7 Black", city: "חיפה", rating: 4.7, pricePerDay: 90, imageUrl: image("gopro"), lenderType: "company" },
      { id: "p7", name: "Nikon D5600", city: "אשדוד", rating: 4.9, pricePerDay: 120, imageUrl: image("nikon"), lenderType: "private" },
    ],
  },
  {
    id: "compute",
    title: "מחשוב ורחפנים",
    products: [
      { id: "c1", name: "MacBook Pro M3", city: "תל אביב", rating: 4.8, pricePerDay: 180, imageUrl: image("mbp"), lenderType: "company" },
      { id: "c2", name: "Lenovo ThinkPad X1", city: "חיפה", rating: 4.6, pricePerDay: 210, imageUrl: image("thinkpad"), lenderType: "private" },
      { id: "c3", name: "Asus Zenbook 14", city: "ירושלים", rating: 4.8, pricePerDay: 240, imageUrl: image("zenbook"), lenderType: "company" },
      { id: "c4", name: "Surface Pro 9", city: "הרצליה", rating: 4.4, pricePerDay: 195, imageUrl: image("surface"), lenderType: "private" },
      { id: "c5", name: "DJI Mini 3 Pro", city: "ירושלים", rating: 5.0, pricePerDay: 250, imageUrl: image("dji"), lenderType: "company" },
      { id: "c6", name: "Dell XPS 13", city: "פתח תקווה", rating: 4.7, pricePerDay: 225, imageUrl: image("xps"), lenderType: "private" },
      { id: "c7", name: "iPad Pro 12.9", city: "מודיעין", rating: 4.9, pricePerDay: 180, imageUrl: image("ipad"), lenderType: "company" },
    ],
  },
  {
    id: "tools",
    title: "כלי עבודה",
    products: [
      { id: "t1", name: "Bosch PSB 500", city: "רמת גן", rating: 4.5, pricePerDay: 200, imageUrl: image("bosch"), lenderType: "private" },
      { id: "t2", name: "Makita DDF482", city: "חולון", rating: 4.5, pricePerDay: 110, imageUrl: image("makita"), lenderType: "company" },
      { id: "t3", name: "DeWalt DCD777", city: "אשקלון", rating: 4.6, pricePerDay: 125, imageUrl: image("dewalt"), lenderType: "private" },
      { id: "t4", name: "Bosch זווית משחזת", city: "רחובות", rating: 4.7, pricePerDay: 140, imageUrl: image("grinder"), lenderType: "company" },
      { id: "t5", name: "פטיש מקדחה", city: "נתניה", rating: 4.8, pricePerDay: 155, imageUrl: image("hammer"), lenderType: "private" },
      { id: "t6", name: "מסמרים אקדח", city: "חיפה", rating: 4.9, pricePerDay: 95, imageUrl: image("nail"), lenderType: "company" },
      { id: "t7", name: "סט כלי עבודה", city: "באר שבע", rating: 4.4, pricePerDay: 110, imageUrl: image("toolset"), lenderType: "private" },
    ],
  },
];

export default function HomeMockPage() {
  return null;
}
