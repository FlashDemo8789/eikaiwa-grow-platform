"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts"

// Mock data - in real app this would come from API
const attendanceData = [
  { date: "Mon", present: 45, absent: 5, total: 50 },
  { date: "Tue", present: 42, absent: 8, total: 50 },
  { date: "Wed", present: 48, absent: 2, total: 50 },
  { date: "Thu", present: 46, absent: 4, total: 50 },
  { date: "Fri", present: 49, absent: 1, total: 50 },
  { date: "Sat", present: 38, absent: 7, total: 45 },
  { date: "Sun", present: 25, absent: 5, total: 30 },
]

export function AttendanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Attendance</CardTitle>
        <CardDescription>
          Student attendance overview for this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => `Day: ${label}`}
              formatter={(value, name) => [
                value,
                name === "present" ? "Present" : 
                name === "absent" ? "Absent" : "Total"
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Present"
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Absent"
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#6b7280" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="Total Expected"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}