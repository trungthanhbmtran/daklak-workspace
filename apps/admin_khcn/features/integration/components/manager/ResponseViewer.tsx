/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Copy, Check, Clock, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponseViewerProps {
  result: any;
  isLoading?: boolean;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const syntaxHighlight = (json: string) => {
  if (!json) return "";
  let formatted = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return formatted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'text-amber-500'; // number
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-sky-400 font-medium'; // key
      } else {
        cls = 'text-emerald-400'; // string
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-violet-400'; // boolean
    } else if (/null/.test(match)) {
      cls = 'text-slate-400'; // null
    }
    return `<span class="${cls}">${match}</span>`;
  });
};

export function ResponseViewer({ result, isLoading }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-slate-950">
        <span className="text-violet-400 animate-pulse text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 animate-spin" />
          Đang gọi API...
        </span>
      </div>
    );
  }

  if (!result) return (
    <div className="flex items-center justify-center h-full w-full bg-slate-950 text-slate-500 text-sm">
      Nhấn Test để xem kết quả
    </div>
  );

  const isSuccess = result.success !== false;
  const status = result.status || (isSuccess ? 200 : 400);
  const statusText = result.statusText || (status === 200 ? "OK" : "Error");
  const time = result.time || 0;
  const sizeBytes = result.size || 0;
  
  const statusColor = status >= 200 && status < 300 ? "text-emerald-500" : "text-rose-500";
  
  const data = result.data !== undefined ? result.data : result;
  
  let jsonString = "";
  let isXml = false;

  if (typeof data === 'object' && data !== null) {
    jsonString = JSON.stringify(data, null, 2);
  } else if (typeof data === 'string') {
    jsonString = data;
    // Kiểm tra xem có phải là XML không
    if (data.trim().startsWith('<') && data.trim().endsWith('>')) {
      isXml = true;
      // Format XML đơn giản
      try {
        let formattedXml = '';
        let pad = 0;
        data.split(/(?=<)|(?<=>)/).forEach(node => {
          if (!node.trim()) return;
          let indent = 0;
          if (node.match(/^\/\w/)) {
            pad -= 1;
          } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) pad -= 1;
          } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
          } else {
            indent = 0;
          }
          formattedXml += '  '.repeat(Math.max(0, pad)) + node + '\n';
          pad += indent;
        });
        jsonString = formattedXml.trim();
      } catch (e) {
        // Fallback to raw if formatting fails
        jsonString = data;
      }
    }
  } else {
    jsonString = String(data);
  }

  const headers = result.headers || {};

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-300">
      {/* Response Meta Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            Status: <span className={`${statusColor}`}>{status} {statusText}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{time} ms</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-400">
            <Database className="w-3.5 h-3.5" />
            <span>{formatBytes(sizeBytes)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            Copy
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 bg-slate-900 border-b border-slate-800 shrink-0">
        <button 
          className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${activeTab === 'body' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          onClick={() => setActiveTab('body')}
        >
          Body
        </button>
        <button 
          className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${activeTab === 'headers' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {activeTab === 'body' ? (
          jsonString.trim() ? (
            <pre 
              className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonString) }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
              Không có nội dung (No Content)
            </div>
          )
        ) : (
          <div className="grid grid-cols-[150px_1fr] gap-2 text-sm font-mono">
            {Object.entries(headers).map(([k, v]) => (
              <React.Fragment key={k}>
                <div className="text-slate-400 font-medium truncate py-1" title={k}>{k}</div>
                <div className="text-slate-300 break-words py-1">{String(v)}</div>
              </React.Fragment>
            ))}
            {Object.keys(headers).length === 0 && (
              <div className="col-span-2 text-slate-500 italic py-2">No headers available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
