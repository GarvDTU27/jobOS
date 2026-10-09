import prisma from '../db/prisma.js';
import { NotFoundError, AppError } from '../utils/errors.js';

export async function createJob(userId, data) {
  return await prisma.job.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function getJobById(id, userId) {
  const job = await prisma.job.findFirst({
    where: { id, userId },
    include: {
      skills: {
        include: { skill: true }
      }
    }
  });

  if (!job) {
    throw new NotFoundError('Job not found');
  }

  return job;
}

export async function listJobs(userId, options = {}) {
  const { 
    skip = 0, 
    take = 50,
    search,
    archived = false,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = options;

  const where = { userId, archived };

  if (search) {
    where.OR = [
      { company: { contains: search, mode: 'insensitive' } },
      { role: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy = {};
  if (['createdAt', 'company', 'deadline'].includes(sortBy)) {
    orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    prisma.job.count({
      where,
    }),
  ]);

  return { jobs, total, skip, take };
}

export async function updateJob(id, userId, data) {
  const existing = await prisma.job.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError('Job not found');
  }

  return await prisma.job.update({
    where: { id },
    data,
  });
}

export async function archiveJob(id, userId, archived = true) {
  const existing = await prisma.job.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError('Job not found');
  }

  return await prisma.job.update({
    where: { id },
    data: { archived },
  });
}

export async function deleteJob(id, userId, force = false) {
  const existing = await prisma.job.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundError('Job not found');
  }

  // Check if any applications reference this job
  const linkedApplications = await prisma.application.count({
    where: { jobId: id },
  });

  if (linkedApplications > 0 && !force) {
    throw new AppError(`Cannot delete job because it is linked to ${linkedApplications} application(s). Use force=true to delete anyway.`, 409);
  }

  return await prisma.job.delete({
    where: { id },
  });
}
