"use client"

import * as React from "react"
import Link from "next/link"
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

export default function ProceduresPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [activeProcedureIdx, setActiveProcedureIdx] = React.useState<string | null>(null)

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
      setActiveTrackCode(code)
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
    return [];
  }, [dbProceduresData])

  React.useEffect(() => {
    if (filteredProcedures.length > 0 && !activeProcedureIdx) {
      setActiveProcedureIdx(filteredProcedures[0].id)
    }
  }, [filteredProcedures, activeProcedureIdx])


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
          Thủ tục hành chính
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
              TRA CỨU TIẾN ĐỘ HỒ SƠ MỘT CỬA ĐIỆN TỬ
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Nhập mã số biên nhận in trên giấy hẹn để theo dõi trạng thái xử lý liên thông cấp xã
            </p>
          </div>
        </div>

        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-stretch">
          <input
            type="text"
            placeholder="Nhập mã số biên nhận hồ sơ một cửa..."
            value={trackCode}
            onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
            className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-950 placeholder-white/50 focus:placeholder-slate-400 text-sm pl-4 pr-4 py-3 rounded-xl border border-white/20 focus:border-white focus:outline-none transition-all shadow-inner font-mono tracking-wider"
          />
          <button
            type="submit"
            className="bg-[#b91c1c] hover:bg-red-700 text-white font-bold tracking-wider text-xs px-6 py-3 rounded-xl transition-all uppercase shadow"
          >
            TRA CỨU TIẾN ĐỘ
          </button>
        </form>

        {/* Dynamic Tracking Results Display */}
        {trackResult && (
          <div className="mt-2 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-xl flex flex-col gap-4 sm:gap-5 animate-fade-in">
            {trackResult === "notfound" ? (
              <div className="flex items-center gap-3 text-red-400 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>
                  Không tìm thấy hồ sơ tương ứng với mã vừa nhập trong cơ sở dữ liệu quốc gia. Quý công dân vui lòng kiểm tra lại mã số biên nhận in trên giấy hẹn.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-5 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 border-b border-white/5 pb-4">
                  <div className="flex flex-col gap-1 font-semibold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      Hồ sơ đăng ký
                    </span>
                    <span className="text-white text-sm font-black">{trackResult.title}</span>
                  </div>
                  <div className="flex flex-col gap-1 font-semibold md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      Người nộp hồ sơ
                    </span>
                    <span className="text-slate-100">{trackResult.applicant}</span>
                  </div>
                  <div className="flex flex-col gap-1 font-semibold">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      Ngày tiếp nhận
                    </span>
                    <span className="text-slate-100 font-mono">{trackResult.submitDate}</span>
                  </div>
                  <div className="flex flex-col gap-1 font-semibold md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                      Thời hạn hoàn thành
                    </span>
                    <span className="text-[#fef08a] font-mono">{trackResult.completeDate}</span>
                  </div>
                </div>

                {/* Progress Gauge Timeline Nodes */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                    TIẾN TRÌNH XỬ LÝ HỒ SƠ
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wide mt-2">
                    {[
                      { step: 1, label: "Đã nộp" },
                      { step: 2, label: "Đã nhận" },
                      { step: 3, label: "Đang xử lý" },
                      { step: 4, label: "Hoàn thành" }
                    ].map((node) => {
                      const isActive = trackResult.step >= node.step
                      const isCurrent = trackResult.step === node.step

                      return (
                        <div key={node.step} className="flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono transition-all border ${isCurrent
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
            LĨNH VỰC HỒ SƠ
          </h4>
          <div className="flex flex-col gap-1.5 font-semibold text-xs text-slate-500">
            {[
              { label: "Tất cả lĩnh vực", value: "all" },
              { label: "Hộ tịch - Khai sinh", value: "ho-tich" },
              { label: "Chứng thực bản sao", value: "chung-thuc" }
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group ${activeCategory === cat.value
                  ? "bg-red-50 text-[#b91c1c] dark:bg-red-950/20 dark:text-[#fbc02d]"
                  : "hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-400 hover:text-slate-950"
                  }`}
              >
                <span>{cat.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${activeCategory === cat.value ? "opacity-100 text-[#b91c1c] dark:text-[#fbc02d]" : "text-slate-400"
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
              placeholder="Gõ từ khóa tìm nhanh thủ tục..."
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
                              Thời gian giải quyết
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{proc.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-sm font-semibold">
                          <Coins className="w-5 h-5 text-[#fbc02d] shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              Phí / Lệ phí
                            </span>
                            <span className="text-slate-900 dark:text-slate-100 font-bold">{proc.fee}</span>
                          </div>
                        </div>
                      </div>

                      {/* Required document checklists */}
                      <div className="flex flex-col gap-2 font-medium">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          1. Thành phần hồ sơ cần chuẩn bị
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
                          2. Các bước trình tự thực hiện
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
                          Liên hệ phòng Một cửa xã Dang Kang để được hướng dẫn trực tiếp.
                        </span>
                        <button
                          onClick={() => alert(`Khởi tạo biểu mẫu trực tuyến cho: ${proc.title}`)}
                          className="bg-[#b91c1c] text-white hover:bg-red-700 px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider shadow"
                        >
                          NỘP HỒ SƠ TRỰC TUYẾN
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
