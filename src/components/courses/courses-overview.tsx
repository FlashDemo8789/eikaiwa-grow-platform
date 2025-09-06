"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, DollarSign, TrendingUp } from "lucide-react"

// Mock data - in real app, this would come from an API
const mockOverviewData = {
  totalCourses: 24,
  activeCourses: 18,
  totalStudents: 156,
  monthlyRevenue: 892000, // in yen
  averageEnrollment: 8.5,
  completionRate: 85
}

export function CoursesOverview() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  const overviewCards = [
    {
      title: "Total Courses",
      value: mockOverviewData.totalCourses,
      description: `${mockOverviewData.activeCourses} active`,
      icon: BookOpen,
      trend: "+2 this month",
      trendUp: true
    },
    {
      title: "Total Enrollment",
      value: mockOverviewData.totalStudents,
      description: `Avg ${mockOverviewData.averageEnrollment} per course`,
      icon: Users,
      trend: "+12 this week",
      trendUp: true
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(mockOverviewData.monthlyRevenue),
      description: "From course fees",
      icon: DollarSign,
      trend: "+8.2% from last month",
      trendUp: true
    },
    {
      title: "Completion Rate",
      value: `${mockOverviewData.completionRate}%`,
      description: "Course completion",
      icon: TrendingUp,
      trend: "+3% from last month",
      trendUp: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
            <div className="flex items-center mt-2">
              <Badge 
                variant={card.trendUp ? "default" : "secondary"}
                className="text-xs"
              >
                {card.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}