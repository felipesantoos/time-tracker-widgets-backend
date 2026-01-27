import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { Response } from 'express';
import { ProjectHandler } from './ProjectHandler';
import { IProjectService } from '../../../core/interfaces/primary/IProjectService';
import { AuthenticatedRequest } from '../middleware/authToken';

describe('ProjectHandler', () => {
  let handler: ProjectHandler;
  let mockProjectService: Mocked<IProjectService>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockProjectService = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
    } as any;

    handler = new ProjectHandler(mockProjectService);
    
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  const mockReq = (body = {}, params = {}, userId = 'user-1') => ({
    body,
    params,
    userId,
  } as unknown as AuthenticatedRequest);

  describe('list', () => {
    it('should return projects for the user', async () => {
      const projects = [{ id: '1', name: 'P1' }];
      mockProjectService.listProjects.mockResolvedValue(projects as any);

      await handler.list(mockReq(), mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({ data: projects });
      expect(mockProjectService.listProjects).toHaveBeenCalledWith('user-1');
    });
  });

  describe('create', () => {
    it('should create a project with valid data', async () => {
      const body = { name: 'New Project', color: '#ff0000' };
      const created = { id: '1', ...body, userId: 'user-1' };
      mockProjectService.createProject.mockResolvedValue(created as any);

      await handler.create(mockReq(body), mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: created });
    });

    it('should return 400 for invalid data', async () => {
      const body = { name: '' }; // Invalid: min(1)

      await handler.create(mockReq(body), mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid data' }));
    });
  });

  describe('update', () => {
    it('should update project and return 200', async () => {
      const body = { name: 'Updated', color: '#000000' };
      mockProjectService.updateProject.mockResolvedValue({ id: '1', ...body } as any);

      await handler.update(mockReq(body, { id: '1' }), mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({ data: expect.objectContaining(body) });
    });

    it('should return 404 if project not found', async () => {
      mockProjectService.updateProject.mockRejectedValue(new Error('Project not found'));

      await handler.update(mockReq({ name: 'N', color: 'C' }, { id: '1' }), mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('delete', () => {
    it('should return 204 on success', async () => {
      mockProjectService.deleteProject.mockResolvedValue();

      await handler.delete(mockReq({}, { id: '1' }), mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 400 if project has sessions', async () => {
      mockProjectService.deleteProject.mockRejectedValue(new Error('Cannot delete project with associated sessions'));

      await handler.delete(mockReq({}, { id: '1' }), mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Cannot delete project with associated sessions' }));
    });
  });
});
