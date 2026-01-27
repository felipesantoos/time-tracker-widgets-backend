import { Project } from "../../domains/project";

export interface IProjectRepository {
  findManyByUserId(userId: string): Promise<Project[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Project | null>;
  create(project: Omit<Project, "id" | "createdAt">): Promise<Project>;
  update(id: string, project: Partial<Omit<Project, "id" | "userId" | "createdAt">>): Promise<Project>;
  delete(id: string): Promise<void>;
  countSessions(id: string, userId: string): Promise<number>;
}
