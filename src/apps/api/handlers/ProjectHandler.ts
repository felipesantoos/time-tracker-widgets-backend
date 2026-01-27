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

  /**
   * @openapi
   * /api/projects:
   *   get:
   *     tags:
   *       - Projects
   *     summary: List all projects for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of projects
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Project'
   *       401:
   *         description: Unauthorized
   */
  async list(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const projects = await this.projectService.listProjects(userId);
    return res.json({ data: projects });
  }

  /**
   * @openapi
   * /api/projects:
   *   post:
   *     tags:
   *       - Projects
   *     summary: Create a new project
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - color
   *             properties:
   *               name:
   *                 type: string
   *               color:
   *                 type: string
   *     responses:
   *       201:
   *         description: Project created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Project'
   *       400:
   *         description: Invalid data
   *       401:
   *         description: Unauthorized
   */
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

  /**
   * @openapi
   * /api/projects/{id}:
   *   put:
   *     tags:
   *       - Projects
   *     summary: Update an existing project
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               color:
   *                 type: string
   *     responses:
   *       200:
   *         description: Project updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/Project'
   *       400:
   *         description: Invalid data
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Project not found
   */
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

  /**
   * @openapi
   * /api/projects/{id}:
   *   delete:
   *     tags:
   *       - Projects
   *     summary: Delete a project
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Project deleted
   *       400:
   *         description: Cannot delete project with associated sessions
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Project not found
   */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         color:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
