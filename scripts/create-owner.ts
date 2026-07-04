import { PrismaClient } from '@prisma/client';
     import { generateAdminId } from '../src/lib/generateRandomId';
     import { validatePhoneNumber, validateEmail } from '../src/lib/validators';
     import bcrypt from 'bcrypt';

     const prisma = new PrismaClient();

     async function createOwnerAdmin() {
       try {
         // Admin details (replace with your values)
         const adminData = {
           phoneNumber: '+989123456789',
           email: 'owner@cavian.ir',
           firstName: 'John',
           lastName: 'Doe',
           password: 'SecurePass123!',
           role: 'OWNER' as const,
         };

         // Validate inputs
         validatePhoneNumber(adminData.phoneNumber);
         validateEmail(adminData.email);
         if (!['OWNER', 'MANAGER', 'SELLER', 'MARKETER', 'OPERATOR'].includes(adminData.role)) {
           throw new Error('Invalid role');
         }

         // Generate unique random ID
         const id = await generateAdminId();

         // Hash password
         const passwordHash = await bcrypt.hash(adminData.password, 10);

         // Create admin
         const admin = await prisma.admin.create({
           data: {
             id,
             phoneNumber: adminData.phoneNumber,
             email: adminData.email,
             firstName: adminData.firstName,
             lastName: adminData.lastName,
             passwordHash,
             role: adminData.role,
           },
         });

         console.log('Admin created:', { id: admin.id, phoneNumber: admin.phoneNumber, role: admin.role });
       } catch (error) {
         console.error('Error creating admin:', (error as Error).message);
       } finally {
         await prisma.$disconnect();
       }
     }

     createOwnerAdmin();