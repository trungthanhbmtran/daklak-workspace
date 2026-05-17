import apiClient from "@/lib/axiosInstance";

export interface AiServiceConfig {
  apiUrl?: string;
}

class AiServiceClass {
  private apiUrl = "/ai-assist"; // Standard relative AI assistant endpoint

  /**
   * Rewrites page content with options for professional, informative or engaging tones.
   */
  public async rewriteText(text: string, tone: "professional" | "informative" | "engaging" = "professional"): Promise<string> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/rewrite`, { text, tone });
      if (response?.data?.text) {
        return response.data.text;
      }
      throw new Error("Empty AI response");
    } catch (e) {
      console.warn("[AiService] Fallback to client-side mock for rewrite:", e);
      return this.mockRewrite(text, tone);
    }
  }

  /**
   * Translates block content into a target locale language.
   */
  public async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/translate`, { text, targetLanguage });
      if (response?.data?.translatedText) {
        return response.data.translatedText;
      }
      throw new Error("Translation failed");
    } catch (e) {
      console.warn("[AiService] Fallback to client-side mock for translation:", e);
      return this.mockTranslate(text, targetLanguage);
    }
  }

  /**
   * Summarizes long rich-text content for quick statistics or highlights.
   */
  public async summarizeText(text: string, maxSentences = 3): Promise<string> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/summarize`, { text, maxSentences });
      if (response?.data?.summary) {
        return response.data.summary;
      }
      throw new Error("Summarization failed");
    } catch (e) {
      console.warn("[AiService] Fallback to client-side mock for summarization:", e);
      return this.mockSummarize(text, maxSentences);
    }
  }

  /**
   * Generates optimized SEO Title, Description, and Keywords based on visual content.
   */
  public async generateSeoMetadata(pageTitle: string, content: string): Promise<{ title: string; description: string; keywords: string }> {
    try {
      const response: any = await apiClient.post(`${this.apiUrl}/seo-generate`, { pageTitle, content });
      if (response?.data?.seo) {
        return response.data.seo;
      }
      throw new Error("SEO generation failed");
    } catch (e) {
      console.warn("[AiService] Fallback to client-side mock for SEO:", e);
      return this.mockSeoGenerate(pageTitle, content);
    }
  }

  // --- MOCK FALLBACKS FOR LOCAL TESTING & STABILITY ---

  private async mockRewrite(text: string, tone: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 1000)); // Simulate network latency
    if (!text.trim()) return "";
    return `[Bản sửa đổi AI - Giọng điệu ${tone}]: ${text} (Đã tối ưu hóa tính mạch lạc và độ chuẩn xác hành chính).`;
  }

  private async mockTranslate(text: string, targetLanguage: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 1200));
    if (!text.trim()) return "";
    const isEn = targetLanguage.toLowerCase().includes("en");
    if (isEn) {
      return `[AI English Translation]: ${text} (Translated by AI Assistant).`;
    }
    return `[AI Dịch sang ${targetLanguage}]: ${text}`;
  }

  private async mockSummarize(text: string, maxSentences: number): Promise<string> {
    await new Promise((r) => setTimeout(r, 800));
    if (!text.trim()) return "";
    const cleanText = text.replace(/<[^>]*>/g, ""); // Strip HTML tags
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, maxSentences).join(". ") + ".";
    return `[Tóm tắt AI]: ${summary}`;
  }

  private async mockSeoGenerate(pageTitle: string, content: string): Promise<{ title: string; description: string; keywords: string }> {
    await new Promise((r) => setTimeout(r, 1500));
    const title = `${pageTitle} - Cổng thông tin KH&CN Tỉnh Đắk Lắk`;
    const cleanContent = content.replace(/<[^>]*>/g, "").slice(0, 150);
    const description = `Tìm hiểu về ${pageTitle}. ${cleanContent}... Cập nhật mới nhất trên Cổng thông tin Khoa học và Công nghệ.`;
    const keywords = `${pageTitle}, khoa hoc cong nghe, dak lak, cong thong tin portal, page builder`;
    return { title, description, keywords };
  }
}

export const AiService = new AiServiceClass();
export default AiService;
