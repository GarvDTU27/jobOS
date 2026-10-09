import prisma from '../db/prisma.js';
import { NotFoundError } from '../utils/errors.js';

export async function createApplication(userId, data) {
  return await prisma.$transaction(async (tx) => {
    const { status, ...rest } = data;
    const initialStatus = status || 'SAVED';

    const application = await tx.application.create({
      data: {
        userId,
        ...rest,
        status: initialStatus,
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        toStatus: initialStatus,
        note: 'Application created',
      },
    });

    return application;
  });
}

export async function getApplicationById(id, userId) {
  const application = await prisma.application.findFirst({
    where: { id, userId },
  });

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  return application;
}

export async function listApplications(userId, options = {}) {
  const { 
    skip = 0, 
    take = 50,
    search,
    status, // can be array of statuses or single status
    sortBy = 'createdAt', // createdAt, deadline, matchScore, company, applicationDate
    sortOrder = 'desc' // asc, desc
  } = options;

  const where = { userId };

  if (search) {
    where.OR = [
      { company: { contains: search, mode: 'insensitive' } },
      { role: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = Array.isArray(status) ? { in: status } : status;
  }

  const orderBy = {};
  if (['createdAt', 'deadline', 'matchScore', 'company', 'applicationDate'].includes(sortBy)) {
    orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    prisma.application.count({
      where,
    }),
  ]);

  return { applications, total, skip, take };
}

export async function updateApplication(id, userId, data) {
  const existing = await prisma.application.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError('Application not found');
  }

  const { status, ...allowedData } = data;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: allowedData,
    });

    if (status && status !== existing.status) {
      await tx.application.update({
        where: { id },
        data: { status },
      });
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          fromStatus: existing.status,
          toStatus: status,
          note: 'Status updated via edit form',
        },
      });
      updated.status = status;
    }

    return updated;
  });
}

export async function deleteApplication(id, userId) {
  const existing = await prisma.application.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError('Application not found');
  }

  return await prisma.application.delete({
    where: { id },
  });
}

export async function updateStatus(id, userId, newStatus, note) {
  const existing = await prisma.application.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError('Application not found');
  }

  if (existing.status === newStatus) {
    return existing; // No-op if status is same
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id },
      data: { status: newStatus },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus: existing.status,
        toStatus: newStatus,
        note,
      },
    });

    return updated;
  });
}
