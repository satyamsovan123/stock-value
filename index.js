// index.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
const PORT = process.env.PORT || 3000;

const MONEYCONTROL_URL =
  "https://api.moneycontrol.com/mcapi/v1/stock/get-stock-price" +
  "?scIdList=KJA,MBP02,MVI,SVG01,VIL02&scId=KJA";

const ANGELONE_URL =
  "https://kp-hl-httpapi-prod.angelone.in/pricechart/day" +
  "?co_code=67411.0&stock_exchange=BSE";

async function fetchMoneyControl() {
  const resp = await axios.get(MONEYCONTROL_URL, { timeout: 5000 });
  const j = resp.data;
  if (j.success === 1 && Array.isArray(j.data) && j.data.length) {
    const d = j.data[0];
    if (d.lastPrice !== "-" && d.perChange !== "-") {
      return {
        lastPrice: parseFloat(d.lastPrice),
        percentageChange: parseFloat(d.perChange),
      };
    }
  }
  return null;
}

async function fetchAngelOne() {
  const resp = await axios.get(ANGELONE_URL, { timeout: 5000 });
  const j = resp.data;
  if (j.success && Array.isArray(j.data) && j.data.length) {
    const lastTick = j.data[j.data.length - 1];
    return {
      // companyName: "Elitecon International",
      companyName: "BSE",
      lastPrice: parseFloat(lastTick.price),
      percentageChange: 0,
    };
  }
  return null;
}

app.get("/price", async (req, res) => {
  try {
    let info = await fetchMoneyControl();
    if (!info) {
      info = await fetchAngelOne();
    }

    const lastPrice = info?.lastPrice ?? 0;
    const percentageChange = info?.percentageChange ?? 0;

    res.json({
      // companyName: "Elitecon International",
      companyName: "BSE",
      lastPrice: parseFloat(lastPrice.toFixed(2)),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      companyName: "Elitecon International",
      lastPrice: 0,
      percentageChange: 0,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Stock price API listening on http://localhost:${PORT}`);
});
