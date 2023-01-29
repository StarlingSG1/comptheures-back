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

// get all stats of the user 
api.get("/", async (req, res) => {
    try {
        const user = req?.user;
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

    


export default api;