import { Project } from "../../../core/domains/project";
import { CreateProjectPostgresDTO, UpdateProjectPostgresDTO } from "../dtos/ProjectDTOs";

export class ProjectMapper {
  static toDomain(prismaProject: any): Project {
    return {
      id: prismaProject.id,
      name: prismaProject.name,
      color: prismaProject.color,
      userId: prismaProject.userId,
      createdAt: prismaProject.createdAt,
    };
  }

  static toDomainList(prismaProjects: any[]): Project[] {
    return prismaProjects.map(this.toDomain);
  }

  static toCreateDTO(project: Omit<Project, "id" | "createdAt">): CreateProjectPostgresDTO {
    return {
      name: project.name,
      color: project.color,
      userId: project.userId,
    };
  }

  static toUpdateDTO(project: Partial<Omit<Project, "id" | "userId" | "createdAt">>): UpdateProjectPostgresDTO {
    return {
      name: project.name,
      color: project.color,
    };
  }
}
