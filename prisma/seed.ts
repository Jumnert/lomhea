import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // Core Categories: Temple, Beach, Waterfall, Nature, Museum, Market

  const places = [
    // 5 Temples
    {
      name: "Angkor Wat",
      nameKh: "អង្គរវត្ត",
      description:
        "Angkor Wat is a temple complex in Cambodia and the largest religious monument in the world by land area, on a site measuring 162.6 hectares.",
      lat: 13.4125,
      lng: 103.867,
      category: "Temple",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1591147132145-c6466f81a79f?q=80&w=1000",
        "https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=1000",
      ],
    },
    {
      name: "Bayon Temple",
      nameKh: "ប្រាសាទបាយ័ន",
      description:
        "The Bayon is a richly decorated Khmer temple at Angkor in Cambodia. Built in the late 12th or early 13th century as the state temple of the Mahayana Buddhist King Jayavarman VII.",
      lat: 13.4412,
      lng: 103.8588,
      category: "Temple",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000",
      ],
    },
    {
      name: "Ta Prohm",
      nameKh: "ប្រាសាទតាព្រហ្ម",
      description:
        "Ta Prohm is the modern name of the temple at Angkor, Siem Reap, Cambodia, built in the Bayon style largely in the late 12th and early 13th centuries.",
      lat: 13.4348,
      lng: 103.8893,
      category: "Temple",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1563911892437-1feda1073b64?q=80&w=1000",
      ],
    },
    {
      name: "Preah Vihear Temple",
      nameKh: "ប្រាសាទព្រះវិហារ",
      description:
        "Prasat Preah Vihear is an ancient Hindu temple built during the period of the Khmer Empire, that is situated atop a 525-metre cliff in the Dângrêk Mountains.",
      lat: 14.3908,
      lng: 104.6801,
      category: "Temple",
      province: "Preah Vihear",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1628102430030-cf2f20667dd5?q=80&w=1000",
      ],
    },
    {
      name: "Koh Ker",
      nameKh: "កោះកេរ្ដិ៍",
      description:
        "Koh Ker is a remote archaeological site in northern Cambodia about 120 kilometres away from Siem Reap and the ancient site of Angkor.",
      lat: 13.7844,
      lng: 104.5401,
      category: "Temple",
      province: "Preah Vihear",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?q=80&w=1000",
      ],
    },

    // 4 Beaches
    {
      name: "Koh Rong",
      nameKh: "កោះរ៉ុង",
      description:
        "Koh Rong is the second largest island of Cambodia. The word Rong might refer to an old term for cave or tunnel.",
      lat: 10.7,
      lng: 103.2333,
      category: "Beach",
      province: "Sihanoukville",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
      ],
    },
    {
      name: "Otres Beach",
      nameKh: "ឆ្នេរអូត្រេស",
      description:
        "Otres Beach is a quieter alternative to the more central beaches in Sihanoukville, known for its pristine white sand and clear water.",
      lat: 10.5583,
      lng: 103.5417,
      category: "Beach",
      province: "Sihanoukville",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000",
      ],
    },
    {
      name: "Koh Rong Sanloem",
      nameKh: "កោះរ៉ុងសន្លឹម",
      description:
        "Koh Rong Sanloem is an island off the coast of Sihanoukville, Cambodia. It is the smaller sister island to Koh Rong.",
      lat: 10.5833,
      lng: 103.3,
      category: "Beach",
      province: "Sihanoukville",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1000",
      ],
    },
    {
      name: "Long Set Beach",
      nameKh: "ឆ្នេរឡុងសិត",
      description:
        "Also known as 4K Beach, this is one of the most beautiful and serene beaches on Koh Rong.",
      lat: 10.675,
      lng: 103.285,
      category: "Beach",
      province: "Sihanoukville",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1506929113675-b9299d39bb14?q=80&w=1000",
      ],
    },

    // 3 Waterfalls
    {
      name: "Phnom Kulen Waterfall",
      nameKh: "ទឹកធ្លាក់ភ្នំគូលែន",
      description:
        "Located within the Phnom Kulen National Park, this waterfall is a popular spot for locals and tourists alike.",
      lat: 13.5647,
      lng: 104.1086,
      category: "Waterfall",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000",
      ],
    },
    {
      name: "Kbal Chhay Waterfall",
      nameKh: "ទឹកធ្លាក់ក្បាលឆាយ",
      description:
        "The Kbal Chhay Waterfalls are located on the Prek Tuk Sap River about 7 km from Sihanoukville.",
      lat: 10.6722,
      lng: 103.6067,
      category: "Waterfall",
      province: "Sihanoukville",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000",
      ],
    },
    {
      name: "Bousra Waterfall",
      nameKh: "ទឹកធ្លាក់ប៊ូស្រា",
      description:
        "Bousra Waterfall is located in the Pich Chreada District of Mondulkiri Province, and is one of the most famous waterfalls in Cambodia.",
      lat: 12.3583,
      lng: 107.4167,
      category: "Waterfall",
      province: "Mondulkiri",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1433086966358-54859d0ee716?q=80&w=1000",
      ],
    },

    // 3 Nature
    {
      name: "Tonle Sap Lake",
      nameKh: "បឹងទន្លេសាប",
      description:
        "The Tonlé Sap is a combined lake and river system of huge importance to Cambodia, and is the largest freshwater lake in Southeast Asia.",
      lat: 13.1333,
      lng: 104.0,
      category: "Nature",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1540959733332-e94e270b4052?q=80&w=1000",
      ],
    },
    {
      name: "Cardamom Mountains",
      nameKh: "ជួរភ្នំក្រវាញ",
      description:
        "The Cardamom Mountains is a mountain range in southwestern Cambodia and eastern Thailand.",
      lat: 12.0,
      lng: 103.25,
      category: "Nature",
      province: "Koh Kong",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000",
      ],
    },
    {
      name: "Prek Toal Sanctuary",
      nameKh: "តំបន់អភិរក្សព្រែកទាល់",
      description:
        "Prek Toal Bird Sanctuary is one of the most important breeding grounds in Southeast Asia for endangered waterbirds.",
      lat: 13.15,
      lng: 103.65,
      category: "Nature",
      province: "Battambang",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1000",
      ],
    },

    // 3 Museums
    {
      name: "National Museum of Cambodia",
      nameKh: "សារមន្ទីរជាតិ",
      description:
        "The National Museum of Cambodia in Phnom Penh is Cambodia's largest museum of cultural history and is the country's leading historical and archaeological museum.",
      lat: 11.5658,
      lng: 104.9292,
      category: "Museum",
      province: "Phnom Penh",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1518112166137-85691456ed35?q=80&w=1000",
      ],
    },
    {
      name: "Tuol Sleng Genocide Museum",
      nameKh: "សារមន្ទីរឧក្រិដ្ឋកម្មប្រល័យពូជសាសន៍ទួលស្លែង",
      description:
        "A museum in Phnom Penh, the capital of Cambodia, chronicling the Cambodian genocide.",
      lat: 11.5494,
      lng: 104.9175,
      category: "Museum",
      province: "Phnom Penh",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1588668214407-6ea9a6d7c26e?q=80&w=1000",
      ],
    },
    {
      name: "Angkor National Museum",
      nameKh: "សារមន្ទីរជាតិអង្គរ",
      description:
        "An archaeological museum dedicated to the collection, preservation and presentation of Angkorian artifacts, also provides information and education about art and culture of Khmer civilization.",
      lat: 13.3667,
      lng: 103.8583,
      category: "Museum",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1515542706656-8e6ef17a1ed2?q=80&w=1000",
      ],
    },

    // 2 Markets
    {
      name: "Phsar Thmei (Central Market)",
      nameKh: "ផ្សារធំថ្មី",
      description:
        "The Central Market is an Art Deco landmark in Phnom Penh, the capital of Cambodia. The bright yellow building completed in 1937 has a unique central dome with four wings.",
      lat: 11.5694,
      lng: 104.9211,
      category: "Market",
      province: "Phnom Penh",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=1000",
      ],
    },
    {
      name: "Siem Reap Night Market",
      nameKh: "ផ្សាររាត្រីខេត្តសៀមរាប",
      description:
        "The Angkor Night Market in Siem Reap is the first night market in Cambodia, established to preserve Khmer traditional handicrafts.",
      lat: 13.3547,
      lng: 103.8547,
      category: "Market",
      province: "Siem Reap",
      isVerified: true,
      images: [
        "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=1000",
      ],
    },
  ];

  for (const place of places) {
    const createdPlace = await (prisma.place as any).create({
      data: {
        ...place,
        accommodations: {
          create: [
            {
              name: "Luxury Resort",
              type: "Hotel",
              priceRange: "$100 - $300",
            },
            {
              name: "Budget Guesthouse",
              type: "Guesthouse",
              priceRange: "$10 - $25",
            },
          ],
        },
        foods: {
          create: [
            {
              name: "Traditional Khmer Restaurant",
              type: "Restaurant",
              priceRange: "$5 - $15",
            },
            {
              name: "Street Food Stalls",
              type: "Street Food",
              priceRange: "$1 - $5",
            },
          ],
        },
      },
    });
    console.log(`Created place: ${createdPlace.name}`);
  }

  // Create an Admin user
  await (prisma.user as any).upsert({
    where: { email: "admin@lomhea.com" },
    update: {},
    create: {
      email: "admin@lomhea.com",
      name: "Lomhea Admin",
      role: "ADMIN",
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
