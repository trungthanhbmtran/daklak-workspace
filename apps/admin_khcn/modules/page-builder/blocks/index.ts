import { BlockRegistry } from "../core/registry";
import {
  AlignLeft,
  Newspaper,
  BarChart3,
  Users,
  Network,
  Sliders,
  FileText,
  FolderOpen,
  Images,
  HelpCircle,
  Link2,
  Map,
  Phone
} from "lucide-react";

// 1. Rich Text Block
import { RichTextDataSchema } from "./rich-text/rich-text.schema";
import { RichTextRender } from "./rich-text/rich-text.render";
import { RichTextEditor } from "./rich-text/rich-text.editor";

// 2. Featured News Block
import { NewsListDataSchema } from "./news-list/news-list.schema";
import { NewsListRender } from "./news-list/news-list.render";
import { NewsListEditor } from "./news-list/news-list.editor";

// 3. Stats Grid Block
import { StatsGridDataSchema } from "./stats-grid/stats-grid.schema";
import { StatsGridRender } from "./stats-grid/stats-grid.render";
import { StatsGridEditor } from "./stats-grid/stats-grid.editor";

// 4. Leadership Block
import { LeadershipDataSchema } from "./leadership/leadership.schema";
import { LeadershipRender } from "./leadership/leadership.render";
import { LeadershipEditor } from "./leadership/leadership.editor";

// 5. Org Directory Block
import { DirectoryDataSchema } from "./directory/directory.schema";
import { DirectoryRender } from "./directory/directory.render";
import { DirectoryEditor } from "./directory/directory.editor";

// 6. Custom Widgets
import {
  HeroSliderDataSchema,
  PublicServicesDataSchema,
  LegalDocumentsDataSchema,
  MediaGalleryDataSchema,
  FaqAccordionDataSchema,
  ExternalLinksDataSchema,
  CommuneMapDataSchema,
  ContactInfoDataSchema
} from "./custom-widgets/custom-widgets.schema";

import {
  HeroSliderRender,
  PublicServicesRender,
  LegalDocumentsRender,
  MediaGalleryRender,
  FaqAccordionRender,
  ExternalLinksRender,
  CommuneInteractiveMapRender,
  ContactInfoSidebarRender
} from "./custom-widgets/custom-widgets.render";

import {
  HeroSliderEditor,
  PublicServicesEditor,
  LegalDocumentsEditor,
  MediaGalleryEditor,
  FaqAccordionEditor,
  ExternalLinksEditor,
  CommuneInteractiveMapEditor,
  ContactInfoSidebarEditor
} from "./custom-widgets/custom-widgets.editor";

/**
 * Initializes and registers all Visual Editor CMS Block Modules.
 * This establishes the modular dynamic registration flow.
 */
export function initializeBlockRegistry(): void {
  // 1. Rich Text
  BlockRegistry.registerBlock({
    type: "LEXICAL_RICH_TEXT",
    name: { vi: "Văn bản phong phú", en: "Rich Text Editor" },
    icon: AlignLeft,
    category: "content",
    schema: RichTextDataSchema,
    renderer: RichTextRender,
    editor: RichTextEditor as any,
    defaultData: {},
  });

  // 2. News Grid
  BlockRegistry.registerBlock({
    type: "FEATURED_NEWS",
    name: { vi: "Tin tức nổi bật", en: "Featured News Grid" },
    icon: Newspaper,
    category: "data",
    schema: NewsListDataSchema,
    renderer: NewsListRender,
    editor: NewsListEditor as any,
    defaultData: { limit: 6, categoryId: null, selectedCategoryName: "Tất cả tin tức" },
  });

  // 3. Statistics Grid
  BlockRegistry.registerBlock({
    type: "STATISTICS_GRID",
    name: { vi: "Số liệu thống kê", en: "Statistics Showcase" },
    icon: BarChart3,
    category: "data",
    schema: StatsGridDataSchema,
    renderer: StatsGridRender,
    editor: StatsGridEditor as any,
    defaultData: {
      items: [
        { value: "150+", label: { vi: "Đề tài nghiên cứu", en: "Research projects" } },
        { value: "45", label: { vi: "Bằng sáng chế", en: "Patents granted" } },
        { value: "1,200", label: { vi: "Doanh nghiệp hỗ trợ", en: "Supported enterprises" } },
        { value: "98%", label: { vi: "Tỷ lệ hài lòng", en: "Satisfaction rate" } }
      ]
    },
  });

  // 4. Board of Leadership
  BlockRegistry.registerBlock({
    type: "LEADERSHIP_LIST",
    name: { vi: "Ban lãnh đạo", en: "Leadership List" },
    icon: Users,
    category: "data",
    schema: LeadershipDataSchema,
    renderer: LeadershipRender,
    editor: LeadershipEditor as any,
    defaultData: { leaderIds: [], leaders: [] },
  });

  // 5. Org units directory
  BlockRegistry.registerBlock({
    type: "ORG_SECTIONS_DIRECTORY",
    name: { vi: "Thư mục tổ chức", en: "Org Directory Tree" },
    icon: Network,
    category: "data",
    schema: DirectoryDataSchema,
    renderer: DirectoryRender,
    editor: DirectoryEditor as any,
    defaultData: { selectedUnitIds: [], selectedUnits: [], displayStyle: "tree" },
  });

  // 6. Hero Banner Slider
  BlockRegistry.registerBlock({
    type: "HERO_SLIDER",
    name: { vi: "Trình chiếu ảnh nổi bật", en: "Hero Image Slider" },
    icon: Sliders,
    category: "data",
    schema: HeroSliderDataSchema,
    renderer: HeroSliderRender as any,
    editor: HeroSliderEditor as any,
    defaultData: { limit: 5 },
  });

  // 7. Public Services
  BlockRegistry.registerBlock({
    type: "PUBLIC_SERVICES",
    name: { vi: "Dịch vụ công trực tuyến", en: "Public Services Grid" },
    icon: FileText,
    category: "data",
    schema: PublicServicesDataSchema,
    renderer: PublicServicesRender as any,
    editor: PublicServicesEditor as any,
    defaultData: {},
  });

  // 8. Legal Documents
  BlockRegistry.registerBlock({
    type: "LEGAL_DOCUMENTS",
    name: { vi: "Văn bản pháp quy", en: "Legal Documents List" },
    icon: FolderOpen,
    category: "data",
    schema: LegalDocumentsDataSchema,
    renderer: LegalDocumentsRender as any,
    editor: LegalDocumentsEditor as any,
    defaultData: { selectedCategory: null, limit: 5 },
  });

  // 9. Photo & Video Gallery
  BlockRegistry.registerBlock({
    type: "PHOTO_VIDEO_GALLERY",
    name: { vi: "Thư viện đa phương tiện", en: "Media Gallery Grid" },
    icon: Images,
    category: "data",
    schema: MediaGalleryDataSchema,
    renderer: MediaGalleryRender as any,
    editor: MediaGalleryEditor as any,
    defaultData: { limit: 4 },
  });

  // 10. FAQ Accordion
  BlockRegistry.registerBlock({
    type: "FAQ_ACCORDION",
    name: { vi: "Hỏi đáp công dân", en: "Citizen FAQ Accordion" },
    icon: HelpCircle,
    category: "data",
    schema: FaqAccordionDataSchema,
    renderer: FaqAccordionRender as any,
    editor: FaqAccordionEditor as any,
    defaultData: { limit: 5 },
  });

  // 11. External Useful Links
  BlockRegistry.registerBlock({
    type: "EXTERNAL_LINKS",
    name: { vi: "Liên kết liên kết", en: "External Links Directory" },
    icon: Link2,
    category: "data",
    schema: ExternalLinksDataSchema,
    renderer: ExternalLinksRender as any,
    editor: ExternalLinksEditor as any,
    defaultData: {},
  });

  // 12. Interactive Commune Map
  BlockRegistry.registerBlock({
    type: "COMMUNE_INTERACTIVE_MAP",
    name: { vi: "Bản đồ hành chính tương tác", en: "Interactive Commune Map" },
    icon: Map,
    category: "data",
    schema: CommuneMapDataSchema,
    renderer: CommuneInteractiveMapRender as any,
    editor: CommuneInteractiveMapEditor as any,
    defaultData: { defaultZoneId: "T3" },
  });

  // 13. Contact Info Sidebar
  BlockRegistry.registerBlock({
    type: "CONTACT_INFO_SIDEBAR",
    name: { vi: "Thông tin liên hệ", en: "Contact Info Sidebar" },
    icon: Phone,
    category: "data",
    schema: ContactInfoDataSchema,
    renderer: ContactInfoSidebarRender as any,
    editor: ContactInfoSidebarEditor as any,
    defaultData: {
      address: "Thôn 6, xã Dang Kang, huyện Krông Bông, tỉnh Đắk Lắk",
      hotline: "0262.3683.123",
      email: "ubnddangkang@krongbong.daklak.gov.vn",
      workingHours: "Thứ 2 - Thứ 6 (Sáng 7:30 - 11:30 | Chiều 13:30 - 17:00)",
    },
  });
}

