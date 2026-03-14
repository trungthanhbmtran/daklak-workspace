import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
 locales: ['vi', 'en'], // Các ngôn ngữ hỗ trợ
  defaultLocale: 'vi',   // Ngôn ngữ mặc định
  localePrefix: 'always' // Khuyên dùng 'always' để URL luôn rõ ràng cho SEO
});
 
// Tạo các wrapper navigation để sử dụng trong components
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);