import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown } from "lucide-react"
import { getInitials } from "@/lib/utils"

// Mock data - in real app this would come from API
const topPerformers = [
  {
    id: 1,
    name: "田中美咲",
    level: "Advanced",
    attendanceRate: 98,
    progressScore: 95,
    trend: "up",
    avatar: null,
  },
  {
    id: 2,
    name: "山田太郎",
    level: "Intermediate",
    attendanceRate: 92,
    progressScore: 88,
    trend: "up",
    avatar: null,
  },
  {
    id: 3,
    name: "鈴木花子",
    level: "Beginner",
    attendanceRate: 89,
    progressScore: 85,
    trend: "down",
    avatar: null,
  },
  {
    id: 4,
    name: "佐藤次郎",
    level: "Advanced",
    attendanceRate: 94,
    progressScore: 92,
    trend: "up",
    avatar: null,
  },
]

function getLevelColor(level: string) {
  switch (level) {
    case "Beginner":
      return "bg-green-500"
    case "Intermediate":
      return "bg-yellow-500"
    case "Advanced":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function StudentPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
        <CardDescription>
          Students with highest progress scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center space-x-3"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {index + 1}
              </div>
              
              <Avatar className="h-8 w-8">
                <AvatarImage src={student.avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{student.name}</p>
                  {student.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getLevelColor(student.level)} text-white border-0`}
                  >
                    {student.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {student.progressScore}% progress
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}