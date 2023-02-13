import { Router } from "express";
import ucwords from "../../../../helpers/cleaner";
const dotenv = require("dotenv");
dotenv.config();
import prisma from "../../../../helpers/prisma";
import { getUserEnterprise } from "../../../../helpers/userFunctions";

const api = Router();

api.post("/create", async ({ user, body }, res) => {

  try {

   const { name, paid, work} = body;
   const newSpecialDay = await prisma.defaultSpecialDay.create({
        data: {
            name: ucwords(name),
            paid: paid,
            work: work,
            configEnterpriseId: user.userEnterprise.enterprise.configEnterprise.id,
        },
    });

    const enterprise = await getUserEnterprise(user.userEnterprise.enterpriseId, user.userEnterprise);

    return res.status(200).json({ error: false, data: enterprise, message: `Jour ${ucwords(name)} créé avec succès` });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: "Une erreure est survenue" });
  }
});

export default api;
