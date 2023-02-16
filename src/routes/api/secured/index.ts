import { Router } from "express";

import auth  from "./auth";
import users from "./users";
import clock from "./clock";
import enterprise from "./enterprise";
import time from "./time";
import stats from "./stats";
import admin from "./admin";
import invitation from "./invitation";
import { authenticateToken } from "../../../middlewares/auth";

const api = Router();

api.use("/auth", auth);
api.use("/clock", authenticateToken, clock);
api.use("/users", authenticateToken, users);
api.use("/stats", authenticateToken, stats);
api.use("/time", authenticateToken, time);
api.use("/enterprise", authenticateToken, enterprise);
api.use("/invitation", invitation);
api.use("/admin", authenticateToken, admin);

export default api;
