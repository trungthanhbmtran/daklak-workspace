import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, CalendarPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function CalendarAiModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedResult({
        message: "Tôi đã tạo một lịch trình nháp dựa trên yêu cầu của bạn. Bạn có muốn áp dụng lịch trình này không?",
        events: [
          { title: "Di chuyển ra sân bay và bay đến Hà Nội", time: "07:00 - 11:30, Ngày mai" },
          { title: "Họp chiến lược phát triển với đối tác", time: "14:00 - 16:30, Ngày mai" },
          { title: "Tham quan khảo sát thực địa", time: "08:30 - 11:00, Ngày mốt" }
        ]
      });
    }, 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 border-0 shadow-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 rounded-2xl overflow-hidden gap-0">
        <DialogHeader className="p-5 pb-4 border-b border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-200">
            <div className="p-2.5 bg-violet-100 dark:bg-violet-900/40 rounded-xl shadow-inner border border-violet-200/50 dark:border-violet-800/50">
              <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            AI Trợ lý Lịch trình
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-5 min-h-[250px]">
          {!generatedResult && !isGenerating && (
            <div className="text-center py-8 px-4 animate-in fade-in duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-violet-100 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 mb-6 shadow-sm border border-violet-100/50 dark:border-violet-800/20">
                <Sparkles className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Bạn cần lên lịch cho việc gì?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hãy mô tả công việc, chuyến đi công tác hoặc chuỗi sự kiện bằng ngôn ngữ tự nhiên. AI sẽ tự động phân tích và xếp lịch giúp bạn ngay lập tức.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-2xl bg-violet-500/30 animate-pulse"></div>
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin relative z-10" />
              </div>
              <p className="text-sm font-medium text-violet-600 animate-pulse tracking-wide">AI đang phân tích và sắp xếp lịch...</p>
            </div>
          )}

          {generatedResult && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-sm text-emerald-800 dark:text-emerald-300 font-medium flex items-start gap-3 shadow-sm">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                {generatedResult.message}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-widest pl-1">Lịch trình đề xuất</h4>
                <div className="space-y-2">
                  {generatedResult.events.map((evt: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3.5 p-3.5 bg-card border border-border shadow-sm rounded-xl hover:border-violet-300 hover:shadow-md transition-all group">
                      <div className="bg-violet-50 dark:bg-violet-900/30 p-2 rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 transition-colors">
                        <CalendarPlus className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <p className="font-semibold text-[13px] text-foreground">{evt.title}</p>
                        <p className="text-[12px] text-muted-foreground mt-1 font-medium">{evt.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border/50">
          {!generatedResult && (
            <div className="flex gap-3">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Tạo lịch công tác Hà Nội 3 ngày tới..."
                className="flex-1 border-violet-200/60 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 shadow-sm h-11 rounded-xl px-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
              />
              <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isGenerating}
                className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 h-11 w-11 p-0 rounded-xl transition-transform active:scale-95"
              >
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </div>
          )}
          {generatedResult && (
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="rounded-xl h-10 px-6 font-medium" onClick={() => { setPrompt(""); setGeneratedResult(null); }}>
                Hủy bỏ
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 rounded-xl h-10 px-6 font-medium transition-transform active:scale-95" onClick={onClose}>
                Thêm vào Lịch
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
