import prisma from '../db/prisma';
import { extractJobDescription } from '../ai/jd-analysis';
import { parseDocument } from '../parsers';

/**
 * Parses JD text or file, extracts data via AI, and persists Job + JobAnalysis + JobSkills.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} [params.text] Raw JD text if pasted
 * @param {Buffer} [params.fileBuffer] File buffer if uploaded
 * @param {string} [params.mimeType] Declared mime type if uploaded
 * @returns {Promise<import('@prisma/client').Job & { analysis: import('@prisma/client').JobAnalysis, skills: any[] }>}
 */
export async function parseAndSaveJobDescription({ userId, text, fileBuffer, mimeType }) {
  let rawText = text;

  if (fileBuffer) {
    const parseResult = await parseDocument(fileBuffer, mimeType);
    rawText = parseResult.text;
  }

  if (!rawText || !rawText.trim()) {
    throw new Error('No text provided or extracted from document');
  }

  // 1. AI Extraction
  const extracted = await extractJobDescription(rawText);

  // 2. Persist in Transaction
  return await prisma.$transaction(async (tx) => {
    // Determine title/company with fallbacks
    const company = extracted.company || 'Unknown Company';
    const role = extracted.role || 'Unknown Role';

    // Create Job
    const job = await tx.job.create({
      data: {
        userId,
        company,
        role,
        location: extracted.location,
        salaryMin: extracted.salary?.min || null,
        salaryMax: extracted.salary?.max || null,
        currency: extracted.salary?.currency || 'USD',
        employmentType: extracted.employmentType,
        experienceReq: extracted.experience,
        description: rawText, // save the raw text for reference
      }
    });

    // Create JobAnalysis
    const analysis = await tx.jobAnalysis.create({
      data: {
        jobId: job.id,
        seniority: extracted.seniority,
        responsibilities: extracted.responsibilities || [],
        qualifications: extracted.qualifications || [],
        keywords: extracted.keywords || [],
        softSkills: extracted.softSkills || [],
        educationReq: extracted.educationReq,
      }
    });

    // Handle Skills (upsert canonical Skill, then create JobSkill)
    const skillsToReturn = [];
    if (extracted.skills && Array.isArray(extracted.skills)) {
      for (const skillReq of extracted.skills) {
        if (!skillReq.name) continue;
        
        const normalizedName = skillReq.name.toLowerCase().trim();
        
        // Find or create the canonical skill
        let skill = await tx.skill.findUnique({
          where: { normalizedName }
        });
        
        if (!skill) {
          skill = await tx.skill.create({
            data: {
              name: skillReq.name.trim(),
              normalizedName
            }
          });
        }
        
        // Link to Job
        const jobSkill = await tx.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            requirement: skillReq.requirement
          },
          include: { skill: true }
        });
        
        skillsToReturn.push(jobSkill);
      }
    }

    return {
      ...job,
      analysis,
      skills: skillsToReturn
    };
  });
}
