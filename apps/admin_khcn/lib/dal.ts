"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import { serverApiBase } from "./server-api-url";

export async function loginAction(formData: FormData) {
  try {
    const response = await axios.post(
      serverApiBase() + "/auth/login",
      {
        username: formData.get("username"),
        password: formData.get("password"),
      },
      { timeout: 15000 },
    );
    const authCookies = (response.headers["set-cookie"] || []).filter(
      (value: string) =>
        /^(accessToken|refreshToken)=/.test(value) &&
        !/Max-Age=0(?:;|$)/i.test(value),
    );
    const access = authCookies.find((value: string) =>
      value.startsWith("accessToken="),
    );
    const refresh = authCookies.find((value: string) =>
      value.startsWith("refreshToken="),
    );
    if (!access || !refresh)
      return { error: "Máy chủ không trả về phiên đăng nhập hợp lệ." };
    const token = access.split(";")[0].slice("accessToken=".length);
    await axios.get(serverApiBase() + "/auth/me", {
      headers: { Authorization: "Bearer " + token },
      timeout: 15000,
    });
    const cookieStore = await cookies();
    cookieStore.delete("session");
    for (const value of [access, refresh]) {
      const first = value.split(";")[0],
        separator = first.indexOf("=");
      const maxAge = Number(value.match(/Max-Age=(\d+)/i)?.[1]);
      if (!Number.isFinite(maxAge) || maxAge <= 0)
        return { error: "Thời hạn phiên đăng nhập không hợp lệ." };
      cookieStore.set(first.slice(0, separator), first.slice(separator + 1), {
        httpOnly: true,
        secure: /;\s*Secure(?:;|$)/i.test(value),
        sameSite: "strict",
        path: "/",
        maxAge,
      });
    }
  } catch (error) {
    return {
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || "Không thể xác thực phiên đăng nhập."
        : "Lỗi kết nối đến hệ thống xác thực.",
    };
  }
  redirect("/hub");
}
export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  try {
    await axios.post(
      serverApiBase() + "/auth/logout",
      { refreshToken },
      { timeout: 5000 },
    );
  } catch {
    /* Local cleanup still runs when upstream is unavailable. */
  }
  for (const name of ["accessToken", "refreshToken", "session"])
    cookieStore.delete(name);
  redirect("/login");
}
