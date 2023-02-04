import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { mailerReset } from "../../../helpers/mailjet";


const api = Router();

api.post("/update", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,  
      password    
    } = req.body;
    
    const user = req?.user;

    // Validate user input
    if (!(email && firstName && lastName)) {
      return res.status(400).send("All input are required");
    }

    // check if user already exist
    // Validate if user exist in our database
    if (user.email !== email) {
      const oldUser = await prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      })
      if (oldUser) {
        return res.status(409).send("Veillez renseigner un autre email");
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        firstName: ucwords(firstName),
        lastName: ucwords(lastName),
        email: email.toLowerCase(),
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
      }

    });

    // Create token
    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    if(password.old && password.new && password.confirm) {
      // if password.old === updatedUser.password
      const encryptedPassword = await bcrypt.hash(password.new, 10);
      await prisma.user.update({
        where: {
          id: updatedUser.id,
        },
        data: {
          password: encryptedPassword,
        },
      });
    }

    delete updatedUser.password;

    return res.status(201).json({error: false, data: {updatedUser, newToken} ,message: "Votre compte a été mis à jour avec succès"});
  } catch (err) {
    console.log(err);
  }
});

api.post("/update-password", async ({ body }, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword, token } = JSON.parse(body);
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // Validate user input
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (user && (await bcrypt.compare(oldPassword, user.password))) {
      if (newPassword !== confirmPassword) {
        return res.status(400).send("Les mots de passe ne correspondent pas");
      }
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: {
          id: decoded.id,
        },
        data: {
          password: encryptedPassword,
        },
      });
    }
    // Create token
    const newToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    return res.status(201).json({ newToken });
  } catch (err) {
    console.log(err);
  }
});

// reset password function
api.post("/reset-password", async ({ body }, res) => {
  try {
    const { email } = JSON.parse(body);
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "2h",
        }
      );
      const url = `https://boutique.vb-bmx-club.fr/password/reset/${token}`;
      mailerReset(email, user?.firstName, user?.lastName, url)
    }
    return res.status(200).send({ error: false, message: "Si l'email existe, un lien de réinitialisation de mot de passe vous a été envoyé par email" });
  } catch (err) {
    console.log(err);
  }
});

api.post("/reset-password/:token", async ({ params , body}, res) => {
  try {
    const { token } = params;
    const { newPassword, confirmPassword } = JSON.parse(body);
    // try catfh jwt verify
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    }catch(err){
      return res.status(400).send("Le lien de réinitialisation de mot de passe est invalide ou a expiré");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (user) {
      if (newPassword !== confirmPassword) {
        return res.status(400).send("Les mots de passe ne correspondent pas");
      }
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: {
          id: decoded.id,
        },
        data: {
          password: encryptedPassword,
        },
      });
      return res.status(200).send({ error: false, message: "Votre mot de passe a bien été réinitialisé, vous pouvez essayé de vous connecter" });
    }
    return res.status(400).send({ error: true, message: "Le token a expiré ou est invalide" });
  } catch (err) {
    console.log(err);
  }
});

// get all userEnterprise bhy enterprise id 
api.get("/enterprise/:id", async ( req, res) => {
  try {
    // verify user role
    const user = req.user;
    const { id } = req.params;
    // get userEnterprise where userId = user.id and enterpriseId = id
    const enterpriseAdmin = await prisma.userEnterprise.findUnique({
      where: {
          userId: user.id,
      },
      include: {
        user: true,
        role: true,
      },
    });



    if(enterpriseAdmin.role.isAdmin !== 1 && enterpriseAdmin.role.isAdmin !== 2) {
      return res.status(401).json({ error: true, message: "Vous n'avez pas les droits pour accéder à cette page" });
    }

    if(enterpriseAdmin.role.isAdmin === 1 || enterpriseAdmin.role.isAdmin === 2) {
      const userEnterprise = await prisma.userEnterprise.findMany({
        where: {
          enterpriseId: id,
        },
        include: {
          user: true,
          role: true,
          Stats: {
            include: {
              CustomTime: true,
              specialTime: true,
            },
          },
        },
      });
      return res.status(200).json({ error: false, data: userEnterprise });
    }
    
  } catch (err) {
    console.log(err);
  }
});



export default api;
