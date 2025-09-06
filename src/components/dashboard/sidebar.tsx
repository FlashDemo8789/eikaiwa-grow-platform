"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  DollarSign,
  Settings,
  Home,
  UserCheck,
  Megaphone,
  FileText,
  Camera,
  Award,
  TrendingUp,
  UserPlus,
  Target
} from "lucide-react"

const menuItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Student Management",
    items: [
      {
        title: "Students",
        href: "/dashboard/students",
        icon: Users,
      },
      {
        title: "Attendance",
        href: "/dashboard/attendance",
        icon: UserCheck,
      },
      {
        title: "Enrollment",
        href: "/dashboard/enrollment",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Classes & Scheduling",
    items: [
      {
        title: "Schedule",
        href: "/dashboard/schedule",
        icon: Calendar,
      },
      {
        title: "Courses",
        href: "/dashboard/courses",
        icon: BookOpen,
      },
      {
        title: "Lessons",
        href: "/dashboard/lessons",
        icon: FileText,
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Campaigns",
        href: "/dashboard/marketing/campaigns",
        icon: Megaphone,
      },
      {
        title: "Social Media",
        href: "/dashboard/marketing/social",
        icon: Camera,
      },
      {
        title: "Lead Tracking",
        href: "/dashboard/marketing/leads",
        icon: Target,
      },
      {
        title: "Referrals",
        href: "/dashboard/marketing/referrals",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/dashboard/communication/messages",
        icon: MessageSquare,
      },
      {
        title: "Photo Sharing",
        href: "/dashboard/photos",
        icon: Camera,
      },
      {
        title: "Certificates",
        href: "/dashboard/certificates",
        icon: Award,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: DollarSign,
      },
      {
        title: "Financial Reports",
        href: "/dashboard/finance",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <span className="text-sm font-bold">EG</span>
          </div>
          <span className="font-bold">EikaiwaGrow</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-2 py-4">
        {menuItems.map((section) => (
          <div key={section.title} className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}