import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { RentalStatus } from "./generated/prisma/enums.js";

const prisma = new PrismaClient();

const borrowerId = process.env.API_USER_ID ?? "demo-user";

const USERS = [
  {
    id: borrowerId,
    username: "alex_demo",
    email: "alex@borrowit.local",
    password: "dev-seed-not-for-production",
    karma: 48,
    karmaCount: 14,
    isVerified: true,
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    phoneNumber: "+91-9000010001",
    address: "Flat 4B, Sunrise Apartments, Linking Road",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400050",
    country: "India",
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: "seed-user-02",
    username: "riya_m",
    email: "riya@borrowit.local",
    password: "dev-seed-not-for-production",
    karma: 50,
    karmaCount: 22,
    isVerified: true,
    avatarUrl: "https://i.pravatar.cc/300?img=47",
    phoneNumber: "+91-9000020002",
    address: "12 Carter Road, Bandstand",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400050",
    country: "India",
    latitude: 19.0544,
    longitude: 72.8266,
  },
  {
    id: "seed-user-03",
    username: "sam_k",
    email: "sam@borrowit.local",
    password: "dev-seed-not-for-production",
    karma: 42,
    karmaCount: 9,
    isVerified: true,
    avatarUrl: "https://i.pravatar.cc/300?img=33",
    phoneNumber: "+91-9000030003",
    address: "88 SV Road, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400058",
    country: "India",
    latitude: 19.1364,
    longitude: 72.8296,
  },
  {
    id: "seed-user-04",
    username: "jordan_p",
    email: "jordan@borrowit.local",
    password: "dev-seed-not-for-production",
    karma: 45,
    karmaCount: 11,
    isVerified: false,
    avatarUrl: "https://i.pravatar.cc/300?img=15",
    phoneNumber: "+91-9000040004",
    address: "3rd Floor, Powai Plaza, Hiranandani",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400076",
    country: "India",
    latitude: 19.1183,
    longitude: 72.9094,
  },
  {
    id: "seed-user-05",
    username: "casey_r",
    email: "casey@borrowit.local",
    password: "dev-seed-not-for-production",
    karma: 51,
    karmaCount: 30,
    isVerified: true,
    avatarUrl: "https://i.pravatar.cc/300?img=51",
    phoneNumber: "+91-9000050005",
    address: "Near Phoenix Mall, Lower Parel",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400013",
    country: "India",
    latitude: 19.0059,
    longitude: 72.8264,
  },
] as const;

/** Five listing templates per owner (cycled for each user). */
const ITEM_BLUEPRINTS: {
  title: string;
  description: string;
  dailyRate: number;
  securityDeposit: number;
  images: string[];
}[] = [
  {
    title: "Cordless drill kit",
    description: "18V brushless motor, two batteries, charger, and hard case. Great for DIY furniture.",
    dailyRate: 120,
    securityDeposit: 2000,
    images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800"],
  },
  {
    title: "Mirrorless camera + 50mm lens",
    description: "APS-C body, 50mm f/1.8, spare battery, SD card. Ideal for events and portraits.",
    dailyRate: 450,
    securityDeposit: 15000,
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"],
  },
  {
    title: "Camping tent (4-person)",
    description: "Waterproof dome tent, footprint mat, and peg set. Used twice; no tears.",
    dailyRate: 280,
    securityDeposit: 4000,
    images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"],
  },
  {
    title: "Portable projector",
    description: "1080p LED projector, HDMI + USB-C, 120-inch recommended screen size. Includes tripod.",
    dailyRate: 350,
    securityDeposit: 8000,
    images: ["https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800"],
  },
  {
    title: "Mountain bike (medium)",
    description: "Aluminium frame, 21-speed, disc brakes, recently serviced. Helmet available on request.",
    dailyRate: 200,
    securityDeposit: 6000,
    images: ["https://images.unsplash.com/photo-1485965120184-e220f721e03d?w=800"],
  },
];

function itemId(userIndex: number, itemIndex: number) {
  return `item-u${String(userIndex + 1).padStart(2, "0")}-${String(itemIndex + 1).padStart(2, "0")}`;
}

function buildItems() {
  const rows: {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    dailyRate: number;
    securityDeposit: number;
    lat: number;
    lng: number;
    images: string[];
    isAvailable: boolean;
  }[] = [];

  for (let u = 0; u < USERS.length; u++) {
    const ownerId = USERS[u]!.id;
    const latBase = USERS[u]!.latitude;
    const lngBase = USERS[u]!.longitude;
    for (let i = 0; i < 5; i++) {
      const bp = ITEM_BLUEPRINTS[i]!;
      rows.push({
        id: itemId(u, i),
        ownerId,
        title: `${bp.title} (${USERS[u]!.username})`,
        description: bp.description,
        dailyRate: bp.dailyRate + u * 5 + i,
        securityDeposit: bp.securityDeposit + u * 100,
        lat: latBase + i * 0.004,
        lng: lngBase + i * 0.003,
        images: bp.images,
        isAvailable: true,
      });
    }
  }
  return rows;
}

async function main() {
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: [...USERS] });

  const items = buildItems();
  await prisma.item.createMany({ data: items });

  const rentedItemIds = [
    itemId(1, 0),
    itemId(3, 1),
    itemId(0, 0),
  ] as const;

  await prisma.item.updateMany({
    where: { id: { in: [...rentedItemIds] } },
    data: { isAvailable: false },
  });

  await prisma.rental.createMany({
    data: [
      {
        id: "seed-rental-01",
        itemId: rentedItemIds[0],
        borrowerId: USERS[0]!.id,
        lenderId: USERS[1]!.id,
        status: RentalStatus.PENDING,
        totalDays: 3,
        itemDailyRate: items.find((x) => x.id === rentedItemIds[0])!.dailyRate,
        pickupVideoUrl: "https://example.com/seed/pickup-rental-01.mp4",
        lastToken: "SEED-TOKEN-01",
      },
      {
        id: "seed-rental-02",
        itemId: rentedItemIds[1],
        borrowerId: USERS[2]!.id,
        lenderId: USERS[3]!.id,
        status: RentalStatus.APPROVED,
        totalDays: 7,
        itemDailyRate: items.find((x) => x.id === rentedItemIds[1])!.dailyRate,
        pickupVideoUrl: "https://example.com/seed/pickup-rental-02.mp4",
        returnVideoUrl: "https://example.com/seed/return-rental-02.mp4",
        lastToken: "SEED-TOKEN-02",
        activateTimer: new Date(Date.now() + 86400000),
      },
      {
        id: "seed-rental-03",
        itemId: rentedItemIds[2],
        borrowerId: USERS[4]!.id,
        lenderId: USERS[0]!.id,
        status: RentalStatus.PENDING,
        totalDays: 2,
        itemDailyRate: items.find((x) => x.id === rentedItemIds[2])!.dailyRate,
        pickupVideoUrl: "https://example.com/seed/pickup-rental-03.mp4",
        lastToken: "SEED-TOKEN-03",
      },
    ],
  });

  const chat1 = await prisma.chat.create({ data: { rentalId: "seed-rental-01" } });
  const chat2 = await prisma.chat.create({ data: { rentalId: "seed-rental-02" } });
  const chat3 = await prisma.chat.create({ data: { rentalId: "seed-rental-03" } });

  await prisma.message.createMany({
    data: [
      {
        chatId: chat1.id,
        senderId: USERS[0]!.id,
        content: "Hi Riya — can I pick up the drill tomorrow after 6pm?",
      },
      {
        chatId: chat2.id,
        senderId: USERS[2]!.id,
        content: "Jordan, thanks for approving. I will return the tent dry and packed.",
      },
      {
        chatId: chat3.id,
        senderId: USERS[4]!.id,
        content: "Alex, is your place in Bandra OK for handoff on Saturday morning?",
      },
    ],
  });
}

main()
  .then(() => {
    console.log("Seed finished: 5 users, 25 items, 3 rentals, 3 chats, 3 messages.");
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
