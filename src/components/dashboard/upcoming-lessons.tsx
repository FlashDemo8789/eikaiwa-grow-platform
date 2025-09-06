import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

// Mock data - in real app this would come from API
const upcomingLessons = [
  {
    id: 1,
    title: "Beginner English A",
    time: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    duration: 60,
    students: 12,
    maxStudents: 15,
    teacher: "Smith Sensei",
    status: "starting-soon"
  },
  {
    id: 2,
    title: "Intermediate Conversation",
    time: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours from now
    duration: 90,
    students: 8,
    maxStudents: 10,
    teacher: "Johnson Sensei",
    status: "scheduled"
  },
  {
    id: 3,
    title: "Advanced Business English",
    time: new Date(Date.now() + 150 * 60 * 1000), // 2.5 hours from now
    duration: 60,
    students: 6,
    maxStudents: 8,
    teacher: "Brown Sensei",
    status: "scheduled"
  },
  {
    id: 4,
    title: "Kids English Fun",
    time: new Date(Date.now() + 240 * 60 * 1000), // 4 hours from now
    duration: 45,
    students: 10,
    maxStudents: 12,
    teacher: "Davis Sensei",
    status: "scheduled"
  },
]

export function UpcomingLessons() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Lessons</CardTitle>
        <CardDescription>
          Next classes scheduled for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-start justify-between space-x-4 rounded-lg border p-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{lesson.title}</p>
                  {lesson.status === "starting-soon" && (
                    <Badge variant="warning">Starting Soon</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(lesson.time, "time")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{lesson.students}/{lesson.maxStudents}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {lesson.teacher} • {lesson.duration}min
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}