import { PrismaClient } from "@prisma/client";

// Prisma 7 with TiDB Cloud: use standard PrismaClient with adapter
// For local development with direct TCP connection, we need the PrismaTiDBCloud adapter

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Return a client that will fail gracefully at query time
    return new PrismaClient();
  }

  try {
    // Try to use TiDB Cloud adapter if available
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaTiDBCloud } = require("@tidbcloud/prisma-adapter");
    const adapter = new PrismaTiDBCloud({ url });
    return new PrismaClient({ adapter });
  } catch {
    // Fallback to standard client (for environments where adapter isn't installed)
    return new PrismaClient();
  }
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
