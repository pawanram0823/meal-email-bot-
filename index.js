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
  MON:{breakfast:"Idli · Sambar · Coconut chutney · Eggs",lunch:"Rice · Drumstick sambar · Beans poriyal",dinner:"Chapati · Aloo Matar · Paneer bhurji"},
  TUE:{breakfast:"Dosa · Tomato chutney · Egg bhurji",lunch:"Rice · Vendakkai sambar · Cabbage poriyal",dinner:"Chapati · Jeera Aloo · Dal tadka"},
  WED:{breakfast:"Bread omelette · Toast · Curd",lunch:"Rice · Brinjal sambar · Carrot poriyal",dinner:"Chapati · Bhindi Masala · Egg curry"},
  THU:{breakfast:"Upma · Coconut chutney · Eggs",lunch:"Rice · Pumpkin sambar · Raw banana poriyal",dinner:"Chapati · Methi Aloo · Moong dal"},
  FRI:{breakfast:"Pongal · Sambar · Curd",lunch:"Rice · Drumstick sambar · Beetroot poriyal",dinner:"Chapati · Matar Paneer"},
  SAT:{breakfast:"Egg dosa · Onion tomato chutney",lunch:"Rice · Tomato sambar · Beans poriyal",dinner:"Poori · Aloo Sabzi"},
  SUN:{breakfast:"Idli · Coconut chutney · Omelette",lunch:"Rice · Veg sambar · Cabbage poriyal",dinner:"Chapati · Palak Paneer"},
};

const DAY_NAMES={MON:"Monday",TUE:"Tuesday",WED:"Wednesday",THU:"Thursday",FRI:"Friday",SAT:"Saturday",SUN:"Sunday"};
const DAY_KEYS=["SUN","MON","TUE","WED","THU","FRI","SAT"];

function getTomorrowKey(){
  const t=new Date();
  t.setDate(t.getDate()+1);
  return DAY_KEYS[t.getDay()];
}

function getTodayKey(){
  return DAY_KEYS[new Date().getDay()];
}

// Email templates
function buildFullDayEmail(dayKey){
  const day=MEAL_PLAN[dayKey];
  return `
  <h2>${DAY_NAMES[dayKey]} Meal Plan</h2>
  <p><b>Breakfast:</b> ${day.breakfast}</p>
  <p><b>Lunch:</b> ${day.lunch}</p>
  <p><b>Dinner:</b> ${day.dinner}</p>
  `;
}

function buildDinnerEmail(dayKey){
  const day=MEAL_PLAN[dayKey];
  return `
  <h2>Tonight's Dinner (${DAY_NAMES[dayKey]})</h2>
  <p>${day.dinner}</p>
  `;
}

// Email sender
async function sendEmail(subject,html){
  try{

    const transporter=nodemailer.createTransport({
      host:"smtp.gmail.com",
      port:587,
      secure:false,
      auth:{
        user:process.env.GMAIL_USER,
        pass:process.env.GMAIL_APP_PASSWORD
      }
    });

    const info=await transporter.sendMail({
      from:`Meal Planner <${process.env.GMAIL_USER}>`,
      to:RECIPIENTS.join(","),
      subject,
      html
    });

    console.log("Email sent:",info.response);

  }catch(err){
    console.log("EMAIL ERROR:",err.message);
  }
}

// Cron jobs
cron.schedule("30 15 * * *",()=>{
  const key=getTomorrowKey();
  sendEmail(`Tomorrow's Meals (${DAY_NAMES[key]})`,buildFullDayEmail(key));
});

cron.schedule("30 5 * * *",()=>{
  const key=getTodayKey();
  sendEmail(`Tonight's Dinner (${DAY_NAMES[key]})`,buildDinnerEmail(key));
});

// Manual routes
app.get("/test-evening",(req,res)=>{
  const key=getTomorrowKey();
  sendEmail(`Tomorrow's Meals (${DAY_NAMES[key]})`,buildFullDayEmail(key));
  res.send("Email triggered");
});

app.get("/test-morning",(req,res)=>{
  const key=getTodayKey();
  sendEmail(`Tonight's Dinner (${DAY_NAMES[key]})`,buildDinnerEmail(key));
  res.send("Email triggered");
});

app.get("/",(req,res)=>{
  res.send(`
  <h2>🍽️ Chennai Family Meal Planner</h2>
  <p><a href="/test-evening">Send tomorrow meal plan</a></p>
  <p><a href="/test-morning">Send dinner reminder</a></p>
  `);
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log("Meal planner running"));
