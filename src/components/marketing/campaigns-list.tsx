"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, Play, Pause, Eye, BarChart3 } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

// Mock data - in real app this would come from API
type Campaign = {
  id: string
  name: string
  type: "SOCIAL_MEDIA" | "EMAIL" | "FLYER" | "REFERRAL" | "ONLINE_ADS"
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  startDate: Date
  endDate?: Date
  budget: number
  spent: number
  impressions: number
  clicks: number
  leads: number
  conversions: number
  createdAt: Date
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Spring New Student Promotion",
    type: "SOCIAL_MEDIA",
    status: "ACTIVE",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-04-30"),
    budget: 150000,
    spent: 89000,
    impressions: 45000,
    clicks: 1800,
    leads: 24,
    conversions: 3,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "2",
    name: "Kids English Summer Camp",
    type: "ONLINE_ADS",
    status: "ACTIVE",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-05-31"),
    budget: 200000,
    spent: 52000,
    impressions: 78000,
    clicks: 2900,
    leads: 45,
    conversions: 8,
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "3",
    name: "Business English Lunch Classes",
    type: "EMAIL",
    status: "PAUSED",
    startDate: new Date("2024-02-15"),
    endDate: new Date("2024-03-31"),
    budget: 50000,
    spent: 35000,
    impressions: 12000,
    clicks: 450,
    leads: 8,
    conversions: 2,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    name: "Referral Bonus Program",
    type: "REFERRAL",
    status: "ACTIVE",
    startDate: new Date("2024-01-01"),
    budget: 100000,
    spent: 75000,
    impressions: 0,
    clicks: 0,
    leads: 35,
    conversions: 12,
    createdAt: new Date("2023-12-15"),
  },
  {
    id: "5",
    name: "TOEIC Preparation Course",
    type: "FLYER",
    status: "COMPLETED",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-02-29"),
    budget: 80000,
    spent: 80000,
    impressions: 25000,
    clicks: 890,
    leads: 18,
    conversions: 6,
    createdAt: new Date("2024-01-01"),
  },
]

function getCampaignTypeDisplay(type: string) {
  const typeMap = {
    SOCIAL_MEDIA: "Social Media",
    EMAIL: "Email Marketing",
    FLYER: "Flyers",
    REFERRAL: "Referral Program",
    ONLINE_ADS: "Online Ads"
  }
  return typeMap[type as keyof typeof typeMap] || type
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success"
    case "PAUSED":
      return "warning"
    case "COMPLETED":
      return "secondary"
    case "CANCELLED":
      return "destructive"
    case "DRAFT":
    default:
      return "outline"
  }
}

const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: "Campaign Name",
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div>
          <div className="font-medium">{campaign.name}</div>
          <div className="text-xs text-muted-foreground">
            {getCampaignTypeDisplay(campaign.type)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={getStatusBadgeVariant(status) as any}>
          {status.toLowerCase().replace("_", " ")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      const campaign = row.original
      const spentPercentage = (campaign.spent / campaign.budget) * 100
      return (
        <div>
          <div className="font-medium">
            {formatCurrency(campaign.budget)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatCurrency(campaign.spent)} spent ({spentPercentage.toFixed(1)}%)
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "performance",
    header: "Performance",
    cell: ({ row }) => {
      const campaign = row.original
      const ctr = campaign.clicks > 0 ? ((campaign.clicks / campaign.impressions) * 100) : 0
      const conversionRate = campaign.leads > 0 ? ((campaign.conversions / campaign.leads) * 100) : 0
      
      return (
        <div className="text-sm">
          <div>{campaign.impressions.toLocaleString()} views</div>
          <div className="text-muted-foreground">
            CTR: {ctr.toFixed(1)}% | Conv: {conversionRate.toFixed(1)}%
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "results",
    header: "Results",
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="text-sm">
          <div className="font-medium">{campaign.leads} leads</div>
          <div className="text-muted-foreground">
            {campaign.conversions} conversions
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "period",
    header: "Period",
    cell: ({ row }) => {
      const campaign = row.original
      return (
        <div className="text-sm">
          <div>{formatDate(campaign.startDate)}</div>
          {campaign.endDate && (
            <div className="text-muted-foreground">
              to {formatDate(campaign.endDate)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original
      const isActive = campaign.status === "ACTIVE"
      const isPaused = campaign.status === "PAUSED"

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </DropdownMenuItem>
            {isActive && (
              <DropdownMenuItem>
                <Pause className="mr-2 h-4 w-4" />
                Pause Campaign
              </DropdownMenuItem>
            )}
            {isPaused && (
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Resume Campaign
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function CampaignsList() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns)

  return (
    <DataTable
      columns={columns}
      data={campaigns}
      searchKey="name"
      searchPlaceholder="Search campaigns..."
    />
  )
}