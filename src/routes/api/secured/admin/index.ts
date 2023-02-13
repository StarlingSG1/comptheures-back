import { Router } from "express";
import { verifyAdmin } from "../../../../middlewares/auth";

import role from "./role";
import specialDay from "./specialDay";

const api = Router();

api.use("/specialday", verifyAdmin, specialDay);
api.use("/role", verifyAdmin, role);

export default api;
