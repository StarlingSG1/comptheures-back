import { Router } from "express";

import auth  from "./auth";
import users from "./users";
import clock from "./clock";
import enterprise from "./enterprise";
import { authenticateToken } from "../../../middlewares/auth";

const api = Router();

api.use("/auth", auth);
api.use("/clock", authenticateToken, clock);
api.use("/users", authenticateToken, users);
api.use("/enterprise", authenticateToken, enterprise);

export default api;
