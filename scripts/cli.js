#!/usr/bin/env node
/**
 * CLI entry point for gemini-cli-openai
 * Starts a pure Node.js HTTP server (no Cloudflare Workers runtime)
 * Automatically loads OAuth credentials from ~/.gemini/oauth_creds.json
 */

const { serve } = require('@hono/node-server');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Find the package root directory
const packageRoot = path.join(__dirname, '..');
const CREDS_PATH = path.join(os.homedir(), '.gemini', 'oauth_creds.json');

// Check if OAuth credentials exist
if (!fs.existsSync(CREDS_PATH)) {
	console.error('❌ OAuth credentials not found at:', CREDS_PATH);
	console.error('');
	console.error('Please authenticate first:');
	console.error('  1. npm install -g @google/gemini-cli');
	console.error('  2. gemini');
	console.error('  3. Run /auth and select "Login with Google"');
	console.error('');
	process.exit(1);
}

// Load OAuth credentials
let GCP_SERVICE_ACCOUNT;
try {
	GCP_SERVICE_ACCOUNT = fs.readFileSync(CREDS_PATH, 'utf-8').replace(/\n/g, '');
	console.log('✅ Loaded OAuth credentials from ~/.gemini/oauth_creds.json');
} catch (err) {
	console.error('❌ Failed to read OAuth credentials:', err.message);
	process.exit(1);
}

// Create in-memory KV store (simple Map implementation)
class MemoryKV {
	constructor() {
		this.store = new Map();
	}

	async get(key, type) {
		const value = this.store.get(key);
		if (!value) return null;

		const { data, expiry } = value;
		if (expiry && Date.now() > expiry) {
			this.store.delete(key);
			return null;
		}

		if (type === 'json') return JSON.parse(data);
		return data;
	}

	async put(key, value, options = {}) {
		const expiry = options.expirationTtl
			? Date.now() + options.expirationTtl * 1000
			: null;

		this.store.set(key, {
			data: typeof value === 'string' ? value : JSON.stringify(value),
			expiry
		});
	}

	async delete(key) {
		this.store.delete(key);
	}
}

// Create mock environment for Workers compatibility
const env = {
	GCP_SERVICE_ACCOUNT,
	GEMINI_PROJECT_ID: process.env.GEMINI_PROJECT_ID,
	GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
	GEMINI_CLI_KV: new MemoryKV(),
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	ENABLE_FAKE_THINKING: process.env.ENABLE_FAKE_THINKING,
	ENABLE_REAL_THINKING: process.env.ENABLE_REAL_THINKING,
	STREAM_THINKING_AS_CONTENT: process.env.STREAM_THINKING_AS_CONTENT,
	ENABLE_AUTO_MODEL_SWITCHING: process.env.ENABLE_AUTO_MODEL_SWITCHING,
	GEMINI_MODERATION_HARASSMENT_THRESHOLD: process.env.GEMINI_MODERATION_HARASSMENT_THRESHOLD,
	GEMINI_MODERATION_HATE_SPEECH_THRESHOLD: process.env.GEMINI_MODERATION_HATE_SPEECH_THRESHOLD,
	GEMINI_MODERATION_SEXUALLY_EXPLICIT_THRESHOLD: process.env.GEMINI_MODERATION_SEXUALLY_EXPLICIT_THRESHOLD,
	GEMINI_MODERATION_DANGEROUS_CONTENT_THRESHOLD: process.env.GEMINI_MODERATION_DANGEROUS_CONTENT_THRESHOLD,
	ENABLE_GEMINI_NATIVE_TOOLS: process.env.ENABLE_GEMINI_NATIVE_TOOLS,
	ENABLE_GOOGLE_SEARCH: process.env.ENABLE_GOOGLE_SEARCH,
	ENABLE_URL_CONTEXT: process.env.ENABLE_URL_CONTEXT,
	GEMINI_TOOLS_PRIORITY: process.env.GEMINI_TOOLS_PRIORITY,
	DEFAULT_TO_NATIVE_TOOLS: process.env.DEFAULT_TO_NATIVE_TOOLS,
	ALLOW_REQUEST_TOOL_CONTROL: process.env.ALLOW_REQUEST_TOOL_CONTROL,
	ENABLE_INLINE_CITATIONS: process.env.ENABLE_INLINE_CITATIONS,
	INCLUDE_GROUNDING_METADATA: process.env.INCLUDE_GROUNDING_METADATA,
	INCLUDE_SEARCH_ENTRY_POINT: process.env.INCLUDE_SEARCH_ENTRY_POINT,
};

// Load the Hono app using tsx to handle TypeScript
const tsxPath = path.join(packageRoot, 'node_modules', '.bin', 'tsx');
const indexPath = path.join(packageRoot, 'src', 'index.ts');

// Use tsx to load TypeScript dynamically
require('tsx/cjs');
const appModule = require(indexPath);
const app = appModule.default || appModule;

// Start Node.js HTTP server
const port = parseInt(process.env.PORT || '8787', 10);

console.log('');
console.log('🚀 Gemini CLI OpenAI Server');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📡 Server: http://localhost:${port}`);
console.log(`🔗 API Endpoint: http://localhost:${port}/v1`);
console.log('');
console.log('Press Ctrl+C to stop');
console.log('');

serve({
	fetch: (request) => app.fetch(request, env),
	port,
});
