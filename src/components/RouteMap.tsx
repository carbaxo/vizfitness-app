"use client";

import { useEffect, useRef, useState } from "react";
import type { RoutePoint } from "@/lib/types";

// Mapa real de fondo bajo la ruta usando teselas de OpenStreetMap
// (proyección Web Mercator). Sin claves de API: se calcula el zoom que
// encuadra el recorrido, se colocan las teselas necesarias y se dibuja la
// polilínea encima.

const TILE = 256;
const MAX_ZOOM = 17;
const MIN_ZOOM = 2;
const PAD = 24;

function worldX(lng: number, z: number): number {
  return ((lng + 180) / 360) * TILE * Math.pow(2, z);
}

function worldY(lat: number, z: number): number {
  const clamped = Math.max(-85.051, Math.min(85.051, lat));
  const rad = (clamped * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    TILE *
    Math.pow(2, z)
  );
}

export default function RouteMap({
  route,
  height = 240,
}: {
  route: RoutePoint[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.round(el.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (route.length < 2) return null;

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  let content = null;
  if (width > 0) {
    let z = MIN_ZOOM;
    for (let candidate = MAX_ZOOM; candidate >= MIN_ZOOM; candidate--) {
      const dx = worldX(maxLng, candidate) - worldX(minLng, candidate);
      const dy = worldY(minLat, candidate) - worldY(maxLat, candidate);
      if (dx <= width - 2 * PAD && dy <= height - 2 * PAD) {
        z = candidate;
        break;
      }
    }

    const cx = (worldX(minLng, z) + worldX(maxLng, z)) / 2;
    const cy = (worldY(minLat, z) + worldY(maxLat, z)) / 2;
    const ox = cx - width / 2;
    const oy = cy - height / 2;

    const maxTile = Math.pow(2, z) - 1;
    const tx0 = Math.max(0, Math.floor(ox / TILE));
    const tx1 = Math.min(maxTile, Math.floor((ox + width) / TILE));
    const ty0 = Math.max(0, Math.floor(oy / TILE));
    const ty1 = Math.min(maxTile, Math.floor((oy + height) / TILE));

    const tiles: { x: number; y: number }[] = [];
    for (let tx = tx0; tx <= tx1; tx++) {
      for (let ty = ty0; ty <= ty1; ty++) {
        tiles.push({ x: tx, y: ty });
      }
    }

    const pts = route.map((p) => ({
      x: worldX(p.lng, z) - ox,
      y: worldY(p.lat, z) - oy,
    }));
    const start = pts[0];
    const end = pts[pts.length - 1];

    content = (
      <>
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${z}/${t.x}/${t.y}`}
            src={`https://tile.openstreetmap.org/${z}/${t.x}/${t.y}.png`}
            alt=""
            loading="lazy"
            className="absolute select-none"
            style={{
              left: t.x * TILE - ox,
              top: t.y * TILE - oy,
              width: TILE,
              height: TILE,
              maxWidth: "none",
            }}
            draggable={false}
          />
        ))}
        <svg
          width={width}
          height={height}
          className="absolute left-0 top-0"
          role="img"
          aria-label="Ruta GPS sobre el mapa"
        >
          {/* Halo blanco para que la ruta destaque sobre cualquier mapa */}
          <polyline
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#ffffff"
            strokeWidth={6}
            strokeOpacity={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#FF6F00"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Salida en turquesa y llegada en rojo: los dos extremos se
              distinguen del naranja del recorrido. */}
          <circle cx={start.x} cy={start.y} r={6} fill="#2DC5C9" stroke="#ffffff" strokeWidth={2} />
          <circle cx={end.x} cy={end.y} r={6} fill="#F4685E" stroke="#ffffff" strokeWidth={2} />
        </svg>
        {/* Atribución requerida por la política de OpenStreetMap */}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-1 right-1 rounded bg-white/75 px-1 text-[9px] text-gray-700"
        >
          © OpenStreetMap
        </a>
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl bg-[#d9e2ec]"
      style={{ height }}
    >
      {content}
    </div>
  );
}
