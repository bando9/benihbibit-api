import { prisma } from "../src/lib/prisma";
import { products } from "../src/moduls/products/data";

async function main() {
  console.log("Seeding process...");

  for (const product of products) {
    const upsertProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      create: product,
      update: product,
    });

    console.log(`💻 Laptop: ${upsertProduct.slug}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
