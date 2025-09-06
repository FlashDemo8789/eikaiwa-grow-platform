'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, Clock, Phone, Mail, User, BookOpen, CheckCircle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date: string;
}

interface BookingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  englishLevel: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  hearAbout: string;
}

export default function BookTrialPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  const [form, setForm] = useState<BookingForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    englishLevel: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    hearAbout: ''
  });

  const { toast } = useToast();

  // Generate next 14 days for booking
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends for this demo
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('ja-JP', { 
            month: 'long', 
            day: 'numeric', 
            weekday: 'short' 
          })
        });
      }
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Mock available time slots based on date
  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const slots: TimeSlot[] = [
          { id: '1', time: '10:00', available: true, date: selectedDate },
          { id: '2', time: '11:00', available: Math.random() > 0.3, date: selectedDate },
          { id: '3', time: '13:00', available: Math.random() > 0.2, date: selectedDate },
          { id: '4', time: '14:00', available: true, date: selectedDate },
          { id: '5', time: '15:00', available: Math.random() > 0.4, date: selectedDate },
          { id: '6', time: '16:00', available: true, date: selectedDate },
          { id: '7', time: '17:00', available: Math.random() > 0.3, date: selectedDate },
          { id: '8', time: '18:00', available: Math.random() > 0.5, date: selectedDate },
        ];
        setAvailableSlots(slots);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedDate]);

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setForm(prev => ({ ...prev, preferredDate: date, preferredTime: '' }));
  };

  const handleTimeSelect = (time: string) => {
    setForm(prev => ({ ...prev, preferredTime: time }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.preferredDate || !form.preferredTime) {
      toast({
        title: "入力エラー",
        description: "必須項目をすべて入力してください。",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call to save booking
      const bookingData = {
        ...form,
        bookingId: `TB-${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      console.log('Booking data:', bookingData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate LINE confirmation message
      console.log('Sending LINE confirmation...');

      setBookingComplete(true);
      
      toast({
        title: "体験レッスン予約完了！",
        description: "確認のLINEメッセージをお送りしました。",
      });

    } catch (error) {
      toast({
        title: "予約に失敗しました",
        description: "もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-green-200 bg-white shadow-xl">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-green-700 mb-4">
                体験レッスン予約完了！
              </h1>
              <div className="space-y-4 text-left bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{form.firstName} {form.lastName}様</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{new Date(form.preferredDate).toLocaleDateString('ja-JP', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric', 
                    weekday: 'long' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{form.preferredTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Eikaiwa Grow Demo Location</span>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>📱 LINEで確認メッセージをお送りしました</p>
                <p>📧 メールでも詳細をお送りします</p>
                <p>💬 ご質問がございましたら、LINEまたはお電話でお気軽にお問い合わせください</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="mt-6 bg-green-600 hover:bg-green-700"
              >
                トップページに戻る
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            無料体験レッスン予約
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            英会話を始めてみませんか？まずは無料の体験レッスンでお試しください。
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
              <BookOpen className="h-4 w-4 mr-1" />
              完全無料
            </Badge>
            <Badge className="bg-green-100 text-green-700 px-4 py-2">
              <Clock className="h-4 w-4 mr-1" />
              50分間
            </Badge>
            <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
              <User className="h-4 w-4 mr-1" />
              プロ講師
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                お客様情報
              </CardTitle>
              <CardDescription>
                体験レッスンのご予約に必要な情報をご入力ください
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">お名前（名）*</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="太郎"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">お名前（姓）*</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="田中"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">メールアドレス*</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">電話番号*</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="090-1234-5678"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">年齢</Label>
                <Select onValueChange={(value) => handleInputChange('age', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="年齢を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-18">18歳未満</SelectItem>
                    <SelectItem value="18-25">18-25歳</SelectItem>
                    <SelectItem value="26-35">26-35歳</SelectItem>
                    <SelectItem value="36-45">36-45歳</SelectItem>
                    <SelectItem value="46-55">46-55歳</SelectItem>
                    <SelectItem value="over-55">55歳以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="englishLevel">英語レベル</Label>
                <Select onValueChange={(value) => handleInputChange('englishLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初級：挨拶程度</SelectItem>
                    <SelectItem value="elementary">初中級：簡単な会話</SelectItem>
                    <SelectItem value="intermediate">中級：日常会話</SelectItem>
                    <SelectItem value="advanced">上級：ビジネス会話</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                希望日時
              </CardTitle>
              <CardDescription>
                ご希望の日程を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>希望日*</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableDates.map((date) => (
                    <Button
                      key={date.value}
                      type="button"
                      variant={selectedDate === date.value ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleDateSelect(date.value)}
                    >
                      {date.label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <Label>希望時間*</Label>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner className="h-6 w-6 mr-2" />
                      時間枠を確認中...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          type="button"
                          variant={form.preferredTime === slot.time ? "default" : "outline"}
                          className="h-12"
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                        >
                          {slot.time}
                          {!slot.available && (
                            <span className="ml-1 text-xs">×</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>追加情報</CardTitle>
              <CardDescription>
                より良いレッスンのため、ご要望などがあればお聞かせください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hearAbout">当スクールをどちらで知りましたか？</Label>
                <Select onValueChange={(value) => handleInputChange('hearAbout', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google検索</SelectItem>
                    <SelectItem value="sns">SNS</SelectItem>
                    <SelectItem value="friend">友人・知人の紹介</SelectItem>
                    <SelectItem value="flyer">チラシ・広告</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">ご要望・質問など</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="学習目標、気になることなど何でもお聞かせください"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || !form.firstName || !form.lastName || !form.email || !form.phone || !form.preferredDate || !form.preferredTime}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    予約確認中...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    無料体験レッスンを予約する
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                ご予約確認後、LINEとメールで詳細をお送りします
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}