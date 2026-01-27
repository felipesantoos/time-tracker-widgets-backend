import { prisma } from "../../config/prisma";
import { Project } from "../../core/domains/project";
import { ProjectMapper } from "./mappers/ProjectMapper";
import { IProjectRepository } from "../../core/interfaces/secondary/IProjectRepository";

export class ProjectRepository implements IProjectRepository {
  async findManyByUserId(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return ProjectMapper.toDomainList(projects);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Project | null> {
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });
    return project ? ProjectMapper.toDomain(project) : null;
  }

  async create(project: Omit<Project, "id" | "createdAt">): Promise<Project> {
    const dto = ProjectMapper.toCreateDTO(project);
    const created = await prisma.project.create({
      data: dto,
    });
    return ProjectMapper.toDomain(created);
  }

  async update(id: string, project: Partial<Omit<Project, "id" | "userId" | "createdAt">>): Promise<Project> {
    const dto = ProjectMapper.toUpdateDTO(project);
    const updated = await prisma.project.update({
      where: { id },
      data: dto,
    });
    return ProjectMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }

  async countSessions(id: string, userId: string): Promise<number> {
    return prisma.timeSession.count({
      where: { projectId: id, userId },
    });
  }
}
