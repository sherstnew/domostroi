"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PreferencesForm from "@/components/onboarding/PreferencesForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToasts } from "@/components/ui/toast";

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newAllergy, setNewAllergy] = useState("");
  const router = useRouter();
  const { updateUser } = useAuth();
  const toasts = useToasts();

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const [prefsRes, meRes] = await Promise.all([
          fetch("/api/user-preferences", { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
          fetch("/api/auth/me", { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
        ]);
        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setPrefs(data.preferences || {});
        }
        if (meRes.ok) {
          const me = await meRes.json();
          setUser(me.user);
          // merge some profile fields
          // Prefer the actual user.name or profile.fullName
          const nameFromUser =
            me.user?.name || me.user?.profile?.fullName || "";
          setPrefs((p: any) => ({
            ...p,
            ...(me.user?.profile || {}),
            email: me.user?.email,
            name: p.name || nameFromUser,
          }));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      // save preferences
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      await fetch("/api/user-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify(prefs),
      });
      // try to save basic user fields (name, email, weeklyBudget)
      try {
        const payload: any = {};
        if (prefs.name) payload.fullName = prefs.name;
        if (prefs.email) payload.email = prefs.email;
        if (typeof prefs.weeklyBudget !== "undefined")
          payload.weeklyBudget = prefs.weeklyBudget;
        if (Object.keys(payload).length > 0) {
          const res2 = await fetch("/api/auth/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: "include",
            body: JSON.stringify(payload),
          });
          if (res2.ok) {
            try {
              const data = await res2.json();
              if (data?.user) updateUser(data.user);
            } catch (e) {}
          } else {
            console.warn("Failed to save /api/auth/me");
          }
        }
      } catch (e) {
        console.warn("Failed to save user profile", e);
      }
      router.push("/dashboard");
    } catch (e) {
      toasts?.add?.('Ошибка при сохранении', 'error');
    }
  };

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Профиль и предпочтения</h1>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-color)]/80">
              Имя
            </label>
            <Input
              value={prefs.name || prefs.fullName || ""}
              onChange={(e) =>
                setPrefs((p: any) => ({ ...p, name: e.target.value }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-color)]/80">
              Email
            </label>
            <Input
              value={prefs.email || ""}
              onChange={(e) =>
                setPrefs((p: any) => ({ ...p, email: e.target.value }))
              }
              className="w-full"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full justify-end mb-5">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2"
          >
            Отмена
          </Button>
          <Button onClick={save} className="px-4 py-2">
            Сохранить
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Предпочтения</h3>
          <p className="text-sm text-gray-600 mb-2">
            Отредактируйте образ жизни, БЖУ и запреты на продукты
          </p>
          <PreferencesForm
            initial={prefs}
            /* showActions defaults to true — render internal buttons */
            onSave={(p: any) => setPrefs((prev: any) => ({ ...(prev || {}), ...(p || {}) }))}
          />
        </div>
      </div>
    </div>
  );
}
