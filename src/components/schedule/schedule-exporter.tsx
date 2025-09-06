"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Download, FileText, Table, Calendar, Printer } from "lucide-react"
import { ClassSession } from "@/types/schedule"
import { japaneseUtils } from "@/services/japanese-utils.service"
import jsPDF from 'jspdf'

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'print'
  dateRange: 'current_week' | 'current_month' | 'custom'
  includeDetails: boolean
  includeAttendance: boolean
  includeTeacherInfo: boolean
  includeStudentList: boolean
  groupBy: 'date' | 'teacher' | 'level' | 'room'
}

interface ScheduleExporterProps {
  classes: ClassSession[]
  currentDate: Date
  viewMode: 'week' | 'month'
}

export function ScheduleExporter({ classes, currentDate, viewMode }: ScheduleExporterProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: viewMode === 'week' ? 'current_week' : 'current_month',
    includeDetails: true,
    includeAttendance: false,
    includeTeacherInfo: true,
    includeStudentList: false,
    groupBy: 'date'
  })

  const quickExportToPDF = () => {
    generatePDF(classes, {
      ...options,
      format: 'pdf',
      dateRange: viewMode === 'week' ? 'current_week' : 'current_month'
    })
  }

  const quickExportToExcel = () => {
    generateExcel(classes, {
      ...options, 
      format: 'excel',
      dateRange: viewMode === 'week' ? 'current_week' : 'current_month'
    })
  }

  const handleExport = () => {
    switch (options.format) {
      case 'pdf':
        generatePDF(classes, options)
        break
      case 'excel':
        generateExcel(classes, options)
        break
      case 'csv':
        generateCSV(classes, options)
        break
      case 'print':
        printSchedule(classes, options)
        break
    }
    setOpen(false)
  }

  return (
    <>
      {/* Quick Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={quickExportToPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF形式でエクスポート
          </DropdownMenuItem>
          <DropdownMenuItem onClick={quickExportToExcel}>
            <Table className="h-4 w-4 mr-2" />
            Excel形式でエクスポート
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            詳細設定でエクスポート
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detailed Export Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>エクスポート設定</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>エクスポート形式</Label>
              <Select 
                value={options.format} 
                onValueChange={(value: ExportOptions['format']) => 
                  setOptions({...options, format: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="print">印刷</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>期間</Label>
              <Select 
                value={options.dateRange} 
                onValueChange={(value: ExportOptions['dateRange']) => 
                  setOptions({...options, dateRange: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_week">今週</SelectItem>
                  <SelectItem value="current_month">今月</SelectItem>
                  <SelectItem value="custom">カスタム期間</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By */}
            <div className="space-y-2">
              <Label>グループ化</Label>
              <Select 
                value={options.groupBy} 
                onValueChange={(value: ExportOptions['groupBy']) => 
                  setOptions({...options, groupBy: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">日付順</SelectItem>
                  <SelectItem value="teacher">講師別</SelectItem>
                  <SelectItem value="level">レベル別</SelectItem>
                  <SelectItem value="room">教室別</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Include Options */}
            <div className="space-y-3">
              <Label>含める情報</Label>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeDetails"
                    checked={options.includeDetails}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeDetails: !!checked})
                    }
                  />
                  <Label htmlFor="includeDetails" className="text-sm">
                    詳細情報
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeAttendance"
                    checked={options.includeAttendance}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeAttendance: !!checked})
                    }
                  />
                  <Label htmlFor="includeAttendance" className="text-sm">
                    出席情報
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTeacherInfo"
                    checked={options.includeTeacherInfo}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeTeacherInfo: !!checked})
                    }
                  />
                  <Label htmlFor="includeTeacherInfo" className="text-sm">
                    講師情報
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeStudentList"
                    checked={options.includeStudentList}
                    onCheckedChange={(checked) => 
                      setOptions({...options, includeStudentList: !!checked})
                    }
                  />
                  <Label htmlFor="includeStudentList" className="text-sm">
                    生徒一覧
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// PDF Generation
function generatePDF(classes: ClassSession[], options: ExportOptions) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // Add Japanese font support
  doc.setFont('Arial', 'normal')
  
  // Title
  doc.setFontSize(16)
  doc.text('クラススケジュール', 20, 20)
  
  // Date range
  doc.setFontSize(12)
  doc.text(`期間: ${options.dateRange === 'current_week' ? '今週' : '今月'}`, 20, 30)
  
  let yPosition = 45
  
  // Group classes according to options
  const groupedClasses = groupClasses(classes, options.groupBy)
  
  Object.entries(groupedClasses).forEach(([groupKey, groupClasses]) => {
    // Group header
    doc.setFontSize(14)
    doc.text(groupKey, 20, yPosition)
    yPosition += 10
    
    // Class entries
    doc.setFontSize(10)
    groupClasses.forEach(classSession => {
      const timeStr = `${japaneseUtils.formatJapaneseTime(classSession.startTime)} - ${japaneseUtils.formatJapaneseTime(classSession.endTime)}`
      const classInfo = `${timeStr} | ${classSession.title} | ${classSession.teacherName} | ${classSession.roomName}`
      
      doc.text(classInfo, 25, yPosition)
      yPosition += 7
      
      if (options.includeStudentList && classSession.studentNames.length > 0) {
        doc.text(`生徒: ${classSession.studentNames.join(', ')}`, 30, yPosition)
        yPosition += 5
      }
      
      if (options.includeAttendance && classSession.attendance) {
        const attendanceInfo = classSession.attendance.map(a => 
          `${a.studentId}: ${a.status === 'present' ? '出席' : a.status === 'absent' ? '欠席' : a.status === 'late' ? '遅刻' : '事前欠席'}`
        ).join(', ')
        doc.text(`出席: ${attendanceInfo}`, 30, yPosition)
        yPosition += 5
      }
      
      yPosition += 3
      
      // Page break if needed
      if (yPosition > 190) {
        doc.addPage()
        yPosition = 20
      }
    })
    
    yPosition += 10
  })
  
  // Save the PDF
  const fileName = `schedule_${options.dateRange}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// Excel Generation (simplified - would use a proper library like xlsx)
function generateExcel(classes: ClassSession[], options: ExportOptions) {
  const data = classes.map(classSession => ({
    '日付': japaneseUtils.formatJapaneseDate(classSession.startTime),
    '時間': `${japaneseUtils.formatJapaneseTime(classSession.startTime)} - ${japaneseUtils.formatJapaneseTime(classSession.endTime)}`,
    'クラス名': classSession.title,
    '講師': options.includeTeacherInfo ? classSession.teacherName : '',
    '教室': classSession.roomName,
    'レベル': classSession.level === 'beginner' ? '初級' : 
              classSession.level === 'intermediate' ? '中級' : 
              classSession.level === 'advanced' ? '上級' : '会話',
    'タイプ': classSession.classType === 'group' ? 'グループ' :
              classSession.classType === 'private' ? '個人' :
              classSession.classType === 'trial' ? '体験' : '振替',
    '生徒数': `${classSession.studentIds.length}/${classSession.maxStudents}`,
    '生徒一覧': options.includeStudentList ? classSession.studentNames.join(', ') : '',
    '状態': classSession.status === 'scheduled' ? '予定' :
            classSession.status === 'completed' ? '完了' :
            classSession.status === 'cancelled' ? 'キャンセル' : '欠席',
    '備考': classSession.notes || ''
  }))

  // Convert to CSV format for simplicity
  const csv = convertToCSV(data)
  downloadFile(csv, `schedule_${options.dateRange}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

// CSV Generation
function generateCSV(classes: ClassSession[], options: ExportOptions) {
  const data = classes.map(classSession => ({
    '日付': japaneseUtils.formatJapaneseDate(classSession.startTime),
    '時間': `${japaneseUtils.formatJapaneseTime(classSession.startTime)} - ${japaneseUtils.formatJapaneseTime(classSession.endTime)}`,
    'クラス名': classSession.title,
    '講師': classSession.teacherName,
    '教室': classSession.roomName,
    'レベル': classSession.level,
    '生徒数': classSession.studentIds.length,
    '状態': classSession.status
  }))

  const csv = convertToCSV(data)
  downloadFile(csv, `schedule_${options.dateRange}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

// Print Schedule
function printSchedule(classes: ClassSession[], options: ExportOptions) {
  const printWindow = window.open('', '', 'height=600,width=800')
  if (!printWindow) return

  const groupedClasses = groupClasses(classes, options.groupBy)
  
  let htmlContent = `
    <html>
      <head>
        <title>クラススケジュール</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #ccc; }
          h2 { color: #666; margin-top: 30px; }
          .class-item { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; background: #f8f9fa; }
          .class-time { font-weight: bold; color: #007bff; }
          .class-info { margin: 5px 0; }
          .student-list { font-size: 0.9em; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>クラススケジュール</h1>
        <p>期間: ${options.dateRange === 'current_week' ? '今週' : '今月'}</p>
  `

  Object.entries(groupedClasses).forEach(([groupKey, groupClasses]) => {
    htmlContent += `<h2>${groupKey}</h2>`
    
    groupClasses.forEach(classSession => {
      htmlContent += `
        <div class="class-item">
          <div class="class-time">
            ${japaneseUtils.formatJapaneseTime(classSession.startTime)} - ${japaneseUtils.formatJapaneseTime(classSession.endTime)}
          </div>
          <div class="class-info">
            <strong>${classSession.title}</strong> | ${classSession.teacherName} | ${classSession.roomName}
          </div>
          ${options.includeStudentList ? `
            <div class="student-list">
              生徒: ${classSession.studentNames.join(', ')} (${classSession.studentIds.length}/${classSession.maxStudents}名)
            </div>
          ` : ''}
        </div>
      `
    })
  })

  htmlContent += '</body></html>'

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.print()
}

// Helper functions
function groupClasses(classes: ClassSession[], groupBy: ExportOptions['groupBy']): Record<string, ClassSession[]> {
  return classes.reduce((groups, classSession) => {
    let groupKey: string
    
    switch (groupBy) {
      case 'teacher':
        groupKey = classSession.teacherName
        break
      case 'level':
        groupKey = classSession.level === 'beginner' ? '初級' : 
                  classSession.level === 'intermediate' ? '中級' : 
                  classSession.level === 'advanced' ? '上級' : '会話'
        break
      case 'room':
        groupKey = classSession.roomName
        break
      default: // date
        groupKey = japaneseUtils.formatJapaneseDate(classSession.startTime)
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(classSession)
    
    return groups
  }, {} as Record<string, ClassSession[]>)
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => `"${String(row[header]).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n')
  
  return csvContent
}

function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}