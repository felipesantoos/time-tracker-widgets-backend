import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authToken, AuthenticatedRequest } from "../../middleware/authToken";

const router = Router();

const projectBodySchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

router.get("/", authToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return res.json({ data: projects });
});

router.post("/", authToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const parse = projectBodySchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ error: "Dados inválidos", details: parse.error.flatten() });
  }

  const project = await prisma.project.create({
    data: {
      ...parse.data,
      userId,
    },
  });

  return res.status(201).json({ data: project });
});

router.put("/:id", authToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id;
  const parse = projectBodySchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ error: "Dados inválidos", details: parse.error.flatten() });
  }

  const existing = await prisma.project.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: parse.data,
  });

  return res.json({ data: updated });
});

router.delete("/:id", authToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = req.params.id;

  const existing = await prisma.project.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }

  // Estratégia simples: impedir exclusão se houver sessões associadas
  const sessionsCount = await prisma.timeSession.count({
    where: { projectId: id, userId },
  });

  if (sessionsCount > 0) {
    return res
      .status(400)
      .json({ error: "Não é possível excluir projeto com sessões associadas" });
  }

  await prisma.project.delete({ where: { id } });

  return res.status(204).send();
});

export default router;


