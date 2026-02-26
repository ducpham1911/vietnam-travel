import { City } from "@/types/city";

export const cities: City[] = [
  {
    id: "hanoi",
    name: "Hà Nội",
    region: "Northern Vietnam",
    description:
      "Vietnam's capital city blends ancient temples, French colonial architecture, and bustling street food culture. The Old Quarter's narrow streets buzz with motorbikes and vendors selling phở and egg coffee.",
    gradientIndex: 0,
    imageAsset: "city_hanoi",
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    region: "Central Vietnam",
    description:
      "A coastal city famous for the iconic Golden Bridge at Bà Nà Hills, stunning beaches, and the mystical Marble Mountains. A perfect base for exploring central Vietnam.",
    gradientIndex: 1,
    imageAsset: "city_danang",
  },
  {
    id: "hcmc",
    name: "Hồ Chí Minh City",
    region: "Southern Vietnam",
    description:
      "Vietnam's largest city is a dynamic metropolis of skyscrapers, colonial landmarks, and vibrant street life. From war history museums to rooftop bars, Saigon never sleeps.",
    gradientIndex: 2,
    imageAsset: "city_hcmc",
  },
  {
    id: "hoian",
    name: "Hội An",
    region: "Central Vietnam",
    description:
      "A UNESCO World Heritage town famous for its lantern-lit ancient streets, tailor shops, and riverside charm. Best experienced at night when thousands of colorful lanterns illuminate the old town.",
    gradientIndex: 3,
    imageAsset: "city_hoian",
  },
  {
    id: "hue",
    name: "Huế",
    region: "Central Vietnam",
    description:
      "The former imperial capital of Vietnam, home to the magnificent Citadel, royal tombs, and the serene Perfume River. A city steeped in royal history and poetic beauty.",
    gradientIndex: 4,
    imageAsset: "city_hue",
  },
  {
    id: "nhatrang",
    name: "Nha Trang",
    region: "South Central Coast",
    description:
      "A popular beach resort city with crystal-clear waters, vibrant coral reefs, and a lively beachfront promenade. Famous for its fresh seafood and island-hopping tours.",
    gradientIndex: 5,
    imageAsset: "city_nhatrang",
  },
  {
    id: "phuquoc",
    name: "Phú Quốc",
    region: "Southern Islands",
    description:
      "Vietnam's largest island paradise with pristine beaches, lush national parks, and spectacular sunsets. Known for its fish sauce production, pearl farms, and luxury resorts.",
    gradientIndex: 6,
    imageAsset: "city_phuquoc",
  },
  {
    id: "dalat",
    name: "Đà Lạt",
    region: "Central Highlands",
    description:
      "The 'City of Eternal Spring' sits at 1,500m elevation with cool pine forests, flower gardens, and French colonial villas. A romantic escape famous for strawberries and artichoke tea.",
    gradientIndex: 7,
    imageAsset: "city_dalat",
  },
  {
    id: "sapa",
    name: "Sa Pa",
    region: "Northwest Highlands",
    description:
      "A misty mountain town near the Chinese border, surrounded by terraced rice paddies and home to vibrant ethnic minority villages. Gateway to Fansipan, Indochina's highest peak.",
    gradientIndex: 8,
    imageAsset: "city_sapa",
  },
  {
    id: "halong",
    name: "Hạ Long",
    region: "Northeast Vietnam",
    description:
      "Home to the legendary Hạ Long Bay, a UNESCO World Heritage Site with nearly 2,000 limestone karsts and islands rising from emerald waters. Best explored by overnight cruise.",
    gradientIndex: 9,
    imageAsset: "city_halong",
  },
];

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}
