import { Project } from "../../domains/project";

export interface IProjectService {
  listProjects(userId: string): Promise<Project[]>;
  createProject(project: Omit<Project, "id" | "createdAt">): Promise<Project>;
  updateProject(id: string, project: Partial<Omit<Project, "id" | "userId" | "createdAt">>): Promise<Project>;
  deleteProject(userId: string, id: string): Promise<void>;
}
