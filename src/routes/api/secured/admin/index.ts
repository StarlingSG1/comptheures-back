import { Router } from "express";
import { verifyAdmin } from "../../../../middlewares/auth";

import role from "./role";

const api = Router();

api.use("/role", verifyAdmin, role);

export default api;
