"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

type CampaignFormData = {
  name: string
  type: string
  budget: string
  startDate: string
  endDate?: string
  description?: string
  targetAudience?: string
}

const campaignTypes = [
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "EMAIL", label: "Email Marketing" },
  { value: "FLYER", label: "Flyers & Print" },
  { value: "REFERRAL", label: "Referral Program" },
  { value: "ONLINE_ADS", label: "Online Advertising" },
]

interface CreateCampaignDialogProps {
  children: React.ReactNode
}

export function CreateCampaignDialog({ children }: CreateCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormData>()

  const selectedType = watch("type")

  const onSubmit = async (data: CampaignFormData) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Creating campaign:", data)
      
      toast({
        title: "Success",
        description: "Marketing campaign has been created successfully.",
        variant: "default",
      })
      
      reset()
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a new marketing campaign to attract students to your school.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Campaign name is required" })}
              placeholder="Spring New Student Promotion"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Campaign Type *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                {campaignTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedType && (
              <p className="text-xs text-destructive">Campaign type is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (¥) *</Label>
            <Input
              id="budget"
              type="number"
              {...register("budget", { 
                required: "Budget is required",
                min: { value: 1000, message: "Budget must be at least ¥1,000" }
              })}
              placeholder="100000"
            />
            {errors.budget && (
              <p className="text-xs text-destructive">{errors.budget.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate", { required: "Start date is required" })}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              {...register("targetAudience")}
              placeholder="Adults aged 25-45, Business professionals..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the campaign goals and strategy..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedType}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}