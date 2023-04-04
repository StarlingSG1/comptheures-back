import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { getUserFinded, getUserStats } from "../../../helpers/userFunctions";
import { calculateTotal, calculateTotalRecap, filterByMonth, getDaysOfTheWeek } from "../../../helpers/timeCalculation";
// import mailer from "../../../helpers/mailjet";

const api = Router();



// get all stats of the user 
api.get("/", async (req, res) => {
    try {
        const user = req?.user;
        // get user where id = user.id
        const userFinded = await getUserFinded(user)

        // get all stats of the user.userEnterprise.id
        const stats = await prisma.stats.findMany({
            where: {
                userEnterpriseId: userFinded.userEnterprise.id,
            },
            include: {
                CustomTime: true,
                specialTime: {
                    include: {
                        specialDay: {
                            include: {
                                configEnterprise: true,
                                defaultSpecialDay: {
                                    include: {
                                        SpecialDay: true,
                                    },
                                },
                                specialTime: {
                                    include: {
                                        stats: true,
                                    },
                                },
                            },
                        },
                    }
                },
            },
        })
        const value = filterByMonth(stats, 30, 0, 2023, 28, 27)

        const newValue = calculateTotalRecap(value)
        const myRecap = {
            month: {
                start: 28,
                end: 27,
                total: newValue.workTotal,
                length: value.length,
            },
            week: {
                start: 1,
                end: 7,
                total: "X",
                length: "X",
            }
        }
        res.status(200).json({ error: false, data: { stats: stats, recap: myRecap }, message: "Les stats ont bien été récupérées" });

    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Une erreur est survenue" });
    }
});

const getMonthRange = (date) => {
    const month = date.month;
    const year = date.year;
    const prevMonth = (month === 0) ? 11 : month - 1;
    const nextMonth = (month === 11) ? 0 : month + 1;
    const prevYear = (prevMonth === 11) ? year - 1 : year;
    const nextYear = (nextMonth === 0) ? year + 1 : year;
    return {
        previous: new Date(prevYear, prevMonth),
        current: new Date(year, month),
        next: new Date(nextYear, nextMonth),
    };
}

api.post("/recap", async (req, res) => {
    try {
        const user = req?.user;
        const date = req.body
        const userFinded = await getUserFinded(user)
        console.log(userFinded)

        const range = getMonthRange(date);
        const months = [range.previous.getMonth(), range.current.getMonth(), range.next.getMonth()];
        const years = [range.previous.getFullYear(), range.current.getFullYear(), range.next.getFullYear()];       

        const stats = await prisma.stats.findMany({
            where: {
                userEnterpriseId: userFinded.userEnterprise.id,
                OR: [
                    {
                        month: months[0],
                        year: years[0],
                    },
                    {
                        month: months[1],
                        year: years[1],
                    },
                    {
                        month: months[2],
                        year: years[2],
                    },
                ],
            },
            include: {
                CustomTime: true,
                specialTime: {
                    include: {
                        specialDay: {
                            include: {
                                configEnterprise: true
                            },
                        },
                    }
                },
            },
        })

        const value = filterByMonth(stats, date.day, date.month, date.year, userFinded.userEnterprise.enterprise.configEnterprise.monthDayStart, userFinded.userEnterprise.enterprise.configEnterprise.monthDayEnd)
        const daysWeek = getDaysOfTheWeek(new Date(date.year, date.month, date.day))

        let weekFormated = []
        let firstAndLastDayOfTheWeek = []
        for (let i = 0; daysWeek.resultat.length > i; i++) {
            let givenDate = daysWeek.resultat[i];

            if (daysWeek.day !== 0 && daysWeek.day !== 6) {
                givenDate = new Date(givenDate.getTime() - 86400000);
            }
            if (i === 0 || i === 6) {
                firstAndLastDayOfTheWeek.push(givenDate)
            }
            const theStat = await prisma.stats.findFirst({
                where: {
                    day: givenDate.getDate(),
                    month: givenDate.getMonth(),
                    year: givenDate.getFullYear(),
                    userEnterpriseId: userFinded.userEnterprise.id,
                },
                include: {
                    CustomTime: true,
                    specialTime: {
                        include: {
                            specialDay: {
                                include: {
                                    configEnterprise: true
                                },
                            },
                        }
                    },
                },
            })
            if (theStat) {
                weekFormated.push(theStat)
            }
        }

        const weekValue = calculateTotalRecap(weekFormated)
        const newValue = calculateTotalRecap(value)
        const myRecap = {
            month: {
                start: userFinded.userEnterprise.enterprise.configEnterprise.monthDayStart,
                end: userFinded.userEnterprise.enterprise.configEnterprise.monthDayEnd,
                total: newValue.workTotal,
                length: value.length,
            },
            week: {
                start: { number: firstAndLastDayOfTheWeek[0].getDate(), month: firstAndLastDayOfTheWeek[0].getMonth() },
                end: { number: firstAndLastDayOfTheWeek[firstAndLastDayOfTheWeek.length - 1].getDate(), month: firstAndLastDayOfTheWeek[firstAndLastDayOfTheWeek.length - 1].getMonth() },
                total: weekValue.workTotal,
                length: weekFormated.length,
            }
        }
        return res.status(200).json({ error: false, data: { stats: stats, recap: myRecap }, message: "Les stats ont bien été récupérées" });

    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Une erreur est survenue" });
    }
});



api.post("/delete", async (req, res) => {
    try {
        const user = req?.user

        const userFinded = await getUserFinded(user)

        // delete stats where day, month, year and userEnterpriseId
        const stats = await prisma.stats.deleteMany({
            where: {
                day: req.body.day,
                month: req.body.month,
                year: req.body.year,
                userEnterpriseId: userFinded.userEnterprise.id,
            },
        })

        // get all stats for the user
        const userStats = await getUserStats(userFinded)

        res.status(200).json({ error: false, data: userStats, message: "Les stats ont bien été supprimées" });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: true, message: "Une erreur est survenue" });
    }
});




export default api;