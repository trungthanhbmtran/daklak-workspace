"use client"

import * as React from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import { usePublicProcedures, usePublicDossier } from "@/hooks/usePublicData"
import { 
  FileSearch, 
  Search, 
  Clock, 
  Coins, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle, 
  Home, 
  ChevronRight, 
  Download,
  AlertCircle,
  Check
} from "lucide-react"

const MOCK_PROCEDURES_VI = [
  {
    id: "01",
    title: "Đăng ký khai sinh lưu động / trực tuyến cấp xã",
    time: "Trong ngày làm việc",
    fee: "Miễn phí hoàn toàn",
    docs: [
      "Tờ khai đăng ký khai sinh theo mẫu quy định (Tải mẫu)",
      "Giấy chứng sinh của trẻ em do cơ sở y tế cấp (hoặc văn bản làm chứng)",
      "Căn cước công dân của cha và mẹ để chứng minh quan hệ hôn nhân"
    ],
    steps: [
      "Công dân đăng ký trực tuyến hoặc trực tiếp nộp hồ sơ tại bộ phận một cửa xã.",
      "Công chức Tư pháp - Hộ tịch tiếp nhận hồ sơ, kiểm tra tính hợp lệ và cập nhật cơ sở dữ liệu quốc gia.",
      "Chủ tịch UBND xã ký duyệt Giấy khai sinh; trả kết quả bản giấy và bản điện tử cho công dân."
    ],
    category: "ho-tich"
  },
  {
    id: "02",
    title: "Đăng ký kết hôn cho công dân Việt Nam cư trú tại địa phương",
    time: "Trong ngày làm việc (ngay sau khi nhận đủ hồ sơ)",
    fee: "Miễn phí hoàn toàn",
    docs: [
      "Tờ khai đăng ký kết hôn có chữ ký và xác nhận tình trạng của cả hai bên nam, nữ (Tải mẫu)",
      "Giấy xác nhận tình trạng hôn nhân do UBND nơi cư trú trước đây cấp (nếu có)",
      "Căn cước công dân bản gốc đối chiếu trực tiếp"
    ],
    steps: [
      "Hai bên nam nữ trực tiếp có mặt, nộp hồ sơ đăng ký kết hôn tại sảnh Một cửa xã.",
      "Cán bộ hộ tịch đối chiếu thông tin cá nhân trên Cơ sở dữ liệu dân cư quốc gia.",
      "Cán bộ in Giấy chứng nhận kết hôn; hai bên nam nữ ký vào Giấy chứng nhận kết hôn và Sổ hộ tịch; lãnh đạo xã ký đóng dấu trao kết quả."
    ],
    category: "ho-tich"
  },
  {
    id: "03",
    title: "Chứng thực bản sao từ bản chính các loại giấy tờ văn bằng",
    time: "Giải quyết ngay trong ngày tiếp nhận (tối đa 2 giờ làm việc)",
    fee: "2.000 đồng / trang (từ trang thứ ba: 1.000 đồng / trang)",
    docs: [
      "Bản chính giấy tờ, văn bằng do cơ quan có thẩm quyền của Việt Nam cấp cần chứng thực",
      "Các bản photo sẵn cần chứng thực đối chiếu (hoặc photo trực tiếp tại bộ phận một cửa)"
    ],
    steps: [
      "Nộp hồ sơ trực tiếp tại sảnh Một cửa xã Dang Kang.",
      "Cán bộ Tư pháp đối chiếu bản photo với bản gốc bảo đảm trùng khớp nội dung.",
      "Lãnh đạo UBND xã ký xác nhận đóng dấu chứng thực bản sao hợp pháp."
    ],
    category: "chung-thuc"
  },
  {
    id: "04",
    title: "Xác nhận tình trạng hôn nhân (Xin giấy xác nhận độc thân)",
    time: "Tối đa 3 ngày làm việc",
    fee: "15.000 đồng / bản xác nhận",
    docs: [
      "Tờ khai yêu cầu cấp Giấy xác nhận tình trạng hôn nhân theo mẫu",
      "Bản án ly hôn bản gốc (nếu đã từng ly hôn trước đó)"
    ],
    steps: [
      "Công dân nộp hồ sơ trực tuyến qua Cổng dịch vụ công hoặc trực tiếp tại xã.",
      "Công chức kiểm tra trạng thái hôn nhân trực tiếp của công dân trên sổ đăng ký hộ tịch cấp xã qua các năm.",
      "Ký duyệt trả kết quả giấy xác nhận tình trạng hôn nhân hợp pháp."
    ],
    category: "ho-tich"
  }
]

const MOCK_PROCEDURES_EN = [
  {
    id: "01",
    title: "Mobile or Online Birth Registration (Commune level)",
    time: "Within the same working day",
    fee: "Completely Free",
    docs: [
      "Birth registration form according to standard template (Download Form)",
      "Child's certificate of birth issued by healthcare facility (or witness letter)",
      "National ID cards of father and mother proving marriage relationship"
    ],
    steps: [
      "Citizen registers online or directly submits files to commune One-Stop counter.",
      "Judicial-Civil Status civil servant accepts files, verifies validity and syncs with national DB.",
      "Commune PC Chairman signs Birth Certificate; returning hardcopy and e-document results."
    ],
    category: "ho-tich"
  },
  {
    id: "02",
    title: "Marriage Registration for Local Citizens",
    time: "Within the same working day (upon receiving full files)",
    fee: "Completely Free",
    docs: [
      "Marriage registration template signed and certified by both partners (Download Form)",
      "Singlehood status certificate issued by previous residential PC (if applicable)",
      "Original National ID Cards of both partners for face-to-face checking"
    ],
    steps: [
      "Both partners must be present directly to file the application at One-Stop office.",
      "Civil officer matches personal data on National Citizen Database.",
      "Civil officer prints Marriage Certificate; both sign the certificate and register ledger; leadership signs and stamps results."
    ],
    category: "ho-tich"
  },
  {
    id: "03",
    title: "Copy Certification from Original Diplomas & Certificates",
    time: "Handled within 2 hours of submission (Same-day completion)",
    fee: "2,000 VND / page (from the 3rd page: 1,000 VND / page)",
    docs: [
      "Original certificate, diploma issued by Vietnamese authorities requiring verification",
      "Pre-copied documents to match against originals (or copy on-site at One-Stop)"
    ],
    steps: [
      "File documents directly at the One-Stop service counter of Dang Kang commune.",
      "Judicial officer matches copy contents against original to guarantee correctness.",
      "Commune PC Leader signs and seals legal certified copies."
    ],
    category: "chung-thuc"
  },
  {
    id: "04",
    title: "Marriage Status Verification (Singlehood status check)",
    time: "Maximum of 3 working days",
    fee: "15,000 VND / copy",
    docs: [
      "Declaration form requesting singlehood status certificate under standard template",
      "Original divorce decree (if divorced previously)"
    ],
    steps: [
      "Citizen submits dossier online via Public Service Portal or directly at commune counter.",
      "Judicial officer checks marital history across historical books.",
      "Chairman signs and returns legal marital status certificate."
    ],
    category: "ho-tich"
  }
]

const TRACKING_DATA_VI = {
  "DK-2026-888": {
    status: "success",
    step: 4,
    applicant: "Nguyễn Thị Mai (Thôn 3, xã Dang Kang)",
    title: "Đăng ký khai sinh trực tuyến cho con thứ hai",
    submitDate: "05/05/2026",
    completeDate: "06/05/2026"
  },
  "DK-2026-999": {
    status: "process",
    step: 2,
    applicant: "Y-Nguên Mlô (Buôn Êga, xã Dang Kang)",
    title: "Yêu cầu cấp giấy xác nhận tình trạng hôn nhân",
    submitDate: "06/05/2026",
    completeDate: "Dự kiến 08/05/2026"
  }
}

const TRACKING_DATA_EN = {
  "DK-2026-888": {
    status: "success",
    step: 4,
    applicant: "Nguyen Thi Mai (Hamlet 3, Dang Kang)",
    title: "Online Birth Registration for second child",
    submitDate: "05/05/2026",
    completeDate: "06/05/2026"
  },
  "DK-2026-999": {
    status: "process",
    step: 2,
    applicant: "Y-Nguen Mlo (Ega Village, Dang Kang)",
    title: "Request for singlehood status certificate",
    submitDate: "06/05/2026",
    completeDate: "Expected 05/08/2026"
  }
}

export default function ProceduresPage() {
  const { language, t } = useLanguage()
  const MOCK_PROCEDURES = language === "vi" ? MOCK_PROCEDURES_VI : MOCK_PROCEDURES_EN
  const TRACKING_DATA = language === "vi" ? TRACKING_DATA_VI : TRACKING_DATA_EN

  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [activeProcedureIdx, setActiveProcedureIdx] = React.useState<string | null>("01")

  // Tracking code states
  const [trackCode, setTrackCode] = React.useState("")
  const [activeTrackCode, setActiveTrackCode] = React.useState("")
  const [trackResult, setTrackResult] = React.useState<any | null | "notfound">(null)

  // Dynamic backend queries
  const { data: dbProceduresData } = usePublicProcedures({
    search: searchQuery,
    category: activeCategory === "all" ? undefined : activeCategory
  })

  const { data: dbDossier, isFetching: trackingDossier, isError: dossierHasError } = usePublicDossier(activeTrackCode)

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = trackCode.trim().toUpperCase()
    if (code) {
      if (TRACKING_DATA[code as keyof typeof TRACKING_DATA]) {
        setTrackResult(TRACKING_DATA[code as keyof typeof TRACKING_DATA])
      } else {
        setActiveTrackCode(code)
      }
    }
  }

  // Effect to sync dynamic dossier query with trackResult
  React.useEffect(() => {
    if (activeTrackCode) {
      if (dbDossier?.data) {
        const dossier = dbDossier.data;
        setTrackResult({
          title: dossier.title || dossier.name || "Giải quyết hồ sơ liên thông",
          applicant: dossier.senderName,
          submitDate: new Date(dossier.createdAt).toLocaleDateString("vi-VN"),
          completeDate: new Date(dossier.dueDate).toLocaleDateString("vi-VN"),
          step: dossier.currentStep || 1,
          status: dossier.status
        });
      } else if (dossierHasError) {
        setTrackResult("notfound");
      }
    }
  }, [dbDossier, dossierHasError, activeTrackCode])

  const filteredProcedures = React.useMemo(() => {
    if (dbProceduresData?.data && dbProceduresData.data.length > 0) {
      return dbProceduresData.data.map((proc: any) => ({
        id: proc.id,
        title: proc.name,
        time: proc.duration,
        fee: proc.fee,
        docs: proc.requiredDocs || [],
        steps: proc.steps || [],
        category: proc.category
      }));
    }
    return MOCK_PROCEDURES.filter(proc => {
      const matchesSearch = !searchQuery.trim() || 
        proc.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "all" || proc.category === activeCategory
      return matchesSearch && matchesCategory
    });
  }, [dbProceduresData, searchQuery, activeCategory, MOCK_PROCEDURES])

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
          {language === "vi" ? "Thủ tục hành chính" : "Administrative Procedures"}
        </span>
      </div>

      {/* Tra cứu tiến độ hồ sơ một cửa widget (Highlighted Section) */}
      <section id="tra-cuu" className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-lg text-white flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center gap-3">
          <div className="bg-[#b91c1c] text-white p-2 rounded-xl">
            <FileSearch className="w-5 h-5 text-[#fef08a]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              {language === "vi" ? "TRA CỨU TIẾN ĐỘ HỒ SƠ MỘT CỬA ĐIỆN TỬ" : "ELECTRONIC ONE-STOP RECORD PROGRESS FINDER"}
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              {language === "vi" 
                ? "Nhập mã số hồ sơ (Ví dụ mẫu: " 
                : "Enter record tracking code (Example: "}
              <span className="text-[#fbc02d] underline font-mono cursor-pointer" onClick={() => setTrackCode("DK-2026-888")}>DK-2026-888</span>
              {language === "vi" ? " hoặc " : " or "}
              <span className="text-[#fbc02d] underline font-mono cursor-pointer" onClick={() => setTrackCode("DK-2026-999")}>DK-2026-999</span>
              {language === "vi" 
                ? ") để theo dõi trạng thái xử lý liên thông cấp xã" 
                : ") to track administrative processing status locally"}
            </p>
          </div>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-stretch">
          <input
            type="text"
            placeholder={language === "vi" ? "Nhập mã số biên nhận hồ sơ một cửa..." : "Enter receipt record code..."}
            value={trackCode}
            onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
            className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-950 placeholder-white/50 focus:placeholder-slate-400 text-sm pl-4 pr-4 py-3 rounded-xl border border-white/20 focus:border-white focus:outline-none transition-all shadow-inner font-mono tracking-wider"
          />
          <button 
            type="submit"
            className="bg-[#b91c1c] hover:bg-red-700 text-white font-bold tracking-wider text-xs px-6 py-3 rounded-xl transition-all uppercase shadow"
          >
            {language === "vi" ? "TRA CỨU TIẾN ĐỘ" : "TRACK PROGRESS"}
          </button>
        </form>

        {/* Dynamic Tracking Results Display */}
        {trackResult && (
          <div className="mt-2 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-xl flex flex-col gap-4 sm:gap-5 animate-fade-in">
            {trackResult === "notfound" ? (
              <div className="flex items-center gap-3 text-red-400 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>
                  {language === "vi" 
                    ? "Không tìm thấy hồ sơ tương ứng với mã vừa nhập trong cơ sở dữ liệu quốc gia. Quý công dân vui lòng kiểm tra lại mã số biên nhận in trên giấy hẹn."
                    : "No record matching this tracking code was found in the database. Please double check the receipt code on your appointment slip."}
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 border-b border-white/5 pb-4">
                  <div className="flex flex-col gap-1 font-semibold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {language === "vi" ? "Hồ sơ đăng ký" : "Submitted Record"}
                    </span>
                    <span className="text-white text-sm font-black">{trackResult.title}</span>
                  </div>
                  <div className="flex flex-col gap-1 font-semibold md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {language === "vi" ? "Người nộp hồ sơ" : "Applicant"}
                    </span>
                    <span className="text-slate-100">{trackResult.applicant}</span>
                  </div>
                  <div className="flex flex-col gap-1 font-semibold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {language === "vi" ? "Ngày tiếp nhận" : "Reception Date"}
                    </span>
                    <span className="text-slate-100 font-mono">{trackResult.submitDate}</span>
                  </div>
                  <div className="flex flex-col gap-1 font-semibold md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {language === "vi" ? "Thời hạn hoàn thành" : "Completion Deadline"}
                    </span>
                    <span className="text-[#fef08a] font-mono">{trackResult.completeDate}</span>
                  </div>
                </div>

                {/* Progress Gauge Timeline Nodes */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                    {language === "vi" ? "TIẾN TRÌNH XỬ LÝ HỒ SƠ" : "PROCESSING TIMELINE PROGRESS"}
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wide mt-2">
                    {[
                       { step: 1, label: language === "vi" ? "Đã nộp" : "Submitted" },
                       { step: 2, label: language === "vi" ? "Đã nhận" : "Received" },
                       { step: 3, label: language === "vi" ? "Đang xử lý" : "Processing" },
                       { step: 4, label: language === "vi" ? "Hoàn thành" : "Completed" }
                    ].map((node) => {
                      const isActive = trackResult.step >= node.step
                      const isCurrent = trackResult.step === node.step
                      
                      return (
                        <div key={node.step} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono transition-all border ${
                            isCurrent 
                              ? "bg-[#b91c1c] border-[#fef08a] text-white shadow-lg animate-pulse"
                              : isActive 
                                ? "bg-emerald-600 border-emerald-500 text-white" 
                                : "bg-slate-800 border-slate-700 text-slate-500"
                          }`}>
                            {node.step}
                          </div>
                          <span className={isActive ? "text-white text-[9px] sm:text-[10px]" : "text-slate-500 text-[9px] sm:text-[10px]"}>{node.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 2: Thủ tục cấp xã */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Side Category Switcher */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">
            {language === "vi" ? "LĨNH VỰC HỒ SƠ" : "RECORD FIELDS"}
          </h4>
          <div className="flex flex-col gap-1.5 font-semibold text-xs text-slate-500">
            {[
              { label: language === "vi" ? "Tất cả lĩnh vực" : "All Fields", value: "all" },
              { label: language === "vi" ? "Hộ tịch - Khai sinh" : "Vital Stats & Births", value: "ho-tich" },
              { label: language === "vi" ? "Chứng thực bản sao" : "Copy Certification", value: "chung-thuc" }
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                  activeCategory === cat.value
                    ? "bg-red-50 text-[#b91c1c] dark:bg-red-950/20 dark:text-[#fbc02d]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-950"
                }`}
              >
                <span>{cat.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                  activeCategory === cat.value ? "opacity-100 text-[#b91c1c] dark:text-[#fbc02d]" : "text-slate-400"
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Expandable Procedures list */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* Internal quick text filter */}
          <div className="relative w-full max-w-sm flex items-center mb-1">
            <input
              type="text"
              placeholder={language === "vi" ? "Gõ từ khóa tìm nhanh thủ tục..." : "Search procedures..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-3 pr-9 py-2 rounded-lg focus:outline-none focus:border-red-600 transition-all shadow-inner dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3" />
          </div>

          <div className="flex flex-col gap-4">
            {filteredProcedures.map((proc: any) => {
              const isOpen = activeProcedureIdx === proc.id
              return (
                <div 
                  key={proc.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs"
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => setActiveProcedureIdx(isOpen ? null : proc.id)}
                    className="w-full p-3.5 sm:p-4 text-left font-extrabold text-slate-900 dark:text-white hover:bg-slate-50/50 dark:hover:bg-slate-950/40 flex justify-between items-center gap-4 transition-colors text-sm"
                  >
                    <span>{proc.title}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-[#b91c1c]" : "text-slate-400"}`} />
                  </button>

                  {/* Accordion body content */}
                  {isOpen && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20 flex flex-col gap-4 sm:gap-5 leading-relaxed text-slate-700 dark:text-slate-300">
                      
                      {/* Specs Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex gap-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-sm font-semibold">
                          <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {language === "vi" ? "Thời gian giải quyết" : "Processing Time"}
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{proc.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-sm font-semibold">
                          <Coins className="w-5 h-5 text-[#fbc02d] shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {language === "vi" ? "Phí / Lệ phí" : "Processing Fees"}
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{proc.fee}</span>
                          </div>
                        </div>
                      </div>

                      {/* Required document checklists */}
                      <div className="flex flex-col gap-2 font-medium">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          {language === "vi" ? "1. Thành phần hồ sơ cần chuẩn bị" : "1. Required Document Checklist"}
                        </span>
                        <div className="flex flex-col gap-2 mt-1">
                          {proc.docs.map((doc: string, idx: number) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="font-semibold">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Processing steps */}
                      <div className="flex flex-col gap-2 font-medium border-t border-slate-100 dark:border-slate-800/60 pt-4">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          {language === "vi" ? "2. Các bước trình tự thực hiện" : "2. Standard Processing Sequence"}
                        </span>
                        <div className="flex flex-col gap-3 mt-1.5 pl-1.5 border-l-2 border-red-200 dark:border-red-900/40">
                           {proc.steps.map((step: string, idx: number) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <span className="w-5 h-5 rounded-full bg-[#b91c1c] text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-semibold">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Download link / direct application trigger */}
                      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex flex-wrap gap-3 justify-between items-center font-semibold text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" /> 
                          {language === "vi" 
                            ? "Liên hệ phòng Một cửa xã Dang Kang để được hướng dẫn trực tiếp."
                            : "Contact the commune One-Stop department directly for offline assistance."}
                        </span>
                        <button
                          onClick={() => alert(`Khởi tạo biểu mẫu trực tuyến cho: ${proc.title}`)}
                          className="bg-[#b91c1c] text-white hover:bg-red-700 px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider shadow"
                        >
                          {language === "vi" ? "NỘP HỒ SƠ TRỰC TUYẾN" : "APPLY ONLINE NOW"}
                        </button>
                      </div>

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
