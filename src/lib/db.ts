import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set("uselibpqcompat", "true");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url.toString() }),
  });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Proxy that lazily initializes the client
const handler: ProxyHandler<object> = {
  get(_, prop: string | symbol) {
    const client = getPrismaClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
};

export const prisma = new Proxy({}, handler) as unknown as PrismaClient;

export default prisma;
