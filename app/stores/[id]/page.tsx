"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductSearch from "@/components/dashboard/ProductSearch";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { useToasts } from "@/components/ui/toast";

interface Store {
  _id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  hours: {
    open: string;
    close: string;
    days: string;
  };
  departments: string[];
}

export default function StorePage() {
  const params = useParams();
  const { updateUser, user } = useAuth();
  const toasts = useToasts();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`/api/stores/${params.id}`);
        const data = await res.json();
        setStore(data.store);
      } catch (error) {
        console.error("Error fetching store:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
    const loadProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const p = await fetch(`/api/products?storeId=${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const jd = await p.json();
        const prods = jd.products || jd || [];
        setProducts(prods);
        setAllProducts(prods);
        setSearchResults(prods);
      } catch (e) {
        console.error(e);
      }
    };
    loadProducts();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--light-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о магазине...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen jungle-bg leaf-pattern flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--dark-green)] mb-4">
            Магазин не найден
          </h1>
          <Link href="/dashboard" className="btn-primary">
            Вернуться в дашборд
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen jungle-bg leaf-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Хлебные крошки */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/dashboard" className="hover:text-[var(--light-green)]">
            Дашборд
          </Link>
          <span>›</span>
          <span className="text-[var(--dark-green)]">{store.name}</span>
        </nav>

        <div className="card p-8">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-[var(--dark-green)] mb-4 font-serif">
              {store.name}
            </h1>
            <p className="text-xl text-gray-700">{store.address}</p>
          </div>

          <div className="mb-8">
            {(user as any)?.selectedStore &&
            String((user as any).selectedStore) === String(params.id) ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    (async () => {
                      try {
                        const token = localStorage.getItem("token");
                        if (!token) {
                          window.location.href = "/login";
                          return;
                        }
                        const res = await fetch("/api/user/store", {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error("fail");
                        const jd = await res.json();
                        if (jd.user && updateUser) updateUser(jd.user);
                        toasts.add("Выбор магазина отменён", "success");
                        window.location.reload();
                      } catch (e) {
                        console.error(e);
                        toasts.add(
                          "Ошибка при отмене выбора магазина",
                          "error"
                        );
                      }
                    })();
                  }}
                  className="btn-destructive px-4 py-2 mt-2"
                >
                  Отменить выбор
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    (async () => {
                      try {
                        const token = localStorage.getItem("token");
                        if (!token) {
                          window.location.href = "/login";
                          return;
                        }
                        const res = await fetch("/api/user/store", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            storeId: params.id,
                            storeName: store?.name || null,
                          }),
                        });
                        if (!res.ok) throw new Error("fail");
                        const jd = await res.json();
                        if (jd.user && updateUser) updateUser(jd.user);
                        toasts.add("Магазин выбран", "success");
                      } catch (e) {
                        console.error(e);
                        toasts.add("Ошибка при выборе магазина", "error");
                      }
                    })();
                  }}
                  className="btn-primary px-4 py-2 mt-2"
                >
                  Выбрать магазин
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Информация о магазине */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
                  Контактная информация
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-medium">Телефон</div>
                      <div className="text-gray-600">{store.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🕒</span>
                    <div>
                      <div className="font-medium">Часы работы</div>
                      <div className="text-gray-600">
                        {store.hours.days}: {store.hours.open} -{" "}
                        {store.hours.close}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Отделы магазина */}
              <div>
                <h2 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
                  Отделы магазина
                </h2>
                <div className="flex flex-wrap gap-2">
                  {store.departments.map((dept) => (
                    <span
                      key={dept}
                      className="px-3 py-2 bg-[var(--light-green)]/20 text-[var(--dark-green)] rounded-lg"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Карта (заглушка) */}
            <Link
              href={`/map?storeId=${params.id}`}
              className="bg-gray-200 rounded-xl flex items-center justify-center min-h-[300px] hover:shadow-md transition-shadow bg-cover ring-2 ring-[#8bc554]"
              style={{backgroundImage: 'url("/map.png")'}}
            >
              <div className="w-full h-full flex justify-center items-center flex-col rounded-xl text-center p-6 backdrop-blur-xs">
                <div className="text-4xl mb-4">🗺️</div>
                <p className="text-gray-600">Карта магазина</p>
                <p className="text-sm text-gray-500 mt-2">
                  Нажмите, чтобы открыть подробную карту магазина
                </p>
              </div>
            </Link>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 p-6 bg-[var(--cream-white)] rounded-xl">
            <h3 className="text-xl font-bold text-[var(--dark-green)] mb-3 font-serif">
              О магазине
            </h3>
            <p className="text-gray-700">
              {store.name} предлагает широкий ассортимент качественных продуктов
              для здорового питания. Мы тщательно отбираем поставщиков и
              гарантируем свежесть всех товаров. В нашем магазине вы найдете все
              необходимое для соблюдения вашей диеты и здорового образа жизни.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/dashboard" className="btn-primary">
              Назад к поиску продуктов
            </Link>
          </div>

          {/* Products list with selection */}
          <div className="mt-8">
            <ProductSearch
              onSearchResults={setSearchResults}
              products={allProducts}
              hasDiabetes={
                !!user?.preferences?.healthConditions?.includes("diabetes")
              }
            />

            <div className="mt-6 card p-6">
              <h3 className="text-lg font-bold mb-3">Продукты магазина</h3>
              {searchResults.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Нет продуктов в соответствии с текущими фильтрами
                </div>
              ) : (
                <div className="flex flex-wrap gap-5">
                  {searchResults.map((prod: any) => (
                    <ProductCard key={prod._id || prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
