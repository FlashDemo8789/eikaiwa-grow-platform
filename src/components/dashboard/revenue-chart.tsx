"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { formatCurrency } from "@/lib/utils"

// Mock data - in real app this would come from API
const revenueData = [
  { month: "Jan", revenue: 720000, expenses: 480000 },
  { month: "Feb", revenue: 680000, expenses: 465000 },
  { month: "Mar", revenue: 820000, expenses: 520000 },
  { month: "Apr", revenue: 750000, expenses: 490000 },
  { month: "May", revenue: 890000, expenses: 530000 },
  { month: "Jun", revenue: 920000, expenses: 550000 },
]

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>
          Monthly financial overview (last 6 months)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `¥${(value / 1000)}K`}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "revenue" ? "Revenue" : "Expenses"
              ]}
            />
            <Bar 
              dataKey="revenue" 
              fill="#22c55e" 
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="expenses" 
              fill="#ef4444" 
              name="Expenses"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}