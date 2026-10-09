import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import prisma from '../../lib/db/prisma';
import crypto from 'node:crypto';
import { POST } from '../../app/api/resumes/route';
import { GET, PATCH, DELETE } from '../../app/api/resumes/[id]/route';

// Mock session
vi.mock('../../lib/auth/session', () => ({
  getSessionOrThrow: vi.fn().mockResolvedValue({ userId: 'test-user-id' })
}));

// Mock parsing so it doesn't fail
vi.mock('../../lib/parsers/index', () => ({
  parseDocument: vi.fn().mockResolvedValue('dummy text')
}));

describe('Resume API', () => {
  let user;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    user = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: `test-${crypto.randomUUID()}@jobos.com`,
        passwordHash: 'dummy',
        name: 'Test User'
      }
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    vi.clearAllMocks();
  });

  const mockRequest = (formData) => {
    return {
      formData: async () => formData,
      url: 'http://localhost/api/resumes'
    };
  };

  it('rejects unsupported MIME type', async () => {
    const formData = new Map();
    formData.set('name', 'My Resume');
    formData.set('isDefault', 'true');
    formData.set('file', {
      type: 'image/jpeg',
      size: 1024,
      name: 'resume.jpg',
      arrayBuffer: async () => new ArrayBuffer(1024)
    });

    const res = await POST(mockRequest(formData));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.message).toBe('Unsupported file type');
  });

  it('rejects oversized file', async () => {
    const formData = new Map();
    formData.set('name', 'My Resume');
    formData.set('isDefault', 'true');
    formData.set('file', {
      type: 'application/pdf',
      size: 11 * 1024 * 1024, // 11MB
      name: 'resume.pdf',
      arrayBuffer: async () => new ArrayBuffer(1024)
    });

    const res = await POST(mockRequest(formData));
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error.message).toBe('File size exceeds limit');
  });

  it('successfully uploads and parses file', async () => {
    const formData = new Map();
    formData.set('name', 'My Resume');
    formData.set('isDefault', 'true');
    formData.set('file', {
      type: 'text/plain',
      size: 10,
      name: 'resume.txt',
      arrayBuffer: async () => new TextEncoder().encode('dummy text').buffer
    });

    const res = await POST(mockRequest(formData));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe('My Resume');
    expect(json.data.parseStatus).toBe('PARSED');
    expect(json.data.rawText).toBe('dummy text');
  });

  it('unsets previous default when uploading a new default', async () => {
    // Create existing default
    await prisma.resume.create({
      data: {
        userId: user.id,
        name: 'Old Default',
        fileType: 'text/plain',
        fileSize: 100,
        storageKey: 'fake/1.txt',
        isDefault: true
      }
    });

    const formData = new Map();
    formData.set('name', 'New Default');
    formData.set('isDefault', 'true');
    formData.set('file', {
      type: 'text/plain',
      size: 10,
      name: 'resume2.txt',
      arrayBuffer: async () => new TextEncoder().encode('dummy text').buffer
    });

    await POST(mockRequest(formData));

    const defaults = await prisma.resume.findMany({ where: { userId: user.id, isDefault: true } });
    expect(defaults.length).toBe(1);
    expect(defaults[0].name).toBe('New Default');
  });
});
