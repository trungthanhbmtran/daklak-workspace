"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
      "Ba là, tăng cường công tác quản lý nhà nước về đất đai, trật tự xây dựng, bảo vệ môi trường nông thôn. Nghiêm cấm mọi hành vi lấn chiếm đất công, khai thác khoáng sản trái phép.",
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
  },
  {
    id: 101,
    title: "Đảng ủy UBND tỉnh: Siết chặt kỷ cương, điều hành linh hoạt, phấn đấu tăng trưởng hai con số",
    excerpt: "UBND tỉnh yêu cầu siết chặt kỷ luật kỷ cương hành chính, nâng cao trách nhiệm người đứng đầu, tháo gỡ khó khăn thúc đẩy tăng trưởng kinh tế bền vững.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    date: "29/04/2026",
    category: "dang-uy",
    categoryName: "Hoạt động Đảng",
    readTime: "3 phút đọc",
    author: "Ban Tuyên giáo Đảng ủy",
    content: [
      "Hội nghị triển khai công tác điều hành quản lý của Ban cán sự Đảng ủy UBND tỉnh đã chỉ rõ yêu cầu tăng cường hiệu quả quản lý, siết chặt kỷ cương hành chính trên toàn địa bàn.",
      "Đảng ủy yêu cầu nâng cao vai trò, trách nhiệm của người đứng đầu các cấp, các ngành trong việc giải quyết thủ tục hành chính, tháo gỡ triệt để các rào cản pháp lý, kiến tạo môi trường đầu tư kinh doanh thông thoáng, lành mạnh cho doanh nghiệp và người dân.",
      "Đồng thời, chú trọng công tác xây dựng chỉnh đốn Đảng, phòng chống các biểu hiện né tránh, đùn đẩy trách nhiệm, sợ sai của một bộ phận cán bộ công chức trong thực thi công vụ, quyết tâm hướng tới mục tiêu tăng trưởng kinh tế bền vững hai con số trong năm tài khóa 2026."
    ]
  },
  {
    id: 102,
    title: "HĐND xã Dang Kang chuẩn bị nội dung cho kỳ họp chuyên đề lần thứ 8 khóa XI",
    excerpt: "Thường trực HĐND xã làm việc thống nhất các tờ trình quy hoạch chi tiết xây dựng trung tâm hành chính và phân bổ ngân sách đầu tư công trung hạn.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    date: "28/04/2026",
    category: "hdnd",
    categoryName: "Hội đồng nhân dân",
    readTime: "4 phút đọc",
    author: "Thường trực HĐND",
    content: [
      "Chuẩn bị cho kỳ họp chuyên đề lần thứ 8 của Hội đồng nhân dân xã Dang Kang khóa XI nhiệm kỳ 2021 - 2026, Thường trực HĐND xã đã tổ chức phiên họp thống nhất chương trình, nội dung và thẩm tra các văn bản trình kỳ họp.",
      "Phiên họp đã thảo luận và cơ bản thống nhất với các tờ trình của UBND xã về: Quy hoạch chi tiết xây dựng trung tâm hành chính xã Dang Kang; Đề án phân bổ nguồn ngân sách đầu tư công trung hạn giai đoạn 2026 - 2030; và Tờ trình điều chỉnh kế hoạch thu - chi ngân sách địa phương năm 2026.",
      "Thường trực HĐND xã yêu cầu UBND xã và các bộ phận chuyên môn tiếp thu các ý kiến đóng góp tại phiên họp thẩm tra, hoàn thiện các tờ trình, đề án gửi các đại biểu HĐND xã nghiên cứu trước khi kỳ họp chính thức diễn ra, bảo đảm kỳ họp được tiến hành dân chủ, đúng quy định pháp luật."
    ]
  },
  {
    id: 103,
    title: "UBND xã phát động chiến dịch tổng vệ sinh môi trường, phòng ngừa dịch sốt xuất huyết",
    excerpt: "Đồng loạt 8 thôn buôn trên địa bàn xã ra quân diệt lăng quăng, phát quang bụi rậm, khơi thông cống rãnh tránh nước đọng mùa mưa lũ.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    date: "27/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "3 phút đọc",
    author: "Trạm Y tế xã Dang Kang",
    content: [
      "Trước diễn biến phức tạp của thời tiết giao mùa và chuẩn bị bước vào mùa mưa, UBND xã Dang Kang vừa phát động chiến dịch ra quân tổng vệ sinh môi trường, diệt bọ gậy, lăng quăng chủ động phòng, chống dịch bệnh Sốt xuất huyết trên địa bàn toàn xã.",
      "Chiến dịch đã nhận được sự hưởng ứng nhiệt tình của đông đảo cán bộ, công chức, viên chức, đoàn viên, hội viên các tổ chức đoàn thể xã hội và nhân dân tại 8 thôn, buôn.",
      "Tại các khu dân cư, bà con đã tích cực dọn dẹp vệ sinh trong và xung quanh nhà, phát quang các bụi rậm, lật úp các dụng cụ chứa nước không dùng đến, khai thông cống rãnh, thả cá vào bể nước ăn... nhằm triệt tiêu hoàn toàn nơi sinh sản của muỗi truyền bệnh sốt xuất huyết, bảo vệ sức khỏe cộng đồng nông thôn."
    ]
  },
  {
    id: 104,
    title: "Phổ biến tập huấn Luật Đất đai sửa đổi bổ sung năm 2026 cho cán bộ địa chính xã",
    excerpt: "Tăng cường năng lực quản lý nhà nước về đất đai, giải quyết tranh chấp đất đai tại cơ sở đúng pháp luật và hài hòa quyền lợi công dân.",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    date: "25/04/2026",
    category: "ubnd",
    categoryName: "Ủy ban nhân dân",
    readTime: "5 phút đọc",
    author: "Tư pháp - Địa chính xã",
    content: [
      "Nhằm kịp thời cập nhật những quy định mới trong công tác quản lý nhà nước về tài nguyên đất đai, UBND xã Dang Kang vừa phối hợp với Phòng Tư pháp huyện Krông Bông tổ chức hội nghị phổ biến, quán huấn sâu rộng các điểm mới nổi bật của Luật Đất đai sửa đổi bổ sung năm 2026.",
      "Đối tượng tham gia hội nghị gồm toàn thể cán bộ công chức địa chính - xây dựng, tư pháp - hộ tịch, trưởng thôn, buôn và các thành viên ban hòa giải cơ sở trên địa bàn xã.",
      "Hội nghị đã tập trung phân tích, làm rõ những đổi mới mang tính đột phá của Luật Đất đai 2026 liên quan đến: cơ chế thu hồi đất, bồi thường hỗ trợ tái định cư; phương pháp xác định giá đất theo nguyên tắc thị trường; công tác cấp giấy chứng nhận quyền sử dụng đất... giúp nâng cao hiệu quả hòa giải và hạn chế tranh chấp khiếu kiện vượt cấp."
    ]
  },
  {
    id: 105,
    title: "Ngày hội văn hóa thể thao các dân tộc thiểu số xã Dang Kang lần thứ III năm 2026",
    excerpt: "Quy tụ hơn 300 vận động viên, nghệ nhân tranh tài ở các nội dung bắn nỏ, đẩy gậy, kéo co và trình diễn nhạc cụ cồng chiêng Êđê truyền thống.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
    date: "24/04/2026",
    category: "kinh-te",
    categoryName: "Văn hóa - Xã hội",
    readTime: "6 phút đọc",
    author: "Văn hóa - Thông tin xã",
    content: [
      "Trong 2 ngày 23 and 24/4/2026, UBND xã Dang Kang đã tưng bừng tổ chức Ngày hội Văn hóa - Thể thao các dân tộc thiểu số lần thứ III năm 2026.",
      "Đây là hoạt động ý nghĩa thiết thực nhằm tôn vinh, bảo tồn và phát huy bản sắc văn hóa truyền thống tốt đẹp của các dân tộc anh em đang sinh sống hòa quyện trên mảnh đất Dang Kang anh hùng.",
      "Ngày hội thu hút hơn 300 nghệ nhân, diễn viên, vận động viên không chuyên đến từ các buôn đồng bào dân tộc thiểu số trong toàn xã, cùng giao lưu tranh tài sôi nổi ở các nội dung thi đấu thể thao dân gian truyền thống như bắn nỏ, đẩy gậy, kéo co, đi cà kheo... đặc biệt là liên hoan trình tấu cồng chiêng Êđê cổ kính và văn nghệ quần chúng."
    ]
  },
  {
    id: 106,
    title: "Mô hình nuôi heo rừng lai sinh sản hướng đi phát triển kinh tế hộ buôn Êga",
    excerpt: "Từ nguồn vốn vay ưu đãi giải quyết việc làm của Ngân hàng Chính sách Xã hội, nhiều hộ đồng bào đã thoát nghèo bền vững nhờ nuôi heo lai thương phẩm.",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80",
    date: "22/04/2026",
    category: "kinh-te",
    categoryName: "Kinh tế - Đời sống",
    readTime: "4 phút đọc",
    author: "Hội Khuyến nông xã",
    content: [
      "Nói về hiệu quả từ nguồn vốn vay ưu đãi giải quyết việc làm của Ngân hàng Chính sách Xã hội huyện, hộ gia đình ông Y-Nuôi Niê tại Buôn Êga, xã Dang Kang là một gương điển hình vươn lên thoát nghèo bền vững và làm giàu chính đáng nhờ mô hình nuôi heo rừng lai sinh sản.",
      "Năm 2024, từ nguồn vốn vay 50 triệu đồng của Ngân hàng chính sách xã hội, gia đình ông đã đầu tư xây dựng hệ thống chuồng trại bán hoang dã kiên cố rộng hơn 300m2 và mua 5 con heo rừng lai giống về nuôi thử nghiệm.",
      "Nhờ chịu khó học hỏi kỹ thuật chăm sóc, phòng trừ dịch bệnh qua các lớp chuyển giao khoa học kỹ thuật do xã tổ chức, đàn heo lai của gia đình ông sinh trưởng khỏe mạnh, sinh sản tốt. Đến nay quy mô đàn luôn duy trì trên 40 con heo thương phẩm, mang lại nguồn thu nhập ròng ổn định trên 120 triệu đồng mỗi năm."
    ]
  }
]

interface Props {
  id: string
}

export default function NewsDetailPage({ id }: Props) {
  const router = useRouter()
  const [fontSize, setFontSize] = React.useState<"sm" | "md" | "lg">("md")
  const [isCopied, setIsCopied] = React.useState(false)

  const articleId = parseInt(id) || 1
  const article = ALL_NEWS.find(n => n.id === articleId) || ALL_NEWS[0]
  if (!article) return null

  const otherNews = ALL_NEWS.filter(n => n.id !== article.id).slice(0, 3)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    alert("Đang chuẩn bị tải xuống bản in PDF chính thức của bài viết...")
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
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/tin-tuc" className="hover:text-[#b91c1c]">
          Tin tức
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
                  title={isCopied ? "Đã sao chép!" : "Chia sẻ"}
                  className={`p-2 border rounded-lg transition-colors ${isCopied
                    ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/20 dark:border-green-900"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-[#b91c1c]"
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
              {article.content.map((para, idx) => (
                <p key={idx} className="indent-4 text-justify font-medium">
                  {para}
                </p>
              ))}
            </div>

            {/* Bottom Signature / Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-bold">
                <span className="text-[#b91c1c] dark:text-[#fbc02d]">© Cổng thông tin điện tử Đảng bộ & UBND xã Dang Kang</span>
                <p className="mt-0.5 font-medium">Nguồn tin chính thống cấp cơ sở.</p>
              </div>

              <Link
                href="/tin-tuc"
                className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                QUAY LẠI DANH SÁCH
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Related News Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm flex flex-col gap-3 sm:gap-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#b91c1c] dark:text-[#fbc02d]" />
              TIN LIÊN QUAN KHÁC
            </h4>

            <div className="flex flex-col gap-4">
              {otherNews.map((post) => {
                const itemPath = `/tin-tuc/${post.id}`
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
