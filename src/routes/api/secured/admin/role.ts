import { Router } from "express";
import ucwords from "../../../../helpers/cleaner";
const dotenv = require("dotenv");
dotenv.config();
import prisma from "../../../../helpers/prisma";

const api = Router();

api.post("/create", async ({ user, body }, res) => {

  try {

    const { name, adminLevel } = body;

    if(adminLevel > 2 || adminLevel < 0) {
        return res.status(400).json({ error: true, message: "Le niveau d'administration n'est pas valide" });
    }


    const role = await prisma.roleEnterprise.create({
      data: {
        label: ucwords(name),
        isAdmin: adminLevel,
      },
    });

    const role_enterprise = await prisma.enterpriseRoleLink.create({
        data: {
            enterpriseId: user.userEnterprise.enterpriseId,
            roleEnterpriseId: role.id,
        },
    })


    // get all roleEnterprise of the user.userEnterprise.id
    const roles = await prisma.enterpriseRoleLink.findMany({
        where: {
            enterpriseId: user.userEnterprise.enterpriseId,
        },
        include : {
          Role: true,
          Enterprise: true,
        }
    })

    return res.status(200).json({ error: false, data: roles, message: `Rôle ${ucwords(name)} créé avec succès`, role });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: "Une erreur est survenue" });
  }
});

export default api;
