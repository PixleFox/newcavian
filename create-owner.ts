import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // or 'argon2'

const prisma = new PrismaClient();

async function createFirstAdmin() {
  const password = "yourpassword123"; // plain password
  const passwordHash = await bcrypt.hash(password, 10); // bcrypt it

  await prisma.admin.create({
    data: {
      id: 1, // manually setting id
      email: "you@example.com",
      phoneNumber: "09123456789",
      firstName: "YourFirstName",
      lastName: "YourLastName",
      passwordHash: passwordHash,
      role: "OWNER", // must match the enum
      isActive: true,
    },
  });

  console.log("First admin created!");
}

createFirstAdmin()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
