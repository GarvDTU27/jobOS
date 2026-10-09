import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../lib/db/prisma';

describe('Job, Skill, JobSkill Models', () => {
  let user;

  beforeAll(async () => {
    // Create a user for foreign key constraints
    user = await prisma.user.create({
      data: {
        email: `job_test_${Date.now()}@example.com`,
        passwordHash: 'hashed_password',
        name: 'Job Tester'
      }
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should enforce unique constraint on Skill.normalizedName', async () => {
    const skillName1 = `JavaScript_${Date.now()}`;
    const normalizedName = `javascript_${Date.now()}`;
    
    // Create first skill
    await prisma.skill.create({
      data: {
        name: skillName1,
        normalizedName: normalizedName,
      }
    });

    // Try to create second skill with same normalizedName
    const skillName2 = `JAVASCRIPT_${Date.now()}`;
    
    await expect(
      prisma.skill.create({
        data: {
          name: skillName2,
          normalizedName: normalizedName,
        }
      })
    ).rejects.toThrow(/Unique constraint failed on the fields: \(`normalizedName`\)/);
  });

  it('should create Job, Skill, and link via JobSkill', async () => {
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        company: 'Tech Corp',
        role: 'Software Engineer',
      }
    });

    const skill = await prisma.skill.create({
      data: {
        name: `React_${Date.now()}`,
        normalizedName: `react_${Date.now()}`,
      }
    });

    const jobSkill = await prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: skill.id,
        requirement: 'REQUIRED'
      }
    });

    expect(jobSkill.jobId).toBe(job.id);
    expect(jobSkill.skillId).toBe(skill.id);
    expect(jobSkill.requirement).toBe('REQUIRED');

    // Retrieve job with skills
    const jobWithSkills = await prisma.job.findUnique({
      where: { id: job.id },
      include: { skills: { include: { skill: true } } }
    });

    expect(jobWithSkills.skills.length).toBe(1);
    expect(jobWithSkills.skills[0].skill.id).toBe(skill.id);
  });

  it('should enforce unique constraint on [jobId, skillId] in JobSkill', async () => {
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        company: 'Data Inc',
        role: 'Data Scientist',
      }
    });

    const skill = await prisma.skill.create({
      data: {
        name: `Python_${Date.now()}`,
        normalizedName: `python_${Date.now()}`,
      }
    });

    // First link should succeed
    await prisma.jobSkill.create({
      data: {
        jobId: job.id,
        skillId: skill.id,
      }
    });

    // Second link with same jobId and skillId should fail
    await expect(
      prisma.jobSkill.create({
        data: {
          jobId: job.id,
          skillId: skill.id,
        }
      })
    ).rejects.toThrow(/Unique constraint failed on the fields: \(`jobId`,`skillId`\)/);
  });

  it('should cascade delete JobAnalysis when Job is deleted', async () => {
    const job = await prisma.job.create({
      data: {
        userId: user.id,
        company: 'AI Inc',
        role: 'Prompt Engineer',
      }
    });

    const jobAnalysis = await prisma.jobAnalysis.create({
      data: {
        jobId: job.id,
        seniority: 'Mid-Level',
        responsibilities: ['Write prompts', 'Evaluate outputs'],
      }
    });

    expect(jobAnalysis.jobId).toBe(job.id);

    // Delete the Job
    await prisma.job.delete({
      where: { id: job.id }
    });

    // Check if JobAnalysis was deleted
    const deletedAnalysis = await prisma.jobAnalysis.findUnique({
      where: { id: jobAnalysis.id }
    });

    expect(deletedAnalysis).toBeNull();
  });
});
