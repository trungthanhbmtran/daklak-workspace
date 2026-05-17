import { z } from "zod";
import { Widget } from "./types";

export interface RegisteredBlock<T = any> {
  type: string;
  name: Record<string, string>;               // Multilingual name: { vi: "Tin tức", en: "News" }
  icon: React.ComponentType<any>;              // Icon component class
  category: "data" | "content" | "media" | "layout" | "extra";
  schema: z.ZodType<T>;                        // Zod validation schema for block data
  renderer: React.ComponentType<{              // Public renderer component
    widget: Widget<T>;
    activeLang: string;
  }>;
  editor: React.ComponentType<{                // CMS Customizer properties editor component
    widget: Widget<T>;
    onChangeData: (data: T) => void;
    activeLang: string;
  }>;
  defaultData: T;                              // Initial state for new block instances
}

class BlockRegistryClass {
  private registry = new Map<string, RegisteredBlock<any>>();

  /**
   * Registers a new block structure in the CMS visual page builder registry.
   */
  public registerBlock<T = any>(block: RegisteredBlock<T>): void {
    if (this.registry.has(block.type)) {
      console.warn(`[BlockRegistry] Overwriting block registration for type: ${block.type}`);
    }
    this.registry.set(block.type, block);
  }

  /**
   * Retrieves a registered block config by its unique type identifier.
   */
  public getBlock<T = any>(type: string): RegisteredBlock<T> | undefined {
    return this.registry.get(type) as RegisteredBlock<T> | undefined;
  }

  /**
   * Returns all currently registered CMS blocks.
   */
  public getAllBlocks(): RegisteredBlock<any>[] {
    return Array.from(this.registry.values());
  }

  /**
   * Returns registered blocks grouped by category for LeftSidebar display.
   */
  public getBlocksByCategory(category: RegisteredBlock["category"]): RegisteredBlock<any>[] {
    return this.getAllBlocks().filter((b) => b.category === category);
  }

  /**
   * Performs runtime schema validation of widget block data.
   */
  public validateBlockData(type: string, data: any): { success: boolean; error?: string; data?: any } {
    const block = this.getBlock(type);
    if (!block) {
      return { success: false, error: `Unrecognized block type: ${type}` };
    }
    const result = block.schema.safeParse(data);
    if (!result.success) {
      return { success: false, error: result.error.message };
    }
    return { success: true, data: result.data };
  }
}

export const BlockRegistry = new BlockRegistryClass();
export default BlockRegistry;
