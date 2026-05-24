"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Plus, Trash2, Save, Activity, Settings2, ShieldCheck, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/axiosInstance';
import { toast } from 'sonner';

export interface AiProviderConfig {
  id: string;
  provider: 'OPENAI' | 'GEMINI' | 'CLAUDE';
  model: string;
  apiKey: string;
  priority: number;
  enabled: boolean;
}

export function SystemSettingsClient() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [aiProviders, setAiProviders] = useState<AiProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await apiClient.get('/system-configs') as any;
      if (res.status === 'success' && res.data) {
        const map: Record<string, string> = {};
        res.data.forEach((c: any) => {
          map[c.key] = c.value;
        });
        setConfigs(map);

        if (map['AI_PROVIDERS']) {
          try {
            const parsed = JSON.parse(map['AI_PROVIDERS']);
            setAiProviders(Array.isArray(parsed) ? parsed.sort((a, b) => a.priority - b.priority) : []);
          } catch (e) {
            console.error("Failed to parse AI_PROVIDERS", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải cấu hình hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAiProvider = () => {
    const newId = `ai_${Date.now()}`;
    const newProvider: AiProviderConfig = {
      id: newId,
      provider: 'OPENAI',
      model: 'gpt-4o-mini',
      apiKey: '',
      priority: aiProviders.length + 1,
      enabled: true
    };
    setAiProviders([...aiProviders, newProvider]);
  };

  const handleRemoveAiProvider = (id: string) => {
    setAiProviders(aiProviders.filter(p => p.id !== id));
  };

  const handleProviderChange = (id: string, field: keyof AiProviderConfig, value: any) => {
    setAiProviders(aiProviders.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const handleSaveAiConfigs = async () => {
    setIsSaving(true);
    // Sort before save
    const sorted = [...aiProviders].sort((a, b) => a.priority - b.priority);
    try {
      const res = await apiClient.put('/system-configs', {
        key: 'AI_PROVIDERS',
        value: JSON.stringify(sorted),
        description: 'Cấu hình AI Đa nền tảng & Cơ chế Failover'
      }) as any;
      if (res.status === 'success') {
        toast.success(`Đã cập nhật hệ thống định tuyến AI thành công!`);
        setAiProviders(sorted);
      } else {
        toast.error(`Lỗi cập nhật cấu hình AI`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi hệ thống khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTranslation = async () => {
    setIsSaving(true);
    try {
      const res = await apiClient.put('/system-configs', {
        key: 'TRANSLATE_SERVICE',
        value: configs['TRANSLATE_SERVICE'] || 'GOOGLE',
        description: 'Dịch vụ dịch thuật'
      }) as any;
      if (res.status === 'success') {
        toast.success(`Đã cập nhật cấu hình Dịch thuật thành công!`);
      } else {
        toast.error(`Lỗi cập nhật cấu hình`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi hệ thống khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-600" />
          Cấu hình Hệ thống & Dịch vụ Nền tảng
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Quản lý các thông số cốt lõi, dịch vụ AI, dịch thuật và định tuyến thông minh.
        </p>
      </div>

      <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Smart AI Router (Hệ thống Định tuyến AI & Dự phòng)
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Cấu hình nhiều LLM. Hệ thống sẽ tự động chuyển sang mô hình có mức ưu tiên thấp hơn nếu mô hình chính hết Token hoặc lỗi API.</p>
          </div>
          <Button onClick={handleSaveAiConfigs} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 px-6 h-11">
            {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu cấu hình AI</>}
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 bg-slate-50/50">
          {aiProviders.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">Chưa có Cấu hình AI nào</h3>
              <p className="text-slate-500 mb-4 text-sm">Hệ thống AI đang tắt. Hãy thêm nhà cung cấp để kích hoạt Smart Router.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiProviders.map((provider, index) => (
                <div key={provider.id} className={`p-5 bg-white rounded-2xl border ${provider.enabled ? 'border-blue-200 shadow-md shadow-blue-900/5' : 'border-slate-200 opacity-60'} relative transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${provider.enabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        #{provider.priority}
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">Ưu tiên {provider.priority} {provider.enabled ? '' : '(Đã tắt)'}</h4>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleProviderChange(provider.id, 'enabled', !provider.enabled)} className={provider.enabled ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'}>
                        {provider.enabled ? 'Đang Bật' : 'Đang Tắt'}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveAiProvider(provider.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nhà Cung cấp</label>
                      <select 
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-700"
                        value={provider.provider}
                        onChange={(e) => handleProviderChange(provider.id, 'provider', e.target.value)}
                      >
                        <option value="OPENAI">OpenAI (GPT)</option>
                        <option value="GEMINI">Google Gemini</option>
                        <option value="CLAUDE">Anthropic Claude</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tên Model</label>
                      <input 
                        type="text"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={provider.model}
                        onChange={(e) => handleProviderChange(provider.id, 'model', e.target.value)}
                        placeholder="vd: gpt-4o, gemini-1.5-pro"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mức ưu tiên (Số nhỏ gọi trước)</label>
                      <input 
                        type="number"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={provider.priority}
                        onChange={(e) => handleProviderChange(provider.id, 'priority', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">API Key (Token)</label>
                      <input 
                        type="password"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={provider.apiKey}
                        onChange={(e) => handleProviderChange(provider.id, 'apiKey', e.target.value)}
                        placeholder="Nhập API Key bảo mật..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button onClick={handleAddAiProvider} variant="outline" className="w-full mt-4 h-12 border-dashed border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 rounded-xl transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Thêm Cấu hình AI Dự phòng
          </Button>

          <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p><strong>Lưu ý về định tuyến:</strong> Hệ thống sẽ gọi API Key theo mức độ ưu tiên (nhỏ đến lớn). Nếu hệ thống gặp mã lỗi HTTP 429 (Hết Rate Limit) hoặc 401 (Hết tiền/Token sai), bộ định tuyến sẽ chặn request đó và tự động thử ngay mô hình tiếp theo trong danh sách mà người dùng không hề hay biết sự cố mạng đang xảy ra.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-800">
            🌐 Cấu hình Dịch thuật Tiêu chuẩn
          </CardTitle>
          <Button onClick={handleSaveTranslation} disabled={isSaving} className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-lg px-6 h-11">
            {isSaving ? 'Đang lưu...' : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-md space-y-2">
            <label className="text-sm font-bold text-slate-700">Dịch vụ Dịch thuật mặc định</label>
            <select 
              className="w-full h-12 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-500 outline-none text-sm font-medium"
              value={configs['TRANSLATE_SERVICE'] || 'GOOGLE'}
              onChange={(e) => setConfigs(prev => ({ ...prev, 'TRANSLATE_SERVICE': e.target.value }))}
            >
              <option value="GOOGLE">Google Translate API</option>
              <option value="DEEPL">DeepL Pro</option>
              <option value="AI_ROUTER">Dùng chung hệ thống AI Smart Router</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
