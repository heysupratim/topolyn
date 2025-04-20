const { PrismaClient } = require("@prisma/client");

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Helper to ensure proper connection and error handling
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to the database");
    return prisma;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

module.exports = { prisma, connectToDatabase };
