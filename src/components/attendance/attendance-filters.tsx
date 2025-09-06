"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, X } from "lucide-react"

export function AttendanceFilters() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    course: "all",
    teacher: "all",
    status: "all",
  })

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      course: "all",
      teacher: "all",
      status: "all",
    })
  }

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "" && filter !== "all")

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-6">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={filters.course}
              onValueChange={(value) => setFilters(prev => ({ ...prev, course: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                <SelectItem value="beginner-a">Beginner English A</SelectItem>
                <SelectItem value="intermediate-conv">Intermediate Conversation</SelectItem>
                <SelectItem value="advanced-business">Advanced Business English</SelectItem>
                <SelectItem value="kids-fun">Kids English Fun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              value={filters.teacher}
              onValueChange={(value) => setFilters(prev => ({ ...prev, teacher: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teachers</SelectItem>
                <SelectItem value="smith">Smith Sensei</SelectItem>
                <SelectItem value="johnson">Johnson Sensei</SelectItem>
                <SelectItem value="brown">Brown Sensei</SelectItem>
                <SelectItem value="davis">Davis Sensei</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="excused">Excused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}