import prisma from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { getApplicationById } from './application-service.js';

export async function listNotes(applicationId, userId) {
  // Enforces ownership since getApplicationById throws if unauthorized
  await getApplicationById(applicationId, userId);

  return await prisma.applicationNote.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createNote(applicationId, userId, data) {
  await getApplicationById(applicationId, userId);

  return await prisma.applicationNote.create({
    data: {
      ...data,
      applicationId,
    },
  });
}

export async function updateNote(id, applicationId, userId, data) {
  await getApplicationById(applicationId, userId);

  const existing = await prisma.applicationNote.findFirst({
    where: { id, applicationId },
  });

  if (!existing) {
    throw new NotFoundError('Note not found');
  }

  return await prisma.applicationNote.update({
    where: { id },
    data,
  });
}

export async function deleteNote(id, applicationId, userId) {
  await getApplicationById(applicationId, userId);

  const existing = await prisma.applicationNote.findFirst({
    where: { id, applicationId },
  });

  if (!existing) {
    throw new NotFoundError('Note not found');
  }

  return await prisma.applicationNote.delete({
    where: { id },
  });
}
