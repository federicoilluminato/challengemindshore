const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@mindshore.local' },
    update: {},
    create: {
      email: 'demo@mindshore.local',
      name: 'Demo User',
      passwordHash: 'demo-password-hash',
    },
  });

  const nasaImage = await prisma.nasaImage.upsert({
    where: { nasaId: 'demo-nasa-001' },
    update: {},
    create: {
      nasaId: 'demo-nasa-001',
      title: 'Mars Horizon at Dusk',
      description: 'Sample seeded image for the MindShore challenge.',
      mediaType: 'image',
      imageUrl: 'https://images-assets.nasa.gov/image/PIAxxxxxx/PIAxxxxxx~thumb.jpg',
      nasaDate: new Date('2024-01-01T00:00:00.000Z'),
    },
  });

  const tag = await prisma.tag.upsert({
    where: { name: 'demo' },
    update: {},
    create: { name: 'demo' },
  });

  const collection = await prisma.collection.upsert({
    where: {
      id: 'demo-collection',
    },
    update: {},
    create: {
      id: 'demo-collection',
      name: 'Mars missions',
      description: 'Seeded collection used to validate the data model.',
      userId: user.id,
    },
  });

  await prisma.collectionItem.upsert({
    where: {
      collectionId_nasaImageId: {
        collectionId: collection.id,
        nasaImageId: nasaImage.id,
      },
    },
    update: {},
    create: {
      collectionId: collection.id,
      nasaImageId: nasaImage.id,
    },
  });

  await prisma.imageTag.upsert({
    where: {
      nasaImageId_tagId: {
        nasaImageId: nasaImage.id,
        tagId: tag.id,
      },
    },
    update: {},
    create: {
      nasaImageId: nasaImage.id,
      tagId: tag.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
