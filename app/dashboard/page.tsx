"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ProductSearch from "@/components/dashboard/ProductSearch";
import RecommendationSection from "@/components/dashboard/RecommendationSection";
import ProductGroups from "@/components/dashboard/ProductGroups";
import { Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard'
import Link from 'next/link';
import { useToasts } from '@/components/ui/toast'

export default function Dashboard() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showAddToGroupFor, setShowAddToGroupFor] = useState<string | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState("");
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const toasts = useToasts()
  const [prefs, setPrefs] = useState<any>({})

  // Редирект если пользователь не авторизован
  useEffect(() => {
    // load persisted favorites
    const loadFavs = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch("/api/favorites", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) return;
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    };
    loadFavs();

    // load user groups for add-to-group modal
    const loadGroups = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch("/api/groups", { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) return;
        const data = await res.json();
        setGroups(data.groups || []);
      } catch (e) {
        console.error("Failed to load groups", e);
      }
    };
    loadGroups();

    // load user preferences (goals, etc.)
    const loadPrefs = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch('/api/user-preferences', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        if (!res.ok) return
        const data = await res.json()
        setPrefs(data.preferences || {})
      } catch (e) {
        console.warn('Failed to load preferences', e)
      }
    }
    loadPrefs();

    const loadProducts = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/products', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        if (!res.ok) return
        const jd = await res.json()
        let prods = jd.products || []
        const selStore = (user as any)?.selectedStore
        if (selStore) {
          prods = [...prods].sort((a: any, b: any) => {
            const aHas = (a.stores || []).some((s: any) => String(s.storeId) === String(selStore) && s.available)
            const bHas = (b.stores || []).some((s: any) => String(s.storeId) === String(selStore) && s.available)
            if (aHas === bHas) return 0
            return aHas ? -1 : 1
          })
        }
        setAllProducts(prods)
        setSearchResults(prods)
      } catch (e) { console.error('Failed to load products', e) }
    }
    loadProducts()

    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--light-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Редирект произойдет в useEffect
  }

  const toggleFavorite = async (productId: string) => {
    try {
      if (favorites.includes(productId)) {
        await fetch(`/api/favorites?productId=${productId}`, {
          method: "DELETE",
          credentials: "include",
        });
        setFavorites((prev) => prev.filter((id) => id !== productId));
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId }),
        });
        setFavorites((prev) => [...prev, productId]);
      }
    } catch (e) {
      console.error("Favorite toggle error", e);
    }
  };

  const addToGroupFromCard = async () => {
    if (!showAddToGroupFor) return;
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: showAddToGroupFor,
          groupId: selectedGroup || undefined,
        }),
      });
      // ensure ui reflects favorite
      if (!favorites.includes(showAddToGroupFor))
        setFavorites((prev) => [...prev, showAddToGroupFor]);
      setShowAddToGroupFor(null);
      setSelectedGroup("");
      // notify groups UI to refresh
      try {
        window.dispatchEvent(new Event("groups:updated"));
      } catch (e) {}
    } catch (e) {
      console.error("Add to group error", e);
    }
  };

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--dark-green)] mb-2 font-serif">
            Добро пожаловать, {user.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Откройте для себя идеальные продукты для вашего здоровья
          </p>
        </div>

        {/* Поиск с интегрированными целями */}
        <ProductSearch
          onSearchResults={setSearchResults}
          products={allProducts}
          hasDiabetes={prefs?.healthConditions?.includes('diabetes')}
        />

        {/* Секция с текущими целями (только информация) */}
        {prefs?.goals && (
          <div className="mt-6 mb-6 bg-white/80 rounded-lg p-4 border">
            <h3 className="text-lg font-medium text-[var(--dark-green)] mb-3">
              Ваши текущие цели
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {prefs.goals.calories && (
                <div className="text-center p-3 bg-[var(--light-green)]/10 rounded">
                  <div className="font-medium text-[var(--dark-green)]">Калории</div>
                  <div className="text-gray-700">{prefs.goals.calories} ккал</div>
                </div>
              )}
              {prefs.goals.budget && (
                <div className="text-center p-3 bg-[var(--light-green)]/10 rounded">
                  <div className="font-medium text-[var(--dark-green)]">Бюджет</div>
                  <div className="text-gray-700">{prefs.goals.budget} ₽</div>
                </div>
              )}
              {prefs.goals.mode === 'detailed' && prefs.goals.protein && (
                <div className="text-center p-3 bg-[var(--light-green)]/10 rounded">
                  <div className="font-medium text-[var(--dark-green)]">Белки</div>
                  <div className="text-gray-700">{prefs.goals.protein}г</div>
                </div>
              )}
              {prefs.goals.mode === 'detailed' && prefs.goals.carbs && (
                <div className="text-center p-3 bg-[var(--light-green)]/10 rounded">
                  <div className="font-medium text-[var(--dark-green)]">Углеводы</div>
                  <div className="text-gray-700">{prefs.goals.carbs}г</div>
                </div>
              )}
              {prefs.goals.mode === 'detailed' && prefs.goals.fat && (
                <div className="text-center p-3 bg-[var(--light-green)]/10 rounded">
                  <div className="font-medium text-[var(--dark-green)]">Жиры</div>
                  <div className="text-gray-700">{prefs.goals.fat}г</div>
                </div>
              )}
              {prefs.goals.mode === 'simple' && (
                <div className="text-center p-3 bg-[var(--light-green)]/10 rounded">
                  <div className="font-medium text-[var(--dark-green)]">Режим</div>
                  <div className="text-gray-700">Простой</div>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              💡 Цели автоматически применяются как фильтры при поиске продуктов
            </div>
          </div>
        )}

        {/* Все продукты */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-6 font-serif">
            Все продукты
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                Ничего не найдено по вашему запросу
              </div>
            ) : (
              searchResults.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  isFavorite={favorites.includes(product._id || product.id)}
                  onToggleFavorite={(id: string) => toggleFavorite(id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Рекомендации */}
        <RecommendationSection
          products={allProducts.slice(0, 6)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />

        {/* Группы продуктов */}
        <ProductGroups />

        {/* Модальное окно добавления в группу */}
        {showAddToGroupFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Добавить в группу</h3>
              <div className="mb-4">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-3 text-[var(--text-color)]/90"
                >
                  <option value="">
                    -- Без группы (только в избранное) --
                  </option>
                  {groups.map((g) => (
                    <option key={g._id || g._id} value={g._id || g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <Button onClick={addToGroupFromCard} className="">
                    Добавить
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddToGroupFor(null);
                      setSelectedGroup("");
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}