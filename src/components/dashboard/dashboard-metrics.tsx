import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  UserCheck,
  AlertCircle 
} from "lucide-react"

// Mock data - in real app this would come from API
const metrics = [
  {
    title: "Total Students",
    value: "254",
    change: "+12",
    changeType: "increase" as const,
    icon: Users,
    description: "Active students enrolled",
  },
  {
    title: "Classes Today",
    value: "18",
    change: "3 in progress",
    changeType: "neutral" as const,
    icon: Calendar,
    description: "Scheduled for today",
  },
  {
    title: "Monthly Revenue",
    value: "¥892,400",
    change: "+8.2%",
    changeType: "increase" as const,
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Attendance Rate",
    value: "94.2%",
    change: "-2.1%",
    changeType: "decrease" as const,
    icon: UserCheck,
    description: "This week",
  },
  {
    title: "Active Courses",
    value: "12",
    change: "2 starting soon",
    changeType: "neutral" as const,
    icon: BookOpen,
    description: "Running courses",
  },
  {
    title: "Pending Payments",
    value: "¥156,800",
    change: "8 overdue",
    changeType: "alert" as const,
    icon: AlertCircle,
    description: "Requires attention",
  },
]

export function DashboardMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
              <Badge 
                variant={
                  metric.changeType === "increase" ? "success" :
                  metric.changeType === "decrease" ? "destructive" :
                  metric.changeType === "alert" ? "warning" :
                  "secondary"
                }
                className="ml-2"
              >
                {metric.changeType === "increase" && <TrendingUp className="h-3 w-3 mr-1" />}
                {metric.changeType === "decrease" && <TrendingDown className="h-3 w-3 mr-1" />}
                {metric.changeType === "alert" && <AlertCircle className="h-3 w-3 mr-1" />}
                {metric.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}