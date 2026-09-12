import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Trash2, Edit, Save, FileText, Send } from 'lucide-react';
import { useGetAiAssistants, useCreateAiAssistant, useUpdateAiAssistant, useDeleteAiAssistant, useAddKnowledgeSource, AiAssistant } from '../../hooks/useAiAssistants';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

    let payload: any = {
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

  if (isLoading) return <div>Đang tải danh sách trợ lý...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Quản lý Trợ lý AI (Custom Assistants)
        </h3>
        <Button onClick={handleOpenCreate} iconStart={<Plus className="w-4 h-4" />}>Tạo Trợ lý</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="border border-border">
            <CardHeader className="bg-muted/30 p-4 pb-2">
              <CardTitle className="text-md font-bold">{assistant.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{assistant.description}</p>
              
              <div className="text-xs space-y-1">
                <div><strong>Nguồn tri thức:</strong> {assistant.knowledge_sources?.length || 0} tài liệu</div>
                <div><strong>Trạng thái:</strong> {assistant.is_public ? 'Công khai' : 'Cá nhân'}</div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(assistant)}><Edit className="w-4 h-4 mr-2"/> Sửa</Button>
                <Button size="sm" variant="outline" onClick={() => handleOpenKnowledge(assistant)}><FileText className="w-4 h-4 mr-2"/> Tri thức</Button>
                <Button size="sm" onClick={() => handleOpenChat(assistant)}><Bot className="w-4 h-4 mr-2"/> Chat</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(assistant.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {assistants.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Bạn chưa có trợ lý AI nào. Hãy tạo mới.
          </div>
        )}
      </div>

      {/* Dialog Tạo/Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Sửa Trợ lý' : 'Tạo Trợ lý AI'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tên Trợ lý</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Vd: Chuyên viên Hỗ trợ Pháp lý" />
            </div>
            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>System Prompt (Chỉ dẫn hệ thống)</Label>
              <Textarea 
                value={systemPrompt} 
                onChange={e => setSystemPrompt(e.target.value)} 
                className="min-h-[150px]"
                placeholder="Vd: Bạn là một trợ lý pháp lý xuất sắc. Hãy trả lời câu hỏi dựa trên các tài liệu được cung cấp..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label>Công khai (Mọi người đều dùng được)</Label>
            </div>
            <Button className="w-full" onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Knowledge */}
      <Dialog open={isKnowledgeOpen} onOpenChange={setIsKnowledgeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Thêm nguồn tri thức (Knowledge Base)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">Nhập dữ liệu văn bản hoặc tải lên file (PDF, DOCX) để Trợ lý "{activeKnowledgeAssistant?.name}" học.</p>
            <div className="space-y-2">
              <Label>Tiêu đề tài liệu</Label>
              <Input value={knTitle} onChange={e => setKnTitle(e.target.value)} placeholder="Vd: Quy định nội bộ năm 2025" />
            </div>

            <Tabs value={knType} onValueChange={(v) => setKnType(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="TEXT">Nhập Văn Bản</TabsTrigger>
                <TabsTrigger value="FILE">Tải Lên File</TabsTrigger>
              </TabsList>
              <TabsContent value="TEXT" className="space-y-2 mt-4">
                <Label>Nội dung (Text thô)</Label>
                <Textarea 
                  value={knContent} 
                  onChange={e => setKnContent(e.target.value)} 
                  className="min-h-[200px]"
                  placeholder="Dán nội dung vào đây để máy học..."
                />
              </TabsContent>
              <TabsContent value="FILE" className="space-y-2 mt-4">
                <Label>Tải lên File đính kèm</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById("kn-file-upload")?.click()}
                >
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                  <p className="font-semibold text-foreground">
                    {knFile ? knFile.name : "Nhấn để chọn file tải lên"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Hỗ trợ: PDF, DOCX, TXT</p>
                  <input 
                    id="kn-file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt,.md" 
                    onChange={(e) => setKnFile(e.target.files?.[0] || null)} 
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button className="w-full" onClick={handleSaveKnowledge} disabled={addKnowledgeSource.isPending || isUploading}>
              {(addKnowledgeSource.isPending || isUploading) ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</>
              ) : 'Học tài liệu này'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Chat Playground */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat với {activeChatAssistant?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-muted/20 p-4 rounded-xl mt-4 space-y-4 border border-border">
            {chatLog.map((log, idx) => (
              <div key={idx} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 max-w-[80%] rounded-2xl ${log.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'}`}>
                  {log.content}
                </div>
              </div>
            ))}
            {isChatting && <div className="text-muted-foreground text-sm italic">AI đang suy nghĩ...</div>}
          </div>
          <div className="mt-4 flex gap-2">
            <Input 
              value={chatMessage} 
              onChange={e => setChatMessage(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nhập tin nhắn..." 
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isChatting}><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
