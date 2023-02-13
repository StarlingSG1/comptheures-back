import  jwt from "jsonwebtoken";
import  bcrypt from "bcryptjs";
import dotenv from "dotenv";
import prisma from "../helpers/prisma";


export function verifyToken (req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      return res.status(401).end();
    }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const newUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!newUser) {
        console.log("USER not found BUT token is valid");
        return res.error("error");
      }
      delete newUser.password;
      req.user = newUser;
      next();
    }
  );
}

export function verifyAdmin(req, res, next){
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET,
    async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const newUser = await prisma.user.findUnique({
        where: { 
          id: user.id 
        },
        include: {
          userEnterprise: {
            include: {
            role: true,
            enterprise: {
              include : {
                configEnterprise: true, 
              }
            },
            },
          },
        },
      });
      if (!newUser) {
        console.log("USER not found BUT token is valid");
        return res.error("error");
      }
      if (newUser.userEnterprise.role.isAdmin !== 2) {
        return res.status(401).json({ error: true, message: "Vous n'avez pas les droits" });
      }
      delete newUser.password;
      req.user = newUser;
      next();
    }
  );
}

export async function compare(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

