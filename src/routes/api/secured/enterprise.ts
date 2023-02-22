import e, { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { getUserEnterprise, getUserFinded } from "../../../helpers/userFunctions";
// import mailer from "../../../helpers/mailjet";

const api = Router();

const verifyIsAdmin = async (id: string, res) => {
    const enterpriseAdmin = await prisma.userEnterprise.findUnique({
        where: {
            userId: id,
        },
        include: {
            user: true,
            role: true,
            enterprise: {
                include: {
                    configEnterprise: true,
                    EnterpriseRoleLink: {
                        include: {
                            Role: true,
                        }
                    },
                }
            },
        },
    });

    if (enterpriseAdmin.role.isAdmin !== 1 && enterpriseAdmin.role.isAdmin !== 2) {
        return res.status(401).json({ error: true, message: "Vous n'avez pas les droits pour accéder à cette page" });
    }

    return enterpriseAdmin;
}

// route to update enterprise informations 
api.post("/update", async ({ user, body }, res) => {
    try {
        const {
            name,
            address,
            email,
            phone,
            website
        } = body;



        // Validate user input
        if (!(name && email && address && phone && website)) {
            return res.status(400).send("All input are required");
        }

        const adminUser = await verifyIsAdmin(user.id, res);

        await prisma.enterprise.update({
            where: {
                id: adminUser.enterpriseId,
            },
            data: {
                name: name,
                address: address,
                email: email.toLowerCase(),
                phone: phone,
                website: website
            },
        });

        const updatedEnterprise = await getUserEnterprise(adminUser.enterpriseId, user);

        // get user where id = user.id
        return res.status(200).json({ error: false, data: updatedEnterprise, message: "Les informations de l'entreprise ont été mises à jour avec succès" });
    } catch (err) {
        console.log(err);
    }
});

// get all specialDays of the enterprise
api.get("/specialDays", async ({ user, body }, res) => {
    try {

        const adminUser = await verifyIsAdmin(user.id, res);
        const specialDays = await prisma.specialDay.findMany({
            where: {
                configEnterpriseId: adminUser.enterprise.configEnterprise.id,
            },
            include: {
                configEnterprise: true,
                specialTime: {
                    include: {
                        stats: true,
                    },
                },
            },
        });
        return res.status(200).json({ error: false, data: specialDays });
    }
    catch (err) {
        console.log(err);
    }
});

api.post("/users/delete", async ({ user, body }, res) => {
    try {

        const userFinded = await getUserFinded(user)

        if (userFinded.userEnterprise.role.isAdmin < 2) {
            return res.status(401).json({ error: true, message: "Vous n'avez pas les droits pour accéder à cette page" });
        }

        const { usersIds, enterpriseId } = body;
        // delete all userEnterprise where userId in usersIds
        const deleted = await prisma.userEnterprise.deleteMany({
            where: {
                id: {
                    in: usersIds,
                },
            },
        });

        // get all users of the enterprise 
        const userEnterprise = await prisma.userEnterprise.findMany({
            where: {
                enterpriseId: enterpriseId,
            },
            include: {
                user: true,
                role: true,
                Stats: {
                    include: {
                        CustomTime: true,
                        specialTime: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        return res.status(200).json({ error: false, data: userEnterprise, message: "Les utilisateurs ont été supprimés avec succès" });

    } catch (err) {
        console.log(err);
    }
});

api.get("/specialDays/default", async ({ user, body }, res) => {
    try {
        const theUser = await getUserFinded(user);

        // get all default specialDays
        const specialDays = await prisma.defaultSpecialDay.findMany({
            where: {
                OR: [
                    {
                        configEnterpriseId: null,
                    },
                    {

                        configEnterpriseId: theUser?.userEnterprise?.enterprise?.configEnterprise?.id,
                    },
                ],
            },
        });
        return res.status(200).json({ error: false, data: specialDays });
    } catch (err) {
        console.log(err);
    }
});

api.post("/config", async ({ user, body }, res) => {
    try {

        const adminUser = await verifyIsAdmin(user.id, res);

        const { months, specialDays, time } = body;

        if (!months || !specialDays || !time) {
            return res.status(200).json({ error: true, message: "All input are required" });
        }

        if (months.start === months.end) {
            return res.status(200).json({ error: true, message: "Le mois de début doit être différent du mois de fin" });
        }

        const specialDaysIds = [];

        specialDays.forEach((specialDay) => {
            if (specialDay?.defaultSpecialDayId) {
                specialDaysIds.push(specialDay.defaultSpecialDayId);
            } else {
                specialDaysIds.push(specialDay.id);
            }
        });


        const configEnterprise = await prisma.configEnterprise.findUnique({
            where: {
                enterpriseId: adminUser.enterpriseId,
            },
        });

        if (configEnterprise) {
            // updaate

            // delete specialDays where defaultSpecialDayId not in specialDaysIds
            await prisma.specialDay.deleteMany({
                where: {
                    configEnterpriseId: configEnterprise.id,
                    defaultSpecialDayId: {
                        notIn: specialDaysIds,
                    },
                },
            });

            // remove item from specialDaysIds if defaultSpecialDayId exist
            const specialDaysFinded2 = await prisma.specialDay.findMany({
                where: {
                    configEnterpriseId: configEnterprise.id,
                },
            });

            specialDaysFinded2.forEach((specialDay) => {
                const index = specialDaysIds.indexOf(specialDay.defaultSpecialDayId);
                if (index > -1) {
                    specialDaysIds.splice(index, 1);
                }
            });

            // update configEnterprise
            await prisma.configEnterprise.update({
                where: {
                    id: configEnterprise.id,
                },
                data: {
                    monthDayStart: months.start,
                    monthDayEnd: months.end,
                    workHourADay: time,
                },
            });

            // find all defaultSpecialDays that are in specialDaysIds
            const specialDaysFinded = await prisma.defaultSpecialDay.findMany({
                where: {
                    id: {
                        in: specialDaysIds,
                    },
                },
            });


            // create specialDays for each in specialDaysIds
            for (let i = 0; i < specialDaysFinded.length; i++) {
                const specialDayId = specialDaysFinded[i];
                await prisma.specialDay.create({
                    data: {
                        name: specialDayId.name,
                        configEnterpriseId: configEnterprise.id,
                        work: specialDayId.work,
                        paid: specialDayId.paid,
                        defaultSpecialDayId: specialDayId.id,
                    },
                })
            }
        } else {
            const configCreated = await prisma.configEnterprise.create({
                data: {
                    enterpriseId: adminUser.enterpriseId,
                    monthDayStart: months.start,
                    monthDayEnd: months.end,
                    workHourADay: time,
                },
            })

            // create specialDays for each in specialDays
            for (let i = 0; i < specialDays.length; i++) {
                const specialDay = specialDays[i];
                await prisma.specialDay.create({
                    data: {
                        name: specialDay.name,
                        configEnterpriseId: configCreated.id,
                        work: specialDay.work,
                        paid: specialDay.paid,
                        defaultSpecialDayId: specialDay.id,
                    },
                })
            }
        }


        const configedEnterprise = await getUserEnterprise(adminUser.enterpriseId, adminUser);

        return res.status(200).json({ error: false, data: configedEnterprise, message: "La configuration a été mise à jour avec succès" });

    } catch (err) {
        console.log(err);
    }
});

export default api;