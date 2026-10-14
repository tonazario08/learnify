"use client";
 
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });
      if (result.error) {
        setError("Email hoặc mật khẩu không đúng.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <main className="mx-auto max-w-md space-y-5 p-8">
      <h1 className="text-2xl font-bold">Đăng nhập Learnify</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">Email
          <input className="block w-full rounded border p-2"
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">Mật khẩu
          <input className="block w-full rounded border p-2"
            type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-slate-900 p-3 text-white">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <Link className="underline" href="/register">Tạo tài khoản mới</Link>
    </main>
  );
}
