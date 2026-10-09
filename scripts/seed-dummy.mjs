import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'dummy@jobos.com';
  const password = 'password123';
  
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Dummy User',
      }
    });
    console.log('Created dummy user!');
  } else {
    console.log('Dummy user already exists!');
  }
  
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
