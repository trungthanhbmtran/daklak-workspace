/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";

export interface AiServiceConfig {
  apiUrl?: string;
}

class AiServiceClass {
  private apiUrl = "/ai"; // BaseURL "/api/v1/admin" + "/ai" -> "/api/v1/admin/ai"

  /**
   * Rewrites page content with options for professional, informative or engaging tones.
   */
  public async rewriteText(
    text: string,
    tone: "professional" | "informative" | "engaging" = "professional",
  ): Promise<string> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/rewrite`, { text, tone });
      const resultText =
        response?.data?.text || response?.data?.data?.text || response?.text;
      if (resultText) {
        return resultText;
      }
      throw new Error("Empty AI response");
    } catch {
      return this.mockRewrite(text, tone);
    }
  }

  /**
   * Translates block content into a target locale language.
   */
  public async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/translate`, {
        text,
        targetLanguage,
      });
      const translated =
        response?.data?.translatedText ||
        response?.data?.data?.translatedText ||
        response?.translatedText;
      if (translated) {
        return translated;
      }
      throw new Error("Translation failed");
    } catch {
      return this.mockTranslate(text, targetLanguage);
    }
  }

  /**
   * Summarizes long rich-text content for quick statistics or highlights.
   */
  public async summarizeText(text: string, maxSentences = 3): Promise<string> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/summarize`, {
        text,
        maxSentences,
      });
      const summary =
        response?.data?.summary ||
        response?.data?.data?.summary ||
        response?.summary;
      if (summary) {
        return summary;
      }
      throw new Error("Summarization failed");
    } catch {
      return this.mockSummarize(text, maxSentences);
    }
  }

  /**
   * Generates optimized SEO Title, Description, and Keywords based on visual content.
   */
  public async generateSeoMetadata(
    pageTitle: string,
    content: string,
  ): Promise<{ title: string; description: string; keywords: string }> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/seo-generate`, {
        pageTitle,
        content,
      });
      const seo =
        response?.data?.seo ||
        response?.data?.data?.seo ||
        response?.seo;
      if (seo?.title) {
        return seo;
      }
      throw new Error("SEO generation failed");
    } catch {
      return this.mockSeoGenerate(pageTitle, content);
    }
  }

  // --- MOCK FALLBACKS FOR LOCAL TESTING & STABILITY ---

  private async mockRewrite(text: string, tone: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 600));
    if (!text.trim()) return "";
    return `[Bản sửa đổi AI - Giọng điệu ${tone}]: ${text} (Đã tối ưu hóa tính mạch lạc và độ chuẩn xác hành chính).`;
  }

  private async mockTranslate(text: string, targetLanguage: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 800));
    if (!text.trim()) return "";
    const isEn = targetLanguage.toLowerCase().includes("en");
    if (isEn) {
      return `[AI English Translation]: ${text} (Translated by AI Assistant).`;
    }
    return `[AI Dịch sang ${targetLanguage}]: ${text}`;
  }

  private async mockSummarize(text: string, maxSentences: number): Promise<string> {
    await new Promise((r) => setTimeout(r, 500));
    if (!text.trim()) return "";
    const cleanText = text.replace(/<[^>]*>/g, "");
    const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const summary = sentences.slice(0, maxSentences).join(". ") + ".";
    return `[Tóm tắt AI]: ${summary}`;
  }

  private async mockSeoGenerate(
    pageTitle: string,
    content: string,
  ): Promise<{ title: string; description: string; keywords: string }> {
    await new Promise((r) => setTimeout(r, 800));
    const title = `${pageTitle} - Ban Tổ chức Tỉnh ủy Đắk Lắk`;
    const cleanContent = content.replace(/<[^>]*>/g, "").slice(0, 150);
    const description = `Thông tin về ${pageTitle}. ${cleanContent}... Hệ thống quản lý công việc và đánh giá cán bộ Ban Tổ chức Tỉnh ủy Đắk Lắk.`;
    const keywords = `${pageTitle}, ban to chuc tinh uy, dak lak, cong tac can bo, cai cach hanh chinh`;
    return { title, description, keywords };
  }
}

export const AiService = new AiServiceClass();
export default AiService;
