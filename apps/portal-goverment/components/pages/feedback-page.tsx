"use client"

import * as React from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  Home, 
  ChevronRight, 
  HelpCircle,
  AlertTriangle,
  Mail,
  Phone,
  ShieldAlert
} from "lucide-react"

interface QuestionItem {
  id: string
  title: string
  sender: string
  submitDate: string
  categoryName: string
  content: string
  answer: string | null
  answerDate: string | null
  status: "approved" | "pending"
}

const INITIAL_QUESTIONS_VI: QuestionItem[] = [
  {
    id: "Q-101",
    title: "Thủ tục cấp Giấy chứng nhận quyền sử dụng đất nông nghiệp lần đầu",
    sender: "Nguyễn Văn Hùng (Thôn 4, xã Dang Kang)",
    submitDate: "02/05/2026",
    categoryName: "Đất đai - Địa chính",
    content: "Chào UBND xã Dang Kang, tôi có một thửa đất trồng cây hàng năm khác khai hoang từ năm 1998 đến nay liên tục sản xuất và không có tranh chấp. Nay tôi muốn xin cấp bìa đỏ lần đầu thì cần chuẩn bị những hồ sơ giấy tờ gì và thời gian giải quyết bao lâu?",
    answer: "Chào anh Hùng, đối với trường hợp cấp Giấy chứng nhận quyền sử dụng đất lần đầu cho đất khai hoang sản xuất ổn định trước năm 2004, anh cần chuẩn bị: (1) Đơn đăng ký cấp Giấy chứng nhận theo mẫu số 04a/ĐK; (2) Bản sao các giấy tờ chứng minh quá trình sử dụng đất (nếu có) hoặc Giấy xác nhận nguồn gốc đất của UBND xã; (3) Bản vẽ trích đo địa chính thửa đất. Bộ phận Địa chính xã sẽ tổ chức niêm yết công khai trạng thái tranh chấp trong 15 ngày tại Nhà văn hóa thôn và Trụ sở UBND xã trước khi chuyển hồ sơ lên UBND huyện giải quyết cấp sổ.",
    answerDate: "04/05/2026",
    status: "approved"
  },
  {
    id: "Q-102",
    title: "Ý kiến phản ánh về việc thu phí vệ sinh môi trường nông thôn mới",
    sender: "Lê Thị Hồng (Thôn 2, xã Dang Kang)",
    submitDate: "30/04/2026",
    categoryName: "Môi trường - Đô thị",
    content: "Góp ý về chất lượng thu gom rác thải sinh hoạt tại trục đường chính thôn 2. Đề nghị đơn vị vệ sinh môi trường thực hiện thu gom đúng khung giờ quy định tránh để rác ứ đọng bốc mùi ảnh hưởng sinh hoạt người dân và mỹ quan nông thôn.",
    answer: "Chào chị Hồng, UBND xã xin tiếp thu ý kiến phản ánh từ chị. Ngay sau khi tiếp nhận phản ánh, UBND xã đã có buổi làm việc nhắc nhở trực tiếp với Ban quản lý dịch vụ thu gom rác thải xã yêu cầu điều chỉnh lại lịch trình xe gom rác, bảo đảm thu dọn sạch sẽ rác tồn đọng trước 17h hàng ngày và cam kết không để xảy ra tình trạng bốc mùi hôi thối trên địa bàn dân cư.",
    answerDate: "02/05/2026",
    status: "approved"
  },
  {
    id: "Q-103",
    title: "Quy trình chuyển đổi thông tin Căn cước công dân trên Giấy khai sinh cho con",
    sender: "Y-Tuyn Knul (Buôn Êga, xã Dang Kang)",
    submitDate: "28/04/2026",
    categoryName: "Hộ tịch - Tư pháp",
    content: "Chào bộ phận hộ tịch xã Dang Kang, tôi vừa đổi từ CMND cũ 9 số sang Căn cước công dân 12 số có mã vạch. Vậy tôi có cần làm thủ tục thay đổi thông tin cha mẹ trên Giấy khai sinh của con tôi hay không, xin hướng dẫn thủ tục?",
    answer: "Chào anh Y-Tuyn Knul, theo quy định của Luật Hộ tịch, việc công dân thay đổi từ Chứng minh nhân dân sang Căn cước công dân không làm thay đổi hay ảnh hưởng đến tính pháp lý của quan hệ cha - con trên Giấy khai sinh đã cấp. Do đó, anh không cần thực hiện thủ tục đính chính hay thay đổi thông tin trên Giấy khai sinh của cháu bé. Giấy khai sinh cũ vẫn hoàn toàn hợp lệ sử dụng liên thông cùng các giấy tờ khác.",
    answerDate: "29/04/2026",
    status: "approved"
  }
]

const INITIAL_QUESTIONS_EN: QuestionItem[] = [
  {
    id: "Q-101",
    title: "Initial agricultural land-use certification procedures",
    sender: "Nguyen Van Hung (Hamlet 4, Dang Kang)",
    submitDate: "02/05/2026",
    categoryName: "Land & Cadastral",
    content: "Hello Dang Kang commune, I have an agricultural land plot cultivated continuously since 1998 without any legal disputes. Now I want to apply for a Red Book (land certificate) for the first time. What documents are required and what is the processing duration?",
    answer: "Hello Mr. Hung, for initial land certification of agricultural land cultivated stably before 2004, you must prepare: (1) Registration Application form 04a/DK; (2) Copies of any historical land-use documents or land origin confirmation from the Commune PC; (3) Extract of cadastral map of the plot. The commune land department will publish a dispute status notification for 15 days at the Hamlet Culture house and Commune PC office before forwarding the dossier to the District PC for certificate issuance.",
    answerDate: "04/05/2026",
    status: "approved"
  },
  {
    id: "Q-102",
    title: "Feedback on rural sanitation waste collection fees",
    sender: "Le Thi Hong (Hamlet 2, Dang Kang)",
    submitDate: "30/04/2026",
    categoryName: "Environment & Urban",
    content: "I am writing to feedback on garbage collection quality along the main road of Hamlet 2. We request the environmental unit to collect garbage at scheduled times to prevent bad odors from affecting residents' health and rural aesthetics.",
    answer: "Hello Mrs. Hong, the commune People's Committee has received your feedback. Immediately upon reception, the PC has held a meeting with the waste management team, requesting adjustments to the garbage truck schedule. They must clean up all remaining garbage before 5:00 PM daily and guarantee no bad odors occur near residential sectors.",
    answerDate: "02/05/2026",
    status: "approved"
  },
  {
    id: "Q-103",
    title: "Changing parent Citizen ID information on a child's Birth Certificate",
    sender: "Y-Tuyn Knul (Ega Village, Dang Kang)",
    submitDate: "28/04/2026",
    categoryName: "Civil Status & Judicial",
    content: "Hello judicial desk, I have recently upgraded from my old 9-digit ID to the new 12-digit Citizen ID Card with barcode. Do I need to perform administrative correction of parent info on my child's birth certificate?",
    answer: "Hello Mr. Y-Tuyn Knul, under Civil Registry law, changing from old ID cards to new Citizen IDs does not invalidate or affect the legality of parent-child relationships on issued birth certificates. Therefore, you do not need to register any corrections or changes. The current Birth Certificate remains fully valid for all public procedures.",
    answerDate: "29/04/2026",
    status: "approved"
  }
]

export default function InteractionsPage() {
  const { language, t } = useLanguage()
  const INITIAL_QUESTIONS = language === "vi" ? INITIAL_QUESTIONS_VI : INITIAL_QUESTIONS_EN

  const [questions, setQuestions] = React.useState<QuestionItem[]>([])
  const [activeQaIdx, setActiveQaIdx] = React.useState<string | null>("Q-101")
  
  // Set and reset questions list on language change
  React.useEffect(() => {
    setQuestions(INITIAL_QUESTIONS)
  }, [language])

  // Form states
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [category, setCategory] = React.useState("Đất đai - Địa chính")
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [formSubmitted, setFormSubmitted] = React.useState(false)

  // Sync category state default value based on language
  React.useEffect(() => {
    setCategory(language === "vi" ? "Đất đai - Địa chính" : "Land & Cadastral")
  }, [language])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !subject || !content) return

    const newQuestion: QuestionItem = {
      id: `Q-PENDING-${Date.now()}`,
      title: subject,
      sender: `${fullName} (${language === "vi" ? "Vừa gửi trực tuyến" : "Just submitted online"})`,
      submitDate: new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US"),
      categoryName: category,
      content: content,
      answer: null,
      answerDate: null,
      status: "pending"
    }

    // Prepend question to mock list
    setQuestions([newQuestion, ...questions])
    setFormSubmitted(true)
    
    // Clear form inputs
    setSubject("")
    setContent("")
  }

  const resetFormState = () => {
    setFormSubmitted(false)
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 animate-fade-in select-none">
      
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-[#b91c1c] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {t("Trang chủ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          {language === "vi" ? "Hỏi đáp & Ý kiến công dân" : "Q&A & Public Feedback"}
        </span>
      </div>

      {/* Main Grid Layout (Left: Form, Right: Historical replies list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Interactive Q&A submission form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-4 sm:gap-5 md:gap-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
              {language === "vi" ? "GỬI CÂU HỎI / Ý KIẾN GÓP Ý" : "SUBMIT INQUIRY / FEEDBACK"}
            </h3>
          </div>

          {!formSubmitted ? (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  {language === "vi" ? "Họ và tên của bạn *" : "Your Full Name *"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={language === "vi" ? "Nhập họ và tên đầy đủ..." : "Type your full name..."}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {language === "vi" ? "Số điện thoại liên hệ" : "Contact Phone Number"}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder={language === "vi" ? "Số điện thoại di động..." : "Type mobile number..."}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    {language === "vi" ? "Địa chỉ Email" : "Email Address"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder={language === "vi" ? "Email để nhận phản hồi..." : "Type email address..."}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  {language === "vi" ? "Lĩnh vực phản ánh *" : "Inquiry Category *"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                >
                  {language === "vi" ? (
                    <>
                      <option>Đất đai - Địa chính</option>
                      <option>Hộ tịch - Tư pháp</option>
                      <option>Môi trường - Đô thị</option>
                      <option>Thái độ phục vụ cán bộ</option>
                      <option>Góp ý xây dựng Đảng bộ</option>
                    </>
                  ) : (
                    <>
                      <option>Land & Cadastral</option>
                      <option>Civil Status & Judicial</option>
                      <option>Environment & Urban</option>
                      <option>Civil Servant Service Quality</option>
                      <option>Party Building Feedback</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  {language === "vi" ? "Tiêu đề phản ánh *" : "Inquiry Subject *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "vi" ? "Nhập tiêu đề tóm tắt câu hỏi..." : "Type subject summary..."}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  {language === "vi" ? "Nội dung câu hỏi chi tiết *" : "Detailed Inquiry Content *"}
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={language === "vi" ? "Nhập chi tiết nội dung sự việc hoặc thắc mắc cần cơ quan nhà nước giải quyết..." : "Write detailed inquiry or request description..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white leading-relaxed"
                />
              </div>

              <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-3 rounded-lg flex items-start gap-2 text-[10px] text-slate-500 font-medium mt-1 leading-normal">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  {language === "vi"
                    ? "Mọi câu hỏi phản ánh của quý công dân sẽ được gửi đến Ban Tiếp công dân trực thuộc Văn phòng UBND xã Dang Kang để phê duyệt kiểm duyệt nội dung trước khi công khai lên hệ thống Portal."
                    : "All citizen inquiries will be sent to the Citizen Reception Board under Dang Kang Commune PC Office for content moderation before publishing online."}
                </span>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-[#b91c1c] hover:bg-red-700 text-white font-bold tracking-wider py-3 rounded-xl transition-colors uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-4 h-4 text-[#fef08a]" />
                {language === "vi" ? "GỬI Ý KIẾN PHẢN ÁNH" : "SUBMIT FEEDBACK MESSAGE"}
              </button>
            </form>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex flex-col gap-4 text-center items-center animate-fade-in text-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-black text-slate-850 uppercase">
                  {language === "vi" ? "Gửi Ý Kiến Thành Công!" : "Feedback Sent Successfully!"}
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {language === "vi"
                    ? "Cổng thông tin điện tử UBND xã đã tiếp nhận câu hỏi phản ánh của bạn. Vui lòng theo dõi trạng thái tại danh sách phía bên phải."
                    : "The commune PC portal has received your inquiry. Please track its moderation status on the right-hand panel list."}
                </p>
              </div>
              <button
                onClick={resetFormState}
                className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow"
              >
                {language === "vi" ? "Gửi thêm ý kiến khác" : "Submit another inquiry"}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Q&A thread list with reactive moderation state */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
            <HelpCircle className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
              {language === "vi" ? "Ý KIẾN CÔNG DÂN & PHẢN HỒI CHÍNH THỨC" : "CITIZEN INQUIRIES & OFFICIAL RESPONSES"}
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((item) => {
              const isOpen = activeQaIdx === item.id
              const isPending = item.status === "pending"
              
              return (
                <div 
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all text-xs ${
                    isOpen 
                      ? "border-[#b91c1c]" 
                      : isPending 
                        ? "border-amber-400 bg-amber-500/5"
                        : "border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  {/* Item Accordion Header */}
                  <button
                    onClick={() => !isPending && setActiveQaIdx(isOpen ? null : item.id)}
                    className="w-full p-3.5 sm:p-4 text-left font-extrabold text-slate-900 dark:text-white hover:bg-slate-50/50 dark:hover:bg-slate-950/40 flex justify-between items-start gap-4 transition-colors"
                  >
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isPending 
                            ? "bg-amber-500 text-white animate-pulse" 
                            : "bg-[#b91c1c] text-white"
                        }`}>
                          {item.categoryName}
                        </span>
                        {isPending && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {language === "vi" ? "Đang kiểm duyệt" : "Moderating"}
                          </span>
                        )}
                        <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {language === "vi" ? "Ngày:" : "Date:"} {item.submitDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-white leading-snug tracking-wide">{item.title}</h4>
                      <span className="text-slate-400 text-[10px] font-semibold">
                        {language === "vi" ? "Người gửi:" : "Sender:"} {item.sender}
                      </span>
                    </div>
                    {!isPending && (
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#b91c1c]" : "text-slate-400"}`} />
                    )}
                  </button>

                  {/* Item Collapsible Body */}
                  {isOpen && !isPending && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 flex flex-col gap-3.5 sm:gap-4 leading-relaxed text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                          {language === "vi" ? "Nội dung phản ánh" : "Inquiry Content"}
                        </span>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/50 dark:border-slate-850">{item.content}</p>
                      </div>

                      {item.answer ? (
                        <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-4">
                          <span className="text-[10px] text-red-600 dark:text-[#fbc02d] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 
                            {language === "vi" ? "PHẢN HỒI CHÍNH THỨC TỪ CHÍNH QUYỀN XÃ DANG KANG" : "OFFICIAL RESPONSE FROM DANG KANG COMMUNE PC"}
                          </span>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed pl-1">{item.answer}</p>
                          <div className="text-[10px] text-slate-400 font-bold mt-2 pt-1 border-t border-slate-50 dark:border-slate-850/50 flex justify-between">
                            <span>
                              {language === "vi" ? "Đơn vị trả lời: Văn phòng một cửa UBND xã" : "Responding Unit: One-Stop Office of Commune PC"}
                            </span>
                            <span>
                              {language === "vi" ? "Ngày trả lời:" : "Response Date:"} {item.answerDate}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 font-semibold italic border-t border-slate-100 pt-4">
                          <Clock className="w-4 h-4" />
                          <span>
                            {language === "vi" 
                              ? "Hồ sơ đã được duyệt công khai, đang chờ ý kiến tham mưu chuyên môn từ bộ phận địa chính/tư pháp để ban hành câu trả lời chính thức."
                              : "This inquiry is approved publicly. Currently awaiting consulting suggestions from judicial/cadastral department to issue official response."}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* If it's pending, show custom warning inside header box for citizen comfort */}
                  {isPending && (
                    <div className="px-4 pb-4 leading-relaxed text-slate-500 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 p-3.5 sm:p-4 pb-3.5 sm:pb-4 flex flex-col gap-2 font-medium">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          {language === "vi" ? "Nội dung của bạn đã được lưu tạm ở trình duyệt" : "Your inquiry has been cached locally in browser"}
                        </span>
                      </div>
                      <p className="pl-1">
                        {language === "vi"
                          ? "Hệ thống đang tiến hành điều phối đến gRPC `interaction.InteractionService` phê duyệt kiểm duyệt theo Quy trình Decree 42 CMS công vụ. Câu hỏi sẽ công khai ngay sau khi được Chủ tịch UBND xã hoặc quản trị viên thông qua."
                          : "The system is dispatching this request to gRPC `InteractionService` for validation under Decree 42 CMS rules. The feedback will be made public once authorized by the Chairman."}
                      </p>
                      <p className="font-bold text-slate-400 bg-slate-100/50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150/50 font-mono text-[10px]">
                        <strong>{language === "vi" ? "Câu hỏi của bạn:" : "Your inquiry:"}</strong> &quot;{item.content}&quot;
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>

    </div>
  )
}
