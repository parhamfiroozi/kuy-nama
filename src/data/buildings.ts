export type Building = {
  id: string;
  name: string;
  agency: string;
  price: number;           // IRR
  type: "sale" | "rent";
  beds: number;
  baths: number;
  area_m2: number;
  coords: [number, number]; // [lng, lat] — MapLibre order!
  image?: string;
  description?: string;
};

export const buildings: Building[] = [
  {
    id: "b1",
    name: "برج قصرالدشت",
    agency: "املاک مهستان",
    price: 78000000000,
    type: "sale",
    beds: 3,
    baths: 2,
    area_m2: 145,
    coords: [52.5168, 29.6296],
    image: "/images/sample-1.jpg",
    description: "واحد بازسازی‌شده با نور عالی و ویوی باز."
  },
  {
    id: "b2",
    name: "رزیدنس ستارخان",
    agency: "املاک پارسیان",
    price: 42000000000,
    type: "rent",
    beds: 2,
    baths: 1,
    area_m2: 95,
    coords: [52.545, 29.6125],
    image: "/images/sample-2.jpg",
    description: "نوساز، دسترسی عالی به ستارخان و مترو."
  },
  {
    id: "b3",
    name: "برج ارغوان",
    agency: "املاک ارغوان",
    price: 105000000000,
    type: "sale",
    beds: 4,
    baths: 3,
    area_m2: 210,
    coords: [52.5742, 29.5919],
    image: "/images/sample-3.jpg",
    description: "لاکچری، پارکینگ مهمان، سالن اجتماعات."
  }
];
