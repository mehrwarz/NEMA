import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { subjectAreas, learningPaths, siteConfig, lectures } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  const sql = neon(DATABASE_URL!);
  const db = drizzle({ client: sql });

  console.log("🌱 Seeding database...");

  // Seed site config
  await db
    .insert(siteConfig)
    .values([
      { key: "site_name", value: "mehrabani.org" },
      { key: "site_tagline", value: "KNOWLEDGE FOR ALL" },
      {
        key: "hero_title",
        value: "Free education materials for every dreamer.",
      },
      {
        key: "hero_subtitle",
        value:
          "Whether you are starting primary school, preparing for college, or mastering a new skill on your own, Mehrabani provides high-quality, open-source knowledge absolutely free.",
      },
      { key: "hero_badge", value: "100% Free Non-Profit Education" },
      { key: "stat_resources", value: "10k+" },
    ])
    .onConflictDoNothing();

  console.log("✅ Site config seeded");

  // Seed subject areas
  await db
    .insert(subjectAreas)
    .values([
      {
        title: "Mathematics",
        description: "Algebra, Calculus, Statistics & Geometry.",
        icon: "calculator",
        colorScheme: "blue",
        sortOrder: 1,
      },
      {
        title: "Physics",
        description: "Mechanics, Thermodynamics & Quantum.",
        icon: "atom",
        colorScheme: "purple",
        sortOrder: 2,
      },
      {
        title: "Chemistry",
        description: "Organic, Inorganic & Physical Chemistry.",
        icon: "flask-conical",
        colorScheme: "green",
        sortOrder: 3,
      },
      {
        title: "Biology",
        description: "Molecular Biology, Ecology & Genetics.",
        icon: "dna",
        colorScheme: "emerald",
        sortOrder: 4,
      },
      {
        title: "Computer Science",
        description: "Programming, Algorithms & Data Structures.",
        icon: "code",
        colorScheme: "indigo",
        sortOrder: 5,
      },
      {
        title: "History",
        description: "World History, Civilizations & Modern Era.",
        icon: "landmark",
        colorScheme: "amber",
        sortOrder: 6,
      },
      {
        title: "Literature",
        description: "Poetry, Prose, Drama & Literary Analysis.",
        icon: "book-open",
        colorScheme: "rose",
        sortOrder: 7,
      },
      {
        title: "Engineering",
        description: "Electrical, Mechanical & Civil Engineering.",
        icon: "wrench",
        colorScheme: "slate",
        sortOrder: 8,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Subject areas seeded");

  // Seed learning paths
  await db
    .insert(learningPaths)
    .values([
      {
        title: "Primary Students",
        subtitle: "Grades 1-8",
        description:
          "Foundational subjects with fun interactive lessons, diagrams, and age-appropriate exercises.",
        icon: "graduation-cap",
        sortOrder: 1,
      },
      {
        title: "College Students",
        subtitle: "Undergraduate & Graduate",
        description:
          "Advanced topics, research resources, past exams, and academic references.",
        icon: "university",
        sortOrder: 2,
      },
      {
        title: "Self-Learners",
        subtitle: "Any Age, Any Pace",
        description:
          "Flexible, self-paced courses with video guides, practice tests, and certification prep.",
        icon: "brain",
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Learning paths seeded");

  // Seed lectures/videos
  await db
    .insert(lectures)
    .values([
      {
        title: "Introduction to Calculus & Limits",
        description: "Learn the foundational concepts of limits, derivatives, and integrals visually with elegant animations.",
        category: "Mathematics",
        videoUrl: "https://www.youtube.com/embed/WUvTyaaNkzM",
        duration: 1020, // 17 min
        sortOrder: 1,
      },
      {
        title: "Linear Algebra: Essence of Vector Spaces",
        description: "Explore vectors, linear combinations, span, and basis vectors from a geometric perspective.",
        category: "Mathematics",
        videoUrl: "https://www.youtube.com/embed/fNk_zzaMoSs",
        duration: 598, // ~10 min
        sortOrder: 2,
      },
      {
        title: "The Map of Physics",
        description: "An overview of how all the different fields of physics fit together, from classical mechanics to quantum gravity.",
        category: "Physics",
        videoUrl: "https://www.youtube.com/embed/ZihywtixUYo",
        duration: 919, // ~15 min
        sortOrder: 1,
      },
      {
        title: "Quantum Mechanics: The Double Slit Experiment",
        description: "Understand the wave-particle duality and the fundamental mystery of quantum observation.",
        category: "Physics",
        videoUrl: "https://www.youtube.com/embed/Q1YqgPAtzho",
        duration: 480, // 8 min
        sortOrder: 2,
      },
      {
        title: "Harvard CS50 - Lecture 0: Computational Thinking",
        description: "Introduction to the intellectual enterprises of computer science and the art of programming.",
        category: "Computer Science",
        videoUrl: "https://www.youtube.com/embed/e7a5NfIszP0",
        duration: 1540, // ~25 min excerpt
        sortOrder: 1,
      },
      {
        title: "Binary and Hexadecimal Basics",
        description: "How computers count, store information, and process instruction sets using base-2 and base-16.",
        category: "Computer Science",
        videoUrl: "https://www.youtube.com/embed/4EJKH_W-vkw",
        duration: 612, // 10 min
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Lectures seeded");
  console.log("🎉 Database seeding complete!");
}

seed().catch(console.error);
