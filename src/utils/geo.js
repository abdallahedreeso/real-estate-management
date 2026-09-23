export const validPoint = (latitude, longitude) =>
  latitude != null && longitude != null && latitude !== "" && longitude !== "" &&
  Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) &&
  Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180;

export const distanceKm = (from, to) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(to[0] - from[0]);
  const longitudeDelta = radians(to[1] - from[1]);
  const arc = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
};
