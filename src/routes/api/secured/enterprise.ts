import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { getUserFinded } from "../../../helpers/userFunctions";
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
        const userUpdater = userFinded(user.id);
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

api.post("/users/delete", async (req, res) => {
    try {

        const userFinded = await getUserFinded(req.user)

        if (userFinded.userEnterprise.role.isAdmin < 2){
            return res.status(401).json({ error: true, message: "Vous n'avez pas les droits pour accéder à cette page" });
        }

        const { usersIds, enterpriseId } = req.body;
        // delete all userEnterprise where userId in usersIds
        const deleted =await prisma.userEnterprise.deleteMany({
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

        return res.status(200).json({ error: false,data : userEnterprise, message: "Les utilisateurs ont été supprimés avec succès" });

    } catch (err) {
        console.log(err);
    }
});

export default api;