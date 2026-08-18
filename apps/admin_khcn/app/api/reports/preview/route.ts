import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import { get } from "lodash";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

type AuthConfig = {
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  scope?: string;
  tokenPath?: string;
};

class OAuth2Error extends Error { }

async function fetchOAuth2Token(authConfig: AuthConfig): Promise<string> {
  const { authUrl, clientId, clientSecret, scope, tokenPath = "access_token" } = authConfig;

  const tokenParams = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId!,
    client_secret: clientSecret!,
  });
  if (scope) tokenParams.append("scope", scope);

  try {
    const tokenRes = await axios.post(authUrl!, tokenParams.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      httpsAgent,
    });

    const token = get(tokenRes.data, tokenPath);
    if (!token) {
      throw new OAuth2Error(`Không tìm thấy token tại đường dẫn: ${tokenPath}`);
    }
    return token;
  } catch (err: any) {
    if (err instanceof OAuth2Error) throw err;
    const msg =
      err.response?.data?.error_description ||
      err.response?.data?.message ||
      err.message;
    throw new OAuth2Error("Lỗi lấy token OAUTH2: " + msg);
  }
}

async function applyAuth(
  authType: string,
  authConfig: AuthConfig,
  requestHeaders: Record<string, string>
): Promise<void> {
  switch (authType.toUpperCase()) {
    case "BEARER": {
      if (authConfig.apiToken) {
        requestHeaders["Authorization"] = `Bearer ${authConfig.apiToken}`;
      }
      break;
    }

    case "BASIC": {
      if (!authConfig.clientId || !authConfig.clientSecret) break;
      const credentials = Buffer.from(
        `${authConfig.clientId}:${authConfig.clientSecret}`
      ).toString("base64");
      requestHeaders["Authorization"] = `Basic ${credentials}`;
      break;
    }

    case "API_KEY": {
      if (!authConfig.clientId || !authConfig.clientSecret) break;
      requestHeaders[authConfig.clientId] = authConfig.clientSecret;
      break;
    }

    case "OAUTH2": {
      if (!authConfig.authUrl || !authConfig.clientId || !authConfig.clientSecret) break;
      const token = await fetchOAuth2Token(authConfig);
      requestHeaders["Authorization"] = `Bearer ${token}`;
      break;
    }

    case "NONE":
    default:
      break;
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      baseUrl,
      endpointPath,
      method = "GET",
      headers = {},
      authType = "NONE",
      authConfig = {},
      params = {},
      body,
    } = await req.json();

    if (!baseUrl || !endpointPath) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin baseUrl hoặc endpointPath" },
        { status: 400 }
      );
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanEndpointPath = endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`;
    const url = `${cleanBaseUrl}${cleanEndpointPath}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    try {
      await applyAuth(authType, authConfig, requestHeaders);
    } catch (err) {
      if (err instanceof OAuth2Error) {
        return NextResponse.json(
          { success: false, message: err.message },
          { status: 400 }
        );
      }
      throw err;
    }

    const startTime = Date.now();

    const response = await axios({
      method: method.toUpperCase(),
      url,
      headers: requestHeaders,
      params,
      data: body,
      timeout: 10000,
      httpsAgent,
    });

    const time = Date.now() - startTime;
    const responseData = response.data;
    const size = Buffer.byteLength(JSON.stringify(responseData), "utf8");

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
    const time = error.config?.metadata?.startTime
      ? Date.now() - error.config.metadata.startTime
      : 0;
    console.error("Error proxying report preview:", error.message);

    const status = error.response?.status;
    const safeStatus = status === 401 || status === 403 ? 400 : status || 500;

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || error.message || "Lỗi proxy data preview",
        status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
        time,
      },
      { status: safeStatus }
    );
  }
}