'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, Link } from '@/i18n/routing';
import clsx from 'clsx';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from "../../../components/language-switcher";
import Image from 'next/image';

function Header() {
  const t = useTranslations('Navigation');
  const tBrand = useTranslations('Branding');
  const pathname = usePathname();

  const navLinks = [
    { key: "home", href: "/" },
    { key: "email", href: "http://mail.taichinh.daklak.gov.vn/" },
    { key: "notification", href: "/articles/notifications" },
    { key: "contact", href: "/contacts" },
    { key: "map", href: "/site-map" },
  ];

  const menuItems = navLinks.map((item) => {
    const isActive = item.href === '/'
      ? pathname === '/'
      : pathname.startsWith(item.href);

    return {
      name: t(item.key),
      href: item.href,
      active: isActive
    };
  });

  return (
    <header className="w-full shadow-lg bg-white relative font-sans">
      {/* --- PHẦN 1: BRANDING --- */}
      <div className="bg-gradient-to-b from-blue-50 to-white border-b border-blue-100">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-4 md:gap-6">

            {/* Logo */}
            <Link href="/" className="group shrink-0 relative">
              <div className="relative w-32 h-32 md:w-32 md:h-32 p-1.5 bg-white rounded-full shadow-lg border-2 border-blue-50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/logo-daklak-x7-removebg-preview.png" 
                    alt="Logo Đắk Lắk" 
                    fill
                    className="object-contain p-1"
                    priority 
                  />
                </div>
              </div>
            </Link>

            {/* Text Branding */}
            <div className="flex flex-col justify-center">
              {/* Dòng 1: UBND Tỉnh */}
              <h3 className="text-[#D82C20] font-bold text-[11px] md:text-sm uppercase tracking-[0.1em] mb-1">
                {tBrand('province')}
              </h3>

              <div className="flex flex-col">
                {/* Dòng 2: Trang thông tin điện tử Sở Tài Chính (Gộp 1 hàng) */}
                <h1 className="text-[#0047AB] font-extrabold text-lg md:text-3xl uppercase tracking-tighter leading-tight">
                  {tBrand('portal')} {tBrand('department')}
                </h1>
                
                {/* Dòng 3: Tên Tiếng Anh (Font nhỏ hơn, màu nhạt hơn) */}
                <h4 className="text-[#003366]/80 font-semibold text-[9px] md:text-[13px] uppercase tracking-wide mt-0.5 md:mt-1 border-t border-blue-100 pt-0.5">
                       Electronic Information Portal Department of Finance
                </h4>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- PHẦN 2: NAVIGATION --- */}
      <nav className="bg-[#0047AB] shadow-md border-t-2 border-[#FFD700] relative z-20">
        <div className="container mx-auto">
          {/* Desktop Menu */}
          <div className="hidden md:flex justify-between items-center">
            <ul className="flex flex-row items-center">
              {menuItems.map((item, i) => (
                <li key={i} className="relative group">
                  <Link
                    href={item.href}
                    className={clsx(
                      "block px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-300",
                      item.active
                        ? 'bg-[#003366] text-[#FFD700] border-b-4 border-[#FFD700]'
                        : 'text-white hover:bg-[#003366] hover:text-white border-b-4 border-transparent hover:border-blue-300'
                    )}
                  >
                    {item.name}
                  </Link>
                  {i < menuItems.length - 1 && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-[1px] bg-blue-400/30"></span>
                  )}
                </li>
              ))}
            </ul>

            <div className="px-4 border-l border-blue-600">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Bar */}
          <div className="flex md:hidden justify-between items-center px-4 py-3">
            <span className="text-white font-bold uppercase text-sm">Menu</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <MobileMenu menuItems={menuItems} />
            </div>
          </div>
        </div>
      </nav>
      <div className="h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent"></div>
    </header>
  );
}

export default Header;