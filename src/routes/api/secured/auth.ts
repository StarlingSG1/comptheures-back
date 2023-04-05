import { Router } from "express";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
import bcrypt from "bcryptjs";
dotenv.config();
import prisma from "../../../helpers/prisma";
import ucwords from "../../../helpers/cleaner";
import jwt from "jsonwebtoken";
import { getUserEnterprise, getUserFinded } from "../../../helpers/userFunctions";
import { mailer } from "../../../middlewares/nodemailer";
// import mailer from "../../../helpers/mailjet";

const api = Router();

api.post("/register", async ({ body }, res) => {
  try {
    // Get user input
    const {
      user, enterprise
    } = body;

    // Validate user input
    if (!(user.email && user.password && user.confirmPassword && user.firstName && user.lastName && enterprise.name && enterprise.address && enterprise.postalCode && enterprise.city && enterprise.email && enterprise.phone && enterprise.website)) {
      return res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await prisma.user.findUnique({
      where: {
        email: user.email.toLowerCase(),
      },
    });

    if (oldUser) {
      return res.status(200).json({ error: true, message: "Un utilisateur avec cet email existe déjà" });
    }

    if (user.password !== user.confirmPassword) {
      return res.status(400).send("Passwords does not match");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(user.password, 10);

    // Create user in our database

    const newUser = await prisma.user.create({
      data: {
        firstName: ucwords(user.firstName.trim().toLowerCase()),
        lastName: ucwords(user.lastName.trim().toLowerCase()),
        email: user.email.trim().toLowerCase(),
        password: encryptedPassword,
        role: "USER"
      },
    });

    const newEnterprise = await prisma.enterprise.create({
      data: {
        name: enterprise.name.trim(),
        address: enterprise.address.trim(),
        postalCode: enterprise.postalCode.trim(),
        city: enterprise.city.trim(),
        email: enterprise.email.trim().toLowerCase(),
        phone: enterprise.phone.trim(),
        website: enterprise.website.trim().toLowerCase(),
        createdById: newUser.id,
      },
    });

    await prisma.enterpriseRoleLink.createMany({
      data: [
        {
          enterpriseId: newEnterprise.id,
          roleEnterpriseId: "08c61d13-40a2-4ace-9661-5be5c677c9a8",
        },
        {
          enterpriseId: newEnterprise.id,
          roleEnterpriseId: "5562bac0-a0e4-4546-8a0a-49e03bafe976",
        },
        {
          enterpriseId: newEnterprise.id,
          roleEnterpriseId: "09cf4331-087a-436a-a1bd-daee673ecd11",
        },
      ],
    });

    // create a user enterprise 
    const newUserEnterprise = await prisma.userEnterprise.create({
      data: {
        userId: newUser.id,
        enterpriseId: newEnterprise.id,
        roleEnterpriseId: "08c61d13-40a2-4ace-9661-5be5c677c9a8",
      },
    });

    const completeUser = await getUserFinded(newUser);
    const completeEnterprise = await getUserEnterprise(newEnterprise.id, completeUser.userEnterprise);


    // Create token
    const token = jwt.sign({ id: completeUser.id, email : completeUser.email }, process.env.TOKEN_SECRET, {
      expiresIn: "2h",
    });
    // save user token
    newUser.token = token;

    // mailer(email, firstName);
    // return new user
    return res.status(201).json({ error: false, data: {user : completeUser, enterprise: completeEnterprise}, message: "Création de votre compte réussi, vous devez maintenant configurer votre entreprise" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: true, message: "Une erreur est survenue" });
  }
});

// LE LOGIN
api.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    const VERIFY_URL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${req.body['recaptcha']}`;
    const tokenValue = fetch(VERIFY_URL, { method: 'POST' })
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(200).json({ error: true, message: "Tout les champs doivent être rempli" });
    }
    // Validate if user exist in our database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
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
                      },
                      orderBy: {
                        createdAt: "asc",
                      },
                    },
                  }
                },
                EnterpriseRoleLink: {
                  include : {
                    Role : true,
                  }
                },
                createdBy: true,
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

    if (!user) {
      return res.status(200).json({ error: true, message: "Adresse email ou mot de passe incorrect" });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign({ id: user.id, email }, process.env.TOKEN_SECRET, {
        expiresIn: "2h",
      });

      // save user token
      user.token = token;
      delete user.password;

      const enterpriseCreator = await prisma.enterprise.findFirst({
        where: {
          createdById: user.id
        },
      })
      
      if(user?.userEnterprise?.enterprise?.configEnterprise){
        return res.status(200).json({user : user, toConfig : false});
      }else if(user.userEnterprise?.role?.isAdmin === 2) {
        return res.status(200).json({user : user, toConfig : true});
      } else if(!user?.userEnterprise){
        return res.status(400).json({error: true, message: "Connexion impossible, vous n'avez pas d'entreprise", toConfig : false});
      }
      else {
        return res.status(400).json({error: true, message: "Une erreur est survenue", user : user, toConfig : false});
      }
    } else {
      return res.status(200).json({ error: true, message: "Adresse email ou mot de passe incorrect" });
    }
  } catch (err) {
    console.log(err);
  }
});

api.post("/me", async ({ body }, res) => {
  const myBody = body

  try {
    const decoded = jwt.verify(myBody.token, process.env.TOKEN_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
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
                      },
                      orderBy: {
                        createdAt: "asc",
                      },
                    },
                  }
                },
                EnterpriseRoleLink: {
                  include : {
                    Role : true,
                  }
                },
                createdBy: true,
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
    delete user.password;

    if(user?.userEnterprise?.enterprise?.configEnterprise){
      return res.status(200).json({user : user, toConfig : false});
    }else if(user.userEnterprise?.role?.isAdmin === 2) {
      return res.status(200).json({user : user, toConfig : true});
    } else {
      return res.status(400).json({error: true, user : user, toConfig : false});
    }

  } catch (err) {
    res.status(200).send({ error: true, message: "Pas de token ou invalide" });
  }
});


api.get("/" , async (req, res) => {

  const value =[{ "id": 1, "name": "chaise", "price": 24.99, "url": "assets/img/product.jpg" },
  { "id": 2, "name": "bureau", "price": 34.99, "url": "https:\/\/cdn-prod.habitat.fr\/thumbnails\/product\/1112\/1112877\/box\/850\/850\/40\/F4F4F4\/chaise-en-chene-massif-bois-clair_1112877.jpg" },
  { "id": 3, "name": "chaise", "price": 24.99, "url": "https:\/\/www.burolia.fr\/images\/products\/bureaux-denomics-33411z.jpg" },
  { "id": 4, "name": "bureau", "price": 34.99, "url": "assets/img/product.jpg" },
  { "id": 5, "name": "chaise", "price": 24.99, "url": "assets/img/product.jpg" },
  { "id": 6, "name": "bureau", "price": 34.99, "url": "assets/img/product.jpg" }]

  return res.status(200).json({data : value});
}); 



// reset password function
api.post("/reset-password", async ({ body }, res) => {
  try {
    const { email } = body;
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
        const url = `${process.env.LOCAL_FRONT_URL}/password/reset/${token}`;
        await mailer(user.email,"Réinitialisation du mot de passe", url)
      
    }
    return res.status(200).send({ error: false, message: "Si l'email existe, un lien de réinitialisation de mot de passe vous a été envoyé par email" });
  } catch (err) {
    console.log(err);
  }
});

api.post("/reset-password/:token", async ({ params , body}, res) => {
  try {
    const { token } = params;
    const { newPassword, confirmPassword } = body;
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


export default api;