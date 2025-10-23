"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Получаем URL для возврата после успешного входа
  const returnUrl = searchParams?.get("from") || "/dashboard";

  useEffect(() => {
    // Проверяем, не авторизован ли пользователь уже
    const token = localStorage.getItem("token");
    if (token) {
      router.push(returnUrl);
    }
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка входа");
      }

      // Сохраняем пользователя в контексте
      login(data.token, data.user);

      // Переходим на сохраненный URL или дашборд
      router.push(returnUrl);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "qwerty" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка входа");
      login(data.token, data.user);
      router.push(returnUrl);
    } catch (err: any) {
      setError(err.message || "Ошибка быстрого входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-[var(--dark-green)] mb-2 font-serif">
            Вход в аккаунт
          </h1>
          <p className="text-gray-600">Войдите в свой аккаунт</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={quickLogin}
            className="w-full mt-2 py-3 border border-dashed btn-primary border-gray-300 rounded-lg text-sm text-white"
            disabled={loading}
          >
            Быстрый вход (test@test.com)
          </button>
        </div>

        <div className="w-full text-center">или</div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="text-[var(--light-green)] hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
