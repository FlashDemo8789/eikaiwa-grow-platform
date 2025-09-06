import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Eye, 
  MousePointer, 
  UserPlus, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Mail
} from "lucide-react"

// Mock data - in real app this would come from API
const campaignStats = [
  {
    title: "Active Campaigns",
    value: "8",
    change: "+2 this month",
    changeType: "increase" as const,
    icon: Mail,
    description: "Currently running",
  },
  {
    title: "Total Impressions",
    value: "124.5K",
    change: "+18.2% vs last month",
    changeType: "increase" as const,
    icon: Eye,
    description: "Views this month",
  },
  {
    title: "Click Rate",
    value: "3.8%",
    change: "+0.5% vs last month",
    changeType: "increase" as const,
    icon: MousePointer,
    description: "Average CTR",
  },
  {
    title: "New Leads",
    value: "89",
    change: "+12 vs last month",
    changeType: "increase" as const,
    icon: UserPlus,
    description: "Generated this month",
  },
  {
    title: "Conversion Rate",
    value: "12.4%",
    change: "-1.2% vs last month",
    changeType: "decrease" as const,
    icon: TrendingUp,
    description: "Lead to student",
  },
  {
    title: "Campaign ROI",
    value: "285%",
    change: "+45% vs last month",
    changeType: "increase" as const,
    icon: DollarSign,
    description: "Return on investment",
  },
]

export function CampaignMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaignStats.map((stat) => (
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