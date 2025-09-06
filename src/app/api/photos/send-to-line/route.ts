import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { LineService } from '@/services/line.service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentIds, message, vocabulary, lessonNotes, photoUrl } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'No students selected' }, { status: 400 });
    }

    // Get students and their parent contact info
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        status: 'ACTIVE'
      },
      include: {
        customer: true,
      }
    });

    if (students.length === 0) {
      return NextResponse.json({ error: 'No valid students found' }, { status: 400 });
    }

    const lineService = new LineService();
    const results = [];

    // Send to each parent via LINE
    for (const student of students) {
      try {
        // For demo purposes, we'll simulate sending to LINE
        // In real implementation, you would need parent LINE IDs
        const parentLineId = `parent_${student.id}_line_id`; // This would be stored in database
        
        const lessonMessage = await lineService.createLessonPhotoMessage({
          studentName: `${student.firstName} ${student.lastName}`,
          photoUrl: photoUrl || 'https://example.com/lesson-photo.jpg',
          message: message || '今日のレッスンの写真です！',
          vocabulary: vocabulary || [],
          lessonNotes: lessonNotes || '',
          date: new Date().toLocaleDateString('ja-JP')
        });

        // In demo mode, we'll just log the message instead of actually sending
        logger.info('Demo: Would send LINE message to parent', {
          parentLineId,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          message: lessonMessage
        });

        results.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          status: 'success',
          message: 'Message would be sent to parent LINE'
        });

      } catch (error) {
        logger.error('Failed to send LINE message for student', {
          studentId: student.id,
          error: error.message
        });
        
        results.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          status: 'error',
          message: 'Failed to send LINE message'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      totalSent: results.filter(r => r.status === 'success').length
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Error in send-to-line API');
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}