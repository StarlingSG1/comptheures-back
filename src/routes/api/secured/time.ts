import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
// import mailer from "../../../helpers/mailjet";

const api = Router();

// create a specialTime
api.post("/create", async (req, res) => {
    try {
        const user = req?.user;
        const timeType = req.body.type

        // get user where id = user.id
        const userFinded = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                userEnterprise: {
                    include: {
                        enterprise:
                        {
                            include: {
                                configEnterprise: {
                                    include: {
                                        SpecialDays: {
                                            include: {
                                                configEnterprise: true
                                            }
                                        },
                                    }
                                },
                            },
                        },
                        role: true,
                        Stats: {
                            include: {
                                CustomTime: true,
                                specialTime: true,
                            },
                        },
                    },
                },
            },
        })

        // verify is a Stats item exist
        const statExist = await prisma.stats.findFirst({
            where: {
                day: req.body.data.day,
                month: req.body.data.month,
                year: req.body.data.year,
                week: req.body.data.week,
            },
        })

        if (statExist) {
            // faire un update
            return console.log("la stats existe déjà")
        }

        if(timeType === "SPECIAL") {
            const specialTime = {
                name: req.body.data.name,
                specialDayId: req.body.data.id,
                workHourADay: req.body.data.configEnterprise.workHourADay,
            }

            const specialTimeCreated = await prisma.specialTime.create({
                data: {
                    name: specialTime.name,
                    specialDayId: specialTime.specialDayId,
                    workHourADay: specialTime.workHourADay,
                }
            })

            const stat = await prisma.stats.create({
                data: {
                    day: req.body.data.day,
                    month: req.body.data.month,
                    year: req.body.data.year,
                    week: req.body.data.week,
                    specialTimeId: specialTimeCreated.id,
                    work: req.body.data.configEnterprise.workHourADay,
                    userEnterpriseId: userFinded.userEnterprise.id,
                }
            })
        }

        if(timeType === "AUTO") {
            const stat = await prisma.stats.create({
                data: {
                    day: req.body.data.day,
                    month: req.body.data.month,
                    year: req.body.data.year,
                    week: req.body.data.week,
                    work: userFinded.userEnterprise.enterprise.configEnterprise.workHourADay,
                    userEnterpriseId: userFinded.userEnterprise.id,
                }
            })

        }

        if(timeType === "CUSTOM") {
            console.log("custom time")
            // const stat = await prisma.stats.create({
            //     data: {
            //         day: req.body.data.day,
            //         month: req.body.data.month,
            //         year: req.body.data.year,
            //         week: req.body.data.week,
            //         work: req.body.data.configEnterprise.workHourADay,
            //         userEnterpriseId: userFinded.userEnterprise.id,
            //     }
            // })
        }

        return res.status(200).json({ error: false, message: "La journée a bien été créée" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: true, message: "Une erreur est survenue" });
    }
});

export default api;