"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { findShortestPathWithMandatoryPoints } from "@/lib/map";
import { storeMap } from "@/lib/data/storeMap";
import { Product } from "@/types";

export default function MapPage() {
  const search = useSearchParams();
  const storeId = search?.get("storeId") || "";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [includeEntrance, setIncludeEntrance] = useState<boolean>(true);
  const [includeExit, setIncludeExit] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const route = useMemo(() => {
    if (!selectedProducts || selectedProducts.length === 0) return undefined;

    const productPoints = Array.from(
      new Set(
        selectedProducts
          .map((prod) =>
            prod.stores?.find((s: any) => String(s.storeId) === String(storeId))?.point ?? ""
          )
          .filter((p) => p)
      )
    );

    // Build ordered mandatory array: products, with optional entrance at the start and exit at the end.
    const mandatoryArray: string[] = [...productPoints];
    // remove duplicates but preserve order (Set used only for dedupe)
    const deduped = Array.from(new Set(mandatoryArray));

    if (deduped.length < 1) return undefined;

    if (includeEntrance) deduped.unshift("Вход");
    if (includeExit) deduped.push("Выход");


    const rawRoute = findShortestPathWithMandatoryPoints(storeMap, deduped);
    return rawRoute;
  }, [selectedProducts, includeEntrance, includeExit, storeId]);

  function drawStyledArrow(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) {
    const headLength = 12;
    const headWidth = 8;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitDx = dx / length;
    const unitDy = dy / length;

    const lineEndX = toX - unitDx * headLength;
    const lineEndY = toY - unitDy * headLength;

    ctx.strokeStyle = "#F76711";
    ctx.fillStyle = "#F76711";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();

    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle) - headWidth * Math.sin(angle),
      toY - headLength * Math.sin(angle) + headWidth * Math.cos(angle)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle) + headWidth * Math.sin(angle),
      toY - headLength * Math.sin(angle) - headWidth * Math.cos(angle)
    );
    ctx.closePath();
    ctx.fill();
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // try to load cart first
        let cartIds: string[] = [];
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const jd = await res.json();
            const items = jd.cart.items || jd.cart || [];
            cartIds = items
              .map((it: any) => String(it.productId || it._id || it.id))
              .filter(Boolean);
          }
        } catch (e) {
          // ignore
          console.log("err", e);
        }

        // fallback to localStorage
        if (!cartIds || cartIds.length === 0) {
          try {
            const raw = localStorage.getItem("cart");
            if (raw) {
              const parsed = JSON.parse(raw);
              // parsed may be array of { productId } or ids
              if (Array.isArray(parsed)) {
                cartIds = parsed
                  .map((it: any) =>
                    String(it.productId || it._id || it.id || it)
                  )
                  .filter(Boolean);
              }
            }
          } catch (e) {}
        }

        if (cartIds.length === 0) {
          setProducts([]);
          setSelectedProducts([]);
          setLoading(false);
          return;
        }

        // fetch products available in this store and also in cart
        const idsParam = cartIds.join(",");
        const url = `/api/products?storeId=${encodeURIComponent(
          storeId
        )}&ids=${encodeURIComponent(idsParam)}`;
        const pres = await fetch(url);
        if (!pres.ok) {
          setProducts([]);
          setSelectedProducts([]);
          setLoading(false);
          return;
        }
        const pj = await pres.json();
        const prods = pj.products || [];
        // filter products to those available in the current store
        const availableProds = prods.filter((p: any) =>
          (p.stores || []).some((s: any) => String(s.storeId) === String(storeId) && (s.available !== false))
        );
        setProducts(availableProds);
        // by default all selected
        setSelectedProducts(availableProds);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId]);

  useEffect(() => {
    console.log(route)
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 837;
    canvas.height = 632;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = "/map.png";

    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // if no route or route has fewer than 2 points, don't draw route overlays
      if (!route || !Array.isArray((route as any).path) || (route as any).path.length < 2) {
        return;
      }

      const orderIds: string[] = Array.isArray((route as any).orderIds) ? (route as any).orderIds : [];
      (route as any).path.forEach((point: any, index: number) => {
        const cx = point.x + 5;
        const cy = point.y + 5;
        // determine color: if point is in orderIds -> green, otherwise orange
        const isOrdered = orderIds.includes(point.id);
        if (isOrdered) {
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.closePath();
        }
        ctx.fillStyle = "#F76711";
        ctx.fill();
        // subtle stroke for contrast
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff80";
        ctx.stroke();

        if (index > 0) {
          const prevPoint = (route as any).path[index - 1];
          drawStyledArrow(
            ctx,
            prevPoint.x + 5,
            prevPoint.y + 5,
            point.x + 5,
            point.y + 5
          );
        }
      });
    };

    image.onerror = () => {
      console.error("Error loading image");
    };
  }, [route]);

  const toggle = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.map((prod) => prod._id).includes(product._id)
        ? prev.filter((x) => x._id !== product._id)
        : [...prev, product]
    );
  };

  return (
    <div className="min-h-screen jungle-bg leaf-pattern py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-[var(--dark-green)] mb-4 font-serif">
            Карта магазина
          </h1>

          <div className="overflow-auto border rounded-lg p-4 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div style={{ width: 837, height: 632, minWidth: 837 }} className="mx-auto">
              <canvas
                ref={canvasRef}
                className="block w-[837px] h-[632px] rounded-md"
                aria-label="map-canvas"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <Checkbox
                checked={includeEntrance}
                onCheckedChange={(v: any) => setIncludeEntrance(Boolean(v))}
              />
              <span className="text-gray-700">Включить вход</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <Checkbox
                checked={includeExit}
                onCheckedChange={(v: any) => setIncludeExit(Boolean(v))}
              />
              <span className="text-gray-700">Включить выход</span>
            </label>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[var(--dark-green)] mb-3">
              Продукты из корзины, доступные в магазине
            </h2>

            {loading ? (
              <div className="text-gray-600">Загрузка...</div>
            ) : products.length === 0 ? (
              <div className="text-gray-500">
                Нет доступных продуктов из вашей корзины для этого магазина. Для начала, наберите корзину
              </div>
            ) : (
              <div className="grid gap-3">
                {products.map((p: any) => {
                  const id = String(p._id || p.id);
                  const checked = selectedProducts
                    .map((prod) => prod._id)
                    .includes(id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-4 p-3 border rounded-lg bg-[var(--cream-white)]"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(p)}
                        />
                        <img
                          src={p.image || "/products/apples.webp"}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div>
                          <div className="font-medium text-[var(--dark-green)]">
                            {p.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {p.category} • {p.price}₽
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {p.stores?.find(
                          (s: any) => String(s.storeId) === String(storeId)
                        )?.point || "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
