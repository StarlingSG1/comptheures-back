import { Router } from "express";
import ucwords from "../../../helpers/cleaner";
const dotenv = require("dotenv");
dotenv.config();
import bcrypt from "bcryptjs";
import prisma from "../../../helpers/prisma";
import jwt from "jsonwebtoken";


const api = Router();

api.post("/", async ({body}, res) => {
    try {

      const { token } = body;

      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      return res.status(200).json({ error: false, data: decoded, message: "Invitation accepté" });

    } catch (err) {
        console.log(err);
        return res.status(400).json({ error: true, message: "Une erreur est survenue" });
    }
});

api.post("/register", async ({ body }, res) => {
  try {
    // Get user input
    const {
      firstName,
      lastName,
      email,
      enterprise,
      password,
      role,
      confirmPassword,
    } = body;

    // Validate user input
    if (!(email && password && confirmPassword && firstName && lastName && enterprise && role)) {
      return res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (oldUser) {
      return res.status(200).json({ error: true, message: "Un utilisateur avec cet email existe déjà" });
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords does not match");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database

    const user = await prisma.user.create({
      data: {
        firstName: ucwords(firstName.trim().toLowerCase()),
        lastName: ucwords(lastName.trim().toLowerCase()),
        email: email.trim().toLowerCase(),
        password: encryptedPassword,
        role: "USER"
      },
    });

    // create a user enterprise
    const userEnterprise = await prisma.userEnterprise.create({
      data: {
        userId: user.id,
        enterpriseId: enterprise.id,
        roleEnterpriseId: role.id,
      }
    });

    

    // Create token
    const token = jwt.sign({ id: user.id, email }, process.env.TOKEN_SECRET, {
      expiresIn: "2h",
    });
    // save user token
    user.token = token;

    // mailer(email, firstName);
    // return new user
    return res.status(201).json({ error: false, data: user, message: "Création de votre compte réussi, vous pouvez vous connecter" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: "Une erreur est survenue" });
  }
});

export default api;
