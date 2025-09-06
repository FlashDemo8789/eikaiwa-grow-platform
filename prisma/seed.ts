import { PrismaClient, EnglishLevel, StudentStatus, AttendanceStatus, PaymentStatus, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for MVP demo...');

  // Create organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'eikaiwa-grow-demo' },
    update: {},
    create: {
      name: 'Eikaiwa Grow Demo School',
      slug: 'eikaiwa-grow-demo',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
    },
  });

  // Create demo user/teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'demo@eikaiwa-grow.com' },
    update: {},
    create: {
      email: 'demo@eikaiwa-grow.com',
      name: 'Demo Sensei',
      role: 'TEACHER',
      status: 'ACTIVE',
      organizationId: organization.id,
      password: '$2b$10$K7L1OJ45/4Y2nIiO0JO42.Cx9BtjjADfBP9fZ.lcMy08rjZXU4u.', // "demo123"
    },
  });

  // Create demo school
  const school = await prisma.school.upsert({
    where: { id: 'demo-school-id' },
    update: {},
    create: {
      id: 'demo-school-id',
      name: 'Eikaiwa Grow Demo Location',
      description: 'Main teaching location for demo',
      address: '東京都渋谷区恵比寿1-2-3',
      phone: '03-1234-5678',
      email: 'demo@eikaiwa-grow.com',
      organizationId: organization.id,
      status: 'ACTIVE',
    },
  });

  // Link teacher to school
  await prisma.schoolUser.upsert({
    where: {
      schoolId_userId: {
        schoolId: school.id,
        userId: teacher.id,
      }
    },
    update: {},
    create: {
      schoolId: school.id,
      userId: teacher.id,
      role: 'TEACHER',
    },
  });

  // Create demo courses
  const beginner = await prisma.course.upsert({
    where: { id: 'beginner-course' },
    update: {},
    create: {
      id: 'beginner-course',
      name: '初心者英会話コース',
      description: 'English conversation for beginners',
      level: 'BEGINNER',
      duration: 12,
      maxStudents: 6,
      price: 8000,
      status: 'ACTIVE',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-11-30'),
      schoolId: school.id,
    },
  });

  const intermediate = await prisma.course.upsert({
    where: { id: 'intermediate-course' },
    update: {},
    create: {
      id: 'intermediate-course',
      name: '中級英会話コース',
      description: 'Intermediate English conversation',
      level: 'INTERMEDIATE',
      duration: 12,
      maxStudents: 8,
      price: 10000,
      status: 'ACTIVE',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-11-30'),
      schoolId: school.id,
    },
  });

  const advanced = await prisma.course.upsert({
    where: { id: 'advanced-course' },
    update: {},
    create: {
      id: 'advanced-course',
      name: '上級英会話コース',
      description: 'Advanced English conversation and business English',
      level: 'ADVANCED',
      duration: 12,
      maxStudents: 6,
      price: 12000,
      status: 'ACTIVE',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-11-30'),
      schoolId: school.id,
    },
  });

  // Create demo students
  const studentData = [
    { firstName: '田中', lastName: '太郎', email: 'tanaka@example.com', phone: '090-1234-5678', level: 'BEGINNER' as EnglishLevel, course: beginner.id },
    { firstName: '佐藤', lastName: '花子', email: 'sato@example.com', phone: '090-2345-6789', level: 'BEGINNER' as EnglishLevel, course: beginner.id },
    { firstName: '山田', lastName: '次郎', email: 'yamada@example.com', phone: '090-3456-7890', level: 'INTERMEDIATE' as EnglishLevel, course: intermediate.id },
    { firstName: '鈴木', lastName: '美咲', email: 'suzuki@example.com', phone: '090-4567-8901', level: 'INTERMEDIATE' as EnglishLevel, course: intermediate.id },
    { firstName: '高橋', lastName: '大輔', email: 'takahashi@example.com', phone: '090-5678-9012', level: 'INTERMEDIATE' as EnglishLevel, course: intermediate.id },
    { firstName: '渡辺', lastName: '麻衣', email: 'watanabe@example.com', phone: '090-6789-0123', level: 'ADVANCED' as EnglishLevel, course: advanced.id },
    { firstName: '伊藤', lastName: '健太', email: 'ito@example.com', phone: '090-7890-1234', level: 'ADVANCED' as EnglishLevel, course: advanced.id },
    { firstName: 'Johnson', lastName: 'Emily', email: 'emily@example.com', phone: '090-8901-2345', level: 'BEGINNER' as EnglishLevel, course: beginner.id },
    { firstName: 'Smith', lastName: 'Michael', email: 'michael@example.com', phone: '090-9012-3456', level: 'INTERMEDIATE' as EnglishLevel, course: intermediate.id },
    { firstName: 'Brown', lastName: 'Sarah', email: 'sarah@example.com', phone: '090-0123-4567', level: 'ADVANCED' as EnglishLevel, course: advanced.id },
  ];

  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const data = studentData[i];
    const student = await prisma.student.upsert({
      where: { 
        organizationId_studentId: {
          organizationId: organization.id,
          studentId: `ST${(i + 1).toString().padStart(3, '0')}`
        }
      },
      update: {},
      create: {
        studentId: `ST${(i + 1).toString().padStart(3, '0')}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        level: data.level,
        status: 'ACTIVE',
        birthDate: new Date(1990 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        notes: `Demo student - Level: ${data.level}`,
        organizationId: organization.id,
        schoolId: school.id,
        teacherId: teacher.id,
      },
    });
    students.push(student);

    // Enroll students in courses
    await prisma.courseEnrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: data.course,
        }
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: data.course,
        status: 'ACTIVE',
      },
    });

    // Create customer records for payment tracking
    await prisma.customer.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: data.email,
        }
      },
      update: {},
      create: {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        organizationId: organization.id,
        studentId: student.id,
      },
    });
  }

  // Create demo lessons for the past month and upcoming weeks
  const lessons = [];
  const today = new Date();
  
  for (let i = -30; i <= 14; i++) {
    const lessonDate = new Date(today);
    lessonDate.setDate(today.getDate() + i);
    
    // Skip weekends
    if (lessonDate.getDay() === 0 || lessonDate.getDay() === 6) continue;

    const lesson = await prisma.lesson.create({
      data: {
        title: i <= 0 ? `過去のレッスン ${Math.abs(i)}日前` : `今後のレッスン ${i}日後`,
        description: i <= 0 ? '完了したレッスン' : '予定されているレッスン',
        date: lessonDate,
        duration: 60,
        status: i <= 0 ? 'COMPLETED' : 'SCHEDULED',
        notes: i <= 0 ? 'Students practiced greetings and basic conversation' : '',
        schoolId: school.id,
        teacherId: teacher.id,
        courseId: i % 3 === 0 ? beginner.id : i % 3 === 1 ? intermediate.id : advanced.id,
      },
    });
    lessons.push(lesson);

    // Add attendance for past lessons only
    if (i <= 0) {
      const courseStudents = students.filter(s => {
        if (i % 3 === 0) return ['BEGINNER'].includes(s.level || '');
        if (i % 3 === 1) return ['INTERMEDIATE'].includes(s.level || '');
        return ['ADVANCED'].includes(s.level || '');
      });

      for (const student of courseStudents) {
        await prisma.lessonAttendance.create({
          data: {
            lessonId: lesson.id,
            studentId: student.id,
            status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT', // 90% attendance rate
            notes: Math.random() > 0.8 ? 'Great participation today!' : '',
          },
        });
      }
    }
  }

  // Create sample invoices and payments
  for (const student of students.slice(0, 7)) {
    const customer = await prisma.customer.findFirst({
      where: { studentId: student.id }
    });
    
    if (!customer) continue;

    // Create monthly invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${new Date().getFullYear()}-${(students.indexOf(student) + 1).toString().padStart(3, '0')}`,
        status: Math.random() > 0.3 ? 'PAID' : 'OPEN',
        subtotal: student.level === 'BEGINNER' ? 8000 : student.level === 'INTERMEDIATE' ? 10000 : 12000,
        taxAmount: student.level === 'BEGINNER' ? 800 : student.level === 'INTERMEDIATE' ? 1000 : 1200,
        totalAmount: student.level === 'BEGINNER' ? 8800 : student.level === 'INTERMEDIATE' ? 11000 : 13200,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        issueDate: new Date(),
        currency: 'JPY',
        notes: '月謝 - 英会話レッスン',
        customerId: customer.id,
      },
    });

    // Add invoice line item
    await prisma.invoiceLineItem.create({
      data: {
        description: `${student.level}コース - 月謝`,
        quantity: 1,
        unitPrice: student.level === 'BEGINNER' ? 8000 : student.level === 'INTERMEDIATE' ? 10000 : 12000,
        amount: student.level === 'BEGINNER' ? 8000 : student.level === 'INTERMEDIATE' ? 10000 : 12000,
        invoiceId: invoice.id,
      },
    });

    // Create payment for paid invoices
    if (invoice.status === 'PAID') {
      await prisma.payment.create({
        data: {
          amount: invoice.totalAmount,
          currency: 'JPY',
          status: 'SUCCEEDED',
          type: 'ONE_TIME',
          provider: 'STRIPE',
          description: `Payment for ${invoice.invoiceNumber}`,
          processedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
          customerId: customer.id,
          invoiceId: invoice.id,
        },
      });
    }
  }

  // Create some overdue payments for demo
  const overdueStudents = students.slice(7, 10);
  for (const student of overdueStudents) {
    const customer = await prisma.customer.findFirst({
      where: { studentId: student.id }
    });
    
    if (!customer) continue;

    const overdueInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${new Date().getFullYear()}-LATE-${(overdueStudents.indexOf(student) + 1).toString().padStart(3, '0')}`,
        status: 'OVERDUE',
        subtotal: student.level === 'BEGINNER' ? 8000 : student.level === 'INTERMEDIATE' ? 10000 : 12000,
        taxAmount: student.level === 'BEGINNER' ? 800 : student.level === 'INTERMEDIATE' ? 1000 : 1200,
        totalAmount: student.level === 'BEGINNER' ? 8800 : student.level === 'INTERMEDIATE' ? 11000 : 13200,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        issueDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        currency: 'JPY',
        notes: '月謝 - 英会話レッスン（未払い）',
        customerId: customer.id,
      },
    });

    await prisma.invoiceLineItem.create({
      data: {
        description: `${student.level}コース - 月謝（未払い）`,
        quantity: 1,
        unitPrice: student.level === 'BEGINNER' ? 8000 : student.level === 'INTERMEDIATE' ? 10000 : 12000,
        amount: student.level === 'BEGINNER' ? 8000 : student.level === 'INTERMEDIATE' ? 10000 : 12000,
        invoiceId: overdueInvoice.id,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created: ${students.length} students, ${lessons.length} lessons, 10 invoices`);
  console.log('🏫 Organization: Eikaiwa Grow Demo School');
  console.log('👨‍🏫 Demo Teacher: demo@eikaiwa-grow.com (password: demo123)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });