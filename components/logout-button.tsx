"use client";
 
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
 
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  async function logout() {
    setLoading(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError("Đăng xuất thất bại.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }
 
  return <div>
    <button type="button" onClick={logout} disabled={loading}
      className="rounded border px-4 py-2">
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
    {error && <p role="alert" className="text-red-600">{error}</p>}
  </div>;
}
