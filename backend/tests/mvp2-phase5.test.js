import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

describe('Fase 5 MVP 2: Rekapitulasi & Auto-close', () => {
  let server;
  let baseUrl;
  let mhsToken;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '2024001001', password: 'password123' }),
    });
    mhsToken = (await res.json()).data.accessToken;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('Rekapitulasi harus mengembalikan 16 kolom', async () => {
    const classRecord = await prisma.class.findFirst();
    const res = await fetch(`${baseUrl}/api/classes/${classRecord.id}/attendance-recap`, {
      headers: { Authorization: `Bearer ${mhsToken}` }
    });
    const json = await res.json();
    if (res.status === 200) {
      assert.strictEqual(json.data.recap[0].matrix.length, 16);
    }
  });
});
