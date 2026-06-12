/**
 * Checks if a location object represents a valid GeoJSON Point location.
 * @param {object} location - The location object.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidGeoJsonPoint = (location) => {
  return !!(
    location &&
    location.coordinates &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === 'number' &&
    typeof location.coordinates[1] === 'number'
  );
};

/**
 * Translates GeoJSON location coordinates [longitude, latitude] into Leaflet [latitude, longitude] positions.
 * Returns null if location is invalid.
 * @param {object} location - The location object.
 * @returns {[number, number]|null} - The [latitude, longitude] position array, or null.
 */
export const geoJsonToLeafletPosition = (location) => {
  if (isValidGeoJsonPoint(location)) {
    const [lng, lat] = location.coordinates;
    return [lat, lng];
  }
  return null;
};

/**
 * Stringifies location coordinates.
 * @param {object} location - The location object.
 * @returns {string} - Coordinate string.
 */
export const formatCoordinates = (location) => {
  if (isValidGeoJsonPoint(location)) {
    const [lng, lat] = location.coordinates;
    return `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  }
  return 'N/A';
};
