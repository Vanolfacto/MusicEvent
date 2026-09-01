import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

let dbAvailable = false;
let accessToken: string;

describe('Auth API', () => {
  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbAvailable = true;

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@demo.local',
          password: 'DemoAdmin123!',
        });

      if (res.status === 200) {
        accessToken = res.body.data.accessToken;
      }
    } catch {
      dbAvailable = false;
      console.warn('PostgreSQL nije dostupan — auth integracioni testovi se preskaču.');
    }
  });

  it('POST /api/auth/login — uspešna prijava sa seed nalogom', async ({ skip }) => {
    if (!dbAvailable) skip();
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.local',
        password: 'DemoAdmin123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@demo.local');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/login — odbija pogrešnu lozinku', async ({ skip }) => {
    if (!dbAvailable) skip();
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.local',
        password: 'PogresnaLozinka1!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register — kreira novog organizatora', async ({ skip }) => {
    if (!dbAvailable) skip();
    const unique = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'Organizator',
        email: `test.org.${unique}@demo.local`,
        password: 'TestPass123!',
        role: 'ORGANIZER',
        organizationName: 'Test Org',
        city: 'Beograd',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('ORGANIZER');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('POST /api/auth/register — validaciona greška (ne zahteva bazu)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'A',
        lastName: 'B',
        email: 'neispravan-email',
        password: 'kratko',
        role: 'ORGANIZER',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validaciona greška');
  });

  it('GET /api/auth/me — zahteva autentifikaciju (ne zahteva bazu)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — vraća trenutnog korisnika', async ({ skip }) => {
    if (!dbAvailable) skip();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('admin@demo.local');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('GET /api/users — samo admin ima pristup (ne zahteva bazu)', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('GET /api/users — admin vidi sve korisnike', async ({ skip }) => {
    if (!dbAvailable) skip();
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].passwordHash).toBeUndefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
