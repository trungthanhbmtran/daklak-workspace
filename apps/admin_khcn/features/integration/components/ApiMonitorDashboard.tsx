"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { IntegrationConfig } from '../api';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
  integrations: IntegrationConfig[];
}

export function ApiMonitorDashboard({ integrations }: Props) {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>('');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<string>('');
  const [headerParams, setHeaderParams] = useState<Record<string, string>>({});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Lọc chỉ lấy POSTMAN
  const postmanIntegrations = useMemo(() => {
    return integrations.filter(i => {
      try {
        const parsed = JSON.parse(i.configData);
        return parsed.type === 'POSTMAN';
      } catch {
        return false;
      }
    });
  }, [integrations]);

  const selectedIntegration = useMemo(() => {
    return postmanIntegrations.find(i => i.id.toString() === selectedIntegrationId);
  }, [postmanIntegrations, selectedIntegrationId]);

  const endpoints = useMemo(() => {
    if (!selectedIntegration) return [];
    try {
      const parsed = JSON.parse(selectedIntegration.configData);
      return parsed.item || [];
    } catch {
      return [];
    }
  }, [selectedIntegration]);

  const selectedEndpoint = useMemo(() => {
    if (!selectedEndpointIndex || endpoints.length === 0) return null;
    return endpoints[parseInt(selectedEndpointIndex, 10)];
  }, [endpoints, selectedEndpointIndex]);

  // Khi đổi endpoint, setup headers mặc định
  React.useEffect(() => {
    if (selectedEndpoint && selectedEndpoint.request?.header) {
      const initialHeaders: Record<string, string> = {};
      selectedEndpoint.request.header.forEach((h: any) => {
        initialHeaders[h.key] = h.value || '';
      });
      setHeaderParams(initialHeaders);
    } else {
      setHeaderParams({});
    }
    setData([]);
  }, [selectedEndpoint]);

  const handleHeaderChange = (key: string, value: string) => {
    setHeaderParams(prev => ({ ...prev, [key]: value }));
  };

  const handleFetchData = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    try {
      const url = selectedEndpoint.request.url.raw;
      const method = selectedEndpoint.request.method || 'GET';

      const res = await axios({
        method,
        url,
        headers: headerParams
      });

      if (Array.isArray(res.data)) {
        setData(res.data);
        toast.success('Lấy dữ liệu thành công');
      } else if (res.data && Array.isArray(res.data.data)) {
        setData(res.data.data);
        toast.success('Lấy dữ liệu thành công');
      } else {
        toast.warning('Định dạng dữ liệu trả về không phải là mảng.');
        setData(res.data ? [res.data] : []);
      }
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tìm key X và Y cho biểu đồ
  const chartKeys = useMemo(() => {
    if (!data || data.length === 0) return { xAxis: '', yAxis: '' };
    const sample = data[0];
    let xAxis = '';
    let yAxis = '';
    for (const key in sample) {
      if (typeof sample[key] === 'string' && !xAxis) {
        xAxis = key;
      }
      if (typeof sample[key] === 'number' && !yAxis) {
        yAxis = key;
      }
    }
    // Fallback
    if (!xAxis) xAxis = Object.keys(sample)[0];
    if (!yAxis) yAxis = Object.keys(sample).find(k => typeof sample[k] === 'number') || Object.keys(sample)[1];
    return { xAxis, yAxis };
  }, [data]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình Truy vấn API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hệ thống (Postman)</Label>
              <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hệ thống..." />
                </SelectTrigger>
                <SelectContent>
                  {postmanIntegrations.map(i => (
                    <SelectItem key={i.id} value={i.id.toString()}>{i.systemName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Endpoint</Label>
              <Select 
                value={selectedEndpointIndex} 
                onValueChange={setSelectedEndpointIndex}
                disabled={!selectedIntegrationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn API Endpoint..." />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((ep: any, idx: number) => (
                    <SelectItem key={idx} value={idx.toString()}>{ep.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEndpoint && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground">Tham số Truy vấn (Headers)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(headerParams).map(key => (
                  <div key={key} className="space-y-2">
                    <Label>{key}</Label>
                    <Input 
                      value={headerParams[key]} 
                      onChange={e => handleHeaderChange(key, e.target.value)} 
                    />
                  </div>
                ))}
              </div>
              
              <Button onClick={handleFetchData} disabled={loading} className="mt-4">
                {loading ? 'Đang truy vấn...' : 'Truy vấn Dữ liệu'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Giám sát Thống kê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chartKeys.xAxis} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey={chartKeys.yAxis} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Dữ liệu thô (Raw Data)</h3>
              <div className="overflow-auto border rounded-lg max-h-64 bg-slate-50 p-2">
                <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
