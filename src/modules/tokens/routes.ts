import { Router } from 'express';
import { randomBytes } from 'crypto';
import { prisma } from '../../config/prisma';
import { authToken, AuthenticatedRequest } from '../../middleware/authToken';

const router = Router();

// POST /tokens - Gerar novo token
router.post('/', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;

    // Gerar token seguro (32 bytes = 64 caracteres hex)
    const token = randomBytes(32).toString('hex');

    const accessToken = await prisma.accessToken.create({
      data: {
        userId,
        token,
      },
    });

    res.status(201).json({
      data: {
        id: accessToken.id,
        token: accessToken.token,
        createdAt: accessToken.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /tokens - Listar tokens do usuário
router.get('/', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;

    const tokens = await prisma.accessToken.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ data: tokens });
  } catch (error) {
    next(error);
  }
});

// DELETE /tokens/:id - Revogar token
router.delete('/:id', authToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const token = await prisma.accessToken.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!token) {
      return res.status(404).json({ error: 'Token não encontrado' });
    }

    await prisma.accessToken.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

