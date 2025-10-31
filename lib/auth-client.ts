import Cookies from "js-cookie"

/**
 * Kiểm tra xem user có đang đăng nhập không (client-side)
 */
export function isAuthenticated(): boolean {
  return !!Cookies.get("token")
}

/**
 * Lấy token từ cookie (client-side)
 */
export function getToken(): string | undefined {
  return Cookies.get("token")
}

/**
 * Lưu token vào cookie (client-side)
 */
export function setToken(token: string, expiresInDays: number = 7): void {
  Cookies.set("token", token, {
    expires: expiresInDays,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

/**
 * Xóa token khỏi cookie (client-side)
 */
export function removeToken(): void {
  Cookies.remove("token", { path: "/" })
}
