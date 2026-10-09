import prisma from '../db/prisma.js';
import { getApplicationById } from './application-service.js';

export async function addTagToApplication(applicationId, userId, tagName) {
  // Ensure application belongs to user
  await getApplicationById(applicationId, userId);

  // Normalize tag name (lowercase, trim) to avoid duplicates like 'Remote' and ' remote '
  const normalizedName = tagName.trim().toLowerCase();

  return await prisma.$transaction(async (tx) => {
    // Find or create the tag
    let tag = await tx.tag.findUnique({
      where: { name: normalizedName },
    });

    if (!tag) {
      tag = await tx.tag.create({
        data: { name: normalizedName },
      });
    }

    // Link tag to application (using upsert or try-catch for unique constraint)
    const applicationTag = await tx.applicationTag.upsert({
      where: {
        applicationId_tagId: {
          applicationId,
          tagId: tag.id,
        },
      },
      create: {
        applicationId,
        tagId: tag.id,
      },
      update: {}, // Do nothing if it already exists
    });

    return { ...applicationTag, tag };
  });
}

export async function removeTagFromApplication(applicationId, userId, tagId) {
  await getApplicationById(applicationId, userId);

  await prisma.applicationTag.deleteMany({
    where: {
      applicationId,
      tagId,
    },
  });
}

export async function getTagsForApplication(applicationId, userId) {
  await getApplicationById(applicationId, userId);

  const applicationTags = await prisma.applicationTag.findMany({
    where: { applicationId },
    include: { tag: true },
  });

  return applicationTags.map((at) => at.tag);
}
