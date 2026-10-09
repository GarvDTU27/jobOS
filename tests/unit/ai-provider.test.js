import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { complete } from '../../lib/ai/provider';
import { AIProviderError } from '../../lib/utils/errors';

describe('AI Provider (Gemini)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const testSchema = z.object({
    result: z.string(),
    score: z.number()
  });

  const createGeminiResponse = (text) => ({
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [{ text }],
            role: 'model'
          },
          finishReason: 'STOP'
        }
      ]
    })
  });

  it('should return successfully when output matches schema', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      createGeminiResponse('```json\n{"result":"success","score":100}\n```')
    );
    global.fetch = mockFetch;

    const result = await complete({
      system: 'Test',
      messages: [{ role: 'user', content: 'test' }],
      schema: testSchema
    });

    expect(result).toEqual({ result: 'success', score: 100 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    
    // Inspect request body
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(requestBody.system_instruction.parts[0].text).toBe('Test');
    expect(requestBody.contents[0].role).toBe('user');
    expect(requestBody.contents[0].parts[0].text).toBe('test');
    expect(requestBody.generationConfig.responseMimeType).toBe('application/json');
  });

  it('should retry once when schema validation fails and then succeed', async () => {
    const mockFetch = vi.fn()
      // First response: missing score
      .mockResolvedValueOnce(createGeminiResponse('{"result":"missing-score"}'))
      // Second response: valid
      .mockResolvedValueOnce(createGeminiResponse('{"result":"fixed","score":90}'));
    
    global.fetch = mockFetch;

    const result = await complete({
      system: 'Test',
      messages: [{ role: 'user', content: 'test' }],
      schema: testSchema,
      maxRetries: 1
    });

    expect(result).toEqual({ result: 'fixed', score: 90 });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify retry message was included in the second call
    const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(secondCallBody.contents.length).toBe(3); // user initial, model response, user retry instruction
    expect(secondCallBody.contents[1].role).toBe('model');
    expect(secondCallBody.contents[2].role).toBe('user');
    expect(secondCallBody.contents[2].parts[0].text).toContain('failed schema validation');
  });

  it('should throw AIProviderError if all retries fail schema validation', async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      createGeminiResponse('{"result":"missing-score"}')
    );
    global.fetch = mockFetch;

    await expect(
      complete({
        system: 'Test',
        messages: [{ role: 'user', content: 'test' }],
        schema: testSchema,
        maxRetries: 1
      })
    ).rejects.toThrow(AIProviderError);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should exponential backoff and throw on provider 500 error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });
    global.fetch = mockFetch;

    await expect(
      complete({
        system: 'Test',
        messages: [{ role: 'user', content: 'test' }],
        schema: testSchema,
        maxRetries: 0
      })
    ).rejects.toThrow(AIProviderError);

    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});
