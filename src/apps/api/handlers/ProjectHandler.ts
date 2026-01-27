import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/authToken";
import { IProjectService } from "../../../core/interfaces/primary/IProjectService";

const projectBodySchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

export class ProjectHandler {
  constructor(private readonly projectService: IProjectService) {}

  async list(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const projects = await this.projectService.listProjects(userId);
    return res.json({ data: projects });
  }

  async create(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const parse = projectBodySchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).json({ error: "Invalid data", details: parse.error.flatten() });
    }

    const project = await this.projectService.createProject({
      ...parse.data,
      userId,
    });

    return res.status(201).json({ data: project });
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const id = req.params.id;
    const parse = projectBodySchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).json({ error: "Invalid data", details: parse.error.flatten() });
    }

    try {
      const updated = await this.projectService.updateProject(id, {
        ...parse.data,
        userId,
      } as any);
      return res.json({ data: updated });
    } catch (error: any) {
      if (error.message === "Project not found") {
        return res.status(404).json({ error: "Project not found" });
      }
      throw error;
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const id = req.params.id;

    try {
      await this.projectService.deleteProject(userId, id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message === "Project not found") {
        return res.status(404).json({ error: "Project not found" });
      }
      if (error.message === "Cannot delete project with associated sessions") {
        return res
          .status(400)
          .json({ error: "Cannot delete project with associated sessions" });
      }
      throw error;
    }
  }
}
