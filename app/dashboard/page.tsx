"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ProductSearch from "@/components/dashboard/ProductSearch";
import RecommendationSection from "@/components/dashboard/RecommendationSection";
import ProductGroups from "@/components/dashboard/ProductGroups";
import { mockProducts } from "../api/products/route";
import DynamicGoals from "@/components/onboarding/DynamicGoals";
import { Heart } from 'lucide-react';

export default function Dashboard() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState(mockProducts);
  const [groups, setGroups] = useState<any[]>([]);
  const [showAddToGroupFor, setShowAddToGroupFor] = useState<string | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState("");
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Редирект если пользователь не авторизован
  useEffect(() => {
    // load persisted favorites
    const loadFavs = async () => {
      try {
        const res = await fetch("/api/favorites");
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
        const res = await fetch("/api/groups");
        if (!res.ok) return;
        const data = await res.json();
        setGroups(data.groups || []);
      } catch (e) {
        console.error("Failed to load groups", e);
      }
    };
    loadGroups();

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

        {/* Поиск */}
        <ProductSearch
          onSearchResults={setSearchResults}
          products={mockProducts}
        />

        {/* Dynamic goals are now available inside the search filters */}

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
                <div
                  key={product._id}
                  className="card p-6 flex flex-col justify-between"
                >
                  <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--dark-green)] mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-[var(--light-green)]/20 text-[var(--dark-green)] text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-[var(--accent-orange)]">
                      {product.price} ₽
                    </span>
                    <div className="text-sm text-gray-600">
                      {product.calories} ккал
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>Б: {product.protein}г</span>
                    <span>У: {product.carbs}г</span>
                    <span>Ж: {product.fat}г</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          toggleFavorite?.(product._id || product._id)
                        }
                        variant="secondary"
                        size="sm"
                        className={`w-12 h-12 flex items-center justify-center rounded-full p-0`}
                        aria-pressed={favorites.includes(product._id)}
                      >
                        <Heart
                          size={20}
                          className={
                            favorites.includes(product._id)
                              ? "text-[var(--accent-orange)] fill-[var(--accent-orange)]"
                              : "text-gray-400"
                          }
                        />
                      </Button>
                      <Button
                        onClick={() => setShowAddToGroupFor(product._id)}
                        variant="outline"
                        size="sm"
                      >
                        Добавить в группу
                      </Button>
                    </div>
                    <a
                      href={`/products/${product._id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Подробнее
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        {/* Рекомендации */}
        <RecommendationSection
          products={mockProducts.slice(0, 6)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />

        {/* Группы продуктов */}
        <ProductGroups />
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

        {/* DynamicGoals modal removed: functionality moved into ProductSearch filters */}
      </div>
    </div>
  );
}
