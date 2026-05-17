import { BlockRegistry } from "../core/registry";
import { AlignLeft, Newspaper, BarChart3, Users, Network } from "lucide-react";

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
}
