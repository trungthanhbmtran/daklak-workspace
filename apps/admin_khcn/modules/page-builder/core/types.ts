/**
 * Core Type Definitions for the Headless Visual Page Builder
 * Designed for high scalability, type safety, and multi-language support.
 */

export interface Widget<TData = any> {
  id: string;
  type: string;
  title: Record<string, string>;       // Multilingual titles: { vi: "...", en: "..." }
  content?: Record<string, string>;     // Multilingual Lexical editor state JSON strings: { vi: "{}", en: "{}" }
  data?: TData;                        // Strongly-typed data payload bound to this block type
  settings?: BlockSettings;            // Style overrides specific to this block instance
}

export interface BlockSettings {
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  customClass?: string;
}

export interface Column {
  id: string;
  colSpan: string;                     // Tailwind grid span class: e.g. "lg:col-span-12", "lg:col-span-6"
  widgets: Widget[];
}

export interface SectionSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  paddingTop?: string;                 // pt-0, pt-4, pt-8, pt-12, pt-16, pt-20
  paddingBottom?: string;              // pb-0, pb-4, pb-8, pb-12, pb-16, pb-20
  textColor?: string;
  fullWidth?: boolean;
  gap?: string;                        // gap-4, gap-8, etc.
  borderRadius?: string;               // rounded-none, rounded-xl, rounded-2xl, rounded-3xl
  borderWidth?: string;
  borderColor?: string;
}

export interface Row {
  rowId: string;
  columns: Column[];
  settings?: SectionSettings;
}

export interface CustomPageMeta {
  id: string;
  title: Record<string, string>;       // { vi: "Tiêu đề", en: "Title" }
  isActive: boolean;
  seo?: PageSeo;
}

export interface PageSeo {
  metaTitle?: Record<string, string>;
  metaDescription?: Record<string, string>;
  metaKeywords?: Record<string, string>;
  ogImage?: string;
}

export interface PageLanguage {
  code: string;
  name: string;
}
