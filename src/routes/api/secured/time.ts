import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { calculateDuration, calculateTotal } from "../../../helpers/timeCalculation";
import { getUserFinded } from "../../../helpers/userFunctions";
// import mailer from "../../../helpers/mailjet";

const api = Router();

// create a specialTime
api.post("/create", async (req, res) => {
    try {

        const user = req?.user;
        const timeType = req.body.type
        const userFinded = await getUserFinded(user)
        const userRole = userFinded.userEnterprise.role.isAdmin

        const statExist = await prisma.stats.findFirst({
            where: {
                day: req.body.data.day,
                month: req.body.data.month,
                year: req.body.data.year,
                week: req.body.data.week,
                userEnterpriseId: userFinded.userEnterprise.id,
            },
            include: {
                CustomTime: true,
                specialTime: true,
            },
        })

        if (timeType === "SPECIAL") {

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

            if (statExist) {

                const stat = await prisma.stats.update({
                    where: {
                        id: statExist.id,
                    },
                    data: {
                        specialTimeId: specialTimeCreated.id,
                        ...(userRole === 2 ? { realisationStatus: "VALIDATED" } : { realisationStatus: "IN_VALIDATION" })
                    },
                })

                if (statExist.specialTimeId) {
                    const specialTimeDeleted = await prisma.specialTime.delete({
                        where: {
                            id: statExist.specialTimeId,
                        },
                    })
                }

                if (statExist.CustomTime.length) {
                    const customTimeDeleted = await prisma.customTime.deleteMany({
                        where: {
                            statsId: statExist.id,
                        },
                    })
                }

            } else {
                const stat = await prisma.stats.create({
                    data: {
                        day: req.body.data.day,
                        month: req.body.data.month,
                        year: req.body.data.year,
                        week: req.body.data.week,
                        specialTimeId: specialTimeCreated.id,
                        work: req.body.data.configEnterprise.workHourADay,
                        userEnterpriseId: userFinded.userEnterprise.id,
                        ...(userRole === 2 && { realisationStatus: "VALIDATED" })
                    }
                })
            }
        }

        if (timeType === "AUTO") {

            if (statExist) {

                const stat = await prisma.stats.update({
                    where: {
                        id: statExist.id,
                    },
                    data: {
                        work: userFinded.userEnterprise.enterprise.configEnterprise.workHourADay,
                        ...(userRole === 2 ? { realisationStatus: "VALIDATED" } : { realisationStatus: "IN_VALIDATION" })
                    },
                })

                if (statExist.specialTimeId) {
                    const specialTimeDeleted = await prisma.specialTime.delete({
                        where: {
                            id: statExist.specialTimeId,
                        },
                    })
                }

                if (statExist.CustomTime.length) {
                    const customTimeDeleted = await prisma.customTime.deleteMany({
                        where: {
                            statsId: statExist.id,
                        },
                    })
                }

            } else {
                const stat = await prisma.stats.create({
                    data: {
                        day: req.body.data.day,
                        month: req.body.data.month,
                        year: req.body.data.year,
                        week: req.body.data.week,
                        work: userFinded.userEnterprise.enterprise.configEnterprise.workHourADay,
                        userEnterpriseId: userFinded.userEnterprise.id,
                        ...(userRole === 2 && { realisationStatus: "VALIDATED" })
                    }
                })
            }
        }

        if (timeType === "CUSTOM") {
            const items = req.body.data.times
            const times = []
            items.forEach((time, index) => {
                if (time.start !== "" || time.end !== "") {
                    times.push(time)
                }
            })

            if (times.length === 0) {
                if (statExist) {

                    const stat = await prisma.stats.delete({
                        where: {
                            id: statExist.id,
                        },
                    })
                } else {
                    return res.status(200).json({ error: true, message: "Il faut ajouter un horaire" })
                }
            } else {

                if (statExist) {

                    const customTimeDeleted = await prisma.customTime.deleteMany({
                        where: {
                            statsId: statExist.id,
                        },
                    })

                    if (statExist.specialTimeId) {
                        const specialTimeDeleted = await prisma.specialTime.delete({
                            where: {
                                id: statExist.specialTimeId,
                            },
                        })
                    }

                    // create a customTime for each item in times and add statsId = statExist.id
                    const customTime = await prisma.customTime.createMany({
                        data: times.map((time) => ({
                            name: time.name,
                            type: time.type,
                            order: time.order,
                            start: time.start,
                            end: time.end,
                            statsId: statExist.id,
                        })),
                    })

                    // get all customTime where statsId = statExist.id
                    const customTimeFinded = await prisma.customTime.findMany({
                        where: {
                            statsId: statExist.id,
                        },
                    })
                    // FAIRE LA somme / calcul des heures pour le work/break de la stat
                    let myTimes = []
                    customTimeFinded.forEach((time) => {
                        const calc = calculateDuration(time)
                        myTimes.push({ type: time.type, time: calc })
                    })

                    const totalResult = calculateTotal(myTimes)

                    // update stats where id = statExist.id
                    const stat = await prisma.stats.update({
                        where: {
                            id: statExist.id,
                        },
                        data: {
                            work: totalResult.diff,
                            ...(userRole === 2 ? { realisationStatus: "VALIDATED" } : { realisationStatus: "IN_VALIDATION" })
                        },
                    })
                } else {

                    const stat = await prisma.stats.create({
                        data: {
                            day: req.body.data.day,
                            month: req.body.data.month,
                            year: req.body.data.year,
                            week: req.body.data.week,
                            userEnterpriseId: userFinded.userEnterprise.id,
                            ...(userRole === 2 && { realisationStatus: "VALIDATED" })
                        }
                    })

                    const customTime = await prisma.customTime.createMany({
                        data: times.map((time) => ({
                            name: time.name,
                            type: time.type,
                            order: time.order,
                            start: time.start,
                            end: time.end,
                            statsId: stat.id,
                        })),
                    })

                    const customTimeFinded = await prisma.customTime.findMany({
                        where: {
                            statsId: stat.id,
                        },
                    })

                    let myTimes = []
                    customTimeFinded.forEach((time) => {
                        const calc = calculateDuration(time)
                        myTimes.push({ type: time.type, time: calc })
                    })
                    const totalResult = calculateTotal(myTimes)

                    const updatedStat = await prisma.stats.update({
                        where: {
                            id: stat.id,
                        },
                        data: {
                            work: totalResult.diff,
                            ...(userRole === 2 && { realisationStatus: "VALIDATED" })
                        },
                    })
                    // faire la somme / soustractions des heures et update le work/break de la stats

                }
            }
        }

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
                                configEnterprise: true
                            },
                        },
                    }
                },
            },
        })
        return res.status(200).json({ error: false, data: stats, message: "La journée a bien été créée" });
    }
    catch (err) {
        (err);
        return res.status(500).json({ error: true, message: "Une erreur est survenue" });
    }
});

api.post("/status/update", async (req, res) => {
    try {
        const userFinded = await getUserFinded(req.user);
        const userRole = userFinded.userEnterprise.role.isAdmin;

        if(userRole < 1 ){
            return res.status(401).json({ error: true, message: "Vous n'avez pas les droits d'effectuer cette action" });
        }

        const stats = req.body.data
        const option = req.body.option

        if(option === "VALIDATED"){
            // foreach stat in stats, update realisationStatus to VALIDATED
            for(let i = 0; i < stats.length; i++){
                const statUpdated = await prisma.stats.update({
                    where: {
                        id: stats[i].id,
                    },
                    data: {
                        realisationStatus: "VALIDATED",
                    },
                })
            }
            

            // get all stats where realisationStatus = IN_VALIDATION and userEnterpriseId = userFinded.userEnterprise.id
            const statsFinded = await prisma.stats.findMany({
                where: {
                    realisationStatus: "IN_VALIDATION",
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

            return res.status(200).json({ error: false, data: statsFinded, message: "Les jours ont bien été validés" });
            
        } else if(option === "REFUSED"){
            // foreach stat in stats, update realisationStatus to REJECTED
            for(let i = 0; i < stats.length; i++){
                const statUpdated = await prisma.stats.update({
                    where: {
                        id: stats[i].id,
                    },
                    data: {
                        realisationStatus: "REFUSED",
                    },
                })
            }

            const statsFinded = await prisma.stats.findMany({
                where: {
                    realisationStatus: "IN_VALIDATION",
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
        
            return res.status(200).json({ error: false, data: statsFinded, message: "Les jours ont bien été refusé" });
        }



    } catch (err) {
        (err);
        return res.status(500).json({ error: true, message: "Une erreur est survenue" });
    }
});

// delete a stat


export default api;