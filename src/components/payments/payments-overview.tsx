import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Receipt
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data - in real app this would come from API
const paymentStats = [
  {
    title: "Total Revenue",
    value: "¥2,450,000",
    change: "+12.5% vs last month",
    changeType: "increase" as const,
    icon: DollarSign,
    description: "This month",
  },
  {
    title: "Payments Received",
    value: "186",
    change: "+23 vs last month",
    changeType: "increase" as const,
    icon: CreditCard,
    description: "This month",
  },
  {
    title: "Overdue Payments",
    value: "¥156,800",
    change: "8 students",
    changeType: "alert" as const,
    icon: AlertTriangle,
    description: "Requires attention",
  },
  {
    title: "Average Payment",
    value: "¥13,172",
    change: "-2.1% vs last month",
    changeType: "decrease" as const,
    icon: Receipt,
    description: "Per transaction",
  },
  {
    title: "Payment Rate",
    value: "94.2%",
    change: "+1.8% vs last month",
    changeType: "increase" as const,
    icon: Users,
    description: "On-time payments",
  },
  {
    title: "Next Week Due",
    value: "¥342,500",
    change: "26 payments",
    changeType: "neutral" as const,
    icon: Calendar,
    description: "Expected revenue",
  },
]

export function PaymentsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {paymentStats.map((stat) => (
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
                  stat.changeType === "alert" ? "warning" :
                  "secondary"
                }
                className="ml-2"
              >
                {stat.changeType === "increase" && <TrendingUp className="h-3 w-3 mr-1" />}
                {stat.changeType === "decrease" && <TrendingDown className="h-3 w-3 mr-1" />}
                {stat.changeType === "alert" && <AlertTriangle className="h-3 w-3 mr-1" />}
                {stat.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}