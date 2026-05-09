"use client"

import * as React from "react"
import {
  Building2,
  MapPin,
  Users2,
  History,
  UserSquare2,
  ShieldCheck,
  Workflow,
  Phone,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  CalendarDays
} from "lucide-react"

export default function AboutPage() {
  const orgSections = [
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
  ]

  const detailLeaders = [
    {
      name: "Nguyễn Văn Hồng",
      role: "Bí thư Đảng ủy - Chủ tịch HĐND xã",
      responsibility: "Chịu trách nhiệm lãnh đạo toàn diện công tác Đảng, công tác chính trị tư tưởng; chỉ đạo toàn bộ hoạt động giám sát, ban hành nghị quyết phát triển của Hội đồng nhân dân xã.",
      phone: "0914.281.xxx",
      email: "nvhong@krongbong.daklak.gov.vn",
      room: "Phòng 201 - Tầng 2, Trụ sở UBND xã"
    },
    {
      name: "Trần Quốc Tuấn",
      role: "Phó Bí thư Đảng ủy - Chủ tịch UBND xã",
      responsibility: "Lãnh đạo, chỉ đạo toàn diện công tác quản lý điều hành hành chính nhà nước; trực tiếp chỉ đạo quy hoạch phát triển kinh tế, thu chi ngân sách, cải cách thủ tục hành chính.",
      phone: "0905.112.xxx",
      email: "tqtuan@krongbong.daklak.gov.vn",
      room: "Phòng 102 - Tầng 1, Trụ sở UBND xã"
    },
    {
      name: "H'Yen Knul",
      role: "Phó Chủ tịch UBND xã",
      responsibility: "Phụ trách khối Văn hóa - Xã hội, Y tế, Giáo dục; trực tiếp chỉ đạo thực hiện các chính sách an sinh xã hội, giảm nghèo bền vững và công tác dân tộc thiểu số địa bàn.",
      phone: "0983.475.xxx",
      email: "hyenknul@krongbong.daklak.gov.vn",
      room: "Phòng 104 - Tầng 1, Trụ sở UBND xã"
    }
  ]

  return (
    <div className="flex flex-col gap-6 sm:gap-10 md:gap-14 animate-fade-in select-none">

      {/* Page Title Header banner */}
      <div className="w-full bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-[#b91c1c] p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-sm">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-wide">
          GIỚI THIỆU CHUNG & CƠ CẤU TỔ CHỨC
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Tìm hiểu về lịch sử địa lý, bộ máy vận hành hành chính của xã Dang Kang, huyện Krông Bông
        </p>
      </div>

      {/* Section 1: Giới thiệu chung (#chung) */}
      <section id="chung" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <History className="w-5 h-5 text-[#b91c1c]" />
            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Tổng quan Địa lý & Lịch sử
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold flex flex-col gap-4">
            <p>
              Xã Dang Kang là một đơn vị hành chính cấp xã nằm ở phía Tây Bắc của huyện Krông Bông, tỉnh Đắk Lắk. Với tổng diện tích đất tự nhiên hơn 2.450 ha, xã sở hữu vị trí địa lý kết nối giao thương nông sản quan trọng của huyện:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 bg-slate-100/50 dark:bg-slate-900/40 p-3.5 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-slate-800/50 my-1 font-medium text-slate-600 dark:text-slate-400">
              <li className="flex gap-2"><MapPin className="w-4 h-4 text-[#b91c1c] shrink-0" /> Phía Đông giáp xã Hòa Lễ</li>
              <li className="flex gap-2"><MapPin className="w-4 h-4 text-[#b91c1c] shrink-0" /> Phía Tây giáp xã Cư Kty</li>
              <li className="flex gap-2"><MapPin className="w-4 h-4 text-[#b91c1c] shrink-0" /> Phía Nam giáp dãy núi Chư Yang Sin</li>
              <li className="flex gap-2"><MapPin className="w-4 h-4 text-[#b91c1c] shrink-0" /> Phía Bắc giáp sông Krông Ana</li>
            </ul>
            <p>
              Địa hình của xã chủ yếu là các thung lũng xen lẫn đồi bát úp đặc trưng của vùng Tây Nguyên, đất đai trù phú phù hợp canh tác nông sản hàng hóa giá trị cao như cà phê, sầu riêng, cao su và lúa nước 2 vụ. Dân số toàn xã đạt khoảng 6.800 người với 8 dân tộc anh em cùng sinh sống hòa hợp, tạo nên bản sắc văn hóa vùng miền phong phú, đậm đà bản sắc.
            </p>
          </div>
        </div>

        {/* Demographic statistics sidebar */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-[#b91c1c] flex items-center justify-center border border-red-100 dark:border-red-900/30">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
              Diện tích tự nhiên
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">2,452.8 Ha</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
              <Users2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
              Dân số hiện tại
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">6,842 người</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 flex items-center justify-center border border-sky-100 dark:border-sky-900/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
              Đơn vị hành chính
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              8 Thôn, Buôn
            </span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-amber-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-3 tracking-wide">
              Chuẩn nông thôn mới
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              Đạt 19/19 Tiêu chí
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Cơ cấu tổ chức (#co-cau) */}
      <section id="co-cau" className="scroll-mt-24 flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Workflow className="w-5 h-5 text-[#b91c1c]" />
          <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
            Sơ đồ Bộ máy hành chính xã Dang Kang
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-semibold leading-relaxed">
          Sơ đồ vận hành liên thông, đảm bảo tính thống nhất chỉ đạo từ cấp Đảng ủy đến giám sát của HĐND xã và điều hành hành chính thực thi nhiệm vụ chuyên môn của UBND xã:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {orgSections.map((section) => (
            <div
              key={section.title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4 group hover:border-[#b91c1c] hover:shadow-md transition-all"
            >
              <div className="flex flex-col">
                <h4 className="text-xs sm:text-sm font-black text-[#b91c1c] dark:text-[#fbc02d] tracking-wide uppercase">{section.title}</h4>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1">{section.desc}</p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex flex-col gap-2">
                {section.details.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Thông tin lãnh đạo (#lanh-dao) */}
      <section id="lanh-dao" className="scroll-mt-24 flex flex-col gap-5">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <UserSquare2 className="w-5 h-5 text-[#b91c1c]" />
          <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
            Thông tin Lãnh đạo chủ chốt
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-400 font-semibold leading-relaxed">
          Danh sách cán bộ lãnh đạo phụ trách, điều hành, có lịch tiếp nhận phản ánh, kiến nghị trực tiếp từ nhân dân:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
          {detailLeaders.map((leader) => (
            <div
              key={leader.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-850 flex items-center gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-950/45 shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#b91c1c]/10 text-[#b91c1c] dark:text-[#fbc02d] flex items-center justify-center font-bold text-lg shadow-inner">
                  {leader.name.split(' ').pop()?.[0]}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{leader.name}</h4>
                  <span className="text-[10px] text-[#b91c1c] dark:text-[#fbc02d] font-bold uppercase tracking-wider">{leader.role}</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    Phạm vi trách nhiệm
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    {leader.responsibility}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex flex-col gap-2.5 font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Nơi làm việc: {leader.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={`tel:${leader.phone}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d]">Di động: {leader.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <a href={`mailto:${leader.email}`} className="hover:text-[#b91c1c] dark:hover:text-[#fbc02d] break-all">Thư điện tử: {leader.email}</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
