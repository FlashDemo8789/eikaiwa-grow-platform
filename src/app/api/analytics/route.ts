import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ApiResponseBuilder } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema for analytics query parameters
const analyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  metrics: z.array(z.enum([
    'student_growth',
    'revenue',
    'retention',
    'class_performance',
    'teacher_performance',
    'all'
  ])).optional().default(['all']),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional().default('monthly'),
  organizationId: z.string().optional(),
});

type AnalyticsMetrics = {
  studentGrowth: {
    totalStudents: number;
    newStudents: number;
    activeStudents: number;
    growthRate: number;
    trends: Array<{
      period: string;
      total: number;
      new: number;
      active: number;
    }>;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    growthRate: number;
    trends: Array<{
      period: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
    breakdown: {
      tuitionFees: number;
      materialFees: number;
      examFees: number;
      other: number;
    };
  };
  retention: {
    overallRate: number;
    monthlyRate: number;
    quarterlyRate: number;
    yearlyRate: number;
    cohortAnalysis: Array<{
      cohort: string;
      month0: number;
      month1: number;
      month3: number;
      month6: number;
      month12: number;
    }>;
  };
  classPerformance: {
    averageAttendance: number;
    completionRate: number;
    satisfactionScore: number;
    trends: Array<{
      period: string;
      attendance: number;
      completion: number;
      satisfaction: number;
    }>;
    topPerformingClasses: Array<{
      className: string;
      attendance: number;
      completion: number;
      satisfaction: number;
    }>;
  };
  teacherPerformance: {
    averageRating: number;
    totalTeachers: number;
    activeTeachers: number;
    performanceDistribution: Array<{
      teacherId: string;
      teacherName: string;
      rating: number;
      studentsCount: number;
      hoursTeaching: number;
      retentionRate: number;
    }>;
    trends: Array<{
      period: string;
      averageRating: number;
      teacherCount: number;
    }>;
  };
};

/**
 * GET /api/analytics - Get comprehensive analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiResponseBuilder.unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

    // Parse metrics parameter if it exists
    if (queryParams.metrics) {
      queryParams.metrics = queryParams.metrics.split(',');
    }

    const validatedParams = analyticsQuerySchema.parse(queryParams);

    // Set date range defaults (last 12 months if not specified)
    const dateTo = validatedParams.dateTo ? new Date(validatedParams.dateTo) : new Date();
    const dateFrom = validatedParams.dateFrom ? new Date(validatedParams.dateFrom) : 
      new Date(dateTo.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Generate mock analytics data (in real app, this would come from database queries)
    const analytics: AnalyticsMetrics = await generateMockAnalytics(
      dateFrom,
      dateTo,
      validatedParams.period,
      validatedParams.metrics
    );

    const response = {
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
      period: validatedParams.period,
      metrics: validatedParams.metrics,
      data: analytics,
      generatedAt: new Date().toISOString(),
    };

    return ApiResponseBuilder.success(response, 'Analytics data retrieved successfully');

  } catch (error) {
    logger.error('Failed to retrieve analytics data', {
      error: error instanceof Error ? error.message : error,
      userId: session?.user?.id,
    });

    if (error instanceof z.ZodError) {
      return ApiResponseBuilder.validationError('Invalid query parameters', error.errors[0]?.path?.[0] as string);
    }

    return ApiResponseBuilder.internalError('Failed to retrieve analytics data');
  }
}

async function generateMockAnalytics(
  dateFrom: Date,
  dateTo: Date,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  metrics: string[]
): Promise<AnalyticsMetrics> {
  // Generate time periods for trends
  const periods = generateTimePeriods(dateFrom, dateTo, period);

  // Mock data generation (replace with actual database queries)
  return {
    studentGrowth: {
      totalStudents: 1247,
      newStudents: 89,
      activeStudents: 1105,
      growthRate: 12.5,
      trends: periods.map((period, index) => ({
        period,
        total: 900 + (index * 45) + Math.floor(Math.random() * 50),
        new: 15 + Math.floor(Math.random() * 20),
        active: 800 + (index * 40) + Math.floor(Math.random() * 45),
      })),
    },
    revenue: {
      totalRevenue: 18750000,
      monthlyRevenue: 1562500,
      growthRate: 8.3,
      trends: periods.map((period, index) => ({
        period,
        revenue: 1200000 + (index * 50000) + Math.floor(Math.random() * 200000),
        expenses: 800000 + (index * 30000) + Math.floor(Math.random() * 100000),
        profit: 400000 + (index * 20000) + Math.floor(Math.random() * 50000),
      })),
      breakdown: {
        tuitionFees: 14250000,
        materialFees: 2812500,
        examFees: 1125000,
        other: 562500,
      },
    },
    retention: {
      overallRate: 87.5,
      monthlyRate: 94.2,
      quarterlyRate: 85.1,
      yearlyRate: 72.8,
      cohortAnalysis: [
        { cohort: '2024年1月', month0: 100, month1: 95, month3: 88, month6: 82, month12: 75 },
        { cohort: '2024年2月', month0: 100, month1: 93, month3: 86, month6: 80, month12: 73 },
        { cohort: '2024年3月', month0: 100, month1: 96, month3: 90, month6: 84, month12: 78 },
        { cohort: '2024年4月', month0: 100, month1: 94, month3: 87, month6: 81, month12: 0 },
        { cohort: '2024年5月', month0: 100, month1: 92, month3: 85, month6: 0, month12: 0 },
      ],
    },
    classPerformance: {
      averageAttendance: 89.3,
      completionRate: 84.7,
      satisfactionScore: 4.2,
      trends: periods.map((period, index) => ({
        period,
        attendance: 85 + Math.floor(Math.random() * 10),
        completion: 80 + Math.floor(Math.random() * 15),
        satisfaction: 3.8 + (Math.random() * 0.8),
      })),
      topPerformingClasses: [
        { className: '上級ビジネス英語', attendance: 95.2, completion: 92.1, satisfaction: 4.8 },
        { className: 'TOEIC対策コース', attendance: 93.8, completion: 89.4, satisfaction: 4.6 },
        { className: '日常英会話（中級）', attendance: 91.5, completion: 87.2, satisfaction: 4.5 },
        { className: 'プレゼンテーション英語', attendance: 88.9, completion: 85.6, satisfaction: 4.3 },
      ],
    },
    teacherPerformance: {
      averageRating: 4.3,
      totalTeachers: 24,
      activeTeachers: 22,
      performanceDistribution: [
        { teacherId: '1', teacherName: 'Smith先生', rating: 4.8, studentsCount: 45, hoursTeaching: 120, retentionRate: 92.1 },
        { teacherId: '2', teacherName: 'Johnson先生', rating: 4.6, studentsCount: 38, hoursTeaching: 98, retentionRate: 89.3 },
        { teacherId: '3', teacherName: 'Brown先生', rating: 4.5, studentsCount: 42, hoursTeaching: 115, retentionRate: 87.8 },
        { teacherId: '4', teacherName: 'Davis先生', rating: 4.2, studentsCount: 35, hoursTeaching: 88, retentionRate: 85.2 },
      ],
      trends: periods.map((period, index) => ({
        period,
        averageRating: 4.0 + (Math.random() * 0.6),
        teacherCount: 20 + Math.floor(Math.random() * 8),
      })),
    },
  };
}

function generateTimePeriods(
  dateFrom: Date,
  dateTo: Date,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly'
): string[] {
  const periods: string[] = [];
  const current = new Date(dateFrom);

  while (current <= dateTo) {
    switch (period) {
      case 'daily':
        periods.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        periods.push(`${current.getFullYear()}年第${Math.ceil((current.getTime() - new Date(current.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}週`);
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        periods.push(`${current.getFullYear()}年${current.getMonth() + 1}月`);
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        periods.push(`${current.getFullYear()}年Q${quarter}`);
        current.setMonth(current.getMonth() + 3);
        break;
    }
  }

  return periods.slice(0, 24); // Limit to reasonable number of periods
}