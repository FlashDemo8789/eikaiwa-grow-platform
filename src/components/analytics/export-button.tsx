"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportButtonProps {
  className?: string
}

export function ExportButton({ className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    
    try {
      // Simulate export API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, this would:
      // 1. Call the analytics API to get data
      // 2. Format the data according to the export type
      // 3. Trigger download
      
      toast({
        title: "エクスポート完了",
        description: `分析データを${format.toUpperCase()}形式でエクスポートしました。`,
      })
    } catch (error) {
      toast({
        title: "エクスポートエラー",
        description: "データのエクスポート中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting}
          className={className}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "エクスポート中..." : "エクスポート"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          CSV形式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          PDF形式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}