# 🚀 Gemini CLI OpenAI Worker

Transform Google's Gemini models into OpenAI-compatible endpoints. Access Google's most advanced AI models through familiar OpenAI API patterns, powered by OAuth2 authentication and the same infrastructure that drives the official Gemini CLI.

## 🎯 Primary Use Case: Claude Code Integration

**This project enables Claude Code to use Google Gemini models via [claude-code-router](https://github.com/musistudio/claude-code-router).**

### Quick Start for Claude Code Users

1. **Authenticate with Gemini CLI** (one-time setup):

   ```bash
   npm install -g @google/gemini-cli
   gemini
   # In the Gemini CLI interface, run: /auth
   # Then select "Login with Google"
   ```

   This creates `~/.gemini/oauth_creds.json` with your Google OAuth credentials.
2. **Install the server**:

   ```bash
   npm install -g @vitorcen/gemini-cli-openai
   ```
3. **Start the server**:

   ```bash
   gemini-cli-openai
   ```

   Launches OpenAI-compatible API server on `http://localhost:8787`

4. **Configure claude-code-router**:
   Edit your `~/.claude/ccr-config.json`:

   ```json
   {
     "Providers": [
       {
         "name": "local-openai",
         "api_base_url": "http://127.0.0.1:8787/v1/chat/completions",
         "api_key": "sk-or-v1_not-need",
         "models": [
           "gemini-2.5-pro",
           "gemini-2.5-flash"
         ]
       }
     ],
     "Router": {
       "default": "local-openai,gemini-2.5-pro"
     }
   }
   ```

   Now Claude Code can use Gemini models!

**Links:**

- Official Gemini CLI: [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- Claude Code Router: [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router)

## ✨ Features

- 🔐 **OAuth2 Authentication** - No API keys required, uses your Google account
- ⚡ **Zero-Config Setup** - Automatically reads credentials from `~/.gemini/oauth_creds.json` (created by `gemini` CLI)
- 🎯 **OpenAI-Compatible API** - Drop-in replacement for OpenAI endpoints
- 📚 **OpenAI SDK Support** - Works with official OpenAI SDKs and libraries
- 🖼️ **Vision Support** - Multi-modal conversations with images (base64 & URLs)
- 🔧 **Tool Calling Support** - Function calling with Gemini API integration
- 🧠 **Advanced Reasoning** - Support for Gemini's thinking capabilities with effort controls
- 🛡️ **Content Safety** - Configurable Gemini moderation settings
- 🌐 **Third-party Integration** - Compatible with Open WebUI, ChatGPT clients, and more
- ⚡ **Cloudflare Workers** - Global edge deployment with low latency
- 🔄 **Smart Token Caching** - Intelligent token management with KV storage
- 🆓 **Free Tier Access** - Leverage Google's free tier through Code Assist API
- 📡 **Real-time Streaming** - Server-sent events for live responses with token usage
- 🎭 **Multiple Models** - Access to latest Gemini models including experimental ones

## 🤖 Supported Models


| Model ID                | Context Window | Max Tokens | Thinking Support | Description                                                               |
| ------------------------- | ---------------- | ------------ | ------------------ | --------------------------------------------------------------------------- |
| `gemini-2.5-pro`        | 1M             | 65K        | ✅               | Latest Gemini 2.5 Pro model with reasoning capabilities                   |
| `gemini-2.5-flash`      | 1M             | 65K        | ✅               | Fast Gemini 2.5 Flash model with reasoning capabilities                   |
| `gemini-2.5-flash-lite` | 1M             | 65K        | ✅               | Lightweight version of Gemini 2.5 Flash model with reasoning capabilities |

> **Note:** Gemini 2.5 models have thinking enabled by default. The API automatically manages this:
>
> - When real thinking is disabled (environment), thinking budget is set to 0 to disable it
> - When real thinking is enabled (environment), thinking budget defaults to -1 (dynamic allocation by Gemini)
>
> **Thinking support** has two modes:
>
> - **Fake thinking**: Set `ENABLE_FAKE_THINKING=true` to generate synthetic reasoning text (good for testing)
> - **Real thinking**: Set `ENABLE_REAL_THINKING=true` to use Gemini's native reasoning capabilities
>
> Real thinking is controlled entirely by the `ENABLE_REAL_THINKING` environment variable. You can optionally set a `"thinking_budget"` in your request (token limit for reasoning, -1 for dynamic allocation, 0 to disable thinking entirely).

- **Reasoning Effort Support**: You can control the reasoning effort of thinking models by including `reasoning_effort` in the request body (e.g., `extra_body` or `model_params`). This parameter allows you to fine-tune the model's internal reasoning process, balancing between speed and depth of thought.
  - `none`: Disables thinking (`thinking_budget = 0`).
  - `low`: Sets `thinking_budget = 1024`.
  - `medium`: Sets `thinking_budget = 12288` for flash models, `16384` for other models.
  - `high`: Sets `thinking_budget = 24576` for flash models, `32768` for other models.

> Set `STREAM_THINKING_AS_CONTENT=true` to stream reasoning as content with `<thinking>` tags (DeepSeek R1 style) instead of using the reasoning field.

## 🛠️ Installation & Setup

### For Local Development (Recommended)

**Option A: Global Installation** (Recommended for Claude Code)

```bash
# Install the package
npm install -g gemini-cli-openai

# Run the server
gemini-cli-openai
```

No additional dependencies required! The server runs as a pure Node.js HTTP service.

**Option B: Clone from Source**

```bash
# Clone the repository
git clone https://github.com/your-username/gemini-cli-openai
cd gemini-cli-openai

# Install dependencies
npm install

# Run as pure Node.js server (recommended for Claude Code)
npm start

# OR run with Cloudflare Workers runtime (for testing Workers features)
npm run dev
```

**Note:**

- `npm start` - Pure Node.js HTTP server, directly reads `~/.gemini/oauth_creds.json`, no `.dev.vars` needed
- `npm run dev` - Cloudflare Workers local mode via `wrangler dev`, requires creating `.dev.vars` file with credentials

**To use `npm run dev`, create `.dev.vars` file:**

```bash
# Copy credentials from ~/.gemini/oauth_creds.json (paste as single line)
GCP_SERVICE_ACCOUNT={"access_token":"ya29...","refresh_token":"1//...","scope":"...","token_type":"Bearer","id_token":"eyJ...","expiry_date":1750927763467}
```

### For Production Deployment (Cloudflare Workers)

**Prerequisites:**

1. **Google Account** with access to Gemini
2. **Cloudflare Account** with Workers enabled
3. **Wrangler CLI** installed (`npm install -g wrangler`)

#### Step 1: Authenticate with Gemini CLI

You need OAuth2 credentials from Google. Use the official Gemini CLI to authenticate:

```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Start Gemini CLI
gemini

# In the CLI interface, run:
/auth
# Then select "Login with Google"
```

This creates `~/.gemini/oauth_creds.json` which this project reads automatically.

**Credential file location:**

- **Windows:** `C:\Users\USERNAME\.gemini\oauth_creds.json`
- **macOS/Linux:** `~/.gemini/oauth_creds.json`

The file contains OAuth2 credentials in this format:

```json
{
  "access_token": "ya29.a0AS3H6Nx...",
  "refresh_token": "1//09FtpJYpxOd...",
  "scope": "https://www.googleapis.com/auth/cloud-platform ...",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "expiry_date": 1750927763467
}
```

#### Step 2: Create KV Namespace (for token caching)

```bash
# Create a KV namespace
wrangler kv namespace create "GEMINI_CLI_KV"
```

Update `wrangler.toml` with your KV namespace ID:

```toml
kv_namespaces = [
  { binding = "GEMINI_CLI_KV", id = "your-kv-namespace-id" }
]
```

#### Step 3: Set Credentials as Secrets

```bash
# Set OAuth credentials (paste the entire JSON from ~/.gemini/oauth_creds.json)
wrangler secret put GCP_SERVICE_ACCOUNT

# Optional: Set API key for authentication
wrangler secret put OPENAI_API_KEY
```

#### Step 4: Deploy

```bash
# Clone and install
git clone https://github.com/your-username/gemini-cli-openai
cd gemini-cli-openai
npm install

# Deploy to Cloudflare Workers
npm run deploy
```

Your API will be available at `https://your-worker.workers.dev/v1`

## 🔧 Configuration

### Environment Variables

#### Core Configuration


| Variable                                      | Required | Description                                                                                                                                                                                                  |
| ----------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GCP_SERVICE_ACCOUNT`                         | ✅*      | OAuth2 credentials JSON string.**Local dev: auto-loaded from `~/.gemini/oauth_creds.json` via startup script** (created by `gemini` CLI). **Production: set via `wrangler secret put GCP_SERVICE_ACCOUNT`**. |
| `GEMINI_PROJECT_ID` or `GOOGLE_CLOUD_PROJECT` | ❌       | Google Cloud Project ID.**Auto-discovered via `loadCodeAssist` API if not set** (same mechanism as official `gemini` CLI). Only needed for workspace/enterprise accounts that require explicit project ID.   |
| `OPENAI_API_KEY`                              | ❌       | API key for authentication. If not set, the API is public.                                                                                                                                                   |

#### Thinking & Reasoning


| Variable                     | Description                                                           |
| ------------------------------ | ----------------------------------------------------------------------- |
| `ENABLE_FAKE_THINKING`       | Enable synthetic thinking output for testing (set to`"true"`).        |
| `ENABLE_REAL_THINKING`       | Enable real Gemini thinking output (set to`"true"`).                  |
| `STREAM_THINKING_AS_CONTENT` | Stream thinking as content with`<thinking>` tags (DeepSeek R1 style). |

#### Model & Feature Flags


| Variable                      | Description                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `ENABLE_AUTO_MODEL_SWITCHING` | Enable automatic fallback from pro to flash models on rate limits (set to`"true"`). |
| `ENABLE_GEMINI_NATIVE_TOOLS`  | Master switch to enable all native tools (set to`"true"`).                          |
| `ENABLE_GOOGLE_SEARCH`        | Enable Google Search native tool (set to`"true"`).                                  |
| `ENABLE_URL_CONTEXT`          | Enable URL Context native tool (set to`"true"`).                                    |
| `GEMINI_TOOLS_PRIORITY`       | Set tool priority:`"native_first"` or `"custom_first"`.                             |
| `ALLOW_REQUEST_TOOL_CONTROL`  | Allow request parameters to override tool settings (set to`"false"` to disable).    |
| `ENABLE_INLINE_CITATIONS`     | Inject markdown citations for search results (set to`"true"` to enable).            |
| `INCLUDE_GROUNDING_METADATA`  | Include raw grounding metadata in the stream (set to`"false"` to disable).          |

#### Content Safety


| Variable                                        | Description                                                  |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `GEMINI_MODERATION_HARASSMENT_THRESHOLD`        | Sets the moderation threshold for harassment content.        |
| `GEMINI_MODERATION_HATE_SPEECH_THRESHOLD`       | Sets the moderation threshold for hate speech content.       |
| `GEMINI_MODERATION_SEXUALLY_EXPLICIT_THRESHOLD` | Sets the moderation threshold for sexually explicit content. |
| `GEMINI_MODERATION_DANGEROUS_CONTENT_THRESHOLD` | Sets the moderation threshold for dangerous content.         |

*For safety thresholds, valid options are: `BLOCK_NONE`, `BLOCK_FEW`, `BLOCK_SOME`, `BLOCK_ONLY_HIGH`, `HARM_BLOCK_THRESHOLD_UNSPECIFIED`.*

**Authentication Security:**

- When `OPENAI_API_KEY` is set, all `/v1/*` endpoints require authentication.
- Clients must include the header: `Authorization: Bearer <your-api-key>`.
- Without this environment variable, the API is publicly accessible.
- Recommended format: `sk-` followed by a random string (e.g., `sk-1234567890abcdef...`).

**Thinking Models:**

- **Fake Thinking**: When `ENABLE_FAKE_THINKING` is set to `"true"`, models marked with `thinking: true` will generate synthetic reasoning text before their actual response.
- **Real Thinking**: When `ENABLE_REAL_THINKING` is set to `"true"`, requests with `include_reasoning: true` will use Gemini's native thinking capabilities.
- Real thinking provides genuine reasoning from Gemini and requires thinking-capable models (like Gemini 2.5 Pro/Flash).
- You can control the reasoning token budget with the `thinking_budget` parameter.
- By default, reasoning output is streamed as `reasoning` chunks in the OpenAI-compatible response format.
- When `STREAM_THINKING_AS_CONTENT` is also set to `"true"`, reasoning will be streamed as regular content wrapped in `<thinking></thinking>` tags (DeepSeek R1 style).
- **Optimized UX**: The `</thinking>` tag is only sent when the actual LLM response begins, eliminating awkward pauses between thinking and response.
- If neither thinking mode is enabled, thinking models will behave like regular models.

**Auto Model Switching:**

- When `ENABLE_AUTO_MODEL_SWITCHING` is set to `"true"`, the system will automatically fall back from `gemini-2.5-pro` to `gemini-2.5-flash` when encountering rate limit errors (HTTP 429 or 503).
- This provides seamless continuity when the Pro model quota is exhausted.
- The fallback is indicated in the response with a notification message.
- Only applies to supported model pairs (currently: pro → flash).
- Works for both streaming and non-streaming requests.

### KV Namespaces


| Binding         | Purpose                              |
| ----------------- | -------------------------------------- |
| `GEMINI_CLI_KV` | Token caching and session management |

## 🚨 Troubleshooting

### Common Issues

**401 Authentication Error**

- Check if your OAuth2 credentials are valid
- Ensure the refresh token is working
- Verify the credentials format matches exactly

**Token Refresh Failed**

- Credentials might be from wrong OAuth2 client
- Refresh token might be expired or revoked
- Check the debug cache endpoint for token status

**Project ID Discovery Failed**

- Set `GEMINI_PROJECT_ID` environment variable manually
- Ensure your Google account has access to Gemini

## 💻 Usage Examples

### Cline Integration

[Cline](https://github.com/cline/cline) is a powerful AI assistant extension for VS Code. You can easily configure it to use your Gemini models:

1. **Install Cline** in VS Code from the Extensions marketplace
2. **Configure OpenAI API settings**:

   - Open Cline settings
   - Set **API Provider** to "OpenAI"
   - Set **Base URL** to: `https://your-worker.workers.dev/v1`
   - Set **API Key** to: `sk-your-secret-api-key-here` (use your OPENAI_API_KEY if authentication is enabled)
3. **Select a model**:

   - Choose `gemini-2.5-pro` for complex reasoning tasks
   - Choose `gemini-2.5-flash` for faster responses

### Open WebUI Integration

1. **Add as OpenAI-compatible endpoint**:

   - Base URL: `https://your-worker.workers.dev/v1`
   - API Key: `sk-your-secret-api-key-here` (use your OPENAI_API_KEY if authentication is enabled)
2. **Configure models**:
   Open WebUI will automatically discover available Gemini models through the `/v1/models` endpoint.
3. **Start chatting**:
   Use any Gemini model just like you would with OpenAI models!

### LiteLLM Integration

[LiteLLM](https://github.com/BerriAI/litellm) works seamlessly with this worker, especially when using the DeepSeek R1-style thinking streams:

```python
import litellm

# Configure LiteLLM to use your worker
litellm.api_base = "https://your-worker.workers.dev/v1"
litellm.api_key = "sk-your-secret-api-key-here"

# Use thinking models with LiteLLM
response = litellm.completion(
    model="gemini-2.5-flash",
    messages=[
        {"role": "user", "content": "Solve this step by step: What is 15 * 24?"}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

**Pro Tip**: Set `STREAM_THINKING_AS_CONTENT=true` for optimal LiteLLM compatibility. The `<thinking>` tags format works better with LiteLLM's parsing and various downstream tools.

### OpenAI SDK (Python)

```python
from openai import OpenAI

# Initialize with your worker endpoint
client = OpenAI(
    base_url="https://your-worker.workers.dev/v1",
    api_key="sk-your-secret-api-key-here"  # Use your OPENAI_API_KEY if authentication is enabled
)

# Chat completion
response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain machine learning in simple terms"}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")

# Real thinking mode
response = client.chat.completions.create(
    model="gemini-2.5-pro",
    messages=[
        {"role": "user", "content": "Solve this step by step: What is the derivative of x^3 + 2x^2 - 5x + 3?"}
    ],
    extra_body={
        "include_reasoning": True,
        "thinking_budget": 1024
    },
    stream=True
)

for chunk in response:
    # Real thinking appears in the reasoning field
    if hasattr(chunk.choices[0].delta, 'reasoning') and chunk.choices[0].delta.reasoning:
        print(f"[Thinking] {chunk.choices[0].delta.reasoning}")
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### OpenAI SDK (JavaScript/TypeScript)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://your-worker.workers.dev/v1',
  apiKey: 'sk-your-secret-api-key-here', // Use your OPENAI_API_KEY if authentication is enabled
});

const stream = await openai.chat.completions.create({
  model: 'gemini-2.5-flash',
  messages: [
    { role: 'user', content: 'Write a haiku about coding' }
  ],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

### cURL

```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-secret-api-key-here" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'
```

### Raw JavaScript/TypeScript

```javascript
const response = await fetch('https://your-worker.workers.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gemini-2.5-flash',
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ]
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
      const data = JSON.parse(line.substring(6));
      const content = data.choices[0]?.delta?.content;
      if (content) {
        console.log(content);
      }
    }
  }
}
```

### Raw Python (without SDK)

```python
import requests
import json

url = "https://your-worker.workers.dev/v1/chat/completions"
data = {
    "model": "gemini-2.5-flash",
    "messages": [
        {"role": "user", "content": "Write a Python function to calculate fibonacci"}
    ]
}

response = requests.post(url, json=data, stream=True)

for line in response.iter_lines():
    if line and line.startswith(b'data: '):
        try:
            chunk = json.loads(line[6:].decode())
            content = chunk['choices'][0]['delta'].get('content', '')
            if content:
                print(content, end='')
        except json.JSONDecodeError:
            continue
```

## � Tool Calling Support

The worker supports OpenAI-compatible tool calling (function calling) with seamless integration to Gemini's function calling capabilities.

### Using Tool Calls

Include `tools` and optionally `tool_choice` in your request:

```javascript
const response = await fetch('/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gemini-2.5-pro',
    messages: [
      { role: 'user', content: 'What is the weather in New York?' }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get weather information for a location',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'City name' }
            },
            required: ['location']
          }
        }
      }
    ],
    tool_choice: 'auto'
  })
});
```

### Tool Choice Options

- `auto`: Let the model decide whether to call a function
- `none`: Disable function calling
- `{"type": "function", "function": {"name": "function_name"}}`: Force a specific function call

## 🛡️ Content Safety Settings

Configure Gemini's built-in safety filters using environment variables in the dev.vars:

```bash
# Safety threshold options: BLOCK_NONE, BLOCK_FEW, BLOCK_SOME, BLOCK_ONLY_HIGH, HARM_BLOCK_THRESHOLD_UNSPECIFIED
GEMINI_MODERATION_HARASSMENT_THRESHOLD=BLOCK_NONE
GEMINI_MODERATION_HATE_SPEECH_THRESHOLD=BLOCK_NONE  
GEMINI_MODERATION_SEXUALLY_EXPLICIT_THRESHOLD=BLOCK_SOME
GEMINI_MODERATION_DANGEROUS_CONTENT_THRESHOLD=BLOCK_ONLY_HIGH
```

**Safety Categories:**

- `HARASSMENT`: Content that promotes hatred or violence against individuals/groups
- `HATE_SPEECH`: Derogatory or demeaning language targeting specific groups
- `SEXUALLY_EXPLICIT`: Content containing sexual or adult material
- `DANGEROUS_CONTENT`: Content promoting dangerous or harmful activities

## 📡 API Endpoints

### Base URL

```
https://your-worker.your-subdomain.workers.dev
```

### List Models

```http
GET /v1/models
```

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "gemini-2.5-pro",
      "object": "model",
      "created": 1708976947,
      "owned_by": "google-gemini-cli"
    }
  ]
}
```

### Chat Completions

```http
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "gemini-2.5-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "Hello! How are you?"
    }
  ]
}
```

#### Thinking Mode (Real Reasoning)

For models that support thinking, you can enable real reasoning from Gemini:

```http
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "gemini-2.5-pro",
  "messages": [
    {
      "role": "user", 
      "content": "Solve this math problem step by step: What is 15% of 240?"
    }
  ],
  "include_reasoning": true,
  "thinking_budget": 1024
}
```

The `include_reasoning` parameter enables Gemini's native thinking mode, and `thinking_budget` sets the token limit for reasoning.

**Response (Streaming):**

```
data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1708976947,"model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1708976947,"model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":"! I'm"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1708976947,"model":"gemini-2.5-flash","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":22,"completion_tokens":553,"total_tokens":575}}

data: [DONE]
```

### Debug Endpoints

#### Check Token Cache

```http
GET /v1/debug/cache
```

#### Test Authentication

```http
POST /v1/token-test
POST /v1/test
```

### Image Support (Vision)

The worker supports multimodal conversations with images for vision-capable models. Images can be provided as base64-encoded data URLs or as external URLs.

#### Supported Image Formats

- JPEG, PNG, GIF, WebP
- Base64 encoded (recommended for reliability)
- External URLs (may have limitations with some services)

#### Vision-Capable Models

- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.0-flash-001`
- `gemini-2.0-flash-lite-preview-02-05`
- `gemini-2.0-pro-exp-02-05`

#### Example with Base64 Image

```python
from openai import OpenAI
import base64

# Encode your image
with open("image.jpg", "rb") as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

client = OpenAI(
    base_url="https://your-worker.workers.dev/v1",
    api_key="sk-your-secret-api-key-here"
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What do you see in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
)

print(response.choices[0].message.content)
```

#### Example with Image URL

```bash
curl -X POST https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-secret-api-key-here" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "Describe this image in detail."
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://example.com/image.jpg",
              "detail": "high"
            }
          }
        ]
      }
    ]
  }'
```

#### Multiple Images

You can include multiple images in a single message:

```json
{
  "model": "gemini-2.5-pro",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Compare these two images."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,..."
          }
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/png;base64,..."
          }
        }
      ]
    }
  ]
}
```

### Debug Commands

```bash
# Check KV cache status
curl https://your-worker.workers.dev/v1/debug/cache

# Test authentication only
curl -X POST https://your-worker.workers.dev/v1/token-test

# Test full flow
curl -X POST https://your-worker.workers.dev/v1/test
```

## 🏗️ How It Works

```mermaid
graph TD
    A[Client Request] --> B[Cloudflare Worker]
    B --> C{Token in KV Cache?}
    C -->|Yes| D[Use Cached Token]
    C -->|No| E[Check Environment Token]
    E --> F{Token Valid?}
    F -->|Yes| G[Cache & Use Token]
    F -->|No| H[Refresh Token]
    H --> I[Cache New Token]
    D --> J[Call Gemini API]
    G --> J
    I --> J
    J --> K[Stream Response]
    K --> L[OpenAI Format]
    L --> M[Client Response]
```

The worker acts as a translation layer, converting OpenAI API calls to Google's Code Assist API format while managing OAuth2 authentication automatically.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This codebase is provided for personal use and self-hosting only.

Redistribution of the codebase, whether in original or modified form, is not permitted without prior written consent from the author.

You may fork and modify the repository solely for the purpose of running and self-hosting your own instance.

Any other form of distribution, sublicensing, or commercial use is strictly prohibited unless explicitly authorized.

## 🙏 Acknowledgments

- Inspired by the official [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)
- Built on [Cloudflare Workers](https://workers.cloudflare.com/)
- Uses [Hono](https://hono.dev/) web framework

---

**⚠️ Important**: This project uses Google's Code Assist API which may have usage limits and terms of service. Please ensure compliance with Google's policies when using this worker.

[![Star History Chart](https://api.star-history.com/svg?repos=GewoonJaap/gemini-cli-openai&type=Date)](https://www.star-history.com/#GewoonJaap/gemini-cli-openai&Date)
