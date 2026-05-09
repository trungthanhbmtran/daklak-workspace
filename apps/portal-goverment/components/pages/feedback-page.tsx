"use client"

import * as React from "react"
import Link from "next/link"
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

const INITIAL_QUESTIONS: QuestionItem[] = [
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

export default function InteractionsPage() {
  const [questions, setQuestions] = React.useState<QuestionItem[]>([])
  const [activeQaIdx, setActiveQaIdx] = React.useState<string | null>("Q-101")

  React.useEffect(() => {
    setQuestions(INITIAL_QUESTIONS)
  }, [])

  // Form states
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [category, setCategory] = React.useState("Đất đai - Địa chính")
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [formSubmitted, setFormSubmitted] = React.useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !subject || !content) return

    const newQuestion: QuestionItem = {
      id: `Q-PENDING-${Date.now()}`,
      title: subject,
      sender: `${fullName} (Vừa gửi trực tuyến)`,
      submitDate: new Date().toLocaleDateString("vi-VN"),
      categoryName: category,
      content: content,
      answer: null,
      answerDate: null,
      status: "pending"
    }

    setQuestions([newQuestion, ...questions])
    setFormSubmitted(true)

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
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          Hỏi đáp & Ý kiến công dân
        </span>
      </div>

      {/* Main Grid Layout (Left: Form, Right: Historical replies list) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Column: Interactive Q&A submission form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-4 sm:gap-5 md:gap-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MessageSquare className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
              GỬI CÂU HỎI / Ý KIẾN GÓP Ý
            </h3>
          </div>

          {!formSubmitted ? (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  Họ và tên của bạn *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên đầy đủ..."
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
                    Số điện thoại liên hệ
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Số điện thoại di động..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email để nhận phản hồi..."
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
                  Lĩnh vực phản ánh *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                >
                  <option>Đất đai - Địa chính</option>
                  <option>Hộ tịch - Tư pháp</option>
                  <option>Môi trường - Đô thị</option>
                  <option>Thái độ phục vụ cán bộ</option>
                  <option>Góp ý xây dựng Đảng bộ</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  Tiêu đề phản ánh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề tóm tắt câu hỏi..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">
                  Nội dung câu hỏi chi tiết *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Nhập chi tiết nội dung sự việc hoặc thắc mắc cần cơ quan nhà nước giải quyết..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white leading-relaxed"
                />
              </div>

              <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-3 rounded-lg flex items-start gap-2 text-[10px] text-slate-500 font-medium mt-1 leading-normal">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  Mọi câu hỏi phản ánh của quý công dân sẽ được gửi đến Ban Tiếp công dân trực thuộc Văn phòng UBND xã Dang Kang để phê duyệt kiểm duyệt nội dung trước khi công khai lên hệ thống Portal.
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#b91c1c] hover:bg-red-700 text-white font-bold tracking-wider py-3 rounded-xl transition-colors uppercase flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-4 h-4 text-[#fef08a]" />
                GỬI Ý KIẾN PHẢN ÁNH
              </button>
            </form>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex flex-col gap-4 text-center items-center animate-fade-in text-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-black text-slate-850 uppercase">
                  Gửi Ý Kiến Thành Công!
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Cổng thông tin điện tử UBND xã đã tiếp nhận câu hỏi phản ánh của bạn. Vui lòng theo dõi trạng thái tại danh sách phía bên phải.
                </p>
              </div>
              <button
                onClick={resetFormState}
                className="bg-slate-950 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow"
              >
                Gửi thêm ý kiến khác
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Q&A thread list with reactive moderation state */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
            <HelpCircle className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
              Ý KIẾN CÔNG DÂN & PHẢN HỒI CHÍNH THỨC
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {questions.map((item) => {
              const isOpen = activeQaIdx === item.id
              const isPending = item.status === "pending"

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all text-xs text-slate-700 dark:text-slate-300 ${isOpen
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
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isPending
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-[#b91c1c] text-white"
                          }`}>
                          {item.categoryName}
                        </span>
                        {isPending && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Đang kiểm duyệt
                          </span>
                        )}
                        <span className="text-slate-400 text-[10px] font-medium flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Ngày: {item.submitDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-white leading-snug tracking-wide">{item.title}</h4>
                      <span className="text-slate-400 text-[10px] font-semibold">
                        Người gửi: {item.sender}
                      </span>
                    </div>
                    {!isPending && (
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#b91c1c]" : "text-slate-400"}`} />
                    )}
                  </button>

                  {/* Item Collapsible Body */}
                  {isOpen && !isPending && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 flex flex-col gap-3.5 sm:gap-4 leading-relaxed">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                          Nội dung phản ánh
                        </span>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/50 dark:border-slate-850">{item.content}</p>
                      </div>

                      {item.answer ? (
                        <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-4">
                          <span className="text-[10px] text-red-600 dark:text-[#fbc02d] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            PHẢN HỒI CHÍNH THỨC TỪ CHÍNH QUYỀN XÃ DANG KANG
                          </span>
                          <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed pl-1">{item.answer}</p>
                          <div className="text-[10px] text-slate-400 font-bold mt-2 pt-1 border-t border-slate-50 dark:border-slate-850/50 flex justify-between">
                            <span>
                              Đơn vị trả lời: Văn phòng một cửa UBND xã
                            </span>
                            <span>
                              Ngày trả lời: {item.answerDate}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 font-semibold italic border-t border-slate-100 pt-4">
                          <Clock className="w-4 h-4" />
                          <span>
                            Hồ sơ đã được duyệt công khai, đang chờ ý kiến tham mưu chuyên môn từ bộ phận địa chính/tư pháp để ban hành câu trả lời chính thức.
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
                          Nội dung của bạn đã được lưu tạm ở trình duyệt
                        </span>
                      </div>
                      <p className="pl-1">
                        Hệ thống đang tiến hành điều phối đến gRPC `interaction.InteractionService` phê duyệt kiểm duyệt theo Quy trình Decree 42 CMS công vụ. Câu hỏi sẽ công khai ngay sau khi được Chủ tịch UBND xã hoặc quản trị viên thông qua.
                      </p>
                      <p className="font-bold text-slate-400 bg-slate-100/50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150/50 font-mono text-[10px]">
                        <strong>Câu hỏi của bạn:</strong> &quot;{item.content}&quot;
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
