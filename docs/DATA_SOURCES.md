# Data and map sources

The allowed starting list is the Field Shift challenge resource page:
https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources

All rainfall, temperature, wetness, crop references and maize map results come from the existing backend and its local dataset. The frontend does not add weather, soil, market or yield data. The backend source guide explains NASA POWER, GPM IMERG, FAO GAEZ and GAEZ-linked ECOCROP: https://github.com/ukasha-hacks/agro-field-backend/blob/stage/04-rotation-comparison/docs/DATA_SOURCES.md.

## Country outline

The only added geographic asset is downloaded from a map linked by the listed FAO GAEZ portal. It is not taken from an unrelated boundary provider.

Discovery chain:

1. FAO GAEZ portal: https://gaez.fao.org/
2. Its Country Profile map: https://www.arcgis.com/home/item.html?id=af5a56e3092242cfa543faab7e3f5ed9
3. That map's GAEZ Country Status layer: https://services5.arcgis.com/sjP4Ugu5s0dZWLjd/arcgis/rest/services/GAEZ_Country_Status/FeatureServer/0
4. A one-time GeoJSON download of Uganda and six neighboring countries, shipped as public/maps/country-context.geojson.

The full download URL, retrieval time, SHA-256 and source item metadata are in map-provenance.json. The provider's item metadata did not supply a separate licenseInfo or accessInformation string at retrieval. Preserve this attribution and consult FAO/GAEZ terms when redistributing.

The country outline provides map context only. It does not supply district boundaries, field boundaries, soil observations, rainfall values or a weather surface. Source geometry is simplified for display; do not use it to measure land. Only the four backend sample points are selectable. The selected marker is not a district-wide data claim.

The static maize reference map remains a separate backend image with its 2010 baseline. It is never stretched over the country as if it were an accurate georeferenced layer, and it never changes with replay.

Package documentation and DM Sans are software/design resources, not agricultural datasets. No web map tiles, remote fonts or third-party map service is called by the running app.
