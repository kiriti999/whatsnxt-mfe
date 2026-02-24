# Code Block AI Enhancement - Backend Integration Guide

## Overview
The code block enhancer adds AI-powered features to code snippets in Lexical content. This document explains how to implement the backend API endpoint.

## Required API Endpoint

### POST `/api/ai/code`

**Request Body:**
```typescript
{
  code: string;        // The code snippet
  language: string;    // Programming language (e.g., 'javascript', 'python')
  action: string;      // AI action type: 'explain' | 'improve' | 'refactor' | 'translate'
}
```

**Response Body:**
```typescript
{
  result: string;      // AI-generated result
  success: boolean;
  error?: string;      // Optional error message
}
```

## Implementation Example (Express.js + TypeScript)

```typescript
// apps/whatsnxt-bff/app/routes/ai.routes.ts
import { Router } from 'express';
import { aiService } from '../services/aiService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/code', authenticate, async (req, res) => {
  try {
    const { code, language, action } = req.body;
    
    // Validate input
    if (!code || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Call AI service based on action
    let result: string;
    switch (action) {
      case 'explain':
        result = await aiService.explainCode(code, language);
        break;
      case 'improve':
        result = await aiService.suggestImprovements(code, language);
        break;
      case 'refactor':
        result = await aiService.refactorCode(code, language);
        break;
      case 'translate':
        result = await aiService.translateCode(code, language);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action' 
        });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('AI code action failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI service error' 
    });
  }
});

export default router;
```

## AI Service Implementation

```typescript
// apps/whatsnxt-bff/app/services/aiService.ts
import { getLogger } from '../../config/logger';

const logger = getLogger('AIService');

export const aiService = {
  async explainCode(code: string, language: string): Promise<string> {
    // Use your AI provider (OpenAI, Anthropic, Google)
    const prompt = `Explain the following ${language} code in simple terms:\n\n${code}`;
    return await callAIProvider(prompt);
  },

  async suggestImprovements(code: string, language: string): Promise<string> {
    const prompt = `Analyze this ${language} code and suggest improvements for performance, readability, and best practices:\n\n${code}`;
    return await callAIProvider(prompt);
  },

  async refactorCode(code: string, language: string): Promise<string> {
    const prompt = `Refactor this ${language} code following SOLID principles and best practices:\n\n${code}`;
    return await callAIProvider(prompt);
  },

  async translateCode(code: string, language: string): Promise<string> {
    const prompt = `Translate this ${language} code to TypeScript:\n\n${code}`;
    return await callAIProvider(prompt);
  },
};

async function callAIProvider(prompt: string): Promise<string> {
  // Implement your AI provider integration here
  // Example: OpenAI, Anthropic Claude, Google Gemini
  logger.info('Calling AI provider', { promptLength: prompt.length });
  
  // TODO: Replace with actual AI provider call
  throw new Error('AI provider not configured');
}
```

## Rate Limiting

Add rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Too many AI requests, please try again later',
});

router.post('/code', authenticate, aiRateLimiter, async (req, res) => {
  // ... handler code
});
```

## Cost Management

Implement token counting and cost tracking:

```typescript
interface AIUsage {
  userId: string;
  action: string;
  tokens: number;
  cost: number;
  timestamp: Date;
}

async function trackAIUsage(usage: AIUsage) {
  // Save to database for billing/analytics
  await AIUsageModel.create(usage);
}
```

## Frontend Configuration

The frontend already handles the API call in `CodeAIMenu.tsx`. Just ensure:
1. User is authenticated
2. API endpoint is accessible
3. CORS is configured properly

## Testing

```bash
# Test explain action
curl -X POST http://localhost:5000/api/ai/code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "const sum = (a, b) => a + b;",
    "language": "javascript",
    "action": "explain"
  }'
```

## Next Steps

1. Implement AI provider integration (OpenAI/Anthropic/Google)
2. Add rate limiting and cost tracking
3. Create AI usage analytics dashboard
4. Add user preferences for AI model selection
5. Implement caching for common code explanations
