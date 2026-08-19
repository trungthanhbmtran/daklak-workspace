import { useState, useCallback, useEffect } from "react";
import { ParsedEndpoint } from "../components/manager/EndpointTypes";
import { previewReport } from "../../reports/api";

interface UseEndpointManagerProps {
  initialEndpoints: ParsedEndpoint[];
  integration: any;
}

export const useEndpointManager = ({ initialEndpoints, integration }: UseEndpointManagerProps) => {
  const [endpoints, setEndpoints] = useState<ParsedEndpoint[]>(initialEndpoints);
  const [selectedId, setSelectedId] = useState<string | null>(initialEndpoints.length > 0 ? initialEndpoints[0].id : null);
  
  // Test API state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Sync initial endpoints if they change (optional, depending on parent behavior)
  useEffect(() => {
    if (initialEndpoints && initialEndpoints.length > 0 && endpoints.length === 0) {
      setEndpoints(initialEndpoints);
      setSelectedId(initialEndpoints[0].id);
    }
  }, [initialEndpoints]);

  const handleEndpointChange = useCallback((field: keyof ParsedEndpoint, value: any) => {
    setEndpoints(prev => prev.map(ep => 
      ep.id === selectedId ? { ...ep, [field]: value } : ep
    ));
  }, [selectedId]);

  const handleItemChange = useCallback((type: 'headers' | 'params' | 'formItems', index: number, field: 'key' | 'value' | 'description' | 'enabled', val: any) => {
    setEndpoints(prev => {
      const ep = prev.find(e => e.id === selectedId);
      if (!ep) return prev;
      const items = [...(ep[type] || [])];
      items[index] = { ...items[index], [field]: val };
      return prev.map(e => e.id === selectedId ? { ...e, [type]: items } : e);
    });
  }, [selectedId]);
  
  const handleAddItem = useCallback((type: 'headers' | 'params' | 'formItems') => {
    setEndpoints(prev => {
      const ep = prev.find(e => e.id === selectedId);
      if (!ep) return prev;
      const items = [...(ep[type] || []), { key: '', value: '', enabled: true, description: '' }];
      return prev.map(e => e.id === selectedId ? { ...e, [type]: items } : e);
    });
  }, [selectedId]);

  const handleRemoveItem = useCallback((type: 'headers' | 'params' | 'formItems', index: number) => {
    setEndpoints(prev => {
      const ep = prev.find(e => e.id === selectedId);
      if (!ep) return prev;
      const items = [...(ep[type] || [])];
      items.splice(index, 1);
      return prev.map(e => e.id === selectedId ? { ...e, [type]: items } : e);
    });
  }, [selectedId]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setTestResult(null);
  }, []);

  const handleAddEndpoint = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 11);
    setEndpoints(prev => [{
      id: newId,
      name: "New Request",
      folder: "",
      method: "GET",
      path: "/",
      headers: [],
      params: [],
      body: ""
    }, ...prev]);
    setSelectedId(newId);
  }, []);

  const handleDeleteEndpoint = useCallback((id: string) => {
    setEndpoints(prev => {
      const filtered = prev.filter(ep => ep.id !== id);
      if (selectedId === id) {
        setSelectedId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [selectedId]);

  const selectedEndpoint = endpoints.find(ep => ep.id === selectedId);

  const handleTestEndpoint = useCallback(async () => {
    if (!integration || !selectedEndpoint) return;
    setIsTesting(true);
    setTestResult(null);
    setTestModalOpen(true);

    try {
      // Build headers & params object
      const headersMap: Record<string, string> = {};
      
      if (Array.isArray(integration.headers)) {
        integration.headers.forEach((h: any) => {
          if (h.key && h.value) headersMap[h.key.trim()] = h.value.trim();
        });
      } else if (typeof integration.headers === 'object' && integration.headers !== null) {
        Object.entries(integration.headers).forEach(([k, v]) => {
          headersMap[k.trim()] = String(v).trim();
        });
      }
      
      selectedEndpoint.headers?.forEach(h => {
        if (h.key && h.enabled !== false) {
          headersMap[h.key.trim()] = (h.value || "").trim();
        }
      });
      
      let finalPath = selectedEndpoint.path || "";
      const queryParamsMap: Record<string, string> = {};

      selectedEndpoint.params?.forEach(p => {
        if (p.key && p.enabled !== false) {
          const key = p.key.trim();
          const val = (p.value || "").trim();
          
          // Substitute path variables like {key} or :key
          if (finalPath.includes(`{${key}}`)) {
            finalPath = finalPath.replace(`{${key}}`, encodeURIComponent(val));
          } else if (finalPath.includes(`:${key}`)) {
            finalPath = finalPath.replace(`:${key}`, encodeURIComponent(val));
          } else {
            queryParamsMap[key] = val;
          }
        }
      });

      let parsedBody: any = undefined;
      const bodyType = selectedEndpoint.bodyType || 'raw';

      if (bodyType === 'raw') {
        if (selectedEndpoint.body) {
          try {
            parsedBody = JSON.parse(selectedEndpoint.body);
          } catch (e) {
            parsedBody = selectedEndpoint.body; // Fallback to raw string if not JSON
          }
        }
      } else if (bodyType === 'x-www-form-urlencoded') {
        const urlSearchParams = new URLSearchParams();
        selectedEndpoint.formItems?.forEach(item => {
          if (item.key && item.enabled !== false) urlSearchParams.append(item.key.trim(), item.value);
        });
        parsedBody = urlSearchParams.toString();
        headersMap['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (bodyType === 'form-data') {
        const formObj: Record<string, string> = {};
        selectedEndpoint.formItems?.forEach(item => {
          if (item.key && item.enabled !== false) formObj[item.key.trim()] = item.value;
        });
        parsedBody = formObj;
        headersMap['Content-Type'] = 'multipart/form-data';
      } else if (bodyType === 'none') {
        parsedBody = undefined;
      }

      const payload = {
        baseUrl: integration.baseUrl,
        endpointPath: finalPath,
        method: selectedEndpoint.method || 'GET',
        headers: headersMap,
        authType: integration.authType,
        authConfig: integration.authConfig,
        params: queryParamsMap,
        body: parsedBody
      };

      const res = await previewReport(payload);
      setTestResult(res);
    } catch (err: any) {
      setTestResult(err.response?.data || {
        success: false,
        status: err.response?.status || 500,
        statusText: err.response?.statusText || "Error",
        error: err.response?.data?.message || err.message || "Lỗi khi gọi API"
      });
    } finally {
      setIsTesting(false);
    }
  }, [integration, selectedEndpoint]);

  return {
    endpoints,
    setEndpoints,
    selectedId,
    selectedEndpoint,
    testModalOpen,
    setTestModalOpen,
    isTesting,
    testResult,
    handleEndpointChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleSelect,
    handleAddEndpoint,
    handleDeleteEndpoint,
    handleTestEndpoint
  };
};
