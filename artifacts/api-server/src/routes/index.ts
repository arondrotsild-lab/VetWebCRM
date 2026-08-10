import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";
import vetsRouter from "./vets";
import clientsRouter from "./clients";
import petsRouter from "./pets";
import servicesRouter from "./services";
import financeRouter from "./finance";
import leaderboardRouter from "./leaderboard";
import suggestionsRouter from "./suggestions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(ordersRouter);
router.use(vetsRouter);
router.use(clientsRouter);
router.use(petsRouter);
router.use(servicesRouter);
router.use(financeRouter);
router.use(leaderboardRouter);
router.use(suggestionsRouter);

export default router;
