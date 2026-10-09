/**
 * Canonical skill aliases mapping.
 * Maps common variations, acronyms, and abbreviations to their standardized canonical names.
 */
export const SKILL_ALIASES = {
  // Languages & Runtimes
  'js': 'javascript',
  'javascript': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',
  'py': 'python',
  'python': 'python',
  'golang': 'go',
  'go': 'go',
  'c++': 'cpp',
  'cpp': 'cpp',
  'c#': 'csharp',
  'csharp': 'csharp',
  'dotnet': '.net',
  '.net': '.net',
  'rb': 'ruby',
  'ruby': 'ruby',
  'ror': 'ruby on rails',
  'rails': 'ruby on rails',
  'ruby on rails': 'ruby on rails',
  'php': 'php',
  'node': 'nodejs',
  'node.js': 'nodejs',
  'nodejs': 'nodejs',

  // Frontend frameworks & libraries
  'react': 'react',
  'react.js': 'react',
  'reactjs': 'react',
  'react native': 'react native',
  'rn': 'react native',
  'next': 'nextjs',
  'next.js': 'nextjs',
  'nextjs': 'nextjs',
  'vue': 'vue',
  'vue.js': 'vue',
  'vuejs': 'vue',
  'nuxt': 'nuxtjs',
  'nuxtjs': 'nuxtjs',
  'angular': 'angular',
  'angularjs': 'angular',
  'tailwind': 'tailwindcss',
  'tailwindcss': 'tailwindcss',
  'redux': 'redux',

  // Backend & Cloud / DevOps
  'express': 'expressjs',
  'express.js': 'expressjs',
  'expressjs': 'expressjs',
  'nest': 'nestjs',
  'nestjs': 'nestjs',
  'fastapi': 'fastapi',
  'django': 'django',
  'flask': 'flask',
  'spring': 'spring boot',
  'spring boot': 'spring boot',
  'k8s': 'kubernetes',
  'kubernetes': 'kubernetes',
  'docker': 'docker',
  'aws': 'amazon web services',
  'amazon web services': 'amazon web services',
  'gcp': 'google cloud platform',
  'google cloud': 'google cloud platform',
  'google cloud platform': 'google cloud platform',
  'azure': 'microsoft azure',
  'microsoft azure': 'microsoft azure',
  'ci/cd': 'cicd',
  'cicd': 'cicd',

  // Databases & Storage
  'postgres': 'postgresql',
  'postgresql': 'postgresql',
  'psql': 'postgresql',
  'mongo': 'mongodb',
  'mongodb': 'mongodb',
  'ms sql': 'sql server',
  'mssql': 'sql server',
  'sql server': 'sql server',
  'mysql': 'mysql',
  'redis': 'redis',
  'elasticsearch': 'elasticsearch',
  'elastic search': 'elasticsearch',
  'graphql': 'graphql',
  'gql': 'graphql',

  // AI / ML / Data
  'ml': 'machine learning',
  'machine learning': 'machine learning',
  'ai': 'artificial intelligence',
  'artificial intelligence': 'artificial intelligence',
  'dl': 'deep learning',
  'deep learning': 'deep learning',
  'nlp': 'natural language processing',
  'natural language processing': 'natural language processing',
  'tf': 'tensorflow',
  'tensorflow': 'tensorflow',
  'torch': 'pytorch',
  'pytorch': 'pytorch',
};

/**
 * Normalizes a skill string: lowercases, trims, and resolves known aliases.
 * 
 * @param {string} skill The raw skill string
 * @returns {string} The normalized canonical skill string
 */
export function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') {
    return '';
  }

  const cleaned = skill
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // collapse multiple spaces

  // Direct alias match
  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  // Handle dot stripping (e.g. "node.js" -> "nodejs" if not in aliases)
  const noDots = cleaned.replace(/\./g, '');
  if (SKILL_ALIASES[noDots]) {
    return SKILL_ALIASES[noDots];
  }

  return cleaned;
}

/**
 * Checks if two skill names match directly or through aliases.
 * 
 * @param {string} skillA
 * @param {string} skillB
 * @returns {boolean}
 */
export function areSkillsMatching(skillA, skillB) {
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);

  if (!normA || !normB) {
    return false;
  }

  return normA === normB;
}

/**
 * Searches a list of candidate skills for a match against a target skill.
 * 
 * @param {string} targetSkill 
 * @param {Array<string|{name: string}>} candidateSkills 
 * @returns {string|{name: string}|null} The matched candidate or null
 */
export function findSkillMatch(targetSkill, candidateSkills) {
  if (!targetSkill || !Array.isArray(candidateSkills)) {
    return null;
  }

  const normTarget = normalizeSkill(targetSkill);
  if (!normTarget) return null;

  for (const candidate of candidateSkills) {
    const candidateName = typeof candidate === 'string' ? candidate : candidate?.name;
    if (normalizeSkill(candidateName) === normTarget) {
      return candidate;
    }
  }

  return null;
}
