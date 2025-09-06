'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { 
  Award, 
  Download, 
  Star, 
  Calendar, 
  User, 
  FileText, 
  Printer,
  Eye,
  Sparkles,
  Trophy
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  level: string;
  joinedAt: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  type: 'attendance' | 'achievement' | 'completion' | 'star';
  preview: string;
}

interface CertificateData {
  studentName: string;
  courseName: string;
  dateIssued: string;
  teacherName: string;
  achievementText: string;
  additionalNotes: string;
}

const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'attendance',
    name: '出席証明書',
    description: '月次出席証明書テンプレート',
    type: 'attendance',
    preview: '/certificates/attendance-preview.png'
  },
  {
    id: 'star-student',
    name: '優秀生徒賞',
    description: 'スターインターナショナル賞状テンプレート', 
    type: 'star',
    preview: '/certificates/star-preview.png'
  },
  {
    id: 'course-completion',
    name: 'コース修了証',
    description: 'コース修了証明書テンプレート',
    type: 'completion',
    preview: '/certificates/completion-preview.png'
  },
  {
    id: 'achievement',
    name: '成果証明書',
    description: '特別な成果に対する表彰状',
    type: 'achievement',
    preview: '/certificates/achievement-preview.png'
  }
];

export default function CertificatesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData>({
    studentName: '',
    courseName: '',
    dateIssued: new Date().toISOString().split('T')[0],
    teacherName: 'Demo Sensei',
    achievementText: '',
    additionalNotes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();

  // Mock students data - in real app, this would come from API
  useEffect(() => {
    setStudents([
      { id: '1', firstName: '田中', lastName: '太郎', level: 'BEGINNER', joinedAt: '2024-09-01' },
      { id: '2', firstName: '佐藤', lastName: '花子', level: 'BEGINNER', joinedAt: '2024-09-01' },
      { id: '3', firstName: '山田', lastName: '次郎', level: 'INTERMEDIATE', joinedAt: '2024-09-01' },
      { id: '4', firstName: '鈴木', lastName: '美咲', level: 'INTERMEDIATE', joinedAt: '2024-09-01' },
      { id: '5', firstName: '高橋', lastName: '大輔', level: 'INTERMEDIATE', joinedAt: '2024-09-01' },
      { id: '6', firstName: '渡辺', lastName: '麻衣', level: 'ADVANCED', joinedAt: '2024-09-01' },
      { id: '7', firstName: '伊藤', lastName: '健太', level: 'ADVANCED', joinedAt: '2024-09-01' },
      { id: '8', firstName: 'Johnson', lastName: 'Emily', level: 'BEGINNER', joinedAt: '2024-09-01' },
      { id: '9', firstName: 'Smith', lastName: 'Michael', level: 'INTERMEDIATE', joinedAt: '2024-09-01' },
      { id: '10', firstName: 'Brown', lastName: 'Sarah', level: 'ADVANCED', joinedAt: '2024-09-01' },
    ]);
  }, []);

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setCertificateData(prev => ({
        ...prev,
        studentName: `${student.firstName} ${student.lastName}`,
        courseName: `${student.level === 'BEGINNER' ? '初心者' : 
                      student.level === 'INTERMEDIATE' ? '中級者' : '上級者'}英会話コース`
      }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = CERTIFICATE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      // Set default text based on template type
      let defaultText = '';
      switch (template.type) {
        case 'attendance':
          defaultText = `${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}の月間出席率100%を達成しました`;
          break;
        case 'star':
          defaultText = 'Outstanding performance and dedication in English conversation classes';
          break;
        case 'completion':
          defaultText = 'Successfully completed all course requirements with excellent results';
          break;
        case 'achievement':
          defaultText = 'Demonstrated exceptional progress and commitment to English learning';
          break;
      }
      
      setCertificateData(prev => ({
        ...prev,
        achievementText: defaultText
      }));
    }
  };

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate || !selectedStudent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for A4 landscape (in pixels at 150 DPI)
    canvas.width = 1200;
    canvas.height = 848;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background based on template type
    drawCertificateBackground(ctx, selectedTemplate.type);
    
    // Draw border
    ctx.strokeStyle = '#d4af37'; // Gold color
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    ctx.strokeStyle = '#8b4513'; // Brown color for inner border
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Draw content
    drawCertificateContent(ctx, selectedTemplate, certificateData);
  };

  const drawCertificateBackground = (ctx: CanvasRenderingContext2D, type: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    
    switch (type) {
      case 'attendance':
        gradient.addColorStop(0, '#f8f9ff');
        gradient.addColorStop(1, '#e3f2fd');
        break;
      case 'star':
        gradient.addColorStop(0, '#fffaf0');
        gradient.addColorStop(1, '#ffeaa7');
        break;
      case 'completion':
        gradient.addColorStop(0, '#f0fff4');
        gradient.addColorStop(1, '#c8e6c9');
        break;
      case 'achievement':
        gradient.addColorStop(0, '#fff3e0');
        gradient.addColorStop(1, '#ffcc80');
        break;
      default:
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f5f5f5');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Add decorative elements
    drawDecorations(ctx, type);
  };

  const drawDecorations = (ctx: CanvasRenderingContext2D, type: string) => {
    // Draw corner decorations
    ctx.fillStyle = '#d4af37';
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(70, 70);
    ctx.lineTo(150, 70);
    ctx.lineTo(150, 90);
    ctx.lineTo(90, 90);
    ctx.lineTo(90, 150);
    ctx.lineTo(70, 150);
    ctx.closePath();
    ctx.fill();

    // Top right corner
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width - 70, 70);
    ctx.lineTo(ctx.canvas.width - 150, 70);
    ctx.lineTo(ctx.canvas.width - 150, 90);
    ctx.lineTo(ctx.canvas.width - 90, 90);
    ctx.lineTo(ctx.canvas.width - 90, 150);
    ctx.lineTo(ctx.canvas.width - 70, 150);
    ctx.closePath();
    ctx.fill();

    // Bottom corners
    ctx.beginPath();
    ctx.moveTo(70, ctx.canvas.height - 70);
    ctx.lineTo(150, ctx.canvas.height - 70);
    ctx.lineTo(150, ctx.canvas.height - 90);
    ctx.lineTo(90, ctx.canvas.height - 90);
    ctx.lineTo(90, ctx.canvas.height - 150);
    ctx.lineTo(70, ctx.canvas.height - 150);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width - 70, ctx.canvas.height - 70);
    ctx.lineTo(ctx.canvas.width - 150, ctx.canvas.height - 70);
    ctx.lineTo(ctx.canvas.width - 150, ctx.canvas.height - 90);
    ctx.lineTo(ctx.canvas.width - 90, ctx.canvas.height - 90);
    ctx.lineTo(ctx.canvas.width - 90, ctx.canvas.height - 150);
    ctx.lineTo(ctx.canvas.width - 70, ctx.canvas.height - 150);
    ctx.closePath();
    ctx.fill();
  };

  const drawCertificateContent = (ctx: CanvasRenderingContext2D, template: CertificateTemplate, data: CertificateData) => {
    const centerX = ctx.canvas.width / 2;

    // Title
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    
    let title = '';
    switch (template.type) {
      case 'attendance': title = '出席証明書'; break;
      case 'star': title = '★ 優秀生徒賞 ★'; break;
      case 'completion': title = 'コース修了証'; break;
      case 'achievement': title = '成果証明書'; break;
    }
    
    ctx.fillText(title, centerX, 150);

    // English subtitle
    ctx.font = '24px serif';
    ctx.fillStyle = '#5d4e37';
    let englishTitle = '';
    switch (template.type) {
      case 'attendance': englishTitle = 'Certificate of Attendance'; break;
      case 'star': englishTitle = 'Star Student Award'; break;
      case 'completion': englishTitle = 'Certificate of Completion'; break;
      case 'achievement': englishTitle = 'Certificate of Achievement'; break;
    }
    ctx.fillText(englishTitle, centerX, 185);

    // "This certifies that" text
    ctx.font = '28px serif';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('この証明書は以下を証明します / This certifies that', centerX, 250);

    // Student name
    ctx.font = 'bold 42px serif';
    ctx.fillStyle = '#8b4513';
    ctx.fillText(data.studentName, centerX, 320);

    // Achievement text
    ctx.font = '24px serif';
    ctx.fillStyle = '#2c3e50';
    const achievementLines = wrapText(ctx, data.achievementText, ctx.canvas.width - 200);
    let yPos = 380;
    achievementLines.forEach(line => {
      ctx.fillText(line, centerX, yPos);
      yPos += 35;
    });

    // Course name
    if (data.courseName) {
      ctx.font = 'italic 22px serif';
      ctx.fillStyle = '#5d4e37';
      ctx.fillText(`コース: ${data.courseName}`, centerX, yPos + 40);
      yPos += 70;
    }

    // Date and signature section
    const bottomY = ctx.canvas.height - 120;
    
    // Date
    ctx.font = '20px serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';
    ctx.fillText(`発行日: ${new Date(data.dateIssued).toLocaleDateString('ja-JP')}`, 100, bottomY);
    
    // Teacher signature
    ctx.textAlign = 'right';
    ctx.fillText(`講師: ${data.teacherName}`, ctx.canvas.width - 100, bottomY);

    // School name
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = '#8b4513';
    ctx.fillText('Eikaiwa Grow Demo School', centerX, bottomY + 40);

    // Additional notes
    if (data.additionalNotes) {
      ctx.font = '16px serif';
      ctx.fillStyle = '#666';
      ctx.fillText(`備考: ${data.additionalNotes}`, centerX, bottomY - 30);
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handlePreview = () => {
    if (!selectedStudent || !selectedTemplate) {
      toast({
        title: "エラー",
        description: "生徒とテンプレートを選択してください。",
        variant: "destructive",
      });
      return;
    }
    
    setPreviewMode(true);
    setTimeout(() => {
      drawCertificate();
    }, 100);
  };

  const handleGenerate = async () => {
    if (!selectedStudent || !selectedTemplate) {
      toast({
        title: "エラー",
        description: "生徒とテンプレートを選択してください。",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // First set preview mode to true to render the canvas
      setPreviewMode(true);
      
      // Wait for canvas to be rendered in DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Draw certificate
      drawCertificate();
      
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "証明書を生成しました！",
        description: "PDFファイルとして保存可能です。",
      });

    } catch (error) {
      toast({
        title: "生成に失敗しました",
        description: "もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to image and download
    const link = document.createElement('a');
    link.download = `certificate-${selectedStudent?.firstName}_${selectedStudent?.lastName}-${selectedTemplate?.type}-${certificateData.dateIssued}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "ダウンロード完了",
      description: "証明書がダウンロードされました。",
    });
  };

  const handleDataChange = (field: keyof CertificateData, value: string) => {
    setCertificateData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">証明書生成</h1>
        <p className="text-gray-600">生徒の成果を証明する証明書を作成します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                テンプレート選択
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {CERTIFICATE_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex items-center gap-3">
                    {template.type === 'star' && <Star className="h-5 w-5 text-yellow-500" />}
                    {template.type === 'attendance' && <Calendar className="h-5 w-5 text-blue-500" />}
                    {template.type === 'completion' && <Trophy className="h-5 w-5 text-green-500" />}
                    {template.type === 'achievement' && <Sparkles className="h-5 w-5 text-purple-500" />}
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                生徒選択
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleStudentSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="生徒を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Certificate Details */}
          {selectedStudent && selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>証明書詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="courseName">コース名</Label>
                  <Input
                    id="courseName"
                    value={certificateData.courseName}
                    onChange={(e) => handleDataChange('courseName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="achievementText">成果内容</Label>
                  <Textarea
                    id="achievementText"
                    value={certificateData.achievementText}
                    onChange={(e) => handleDataChange('achievementText', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="dateIssued">発行日</Label>
                  <Input
                    id="dateIssued"
                    type="date"
                    value={certificateData.dateIssued}
                    onChange={(e) => handleDataChange('dateIssued', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="teacherName">講師名</Label>
                  <Input
                    id="teacherName"
                    value={certificateData.teacherName}
                    onChange={(e) => handleDataChange('teacherName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes">備考（任意）</Label>
                  <Input
                    id="additionalNotes"
                    value={certificateData.additionalNotes}
                    onChange={(e) => handleDataChange('additionalNotes', e.target.value)}
                    placeholder="追加情報があれば入力"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview and Generation Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  証明書プレビュー
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePreview}
                    disabled={!selectedStudent || !selectedTemplate}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    プレビュー
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedStudent || !selectedTemplate || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        証明書生成
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <canvas
                  ref={canvasRef}
                  className="border rounded-lg shadow-lg max-w-full h-auto bg-white"
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: previewMode ? 'block' : 'none'
                  }}
                />
                {!previewMode && (
                  <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        証明書プレビュー
                    </h3>
                    <p className="text-gray-500 mb-4">
                      生徒とテンプレートを選択してプレビューボタンを押してください
                    </p>
                    {selectedStudent && selectedTemplate && (
                      <div className="space-y-2">
                        <Badge className="bg-blue-100 text-blue-700">
                          生徒: {selectedStudent.firstName} {selectedStudent.lastName}
                        </Badge>
                        <br />
                        <Badge className="bg-green-100 text-green-700">
                          テンプレート: {selectedTemplate.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                )}
                {previewMode && (
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      PNG ダウンロード
                    </Button>
                    <Button onClick={() => window.print()} variant="outline">
                      <Printer className="h-4 w-4 mr-2" />
                      印刷
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}