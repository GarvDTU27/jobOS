import { normalizeSkill, areSkillsMatching } from './skill-normalizer.js';
import { resolveWeights, DEFAULT_WEIGHTS } from './weights.js';

const STOP_WORDS = new Set([
  'and', 'the', 'with', 'for', 'to', 'in', 'of', 'a', 'an', 'on', 'at', 'by',
  'from', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'against', 'during', 'without', 'before', 'under', 'around', 'among',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
  'may', 'might', 'must', 'we', 'our', 'you', 'your', 'they', 'their',
  'that', 'which', 'who', 'whom', 'this', 'these', 'those', 'such',
]);

const DEGREE_LEVELS = {
  doctorate: 5,
  phd: 5,
  master: 4,
  ms: 4,
  mba: 4,
  msc: 4,
  ma: 4,
  bachelor: 3,
  bs: 3,
  ba: 3,
  bsc: 3,
  btech: 3,
  associate: 2,
  high_school: 1,
  none: 0,
};

const SENIORITY_LEVELS = {
  intern: 1,
  junior: 1,
  entry: 1,
  associate: 1,
  mid: 2,
  intermediate: 2,
  senior: 3,
  sr: 3,
  lead: 4,
  staff: 4,
  principal: 4,
  manager: 4,
  director: 5,
  head: 5,
  vp: 5,
  executive: 5,
};

function parseDegreeLevel(text = '') {
  if (!text) return 0;
  const lower = text.toLowerCase();
  if (lower.includes('phd') || lower.includes('doctorate')) return 5;
  if (lower.includes('master') || lower.includes('ms ') || lower.includes('mba') || lower.includes('m.s.')) return 4;
  if (lower.includes('bachelor') || lower.includes('bs ') || lower.includes('b.s.') || lower.includes('btech') || lower.includes('undergraduate')) return 3;
  if (lower.includes('associate')) return 2;
  if (lower.includes('high school')) return 1;
  return 0;
}

function parseSeniorityLevel(text = '') {
  if (!text) return 2; // Default to mid-level
  const lower = text.toLowerCase();
  for (const [key, level] of Object.entries(SENIORITY_LEVELS)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower)) {
      return level;
    }
  }
  return 2;
}

function parseExperienceYearsRequired(reqText = '', description = '') {
  const combined = `${reqText || ''} ${description || ''}`;
  const match = combined.match(/(?:(\d+)\+?\s*(?:to|-)\s*(\d+)?|(\d+)\+?)\s*(?:years|yrs)/i);
  if (match) {
    const years = parseInt(match[1] || match[3] || '0', 10);
    return isNaN(years) ? 0 : years;
  }
  return 0;
}

function calculateCandidateExperienceYears(experience = []) {
  if (!Array.isArray(experience) || experience.length === 0) return 0;

  let totalMonths = 0;
  for (const item of experience) {
    if (item.startDate) {
      const start = new Date(item.startDate);
      const end = item.isCurrent || !item.endDate ? new Date() : new Date(item.endDate);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (diffMonths > 0) {
        totalMonths += diffMonths;
        continue;
      }
    }
    // Fallback if dates are absent or invalid: assume 18 months per listed role
    totalMonths += 18;
  }

  return Math.max(0, Math.round((totalMonths / 12) * 10) / 10);
}

function tokenize(text = '') {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Computes Technical Skills Match Score and categorizes skills into gap records.
 */
function evaluateTechnicalSkills(resumeSkills = [], jobSkills = [], semanticPairs = []) {
  const normalizedResumeSkills = resumeSkills
    .map(s => {
      const name = typeof s === 'string' ? s : s?.name;
      return { original: name, normalized: normalizeSkill(name) };
    })
    .filter(s => Boolean(s.normalized));

  const gapRecords = [];
  const strongMatches = [];
  const partialMatches = [];
  const missingSkills = [];

  let earnedPoints = 0;
  let totalPossiblePoints = 0;

  for (const js of jobSkills) {
    const rawJobSkillName = typeof js === 'string' ? js : (js?.name || js?.skill?.name || '');
    const normJobSkill = normalizeSkill(rawJobSkillName);
    if (!normJobSkill) continue;

    const requirement = js?.requirement || 'REQUIRED';
    let baseWeight = 2.0;
    if (requirement === 'REQUIRED') baseWeight = 3.0;
    else if (requirement === 'PREFERRED') baseWeight = 1.5;
    else if (requirement === 'INFERRED') baseWeight = 1.0;

    totalPossiblePoints += baseWeight;

    // Check 1: Deterministic exact or alias match
    const directMatch = normalizedResumeSkills.find(rs => rs.normalized === normJobSkill);
    if (directMatch) {
      earnedPoints += baseWeight;
      strongMatches.push({ jobSkill: rawJobSkillName, resumeSkill: directMatch.original });
      gapRecords.push({
        skillName: rawJobSkillName,
        matchLevel: 'STRONG',
        requirement,
        evidence: `Direct match: ${directMatch.original}`,
      });
      continue;
    }

    // Check 2: Semantic residual match
    const semanticMatch = semanticPairs.find(
      pair => areSkillsMatching(pair.jobSkill, rawJobSkillName) || normalizeSkill(pair.jobSkill) === normJobSkill
    );

    if (semanticMatch && semanticMatch.confidence >= 0.5) {
      const credit = Math.min(1.0, semanticMatch.confidence) * 0.75;
      earnedPoints += baseWeight * credit;
      partialMatches.push({
        jobSkill: rawJobSkillName,
        resumeSkill: semanticMatch.resumeSkill,
        confidence: semanticMatch.confidence,
      });
      gapRecords.push({
        skillName: rawJobSkillName,
        matchLevel: 'PARTIAL',
        requirement,
        evidence: `Semantic match: ${semanticMatch.resumeSkill} (${Math.round(semanticMatch.confidence * 100)}% confidence)`,
      });
      continue;
    }

    // Check 3: Missing
    missingSkills.push({ jobSkill: rawJobSkillName, requirement });
    gapRecords.push({
      skillName: rawJobSkillName,
      matchLevel: 'MISSING',
      requirement,
      evidence: null,
    });
  }

  const technicalSkillsScore = totalPossiblePoints > 0
    ? Math.min(100, Math.max(0, Math.round((earnedPoints / totalPossiblePoints) * 100)))
    : 100;

  return {
    technicalSkillsScore,
    gapRecords,
    strongMatches,
    partialMatches,
    missingSkills,
  };
}

/**
 * Pure deterministic match computation over resume and job data.
 * Zero database or external network dependencies.
 * 
 * @param {Object} params
 * @param {Object} params.resumeData Structured resume object (skills, experience, education, rawText)
 * @param {Object} params.jobData Structured job object (role, skills, experienceReq, analysis)
 * @param {Array<{ resumeSkill: string, jobSkill: string, confidence: number }>} [params.semanticPairs] Semantic matches from AI
 * @param {Object} [params.weights] Optional user preference weight overrides
 * @returns {Object} Deterministic match evaluation with overall and category scores
 */
export function computeMatch({ resumeData = {}, jobData = {}, semanticPairs = [], weights: weightOverrides }) {
  const weights = resolveWeights(weightOverrides);

  // 1. Technical Skills Score & Gap Records
  const {
    technicalSkillsScore,
    gapRecords,
    strongMatches,
    partialMatches,
    missingSkills,
  } = evaluateTechnicalSkills(resumeData.skills || [], jobData.skills || [], semanticPairs);

  // 2. Experience Score
  const requiredYears = parseExperienceYearsRequired(jobData.experienceReq, jobData.description);
  const candidateYears = calculateCandidateExperienceYears(resumeData.experience || []);
  let experienceScore = 100;
  if (requiredYears > 0) {
    experienceScore = candidateYears >= requiredYears
      ? 100
      : Math.min(100, Math.max(0, Math.round((candidateYears / requiredYears) * 100)));
  }

  // 3. Education Score
  const jobEduText = jobData.analysis?.educationReq || '';
  const requiredEduLevel = parseDegreeLevel(jobEduText);
  let candidateHighestEduLevel = 0;
  for (const edu of resumeData.education || []) {
    const lvl = parseDegreeLevel(edu.degree || edu.field || '');
    if (lvl > candidateHighestEduLevel) {
      candidateHighestEduLevel = lvl;
    }
  }

  let educationScore = 100;
  if (requiredEduLevel > 0) {
    if (candidateHighestEduLevel >= requiredEduLevel) {
      educationScore = 100;
    } else if (candidateHighestEduLevel === requiredEduLevel - 1) {
      educationScore = 75;
    } else if (candidateHighestEduLevel === requiredEduLevel - 2) {
      educationScore = 50;
    } else {
      educationScore = 30;
    }
  }

  // 4. Responsibilities Score
  const jobResponsibilities = jobData.analysis?.responsibilities || [];
  let responsibilitiesScore = 100;
  if (Array.isArray(jobResponsibilities) && jobResponsibilities.length > 0) {
    const jobRespTokens = new Set();
    jobResponsibilities.forEach(r => tokenize(r).forEach(t => jobRespTokens.add(t)));

    if (jobRespTokens.size > 0) {
      const candidateBulletsText = (resumeData.experience || [])
        .flatMap(exp => {
          if (Array.isArray(exp.bullets)) {
            return exp.bullets.map(b => (typeof b === 'string' ? b : b?.text || ''));
          }
          return [];
        })
        .join(' ');

      const candidateTokens = new Set(tokenize(candidateBulletsText + ' ' + (resumeData.rawText || '')));
      let matchCount = 0;
      jobRespTokens.forEach(t => {
        if (candidateTokens.has(t)) matchCount++;
      });

      responsibilitiesScore = Math.min(100, Math.max(0, Math.round((matchCount / jobRespTokens.size) * 100)));
    }
  }

  // 5. Keywords Score
  const jobKeywords = jobData.analysis?.keywords || [];
  let keywordsScore = 100;
  if (Array.isArray(jobKeywords) && jobKeywords.length > 0) {
    const resumeFullCorpus = (
      (resumeData.rawText || '') + ' ' +
      (resumeData.skills || []).map(s => (typeof s === 'string' ? s : s?.name)).join(' ')
    ).toLowerCase();

    let matchedKeywords = 0;
    for (const kw of jobKeywords) {
      if (typeof kw === 'string' && resumeFullCorpus.includes(kw.toLowerCase())) {
        matchedKeywords++;
      }
    }
    keywordsScore = Math.min(100, Math.max(0, Math.round((matchedKeywords / jobKeywords.length) * 100)));
  }

  // 6. Seniority Score
  const targetSeniorityLevel = parseSeniorityLevel(jobData.analysis?.seniority || jobData.role || '');
  let candidateSeniorityLevel = 1;
  if (candidateYears >= 8) candidateSeniorityLevel = 4;
  else if (candidateYears >= 5) candidateSeniorityLevel = 3;
  else if (candidateYears >= 2) candidateSeniorityLevel = 2;

  // Title keywords can bump level
  for (const exp of resumeData.experience || []) {
    const titleLvl = parseSeniorityLevel(exp.title || '');
    if (titleLvl > candidateSeniorityLevel) {
      candidateSeniorityLevel = titleLvl;
    }
  }

  let seniorityScore = 100;
  if (candidateSeniorityLevel >= targetSeniorityLevel) {
    seniorityScore = 100;
  } else if (candidateSeniorityLevel === targetSeniorityLevel - 1) {
    seniorityScore = 75;
  } else if (candidateSeniorityLevel === targetSeniorityLevel - 2) {
    seniorityScore = 50;
  } else {
    seniorityScore = 25;
  }

  // Weighted overall calculation
  const weightedSum = (
    technicalSkillsScore * weights.technicalSkills +
    experienceScore * weights.experience +
    educationScore * weights.education +
    responsibilitiesScore * weights.responsibilities +
    keywordsScore * weights.keywords +
    seniorityScore * weights.seniority
  );

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedSum)));

  return {
    overallScore,
    categoryScores: {
      technicalSkillsScore,
      experienceScore,
      educationScore,
      responsibilitiesScore,
      keywordsScore,
      seniorityScore,
    },
    skillMatchDetails: {
      strongMatches,
      partialMatches,
      missingSkills,
    },
    skillGaps: gapRecords,
    weightsUsed: weights,
  };
}
