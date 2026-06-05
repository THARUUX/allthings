import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding ALLTHINGS database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@allthings.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  let adminId = "";
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        bio: "Platform Administrator",
      },
    });
    adminId = admin.id;
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    adminId = existingAdmin.id;
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Seed default categories
  const categories = [
    { name: "Technology", slug: "technology", description: "All things tech, coding, gadgets, and software development." },
    { name: "Business & Finance", slug: "business-finance", description: "Insights into economics, side hustles, and wealth generation." },
    { name: "Marketing & SEO", slug: "marketing-seo", description: "Search Engine Optimization, copywriting, and traffic generation tips." },
    { name: "Lifestyle & Health", slug: "lifestyle-health", description: "Tips and stories on healthy living, productivity, and everyday life." },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Default categories seeded");

  // Seed default tags
  const tags = [
    { name: "Programming", slug: "programming" },
    { name: "Blogging", slug: "blogging" },
    { name: "Adsterra", slug: "adsterra" },
    { name: "Passive Income", slug: "passive-income" },
    { name: "SEO Hacks", slug: "seo-hacks" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log("✅ Default tags seeded");

  // Seed default platform and Adsterra settings
  const defaultSettings = [
    { key: "platformName", value: "ALLTHINGS" },
    { key: "platformDescription", value: "Publish articles, read trending stories, and build your digital footprint." },
    { key: "adsterra_popunder", value: "<!-- Adsterra Popunder Script Placeholder -->" },
    { key: "adsterra_banner_728x90", value: "<!-- Adsterra Banner 728x90 Script Placeholder -->" },
    { key: "adsterra_banner_300x250", value: "<!-- Adsterra Banner 300x250 Script Placeholder -->" },
    { key: "adsterra_native_ad", value: "<!-- Adsterra Native Ad Script Placeholder -->" },
    { key: "adsterra_social_bar", value: "<!-- Adsterra Social Bar Script Placeholder -->" },
    { key: "adsterra_direct_link", value: "" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Platform settings & Adsterra placeholders seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log(`📧 Admin email: ${adminEmail}`);
  console.log(`🔑 Admin password: ${adminPassword}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
