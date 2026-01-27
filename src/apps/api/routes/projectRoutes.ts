import { Router } from "express";
import { authToken } from "../middleware/authToken";
import { ProjectHandler } from "../handlers/ProjectHandler";
import { DIContainer } from "../dicontainer/dicontainer";

const router = Router();
const service = DIContainer.getProjectService();
const handler = new ProjectHandler(service);

router.get("/", authToken, (req, res) => handler.list(req as any, res));
router.post("/", authToken, (req, res) => handler.create(req as any, res));
router.put("/:id", authToken, (req, res) => handler.update(req as any, res));
router.delete("/:id", authToken, (req, res) => handler.delete(req as any, res));

export default router;
