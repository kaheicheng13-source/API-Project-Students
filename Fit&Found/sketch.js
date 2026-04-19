let apiKey = "d10a824fa9c78242391e8a90545c84b2";

let cityInput;
let findBtn;
let weatherResult;
let unitToggle;

let unit = "metric"; // default Celsius

let bgX = 0;
let bgY = 0;

function setup() {
  noCanvas();

  cityInput = select("#cityInput");
  findBtn = select("#findBtn");
  weatherResult = select("#weatherResult");
  unitToggle = select("#unitToggle");

  findBtn.mousePressed(fetchWeather);
  unitToggle.mousePressed(toggleUnit);
}

function draw() {
  bgX += 0.15;
  bgY += 0.08;

  let body = select("#pageBody");
  body.style("background-position", bgX + "px " + bgY + "px");
}

function toggleUnit() {
  if (unit === "metric") {
    unit = "imperial";
    unitToggle.html("Switch to °C");
  } else {
    unit = "metric";
    unitToggle.html("Switch to °F");
  }
}

function fetchWeather() {
  let city = cityInput.value();

  if (city === "") {
    weatherResult.html("⚠️ Please enter a city.");
    return;
  }

  let url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=" + unit +
    "&appid=" +
    apiKey;

  loadJSON(url, displayWeather, handleError);
}

function handleError(err) {
  console.error(err);
  weatherResult.html("❌ Failed to load weather. Check API key or city.");
}

function displayWeather(data) {
  if (data.cod !== 200) {
    weatherResult.html("❌ City not found.");
    return;
  }

  let temp = data.main.temp;
  let condition = data.weather[0].main;

  let unitSymbol = unit === "metric" ? "°C" : "°F";

  // Convert to Celsius for outfit logic
  let tempC = unit === "metric" ? temp : (temp - 32) * (5/9);

  let outfit = suggestOutfit(tempC, condition);

  weatherResult.html(`
    🌡️ Temperature: ${temp}${unitSymbol} <br>
    🌤️ Condition: ${condition} <br><br>
    👗 <strong>Suggested Outfit:</strong><br>
    ${outfit.replace(/\n/g, "<br>")}
  `);
}

function suggestOutfit(temp, condition) {

  if (condition.toLowerCase().includes("rain")) {
    return "🌧️ Rain jacket\n👢 Waterproof boots\n☂️ Umbrella";
  }

  if (condition.toLowerCase().includes("snow")) {
    return "🧥 Heavy winter coat\n🧣 Scarf & gloves\n🥾 Snow boots";
  }

  if (temp <= 0) {
    return "🧥 Heavy coat\n🧤 Gloves\n🥾 Boots";
  } 
  else if (temp <= 15) {
    return "🧥 Jacket or hoodie\n👖 Jeans\n👟 Sneakers";
  } 
  else if (temp <= 25) {
    return "👕 T-shirt\n👖 Light pants\n👟 Casual shoes";
  } 
  else {
    return "☀️ Tank top\n🩳 Shorts\n🩴 Sandals";
  }
}