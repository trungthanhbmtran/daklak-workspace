import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://api-gateway:8080/api/v1";


/**
 * Map ThemeConfig (admin internal format) → ThemeAppearanceConfig (portal format stored in DB as JSON description)
 * 
 * Admin ThemeConfig:
 *   theme: "light"|"dark"|"system"
 *   template: "blue"|"emerald"|"violet"|"amber"  (color brand)
 *   typography: { heading, body, size }
 *   layout: { radius, width, isCompact }
 *   customCss: string
 *
 * Portal ThemeAppearanceConfig (stored in portalConfig.description as JSON):
 *   theme: "government"|"news"|"education"|"minimal"
 *   colors: { primary, primaryHover, secondary, background }
 *   typography: { fontFamily }
 *   layout: { headerStyle, footerStyle, homepageLayout }
 *   branding: { logo, favicon, borderRadius }
 */

const TEMPLATE_COLORS: Record<string, { primary: string; primaryHover: string; secondary: string; background: string }> = {
  blue: { primary: "#1d4ed8", primaryHover: "#1e40af", secondary: "#eff6ff", background: "#f8fafc" },
  emerald: { primary: "#059669", primaryHover: "#047857", secondary: "#ecfdf5", background: "#f8fafb" },
  violet: { primary: "#7c3aed", primaryHover: "#6d28d9", secondary: "#f5f3ff", background: "#faf9ff" },
  amber: { primary: "#d97706", primaryHover: "#b45309", secondary: "#fffbeb", background: "#fffdf5" },
  // government default
  government: { primary: "#cc0000", primaryHover: "#a80000", secondary: "#fdfbf7", background: "#faf9f6" },
};

const FONT_MAP: Record<string, string> = {
  inter: "'Inter', 'Segoe UI', sans-serif",
  playfair: "'Playfair Display', 'Georgia', serif",
  merriweather: "'Merriweather', 'Times New Roman', serif",
  Geist: "'Geist Mono', monospace",
};

const RADIUS_MAP: Record<string, string> = {
  Sharp: "0px",
  Subtle: "4px",
  Medium: "8px",
  Full: "24px",
};

function mapThemeConfigToAppearance(cfg: any) {
  const template = cfg.template || "blue";
  const colors = TEMPLATE_COLORS[template] || TEMPLATE_COLORS["blue"];
  const fontHeading = cfg.typography?.heading || "inter";
  const fontBody = cfg.typography?.body || "inter";
  const fontFamily = FONT_MAP[fontHeading] || FONT_MAP[fontBody] || "'Inter', sans-serif";
  const radius = RADIUS_MAP[cfg.layout?.radius] || "8px";

  return {
    theme: "government" as const,          // portal only supports government theme type for now
    colorMode: cfg.theme || "light",       // light/dark/system — passed through for portal dark mode
    template: template,                     // keep original template id
    colors,
    typography: {
      fontFamily,
      fontSize: cfg.typography?.size || 14,
    },
    layout: {
      headerStyle: "standard" as const,
      footerStyle: "standard" as const,
      homepageLayout: "grid" as const,
      width: cfg.layout?.width || "1280",
      isCompact: cfg.layout?.isCompact || false,
    },
    branding: {
      logo: "",
      favicon: "",
      borderRadius: radius,
    },
    customCss: cfg.customCss || "",
    stage: cfg.stage || "default",
    savedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const themeConfig = await request.json();

    // Map admin ThemeConfig → portal ThemeAppearanceConfig
    const appearanceConfig = mapThemeConfigToAppearance(themeConfig);

    // Get auth cookie from incoming request to forward to gateway
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

    // Upsert into DB via API gateway
    const response = await fetch(`${GATEWAY_URL}/admin/portal-configs/upsert`, {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: allCookies,
      },
      body: JSON.stringify({
        code: "theme_appearance",
        name: "Cấu hình giao diện Portal",
        description: JSON.stringify(appearanceConfig),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[/api/theme] Gateway error:", errText);
      return NextResponse.json(
        { success: false, message: "Lưu theme thất bại: " + errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    console.error("[/api/theme] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

    const response = await fetch(`${GATEWAY_URL}/public/portal-configs`, {

      headers: { Cookie: allCookies },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, data: null }, { status: 200 });
    }

    const res = await response.json();
    const configs = Array.isArray(res?.data) ? res.data : [];
    const found = configs.find((c: any) => c.code === "theme_appearance");

    if (found?.description) {
      try {
        return NextResponse.json({ success: true, data: JSON.parse(found.description) });
      } catch {
        return NextResponse.json({ success: false, data: null });
      }
    }

    return NextResponse.json({ success: false, data: null });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: null }, { status: 200 });
  }
}
