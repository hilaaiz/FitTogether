export async function getWeatherFromUserProfile(token) {
  const res = await fetch("http://localhost:5000/weather/current/by-user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  return res.json();
}
