import prisma from '../db/prisma';
import { LocalStorageProvider } from '../storage/local-provider';
import { parseDocument } from '../parsers/index';
import { ParserError } from '../parsers/contract';
import { ValidationError, NotFoundError } from '../utils/errors';
import crypto from 'node:crypto';
import path from 'node:path';
import { splitResumeIntoSections } from './resume-extraction/section-splitter';

const storage = new LocalStorageProvider(path.join(process.cwd(), 'uploads'));

export const resumeService = {
  async uploadResume(userId, fileBuffer, fileType, originalName, name, isDefault) {
    // Save to storage
    const storageKey = `${userId}/${crypto.randomUUID()}${path.extname(originalName)}`;
    await storage.save(fileBuffer, storageKey);

    try {
      // Transaction for setting default uniqueness and creating resume
      const resume = await prisma.$transaction(async (tx) => {
        if (isDefault) {
          await tx.resume.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
          });
        }

        return await tx.resume.create({
          data: {
            userId,
            name,
            fileType,
            fileSize: fileBuffer.length,
            storageKey,
            isDefault,
            parseStatus: 'PENDING'
          }
        });
      });

      // Kick off parsing async to not block upload response, or do it inline
      // For MVP, doing it inline is fine if it's fast enough, but doing async is safer.
      // We will await it here for simplicity, or return it immediately.
      // Let's do it inline so we can return the parsed status.
      
      try {
        const text = await parseDocument(fileBuffer, fileType);
        
        // Extract sections
        const sections = splitResumeIntoSections(text);
        
        // Update DB with extracted data
        await prisma.resume.update({
          where: { id: resume.id },
          data: {
            rawText: text,
            parseStatus: 'PARSED',
            // In a real implementation, we would also create Education/Experience/etc. here
            // using the deterministic section splitter results.
          }
        });
        
        return await prisma.resume.findUnique({ where: { id: resume.id } });
      } catch (parseError) {
        await prisma.resume.update({
          where: { id: resume.id },
          data: {
            parseStatus: 'FAILED',
            parseError: parseError instanceof ParserError ? parseError.message : 'Unknown parsing error'
          }
        });
        return await prisma.resume.findUnique({ where: { id: resume.id } });
      }
    } catch (dbError) {
      // Cleanup storage on DB failure
      await storage.delete(storageKey).catch(() => {});
      throw dbError;
    }
  },

  async getResume(userId, id) {
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        education: true,
        experience: true,
        projects: true,
        certifications: true,
        skills: { include: { skill: true } }
      }
    });
    if (!resume) throw new NotFoundError('Resume not found');
    return resume;
  },

  async listResumes(userId, includeArchived = false) {
    const where = { userId };
    if (!includeArchived) {
      where.status = 'ACTIVE';
    }
    return prisma.resume.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateResume(userId, id, data) {
    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) throw new NotFoundError('Resume not found');

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.resume.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false }
        });
      }
      return tx.resume.update({
        where: { id },
        data
      });
    });
  },

  async deleteResume(userId, id) {
    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) throw new NotFoundError('Resume not found');

    await prisma.resume.delete({ where: { id } });
    await storage.delete(resume.storageKey).catch(() => {});
    return true;
  }
};
