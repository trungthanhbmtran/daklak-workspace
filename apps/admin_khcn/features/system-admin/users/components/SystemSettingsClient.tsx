"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';

export function SystemSettingsClient() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/system-configs');
      const json = await res.json();
      if (json.status === 'success') {
        const map: Record<string, string> = {};
        json.data.forEach((c: any) => {
          map[c.key] = c.value;
        });
        setConfigs(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string, value: string, description: string) => {
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:3000/admin/system-configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description })
      });
      const json = await res.json();
      if (json.status === 'success') {
        alert(`Đã cập nhật ${key} thành công!`);
      } else {
        alert(`Lỗi cập nhật ${key}`);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi hệ thống');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Đang tải cấu hình...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-blue-50/50">
          <CardTitle className="text-xl font-bold text-blue-800">
            🤖 Cấu hình AI (Mock)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">AI Model</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={configs['AI_MODEL'] || 'GPT-4'}
              onChange={(e) => handleChange('AI_MODEL', e.target.value)}
            >
              <option value="GPT-4">OpenAI GPT-4</option>
              <option value="GEMINI">Google Gemini Pro</option>
            </select>
            <button 
              onClick={() => handleSave('AI_MODEL', configs['AI_MODEL'] || 'GPT-4', 'Mô hình AI mặc định')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
            >Lưu thay đổi</button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">API Key</label>
            <input 
              type="password"
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
              value={configs['AI_API_KEY'] || ''}
              onChange={(e) => handleChange('AI_API_KEY', e.target.value)}
              placeholder="Nhập API Key..."
            />
            <button 
              onClick={() => handleSave('AI_API_KEY', configs['AI_API_KEY'] || '', 'API Key cho AI Model')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
            >Lưu thay đổi</button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-indigo-50/50">
          <CardTitle className="text-xl font-bold text-indigo-800">
            🌐 Cấu hình Dịch thuật
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Dịch vụ Dịch thuật</label>
            <select 
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
              value={configs['TRANSLATE_SERVICE'] || 'GOOGLE'}
              onChange={(e) => handleChange('TRANSLATE_SERVICE', e.target.value)}
            >
              <option value="GOOGLE">Google Translate</option>
              <option value="DEEPL">DeepL</option>
            </select>
            <button 
              onClick={() => handleSave('TRANSLATE_SERVICE', configs['TRANSLATE_SERVICE'] || 'GOOGLE', 'Dịch vụ dịch thuật')}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700"
            >Lưu thay đổi</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
