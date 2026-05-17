import { z } from "zod";

// 1. Hero Slider
export const HeroSliderDataSchema = z.object({
  limit: z.number().min(1).max(10).default(5),
});
export type HeroSliderData = z.infer<typeof HeroSliderDataSchema>;

// 2. Public Services
export const PublicServicesDataSchema = z.object({});
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
export const ExternalLinksDataSchema = z.object({});
export type ExternalLinksData = z.infer<typeof ExternalLinksDataSchema>;

// 7. Commune Interactive Map
export const CommuneMapDataSchema = z.object({
  defaultZoneId: z.string().default("T3"),
});
export type CommuneMapData = z.infer<typeof CommuneMapDataSchema>;

// 8. Contact Info Sidebar
export const ContactInfoDataSchema = z.object({});
export type ContactInfoData = z.infer<typeof ContactInfoDataSchema>;
