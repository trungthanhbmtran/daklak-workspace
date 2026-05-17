import { z } from "zod";

// 1. Hero Slider
export const HeroSliderDataSchema = z.object({
  limit: z.number().min(1).max(10).default(5),
});
export type HeroSliderData = z.infer<typeof HeroSliderDataSchema>;

// 2. Public Services
export const PublicServiceItemSchema = z.object({
  title: z.string().default(""),
  desc: z.string().default(""),
  url: z.string().default(""),
  iconName: z.string().default("FileText"), // FileText, FileSearch, MessageSquare, ShieldCheck
});

export const PublicServicesDataSchema = z.object({
  items: z.array(PublicServiceItemSchema).optional(),
});
export type PublicServicesData = z.infer<typeof PublicServicesDataSchema>;

// 3. Legal Documents
export const LegalDocumentsDataSchema = z.object({
  selectedCategory: z.string().nullable().optional(),
  limit: z.number().min(1).max(20).default(5),
});
export type LegalDocumentsData = z.infer<typeof LegalDocumentsDataSchema>;

// 4. Photo & Video Gallery
export const MediaGalleryDataSchema = z.object({
  limit: z.number().min(1).max(16).default(4),
});
export type MediaGalleryData = z.infer<typeof MediaGalleryDataSchema>;

// 5. FAQ Accordion
export const FaqAccordionDataSchema = z.object({
  limit: z.number().min(1).max(15).default(5),
});
export type FaqAccordionData = z.infer<typeof FaqAccordionDataSchema>;

// 6. External Links
export const ExternalLinkItemSchema = z.object({
  title: z.string().default(""),
  url: z.string().default(""),
});

export const ExternalLinksDataSchema = z.object({
  items: z.array(ExternalLinkItemSchema).optional(),
});
export type ExternalLinksData = z.infer<typeof ExternalLinksDataSchema>;

// 7. Commune Interactive Map
export const CommuneMapDataSchema = z.object({
  defaultZoneId: z.string().default("T3"),
});
export type CommuneMapData = z.infer<typeof CommuneMapDataSchema>;

// 8. Contact Info Sidebar
export const ContactInfoDataSchema = z.object({
  address: z.string().default("Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk").optional(),
  hotline: z.string().default("0262.3683.123").optional(),
  email: z.string().default("ubnddangkang@krongbong.daklak.gov.vn").optional(),
  workingHours: z.string().default("Thứ 2 - Thứ 6 (Sáng 7:30 - 11:30 | Chiều 13:30 - 17:00)").optional(),
});
export type ContactInfoData = z.infer<typeof ContactInfoDataSchema>;
