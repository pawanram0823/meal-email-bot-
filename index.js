import express from "express";
import nodemailer from "nodemailer";
import cron from "node-cron";

const app = express();
const PORT = process.env.PORT || 3000;

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Meal plan email
const mealPlan = `
Today's Meal Plan

Breakfast: Eggs and toast
Lunch: Rice, dal, vegetables
Snack: Fruit or nuts
Dinner: Chapati with paneer or chicken
`;

// Function to send email
async function sendMealEmail() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Your Daily Meal Plan",
      text: mealPlan
    });

    console.log("Meal email sent successfully");
  } catch (error) {
    console.log("Error sending email:", error);
  }
}

/*
TEST MODE
This runs every minute so you can confirm emails work
*/
cron.schedule("* * * * *", () => {
  console.log("Sending test meal email...");
  sendMealEmail();
});

// Server route
app.get("/", (req, res) => {
  res.send("Meal email bot is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
