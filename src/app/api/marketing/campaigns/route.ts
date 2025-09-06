import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  type: z.enum(["SOCIAL_MEDIA", "EMAIL", "FLYER", "REFERRAL", "ONLINE_ADS"]),
  budget: z.number().positive("Budget must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const status = searchParams.get("status") || ""

    // Mock campaigns data
    const mockCampaigns = [
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
        description: "Attract new students for spring enrollment",
        targetAudience: "Adults 25-45",
        createdAt: new Date("2024-02-20"),
        updatedAt: new Date(),
      },
      // More mock data...
    ]

    // Apply filters
    let filteredCampaigns = mockCampaigns

    if (search) {
      filteredCampaigns = filteredCampaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (type) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.type === type)
    }

    if (status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status)
    }

    const total = filteredCampaigns.length
    const campaigns = filteredCampaigns.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createCampaignSchema.parse(body)

    // In a real app, this would save to database
    console.log("Creating campaign:", validatedData)

    const newCampaign = {
      id: Date.now().toString(),
      ...validatedData,
      status: "DRAFT",
      spent: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      conversions: 0,
      startDate: new Date(validatedData.startDate),
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}