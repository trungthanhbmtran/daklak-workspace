import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Trash2, Edit, Save, FileText, Send } from 'lucide-react';
import { useGetAiAssistants, useCreateAiAssistant, useUpdateAiAssistant, useDeleteAiAssistant, useAddKnowledgeSource, AiAssistant } from '../../hooks/useAiAssistants';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Loader2 } from 'lucide-react';

export function PersonalAiAssistants() {
  const { data: assistants = [], isLoading } = useGetAiAssistants();
  const createAssistant = useCreateAiAssistant();
  const updateAssistant = useUpdateAiAssistant();
  const deleteAssistant = useDeleteAiAssistant();
  const addKnowledgeSource = useAddKnowledgeSource();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Chat/Test State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatAssistant, setActiveChatAssistant] = useState<AiAssistant | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Knowledge State
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [activeKnowledgeAssistant, setActiveKnowledgeAssistant] = useState<AiAssistant | null>(null);
  const [knTitle, setKnTitle] = useState('');
  const [knContent, setKnContent] = useState('');
  const [knType, setKnType] = useState<'TEXT' | 'FILE'>('TEXT');
  const [knFile, setKnFile] = useState<File | null>(null);
  const { uploadFile, isUploading } = useFileUpload();

  const resetForm = () => {
    setName('');
    setDescription('');
    setSystemPrompt('');
    setIsPublic(false);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (assistant: AiAssistant) => {
    setEditingId(assistant.id);
    setName(assistant.name);
    setDescription(assistant.description);
    setSystemPrompt(assistant.system_prompt);
    setIsPublic(assistant.is_public);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name || !systemPrompt) return;
    
    if (editingId) {
      await updateAssistant.mutateAsync({
        id: editingId,
        name,
        description,
        system_prompt: systemPrompt,
        is_public: isPublic
      });
    } else {
      await createAssistant.mutateAsync({
        name,
        description,
        system_prompt: systemPrompt,
        is_public: isPublic
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xoá trợ lý này?")) {
      await deleteAssistant.mutateAsync(id);
    }
  };

  const handleOpenChat = (assistant: AiAssistant) => {
    setActiveChatAssistant(assistant);
    setChatLog([]);
    setChatMessage('');
    setIsChatOpen(true);
  };

  const handleSendMessage = async () => {
    if (!chatMessage || !activeChatAssistant) return;
    
    const userMsg = chatMessage;
    setChatLog(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatMessage('');
    setIsChatting(true);
    
    try {
      const { data } = await axios.post(`/api/v1/admin/ai-assistants/${activeChatAssistant.id}/chat`, {
        message: userMsg
      });
      setChatLog(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setChatLog(prev => [...prev, { role: 'assistant', content: "Lỗi kết nối tới AI hoặc hết quota." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleOpenKnowledge = (assistant: AiAssistant) => {
    setActiveKnowledgeAssistant(assistant);
    setKnTitle('');
    setKnContent('');
    setKnType('TEXT');
    setKnFile(null);
    setIsKnowledgeOpen(true);
  };

  const handleSaveKnowledge = async () => {
    if (!activeKnowledgeAssistant || !knTitle) return;
    
    if (knType === 'TEXT' && !knContent) return;
    if (knType === 'FILE' && !knFile) return;

    const payload: any = {
      assistantId: activeKnowledgeAssistant.id,
      title: knTitle,
      type: knType,
    };

    if (knType === 'TEXT') {
      payload.content = knContent;
    } else if (knType === 'FILE' && knFile) {
      const media = await uploadFile(knFile);
      if (!media || !media.url) {
        toast.error('Upload file thất bại');
        return;
      }
      payload.metadata = JSON.stringify({ url: media.url, filename: knFile.name });
    }
    
    await addKnowledgeSource.mutateAsync(payload);
    
    setIsKnowledgeOpen(false);
    setKnTitle('');
    setKnContent('');
    setKnFile(null);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Đang tải danh sách trợ lý...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Quản lý Trợ lý AI (Custom Assistants)
        </h3>
        <Button onClick={handleOpenCreate} iconStart={<Plus className="w-4 h-4" />} className="w-full sm:w-auto h-10 px-4">
          Tạo Trợ lý
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="border border-border/60 hover:border-primary/30 transition-colors shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/10 p-5 border-b border-border/30">
              <CardTitle className="text-base font-bold text-foreground truncate" title={assistant.name}>
                {assistant.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col flex-1 gap-5">
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]" title={assistant.description}>
                {assistant.description || "Không có mô tả."}
              </p>
              
              <div className="flex items-center gap-4 text-xs bg-muted/20 p-2.5 rounded-lg border border-border/40">
                <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-muted-foreground"/> <strong>Tri thức:</strong> {assistant.knowledge_sources?.length || 0} mục</div>
                <div className="w-px h-3 bg-border"></div>
                <div className="flex items-center gap-1.5"><strong>Trạng thái:</strong> <span className={assistant.is_public ? 'text-primary' : 'text-muted-foreground'}>{assistant.is_public ? 'Công khai' : 'Cá nhân'}</span></div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 mt-auto">
                <Button size="sm" variant="outline" className="flex-1 min-w-[80px]" onClick={() => handleOpenEdit(assistant)}><Edit className="w-3.5 h-3.5"/> Sửa</Button>
                <Button size="sm" variant="outline" className="flex-1 min-w-[90px]" onClick={() => handleOpenKnowledge(assistant)}><FileText className="w-3.5 h-3.5"/> Tri thức</Button>
                <Button size="sm" className="flex-1 min-w-[80px]" onClick={() => handleOpenChat(assistant)}><Bot className="w-3.5 h-3.5"/> Chat</Button>
                <Button size="icon" variant="outline" className="text-red-500 hover:bg-red-50 border-red-100 hover:border-red-200" onClick={() => handleDelete(assistant.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {assistants.length === 0 && (
          <div className="col-span-full text-center py-16 px-4 border-2 border-dashed border-border/60 rounded-2xl bg-muted/10">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h4 className="text-lg font-semibold text-foreground mb-1">Chưa có trợ lý AI</h4>
            <p className="text-sm text-muted-foreground mb-4">Bạn chưa tạo bất kỳ trợ lý AI nào. Hãy tạo một trợ lý để bắt đầu.</p>
            <Button onClick={handleOpenCreate} iconStart={<Plus className="w-4 h-4" />}>Tạo Trợ lý AI đầu tiên</Button>
          </div>
        )}
      </div>

      {/* Dialog Tạo/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto w-[95vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingId ? 'Sửa Trợ lý AI' : 'Tạo Trợ lý AI mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên Trợ lý</Label>
              <Input className="h-11" value={name} onChange={e => setName(e.target.value)} placeholder="Vd: Chuyên viên Hỗ trợ Pháp lý" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mô tả ngắn</Label>
              <Input className="h-11" value={description} onChange={e => setDescription(e.target.value)} placeholder="Nhập mô tả về nhiệm vụ của trợ lý..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Prompt (Chỉ dẫn hệ thống)</Label>
              <Textarea 
                value={systemPrompt} 
                onChange={e => setSystemPrompt(e.target.value)} 
                className="min-h-[160px] resize-y p-3 leading-relaxed"
                placeholder="Vd: Bạn là một trợ lý pháp lý xuất sắc. Hãy trả lời câu hỏi dựa trên các tài liệu được cung cấp..."
              />
            </div>
            <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} id="isPublicAssist" />
              <div className="space-y-0.5">
                <Label htmlFor="isPublicAssist" className="cursor-pointer text-sm font-semibold">Công khai trợ lý này</Label>
                <p className="text-xs text-muted-foreground">Mọi người trong hệ thống đều có thể sử dụng.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full sm:w-auto h-11 px-8" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Lưu thông tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Knowledge */}
      <Dialog open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto w-[95vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Thêm Nguồn Tri thức</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <p className="text-sm text-muted-foreground">
              Nhập dữ liệu văn bản hoặc tải lên file (PDF, DOCX) để huấn luyện Trợ lý <strong className="text-foreground">"{activeKnowledgeAssistant?.name}"</strong>.
            </p>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tiêu đề tài liệu</Label>
              <Input className="h-11" value={knTitle} onChange={e => setKnTitle(e.target.value)} placeholder="Vd: Quy định nội bộ năm 2025" />
            </div>

            <Tabs value={knType} onValueChange={(v) => setKnType(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/40">
                <TabsTrigger value="TEXT" className="rounded-md">Nhập Văn Bản</TabsTrigger>
                <TabsTrigger value="FILE" className="rounded-md">Tải Lên File</TabsTrigger>
              </TabsList>
              <div className="mt-5 border border-border rounded-xl bg-card overflow-hidden">
                <TabsContent value="TEXT" className="m-0 border-0 p-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Nội dung (Text thô)</Label>
                  <Textarea 
                    value={knContent} 
                    onChange={e => setKnContent(e.target.value)} 
                    className="min-h-[220px] resize-y border-0 focus-visible:ring-0 px-0 leading-relaxed bg-transparent"
                    placeholder="Dán nội dung văn bản vào đây để máy học..."
                  />
                </TabsContent>
                <TabsContent value="FILE" className="m-0 border-0 p-4 space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Tải lên File đính kèm</Label>
                  <div 
                    className="border-2 border-dashed border-border/60 hover:border-primary/50 bg-muted/10 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-muted/30 flex flex-col items-center justify-center"
                    onClick={() => document.getElementById("kn-file-upload")?.click()}
                  >
                    <div className="w-14 h-14 bg-background border shadow-sm rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      {knFile ? knFile.name : "Nhấn để chọn file tải lên"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Hỗ trợ định dạng: PDF, DOCX, TXT</p>
                    <input 
                      id="kn-file-upload" 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.txt,.md" 
                      onChange={(e) => setKnFile(e.target.files?.[0] || null)} 
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          <DialogFooter>
            <Button className="w-full h-11" onClick={handleSaveKnowledge} disabled={addKnowledgeSource.isPending || isUploading}>
              {(addKnowledgeSource.isPending || isUploading) ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý tải lên...</>
              ) : (
                <><Save className="w-4 h-4" /> Lưu & Học tài liệu này</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Chat Playground */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[700px] h-[85vh] sm:h-[80vh] flex flex-col w-[95vw] rounded-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="p-5 border-b bg-card">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary"/>
              Chat với {activeChatAssistant?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto bg-muted/10 p-5 space-y-5">
            {chatLog.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                <Bot className="w-12 h-12 mb-3" />
                <p>Bắt đầu trò chuyện với trợ lý này.</p>
              </div>
            )}
            {chatLog.map((log, idx) => (
              <div key={idx} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3.5 text-sm max-w-[85%] sm:max-w-[75%] rounded-2xl shadow-sm leading-relaxed ${log.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-background border border-border/50 rounded-tl-sm'}`}>
                  {log.content}
                </div>
              </div>
            ))}
            {isChatting && (
              <div className="flex justify-start">
                <div className="p-3.5 bg-background border border-border/50 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse delay-150"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-card flex gap-3">
            <Input 
              value={chatMessage} 
              onChange={e => setChatMessage(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Hỏi trợ lý điều gì đó..." 
              className="flex-1 h-11 rounded-xl bg-muted/20"
            />
            <Button onClick={handleSendMessage} disabled={isChatting || !chatMessage.trim()} className="h-11 w-11 rounded-xl p-0 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
