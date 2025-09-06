import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { LineService } from '@/services/line.service';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      englishLevel,
      preferredDate,
      preferredTime,
      notes,
      hearAbout
    } = bookingData;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get demo organization for trial bookings
    const organization = await prisma.organization.findFirst({
      where: { slug: 'eikaiwa-grow-demo' }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create customer record
    const customer = await prisma.customer.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: email
        }
      },
      update: {
        name: `${firstName} ${lastName}`,
        phone: phone
      },
      create: {
        email: email,
        name: `${firstName} ${lastName}`,
        phone: phone,
        organizationId: organization.id
      }
    });

    // Create lesson for trial booking
    const school = await prisma.school.findFirst({
      where: { organizationId: organization.id }
    });

    const teacher = await prisma.user.findFirst({
      where: { 
        organizationId: organization.id,
        role: 'TEACHER'
      }
    });

    if (!school || !teacher) {
      return NextResponse.json(
        { error: 'School or teacher not found' },
        { status: 404 }
      );
    }

    // Parse date and time for lesson
    const lessonDateTime = new Date(`${preferredDate}T${preferredTime}:00`);

    const lesson = await prisma.lesson.create({
      data: {
        title: `体験レッスン - ${firstName} ${lastName}`,
        description: `Trial lesson for new student`,
        date: lessonDateTime,
        duration: 50,
        status: 'SCHEDULED',
        notes: `Trial booking notes: ${notes || 'No additional notes'}\nAge: ${age || 'Not specified'}\nEnglish Level: ${englishLevel || 'Not specified'}\nHeard about us: ${hearAbout || 'Not specified'}`,
        schoolId: school.id,
        teacherId: teacher.id
      }
    });

    // Generate booking confirmation number
    const bookingId = `TB-${Date.now()}`;

    // In a real application, you would also:
    // 1. Send confirmation email
    // 2. Send LINE message
    // 3. Add to calendar
    // 4. Create booking record in database

    const lineService = new LineService();
    
    // Demo: Create LINE confirmation message
    const confirmationMessage = `🎉 体験レッスンのご予約ありがとうございます！\n\n【予約詳細】\n📅 日時: ${new Date(lessonDateTime).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })} ${preferredTime}\n👤 お名前: ${firstName} ${lastName}様\n📧 メール: ${email}\n📱 電話: ${phone}\n🏫 場所: Eikaiwa Grow Demo Location\n\n当日は10分前にお越しください。\nご質問がございましたら、こちらのLINEまでお気軽にご連絡ください。\n\nお会いできるのを楽しみにしています！`;

    // Log the booking for demo purposes
    logger.info('Trial lesson booking created', {
      bookingId,
      lessonId: lesson.id,
      customerName: `${firstName} ${lastName}`,
      email,
      phone,
      lessonDate: lessonDateTime,
      confirmationMessage
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        lessonId: lesson.id,
        customerId: customer.id,
        date: preferredDate,
        time: preferredTime,
        status: 'confirmed'
      },
      message: 'Trial lesson booking created successfully'
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Error creating trial booking');
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Get available time slots for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    // Get demo organization
    const organization = await prisma.organization.findFirst({
      where: { slug: 'eikaiwa-grow-demo' }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get existing lessons for the date
    const existingLessons = await prisma.lesson.findMany({
      where: {
        date: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`)
        },
        school: {
          organizationId: organization.id
        }
      }
    });

    // Standard available time slots
    const standardSlots = [
      '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    // Check which slots are available
    const availableSlots = standardSlots.map(time => {
      const slotDateTime = new Date(`${date}T${time}:00`);
      const isBooked = existingLessons.some(lesson => {
        const lessonTime = lesson.date.toTimeString().slice(0, 5);
        return lessonTime === time;
      });

      return {
        time,
        available: !isBooked,
        datetime: slotDateTime.toISOString()
      };
    });

    return NextResponse.json({
      date,
      slots: availableSlots
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching available slots');
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}