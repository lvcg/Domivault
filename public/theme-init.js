try {
  const settings = localStorage.getItem("homey-settings");
  const darkMode = settings ? Boolean(JSON.parse(settings).darkMode) : false;
  document.documentElement.classList.toggle("dark", darkMode);
  document.documentElement.dataset.theme = darkMode ? "dark" : "light";
} catch {}
