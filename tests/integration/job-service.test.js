import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../lib/db/prisma';
import { createJob, getJobById, listJobs, updateJob, archiveJob, deleteJob } from '../../lib/services/job-service';
import { AppError, NotFoundError } from '../../lib/utils/errors';

describe('Job Service', () => {
  let user;
  let job;

  beforeAll(async () => {
    user = await prisma.user.create({
      data: {
        email: `jobservice_test_${Date.now()}@example.com`,
        passwordHash: 'hashed',
        name: 'Job Service Tester'
      }
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should create a job', async () => {
    const data = {
      company: 'Test Corp',
      role: 'Backend Engineer',
      location: 'Remote',
      salaryMin: 100000,
      salaryMax: 150000
    };

    job = await createJob(user.id, data);
    expect(job.company).toBe(data.company);
    expect(job.role).toBe(data.role);
    expect(job.salaryMin).toBe(data.salaryMin);
    expect(job.archived).toBe(false);
  });

  it('should get a job by id', async () => {
    const fetched = await getJobById(job.id, user.id);
    expect(fetched.id).toBe(job.id);
    expect(fetched.company).toBe('Test Corp');
  });

  it('should throw NotFoundError if getting job for another user', async () => {
    await expect(getJobById(job.id, 'other-user-id')).rejects.toThrow(NotFoundError);
  });

  it('should update a job', async () => {
    const updated = await updateJob(job.id, user.id, { location: 'New York' });
    expect(updated.location).toBe('New York');
    expect(updated.role).toBe('Backend Engineer'); // unchanged
  });

  it('should list jobs with search and pagination', async () => {
    await createJob(user.id, { company: 'Alpha LLC', role: 'Frontend' });
    await createJob(user.id, { company: 'Beta Inc', role: 'Backend Dev' });

    const result = await listJobs(user.id, { search: 'backend', take: 10 });
    expect(result.total).toBeGreaterThanOrEqual(2); // 'Test Corp Backend Engineer' and 'Beta Inc Backend Dev'
    expect(result.jobs.some(j => j.company === 'Test Corp')).toBe(true);
    expect(result.jobs.some(j => j.company === 'Beta Inc')).toBe(true);
    expect(result.jobs.some(j => j.company === 'Alpha LLC')).toBe(false);
  });

  it('should archive a job', async () => {
    const archived = await archiveJob(job.id, user.id);
    expect(archived.archived).toBe(true);

    // It shouldn't appear in default list if we list non-archived
    const listResult = await listJobs(user.id, { archived: false });
    expect(listResult.jobs.find(j => j.id === job.id)).toBeUndefined();
    
    // It should appear if we search for archived
    const listArchivedResult = await listJobs(user.id, { archived: true });
    expect(listArchivedResult.jobs.find(j => j.id === job.id)).toBeDefined();
  });

  it('should prevent deletion of job linked to application without force', async () => {
    const newJob = await createJob(user.id, { company: 'Delete Me', role: 'Tester' });
    
    await prisma.application.create({
      data: {
        userId: user.id,
        jobId: newJob.id,
        company: 'Delete Me',
        role: 'Tester'
      }
    });

    await expect(deleteJob(newJob.id, user.id)).rejects.toThrow(AppError);
    await expect(deleteJob(newJob.id, user.id)).rejects.toThrow(/Cannot delete job because it is linked/);

    // Should succeed with force
    await deleteJob(newJob.id, user.id, true);
    
    // Verify job is gone
    await expect(getJobById(newJob.id, user.id)).rejects.toThrow(NotFoundError);
  });

  it('should delete job normally if no applications linked', async () => {
    const toDelete = await createJob(user.id, { company: 'Easy Delete', role: 'Dev' });
    await deleteJob(toDelete.id, user.id);
    await expect(getJobById(toDelete.id, user.id)).rejects.toThrow(NotFoundError);
  });
});
