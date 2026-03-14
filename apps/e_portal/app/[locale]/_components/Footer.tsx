'use client';
import { FacebookIcon, MapPin, Phone, Mail, UserCheck } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-default-200 text-foreground py-12 lg:py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-10 lg:gap-16">

          <div className="md:w-2/5 flex flex-col gap-3">
            <h3 className="text-lg font-bold uppercase tracking-wide mb-2 text-primary">
              Sở Tài chính tỉnh Đắk Lắk
            </h3>
            
            <div className="flex flex-col gap-2 text-sm text-default-600">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 shrink-0" />
                <span>32A Lê Thị Hồng Gấm, Phường Tân An, Tỉnh Đắk Lắk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>0262.856630 – 0262.852178</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <span>taichinh@daklak.gov.vn</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-default-200">
              <div className="flex items-start gap-2 text-sm">
                <UserCheck size={16} className="mt-1 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Chịu trách nhiệm nội dung chính:</p>
                  <p className="text-default-600">Ông Nguyễn Tấn Thành - Phó Giám đốc Sở</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/5 flex flex-col gap-2">
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="flex flex-col gap-3 text-sm text-default-600">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-primary transition-colors">Giới thiệu</Link>
              </li>
              <li>
                <Link href="/thong-bao" className="hover:text-primary transition-colors">Thông báo</Link>
              </li>
              <li>
                <Link href="/thu-tuc-hanh-chinh" className="hover:text-primary transition-colors">Thủ tục hành chính</Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-primary transition-colors">Liên hệ</Link>
              </li>
            </ul>
          </div>

          <div className="md:w-1/5 flex flex-col gap-2">
            <h3 className="text-lg font-bold mb-4">Mạng xã hội</h3>
            <div className="flex gap-3">
              <Link 
                href="#" 
                className="p-2 rounded-full bg-default-100 hover:bg-primary hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookIcon size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-default-200 mt-10 pt-6 text-center">
          <p className="text-xs text-default-500">
            © {new Date().getFullYear()} Cổng thông tin điện tử. Thiết kế và phát triển bởi Sở KH&CN Đắk Lắk.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;