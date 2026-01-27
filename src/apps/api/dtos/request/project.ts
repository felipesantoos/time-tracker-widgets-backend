export interface CreateProjectRequest {
  name: string;
  color: string;
}

export interface UpdateProjectRequest {
  name?: string;
  color?: string;
}
