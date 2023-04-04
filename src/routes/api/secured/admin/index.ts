import { Router } from "express";
import { verifyAdmin } from "../../../../middlewares/auth";

import role from "./role";
import specialDay from "./specialDay";
import invitation from "./invitation";
import data from "./data";

const api = Router();

api.use("/data", verifyAdmin, data);
api.use("/invitation", verifyAdmin, invitation);
api.use("/specialday", verifyAdmin, specialDay);
api.use("/role", verifyAdmin, role);

export default api;
