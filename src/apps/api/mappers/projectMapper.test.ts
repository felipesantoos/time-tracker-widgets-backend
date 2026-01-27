import { describe, it, expect } from 'vitest';
import { ProjectMapper } from './projectMapper';
import { Project } from '../../../core/domains/project';

describe('ProjectMapper', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    color: '#ffffff',
    userId: 'user-1',
    createdAt: new Date(),
  };

  describe('toResponse', () => {
    it('should map a domain project to a response DTO', () => {
      const result = ProjectMapper.toResponse(mockProject);

      expect(result).toEqual({
        id: mockProject.id,
        name: mockProject.name,
        color: mockProject.color,
        userId: mockProject.userId,
        createdAt: mockProject.createdAt,
      });
    });
  });

  describe('toResponseList', () => {
    it('should map an array of domain projects to an array of response DTOs', () => {
      const projects = [mockProject, { ...mockProject, id: '2', name: 'P2' }];
      const result = ProjectMapper.toResponseList(projects);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });
});
