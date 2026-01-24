import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample customer profiles
  const customers = await Promise.all([
    prisma.profile.create({
      data: {
        userId: 'demo-customer-1',
        fullName: 'Sarah Johnson',
        role: 'CUSTOMER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-customer-2',
        fullName: 'Michael Brown',
        role: 'CUSTOMER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-customer-3',
        fullName: 'Emily Davis',
        role: 'CUSTOMER',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customer profiles`);

  // Create sample business owner profiles
  const businessOwners = await Promise.all([
    prisma.profile.create({
      data: {
        userId: 'demo-owner-1',
        fullName: 'David Williams',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-2',
        fullName: 'Lisa Thompson',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-3',
        fullName: 'James Wilson',
        role: 'BUSINESS_OWNER',
      },
    }),
  ]);

  console.log(`✅ Created ${businessOwners.length} business owner profiles`);

  // Create more business owner profiles for expanded businesses
  const additionalBusinessOwners = await Promise.all([
    prisma.profile.create({
      data: {
        userId: 'demo-owner-4',
        fullName: 'James Mitchell',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-5',
        fullName: 'Emma Thompson',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-6',
        fullName: 'Robert Davies',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-7',
        fullName: 'Sophie Clarke',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-8',
        fullName: 'Lisa Roberts',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-9',
        fullName: 'Peter Hughes',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-10',
        fullName: 'Andrew Price',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-11',
        fullName: 'Rachel Morgan',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-12',
        fullName: 'Daniel Lewis',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-13',
        fullName: 'Tom Davies',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-14',
        fullName: 'Oliver Smith',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-15',
        fullName: 'Chris Williams',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-16',
        fullName: 'Michael Brown',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-17',
        fullName: 'Benjamin Taylor',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-18',
        fullName: 'Charlotte Evans',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-19',
        fullName: 'George Phillips',
        role: 'BUSINESS_OWNER',
      },
    }),
    prisma.profile.create({
      data: {
        userId: 'demo-owner-20',
        fullName: 'Hannah Wilson',
        role: 'BUSINESS_OWNER',
      },
    }),
  ]);

  console.log(
    `✅ Created ${additionalBusinessOwners.length} additional business owner profiles`
  );

  // Create sample businesses with services
  const allBusinessOwners = [...businessOwners, ...additionalBusinessOwners];

  // CLEANING BUSINESSES
  const sparkleClean = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[0].id,
      businessName: 'Sparkle Clean Cardiff',
      bio: 'Professional residential and commercial cleaning services in Cardiff.',
      serviceCategory: 'CLEANING',
      services: {
        create: [
          {
            name: 'Regular House Cleaning',
            description: 'Weekly or bi-weekly house cleaning service.',
            price: 45.0,
          },
          {
            name: 'Deep Cleaning',
            description: 'Comprehensive spring cleaning.',
            price: 85.0,
          },
          {
            name: 'Office Cleaning',
            description: 'Commercial cleaning for offices.',
            price: 65.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const cleanSweep = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[3].id,
      businessName: 'Clean Sweep Services',
      bio: 'Specialist carpet and window cleaning services.',
      serviceCategory: 'CLEANING',
      services: {
        create: [
          {
            name: 'Carpet Cleaning',
            description: 'Professional steam carpet cleaning.',
            price: 55.0,
          },
          {
            name: 'Window Cleaning',
            description: 'Interior and exterior window cleaning.',
            price: 35.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const freshStart = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[4].id,
      businessName: 'Fresh Start Cleaning',
      bio: 'End of tenancy and post-construction cleaning specialists.',
      serviceCategory: 'CLEANING',
      services: {
        create: [
          {
            name: 'Move-Out Cleaning',
            description: 'End of tenancy cleaning service.',
            price: 95.0,
          },
          {
            name: 'After Builders Cleaning',
            description: 'Post-construction cleaning.',
            price: 120.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // PLUMBING BUSINESSES
  const pristinePlumbing = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[1].id,
      businessName: 'Pristine Plumbing Swansea',
      bio: '24/7 emergency plumbing services. Gas Safe registered.',
      serviceCategory: 'PLUMBING',
      services: {
        create: [
          {
            name: 'Emergency Plumbing',
            description: '24/7 emergency plumbing service.',
            price: 75.0,
          },
          {
            name: 'Boiler Service',
            description: 'Annual boiler servicing and repair.',
            price: 85.0,
          },
          {
            name: 'Bathroom Installation',
            description: 'Complete bathroom installation.',
            price: 850.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const quickFix = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[5].id,
      businessName: 'Quick Fix Plumbing',
      bio: 'Fast and reliable plumbing repairs.',
      serviceCategory: 'PLUMBING',
      services: {
        create: [
          {
            name: 'Drain Unblocking',
            description: 'Fast drain unblocking service.',
            price: 55.0,
          },
          {
            name: 'Tap Repair',
            description: 'Repair and replacement of taps.',
            price: 45.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // ELECTRICAL BUSINESSES
  const valleyElectrical = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[2].id,
      businessName: 'Valley Electrical Newport',
      bio: 'Qualified electricians. NICEIC approved.',
      serviceCategory: 'ELECTRICAL',
      services: {
        create: [
          {
            name: 'Electrical Safety Check',
            description: 'Comprehensive electrical safety inspection.',
            price: 95.0,
          },
          {
            name: 'Socket Installation',
            description: 'New electrical socket installation.',
            price: 60.0,
          },
          {
            name: 'Lighting Installation',
            description: 'Professional light fitting installation.',
            price: 55.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const brightSpark = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[6].id,
      businessName: 'Bright Spark Electric',
      bio: 'Part P certified electricians for all electrical work.',
      serviceCategory: 'ELECTRICAL',
      services: {
        create: [
          {
            name: 'Rewiring',
            description: 'Full or partial house rewiring.',
            price: 1200.0,
          },
          {
            name: 'Fuse Box Upgrade',
            description: 'Upgrade to modern consumer units.',
            price: 250.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // DECORATION BUSINESSES
  const perfectPaint = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[7].id,
      businessName: 'Perfect Paint Cardiff',
      bio: 'Professional painting and decorating services.',
      serviceCategory: 'DECORATION',
      services: {
        create: [
          {
            name: 'Interior Painting',
            description: 'Professional interior painting.',
            price: 80.0,
          },
          {
            name: 'Exterior Painting',
            description: 'Weather-resistant exterior painting.',
            price: 120.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const colorMasters = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[8].id,
      businessName: 'Color Masters',
      bio: 'Expert wallpapering and painting specialists.',
      serviceCategory: 'DECORATION',
      services: {
        create: [
          {
            name: 'Wallpapering',
            description: 'Expert wallpaper hanging and removal.',
            price: 65.0,
          },
          {
            name: 'Room Painting',
            description: 'Single room painting service.',
            price: 50.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // PEST CONTROL BUSINESSES
  const bugBusters = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[9].id,
      businessName: 'Bug Busters',
      bio: 'Professional pest control and removal services.',
      serviceCategory: 'PEST_CONTROL',
      services: {
        create: [
          {
            name: 'Rat Removal',
            description: 'Professional rat control service.',
            price: 80.0,
          },
          {
            name: 'Ant Treatment',
            description: 'Effective ant nest treatment.',
            price: 55.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const pestAway = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[10].id,
      businessName: 'Pest Away',
      bio: 'Safe and effective pest removal by trained professionals.',
      serviceCategory: 'PEST_CONTROL',
      services: {
        create: [
          {
            name: 'Wasp Nest Removal',
            description: 'Safe wasp nest removal.',
            price: 70.0,
          },
          {
            name: 'Bed Bug Treatment',
            description: 'Thorough bed bug eradication.',
            price: 95.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const critterControl = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[11].id,
      businessName: 'Critter Control',
      bio: 'Humane pest removal and prevention services.',
      serviceCategory: 'PEST_CONTROL',
      services: {
        create: [
          {
            name: 'Mouse Control',
            description: 'Humane mouse removal service.',
            price: 65.0,
          },
          {
            name: 'Cockroach Extermination',
            description: 'Complete cockroach extermination.',
            price: 85.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // CAR DETAILING BUSINESSES
  const shineAuto = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[12].id,
      businessName: 'Shine Auto Detailing',
      bio: 'Professional car cleaning and valeting services.',
      serviceCategory: 'CAR_DETAILING',
      services: {
        create: [
          {
            name: 'Car Wash',
            description: 'Basic exterior car wash.',
            price: 20.0,
          },
          {
            name: 'Full Valet',
            description: 'Complete interior and exterior valeting.',
            price: 45.0,
          },
          {
            name: 'Interior Detailing',
            description: 'Deep clean interior detailing.',
            price: 35.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const eliteCar = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[13].id,
      businessName: 'Elite Car Care',
      bio: 'Premium car detailing and protection services.',
      serviceCategory: 'CAR_DETAILING',
      services: {
        create: [
          {
            name: 'Paint Protection',
            description: 'Ceramic coating application.',
            price: 150.0,
          },
          {
            name: 'Car Wash',
            description: 'Premium hand car wash.',
            price: 25.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // HANDYMAN BUSINESSES
  const handyHelper = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[14].id,
      businessName: 'Handy Helper',
      bio: 'Professional handyman services for all home repairs.',
      serviceCategory: 'HANDYMAN',
      services: {
        create: [
          {
            name: 'Furniture Assembly',
            description: 'Professional flat-pack furniture assembly.',
            price: 40.0,
          },
          {
            name: 'Door Hanging',
            description: 'Internal door hanging service.',
            price: 55.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const fixItFast = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[15].id,
      businessName: 'Fix It Fast',
      bio: 'Quick and reliable handyman services.',
      serviceCategory: 'HANDYMAN',
      services: {
        create: [
          {
            name: 'Shelf Installation',
            description: 'Wall-mounted shelf installation.',
            price: 35.0,
          },
          {
            name: 'Picture Hanging',
            description: 'Professional picture hanging.',
            price: 25.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const allTrades = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[16].id,
      businessName: 'All Trades Solutions',
      bio: 'Multi-skilled tradesmen for all home improvements.',
      serviceCategory: 'HANDYMAN',
      services: {
        create: [
          {
            name: 'General Repairs',
            description: 'Minor home repairs.',
            price: 45.0,
          },
          {
            name: 'TV Wall Mounting',
            description: 'Safe TV wall mounting.',
            price: 50.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  // GARDENING BUSINESSES
  const greenThumb = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[17].id,
      businessName: 'Green Thumb Gardens',
      bio: 'Professional garden maintenance services.',
      serviceCategory: 'GARDENING',
      services: {
        create: [
          {
            name: 'Lawn Mowing',
            description: 'Regular lawn mowing and edging.',
            price: 30.0,
          },
          {
            name: 'Hedge Trimming',
            description: 'Professional hedge cutting.',
            price: 40.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const gardenMasters = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[18].id,
      businessName: 'Garden Masters',
      bio: 'Complete garden design and landscaping services.',
      serviceCategory: 'GARDENING',
      services: {
        create: [
          {
            name: 'Garden Design',
            description: 'Complete garden design service.',
            price: 500.0,
          },
          {
            name: 'Garden Maintenance',
            description: 'Regular garden maintenance.',
            price: 35.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  const yardPerfect = await prisma.business.create({
    data: {
      ownerId: allBusinessOwners[19].id,
      businessName: 'Yard Perfect',
      bio: 'Expert tree care and lawn treatment services.',
      serviceCategory: 'GARDENING',
      services: {
        create: [
          {
            name: 'Tree Pruning',
            description: 'Safe tree pruning by qualified arborists.',
            price: 75.0,
          },
          {
            name: 'Lawn Treatment',
            description: 'Lawn fertilization and weed control.',
            price: 45.0,
          },
        ],
      },
    },
    include: { services: true },
  });

  console.log('✅ Created 20 businesses with services:');
  console.log(
    `  - ${sparkleClean.businessName} (${sparkleClean.services.length} services)`
  );
  console.log(
    `  - ${cleanSweep.businessName} (${cleanSweep.services.length} services)`
  );
  console.log(
    `  - ${freshStart.businessName} (${freshStart.services.length} services)`
  );
  console.log(
    `  - ${pristinePlumbing.businessName} (${pristinePlumbing.services.length} services)`
  );
  console.log(
    `  - ${quickFix.businessName} (${quickFix.services.length} services)`
  );
  console.log(
    `  - ${valleyElectrical.businessName} (${valleyElectrical.services.length} services)`
  );
  console.log(
    `  - ${brightSpark.businessName} (${brightSpark.services.length} services)`
  );
  console.log(
    `  - ${perfectPaint.businessName} (${perfectPaint.services.length} services)`
  );
  console.log(
    `  - ${colorMasters.businessName} (${colorMasters.services.length} services)`
  );
  console.log(
    `  - ${bugBusters.businessName} (${bugBusters.services.length} services)`
  );
  console.log(
    `  - ${pestAway.businessName} (${pestAway.services.length} services)`
  );
  console.log(
    `  - ${critterControl.businessName} (${critterControl.services.length} services)`
  );
  console.log(
    `  - ${shineAuto.businessName} (${shineAuto.services.length} services)`
  );
  console.log(
    `  - ${eliteCar.businessName} (${eliteCar.services.length} services)`
  );
  console.log(
    `  - ${handyHelper.businessName} (${handyHelper.services.length} services)`
  );
  console.log(
    `  - ${fixItFast.businessName} (${fixItFast.services.length} services)`
  );
  console.log(
    `  - ${allTrades.businessName} (${allTrades.services.length} services)`
  );
  console.log(
    `  - ${greenThumb.businessName} (${greenThumb.services.length} services)`
  );
  console.log(
    `  - ${gardenMasters.businessName} (${gardenMasters.services.length} services)`
  );
  console.log(
    `  - ${yardPerfect.businessName} (${yardPerfect.services.length} services)`
  );

  // Create sample bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        customerId: customers[0].id,
        businessId: sparkleClean.id,
        serviceId: sparkleClean.services[0].id, // Regular House Cleaning
        bookingDate: new Date('2024-09-15T10:00:00Z'),
        totalCost: 45.0,
        status: 'CONFIRMED',
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[1].id,
        businessId: cleanSweep.id,
        serviceId: cleanSweep.services[0].id, // Carpet Cleaning
        bookingDate: new Date('2024-09-20T14:00:00Z'),
        totalCost: 55.0,
        status: 'PENDING',
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[2].id,
        businessId: pristinePlumbing.id,
        serviceId: pristinePlumbing.services[1].id, // Boiler Service
        bookingDate: new Date('2024-09-18T09:00:00Z'),
        totalCost: 85.0,
        status: 'COMPLETED',
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[0].id,
        businessId: shineAuto.id,
        serviceId: shineAuto.services[0].id, // Car Wash
        bookingDate: new Date('2024-10-10T11:00:00Z'),
        totalCost: 20.0,
        status: 'COMPLETED',
      },
    }),
    prisma.booking.create({
      data: {
        customerId: customers[1].id,
        businessId: greenThumb.id,
        serviceId: greenThumb.services[0].id, // Lawn Mowing
        bookingDate: new Date('2024-10-12T09:00:00Z'),
        totalCost: 30.0,
        status: 'CONFIRMED',
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} sample bookings`);

  // Display final stats
  const stats = await Promise.all([
    prisma.profile.count(),
    prisma.business.count(),
    prisma.service.count(),
    prisma.booking.count(),
  ]);

  console.log('\n📊 Database seeding complete!');
  console.log(`   👥 Profiles: ${stats[0]}`);
  console.log(`   🏢 Businesses: ${stats[1]}`);
  console.log(`   🛠️  Services: ${stats[2]}`);
  console.log(`   📅 Bookings: ${stats[3]}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
