"use client";
 
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
 
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (result.error) {
        setError(result.error.message ?? "Không thể đăng ký.");
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
      <h1 className="text-2xl font-bold">Đăng ký Learnify</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">Họ tên
          <input className="block w-full rounded border p-2"
            required minLength={2} value={name}
            onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">Email
          <input className="block w-full rounded border p-2"
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">Mật khẩu
          <input className="block w-full rounded border p-2"
            type="password" minLength={8} required value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-slate-900 p-3 text-white">
          {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
        </button>
      </form>
      <Link className="underline" href="/login">Đã có tài khoản? Đăng nhập</Link>
    </main>
    );
}