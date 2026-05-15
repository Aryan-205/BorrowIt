"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapItem = { id: string; dailyRate: number; lat: number; lng: number };

const DEFAULT_CENTER: [number, number] = [28.632932, 77.22033];
const DEFAULT_ZOOM = 13;

function isValidCoord(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

function priceMarkerIcon(price: number, highlighted: boolean) {
  const styles = highlighted
    ? "background:#000;color:#fff;"
    : "background:#fff;color:#000;border:1px solid rgba(0,0,0,0.1);";

  return L.divIcon({
    className: "",
    html: `<span style="display:inline-block;border-radius:9999px;padding:4px 10px;font-size:12px;font-weight:700;line-height:1;box-shadow:0 4px 12px rgba(0,0,0,0.18);white-space:nowrap;${styles}">$${price}</span>`,
    iconSize: [56, 28],
    iconAnchor: [28, 14],
  });
}

function FitBounds({ items }: { items: MapItem[] }) {
  const map = useMap();

  useEffect(() => {
    const points = items.filter((item) => isValidCoord(item.lat, item.lng));
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((item) => [item.lat, item.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 });
  }, [items, map]);

  return null;
}

function tileLayerUrl() {
  const apiKey = process.env.NEXT_PUBLIC_STADIA_API_KEY;
  if (apiKey) {
    return `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${apiKey}`;
  }
  return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
}

function MapReady({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

/** Leaflet does not reflow tiles when the container resizes (e.g. hub collapse). */
function MapResizeObserver({ layoutKey }: { layoutKey?: boolean }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const target = container.parentElement ?? container;

    const invalidate = () => {
      map.invalidateSize({ animate: false, pan: false });
    };

    invalidate();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(invalidate);
    });
    const delayed = window.setTimeout(invalidate, 200);

    const observer = new ResizeObserver(() => {
      invalidate();
    });
    observer.observe(target);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(delayed);
      observer.disconnect();
    };
  }, [map, layoutKey]);

  return null;
}

export default function DiscoverMapView({
  items,
  onMapReady,
  currentLocation,
  layoutKey,
}: {
  items: MapItem[];
  onMapReady?: (map: L.Map) => void;
  currentLocation?: [number, number];
  /** Toggle when parent layout changes so tiles reflow. */
  layoutKey?: boolean;
}) {
  const markers = useMemo(
    () => items.filter((item) => isValidCoord(item.lat, item.lng)).slice(0, 50),
    [items],
  );

  return (
    <MapContainer
      center={currentLocation || DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full rounded-3xl"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url={tileLayerUrl()} />
      {onMapReady ? <MapReady onMapReady={onMapReady} /> : null}
      <MapResizeObserver layoutKey={layoutKey} />
      <FitBounds items={items} />
      {markers.map((item, index) => (
        <Marker
          key={item.id}
          position={[item.lat, item.lng]}
          icon={priceMarkerIcon(item.dailyRate, index % 4 === 0)}
        />
      ))}
    </MapContainer>
  );
}
