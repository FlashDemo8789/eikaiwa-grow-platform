import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, BarChart, Send, Eye } from "lucide-react"
import { CampaignsList } from "@/components/marketing/campaigns-list"
import { CampaignMetrics } from "@/components/marketing/campaign-metrics"
import { CreateCampaignDialog } from "@/components/marketing/create-campaign-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function MarketingCampaignsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage marketing campaigns to attract new students.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <CreateCampaignDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </CreateCampaignDialog>
        </div>
      </div>

      {/* Campaign Metrics */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" />
        </div>
      }>
        <CampaignMetrics />
      </Suspense>

      {/* Campaigns List */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <CampaignsList />
      </Suspense>
    </div>
  )
}