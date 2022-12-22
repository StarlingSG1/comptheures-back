import { Router } from "express";
import api from "./api";

const routes = Router();


// all our routes
routes.use("/api", api);

export default routes;
