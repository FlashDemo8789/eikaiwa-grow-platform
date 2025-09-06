import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calendar 
} from "lucide-react"

// Mock data - in real app this would come from API
const attendanceStats = [
  {
    title: "Total Students",
    value: "254",
    change: "+12 this month",
    changeType: "increase" as const,
    icon: Users,
    description: "Enrolled students",
  },
  {
    title: "Present Today",
    value: "186",
    change: "73% attendance",
    changeType: "neutral" as const,
    icon: UserCheck,
    description: "Students present",
  },
  {
    title: "Absent Today",
    value: "68",
    change: "27% absent",
    changeType: "neutral" as const,
    icon: UserX,
    description: "Students absent",
  },
  {
    title: "Late Arrivals",
    value: "14",
    change: "-3 vs yesterday",
    changeType: "increase" as const,
    icon: Clock,
    description: "Late today",
  },
  {
    title: "Weekly Average",
    value: "89.2%",
    change: "+2.1% vs last week",
    changeType: "increase" as const,
    icon: Calendar,
    description: "This week's rate",
  },
  {
    title: "Monthly Trend",
    value: "87.8%",
    change: "-1.5% vs last month",
    changeType: "decrease" as const,
    icon: TrendingUp,
    description: "Monthly average",
  },
]

export function AttendanceOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {attendanceStats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <Badge 
                variant={
                  stat.changeType === "increase" ? "success" :
                  stat.changeType === "decrease" ? "destructive" :
                  "secondary"
                }
                className="ml-2"
              >
                {stat.changeType === "increase" && <TrendingUp className="h-3 w-3 mr-1" />}
                {stat.changeType === "decrease" && <TrendingDown className="h-3 w-3 mr-1" />}
                {stat.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}