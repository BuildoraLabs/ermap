"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import type { SearchLocation } from "@/components/location-search";

export type MapHospital = {
  name: string;
  longitude: number;
  latitude: number;
};

type MapViewProps = {
  onHospitalSelect: (hospital: MapHospital) => void;
  searchLocation: SearchLocation | null;
};

const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
const northBengaluruBounds: [[number, number], [number, number]] = [[77.53, 13.00], [77.72, 13.15]];

function isHospitalPoi(properties: Record<string, unknown>, layerId: string) {
  const searchable = [
    layerId,
    properties.class,
    properties.subclass,
    properties.category,
    properties.amenity,
    properties.healthcare,
    properties.type
  ].filter((value): value is string => typeof value === "string").join(" ").toLowerCase();

  return searchable.includes("hospital");
}

export default function MapView({ onHospitalSelect, searchLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onHospitalSelectRef = useRef(onHospitalSelect);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    onHospitalSelectRef.current = onHospitalSelect;
  }, [onHospitalSelect]);

  useEffect(() => {
    if (!styleUrl || !containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [77.62, 13.075],
      zoom: 11.8,
      minZoom: 10.5,
      maxZoom: 17,
      bounds: northBengaluruBounds,
      maxBounds: [[77.36, 12.84], [77.91, 13.34]],
      attributionControl: false,
      logoPosition: "bottom-left"
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("error", (event) => {
      if (event.error) setMapError(true);
    });
    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point);
      const feature = features.find((candidate) => {
        const properties = candidate.properties as Record<string, unknown> | undefined;
        const name = properties?.name ?? properties?.["name:en"] ?? properties?.["name:latin"] ?? properties?.name_en;
        return Boolean(
          properties
          && typeof name === "string"
          && name.trim()
          && candidate.layer
          && isHospitalPoi(properties, candidate.layer.id)
        );
      });

      if (!feature?.properties || !feature.layer) return;
      const properties = feature.properties as Record<string, unknown>;
      const name = properties.name ?? properties["name:en"] ?? properties["name:latin"] ?? properties.name_en;
      if (typeof name !== "string") return;

      const coordinates = feature.geometry.type === "Point"
        ? feature.geometry.coordinates
        : [event.lngLat.lng, event.lngLat.lat];

      onHospitalSelectRef.current({
        name,
        longitude: coordinates[0],
        latitude: coordinates[1]
      });
    });
    map.on("mousemove", (event) => {
      const hasHospital = map.queryRenderedFeatures(event.point).some((feature) =>
        feature.properties && feature.layer && isHospitalPoi(
          feature.properties as Record<string, unknown>,
          feature.layer.id
        )
      );
      map.getCanvas().style.cursor = hasHospital ? "pointer" : "";
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!searchLocation) return;
    mapRef.current?.flyTo({
      center: [searchLocation.longitude, searchLocation.latitude],
      zoom: 15.5,
      duration: 1000,
      essential: true
    });
  }, [searchLocation]);

  if (!styleUrl) {
    return (
      <div className="map-setup" role="status">
        <div className="setup-map-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m6 13 12-6 12 6 12-6v28l-12 6-12-6-12 6V13Z" /><path d="m18 7v28m12-22v28" /><path d="M24 14c-4 0-7 3-7 7 0 5 7 12 7 12s7-7 7-12c0-4-3-7-7-7Z" /><circle cx="24" cy="21" r="2" /></svg></div>
        <p className="setup-eyebrow">MAP CONFIGURATION NEEDED</p>
        <h2>Connect a map style to explore</h2>
        <p>Set <code>NEXT_PUBLIC_MAP_STYLE_URL</code> to a MapLibre-compatible style URL, then restart the app.</p>
      </div>
    );
  }

  return (
    <div className="map-canvas-wrap">
      <div ref={containerRef} className="map-canvas" aria-label="Interactive map of North Bengaluru" />
      {mapError && <div className="map-error" role="status">The map style could not be loaded. Check your connection and map style URL.</div>}
    </div>
  );
}
