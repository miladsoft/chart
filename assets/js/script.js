let tradingview;
let activeWebSocket = null;

const options = {
  symbol: "Binance:BTCUSDT",
  autosize: true,
  timezone: "Europe/London",
  theme: "Light",
  style: "1",
  locale: "en",
  toolbar_bg: "#f1f3f6",
  enable_publishing: false,
  withdateranges: true,
  hide_side_toolbar: false,
  hide_legend: false,
  timeframe: "1D",
  range: "1D",
  allow_symbol_change: true,
  container_id: "technical-widget",
  studies: ["RSI@tv-basicstudies"],
};
function loadTradingViewWidget() {
  if (tradingview) {
    tradingview.remove();
  }
  tradingview = new TradingView.widget(options);
}

function closeWebSocket() {
  if (activeWebSocket) {
    activeWebSocket.close();
    activeWebSocket = null;
  }
}

function connectWebSocket(symbol) {
  closeWebSocket();
  const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`;
  activeWebSocket = new WebSocket(wsUrl);

  activeWebSocket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const price = parseFloat(data.p).toFixed(2);
    document.title = `${symbol.replace(
      "USDT",
      ""
    )}: ${price} USDT | Technical Chart`;
  };

  activeWebSocket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  activeWebSocket.onclose = function (event) {
    if (!event.wasClean) {
      console.error("WebSocket closed unexpectedly");
    }
  };
}

document.querySelectorAll(".technical-chart-coin > a").forEach(function (el) {
  el.addEventListener("click", function () {
    document.querySelector(".coin-current").classList.remove("coin-current");
    el.classList.add("coin-current");

    const symbol = el.getAttribute("data-symbol");
    options.symbol = `Binance:${symbol}`;
    loadTradingViewWidget();
    connectWebSocket(symbol);
  });
});

document.getElementById("theme-toggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");
  const currentTheme = document.body.classList.contains("dark-theme")
    ? "dark"
    : "light";
  options.theme = currentTheme === "dark" ? "Dark" : "Light";
  localStorage.setItem("theme", currentTheme);
  this.innerText = currentTheme === "dark" ? "Light" : "Dark";
  loadTradingViewWidget();
});

document
  .getElementById("timezone-select")
  .addEventListener("change", function () {
    options.timezone = this.value;
    localStorage.setItem("timezone", this.value);
    loadTradingViewWidget();
  });

window.onload = function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.toggle("dark-theme", savedTheme === "dark");
    options.theme = savedTheme === "dark" ? "Dark" : "Light";
    document.getElementById("theme-toggle").innerText =
      savedTheme === "dark" ? "Light" : "Dark";
  }

  const savedTimezone = localStorage.getItem("timezone");
  if (savedTimezone) {
    document.getElementById("timezone-select").value = savedTimezone;
    options.timezone = savedTimezone;
  }

  loadTradingViewWidget();
  connectWebSocket("BTCUSDT");
};
