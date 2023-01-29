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

const verifyIsAdmin = async (id: string, res) => {
    const enterpriseAdmin = await prisma.userEnterprise.findUnique({
        where: {
            userId: id,
        },
        include: {
            user: true,
            role: true,
            enterprise: {
                include : {
                    configEnterprise: true,
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
api.post("/update", async (req, res) => {
    try {
        const {
            name,
            address,
            email,
            phone,
            website
        } = req.body;

        const user = req?.user;

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

        // get user where id = user.id
        const userUpdater = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                userEnterprise: {
                    include: {
                        enterprise: true,
                        role: true,
                        Stats: {
                            include: {
                                CustomTime: true,
                                specialTime: true,
                            },
                        },
                    },
                },
            }
        });
        return res.status(200).json({ error: false, data: userUpdater, message: "Les informations de l'entreprise ont été mises à jour avec succès" });
    } catch (err) {
        console.log(err);
    }
});

// get all specialDays of the enterprise
api.get("/specialDays", async (req, res) => {
    try {
        const user = req?.user;

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

export default api;