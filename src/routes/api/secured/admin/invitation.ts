import { Router } from "express";
import ucwords from "../../../../helpers/cleaner";
const dotenv = require("dotenv");
dotenv.config();
import prisma from "../../../../helpers/prisma";
import jwt from "jsonwebtoken";


const api = Router();

api.post("/", async ({ user, body }, res) => {

  try {
    const { name } = body;

    // get roleEnterprise where name = name
    const theRole = await prisma.roleEnterprise.findFirst({
      where : {
        label: name
      }
    })
    // i want to create a token that store the body of the request , with a duration of 1 day
    const token = jwt.sign({ firstName: user.firstName, lastName: user.lastName, enterprise: user.userEnterprise.enterprise, role: theRole }, process.env.TOKEN_SECRET, {
        expiresIn: "1d",
    });


    // decode the token to get the data
    return res.status(200).json({ error: false, data: token, message: "Invitation créée" });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: "Une erreur est survenue" });
  }

});

api.post("/verify", async ({ user, body }, res) => {
    try {



    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: true, message: "Une erreur est survenue" });
    }
});

export default api;
