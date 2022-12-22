import { Router } from "express";

import secured from "./secured";

const api = Router();

api.use("/", secured);

export default api;
