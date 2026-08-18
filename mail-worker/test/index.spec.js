import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Cloud Mail worker', () => {
	it('serves the built SPA (unit style)', async () => {
		const request = new Request('http://example.com');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.text();
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(body).toContain('<title>Cloud Mail</title>');
		expect(body).toContain('<div id="app"></div>');
	});

	it('serves the built SPA (integration style)', async () => {
		const response = await SELF.fetch('http://example.com');
		const body = await response.text();
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(body).toContain('<title>Cloud Mail</title>');
		expect(body).toContain('<div id="app"></div>');
	});
});
