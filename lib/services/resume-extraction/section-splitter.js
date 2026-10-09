export function splitResumeIntoSections(text) {
  if (!text) return { education: [], experience: [], skills: [], projects: [], certifications: [] };

  const sections = {
    education: '',
    experience: '',
    skills: '',
    projects: '',
    certifications: '',
    contact: ''
  };

  const lines = text.split('\n');
  let currentSection = 'contact';

  // Naive regex heuristics for section headers
  const headerPatterns = {
    education: /^(education|academic background|qualifications)/i,
    experience: /^(experience|work experience|employment history)/i,
    skills: /^(skills|technical skills|technologies|core competencies)/i,
    projects: /^(projects|personal projects|open source)/i,
    certifications: /^(certifications|licenses)/i
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a header
    let matchedHeader = null;
    for (const [section, pattern] of Object.entries(headerPatterns)) {
      if (pattern.test(trimmed) && trimmed.length < 50) { // Headers are usually short
        matchedHeader = section;
        break;
      }
    }

    if (matchedHeader) {
      currentSection = matchedHeader;
    } else {
      sections[currentSection] += trimmed + '\n';
    }
  }

  // Very naive extraction: just returning the raw text blocks per section
  // Real implementation would parse out individual items (jobs, degrees)
  return {
    contact: sections.contact.trim(),
    education: sections.education.trim() ? [{ text: sections.education.trim() }] : [],
    experience: sections.experience.trim() ? [{ text: sections.experience.trim() }] : [],
    skills: sections.skills.trim() ? [{ text: sections.skills.trim() }] : [],
    projects: sections.projects.trim() ? [{ text: sections.projects.trim() }] : [],
    certifications: sections.certifications.trim() ? [{ text: sections.certifications.trim() }] : [],
  };
}
