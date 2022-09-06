import { Router } from "express";
import Summary from "../controller/summaryController.js";

const router = Router();

router
    .get('/summary/:year/:month', Summary.monthSummary);

export default router;
