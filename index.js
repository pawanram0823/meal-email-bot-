import express from "express";
import nodemailer from "nodemailer";
import cron from "node-cron";

const app = express();
const PORT = process.env.PORT || 3000;

// transporter for gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// your meal plan
const mealPlan = `
🍽 Daily Meal Plan

Breakfast:
Oats with fruit + coffee

Lunch:
Rice, dal, vegetable sabzi, curd

Snack:
Fruit or nuts

Dinner:
Chapati + paneer/chicken + salad
`;

// function to send email
async function sendMealEmail() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Your Daily Meal Plan",
      text: mealPlan
    });

    console.log("Meal email sent!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// send every day at 8 AM
cron.schedule("0 8 * * *", () => {
  console.log("Sending daily meal email...");
  sendMealEmail();
});

// simple route so render keeps service alive
app.get("/", (req, res) => {
  res.send("Meal Email Bot Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
