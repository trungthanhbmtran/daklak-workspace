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

    // We assume the response data might be wrapped or an array.
    // If it's an object with a 'data' array property (standard wrapper), unwrap it for preview
    let responseData = response.data;
    if (responseData && !Array.isArray(responseData) && Array.isArray(responseData.data)) {
        responseData = responseData.data;
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
