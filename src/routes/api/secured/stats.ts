import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { getUserFinded, getUserStats } from "../../../helpers/userFunctions";
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
                    include : {
                        specialDay: {
                            include: {
                                configEnterprise: true
                            },
                        },
                    }
                },
            },
        })

        res.status(200).json({ error: false, data: stats, message: "Les stats ont bien été récupérées" });

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