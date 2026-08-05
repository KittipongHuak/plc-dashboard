"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(data: { username?: string; password?: string }) {
  const username = data.username;
  const password = data.password;

  if (username === "Admin" && password === "Admin") {
    // Set a secure session cookie
    cookies().set("session_token", "AdminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
}

export async function logoutAdmin() {
  cookies().delete("session_token");
  redirect("/dashboard");
}

export async function checkAdminSession(): Promise<boolean> {
  const sessionToken = cookies().get("session_token")?.value;
  return sessionToken === "AdminToken";
}
