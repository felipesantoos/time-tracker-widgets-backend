import { Project } from "../../../core/domains/project";
import { ProjectResponse } from "../dtos/response/project";

export class ProjectMapper {
  static toResponse(domain: Project): ProjectResponse {
    return {
      id: domain.id,
      name: domain.name,
      color: domain.color,
      userId: domain.userId,
      createdAt: domain.createdAt,
    };
  }

  static toResponseList(domains: Project[]): ProjectResponse[] {
    return domains.map((domain) => this.toResponse(domain));
  }
}
