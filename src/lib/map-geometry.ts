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
