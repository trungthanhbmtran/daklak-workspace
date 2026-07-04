/**
 * Dữ liệu mặc định cho PortalConfigClient.
 * Tách ra khỏi component chính để giảm bundle parse time.
 */

export const DEFAULT_ORG_SECTIONS_VI = [
  {
    title: "ĐẢNG ỦY XÃ",
    desc: "Cơ quan lãnh đạo toàn diện mọi hoạt động chính trị, kinh tế, xã hội, an ninh quốc phòng tại địa phương.",
    details: ["Bí thư Đảng ủy xã", "Phó Bí thư Thường trực Đảng ủy", "Ủy viên Ban Thường vụ Đảng ủy", "Các Chi bộ trực thuộc thôn, buôn, trường học"]
  },
  {
    title: "HỘI ĐỒNG NHÂN DÂN",
    desc: "Cơ quan quyền lực nhà nước ở địa phương, đại diện cho ý chí, nguyện vọng và quyền làm chủ của nhân dân.",
    details: ["Chủ tịch Hội đồng nhân dân", "Phó Chủ tịch HĐND xã", "Ban Pháp chế HĐND", "Ban Kinh tế - Xã hội HĐND"]
  },
  {
    title: "ỦY BAN NHÂN DÂN",
    desc: "Cơ quan chấp hành của Hội đồng nhân dân, cơ quan hành chính nhà nước ở địa phương, quản lý điều hành toàn diện.",
    details: ["Chủ tịch Ủy ban nhân dân", "Các Phó Chủ tịch UBND xã", "Bộ phận Tiếp nhận & Trả kết quả (Một cửa)", "Công chức Chuyên môn nghiệp vụ"]
  },
  {
    title: "ỦY BAN MTTQ & ĐOÀN THỂ",
    desc: "Tập hợp lực lượng đại đoàn kết toàn dân tộc, phối hợp cùng chính quyền tổ chức thực hiện các phong trào thi đua.",
    details: ["Ủy ban Mặt trận Tổ quốc xã", "Hội Liên hiệp Phụ nữ xã", "Đoàn Thanh niên Cộng sản Hồ Chí Minh", "Hội Nông dân & Hội Cựu chiến binh"]
  }
];

export const DEFAULT_ORG_SECTIONS_EN = [
  {
    title: "COMMUNE PARTY COMMITTEE",
    desc: "The comprehensive leadership body for all political, economic, social, national security, and defense activities in the locality.",
    details: ["Party Committee Secretary", "Permanent Deputy Secretary", "Standing Committee Members", "Affiliated Party cells in villages and schools"]
  },
  {
    title: "PEOPLE'S COUNCIL",
    desc: "The local state power body representing the will, aspirations, and mastery rights of the citizens.",
    details: ["Chairman of People's Council", "Vice Chairman of People's Council", "Legal Affairs Committee", "Economic and Social Affairs Committee"]
  },
  {
    title: "PEOPLE'S COMMITTEE",
    desc: "The executive branch of the People's Council, acting as the local administrative state organ to manage comprehensive operations.",
    details: ["Chairman of People's Committee", "Vice Chairmen of People's Committee", "One-stop Reception & Result Return Department", "Specialized Professional Officials"]
  },
  {
    title: "FATHERLAND FRONT & ASSOCIATIONS",
    desc: "Rallying the great national unity block, collaborating with authorities to organize emulation movements.",
    details: ["Commune Fatherland Front Committee", "Women's Union", "Youth Union", "Farmers' Association & Veterans' Association"]
  }
];

export const DEFAULT_LEADERS_VI = [
  {
    name: "Nguyễn Văn Hồng",
    role: "Bí thư Đảng ủy - Chủ tịch HĐND xã",
    responsibility: "Chịu trách nhiệm lãnh đạo toàn diện công tác Đảng, công tác chính trị tư tưởng; chỉ đạo toàn bộ hoạt động giám sát, ban hành nghị quyết phát triển của Hội đồng nhân dân xã.",
    phone: "0914.281.xxx", email: "nvhong@krongbong.daklak.gov.vn", room: "Phòng 201 - Tầng 2, Trụ sở UBND xã"
  },
  {
    name: "Trần Quốc Tuấn",
    role: "Phó Bí thư Đảng ủy - Chủ tịch UBND xã",
    responsibility: "Lãnh đạo, chỉ đạo toàn diện công tác quản lý điều hành hành chính nhà nước; trực tiếp chỉ đạo quy hoạch phát triển kinh tế, thu chi ngân sách, cải cách thủ tục hành chính.",
    phone: "0905.112.xxx", email: "tqtuan@krongbong.daklak.gov.vn", room: "Phòng 102 - Tầng 1, Trụ sở UBND xã"
  },
  {
    name: "H'Yen Knul",
    role: "Phó Chủ tịch UBND xã",
    responsibility: "Phụ trách khối Văn hóa - Xã hội, Y tế, Giáo dục; trực tiếp chỉ đạo thực hiện các chính sách an sinh xã hội, giảm nghèo bền vững và công tác dân tộc thiểu số địa bàn.",
    phone: "0983.475.xxx", email: "hyenknul@krongbong.daklak.gov.vn", room: "Phòng 104 - Tầng 1, Trụ sở UBND xã"
  }
];

export const DEFAULT_LEADERS_EN = [
  {
    name: "Nguyen Van Hong",
    role: "Party Secretary - Chairman of People's Council",
    responsibility: "Responsible for the comprehensive leadership of Party affairs and political-ideological education; directs all inspection activities and issues development resolutions for the People's Council.",
    phone: "0914.281.xxx", email: "nvhong@krongbong.daklak.gov.vn", room: "Room 201 - 2nd Floor, Commune HQ"
  },
  {
    name: "Tran Quoc Tuan",
    role: "Deputy Party Secretary - Chairman of People's Committee",
    responsibility: "Leads and comprehensively directs the administrative management of local government; directly oversees economic development planning, budget revenues/expenditures, and administrative procedural reform.",
    phone: "0905.112.xxx", email: "tqtuan@krongbong.daklak.gov.vn", room: "Room 102 - 1st Floor, Commune HQ"
  },
  {
    name: "H'Yen Knul",
    role: "Vice Chairwoman of People's Committee",
    responsibility: "In charge of Culture - Social affairs, Healthcare, and Education; directly oversees social security policies, sustainable poverty reduction, and ethnic minority affairs in the area.",
    phone: "0983.475.xxx", email: "hyenknul@krongbong.daklak.gov.vn", room: "Room 104 - 1st Floor, Commune HQ"
  }
];

export const DEFAULT_COMMUNE_ZONES_VI = [
  { id: "T1", name: "Thôn 1 (Khu vực phía Tây Bắc)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 người", center: { x: 25, y: 22 } },
  { id: "T2", name: "Thôn 2 (Khu vực sông Krông Ana)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 người", center: { x: 62, y: 26 } },
  { id: "T3", name: "Thôn 3 (Khu vực Trung tâm Hành chính)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 người", center: { x: 23, y: 50 } },
  { id: "T4", name: "Thôn 4 (Khu quy hoạch cà phê)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 người", center: { x: 55, y: 54 } },
  { id: "T5", name: "Thôn 5 (Khu vực lâm nghiệp)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 người", center: { x: 19, y: 78 } },
  { id: "T6", name: "Thôn 6 (Khu vực Đền thờ - Núi Chư Yang Sin)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 người", center: { x: 50, y: 80 } },
  { id: "BE", name: "Buôn Êga (Đồng bào Êđê sinh sống)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 người", center: { x: 86, y: 32 } },
  { id: "BM", name: "Buôn Êđê (Khu bảo tồn văn hóa truyền thống)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 người", center: { x: 78, y: 72 } }
];

export const DEFAULT_COMMUNE_ZONES_EN = [
  { id: "T1", name: "Village 1 (Northwest area)", path: "M 10,10 L 45,10 L 40,40 L 10,35 Z", area: "125 ha", pop: "780 people", center: { x: 25, y: 22 } },
  { id: "T2", name: "Village 2 (Krong Ana river area)", path: "M 45,10 L 85,15 L 75,45 L 40,40 Z", area: "240 ha", pop: "1,120 people", center: { x: 62, y: 26 } },
  { id: "T3", name: "Village 3 (Administrative Center area)", path: "M 10,35 L 40,40 L 35,65 L 8,60 Z", area: "95 ha", pop: "950 people", center: { x: 23, y: 50 } },
  { id: "T4", name: "Village 4 (Coffee planning zone)", path: "M 40,40 L 75,45 L 70,70 L 35,65 Z", area: "180 ha", pop: "840 people", center: { x: 55, y: 54 } },
  { id: "T5", name: "Village 5 (Forestry zone)", path: "M 8,60 L 35,65 L 30,95 L 5,90 Z", area: "320 ha", pop: "650 people", center: { x: 19, y: 78 } },
  { id: "T6", name: "Village 6 (Temple - Chu Yang Sin mountain area)", path: "M 35,65 L 70,70 L 65,95 L 30,95 Z", area: "450 ha", pop: "1,030 people", center: { x: 50, y: 80 } },
  { id: "BE", name: "Buon Ega (Ede ethnic community)", path: "M 75,15 L 98,18 L 92,55 L 75,45 Z", area: "580 ha", pop: "920 people", center: { x: 86, y: 32 } },
  { id: "BM", name: "Buon Ede (Traditional cultural preservation zone)", path: "M 75,45 L 92,55 L 85,95 L 65,95 L 70,70 Z", area: "462 ha", pop: "572 people", center: { x: 78, y: 72 } }
];

/** Fallback default translation fields */
export const EMPTY_TRANSLATION = {
  unitName: "", unitTitle: "", unitIdentifier: "", responsiblePerson: "",
  citizenSchedule: "", licenseInfo: "", address: "", contactFormTitle: "",
  contactFormSuccessDesc: "", contactMapTitle: "", footerPortalTitle: "",
  footerPortalSubtitle: "", hotline: "", fax: "", email: "",
  aboutHistory: "", aboutArea: "", aboutPopulation: "", aboutSubdivisions: "",
  aboutStandard: "",
};

export const portalConfigDefaults: Record<string, { name: string, multiLang: boolean, vi: string, en: string }> = {
  unit_name: { name: "Tên Đơn vị / Tổ chức", multiLang: true, vi: "UBND XÃ DANG KANG", en: "DANG KANG COMMUNE PEOPLE'S COMMITTEE" },
  unit_title: { name: "Tiêu đề trang (Header)", multiLang: true, vi: "TRANG THÔNG TIN ĐIỆN TỬ", en: "ELECTRONIC INFORMATION PORTAL" },
  unit_identifier: { name: "Định danh địa phương", multiLang: true, vi: "HUYỆN KRÔNG BÔNG - TỈNH ĐẮK LẮK", en: "KRONG BONG DISTRICT - DAK LAK PROVINCE" },
  unit_logo: { name: "Logo đơn vị", multiLang: false, vi: "", en: "" },
  citizen_schedule: { name: "Lịch tiếp công dân", multiLang: true, vi: "Thứ 5 hàng tuần • 08:00 - 11:30", en: "Every Thursday • 08:00 - 11:30" },
  license_info: { name: "Giấy phép bản quyền", multiLang: true, vi: "Giấy phép số: 45/GP-TTĐT do Sở Thông tin và Truyền thông tỉnh Đắk Lắk cấp", en: "License No: 45/GP-TTĐT issued by Dak Lak Department of Information and Communications" },
  responsible_person: { name: "Người chịu trách nhiệm", multiLang: true, vi: "Ông Trần Văn Minh - Chủ tịch UBND xã Dang Kang", en: "Mr. Tran Van Minh - Chairman of Dang Kang Commune People's Committee" },
  address: { name: "Địa chỉ trụ sở", multiLang: true, vi: "Địa chỉ: Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk", en: "Address: Village 6, Dang Kang Commune, Krong Bong District, Dak Lak Province" },
  hotline: { name: "Đường dây nóng", multiLang: false, vi: "0262.3812.345", en: "0262.3812.345" },
  fax: { name: "Số Fax", multiLang: false, vi: "0262.3812.346", en: "0262.3812.346" },
  email: { name: "Email công vụ", multiLang: false, vi: "xadangkang@krongbong.daklak.gov.vn", en: "xadangkang@krongbong.daklak.gov.vn" },
  contact_form_title: { name: "Tiêu đề Form liên hệ", multiLang: true, vi: "GỬI PHẢN ÁNH / GÓP Ý ĐẾN VĂN PHÒNG", en: "SEND FEEDBACK TO THE OFFICE" },
  contact_form_success_desc: { name: "Lời cảm ơn khi gửi form", multiLang: true, vi: "Bộ phận văn thư xã Dang Kang đã nhận được thư góp ý của bạn và sẽ phản hồi sớm nhất có thể.", en: "We have received your feedback and will respond as soon as possible." },
  contact_map_title: { name: "Tiêu đề bản đồ", multiLang: true, vi: "BẢN ĐỒ PHÂN VÙNG HÀNH CHÍNH XÃ DANG KANG", en: "ADMINISTRATIVE ZONING MAP OF DANG KANG COMMUNE" },
  footer_portal_title: { name: "Tiêu đề Widget DVC", multiLang: true, vi: "CỔNG DỊCH VỤ CÔNG TRỰC TUYẾN XÃ DANG KANG", en: "ONLINE PUBLIC SERVICE PORTAL" },
  footer_portal_subtitle: { name: "Mô tả Widget DVC", multiLang: true, vi: "Tiếp nhận giải quyết thủ tục hành chính một cửa hiện đại, nhanh chóng", en: "Modern and fast one-stop administrative procedures" },
  custom_map_iframe: { name: "Iframe Bản đồ tuỳ chỉnh", multiLang: false, vi: "", en: "" }
};
