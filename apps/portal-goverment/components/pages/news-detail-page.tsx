"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePublicPostBySlug, usePublicPostById } from "@/hooks/usePublicData"
import { resolveMediaUrl } from "@/lib/utils"
import {
  Calendar,
  User,
  ArrowLeft,
  Home,
  ChevronRight,
  FileDown,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Clock,
  Eye,
  FileText
} from "lucide-react"

// Client-side cookie getter helper
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[2]) : null
}

const ALL_NEWS = [
  {
    id: 1,
    title: "Lãnh đạo huyện làm việc với UBND xã Dang Kang về phát triển KT-XH năm 2026",
    excerpt: "Sáng 29/4, UBND huyện Krông Bông phối hợp cùng các Sở ban ngành làm việc trực tiếp tại UBND xã Dang Kang về kế hoạch chuyển đổi cơ cấu cây trồng nông nghiệp công nghệ cao...",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "4 phút đọc",
    author: "Phòng Biên tập - VP UBND",
    content: [
      "Sáng ngày 29/04/2026, Đoàn công tác UBND huyện Krông Bông do đồng chí Chủ tịch UBND huyện dẫn đầu đã có buổi làm việc trực tiếp với Đảng ủy, HĐND, UBND xã Dang Kang về tình hình phát triển Kinh tế - Xã hội, Quốc phòng - An ninh 4 tháng đầu năm và triển khai phương hướng, nhiệm vụ trọng tâm quý II năm 2026.",
      "Tham dự buổi làm việc có đại diện lãnh đạo các phòng, ban chuyên môn của huyện gồm: Phòng Tài chính - Kế hoạch, Phòng Nông nghiệp và Phát triển nông thôn, Phòng Tài nguyên và Môi trường, Kinh tế - Hạ tầng, và đại diện Văn phòng HĐND-UBND huyện.",
      "Báo cáo tại buổi làm việc, Chủ tịch UBND xã Dang Kang cho biết, trong 4 tháng đầu năm 2026, tình hình kinh tế - xã hội trên địa bàn xã duy trì đà tăng trưởng ổn định. Tổng diện tích gieo trồng cây vụ đông xuân đạt 100% kế hoạch đề ra. Công tác quản lý đất đai, tài nguyên khoáng sản được siết chặt; thu ngân sách trên địa bàn đạt 38% dự toán năm; các chính sách an sinh xã hội, chăm sóc sức khỏe nhân dân, giáo dục đào tạo được triển khai kịp thời, đúng đối tượng.",
      "Tuy nhiên, xã vẫn còn đối mặt với một số khó khăn như: tiến độ giải ngân vốn đầu tư công còn chậm so với yêu cầu; việc chuyển đổi cơ cấu cây trồng nông nghiệp chưa đồng đều giữa các thôn buôn; quản lý rác thải sinh hoạt nông thôn vẫn còn nhiều vướng mắc.",
      "Phát biểu kết luận buổi làm việc, đồng chí Chủ tịch UBND huyện ghi nhận và biểu dương những kết quả mà xã Dang Kang đạt được trong thời gian qua. Đồng thời, đồng chí nhấn mạnh một số nhiệm vụ trọng tâm xã cần tập trung triển khai ngay trong quý II và các tháng tiếp theo:",
      "Một là, tập trung tháo gỡ vướng mắc để đẩy nhanh tiến độ giải phóng mặt bằng, thi công và giải ngân vốn đầu tư công, đặc biệt là các dự án thuộc Chương trình mục tiêu quốc gia xây dựng Nông thôn mới.",
      "Hai là, đẩy mạnh chuyển đổi cơ cấu cây trồng, vật nuôi theo hướng sản xuất hàng hóa ứng dụng công nghệ cao. Khuyến khích hình thành các hợp tác xã liên kết tiêu thụ sản phẩm nông sản chủ lực như cà phê, sầu riêng, heo lai.",
      "Ba là, tăng cường công tác quản lý nhà nước về đất đai, trựt tự xây dựng, bảo vệ môi trường nông thôn. Nghiêm cấm mọi hành vi lấn chiếm đất công, khai thác khoáng sản trái phép.",
      "Bốn là, đẩy mạnh công tác cải cách hành chính, chuyển đổi số cấp xã, nâng cao tỷ lệ giải quyết hồ sơ dịch vụ công trực tuyến và mức độ hài lòng của người dân.",
      "Đoàn công tác của huyện ghi nhận các kiến nghị của xã về phân bổ thêm nguồn kinh phí duy tu đường giao thông nông thôn và sẽ giao các phòng chuyên môn tham mưu giải quyết trong thời gian sớm nhất."
    ]
  },
  {
    id: 2,
    title: "Khởi công mở rộng đường liên thôn 3 và thôn 4 nông thôn mới kiểu mẫu",
    excerpt: "Dự án có tổng mức đầu tư hơn 5 tỷ đồng trích từ nguồn ngân sách xã xã hội hóa và người dân tự nguyện hiến đất mở rộng hành lang lộ giới lên 8m...",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "5 phút đọc",
    author: "BQL Xây dựng Nông thôn mới",
    content: [
      "Hòa chung không khí thi đua xây dựng nông thôn mới kiểu mẫu trên địa bàn toàn tỉnh, sáng ngày 28/4/2026, UBND xã Dang Kang đã tổ chức lễ khởi công nâng cấp và mở rộng tuyến đường trục chính liên thôn kết nối Thôn 3 và Thôn 4.",
      "Tới dự lễ khởi công có các đồng chí lãnh đạo Đảng ủy, HĐND, UBND, Ủy ban MTTQ Việt Nam xã Dang Kang cùng đông đảo bà con nhân dân hai thôn 3 và 4.",
      "Tuyến đường liên thôn 3 - thôn 4 là trục giao thông huyết mạch phục vụ việc đi lại, vận chuyển nông sản của gần 500 hộ dân. Hiện trạng đường cũ chật hẹp (chỉ rộng khoảng 3,5m), mặt đường đất đá xuống cấp nghiêm trọng, gây mất an toàn giao thông và cản trở việc phát triển giao thương.",
      "Theo thiết kế phê duyệt, tuyến đường mới có chiều dài 2,2 km, nền đường rộng 8m, mặt đường nhựa bê tông rộng 6m, hệ thống mương thoát nước dọc hai bên được bê tông hóa kiên cố. Tổng mức đầu tư dự án là hơn 5 tỷ đồng, trong đó ngân sách tỉnh và huyện hỗ trợ 60%, ngân sách xã 20%, phần còn lại do xã hội hóa và nhân dân đóng góp tự nguyện.",
      "Điểm sáng nổi bật của dự án là tinh thần đồng thuận, chung tay hiến đất mở đường của người dân. Qua công tác tuyên truyền, vận động 'Dân biết, dân bàn, dân làm, dân kiểm tra, dân thụ hưởng', đã có 42 hộ dân dọc hai bên tuyến tự nguyện hiến hơn 1.800 m2 đất vườn, phá dỡ hơn 400m tường rào kiên cố để bàn giao mặt bằng sạch cho đơn vị thi công mà không đòi hỏi đền bù.",
      "Phát biểu phát lệnh khởi công, Chủ tịch UBND xã bày tỏ lòng biết ơn sâu sắc đối với sự đồng lòng, hi sinh lợi ích riêng vì việc chung của bà con nhân dân. Đồng chí đề nghị đơn vị thi công tập trung nhân lực, máy móc, tổ chức thi công đảm bảo tiến độ, chất lượng kỹ thuật mỹ thuật cao nhất, phấn đấu hoàn thành đưa công trình vào sử dụng trước mùa mưa lũ năm nay.",
      "Đồng thời, thành lập Ban giám sát cộng đồng gồm đại diện người dân hai thôn để thường xuyên theo dõi, kiểm tra chất lượng vật liệu và quá trình thi công, đảm bảo tính công khai, minh bạch của công trình."
    ]
  },
  {
    id: 3,
    title: "Tập huấn chuyển đổi số và ứng dụng CNTT cho bà con nông dân trồng cà phê",
    excerpt: "Hơn 120 hộ dân tiêu biểu của xã đã tham gia lớp tập huấn sử dụng ứng dụng truy xuất nguồn gốc nông sản và theo dõi diễn biến giá cả thị trường...",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    date: "26/04/2026",
    category: "kinh-te",
    categoryName: "Kinh tế - Xã hội",
    readTime: "3 phút đọc",
    author: "Hội Nông dân xã Dang Kang",
    content: [
      "Nhằm hỗ trợ hội viên nông dân tiếp cận công nghệ mới, nâng cao năng suất và giá trị kinh tế cho sản phẩm nông nghiệp chủ lực, ngày 26/4/2026, Hội Nông dân xã Dang Kang phối hợp cùng Trung tâm Khuyến nông tỉnh tổ chức lớp tập huấn 'Chuyển đổi số nông nghiệp và ứng dụng công nghệ thông tin trong sản xuất cà phê bền vững'.",
      "Lớp tập huấn thu hút hơn 120 nông dân là chủ các trang trại, gia trại, tổ hợp tác sản xuất cà phê trên địa bàn toàn xã tham dự.",
      "Tại buổi tập huấn, các kỹ sư nông nghiệp và chuyên gia công nghệ đã trực tiếp hướng dẫn bà con nông dân cài đặt, sử dụng các ứng dụng di động thông minh để phục vụ sản xuất. Trọng tâm tập huấn bao gồm ba chuyên đề lớn:",
      "Một là, sử dụng ứng dụng di động để theo dõi diễn biến thời tiết, sâu bệnh dịch hại thời gian thực; tính toán lượng phân bón và nước tưới khoa học theo từng giai đoạn sinh trưởng của cây cà phê, giúp tiết kiệm 20-30% chi phí đầu vào.",
      "Hai là, tiếp cận hệ thống truy xuất nguồn gốc nông sản thông qua quét mã QR. Qua đó giúp nông hộ ghi chép nhật ký sản xuất điện tử, minh bạch hóa quy trình chăm bón, đáp ứng tiêu chuẩn khắt khe để xuất khẩu chính ngạch sang thị trường châu Âu (EUDR).",
      "Ba là, kết nối các sàn giao dịch thương mại điện tử nông sản và tham gia nhóm cộng đồng cập nhật giá cà phê nhân, giá nông sản thế giới hàng giờ, tránh tình trạng bị thương lái ép giá.",
      "Chủ tịch Hội Nông dân xã cho biết: 'Việc đưa chuyển đổi số vào vườn cà phê không còn là chuyện xa vời mà đã trở thành yêu cầu sống còn. Hội sẽ tiếp tục đồng hành, thành lập nhóm Zalo hỗ trợ kỹ thuật tại từng thôn buôn để kịp thời giải đáp khó khăn cho bà con trong quá trình ứng dụng công nghệ vào thực tế sản xuất'."
    ]
  }
]

const ALL_NEWS_EN = [
  {
    id: 1,
    title: "District Leaders Work with Dang Kang Commune on Socio-Economic Development in 2026",
    excerpt: "On the morning of April 29, Krông Bông District People's Committee coordinated with departments to work directly with Dang Kang Commune on agricultural crop restructuring...",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "ubnd",
    categoryName: "People's Committee",
    readTime: "4 min read",
    author: "Editorial Department - People's Committee Office",
    content: [
      "On the morning of April 29, 2026, the working delegation of the Krông Bông District People's Committee, led by the District President, held a direct working session with the Party Committee, People's Council, and People's Committee of Dang Kang Commune on socio-economic development, defense, and security during the first 4 months, and outlined key directions and tasks for the second quarter of 2026.",
      "Attending the session were representatives from district specialized divisions: Finance & Planning, Agriculture & Rural Development, Natural Resources & Environment, Economy & Infrastructure, and the Office of the District People's Council & People's Committee.",
      "Reporting at the session, the President of Dang Kang Commune stated that in the first 4 months of 2026, the local socio-economic situation maintained stable growth. The total cultivation area of winter-spring crops reached 100% of the plan. Land and mineral resources management were tightened; local revenue reached 38% of the annual estimate; social welfare, healthcare, and education policies were implemented on time to the correct recipients.",
      "However, the commune still faces challenges such as: public investment disbursement progress remaining slow; crop restructuring in agriculture is uneven among villages; and rural waste management has some difficulties.",
      "Concluding the working session, the President of Krông Bông District praised the results achieved by Dang Kang Commune. At the same time, he emphasized key tasks for the commune to focus on immediately in the second quarter and subsequent months:",
      "First, resolve obstacles to speed up land acquisition, construction, and public investment disbursement, particularly projects belonging to the National Target Program on Building New Rural Areas.",
      "Second, promote restructuring of crops and livestock towards commodity production applying high technology. Encourage the formation of cooperatives linking and consuming main agricultural products such as coffee, durian, and crossbred pigs.",
      "Third, strengthen state management on land, construction order, and rural environment protection. Strictly prohibit any acts of public land encroachment or illegal mineral exploitation.",
      "Fourth, accelerate administrative reform and digital transformation, improve the resolution rate of online public services and satisfaction of residents.",
      "The district delegation noted the commune's proposals regarding additional funding for local road maintenance and will assign specialized divisions to advise on solutions as soon as possible."
    ]
  },
  {
    id: 2,
    title: "Groundbreaking of Expansion of Inter-village Road 3 and 4 for Model New Rural Area",
    excerpt: "The project has a total investment of over 5 billion VND from the commune budget, socialization, and voluntary contribution of residents to widen the road to 8m...",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "ubnd",
    categoryName: "People's Committee",
    readTime: "5 min read",
    author: "New Rural Development Board",
    content: [
      "In harmony with the atmosphere of emulation to build model new rural areas across the province, on the morning of April 28, 2026, the Dang Kang Commune People's Committee held a groundbreaking ceremony for the upgrading and expansion of the main inter-commune road connecting Village 3 and Village 4.",
      "Attending the ceremony were leaders of the Party Committee, People's Council, People's Committee, and Fatherland Front Committee of Dang Kang Commune, together with a large number of residents from both villages.",
      "The inter-village road connecting Villages 3 and 4 is a vital traffic axis serving the movement and agricultural transport of nearly 500 households. The current old road is narrow (only about 3.5m wide), and the dirt and stone road surface has severely deteriorated, posing traffic safety hazards and hindering trade development.",
      "According to the approved design, the new road has a length of 2.2 km, a roadbed width of 8m, a concrete asphalt surface width of 6m, and solid concrete drainage systems on both sides. The total project investment is over 5 billion VND, of which provincial and district budgets support 60%, the commune budget 20%, and the remainder is from socialization and voluntary contributions by residents.",
      "The highlight of the project is the consensus and active contribution of residents in donating land. Through propagation and mobilization 'People know, people discuss, people do, people inspect, people enjoy', 42 households along both sides voluntarily donated over 1,800 m2 of garden land and dismantled over 400m of concrete fences to hand over clean ground to the construction unit without demanding compensation.",
      "Speaking at the groundbreaking, the President of the Commune expressed deep gratitude for the solidarity and sacrifice of individual benefits for the common cause of the residents. He requested the construction unit to mobilize personnel and machinery to organize construction ensuring the highest progress and quality, striving to complete and put the project into use before the rainy season of this year.",
      "At the same time, a community supervision board consisting of residents' representatives from the two villages was established to regularly monitor and inspect material quality and construction process, ensuring openness and transparency of the project."
    ]
  },
  {
    id: 3,
    title: "Digital Transformation and IT Training for Coffee Farmers",
    excerpt: "More than 120 outstanding households of the commune participated in the training course on using agricultural origin tracking and market price tracking applications...",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    date: "26/04/2026",
    category: "kinh-te",
    categoryName: "Socio-Economy",
    readTime: "3 min read",
    author: "Dang Kang Commune Farmers Association",
    content: [
      "In order to support member farmers in accessing new technologies, improving productivity, and economic value for main agricultural products, on April 26, 2026, the Farmers Association of Dang Kang Commune coordinated with the Provincial Agricultural Extension Center to organize a training course 'Digital Transformation in Agriculture and IT Application in Sustainable Coffee Production'.",
      "The training course attracted more than 120 farmers who are owners of farms, family farms, and agricultural production cooperatives in the commune.",
      "At the session, agricultural engineers and technology experts directly instructed farmers on how to install and use smart mobile applications for production. The focus of the training included three major topics:",
      "First, using mobile applications to track real-time weather and pests; calculate scientific fertilizer and irrigation water amounts for each stage of coffee growth, helping save 20-30% of input costs.",
      "Second, accessing the agricultural origin tracking system through scanning QR codes. This helps farming households record electronic production logs, make farming processes transparent, and meet strict standards for official export to the European market (EUDR).",
      "Third, connecting agricultural e-commerce exchanges and participating in community groups to update coffee bean prices and global agricultural prices hourly, avoiding being forced down by traders.",
      "The Chairman of the Commune Farmers Association stated: 'Bringing digital transformation to coffee gardens is no longer a remote story but has become a matter of survival. The Association will continue to accompany farmers, establishing Zalo technical support groups in each village to promptly resolve difficulties in the process of applying technology to actual production'."
    ]
  }
]

const translations = {
  vi: {
    home: "Trang chủ",
    news: "Tin tức",
    relatedNews: "TIN LIÊN QUAN KHÁC",
    source: "© Cổng thông tin điện tử Đảng bộ & UBND xã Dang Kang",
    sourceDesc: "Nguồn tin chính thức cấp cơ sở.",
    backToList: "QUAY LẠI DANH SÁCH",
    preparingPdf: "Đang chuẩn bị tải xuống bản in PDF chính thức của bài viết...",
    copied: "Đã sao chép!"
  },
  en: {
    home: "Home",
    news: "News",
    relatedNews: "OTHER RELATED NEWS",
    source: "© Official Web Portal of Dang Kang Party & People's Committee",
    sourceDesc: "Official grassroots level news source.",
    backToList: "BACK TO LIST",
    preparingPdf: "Preparing official PDF print version of the article...",
    copied: "Copied!"
  }
}

interface Props {
  id: string
}

export default function NewsDetailPage({ id }: Props) {
  const [fontSize, setFontSize] = React.useState<"sm" | "md" | "lg">("md")
  const [isCopied, setIsCopied] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentLang = React.useMemo(() => {
    if (!mounted) return "vi"
    const cookieLang = getCookie("lang")
    if (cookieLang === "vi" || cookieLang === "en") return cookieLang
    return "vi"
  }, [mounted])

  const t = translations[currentLang] || translations.vi
  const newsList = currentLang === "en" ? ALL_NEWS_EN : ALL_NEWS

  const isNumericId = /^\d+$/.test(id);
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
  const isDatabaseId = isNumericId || isUuid;

  const slugQuery = usePublicPostBySlug(isDatabaseId ? "" : id);
  const idQuery = usePublicPostById(isDatabaseId ? id : "");

  const dbPostRaw = slugQuery.data || idQuery.data;
  const dbPost = dbPostRaw?.data || dbPostRaw;

  const articleId = parseInt(id) || 1;
  let article = newsList.find((n: any) => n.id === articleId || n.slug === id) || newsList[0];

  if (dbPost) {
    let title = dbPost.title;
    let content = dbPost.contentHtml || "";
    let excerpt = dbPost.description || "";

    let translationsObj = dbPost.translations || {};
    if (typeof translationsObj === "string") {
      try {
        translationsObj = JSON.parse(translationsObj);
      } catch (e) {
        translationsObj = {};
      }
    }

    if (currentLang === "en" && translationsObj.en) {
      title = translationsObj.en.title || title;
      content = translationsObj.en.contentHtml || "";
      excerpt = translationsObj.en.description || excerpt;
    }

    const postDate = dbPost.publishedAt || dbPost.createdAt;
    const formattedDate = postDate ? new Date(postDate).toLocaleDateString("vi-VN") : "12/05/2026";

    article = {
      id: dbPost.id,
      title: title || "",
      excerpt: excerpt || "",
      image: resolveMediaUrl(dbPost.thumbnail) || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
      date: formattedDate,
      category: "ubnd",
      categoryName: currentLang === "en" ? "People's Committee" : "Ủy ban nhân dân",
      readTime: currentLang === "en" ? "4 min read" : "4 phút đọc",
      author: "Phòng Biên tập - VP UBND",
      content: content || ""
    };
  }

  if (!article) return null

  const otherNews = newsList.filter((n: any) => n.id !== articleId && n.slug !== id).slice(0, 3)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    alert(t.preparingPdf)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-sm leading-relaxed"
      case "lg": return "text-lg md:text-xl leading-relaxed"
      case "md":
      default:
        return "text-base leading-relaxed"
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 animate-fade-in select-none max-w-7xl mx-auto px-4 md:px-0">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Link href="/" className="hover:text-[#b91c1c] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          {t.home}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={currentLang === "en" ? "/news" : "/tin-tuc"} className="hover:text-[#b91c1c]">
          {t.news}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] md:max-w-md">
          {article.title}
        </span>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* Left Column: Article Body */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">

          {/* Cover image */}
          <div className="h-56 sm:h-72 md:h-96 relative overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
              <span className="self-start mb-3 bg-[#b91c1c] dark:bg-[#fbc02d] dark:text-slate-950 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md">
                {article.categoryName}
              </span>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-wide">
                {article.title}
              </h1>
            </div>
          </div>

          {/* Article Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-bold">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-slate-400" />
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {article.readTime}
              </span>
            </div>

            {/* Accessibility Controls & Action Tools */}
            <div className="flex items-center gap-3">

              {/* FontSize adjustment group */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setFontSize("sm")}
                  title="Thu nhỏ chữ"
                  className={`p-1.5 rounded transition-colors ${fontSize === "sm" ? "bg-red-50 text-[#b91c1c] dark:bg-red-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSize("md")}
                  title="Cỡ chữ mặc định"
                  className={`p-1.5 rounded transition-colors ${fontSize === "md" ? "bg-red-50 text-[#b91c1c] dark:bg-red-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  title="Phóng to chữ"
                  className={`p-1.5 rounded transition-colors ${fontSize === "lg" ? "bg-red-50 text-[#b91c1c] dark:bg-red-950/40" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrint}
                  title="In bài viết"
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-[#b91c1c] rounded-lg transition-colors text-slate-400"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDownloadPDF}
                  title="Tải xuống PDF"
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-[#b91c1c] rounded-lg transition-colors text-slate-400"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleShare}
                  title={isCopied ? t.copied : "Share"}
                  className={`p-2 border rounded-lg transition-colors ${isCopied
                    ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/20 dark:border-green-900"
                    : "bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-slate-400 hover:text-[#b91c1c]"
                    }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Article Main Content Body */}
          <div className="px-4 sm:px-6 md:px-8 py-5 sm:py-8">
            <div className={`prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 ${getFontSizeClass()} flex flex-col gap-5`}>
              {typeof article.content === "string" ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} className="w-full text-justify leading-relaxed" />
              ) : (
                article.content.map((para, idx) => (
                  <p key={idx} className="indent-4 text-justify font-medium leading-relaxed">
                    {para}
                  </p>
                ))
              )}
            </div>

            {/* Bottom Signature / Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-bold">
                <span className="text-[#b91c1c] dark:text-[#fbc02d]">{t.source}</span>
                <p className="mt-0.5 font-medium">{t.sourceDesc}</p>
              </div>

              <Link
                href={currentLang === "en" ? "/news" : "/tin-tuc"}
                className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.backToList}
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Related News Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#b91c1c] dark:text-[#fbc02d]" />
              {t.relatedNews}
            </h4>

            <div className="flex flex-col gap-4">
              {otherNews.map((post) => {
                const itemPath = currentLang === "en" ? `/news/${post.id}` : `/tin-tuc/${post.id}`
                return (
                  <Link
                    key={post.id}
                    href={itemPath}
                    className="flex gap-3 group items-start border-b border-slate-50 dark:border-slate-950/40 pb-3 last:border-0 last:pb-0"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-16 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase text-[#b91c1c] dark:text-[#fbc02d] tracking-wider">
                        {post.categoryName}
                      </span>
                      <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-[#b91c1c] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h5>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        {post.date}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
