import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          {"Bạn không có tài khoản? "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Đăng kí tại đây
          </Link>
        </p>
      </div>
    </div>
  )
}
