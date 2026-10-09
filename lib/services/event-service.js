import prisma from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { getApplicationById } from './application-service.js';

export async function listEvents(applicationId, userId) {
  await getApplicationById(applicationId, userId);

  return await prisma.applicationEvent.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createEvent(applicationId, userId, data) {
  await getApplicationById(applicationId, userId);

  return await prisma.applicationEvent.create({
    data: {
      ...data,
      applicationId,
    },
  });
}

export async function updateEvent(id, applicationId, userId, data) {
  await getApplicationById(applicationId, userId);

  const existing = await prisma.applicationEvent.findFirst({
    where: { id, applicationId },
  });

  if (!existing) {
    throw new NotFoundError('Event not found');
  }

  return await prisma.applicationEvent.update({
    where: { id },
    data,
  });
}

export async function deleteEvent(id, applicationId, userId) {
  await getApplicationById(applicationId, userId);

  const existing = await prisma.applicationEvent.findFirst({
    where: { id, applicationId },
  });

  if (!existing) {
    throw new NotFoundError('Event not found');
  }

  return await prisma.applicationEvent.delete({
    where: { id },
  });
}
