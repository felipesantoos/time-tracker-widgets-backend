import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { ProjectService } from './ProjectService';
import { IProjectRepository } from '../interfaces/secondary/IProjectRepository';
import { Project } from '../domains/project';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mockProjectRepository: Mocked<IProjectRepository>;

  beforeEach(() => {
    mockProjectRepository = {
      findManyByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByIdAndUserId: vi.fn(),
      countSessions: vi.fn(),
    } as any;

    projectService = new ProjectService(mockProjectRepository);
  });

  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    color: '#ffffff',
    userId: 'user-1',
    createdAt: new Date(),
  };

  describe('listProjects', () => {
    it('should return a list of projects for a user', async () => {
      mockProjectRepository.findManyByUserId.mockResolvedValue([mockProject]);

      const result = await projectService.listProjects('user-1');

      expect(result).toEqual([mockProject]);
      expect(mockProjectRepository.findManyByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const newProjectData = { name: 'New Project', color: '#000000', userId: 'user-1' };
      mockProjectRepository.create.mockResolvedValue(mockProject);

      const result = await projectService.createProject(newProjectData);

      expect(result).toEqual(mockProject);
      expect(mockProjectRepository.create).toHaveBeenCalledWith(newProjectData);
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const updateData = { name: 'Updated Project' };
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue({ ...mockProject, ...updateData });

      const result = await projectService.updateProject('1', updateData);

      expect(result.name).toBe('Updated Project');
      expect(mockProjectRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw an error if project is not found', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(projectService.updateProject('1', { name: 'New', userId: 'user-1' } as any))
        .rejects.toThrow('Project not found');
    });

    it('should verify ownership by passing userId to repository', async () => {
      const updateData = { name: 'Updated', userId: 'user-1' };
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(mockProject);
      mockProjectRepository.update.mockResolvedValue({ ...mockProject, name: 'Updated' });

      await projectService.updateProject('1', updateData as any);

      expect(mockProjectRepository.findByIdAndUserId).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project if it exists and has no sessions', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(mockProject);
      mockProjectRepository.countSessions.mockResolvedValue(0);

      await projectService.deleteProject('user-1', '1');

      expect(mockProjectRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw if project not found during deletion', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(null);

      await expect(projectService.deleteProject('user-1', '1'))
        .rejects.toThrow('Project not found');
    });

    it('should throw if project has associated sessions', async () => {
      mockProjectRepository.findByIdAndUserId.mockResolvedValue(mockProject);
      mockProjectRepository.countSessions.mockResolvedValue(5);

      await expect(projectService.deleteProject('user-1', '1'))
        .rejects.toThrow('Cannot delete project with associated sessions');
    });
  });
});
