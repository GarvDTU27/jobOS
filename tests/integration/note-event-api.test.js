import { describe, it, expect, beforeEach, vi } from 'vitest';
import prisma from '../../lib/db/prisma.js';
import { GET as getNotes, POST as createNote } from '../../app/api/applications/[id]/notes/route.js';
import { PATCH as updateNote, DELETE as deleteNote } from '../../app/api/applications/[id]/notes/[noteId]/route.js';
import { GET as getEvents, POST as createEvent } from '../../app/api/applications/[id]/events/route.js';
import { PATCH as updateEvent, DELETE as deleteEvent } from '../../app/api/applications/[id]/events/[eventId]/route.js';

vi.mock('../../lib/auth/session.js', () => ({
  getSessionOrThrow: vi.fn(),
}));
import { getSessionOrThrow } from '../../lib/auth/session.js';

describe('Note and Event API Routes', () => {
  let userA, userB, appA, appB;

  beforeEach(async () => {
    await prisma.applicationNote.deleteMany();
    await prisma.applicationEvent.deleteMany();
    await prisma.application.deleteMany();
    await prisma.user.deleteMany();

    userA = await prisma.user.create({ data: { email: 'a@example.com', passwordHash: 'dummy' } });
    userB = await prisma.user.create({ data: { email: 'b@example.com', passwordHash: 'dummy' } });

    appA = await prisma.application.create({ data: { userId: userA.id, company: 'A', role: 'A' } });
    appB = await prisma.application.create({ data: { userId: userB.id, company: 'B', role: 'B' } });

    getSessionOrThrow.mockResolvedValue({ user: { id: userA.id } });
  });

  const mockRequest = (method, body = null) => {
    return new Request('http://localhost:3000', {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  describe('Notes', () => {
    it('creates a note', async () => {
      const res = await createNote(mockRequest('POST', { body: 'Test Note' }), { params: { id: appA.id } });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.body).toBe('Test Note');
    });

    it('rejects creating note for another users application', async () => {
      const res = await createNote(mockRequest('POST', { body: 'Hack' }), { params: { id: appB.id } });
      expect(res.status).toBe(404);
    });

    it('gets notes', async () => {
      await prisma.applicationNote.create({ data: { applicationId: appA.id, body: 'Note 1' } });
      
      const res = await getNotes(mockRequest('GET'), { params: { id: appA.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(1);
    });

    it('updates a note', async () => {
      const note = await prisma.applicationNote.create({ data: { applicationId: appA.id, body: 'Note 1' } });
      
      const res = await updateNote(mockRequest('PATCH', { body: 'Updated Note' }), { params: { id: appA.id, noteId: note.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.body).toBe('Updated Note');
    });

    it('deletes a note', async () => {
      const note = await prisma.applicationNote.create({ data: { applicationId: appA.id, body: 'Note 1' } });
      
      const res = await deleteNote(mockRequest('DELETE'), { params: { id: appA.id, noteId: note.id } });
      expect(res.status).toBe(204);

      const check = await prisma.applicationNote.findUnique({ where: { id: note.id } });
      expect(check).toBeNull();
    });
  });

  describe('Events', () => {
    it('creates an event', async () => {
      const res = await createEvent(mockRequest('POST', { type: 'INTERVIEW', title: 'Call' }), { params: { id: appA.id } });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe('Call');
    });

    it('rejects creating event for another users application', async () => {
      const res = await createEvent(mockRequest('POST', { type: 'INTERVIEW', title: 'Call' }), { params: { id: appB.id } });
      expect(res.status).toBe(404);
    });

    it('gets events', async () => {
      await prisma.applicationEvent.create({ data: { applicationId: appA.id, type: 'INTERVIEW', title: 'Call' } });
      
      const res = await getEvents(mockRequest('GET'), { params: { id: appA.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(1);
    });

    it('updates an event', async () => {
      const event = await prisma.applicationEvent.create({ data: { applicationId: appA.id, type: 'INTERVIEW', title: 'Call' } });
      
      const res = await updateEvent(mockRequest('PATCH', { title: 'Updated Call' }), { params: { id: appA.id, eventId: event.id } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe('Updated Call');
    });

    it('deletes an event', async () => {
      const event = await prisma.applicationEvent.create({ data: { applicationId: appA.id, type: 'INTERVIEW', title: 'Call' } });
      
      const res = await deleteEvent(mockRequest('DELETE'), { params: { id: appA.id, eventId: event.id } });
      expect(res.status).toBe(204);

      const check = await prisma.applicationEvent.findUnique({ where: { id: event.id } });
      expect(check).toBeNull();
    });
  });
});
