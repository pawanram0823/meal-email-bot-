const nodemailer = require("nodemailer");
const cron = require("node-cron");
const express = require("express");

const app = express();

// ─── Recipients ──────────────────────────────────────────────────────────────
const RECIPIENTS = [
  process.env.GMAIL_USER,
  "preethilingam@gmail.com",
  "aarnavvenkat06@gmail.com",
];

// ─── Your family meal plan ───────────────────────────────────────────────────
const MEAL_PLAN = {
  MON: {
    breakfast: "Idli (4 pcs) · Sambar · Coconut chutney · 2 boiled eggs",
    lunch: "Rice · Drumstick sambar · Beans poriyal · Pepper rasam · Moong dal",
    dinner: "Chapati (3 pcs) · Aloo Matar · Paneer bhurji (small)",
  },
  TUE: {
    breakfast: "Dosa (2 pcs) · Tomato chutney · Egg bhurji (2 eggs)",
    lunch: "Rice · Vendakkai sambar · Cabbage poriyal · Tomato rasam · Chana dal",
    dinner: "Chapati (3 pcs) · Jeera Aloo · Dal tadka",
  },
  WED: {
    breakfast: "Bread omelette (2 eggs) · Toast · Greek yogurt / curd",
    lunch: "Rice · Brinjal sambar · Carrot poriyal · Lemon rasam · Toor dal",
    dinner: "Chapati (3 pcs) · Bhindi Masala · Egg curry (2 eggs)",
  },
  THU: {
    breakfast: "Upma · Coconut chutney · Boiled eggs (2 pcs)",
    lunch: "Rice · Pumpkin sambar · Raw banana poriyal · Garlic rasam · Rajma",
    dinner: "Chapati (3 pcs) · Methi Aloo · Moong dal",
  },
  FRI: {
    breakfast: "Pongal (moong dal) · Sambar · Curd / yogurt",
    lunch: "Rice · Drumstick + pearl onion sambar · Beetroot poriyal · Tomato rasam · Masoor dal",
    dinner: "Chapati (3 pcs) · Matar Paneer",
  },
  SAT: {
    breakfast: "Egg dosa (2 eggs) · Onion tomato chutney",
    lunch: "Rice · Tomato sambar · Beans poriyal · Pepper rasam · Chana dal",
    dinner: "Poori (4 pcs) · Aloo Sabzi · Boiled egg (1-2 pcs)",
  },
  SUN: {
    breakfast: "Idli (4 pcs) · Tiffin sambar · Coconut chutney · Egg omelette (2 eggs)",
    lunch: "Rice · Mixed vegetable sambar · Cabbage poriyal · Lemon rasam · Paneer sabzi / tofu",
    dinner: "Chapati (3 pcs) · Palak Paneer",
  },
};

const DAY_NAMES = {
  MON: "Monday", TUE: "Tuesday", WED: "Wednesday",
  THU: "Thursday", FRI: "Friday", SAT: "Saturday", SUN: "Sunday",
};
const DAY_KEYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getTomorrowKey() {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return DAY_KEYS[t.getDay()];
}
function getTodayKey() {
  return DAY_KEYS[new Date().getDay()];
}

// ─── Full day email (9pm — next day planning) ────────────────────────────────
function buildFullDayEmail(dayKey, label) {
  const day = MEAL_PLAN[dayKey];
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f9f5f0;margin:0;padding:20px}
  .card{background:white;border-radius:12px;max-width:480px;margin:0 auto;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
  .header{background:#2d6a4f;color:white;padding:24px;text-align:center}
  .header h1{margin:0;font-size:22px}
  .header p{margin:6px 0 0;opacity:.85;font-size:14px}
  .meal{padding:18px 24px;border-bottom:1px solid #f0ebe4}
  .meal:last-child{border-bottom:none}
  .meal-label{font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#2d6a4f;margin-bottom:6px}
  .meal-text{font-size:15px;color:#333;line-height:1.5}
  .footer{background:#f0ebe4;text-align:center;padding:14px;font-size:12px;color:#888}
</style></head><body>
<div class="card">
  <div class="header"><h1>🍽️ ${label}'s Full Plan</h1><p>${DAY_NAMES[dayKey]} · Chennai Family</p></div>
  <div class="meal"><div class="meal-label">☀️ Breakfast</div><div class="meal-text">${day.breakfast}</div></div>
  <div class="meal"><div class="meal-label">🌿 Lunch</div><div class="meal-text">${day.lunch}</div></div>
  <div class="meal"><div class="meal-label">🌙 Dinner</div><div class="meal-text">${day.dinner}</div></div>
  <div class="footer">Plan ahead · Chennai Family Meal Planner</div>
</div></body></html>`;
}

// ─── Dinner only email (11am — cook nudge) ───────────────────────────────────
function buildDinnerEmail(dayKey) {
  const day = MEAL_PLAN[dayKey];
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f9f5f0;margin:0;padding:20px}
  .card{background:white;border-radius:12px;max-width:480px;margin:0 auto;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
  .header{background:#b5451b;color:white;padding:24px;text-align:center}
  .header h1{margin:0;font-size:22px}
  .header p{margin:6px 0 0;opacity:.85;font-size:14px}
  .meal{padding:24px}
  .meal-label{font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#b5451b;margin-bottom:8px}
  .meal-text{font-size:17px;color:#333;line-height:1.5}
  .footer{background:#f0ebe4;text-align:center;padding:14px;font-size:12px;color:#888}
</style></head><body>
<div class="card">
  <div class="header"><h1>🌙 Tonight's Dinner</h1><p>${DAY_NAMES[dayKey]} · Chennai Family</p></div>
  <div class="meal">
    <div class="meal-label">On the menu</div>
    <div class="meal-text">${day.dinner}</div>
  </div>
  <div class="footer">Cook arrives soon · Chennai Family Meal Planner</div>
</div></body></html>`;
}

// ─── Send email ───────────────────────────────────────────────────────────────
async function sendEmail(subject, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  await transporter.sendMail({
    from: `"Meal Planner 🍽️" <${process.env.GMAIL_USER}>`,
    to: RECIPIENTS.join(", "),
    subject,
    html,
  });
  console.log(`✅ Email sent: ${subject}`);
}

// ─── Cron 1: 9pm IST (15:30 UTC) — full next day plan ───────────────────────
cron.schedule("30 15 * * *", async () => {
  try {
    const key = getTomorrowKey();
    await sendEmail(
      `🍽️ Tomorrow's meals — ${DAY_NAMES[key]}`,
      buildFullDayEmail(key, "Tomorrow")
    );
  } catch (err) { console.error("9pm cron error:", err.message); }
});

// ─── Cron 2: 11am IST (05:30 UTC) — dinner nudge ────────────────────────────
cron.schedule("30 5 * * *", async () => {
  try {
    const key = getTodayKey();
    await sendEmail(
      `🌙 Tonight's dinner — ${DAY_NAMES[key]}`,
      buildDinnerEmail(key)
    );
  } catch (err) { console.error("11am cron error:", err.message); }
});

// ─── Manual triggers ──────────────────────────────────────────────────────────
app.get("/test-evening", async (req, res) => {
  try {
    const key = getTomorrowKey();
    await sendEmail(`🍽️ Tomorrow's meals — ${DAY_NAMES[key]}`, buildFullDayEmail(key, "Tomorrow"));
    res.send("✅ 9pm email sent! Check all inboxes.");
  } catch (err) { res.status(500).send("❌ " + err.message); }
});

app.get("/test-morning", async (req, res) => {
  try {
    const key = getTodayKey();
    await sendEmail(`🌙 Tonight's dinner — ${DAY_NAMES[key]}`, buildDinnerEmail(key));
    res.send("✅ 11am email sent! Check all inboxes.");
  } catch (err) { res.status(500).send("❌ " + err.message); }
});

app.get("/", (req, res) => {
  res.send(`
    <h2>🍽️ Chennai Family Meal Planner</h2>
    <p><b>Automatic schedule:</b></p>
    <p>📧 9pm every night → Full next day plan (breakfast, lunch, dinner)</p>
    <p>📧 11am every day → Tonight's dinner reminder</p>
    <hr>
    <p><b>Test manually:</b></p>
    <p><a href="/test-evening">Send 9pm email now</a></p>
    <p><a href="/test-morning">Send 11am email now</a></p>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Meal planner running on port ${PORT}`));
