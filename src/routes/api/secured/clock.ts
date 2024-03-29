import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
// import mailer from "../../../helpers/mailjet";
import auth from "../../../middlewares/auth";

const api = Router();


function timeDiff(start, end) {
  const [startHour, startMinute] = start.split("h");
  const [endHour, endMinute] = end.split("h");
  let diffHour = endHour - startHour;
  let diffMinute = endMinute - startMinute;
  if (diffHour < 0 && diffMinute < 0) {
    diffHour = 24 + diffHour
    diffHour = diffHour - 1;
  } else if (diffHour < 0 && diffMinute > 0) {
    diffHour = 24 + diffHour
  } else if (diffHour > 0 && diffMinute < 0) {
    diffHour = diffHour - 1;
  } else if (diffHour === 0 && diffMinute < 0) {
    diffHour = 23;
  }
  if (diffMinute < 0) diffMinute = 60 + diffMinute;
  let diffMinuteFinal = diffMinute.toString();
  if (diffMinute < 10) diffMinuteFinal = "0" + diffMinute;
  return `${diffHour}h${diffMinuteFinal}`;
}

async function diffWorkBreak(items) {
  let works = [];
  let breaks = [];
  let haveWork = false;
  let haveBreak = false;

  items.forEach(item => {
    if (item.type === "WORK") {
      works.push(item);
    } else if (item.type === "BREAK") {
      breaks.push(item);
    }
  })

  let totalHW = 0
  let totalMW = 0
  let hoursW = []
  let minutesW = []
  if (works) {
    haveWork = true
    for (let i = 0; i < works?.length; i++) {
      const [h, m] = works[i].item.split('h')
      hoursW.push(h)
      minutesW.push(m)
    }
    for (var h in hoursW) {
      totalHW += parseInt(hoursW[h], 10);
    }
    // for each in minutesW
    for (var m in minutesW) {
      totalMW += parseInt(minutesW[m], 10);
    }
    // If the minutes exceed 60
    if (totalMW >= 60) {
      // Divide minutes by 60 and add result to hours
      totalHW += Math.floor(totalMW / 60);
      // Add remainder of totalMW / 60 to minutes
      totalMW = totalMW % 60;
    }
  }else{
    totalHW = 0
    totalMW = 0
  }

  let totalHB = 0
  let totalMB = 0
  let hoursB = []
  let minutesB = []
  if (breaks) {
    haveBreak = true
    for (let i = 0; i < breaks?.length; i++) {
      const [h, m] = breaks[i].item.split('h')
      hoursB.push(h)
      minutesB.push(m)
    }
    for (var h in hoursB) {
      totalHB += parseInt(hoursB[h], 10);
    }
    // for each in minutesB
    for (var m in minutesB) {
      totalMB += parseInt(minutesB[m], 10);
    }
    // If the minutes exceed 60
    if (totalMB >= 60) {
      // Divide minutes by 60 and add result to hours
      totalHB += Math.floor(totalMB / 60);
      // Add remainder of totalMB / 60 to minutes
      totalMB = totalMB % 60;
    }
  } else{
    totalHB = 0
    totalMB = 0
  }
  
  let newHB = totalHB.toString()
  let newMB = totalMB.toString()
  let newHW = totalHW.toString()
  let newMW = totalMW.toString()

  if (totalMB < 10) {
    newMB = "0" + totalMB
  }
  if (totalMW < 10) {
    newMW = "0" + totalMW
  }
  if(totalMB === 0 ){
    newMB = "00"
  }
  if(totalMW === 0 ){
    newMW = "00"
  } 

  const workTotal = `${newHW}h${newMW}`
  const breakTotal = `${newHB}h${newMB}`

  const diff =  timeDiff(breakTotal, workTotal)

  if(items[0].prisma === "CREATE"){
    await prisma.stats.create({
      data: {
        work: diff,
        break: breakTotal,
        clockId: items[0].clock.id,
      },
    });
  } else if (items[0].prisma === "UPDATE") {
    await prisma.stats.update({
      where: {
        clockId: items[0].clock.id,
      },
      data: {
        work: diff,
        break: breakTotal,
      },
    });
  }
}



// LE LOGIN
api.get("/", async (req, res) => {
  // Our login logic starts here
  try {
    // get all clock where userId = req.user.id
    const clocks = await prisma.clock.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        stats: true,
      },
    });
    res.status(200).json({ error: false, data: clocks });
  } catch (err) {
    console.log(err);
  }
});

api.post("/", async (req, res) => {
  try {
    const clocks = req.body;
    const user = req?.user;
    let message = "";

    // for in clocks
    let stats = []

    for (let i = 0; i < clocks.length; i++) {
      if (clocks[i].id && (clocks[i].start === "" || clocks[i].end === "")) {
        await prisma.clock.delete({
          where: {
            id: clocks[i].id,
          },
        });
      }
      if (clocks[i].id && clocks[i].start !== "" && clocks[i].end !== "") {
        const updated = await prisma.clock.update({
          where: {
            id: clocks[i].id,
          },
          data: {
            name: clocks[i].name,
            year: clocks[i].year,
            month: clocks[i].month,
            week: clocks[i].week,
            day: clocks[i].day,
            type: clocks[i].type,
            start: clocks[i].start,
            end: clocks[i].end,
            order: clocks[i].order,
          },
        });
        const stat = timeDiff(clocks[i].start, clocks[i].end);
        stats.push({clock: updated, item: stat, type: clocks[i].type, id: clocks[i].id, prisma: "UPDATE" });
        
      }
      if (!clocks[i].id && clocks[i].start !== "" && clocks[i].end !== "") {
        const created = await prisma.clock.create({
          data: {
            name: clocks[i].name,
            year: clocks[i].year,
            month: clocks[i].month,
            week: clocks[i].week,
            day: clocks[i].day,
            type: clocks[i].type,
            start: clocks[i].start,
            end: clocks[i].end,
            order: clocks[i].order,
            userId: user.id,
          },
        });
        const stat = timeDiff(clocks[i].start, clocks[i].end);
        stats.push({clock: created, item: stat, type: clocks[i].type, id: created.id, prisma: "CREATE" });
      }
    }

    diffWorkBreak(stats);

    const userClocks = await prisma.clock.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        stats: true,
      },
    });


    return res.status(200).json({ error: false, data: userClocks, message: "Comptheure mise à jour !" });
  } catch (err) {
    console.log(err);
  }
});

api.post("/profile", async (req, res) => {
  try {
    const user = req?.user;
    const { month, year } = req.body;
    const clocks = await prisma.clock.findMany({
      where: {
        userId: user.id,
        month: month,
        year: year,
        type: "WORK"
      },
      include: {
        stats: true,
      },
    });
    return res.status(200).json({ error: false, data: clocks, message: "Comptheures pour le mois et l'année récupéré" });
  } catch (err) {
    console.log(err);
  }
});

export default api;