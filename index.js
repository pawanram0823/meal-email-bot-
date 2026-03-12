import express from "express";
import nodemailer from "nodemailer";
import cron from "node-cron";

const app = express();
const PORT = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mealPlan = `
Today's Meal Plan

Breakfast: Eggs and toast
Lunch: Rice, dal, vegetables
Snack: Fruit or nuts
Dinner: Chapati with paneer or chicken
`;

async function sendMealEmail() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Your Daily Meal Plan",
      text: mealPlan
    });

    console.log("Meal email sent");
  } catch (error) {
    console.log(error);
  }
}

cron.schedule("0 8 * * *", () => {
  console.log("Sending meal email");
  sendMealEmail();
});

app.get("/", (req, res) => {
  res.send("Meal email bot is running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
