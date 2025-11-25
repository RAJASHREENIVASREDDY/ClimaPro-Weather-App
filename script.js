document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "647a6a7032f52953ca339c478609a06a";

  // Elements
  const searchForm = document.getElementById("searchForm");
  const cityInput = document.getElementById("cityInput");
  const searchBtn = document.getElementById("searchBtn");

  const weatherCard = document.getElementById("weatherCard");
  const cityName = document.getElementById("cityName");
  const weatherIcon = document.getElementById("weatherIcon");
  const temperature = document.getElementById("temperature");
  const description = document.getElementById("description");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const feels = document.getElementById("feels");

  const errorMessage = document.getElementById("errorMessage");
  const status = document.getElementById("status");
  const openMap = document.getElementById("openMap");
  const saveBtn = document.getElementById("saveBtn");

  // Helpers
  function setStatus(text) {
    status.classList.remove("hidden");
    status.textContent = text;
    setTimeout(() => status.classList.add("hidden"), 1800);
  }

  function showError(text = "City not found — try again.") {
    weatherCard.classList.add("hidden");
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = text;
  }

  function showCard() {
    errorMessage.classList.add("hidden");
    weatherCard.classList.remove("hidden");
    weatherCard.classList.add("fade");
  }

  // Debounce to prevent accidental rapid calls
  let debounceTimer = null;
  function debounce(fn, delay = 450) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Fetch weather
  async function fetchWeather(q) {
    setStatus("Fetching weather...");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      q
    )}&units=metric&appid=${API_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      return data;
    } catch (err) {
      throw err;
    }
  }

  // Update UI
  function updateUI(data) {
    const { name, main, weather, wind: windInfo, coord } = data;
    cityName.textContent = `${name}`;
    temperature.textContent = `${Math.round(main.temp)}°C`;
    description.textContent = weather[0].description;
    humidity.textContent = `${main.humidity}%`;
    wind.textContent = `${windInfo.speed} m/s`;
    if (feels) feels.textContent = `${Math.round(main.feels_like)}°C`;

    const iconCode = weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = weather[0].description || "weather icon";

    // Open map link
    openMap.href = `https://www.google.com/maps/search/?api=1&query=${coord.lat},${coord.lon}`;
    showCard();
    setStatus("Updated ✔");
  }

  // Save preset to localStorage (simple example)
  function savePreset() {
    const city = cityInput.value.trim();
    if (!city) return setStatus("Type a city to save");
    localStorage.setItem("clima_saved_city", city);
    setStatus("Preset saved");
  }

  function loadPreset() {
    const saved = localStorage.getItem("clima_saved_city");
    if (saved) {
      cityInput.value = saved;
      // Optionally auto-fetch on load:
      // handleSearch(saved);
    }
  }

  // Main search handler (debounced)
  const handleSearch = debounce(async (q) => {
    if (!q) return;
    try {
      const data = await fetchWeather(q);
      updateUI(data);
    } catch (err) {
      showError();
    }
  }, 450);

  // Events
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = cityInput.value.trim();
    if (!q) return;
    handleSearch(q);
  });

  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    savePreset();
  });

  // Load preset on start
  loadPreset();
});
