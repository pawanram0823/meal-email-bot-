const nodemailer = require("nodemailer");
const cron = require("node-cron");
const express = require("express");

const app = express();

// Recipients
const RECIPIENTS = [
  process.env.GMAIL_USER,
  "preethilingam@gmail.com",
  "aarnavvenkat06@gmail.com",
];

// Meal plan
const MEAL_PLAN = {
  MON: {
    breakfast: "Idli (4 pcs) · Sambar · Coconut chutney · 2 boiled eggs",
    lunch: "Rice · Drumstick sambar · Beans poriyal · Pepper rasam · Moong dal",
    dinner: "Chapati (3 pcs) · Aloo Matar · Paneer bhurji",
  },
  TUE: {
    breakfast: "Dosa (2 pcs) · Tomato chutney · Egg bhurji",
    lunch: "Rice · Vendakkai sambar · Cabbage poriyal · Tomato rasam",
    dinner: "Chapati (3 pcs) · Jeera Aloo · Dal tadka",
  },
  WED: {
    breakfast: "Bread omelette · Toast · Curd",
    lunch: "Rice · Brinjal sambar · Carrot poriyal · Lemon rasam",
    dinner: "Chapati (3 pcs) · Bhindi Masala · Egg curry",
  },
  THU: {
    breakfast: "Upma · Coconut chutney · Boiled eggs",
    lunch: "Rice · Pumpkin sambar · Raw banana poriyal · Garlic rasam",
    dinner: "Chapati (3 pcs) · Methi Aloo · Moong dal",
  },
  FRI: {
    breakfast: "Pongal · Sambar · Curd",
    lunch: "Rice · Drumstick sambar · Beetroot poriyal · Tomato rasam",
    dinner: "Chapati (3 pcs) · Matar Paneer",
  },
  SAT: {
    breakfast: "Egg dosa · Onion tomato chutney",
    lunch: "Rice · Tomato sambar · Beans poriyal · Pepper rasam",
    dinner: "Poori · Aloo Sabzi · Boiled egg",
  },
  SUN: {
    breakfast: "Idli · Tiffin sambar · Coconut chutney · Omelette",
    lunch: "Rice · Mixed veg sambar · Cabbage poriyal · Lemon rasam",
    dinner: "Chapati · Palak Paneer",
  },
};

const DAY_NAMES = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTomorrowKey() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return DAY_KEYS[t.getDay()];
}

function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

// Full meal email
function buildFullDayEmail(dayKey) {
  const day = MEAL_PLAN[dayKey];
  return `
  <h2>${DAY_NAMES[dayKey]} Meal Plan</h2>
  <p><b>Breakfast:</b> ${day.breakfast}</p>
  <p><b>Lunch:</b> ${day.lunch}</p>
  <p><b>Dinner:</b> ${day.dinner}</p>
  `;
}

// Dinner email
function buildDinnerEmail(dayKey) {
  const day = MEAL_PLAN[dayKey];
  return `
  <h2>Tonight's Dinner (${DAY_NAMES[dayKey]})</h2>
  <p>${day.dinner}</p>
  `;
}

// Send email
async function sendEmail(subject, html) {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"Meal Planner 🍽️" <${process.env.GMAIL_USER}>`,
      to: RECIPIENTS.join(", "),
      subject,
      html
    });

    console.log("Email sent:", info.response);

  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
  }
}

// 9pm cron (next day meals)
cron.schedule("30 15 * * *", async () => {
  const key = getTomorrowKey();
  await sendEmail(
    `🍽️ Tomorrow's meals — ${DAY_NAMES[key]}`,
    buildFullDayEmail(key)
  );
});

// 11am cron (dinner reminder)
cron.schedule("30 5 * * *", async () => {
  const key = getTodayKey();
  await sendEmail(
    `🌙 Tonight's dinner — ${DAY_NAMES[key]}`,
    buildDinnerEmail(key)
  );
});

// Manual trigger routes
app.get("/test-evening", async (req, res) => {
  const key = getTomorrowKey();
  await sendEmail(
    `🍽️ Tomorrow's meals — ${DAY_NAMES[key]}`,
    buildFullDayEmail(key)
  );
  res.send("Email triggered");
});

app.get("/test-morning", async (req, res) => {
  const key = getTodayKey();
  await sendEmail(
    `🌙 Tonight's dinner — ${DAY_NAMES[key]}`,
    buildDinnerEmail(key)
  );
  res.send("Email triggered");
});

app.get("/", (req, res) => {
  res.send(`
  <h2>🍽️ Chennai Family Meal Planner</h2>
  <p><a href="/test-evening">Send tomorrow meal plan</a></p>
  <p><a href="/test-morning">Send dinner reminder</a></p>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Meal planner running"));
