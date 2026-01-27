export interface CreateProjectPostgresDTO {
  name: string;
  color: string;
  userId: string;
}

export interface UpdateProjectPostgresDTO {
  name?: string;
  color?: string;
}
