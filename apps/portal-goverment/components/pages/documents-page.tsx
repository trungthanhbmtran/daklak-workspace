"use client"

import * as React from "react"
import Link from "next/link"
import { useLanguage } from "@/components/language-context"
import {
  FileText,
  Search,
  Download,
  Calendar,
  Tag,
  Building2,
  ChevronRight,
  Home,
  X,
  Eye,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react"

const MOCK_DOCUMENTS_VI = [
  {
    id: "01",
    code: "04-NQ/ĐU",
    title: "Nghị quyết của Đảng ủy xã Dang Kang về tăng cường chỉ đạo xây dựng nông thôn mới kiểu mẫu năm 2026",
    signer: "Nguyễn Văn Hồng",
    signDate: "28/04/2026",
    type: "nghi-quyet",
    typeName: "Nghị quyết",
    org: "dang-uy",
    orgName: "Đảng ủy xã",
    sector: "kinh-te",
    sectorName: "Kinh tế - Đầu tư",
    summary: "Nghị quyết đề ra mục tiêu dốc toàn lực hệ thống chính trị và vận động nhân dân hoàn thành các hạng mục tiêu chí nâng cao, bê tông hóa liên thôn, chuyển giao trồng trọt sầu riêng xuất khẩu trong quý III năm 2026."
  },
  {
    id: "02",
    code: "12/QĐ-UBND",
    title: "Quyết định phê duyệt kế hoạch đấu thầu mua sắm trang thiết bị bộ phận Một cửa hiện đại UBND xã",
    signer: "Trần Quốc Tuấn",
    signDate: "22/04/2026",
    type: "quyet-dinh",
    typeName: "Quyết định",
    org: "ubnd",
    orgName: "Ủy ban nhân dân",
    sector: "noi-vu",
    sectorName: "Nội vụ - Hành chính",
    summary: "Quyết định phê duyệt nguồn vốn 450 triệu đồng trích từ ngân sách thường xuyên để lắp đặt máy lấy số tự động, màn hình cảm ứng tra cứu thủ tục, camera giám sát phục vụ người dân tại sảnh một cửa xã."
  },
  {
    id: "03",
    code: "18-NQ/HĐND",
    title: "Nghị quyết phê chuẩn phân bổ quyết toán ngân sách thu chi địa phương năm tài khóa 2025",
    signer: "Nguyễn Văn Hồng",
    signDate: "15/04/2026",
    type: "nghi-quyet",
    typeName: "Nghị quyết",
    org: "hdnd",
    orgName: "Hội đồng nhân dân",
    sector: "tai-chinh",
    sectorName: "Tài chính - Ngân sách",
    summary: "Nghị quyết thông qua kết quả báo cáo thẩm tra số liệu tổng quyết toán thu ngân sách nội địa vượt 12.4% chỉ tiêu giao, phê duyệt chuyển nguồn kết dư sang mục tiêu đầu tư cơ sở hạ tầng thôn buôn khó khăn."
  },
  {
    id: "04",
    code: "45/TB-UBND",
    title: "Thông báo về việc treo cờ Tổ quốc và nghỉ lễ kỷ niệm Ngày Giải phóng miền Nam 30/4 và Quốc tế Lao động 1/5",
    signer: "Trần Quốc Tuấn",
    signDate: "20/04/2026",
    type: "thong-bao",
    typeName: "Thông báo",
    org: "ubnd",
    orgName: "Ủy ban nhân dân",
    sector: "noi-vu",
    sectorName: "Nội vụ - Hành chính",
    summary: "Thông báo hướng dẫn toàn thể cán bộ công chức, hộ dân treo cờ tổ quốc từ ngày 29/4 đến hết ngày 2/5/2026. Bố trí lịch trực chỉ huy an ninh sẵn sàng chiến đấu cấp xã trong thời gian nghỉ lễ."
  },
  {
    id: "05",
    code: "02/KH-UBND",
    title: "Kế hoạch mở chiến dịch ra quân phun hóa chất diệt muỗi, phòng ngừa bệnh Sốt xuất huyết diện rộng",
    signer: "H'Yen Knul",
    signDate: "18/04/2026",
    type: "ke-hoach",
    typeName: "Kế hoạch",
    org: "ubnd",
    orgName: "Ủy ban nhân dân",
    sector: "y-te",
    sectorName: "Y tế - Giáo dục",
    summary: "Kế hoạch chi tiết phối hợp cùng Trung tâm Y tế huyện tổ chức phun sương hóa chất dập dịch tại Thôn 2, Thôn 6 và Buôn Êga; cấp phát miễn phí thuốc diệt lăng quăng cho hộ gia đình."
  }
]

const MOCK_DOCUMENTS_EN = [
  {
    id: "01",
    code: "04-NQ/ĐU",
    title: "Resolution of Dang Kang Commune Party Committee on strengthening direction to build model rural areas in 2026",
    signer: "Nguyen Van Hong",
    signDate: "28/04/2026",
    type: "nghi-quyet",
    typeName: "Resolution",
    org: "dang-uy",
    orgName: "Commune Party",
    sector: "kinh-te",
    sectorName: "Economics & Investment",
    summary: "Resolution outlining goals to fully mobilize the local political system and citizens to complete advanced infrastructure categories, inter-village road concrete works, and transition agricultural exports by Q3 2026."
  },
  {
    id: "02",
    code: "12/QĐ-UBND",
    title: "Decision approving procurement bidding plans for modern One-Stop desk equipments of Commune PC",
    signer: "Tran Quoc Tuan",
    signDate: "22/04/2026",
    type: "quyet-dinh",
    typeName: "Decision",
    org: "ubnd",
    orgName: "People's Committee",
    sector: "noi-vu",
    sectorName: "Internal Affairs & Admin",
    summary: "Decision authorizing 450 million VND from recurrent operational budgets to install electronic queuing machines, touch-screen procedure terminals, and monitoring cameras to serve citizens."
  },
  {
    id: "03",
    code: "18-NQ/HĐND",
    title: "Resolution approving local budget settlement allocation for fiscal year 2025",
    signer: "Nguyen Van Hong",
    signDate: "15/04/2026",
    type: "nghi-quyet",
    typeName: "Resolution",
    org: "hdnd",
    orgName: "People's Council",
    sector: "tai-chinh",
    sectorName: "Finance & Budget",
    summary: "Resolution endorsing audit results where domestic budget revenues surpassed target benchmarks by 12.4%, and authorizing surplus funds transfer into infrastructural investments for rural hamlets."
  },
  {
    id: "04",
    code: "45/TB-UBND",
    title: "Notice on national flag raising and public holidays for Victory Day April 30 and International Workers' Day May 1",
    signer: "Tran Quoc Tuan",
    signDate: "20/04/2026",
    type: "thong-bao",
    typeName: "Notice",
    org: "ubnd",
    orgName: "People's Committee",
    sector: "noi-vu",
    sectorName: "Internal Affairs & Admin",
    summary: "Notice directing civil servants and local citizens to raise the national flag from April 29 to May 2, 2026, and scheduling safety standby security forces throughout the public holidays."
  },
  {
    id: "05",
    code: "02/KH-UBND",
    title: "Action plan initiating massive chemical spraying campaign to prevent local Dengue Fever outbreaks",
    signer: "H'Yen Knul",
    signDate: "18/04/2026",
    type: "ke-hoach",
    typeName: "Plan",
    org: "ubnd",
    orgName: "People's Committee",
    sector: "y-te",
    sectorName: "Health & Education",
    summary: "Detailed action plan cooperating with the District Health Center to spray sanitizing chemical vapors across Hamlet 2, Hamlet 6, and Ega Village, and distribute free anti-larval kits to households."
  }
]

export default function DocumentsPage() {
  const { language, t } = useLanguage()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeType, setActiveType] = React.useState("all")
  const [activeOrg, setActiveOrg] = React.useState("all")

  const MOCK_DOCUMENTS = language === "vi" ? MOCK_DOCUMENTS_VI : MOCK_DOCUMENTS_EN

  const TYPE_FILTERS = [
    { label: language === "vi" ? "Tất cả loại" : "All Types", value: "all" },
    { label: language === "vi" ? "Quyết định" : "Decision", value: "quyet-dinh" },
    { label: language === "vi" ? "Nghị quyết" : "Resolution", value: "nghi-quyet" },
    { label: language === "vi" ? "Thông báo" : "Notice", value: "thong-bao" },
    { label: language === "vi" ? "Kế hoạch" : "Plan", value: "ke-hoach" }
  ]

  const ORG_FILTERS = [
    { label: language === "vi" ? "Tất cả cơ quan" : "All Bodies", value: "all" },
    { label: language === "vi" ? "Đảng ủy" : "Party Board", value: "dang-uy" },
    { label: language === "vi" ? "HĐND" : "Commune Council", value: "hdnd" },
    { label: language === "vi" ? "UBND" : "People's Committee", value: "ubnd" }
  ]

  const [selectedDoc, setSelectedDoc] = React.useState<typeof MOCK_DOCUMENTS_VI[0] | null>(null)

  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    const matchesSearch = !searchQuery.trim() ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeType === "all" || doc.type === activeType
    const matchesOrg = activeOrg === "all" || doc.org === activeOrg
    return matchesSearch && matchesType && matchesOrg
  })

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in select-none">

      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-[#b91c1c] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {t("Trang chủ")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300">
          {language === "vi" ? "Văn bản pháp quy" : "Legal Documents"}
        </span>
      </div>

      {/* Main header banner with search inputs */}
      <div className="flex flex-col gap-4 sm:gap-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
              {language === "vi" ? "CƠ SỞ DỮ LIỆU VĂN BẢN ĐỊA PHƯƠNG" : "LOCAL LEGAL DOCUMENT DATABASE"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {language === "vi"
                ? "Tìm kiếm, tra cứu các Nghị quyết, Quyết định chỉ đạo điều hành của xã Dang Kang"
                : "Search and inspect official Resolutions, Decisions and directives of Dang Kang Commune"}
            </p>
          </div>

          {/* Real-time search form */}
          <div className="relative w-full lg:max-w-md flex items-center">
            <input
              type="text"
              placeholder={language === "vi" ? "Nhập số hiệu văn bản hoặc từ khóa..." : "Type document number or keyword..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 focus:text-slate-900 text-sm pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-red-600 transition-all shadow-inner dark:bg-slate-950 dark:border-slate-800 dark:text-white"
            />
            <button className="absolute right-1.5 p-2 rounded-lg text-slate-400">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">

          {/* Type filters */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              {language === "vi" ? "Loại văn bản" : "Document Type"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveType(t.value)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${activeType === t.value
                      ? "bg-[#b91c1c] text-white shadow"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-950 dark:border dark:border-slate-800 dark:text-slate-400"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Org filters */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              {language === "vi" ? "Cơ quan ban hành" : "Issuing Authority"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ORG_FILTERS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setActiveOrg(o.value)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${activeOrg === o.value
                      ? "bg-[#b91c1c] text-white shadow"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-950 dark:border dark:border-slate-800 dark:text-slate-400"
                    }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3 sm:py-4 sm:px-4 md:px-5 w-28">{language === "vi" ? "Số hiệu" : "Doc No."}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-4 w-32">{language === "vi" ? "Ngày ban hành" : "Date Issued"}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-4">{language === "vi" ? "Trích yếu nội dung văn bản" : "Document Title & Summary"}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-4 w-36">{language === "vi" ? "Cơ quan ban hành" : "Issuing Body"}</th>
                <th className="py-3 px-3 sm:py-4 sm:px-4 md:px-5 text-right w-24">{language === "vi" ? "Tác vụ" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 sm:py-3.5 sm:px-4 md:px-5 font-bold text-slate-900 dark:text-white whitespace-nowrap">{doc.code}</td>
                    <td className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-slate-400 whitespace-nowrap font-mono">{doc.signDate}</td>
                    <td className="py-2.5 px-3 sm:py-3.5 sm:px-4">
                      <span
                        onClick={() => setSelectedDoc(doc)}
                        className="text-slate-800 dark:text-slate-200 font-bold hover:text-[#b91c1c] cursor-pointer line-clamp-2 leading-relaxed"
                      >
                        {doc.title}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:py-3.5 sm:px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-950 rounded-md text-[10px] font-bold text-slate-500">
                        {doc.orgName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:py-3.5 sm:px-4 md:px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 hover:text-[#b91c1c] transition-all text-slate-500"
                          title={language === "vi" ? "Xem chi tiết" : "View details"}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            alert(language === "vi" ? `Bắt đầu tải tệp đính kèm văn bản: ${doc.code}` : `Starting download for document attachment: ${doc.code}`)
                          }}
                          className="p-1.5 rounded-lg bg-[#b91c1c]/5 hover:bg-[#b91c1c]/15 border border-[#b91c1c]/10 text-[#b91c1c] dark:text-[#fbc02d] transition-all"
                          title={language === "vi" ? "Tải văn bản đính kèm" : "Download attachment"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold bg-white dark:bg-slate-900">
                    {language === "vi"
                      ? "Không tìm thấy văn bản pháp quy nào phù hợp bộ lọc."
                      : "No legal documents found matching the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Details Drawer/Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[85vh] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/45">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#b91c1c]" />
                <span className="text-xs font-black text-[#b91c1c] uppercase tracking-wider">
                  {language === "vi" ? "CHI TIẾT VĂN BẢN PHÁP QUY" : "LEGAL DOCUMENT SPECIFICATIONS"}
                </span>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 dark:bg-slate-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex flex-col gap-4 sm:gap-5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-3.5 sm:pb-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  {language === "vi" ? "Tên văn bản / Trích yếu" : "Document Title / Abstract"}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-normal tracking-wide">{selectedDoc.title}</h4>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Tag className="w-3 h-3 text-red-500" /> {language === "vi" ? "Số ký hiệu" : "Document Code"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{selectedDoc.code}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-500" /> {language === "vi" ? "Ngày ban hành" : "Date of Issue"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">{selectedDoc.signDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-500" /> {language === "vi" ? "Cơ quan ban hành" : "Issuing Body"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{selectedDoc.orgName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-500" /> {language === "vi" ? "Người ký duyệt" : "Authorized Signer"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{selectedDoc.signer}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3.5 sm:pt-4">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                  {language === "vi" ? "Tóm tắt nội dung văn bản" : "Content Summary"}
                </span>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400 font-semibold">{selectedDoc.summary}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 mt-1 font-semibold text-[11px]">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-8 h-8 text-red-500" />
                  <div className="flex flex-col">
                    <span>Van_ban_so_${selectedDoc.id}.pdf</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {language === "vi" ? "Kích thước: 1.45 MB - Định dạng: PDF" : "Size: 1.45 MB - Format: PDF"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => alert(language === "vi" ? `Bắt đầu tải xuống tệp: Van_ban_so_${selectedDoc.id}.pdf` : `Starting download for file: Van_ban_so_${selectedDoc.id}.pdf`)}
                  className="bg-[#b91c1c] text-white hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-1 transition-colors font-bold uppercase text-[10px] tracking-wider shadow"
                >
                  <Download className="w-3.5 h-3.5" /> {language === "vi" ? "Tải về" : "Download"}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end bg-slate-50/50 dark:bg-slate-950/45">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-bold transition-all text-slate-700 dark:text-slate-300"
              >
                {language === "vi" ? "ĐÓNG CỬA SỔ" : "CLOSE WINDOW"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
