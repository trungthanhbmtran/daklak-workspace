import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { baseUrl, endpointPath, method = "GET", headers = {}, authConfig = {}, params = {} } = await req.json();

    if (!baseUrl || !endpointPath) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin baseUrl hoặc endpointPath" },
        { status: 400 }
      );
    }

    // Construct full URL
    // Make sure we handle trailing/leading slashes correctly
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanEndpointPath = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
    const url = `${cleanBaseUrl}${cleanEndpointPath}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add authorization if configured
    if (authConfig.type === "bearer" && authConfig.token) {
      requestHeaders["Authorization"] = `Bearer ${authConfig.token}`;
    } else if (authConfig.type === "basic" && authConfig.username && authConfig.password) {
      const credentials = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString("base64");
      requestHeaders["Authorization"] = `Basic ${credentials}`;
    }

    // Execute request
    const response = await axios({
      method: method.toUpperCase(),
      url,
      headers: requestHeaders,
      params,
      timeout: 10000, // 10 seconds timeout
    });

    // Helper to find an array in the response object (up to 2 levels deep)
    const extractArray = (obj: any): any[] | null => {
        if (!obj || typeof obj !== 'object') return null;
        if (Array.isArray(obj)) return obj;
        if (Array.isArray(obj.data)) return obj.data;
        if (Array.isArray(obj.items)) return obj.items;
        
        // Check first level
        for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key])) return obj[key];
        }
        // Check second level
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                for (const subKey of Object.keys(val)) {
                    if (Array.isArray(val[subKey])) return val[subKey];
                }
            }
        }
        return null;
    };

    let responseData = response.data;
    if (responseData && !Array.isArray(responseData)) {
        const foundArray = extractArray(responseData);
        if (foundArray) {
            responseData = foundArray;
        } else {
            responseData = [responseData];
        }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error("Error proxying report preview:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || error.message || "Lỗi proxy data preview",
      },
      { status: error.response?.status || 500 }
    );
  }
}
