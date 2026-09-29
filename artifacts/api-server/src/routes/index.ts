import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nirantarRouter from "./nirantar";

const router: IRouter = Router();

router.use(healthRouter);
router.use(nirantarRouter);

export default router;
