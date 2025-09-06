'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Upload, Camera, Send, Users, BookOpen, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  level?: string;
}

const VOCABULARY_WORDS = [
  { english: 'Hello', japanese: 'こんにちは', romaji: 'konnichiwa' },
  { english: 'Thank you', japanese: 'ありがとう', romaji: 'arigatou' },
  { english: 'Good job', japanese: 'よくできました', romaji: 'yoku dekimashita' },
  { english: 'Friend', japanese: '友達', romaji: 'tomodachi' },
  { english: 'Happy', japanese: '嬉しい', romaji: 'ureshii' },
];

export default function PhotosPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [lessonNotes, setLessonNotes] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock students data - in real app, this would come from API
  React.useEffect(() => {
    setStudents([
      { id: '1', firstName: '田中', lastName: '太郎', level: 'BEGINNER' },
      { id: '2', firstName: '佐藤', lastName: '花子', level: 'BEGINNER' },
      { id: '3', firstName: '山田', lastName: '次郎', level: 'INTERMEDIATE' },
      { id: '4', firstName: '鈴木', lastName: '美咲', level: 'INTERMEDIATE' },
      { id: '5', firstName: '高橋', lastName: '大輔', level: 'INTERMEDIATE' },
    ]);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Mock upload - in real app, this would upload to S3/cloud storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "写真をアップロードしました",
        description: "写真が正常にアップロードされました。",
      });
    } catch (error) {
      toast({
        title: "アップロードに失敗しました",
        description: "もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendToParents = async () => {
    if (!selectedFile || selectedStudents.length === 0) {
      toast({
        title: "エラー",
        description: "写真と生徒を選択してください。",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Mock LINE message send - in real app, this would call the LINE API
      const payload = {
        photo: selectedFile.name,
        students: selectedStudents,
        message: message || "今日のレッスンの写真です！",
        vocabulary: VOCABULARY_WORDS,
        lessonNotes,
      };

      console.log('Sending to LINE:', payload);
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "LINEに送信しました！",
        description: `${selectedStudents.length}名の保護者にメッセージを送信しました。`,
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedStudents([]);
      setMessage('');
      setLessonNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      toast({
        title: "送信に失敗しました",
        description: "もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">写真共有 - LINE</h1>
        <p className="text-gray-600">レッスンの写真を保護者のLINEに送信します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              写真アップロード
            </CardTitle>
            <CardDescription>
              レッスンの写真を選択してアップロードしてください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    別の写真を選択
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      写真を選択
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    JPG、PNG、JPEG形式の画像をアップロードできます
                  </p>
                </div>
              )}
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && (
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    アップロード中...
                  </>
                ) : (
                  'アップロード'
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Today's Vocabulary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              今日の単語
            </CardTitle>
            <CardDescription>
              今日のレッスンで学習した単語（自動で含まれます）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {VOCABULARY_WORDS.map((word, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-700">{word.english}</div>
                    <div className="text-sm text-gray-600">
                      {word.japanese} ({word.romaji})
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              生徒選択
            </CardTitle>
            <CardDescription>
              写真を送信する生徒を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map(student => (
                <div 
                  key={student.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStudents.includes(student.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleStudent(student.id)}
                >
                  <div>
                    <div className="font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Level: {student.level}
                    </div>
                  </div>
                  {selectedStudents.includes(student.id) && (
                    <Badge className="bg-blue-500">選択済み</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message and Send */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              メッセージ作成
            </CardTitle>
            <CardDescription>
              保護者への追加メッセージ（任意）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message">メッセージ</Label>
              <Textarea
                id="message"
                placeholder="今日のレッスンの写真です！みんなとても頑張りました。"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">レッスンメモ</Label>
              <Textarea
                id="notes"
                placeholder="今日学習した内容、宿題、次回の予告など..."
                value={lessonNotes}
                onChange={(e) => setLessonNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button 
              onClick={handleSendToParents}
              disabled={!selectedFile || selectedStudents.length === 0 || isSending}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isSending ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  LINEに送信中...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  保護者のLINEに送信 ({selectedStudents.length}名)
                </>
              )}
            </Button>

            {selectedStudents.length > 0 && (
              <div className="text-sm text-gray-600 text-center">
                {selectedStudents.length}名の保護者に送信されます
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}