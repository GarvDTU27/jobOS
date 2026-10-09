import { AIProviderError } from '../utils/errors';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, process.env.NODE_ENV === 'test' ? 10 : ms));

/**
 * Calls Google Gemini REST API with structured output validation and automatic retries.
 * 
 * @param {Object} params
 * @param {string} params.system The system prompt
 * @param {Array<{role: string, content: string}>} params.messages Array of messages for the conversation
 * @param {import('zod').ZodSchema} params.schema Zod schema for structured output validation
 * @param {number} [params.maxRetries=1] Maximum number of retries for schema validation
 * @returns {Promise<any>} The parsed and validated JSON object
 */
export async function complete({ system, messages, schema, maxRetries = 1 }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  if (!apiKey && process.env.NODE_ENV !== 'test') {
    console.warn('GEMINI_API_KEY is not set. AI functions will fail.');
  }

  // Format messages for Gemini API
  // Gemini uses role 'user' and 'model'
  let contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  let attempt = 0;
  const maxProviderRetries = 2;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey || 'dummy-key'}`;

  while (attempt <= maxRetries) {
    try {
      let providerAttempt = 0;
      let responseData = null;

      // Provider call loop (handling rate limits / 5xx)
      while (providerAttempt <= maxProviderRetries) {
        try {
          const body = {
            generationConfig: {
              temperature: 0,
              responseMimeType: 'application/json'
            },
            contents
          };

          if (system) {
            body.system_instruction = {
              parts: [{ text: system }]
            };
          }

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            const error = new Error(`Gemini API error (${res.status}): ${errorText}`);
            error.status = res.status;
            throw error;
          }

          responseData = await res.json();
          break; // Success
        } catch (error) {
          providerAttempt++;
          if (providerAttempt > maxProviderRetries || (error.status !== 429 && (!error.status || error.status < 500))) {
            throw new AIProviderError(`Gemini API request failed: ${error.message}`);
          }
          // Exponential backoff
          await sleep(Math.pow(2, providerAttempt) * 1000);
        }
      }

      const candidate = responseData?.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini returned an empty response or was filtered by safety settings');
      }

      let parsedJson;
      try {
        // Handle potential markdown code fencing if returned
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : rawText;
        parsedJson = JSON.parse(jsonString.trim());
      } catch (e) {
        throw new Error('Failed to parse response as JSON');
      }

      // Validate against Zod schema
      const result = schema.safeParse(parsedJson);
      if (result.success) {
        return result.data;
      }

      // Schema validation failed, retry with feedback
      if (attempt < maxRetries) {
        contents.push({ role: 'model', parts: [{ text: rawText }] });
        contents.push({
          role: 'user',
          parts: [{
            text: `Your previous response failed schema validation. Please correct the following errors and provide the output as valid JSON matching the requested schema:\n\n${result.error.message}`
          }]
        });
      } else {
        throw new AIProviderError(`Schema validation failed after ${maxRetries} retries: ${result.error.message}`);
      }

    } catch (error) {
      if (error instanceof AIProviderError) {
        if (error.message.startsWith('Schema') && attempt < maxRetries) {
          // Continue loop
        } else {
          throw error;
        }
      } else if (attempt < maxRetries) {
        contents.push({
          role: 'user',
          parts: [{
            text: `Your previous response was not valid JSON. Please provide ONLY a valid JSON object matching the requested schema.`
          }]
        });
      } else {
        throw new AIProviderError(`Failed to get valid output after ${maxRetries} retries: ${error.message}`);
      }
    }
    attempt++;
  }
}
