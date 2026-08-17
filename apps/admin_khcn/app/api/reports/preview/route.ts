import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

export async function POST(req: NextRequest) {
  try {
    const { baseUrl, endpointPath, method = "GET", headers = {}, authType = "NONE", authConfig = {}, params = {}, body } = await req.json();

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

    // Create HTTPS agent to ignore self-signed cert errors
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    // Add authorization if configured
    const type = authType.toUpperCase();
    if (type === "BEARER" && authConfig.apiToken) {
      requestHeaders["Authorization"] = `Bearer ${authConfig.apiToken}`;
    } else if (type === "BASIC" && authConfig.clientId && authConfig.clientSecret) {
      const credentials = Buffer.from(`${authConfig.clientId}:${authConfig.clientSecret}`).toString("base64");
      requestHeaders["Authorization"] = `Basic ${credentials}`;
    } else if (type === "API_KEY" && authConfig.clientId && authConfig.clientSecret) {
      requestHeaders[authConfig.clientId] = authConfig.clientSecret;
    } else if (type === "OAUTH2" && authConfig.authUrl && authConfig.clientId && authConfig.clientSecret) {
      try {
        const tokenParams = new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: authConfig.clientId,
          client_secret: authConfig.clientSecret,
        });
        if (authConfig.scope) {
          tokenParams.append('scope', authConfig.scope);
        }

        const tokenRes = await axios.post(authConfig.authUrl, tokenParams.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          httpsAgent,
        });
        if (tokenRes.data && tokenRes.data.access_token) {
          requestHeaders["Authorization"] = `Bearer ${tokenRes.data.access_token}`;
        }
      } catch (err: any) {
        console.error("Failed to fetch OAUTH2 token:", err.message);
        return NextResponse.json(
          { success: false, message: "Lỗi lấy token OAUTH2: " + (err.response?.data?.error_description || err.response?.data?.message || err.message) },
          { status: 400 }
        );
      }
    }

    const startTime = Date.now();

    const response = await axios({
      method: method.toUpperCase(),
      url,
      headers: requestHeaders,
      params,
      data: body,
      timeout: 10000, // 10 seconds timeout
      httpsAgent,
    });

    const time = Date.now() - startTime;

    const responseData = response.data;

    const size = Buffer.byteLength(JSON.stringify(responseData), 'utf8');

    return NextResponse.json({
      success: true,
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      time,
      size,
    });
  } catch (error: any) {
    const time = error.config?.metadata?.startTime ? Date.now() - error.config.metadata.startTime : 0;
    console.error("Error proxying report preview:", error.message);
    // Prevent returning 401/403 because it will trigger the frontend global auth interceptor and log the user out
    const status = error.response?.status;
    const safeStatus = (status === 401 || status === 403) ? 400 : (status || 500);

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || error.message || "Lỗi proxy data preview",
        status: status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
        time,
      },
      { status: safeStatus }
    );
  }
}
