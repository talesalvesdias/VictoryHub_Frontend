import { PrismaClient } from "@prisma/client";
import { MOCK_TOURNAMENTS } from "../src/lib/tournaments.mock";

const prisma = new PrismaClient();

async function main() {
  for (const t of MOCK_TOURNAMENTS) {
    await prisma.tournament.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        game: t.game,
        status: t.status,
        description: t.description,
        prize: t.prize,
        format: t.format,
        rankRequirement: t.rankRequirement,
        rules: t.rules,
        maxSlots: t.maxSlots,
        filledSlots: t.filledSlots,
        isLive: t.isLive,
      },
      create: {
        name: t.name,
        slug: t.slug,
        game: t.game,
        status: t.status,
        description: t.description,
        prize: t.prize,
        format: t.format,
        rankRequirement: t.rankRequirement,
        rules: t.rules,
        maxSlots: t.maxSlots,
        filledSlots: t.filledSlots,
        isLive: t.isLive,
      },
    });
  }
  console.log(`Seed concluído: ${MOCK_TOURNAMENTS.length} torneios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
