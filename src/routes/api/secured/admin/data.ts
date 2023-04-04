import { Router } from "express";
import ucwords from "../../../../helpers/cleaner";
const dotenv = require("dotenv");
dotenv.config();
import prisma from "../../../../helpers/prisma";
import jwt from "jsonwebtoken";


const api = Router();

api.post("/", async ({ user, body }, res) => {

  try {

    const entrepriseId = user.userEnterprise.enterpriseId

    // find all id of userEnterprise with entrepriseId
    const userEnterprise = await prisma.userEnterprise.findMany({
      where: {
        enterpriseId: entrepriseId
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // for each in userEnterprise, get all stats where userEnterpriseId = id
    const stats = await prisma.stats.findMany({
      where: {
        userEnterpriseId: {
          in: userEnterprise.map((user) => user.id)
        }
      },
      select: {
        id: true,
        userEnterpriseId: true,
        work: true,
        day: true,
        month: true,
        year: true,
        CustomTime: true,
        specialTime: true,
      },
    });

    const data = userEnterprise.map((user) => {
      return {
        user: user.user,
        stats: stats.filter((stat) => stat.userEnterpriseId === user.id).map((stat) => {
          return {
            work: stat.work,
            date: `${stat.day}/${stat.month}/${stat.year}`,
            // return customTime if length > 0
            customTime: stat.CustomTime.length > 0 ? stat.CustomTime.map((customTime) => {
              return { name: customTime.name, time: `${customTime.start} - ${customTime.end}` }
            }
            ) : [],
            // get name of specialTime if length > 0
            // get name from specialTime (object)
            specialTime : stat.specialTime  ? stat.specialTime.name : {}
          }
        })
      }
    });

    // make json file with data
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
    const currentDay = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
    const currentHours = new Date().getHours() < 10 ? `0${new Date().getHours()}` : new Date().getHours();
    const currentMinutes = new Date().getMinutes() < 10 ? `0${new Date().getMinutes()}` : new Date().getMinutes();
    const currentSeconds = new Date().getSeconds() < 10 ? `0${new Date().getSeconds()}` : new Date().getSeconds();

    const fileName = `${currentDay}-${currentHours}:${currentMinutes}:${currentSeconds}`;

    const json = JSON.stringify(data);
    const fs = require('fs');

    // create directory with current year if it doesn't exist
    if (!fs.existsSync(entrepriseId.toString())) {
      fs.mkdirSync(entrepriseId.toString());
    }
    if (!fs.existsSync(currentYear.toString())) {
      fs.mkdirSync(currentYear.toString());
    }

    // create directory with current month if it doesn't exist
    const monthDirPath = `${entrepriseId}/${currentYear}/${currentMonth}`;
    if (!fs.existsSync(monthDirPath)) {
      fs.mkdirSync(monthDirPath, { recursive: true });
    }

    fs.writeFile(`${monthDirPath}/${fileName}.json`, json, 'utf8', (err) => {
      if (err) {
        console.log('Error writing file', err);
      } else {
        console.log('Successfully wrote file');
      }
    });


    return res.status(200).json(data);
    // return res.status(200).json({ error: false, data: body, message: "Export" });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: "Une erreur est survenue" });
  }

});

export default api;
