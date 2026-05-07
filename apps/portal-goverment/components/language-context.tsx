"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export type Language = "vi" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

// Bidirectional routing slugs mapping
export const ROUTE_MAP: Record<string, { vi: string; en: string }> = {
  "/": { vi: "/", en: "/" },
  "/gioi-thieu": { vi: "/gioi-thieu", en: "/aboutus" },
  "/aboutus": { vi: "/gioi-thieu", en: "/aboutus" },
  "/tin-tuc": { vi: "/tin-tuc", en: "/news" },
  "/news": { vi: "/tin-tuc", en: "/news" },
  "/van-ban": { vi: "/van-ban", en: "/documents" },
  "/documents": { vi: "/van-ban", en: "/documents" },
  "/thu-tuc": { vi: "/thu-tuc", en: "/procedures" },
  "/procedures": { vi: "/thu-tuc", en: "/procedures" },
  "/tuong-tac": { vi: "/tuong-tac", en: "/feedback" },
  "/feedback": { vi: "/tuong-tac", en: "/feedback" },
  "/lien-he": { vi: "/lien-he", en: "/contact" },
  "/contact": { vi: "/lien-he", en: "/contact" },
}

// Translate current pathname to target language path
export const translatePathname = (pathname: string, targetLang: Language): string => {
  if (!pathname) return "/"

  // Handle dynamic news article detail routing (e.g. /tin-tuc/123 <-> /news/123)
  if (pathname.startsWith("/tin-tuc/")) {
    const id = pathname.substring("/tin-tuc/".length)
    return targetLang === "vi" ? pathname : `/news/${id}`
  }
  if (pathname.startsWith("/news/")) {
    const id = pathname.substring("/news/".length)
    return targetLang === "vi" ? `/tin-tuc/${id}` : pathname
  }

  const mapped = ROUTE_MAP[pathname]
  if (mapped) {
    return mapped[targetLang]
  }

  return targetLang === "vi" ? "/" : "/"
}

// Extensive translation dictionary covering layout, menus, and widgets
const DICTIONARY: Record<string, Record<Language, string>> = {
  // Navigation Menu Items
  "Trang chủ": { vi: "Trang chủ", en: "Home" },
  "Giới thiệu": { vi: "Giới thiệu", en: "About Us" },
  "Tin tức": { vi: "Tin tức", en: "News" },
  "Văn bản": { vi: "Văn bản", en: "Documents" },
  "Thủ tục hành chính": { vi: "Thủ tục hành chính", en: "Procedures" },
  "Hỏi đáp & Góp ý": { vi: "Hỏi đáp & Góp ý", en: "Feedback & Q&A" },
  "Liên hệ": { vi: "Liên hệ", en: "Contact Us" },
  "Tin hoạt động": { vi: "Tin hoạt động", en: "Activity News" },
  "Lịch công tác": { vi: "Lịch công tác", en: "Work Calendar" },
  "Thông báo tuyển dụng": { vi: "Thông báo tuyển dụng", en: "Careers & Recruitments" },
  "Tìm kiếm thủ tục, tin tức...": { vi: "Tìm kiếm thủ tục, tin tức...", en: "Search procedures, news..." },

  // Header Titles
  "TRANG THÔNG TIN ĐIỆN TỬ": { vi: "TRANG THÔNG TIN ĐIỆN TỬ", en: "OFFICIAL PUBLIC PORTAL" },
  "UBND XÃ DANG KANG": { vi: "UBND XÃ DANG KANG", en: "DANG KANG COMMUNE PEOPLES COMMITTEE" },
  "TỈNH ĐĂK LĂK": { vi: "TỈNH ĐĂK LĂK", en: "DAK LAK PROVINCE" },

  // Utility bar & General
  "Thứ Tư, 06/05/2026": { vi: "Thứ Tư, 06/05/2026", en: "Wednesday, May 6, 2026" },
  "Đắk Lắk 20°-23° 🌦️": { vi: "Đắk Lắk 20°-23° 🌦️", en: "Dak Lak 20°-23° 🌦️" },
  "Tìm kiếm": { vi: "Tìm kiếm", en: "Search" },
  "Kết quả": { vi: "Kết quả", en: "Results" },
  "Chi tiết": { vi: "Chi tiết", en: "Detail" },
  "Trước": { vi: "Trước", en: "Previous" },
  "Sau": { vi: "Sau", en: "Next" },

  // Footer Content
  "Bản quyền © 2026 - UBND Xã Dang Kang, Huyện Krông Bông, Tỉnh Đắk Lắk": {
    vi: "Bản quyền © 2026 - UBND Xã Dang Kang, Huyện Krông Bông, Tỉnh Đắk Lắk",
    en: "Copyright © 2026 - Peoples Committee of Dang Kang Commune, Krong Bong District, Dak Lak Province",
  },
  "Ghi rõ nguồn khi phát hành lại thông tin từ Cổng thông tin này.": {
    vi: "Ghi rõ nguồn khi phát hành lại thông tin từ Cổng thông tin này.",
    en: "Please specify the source when republishing information from this Portal.",
  },
  "Chịu trách nhiệm nội dung:": { vi: "Chịu trách nhiệm nội dung:", en: "Chief Editor:" },
  "Ông Trần Quốc Tuấn - Chủ tịch UBND Xã": {
    vi: "Ông Trần Quốc Tuấn - Chủ tịch UBND Xã",
    en: "Mr. Tran Quoc Tuan - Chairman of Commune PC",
  },
  "Địa chỉ Trụ sở:": { vi: "Địa chỉ Trụ sở:", en: "Headquarters Address:" },
  "Thôn 2, Xã Dang Kang, Huyện Krông Bông, Tỉnh Đắk Lắk": {
    vi: "Thôn 2, Xã Dang Kang, Huyện Krông Bông, Tỉnh Đắk Lắk",
    en: "Hamlet 2, Dang Kang Commune, Krong Bong District, Dak Lak Province",
  },
  "Điện thoại công sở:": { vi: "Điện thoại công sở:", en: "Office Phone:" },
  "Thống kê truy cập": { vi: "Thống kê truy cập", en: "Visitor Statistics" },
  "Đang truy cập:": { vi: "Đang truy cập:", en: "Online Visitors:" },
  "Hôm nay:": { vi: "Hôm nay:", en: "Today Hits:" },
  "Tổng lượt truy cập:": { vi: "Tổng lượt truy cập:", en: "Total Visits:" },

  // About Page Translations
  "GIỚI THIỆU CHUNG & CƠ CẤU TỔ CHỨC": {
    vi: "GIỚI THIỆU CHUNG & CƠ CẤU TỔ CHỨC",
    en: "ABOUT US & ORGANIZATIONAL STRUCTURE",
  },
  "Tìm hiểu về lịch sử địa lý, bộ máy vận hành hành chính của xã Dang Kang, huyện Krông Bông": {
    vi: "Tìm hiểu về lịch sử địa lý, bộ máy vận hành hành chính của xã Dang Kang, huyện Krông Bông",
    en: "Explore geography, history and administrative body of Dang Kang Commune, Krong Bong District",
  },
  "Tổng quan Địa lý & Lịch sử": { vi: "Tổng quan Địa lý & Lịch sử", en: "Overview of Geography & History" },
  "Diện tích tự nhiên": { vi: "Diện tích tự nhiên", en: "Natural Land Area" },
  "Dân số hiện tại": { vi: "Dân số hiện tại", en: "Current Population" },
  "Người": { vi: "Người", en: "People" },
  "Đơn vị hành chính": { vi: "Đơn vị hành chính", en: "Administrative Units" },
  "8 Thôn, Buôn": { vi: "8 Thôn, Buôn", en: "8 Hamlets & Villages" },
  "Chuẩn nông thôn mới": { vi: "Chuẩn nông thôn mới", en: "New Rural Standards" },
  "Đạt 19/19 Tiêu chí": { vi: "Đạt 19/19 Tiêu chí", en: "Passed 19/19 Criteria" },
  "Sơ đồ Bộ máy hành chính xã Dang Kang": {
    vi: "Sơ đồ Bộ máy hành chính xã Dang Kang",
    en: "Dang Kang Commune Administrative Body Map",
  },
  "Sơ đồ vận hành liên thông, đảm bảo tính thống nhất chỉ đạo từ cấp Đảng ủy đến giám sát của HĐND xã và điều hành hành chính thực thi nhiệm vụ chuyên môn của UBND xã:": {
    vi: "Sơ đồ vận hành liên thông, đảm bảo tính thống nhất chỉ đạo từ cấp Đảng ủy đến giám sát của HĐND xã và điều hành hành chính thực thi nhiệm vụ chuyên môn của UBND xã:",
    en: "Interconnected operational system, ensuring unity of guidance from the Party Committee to Supervision of the People's Council and administration of the People's Committee:",
  },
  "ĐẢNG ỦY XÃ": { vi: "ĐẢNG ỦY XÃ", en: "COMMUNE PARTY COMMITTEE" },
  "HỘI ĐỒNG NHÂN DÂN": { vi: "HỘI ĐỒNG NHÂN DÂN", en: "PEOPLES COUNCIL" },
  "ỦY BAN NHÂN DÂN": { vi: "ỦY BAN NHÂN DÂN", en: "PEOPLES COMMITTEE" },
  "ỦY BAN MTTQ & ĐOÀN THỂ": { vi: "ỦY BAN MTTQ & ĐOÀN THỂ", en: "FATHERLAND FRONT & ASSOCIATIONS" },
  "Cơ quan lãnh đạo toàn diện mọi hoạt động chính trị, kinh tế, xã hội, an ninh quốc phòng tại địa phương.": {
    vi: "Cơ quan lãnh đạo toàn diện mọi hoạt động chính trị, kinh tế, xã hội, an ninh quốc phòng tại địa phương.",
    en: "Leading authority of all political, economic, social, security and national defense affairs locally.",
  },
  "Cơ quan quyền lực nhà nước ở địa phương, đại diện cho ý chí, nguyện vọng và quyền làm chủ của nhân dân.": {
    vi: "Cơ quan quyền lực nhà nước ở địa phương, đại diện cho ý chí, nguyện vọng và quyền làm chủ của nhân dân.",
    en: "Local state authority body, representing wills, aspirations and ownership of citizens.",
  },
  "Cơ quan chấp hành của Hội đồng nhân dân, cơ quan hành chính nhà nước ở địa phương, quản lý điều hành toàn diện.": {
    vi: "Cơ quan chấp hành của Hội đồng nhân dân, cơ quan hành chính nhà nước ở địa phương, quản lý điều hành toàn diện.",
    en: "Executive agency of the People's Council, leading general public administration operations locally.",
  },
  "Tập hợp lực lượng đại đoàn kết toàn dân tộc, phối hợp cùng chính quyền tổ chức thực hiện các phong trào thi đua.": {
    vi: "Tập hợp lực lượng đại đoàn kết toàn dân tộc, phối hợp cùng chính quyền tổ chức thực hiện các phong trào thi đua.",
    en: "Consolidating national solidarity block, coordinating with government to organize civic campaigns.",
  },
  "Thông tin Lãnh đạo chủ chốt": { vi: "Thông tin Lãnh đạo chủ chốt", en: "Key Leadership Contact Information" },
  "Danh sách cán bộ lãnh đạo phụ trách, điều hành, có lịch tiếp nhận phản ánh, kiến nghị trực tiếp từ nhân dân:": {
    vi: "Danh sách cán bộ lãnh đạo phụ trách, điều hành, có lịch tiếp nhận phản ánh, kiến nghị trực tiếp từ nhân dân:",
    en: "Directory of leading officers in charge of management and hosting face-to-face feedback channels for citizens:",
  },
  "Phòng làm việc:": { vi: "Phòng làm việc:", en: "Office Room:" },
  "Số điện thoại:": { vi: "Số điện thoại:", en: "Contact Phone:" },
  "Thư điện tử:": { vi: "Thư điện tử:", en: "Official Email:" },

  // News Page
  "Trang chủ / Tin tức": { vi: "Trang chủ / Tin tức", en: "Home / News" },
  "TIN TỨC & SỰ KIỆN NỔI BẬT": { vi: "TIN TỨC & SỰ KIỆN NỔI BẬT", en: "NEWS & HOT ANNOUNCEMENTS" },
  "Cập nhật các tin tức chính thống mới nhất về hoạt động kinh tế, xã hội và công vụ tại địa phương": {
    vi: "Cập nhật các tin tức chính thống mới nhất về hoạt động kinh tế, xã hội và công vụ tại địa phương",
    en: "Stay updated with verified news about economic, social and public service activities of Dang Kang",
  },
  "Tìm kiếm tin tức...": { vi: "Tìm kiếm tin tức...", en: "Search news..." },
  "Tất cả danh mục": { vi: "Tất cả danh mục", en: "All Categories" },
  "Đang tải bài viết...": { vi: "Đang tải bài viết...", en: "Loading news articles..." },
  "Không tìm thấy bài viết nào phù hợp.": { vi: "Không tìm thấy bài viết nào phù hợp.", en: "No news matches found." },
  "Quay lại Trang chủ": { vi: "Quay lại Trang chủ", en: "Back to Home" },

  // Document Finder Page
  "HỆ THỐNG VĂN BẢN QUY PHẠM PHÁP LUẬT": {
    vi: "HỆ THỐNG VĂN BẢN QUY PHẠM PHÁP LUẬT",
    en: "LEGAL & ADMINISTRATIVE DOCUMENTS FINDER",
  },
  "Tra cứu, khai thác hệ thống văn bản quy phạm pháp luật, chỉ đạo điều hành của Ủy ban nhân dân xã": {
    vi: "Tra cứu, khai thác hệ thống văn bản quy phạm pháp luật, chỉ đạo điều hành của Ủy ban nhân dân xã",
    en: "Search and fetch legal regulatory frameworks and directive decisions of Dang Kang Commune PC",
  },
  "Số hiệu văn bản...": { vi: "Số hiệu văn bản...", en: "Document code/number..." },
  "Cơ quan ban hành": { vi: "Cơ quan ban hành", en: "Issuing Authority" },
  "Loại văn bản": { vi: "Loại văn bản", en: "Document Type" },
  "Trạng thái hiệu lực": { vi: "Trạng thái hiệu lực", en: "Validity Status" },
  "Tìm kiếm văn bản": { vi: "Tìm kiếm văn bản", en: "Search Documents" },
  "Còn hiệu lực": { vi: "Còn hiệu lực", en: "In Effect" },
  "Hết hiệu lực": { vi: "Hết hiệu lực", en: "Expired" },
  "Xem chi tiết bản vẽ/tải về": { vi: "Xem chi tiết bản vẽ/tải về", en: "Preview details / Download" },

  // Procedure Page
  "DỊCH VỤ CÔNG & THỦ TỤC HÀNH CHÍNH": {
    vi: "DỊCH VỤ CÔNG & THỦ TỤC HÀNH CHÍNH",
    en: "PUBLIC SERVICE & CITIZEN PROCEDURES",
  },
  "Tra cứu hướng dẫn thủ tục hành chính công mức độ 3, mức độ 4 thực hiện tại Ủy ban nhân dân xã": {
    vi: "Tra cứu hướng dẫn thủ tục hành chính công mức độ 3, mức độ 4 thực hiện tại Ủy ban nhân dân xã",
    en: "Look up guidelines for Level 3 and Level 4 civic procedures provided at Commune PC",
  },
  "Tên thủ tục hành chính...": { vi: "Tên thủ tục hành chính...", en: "Procedure title..." },
  "Lĩnh vực hành chính": { vi: "Lĩnh vực hành chính", en: "Administrative Field" },
  "Tìm kiếm thủ tục": { vi: "Tìm kiếm thủ tục", en: "Search Procedures" },
  "Thời gian giải quyết:": { vi: "Thời gian giải quyết:", en: "Processing Time:" },
  "Lệ phí hồ sơ:": { vi: "Lệ phí hồ sơ:", en: "Processing Fee:" },
  "Cách thức thực hiện:": { vi: "Cách thức thực hiện:", en: "Filing Method:" },
  "Trực tuyến & Trực tiếp": { vi: "Trực tuyến & Trực tiếp", en: "Online & In-person" },
  "Nộp hồ sơ trực tuyến": { vi: "Nộp hồ sơ trực tuyến", en: "File Profile Online" },

  // Q&A / Feedback Page
  "HỎI ĐÁP CÔNG DÂN & PHẢN ÁNH KIẾN NGHỊ": {
    vi: "HỎI ĐÁP CÔNG DÂN & PHẢN ÁNH KIẾN NGHỊ",
    en: "CITIZEN FEEDBACK & Q&A FORUM",
  },
  "Hệ thống tiếp nhận phản ánh, kiến nghị và câu hỏi hỏi đáp của người dân trực tiếp tới Ban lãnh đạo xã Dang Kang": {
    vi: "Hệ thống tiếp nhận phản ánh, kiến nghị và câu hỏi hỏi đáp của người dân trực tiếp tới Ban lãnh đạo xã Dang Kang",
    en: "Online portal to submit official letters, questions and complaints directly to Dang Kang authorities",
  },
  "Gửi câu hỏi mới": { vi: "Gửi câu hỏi mới", en: "Submit New Inquiry" },
  "Tra cứu kết quả": { vi: "Tra cứu kết quả", en: "Track Status" },
  "Danh sách ý kiến đã giải quyết": { vi: "Danh sách ý kiến đã giải quyết", en: "Resolved Inquiries" },
  "Họ và tên công dân": { vi: "Họ và tên công dân", en: "Full Name" },
  "Số CMND/CCCD": { vi: "Số CMND/CCCD", en: "National ID Card" },
  "Địa chỉ cư trú": { vi: "Địa chỉ cư trú", en: "Residential Address" },
  "Tiêu đề câu hỏi": { vi: "Tiêu đề câu hỏi", en: "Inquiry Title" },
  "Nội dung phản ánh chi tiết": { vi: "Nội dung phản ánh chi tiết", en: "Detailed Content" },
  "Gửi phản ánh kiến nghị": { vi: "Gửi phản ánh kiến nghị", en: "Submit Inquiry" },

  // Contact Page
  "LIÊN HỆ & THÔNG TIN ĐỊA CHỈ TRỤ SỞ": {
    vi: "LIÊN HỆ & THÔNG TIN ĐỊA CHỈ TRỤ SỞ",
    en: "OFFICIAL HEADQUARTERS ADDRESS & CONTACTS",
  },
  "Mọi thông tin chi tiết xin liên hệ trực tiếp văn phòng một cửa hoặc qua biểu mẫu phản hồi hành chính trực tuyến": {
    vi: "Mọi thông tin chi tiết xin liên hệ trực tiếp văn phòng một cửa hoặc qua biểu mẫu phản hồi hành chính trực tuyến",
    en: "For detailed support, please contact the one-stop officer or fill in the online administration form below",
  },
  "Địa chỉ Trụ sở UBND": { vi: "Địa chỉ Trụ sở UBND", en: "Peoples Committee HQ Address" },
  "Điện thoại liên hệ công sở": { vi: "Điện thoại liên hệ công sở", en: "Official Phone Directory" },
  "Hòm thư điện tử công vụ": { vi: "Hòm thư điện tử công vụ", en: "Official Email Service" },
  "Bản đồ chỉ dẫn địa lý hành chính": { vi: "Bản đồ chỉ dẫn địa lý hành chính", en: "Geographic Navigation Map" },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Detect language state from current pathname or query string
  const [language, setLanguageState] = React.useState<Language>("vi")

  React.useEffect(() => {
    // Check path for English routing keywords
    const isEnPath =
      pathname.startsWith("/aboutus") ||
      pathname.startsWith("/news") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/procedures") ||
      pathname.startsWith("/feedback") ||
      pathname.startsWith("/contact")

    // Check search params for lang override
    const langParam = searchParams.get("lang")

    if (isEnPath || langParam === "en") {
      setLanguageState("en")
    } else {
      setLanguageState("vi")
    }
  }, [pathname, searchParams])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    const newPath = translatePathname(pathname, lang)
    if (newPath !== pathname) {
      router.push(newPath)
    }
  }

  // Look up translated text from Dictionary
  const t = (key: string): string => {
    if (!key) return ""
    const trimmed = key.trim()
    const match = DICTIONARY[trimmed]
    if (match) {
      return match[language] || trimmed
    }
    return trimmed
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
