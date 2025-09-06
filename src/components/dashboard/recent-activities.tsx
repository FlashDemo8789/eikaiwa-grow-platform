import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"

// Mock data - in real app this would come from API
const activities = [
  {
    id: 1,
    type: "enrollment",
    title: "New student enrolled",
    description: "田中太郎 enrolled in Advanced English Course",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    user: "田中太郎",
    status: "success",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment received",
    description: "¥25,000 payment received from 山田花子",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    user: "山田花子",
    status: "success",
  },
  {
    id: 3,
    type: "lesson",
    title: "Lesson completed",
    description: "Intermediate English - 18 students attended",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    user: "Smith Sensei",
    status: "completed",
  },
  {
    id: 4,
    type: "attendance",
    title: "Attendance marked",
    description: "Morning class attendance recorded",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: "Johnson Sensei",
    status: "info",
  },
  {
    id: 5,
    type: "payment",
    title: "Payment overdue",
    description: "佐藤次郎's payment is 3 days overdue",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    user: "佐藤次郎",
    status: "warning",
  },
  {
    id: 6,
    type: "message",
    title: "Message sent",
    description: "Weekly newsletter sent to 254 parents",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    user: "System",
    status: "info",
  },
]

function getActivityIcon(type: string) {
  switch (type) {
    case "enrollment":
      return "👨‍🎓"
    case "payment":
      return "💰"
    case "lesson":
      return "📚"
    case "attendance":
      return "✅"
    case "message":
      return "📧"
    default:
      return "📝"
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "success":
      return "success"
    case "warning":
      return "warning" 
    case "completed":
      return "secondary"
    case "info":
    default:
      return "outline"
  }
}

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          Latest activities and updates from your school
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 rounded-lg border p-4"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getActivityIcon(activity.type)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge variant={getStatusBadgeVariant(activity.status) as any}>
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{formatDate(activity.timestamp, "time")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}