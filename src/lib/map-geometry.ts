export type Country = {
  type: 'Feature';
  properties: { ISO3CD: string; ROMNAM: string };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] };
};
export function project(longitude: number, latitude: number): [number, number] {
  return [(longitude - 28.2) * 130, (5.4 - latitude) * 130];
}
export function countryPath(country: Country) {
  const polygons =
    country.geometry.type === 'Polygon'
      ? [country.geometry.coordinates as number[][][]]
      : (country.geometry.coordinates as number[][][][]);
  return polygons
    .flatMap((polygon) =>
      polygon.map(
        (ring) =>
          ring
            .map(
              ([lon, lat], i) =>
                `${i ? 'L' : 'M'}${project(lon, lat)
                  .map((v) => v.toFixed(2))
                  .join(',')}`,
            )
            .join('') + 'Z',
      ),
    )
    .join('');
}
export function clampZoom(value: number) {
  return Math.max(0.65, Math.min(5, value));
}

export type MapView = { zoom: number; x: number; y: number };
export type MapFrame = { x: number; y: number; width: number; height: number };

// Use the visible SVG frame so the same 25% rule works on narrow screens.
export function mapNeedsReset(view: MapView, frame: MapFrame) {
  const centerX = 550;
  const centerY = 500;
  const dx = view.x + centerX * view.zoom - centerX;
  const dy = view.y + centerY * view.zoom - centerY;
  return Math.abs(dx) >= frame.width * 0.25 || Math.abs(dy) >= frame.height * 0.25;
}
