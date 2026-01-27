import { Project } from "../domains/project";
import { IProjectService } from "../interfaces/primary/IProjectService";
import { IProjectRepository } from "../interfaces/secondary/IProjectRepository";

export class ProjectService implements IProjectService {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async listProjects(userId: string): Promise<Project[]> {
    return this.projectRepository.findManyByUserId(userId);
  }

  async createProject(project: Omit<Project, "id" | "createdAt">): Promise<Project> {
    return this.projectRepository.create(project);
  }

  async updateProject(id: string, project: Partial<Omit<Project, "id" | "userId" | "createdAt">>): Promise<Project> {
    const existing = await this.projectRepository.findByIdAndUserId(id, (project as any).userId || "");
    if (!existing) {
      throw new Error("Project not found");
    }
    return this.projectRepository.update(id, project);
  }

  async deleteProject(userId: string, id: string): Promise<void> {
    const existing = await this.projectRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new Error("Project not found");
    }

    const sessionsCount = await this.projectRepository.countSessions(id, userId);
    if (sessionsCount > 0) {
      throw new Error("Cannot delete project with associated sessions");
    }

    await this.projectRepository.delete(id);
  }
}
