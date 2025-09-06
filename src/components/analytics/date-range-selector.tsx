"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface DateRangeSelectorProps {
  dateRange: {
    from: Date
    to: Date
  }
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void
  className?: string
}

const presetRanges = [
  {
    label: "過去7日間",
    value: "7d",
    getRange: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "過去30日間",
    value: "30d", 
    getRange: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "過去3ヶ月",
    value: "3m",
    getRange: () => {
      const to = new Date()
      const from = new Date(to)
      from.setMonth(from.getMonth() - 3)
      return { from, to }
    },
  },
  {
    label: "過去6ヶ月",
    value: "6m",
    getRange: () => {
      const to = new Date()
      const from = new Date(to)
      from.setMonth(from.getMonth() - 6)
      return { from, to }
    },
  },
  {
    label: "過去1年",
    value: "1y",
    getRange: () => ({
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      to: new Date(),
    }),
  },
  {
    label: "カスタム",
    value: "custom",
    getRange: () => ({ from: new Date(), to: new Date() }),
  },
]

export function DateRangeSelector({ 
  dateRange, 
  onDateRangeChange, 
  className 
}: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState("3m")
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false)
  const [tempDateRange, setTempDateRange] = useState({
    from: dateRange.from.toISOString().split('T')[0],
    to: dateRange.to.toISOString().split('T')[0]
  })

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)
    if (value !== "custom") {
      const preset = presetRanges.find(p => p.value === value)
      if (preset) {
        const newRange = preset.getRange()
        onDateRangeChange(newRange)
      }
    } else {
      setIsCustomInputOpen(true)
    }
  }

  const handleCustomDateApply = () => {
    const newRange = {
      from: new Date(tempDateRange.from),
      to: new Date(tempDateRange.to)
    }
    onDateRangeChange(newRange)
    setIsCustomInputOpen(false)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presetRanges.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset === "custom" && (
        <Popover open={isCustomInputOpen} onOpenChange={setIsCustomInputOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-64 justify-start text-left font-normal"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">開始日</label>
                <Input
                  type="date"
                  value={tempDateRange.from}
                  onChange={(e) => setTempDateRange({...tempDateRange, from: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">終了日</label>
                <Input
                  type="date"
                  value={tempDateRange.to}
                  onChange={(e) => setTempDateRange({...tempDateRange, to: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomInputOpen(false)}
                >
                  キャンセル
                </Button>
                <Button size="sm" onClick={handleCustomDateApply}>
                  適用
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {selectedPreset !== "custom" && (
        <div className="text-sm text-muted-foreground">
          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
        </div>
      )}
    </div>
  )
}