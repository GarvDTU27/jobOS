/**
 * Guards against basic prompt injection by wrapping untrusted user content 
 * in distinct XML-like tags and logging known injection markers.
 */

const INJECTION_MARKERS = [
  /ignore (all )?previous instructions/i,
  /system:/i,
  /you are now/i,
  /disregard the above/i,
  /forget your instructions/i
];

/**
 * Scans content for potential injection markers and logs a warning if found.
 * Does NOT block or strip the content, as structured extraction + validation
 * is our primary defense.
 * 
 * @param {string} text Untrusted user text
 */
function logInjectionMarkers(text) {
  if (!text) return;
  
  for (const marker of INJECTION_MARKERS) {
    if (marker.test(text)) {
      console.warn(`[PromptGuard] Potential injection marker detected: ${marker.source}`);
      // In a real production app we might ship this to Datadog/Sentry
    }
  }
}

/**
 * Wraps untrusted user content in delimiter tags to clearly separate it from instructions.
 * 
 * @param {string} text The untrusted text (e.g. pasted JD, parsed resume)
 * @param {string} tag The XML-like tag to use (default: untrusted_document)
 * @returns {string} The wrapped text
 */
export function buildUntrustedContentBlock(text, tag = 'untrusted_document') {
  if (!text) return '';
  logInjectionMarkers(text);
  
  // Escape closing tags to prevent the user from terminating the block early
  // e.g. replacing </untrusted_document> with \</untrusted_document\>
  const escapedText = text.replace(new RegExp(`</${tag}>`, 'gi'), `\\</${tag}\\>`);
  
  return `<${tag}>\n${escapedText}\n</${tag}>`;
}
