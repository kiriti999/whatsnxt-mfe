# Auto Create Content Pipeline — Implementation Plan

> Version 1.0.0 | Created: 2026-02-19 | Constitution v5.4.0

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Overview](#2-feature-overview)
3. [Architecture Diagram (HLD)](#3-architecture-diagram-hld)
4. [Technical Stack](#4-technical-stack)
5. [Phase 1 — Backend Model + API + Service](#5-phase-1--backend-model--api--service)
6. [Phase 2 — Frontend Card + Form Page](#6-phase-2--frontend-card--form-page)
7. [Phase 3 — Lambda Handler (AI Content + SVG Diagrams)](#7-phase-3--lambda-handler-ai-content--svg-diagrams)
8. [Phase 4 — Terraform Deployment](#8-phase-4--terraform-deployment)
9. [Phase 5 — Dashboard / Progress Tracking UI](#9-phase-5--dashboard--progress-tracking-ui)
10. [Design Patterns & Resilience](#10-design-patterns--resilience)
11. [SVG Diagram Generation Strategy](#11-svg-diagram-generation-strategy)
12. [API Specification (OpenAPI)](#12-api-specification-openapi)
13. [Data Flow Sequences](#13-data-flow-sequences)
14. [Cost & Performance Analysis](#14-cost--performance-analysis)
15. [Risk Matrix](#15-risk-matrix)
16. [Testing Strategy](#16-testing-strategy)
17. [File Inventory](#17-file-inventory)

---

## 1. Executive Summary

**Auto Create Content** is a programmatic SEO feature that lets users create a content plan (title + description outline), uses AI to extract topics from the description, and then — via a daily AWS Lambda cron — generates full blog posts with embedded SVG diagrams for each topic. The goal is hands-off content generation at scale.

**Key value**: A user submits one content plan with 5–20 topics → the system automatically produces 1 blog post per day per plan → each post includes professionally rendered diagrams matching the content type.

---

## 2. Feature Overview

### User Flow

```
User → /form page → clicks "Auto Create Content" card
     → /form/auto-create page
     → Fills: title, description (Lexical + AI sparkle for topic generation), category, sub-category, nested sub-category
     → Submits → Backend extracts topics from description → Creates content plan (status: active)
     → Daily Lambda cron picks next pending topic per active plan
     → AI generates blog content + SVG diagram(s)
     → Blog post created in drafts → published automatically
     → User sees progress in dashboard
```

### Scope Boundaries

| In Scope | Out of Scope |
|----------|-------------|
| Content plan CRUD (create, list, get, pause, cancel) | Manual editing of generated posts |
| AI topic extraction from description | Real-time content generation (sync) |
| Daily Lambda cron processing | Multi-language content |
| AI blog content generation (HTML/Lexical) | Video/audio content generation |
| AI SVG diagram generation (6 supported types) | Custom diagram type creation |
| Auto-publish to `blogPosts` collection | Social media cross-posting |
| Progress tracking dashboard | Analytics / SEO scoring |

---

## 3. Architecture Diagram (HLD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 16)                       │
│                                                                     │
│  /form ──► ContentTypeForm ──► "Auto Create Content" card           │
│                 │                                                    │
│                 ▼                                                    │
│  /form/auto-create ──► AutoCreateForm                               │
│       │  Title input                                                │
│       │  Lexical editor (description) + AI sparkle                  │
│       │  Category / Sub-category / Nested sub-category dropdowns    │
│       │  Submit ──► POST /api/v1/content-plan                       │
│                                                                     │
│  /dashboard ──► ContentPlanProgress                                 │
│       │  Plan list with status badges                               │
│       │  Topic progress bars                                        │
│       │  Links to generated blog posts                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP (@whatsnxt/http-client)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js v5 / BFF)                    │
│                                                                     │
│  Routes: contentPlan.routes.ts                                      │
│    POST   /api/v1/content-plan          → create plan               │
│    GET    /api/v1/content-plan          → list user's plans         │
│    GET    /api/v1/content-plan/:id      → get plan detail           │
│    PATCH  /api/v1/content-plan/:id      → pause/resume/cancel       │
│    DELETE /api/v1/content-plan/:id      → delete plan               │
│                                                                     │
│  Service: contentPlanService.ts                                     │
│    createPlan() → extract topics → validate category → save         │
│    listPlans() / getPlan() / updatePlanStatus() / deletePlan()      │
│                                                                     │
│  Model: contentPlanSchema.ts                                        │
│    contentPlans collection (MongoDB)                                │
│                                                                     │
│  Existing:                                                          │
│    aiService.ts          → AI provider abstraction                  │
│    postService.ts        → createBlog() for draft creation          │
│    historyService.ts     → publishDraft() for publishing            │
│    contentStorageService → S3 + Brotli + Redis for Lexical JSON     │
│    categorySchema.ts     → 3-level category validation              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS INFRASTRUCTURE                          │
│                                                                     │
│  EventBridge ──► Dedicated cron (0 11 * * ? *) 11am UTC ──► Lambda  │
│                                                                     │
│  Lambda: content-generation                                         │
│    1. Query active contentPlans (not rate-limited)                  │
│    2. For each plan: resolve user AI key or system fallback         │
│    3. Pick next pending topic → mark processing (atomic)            │
│    4. Call AI: generate blog content + diagram JSON                 │
│    5. Render SVG via D3 + JSDOM (server-side)                       │
│    6. Embed SVG in blog content                                     │
│    7. Create draft → publish → mark topic as published              │
│    8. Handle errors: retry (max 3), circuit breaker (429)           │
│                                                                     │
│  S3: Content bucket (lexical/{collection}/{id}.br)                  │
│  CloudWatch: Logs + Error/Duration alarms                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 16, React 19, Mantine UI | Existing stack |
| Rich Text Editor | Lexical | Existing — used in blog form |
| AI Sparkle | `aiService.getSuggestion()` | Existing — topic extraction from description |
| Backend API | Express.js v5, TypeScript | Existing BFF |
| Database | MongoDB (Mongoose) | Existing — new `contentPlans` collection |
| Content Storage | S3 + Brotli + Redis | Existing `contentStorageService` |
| Lambda Runtime | Node.js 20.x | Matches existing Lambda pattern |
| Lambda DB Driver | `mongodb` (raw driver, not Mongoose) | Matches existing Lambda pattern |
| SVG Rendering | D3.js + JSDOM | Server-side diagram generation |
| AI Providers | OpenAI, Anthropic, Gemini | Existing `aiService` abstractions |
| IaC | Terraform | Existing patterns in `terraform/1-infra-app/` |
| Scheduling | AWS EventBridge | **Dedicated** rule: `cron(0 11 * * ? *)` — daily at 11am UTC |
| HTTP Client | `@whatsnxt/http-client` | Frontend → Backend communication |
| Constants | `@whatsnxt/constants` | All shared constants |
| Error Classes | `@whatsnxt/errors` | All custom errors |

---

## 5. Phase 1 — Backend Model + API + Service

### 5.1 MongoDB Schema: `contentPlanSchema.ts`

**File**: `apps/whatsnxt-bff/app/models/contentPlanSchema.ts`
**Collection**: `contentPlans`

```typescript
interface ITopic {
  _key: string;              // UUID — idempotency key
  title: string;             // Extracted topic title
  status: 'pending' | 'processing' | 'published' | 'error' | 'skipped';
  blogPostId?: ObjectId;     // Reference to created blogPost doc
  error?: string;            // Last error message
  processedAt?: Date;        // When processing completed
  retryCount: number;        // Max 3 retries before 'skipped'
}

interface IContentPlan {
  title: string;              // Parent plan title (unique per user)
  description: string;        // Original Lexical/HTML description
  userId: ObjectId;           // Owner (from auth middleware)
  categoryName: string;       // Top-level blog category
  subCategory?: string;       // 2nd-level category
  nestedSubCategory?: string; // 3rd-level category
  topics: ITopic[];           // Embedded topic queue (5–20 items)
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  completedCount: number;     // Counter cache for completed topics
  totalCount: number;         // topics.length at creation
  lastProcessedAt?: Date;     // For FIFO fairness across plans
  rateLimitedUntil?: Date;    // Circuit breaker cooldown
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
```
{ userId: 1, status: 1 }                  — list active plans per user
{ status: 1, rateLimitedUntil: 1 }        — Lambda query: active + not rate-limited
{ userId: 1, title: 1 }  (unique)         — prevent duplicate plan titles per user
```

**Validation Rules**:
- `topics` array: min 1, max 20
- `title`: required, trimmed, max 200 chars
- `description`: required, max 50000 chars
- `categoryName`: required, must exist in `blogCategories` collection
- `retryCount` default: 0, max: 3
- `status` default: `'active'`

### 5.2 Service: `contentPlanService.ts`

**File**: `apps/whatsnxt-bff/app/services/contentPlanService.ts`

| Method | Signature | Description |
|--------|-----------|-------------|
| `createPlan` | `(userId, planData) → IContentPlan` | Validate category, extract topics from description, create plan |
| `listPlans` | `(userId) → IContentPlan[]` | List all plans for a user |
| `getPlan` | `(userId, planId) → IContentPlan` | Get single plan with IDOR check |
| `updatePlanStatus` | `(userId, planId, status) → IContentPlan` | Pause / resume / cancel |
| `deletePlan` | `(userId, planId) → void` | Delete plan (only if paused/cancelled) |

**Topic Extraction Strategy**:
- The `description` field contains Lexical/HTML content with a structured outline
- Parse HTML → extract `<li>`, `<h2>`, `<h3>` elements as individual topics
- Alternatively, call AI (`aiService.getSuggestion`) with prompt: *"Extract individual blog post topics from this outline: {description}. Return as JSON array of {title: string}."*
- Deduplicate by title similarity (> 85% → skip)
- Assign `_key: uuid()` and `status: 'pending'` to each

### 5.3 Routes: `contentPlan.routes.ts`

**File**: `apps/whatsnxt-bff/app/routes/contentPlan.routes.ts`

| Method | Path | Auth | Handler |
|--------|------|------|---------|
| `POST` | `/api/v1/content-plan` | `authMiddleware` | `createPlan` |
| `GET` | `/api/v1/content-plan` | `authMiddleware` | `listPlans` |
| `GET` | `/api/v1/content-plan/:id` | `authMiddleware` | `getPlan` |
| `PATCH` | `/api/v1/content-plan/:id` | `authMiddleware` | `updatePlanStatus` |
| `DELETE` | `/api/v1/content-plan/:id` | `authMiddleware` | `deletePlan` |

All routes use `authMiddleware` (blocking — sets `req.userId`). IDOR checks on every mutation.

### 5.4 Error Handling

Use `@whatsnxt/errors` package:
- `NotFoundError` — plan not found
- `ConflictError` — duplicate plan title for user
- `ValidationError` — invalid category, too many/few topics
- `ForbiddenError` — IDOR violation (userId mismatch)

### 5.5 Logging

Use Winston logger with contextual metadata:
```typescript
logger.info('Content plan created', { userId, planId, topicCount: plan.totalCount });
logger.error('Failed to create content plan', { userId, error: err.message });
```

---

## 6. Phase 2 — Frontend Card + Form Page

### 6.1 ContentTypeForm Update

**File**: `apps/web/components/Blog/ContentTypeForm/index.tsx`

Add 5th card to `contentTypes` array:

```typescript
{
    href: '/form/auto-create',
    icon: IconSparkles,    // or IconRobot from @tabler/icons-react
    title: 'Auto Create Content',
    description: 'Generate blog posts with AI from a structured topic outline',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#43e97b'
}
```

**Access Control**: Gate behind admin role + allowed email (same as Visualizer), or make it available to all authenticated users. To be decided.

### 6.2 New Page: `/form/auto-create/page.tsx`

**File**: `apps/web/app/form/auto-create/page.tsx`

```
AutoCreateForm component:
├── Title input (TextInput, required, max 200 chars)
├── Description editor (Lexical with AI sparkle button)
│   └── AI sparkle: "Generate topic outline for: {title}" → populates editor
├── Category dropdown (fetched from /api/v1/blog-categories)
├── Sub-category dropdown (filtered by selected category)
├── Nested sub-category dropdown (filtered by selected sub-category)
├── Topic preview (extracted from description, shown as chips/list)
└── Submit button → POST /api/v1/content-plan
```

**Lexical + AI Sparkle Pattern**:
- The description field uses the existing Lexical editor component
- AI sparkle button triggers `aiService.getSuggestion()` via the backend
- Prompt: *"Generate a detailed topic outline with 5–15 topics for a blog series about: {title}. Format as a bulleted list with clear, SEO-friendly topic titles."*
- User can edit the AI-generated outline before submission
- On submit, the backend extracts individual topics from the description

**Category Dropdowns**:
- Reuse existing category fetching pattern from blog form
- 3-level cascade: Category → Sub-category → Nested Sub-category
- Uses `blogCategories` API (`GET /api/v1/blog-categories`)

**UI Framework**: Mantine UI components:
- `TextInput` for title
- `Select` for category dropdowns
- `Button` with `IconSparkles` for AI generation
- `Paper` / `Stack` layout
- CSS classes (not inline styles)

### 6.3 Existing Patterns to Reuse

| What | Where | How |
|------|-------|-----|
| Lexical editor | `apps/web/components/Blog/LexicalEditor/` | Import and wrap |
| Category dropdowns | Blog form components | Reuse hooks/fetch logic |
| AI sparkle button | Existing pattern in blog form | Adapt prompt |
| Form validation | Mantine `useForm` | Standard pattern |
| HTTP calls | `@whatsnxt/http-client` | POST/GET to content-plan API |
| Auth hook | `useAuth()` from `hooks/Authentication/` | User context |

---

## 7. Phase 3 — Lambda Handler (AI Content + SVG Diagrams)

### 7.1 Directory Structure

```
lambda/content-generation/
├── index.js                    # Main Lambda handler
├── package.json                # Standalone deps
├── lib/
│   ├── config.js               # loadConfig() from env vars
│   ├── mongo-client.js         # Cached MongoDB connection
│   ├── logger.js               # Structured logging
│   ├── ai-client.js            # AI provider abstraction
│   ├── content-generator.js    # Blog content generation
│   ├── diagram-generator.js    # SVG diagram generation (D3 + JSDOM)
│   ├── blog-publisher.js       # Create draft → publish flow
│   ├── s3-client.js            # S3 upload with Brotli compression
│   └── errors.js               # Error classes
```

### 7.2 Handler Algorithm

```
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  1. Load config from environment variables
  2. Connect to MongoDB (cached connection, maxPoolSize: 1)
  3. Query contentPlans:
       { status: 'active', rateLimitedUntil: { $not: { $gt: new Date() } } }
       Sort by lastProcessedAt ASC (FIFO fairness)
       Limit: maxPlansPerRun (default: 10)

  4. For each plan (up to maxTopicsPerRun = 5 total across all plans):
     a. Resolve AI key:
        - Query users.aiConfig[provider].apiKey
        - Fallback to Lambda env vars (OPENAI_API_KEY, etc.)

     b. Find next pending topic (atomic):
        findOneAndUpdate(
          { _id: planId, 'topics._key': topicKey, 'topics.status': 'pending' },
          { $set: { 'topics.$.status': 'processing' } }
        )

     c. Generate blog content via AI:
        - System prompt includes: parent title, topic title, category, word count target (1500–3000), SEO keywords
        - Returns: HTML/Lexical content

     d. Determine diagram type from category:
        - Architecture/system topics → 'architecture'
        - Process/workflow topics → 'flow-diagram'
        - Comparison topics → 'comparison-grid'
        - Learning/concept topics → 'concept-explainer'
        - Timeline topics → 'timeline'
        - Default → 'mind-map'

     e. Generate diagram via AI:
        - Prompt: "Generate a {diagramType} diagram for: {topicTitle}"
        - Returns: DiagramData JSON (nodes + edges)
        - Render SVG server-side via D3 + JSDOM
        - Embed SVG inline in blog content

     f. Create blog post:
        - Build post data matching draftSchema fields
        - Generate slug (applySlug pattern)
        - Check duplicate slugs
        - Compress Lexical content → S3 (Brotli)
        - Insert into drafts collection
        - Publish: move to blogPosts collection (or insert directly with published: true)

     g. Update topic status:
        findOneAndUpdate(
          { _id: planId, 'topics._key': topicKey },
          { $set: {
              'topics.$.status': 'published',
              'topics.$.blogPostId': newPostId,
              'topics.$.processedAt': new Date()
            },
            $inc: { completedCount: 1 },
            $set: { lastProcessedAt: new Date() }
          }
        )

     h. Error handling:
        - On HTTP 429 (rate limit):
          → Reset topic to 'pending'
          → Set rateLimitedUntil = now + 24h
          → Skip to next plan
        - On other error:
          → Increment retryCount
          → If retryCount >= 3 → mark 'skipped'
          → Else mark 'error' with error message

  5. Check plan completion:
     If all topics are 'published' or 'skipped':
       → Set plan status to 'completed'

  6. Return { statusCode: 200, body: { plansProcessed, topicsPublished, errors } }
}
```

### 7.3 Lambda Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `MONGODB_URI` | Terraform variable | MongoDB connection string |
| `MONGODB_DB_NAME` | Terraform variable | Database name |
| `S3_CONTENT_BUCKET` | Terraform variable | S3 bucket for Lexical content |
| `AWS_REGION` | Lambda default | AWS region |
| `OPENAI_API_KEY` | Terraform variable | System fallback key |
| `ANTHROPIC_API_KEY` | Terraform variable | System fallback key |
| `GOOGLE_GEMINI_API_KEY` | Terraform variable | System fallback key |
| `MAX_PLANS_PER_RUN` | Terraform variable | Budget guard (default: 10) |
| `MAX_TOPICS_PER_RUN` | Terraform variable | Budget guard (default: 5) |

### 7.4 Lambda Dependencies (`package.json`)

```json
{
  "name": "content-generation-lambda",
  "version": "1.0.0",
  "dependencies": {
    "mongodb": "^6.3.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "@google/generative-ai": "^0.5.0",
    "d3": "^7.9.0",
    "jsdom": "^24.0.0",
    "uuid": "^9.0.0"
  }
}
```

---

## 8. Phase 4 — Terraform Deployment

### 8.1 New File: `lambda-content-generation.tf`

**File**: `terraform/1-infra-app/lambda-content-generation.tf`

Pattern follows existing `lambda-cloudinary-cleanup.tf` but uses a **dedicated EventBridge rule** (`cron(0 11 * * ? *)` — daily at 11am UTC) instead of the shared midnight rule:

> **Why a dedicated rule?** The shared EventBridge rule (`asset-clean-cron-prod`) runs at midnight UTC and is shared with other projects (Cloudinary cleanup, etc.). Content generation should run at 11am UTC to:
> - Publish fresh content during peak traffic hours
> - Avoid competing with cleanup tasks for MongoDB connections
> - Allow independent schedule changes without affecting other Lambdas

```hcl
# ------------------------------
# CONTENT GENERATION EVENTBRIDGE RULE
# ------------------------------
# Dedicated EventBridge rule for content generation Lambda
# Runs daily at 11am UTC (separate from shared cleanup rule)

resource "aws_cloudwatch_event_rule" "content_generation_daily" {
  name                = "${var.app_name}-content-gen-cron-${var.env_name}"
  description         = "Trigger content generation Lambda daily at 11am UTC"
  schedule_expression = var.content_gen_cron_schedule  # cron(0 11 * * ? *)

  tags = {
    Environment = var.env_name
    Application = var.app_name
    Function    = "content-generation-cron"
  }
}

# ------------------------------
# CLOUDWATCH LOG GROUP
# ------------------------------

resource "aws_cloudwatch_log_group" "content_generation" {
  name              = "/aws/lambda/${var.app_name}-content-generation-${var.env_name}"
  retention_in_days = var.lambda_log_retention_days

  tags = {
    Environment = var.env_name
    Application = var.app_name
    Function    = "content-generation-cron"
  }
}

# ------------------------------
# LAMBDA DEPLOYMENT PACKAGE
# ------------------------------

data "archive_file" "content_generation" {
  type        = "zip"
  source_dir  = "${path.root}/../../lambda/content-generation"
  output_path = "${path.root}/.terraform/lambda-content-generation.zip"
}

# ------------------------------
# LAMBDA FUNCTION
# ------------------------------

resource "aws_lambda_function" "content_generation" {
  filename         = data.archive_file.content_generation.output_path
  function_name    = "${var.app_name}-content-generation-${var.env_name}"
  role             = aws_iam_role.content_generation_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.content_generation.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = var.content_gen_lambda_timeout      # 300s (5 min)
  memory_size      = var.content_gen_lambda_memory_size  # 512MB (D3 + JSDOM)

  environment {
    variables = {
      MONGODB_URI           = var.mongodb_uri
      MONGODB_DB_NAME       = var.mongodb_db_name
      S3_CONTENT_BUCKET     = var.s3_content_bucket
      OPENAI_API_KEY        = var.openai_api_key
      ANTHROPIC_API_KEY     = var.anthropic_api_key
      GOOGLE_GEMINI_API_KEY = var.google_gemini_api_key
      MAX_PLANS_PER_RUN     = var.content_gen_max_plans
      MAX_TOPICS_PER_RUN    = var.content_gen_max_topics
      NODE_ENV              = var.env_name
    }
  }

  tags = {
    Environment = var.env_name
    Application = var.app_name
    Function    = "content-generation-cron"
  }

  depends_on = [
    aws_iam_role_policy.content_generation_lambda_logs,
    aws_cloudwatch_log_group.content_generation
  ]
}

# ------------------------------
# EVENTBRIDGE → LAMBDA CONNECTION
# ------------------------------

# EventBridge Target — attach to DEDICATED content generation rule
resource "aws_cloudwatch_event_target" "content_generation" {
  rule      = aws_cloudwatch_event_rule.content_generation_daily.name
  target_id = "ContentGenerationLambdaTarget"
  arn       = aws_lambda_function.content_generation.arn
}

# Lambda Permission — allow dedicated EventBridge rule to invoke
resource "aws_lambda_permission" "content_generation_eventbridge" {
  statement_id  = "AllowExecutionFromContentGenEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.content_generation.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.content_generation_daily.arn
}

# ------------------------------
# IAM ROLE & POLICY
# ------------------------------

resource "aws_iam_role" "content_generation_lambda" {
  name               = "${var.app_name}-content-gen-lambda-role-${var.env_name}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = {
    Environment = var.env_name
    Application = var.app_name
    Function    = "content-generation-cron"
  }
}

resource "aws_iam_role_policy" "content_generation_lambda_logs" {
  name = "${var.app_name}-content-gen-lambda-logs-${var.env_name}"
  role = aws_iam_role.content_generation_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.content_generation.arn}:*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "content_generation_lambda_s3" {
  name = "${var.app_name}-content-gen-lambda-s3-${var.env_name}"
  role = aws_iam_role.content_generation_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:GetObject"]
        Resource = "arn:aws:s3:::${var.s3_content_bucket}/lexical/*"
      }
    ]
  })
}

# ------------------------------
# CLOUDWATCH ALARMS
# ------------------------------

resource "aws_cloudwatch_metric_alarm" "content_generation_errors" {
  alarm_name          = "${var.app_name}-content-gen-errors-${var.env_name}"
  alarm_description   = "Alert when content generation Lambda has errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 86400  # 1 day
  statistic           = "Sum"
  threshold           = 3
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.content_generation.function_name
  }

  tags = {
    Environment = var.env_name
    Application = var.app_name
    Function    = "content-generation-cron"
  }
}

resource "aws_cloudwatch_metric_alarm" "content_generation_duration" {
  alarm_name          = "${var.app_name}-content-gen-duration-${var.env_name}"
  alarm_description   = "Alert when content generation Lambda approaches timeout"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 86400  # 1 day
  statistic           = "Maximum"
  threshold           = var.content_gen_lambda_timeout * 1000 * 0.9  # 90% of timeout (ms)
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.content_generation.function_name
  }

  tags = {
    Environment = var.env_name
    Application = var.app_name
    Function    = "content-generation-cron"
  }
}

# ------------------------------
# OUTPUTS
# ------------------------------

output "content_generation_lambda_arn" {
  description = "ARN of the content generation Lambda function"
  value       = aws_lambda_function.content_generation.arn
}

output "content_generation_lambda_name" {
  description = "Name of the content generation Lambda function"
  value       = aws_lambda_function.content_generation.function_name
}

output "content_generation_log_group" {
  description = "CloudWatch Log Group for content generation Lambda"
  value       = aws_cloudwatch_log_group.content_generation.name
}

output "content_generation_eventbridge_rule" {
  description = "Name of the dedicated content generation EventBridge rule"
  value       = aws_cloudwatch_event_rule.content_generation_daily.name
}
```

### 8.2 Variables to Add

**File**: `terraform/1-infra-app/variables.tf`

```hcl
# Content Generation Lambda — EventBridge Schedule
variable "content_gen_cron_schedule" {
  description = "Cron schedule for content generation Lambda (dedicated rule)"
  type        = string
  default     = "cron(0 11 * * ? *)"  # Daily at 11am UTC
}

# Content Generation Lambda — Function Config
variable "content_gen_lambda_timeout" {
  description = "Content generation Lambda function timeout in seconds"
  type        = number
  default     = 300  # 5 minutes
}

variable "content_gen_lambda_memory_size" {
  description = "Content generation Lambda function memory size in MB"
  type        = number
  default     = 512  # D3 + JSDOM needs more memory
}

# Content Generation Lambda — Budget Guards
variable "content_gen_max_plans" {
  description = "Maximum content plans to process per Lambda run"
  type        = string
  default     = "10"
}

variable "content_gen_max_topics" {
  description = "Maximum topics to process per Lambda run"
  type        = string
  default     = "5"
}
```

### 8.3 Values to Add

**File**: `terraform/1-infra-app/terraform.tfvars`

```hcl
# Content Generation Lambda
content_gen_cron_schedule    = "cron(0 11 * * ? *)"  # Daily at 11am UTC
content_gen_lambda_timeout   = 300
content_gen_lambda_memory_size = 512
content_gen_max_plans        = "10"
content_gen_max_topics       = "5"
```

---

## 9. Phase 5 — Dashboard / Progress Tracking UI

### 9.1 Location

Add a "Content Plans" section to the existing history/dashboard page, or create a new tab.

### 9.2 Components

```
ContentPlanDashboard
├── ContentPlanList (SimpleGrid of plan cards)
│   └── ContentPlanCard
│       ├── Plan title + status badge
│       ├── Progress bar (completedCount / totalCount)
│       ├── Category label
│       ├── Created date
│       └── Actions: Pause / Resume / Cancel / Delete
│
├── ContentPlanDetail (on card click or separate page)
│   ├── Plan metadata (title, description, category)
│   ├── Topic list with status indicators
│   │   ├── ✅ Published (link to blog post)
│   │   ├── 🔄 Processing (spinner)
│   │   ├── ⏸️ Pending (grey)
│   │   ├── ❌ Error (red, with error message tooltip)
│   │   └── ⏭️ Skipped (strikethrough)
│   └── Overall stats (published, pending, errors, skipped)
│
└── InfiniteScrollComponent (if many plans)
```

### 9.3 API Integration

```typescript
// List plans
const plans = await httpClient.get('/api/v1/content-plan');

// Get plan detail
const plan = await httpClient.get(`/api/v1/content-plan/${planId}`);

// Pause plan
await httpClient.patch(`/api/v1/content-plan/${planId}`, { status: 'paused' });

// Resume plan
await httpClient.patch(`/api/v1/content-plan/${planId}`, { status: 'active' });

// Cancel plan
await httpClient.patch(`/api/v1/content-plan/${planId}`, { status: 'cancelled' });
```

---

## 10. Design Patterns & Resilience

| Pattern | Implementation | Rationale |
|---------|---------------|-----------|
| **Job Queue** | MongoDB-backed embedded `topics[]` array (5–20 per plan) | Simple, no external queue service needed. Bounded array prevents unbounded growth. |
| **Idempotency** | Each topic has `_key` (UUID) + `status` + `processedAt` | Prevents double-processing if Lambda retries or runs concurrently. |
| **Circuit Breaker** | On AI HTTP 429 → set `rateLimitedUntil = now + 24h` → skip plan until cooldown | Prevents burning API quota with failing requests. Self-healing after 24h. |
| **Budget Guard** | `maxTopicsPerRun` (default: 5), `maxPlansPerRun` (default: 10) | Controls cost per Lambda invocation. Configurable via Terraform vars. |
| **FIFO Fairness** | `$sort: { lastProcessedAt: 1 }` + `$limit` across plans | Ensures all plans make progress, not just the first one. Round-robin style. |
| **Atomic Status Transitions** | `findOneAndUpdate` with status precondition | Prevents race conditions: only process topics currently in 'pending' state. |
| **Fault Isolation** | Per-topic error handling; plan stays 'active' until all topics resolved | One failing topic doesn't block others. Plan only completes when all topics are processed. |
| **Retry with Backoff** | `retryCount` incremented on error, topic skipped after 3 failures | Transient errors get retried; persistent failures get marked and skipped. |
| **Counter Cache** | `completedCount` / `totalCount` on plan document | Avoids `$size` aggregation on embedded array for progress queries. |

---

## 11. SVG Diagram Generation Strategy

### 11.1 Diagram Type Selection

The Lambda selects a diagram type based on the topic's category and content:

| Category/Content Signal | Diagram Type | Slug |
|------------------------|--------------|------|
| Architecture, system design, infrastructure | Architecture Diagram | `architecture` |
| Process, workflow, pipeline, steps | Flow Diagram | `flow-diagram` |
| Comparison, vs, alternative, pros/cons | Comparison Grid | `comparison-grid` |
| Concept, theory, explanation, guide | Concept Explainer | `concept-explainer` |
| History, evolution, timeline, roadmap | Timeline | `timeline` |
| Overview, summary, brainstorm, general | Mind Map | `mind-map` |

**Target**: 6 diagram types that have full backend prompt support AND frontend D3 renderers.

### 11.2 Server-Side SVG Rendering (Lambda)

Since the existing D3 renderers are React client components, the Lambda needs a server-side SVG rendering approach:

```
AI prompt → DiagramData JSON (nodes + edges)
  → D3 + JSDOM (server-side) → SVG string
    → Embed as <svg>...</svg> in blog HTML content
```

**Implementation**:

```javascript
// lib/diagram-generator.js
const { JSDOM } = require('jsdom');
const d3 = require('d3');

function renderDiagramToSVG(diagramData, width = 1200, height = 800) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const document = dom.window.document;
  const body = d3.select(document.body);

  const svg = body.append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%');

  // Render nodes
  diagramData.nodes.forEach(node => renderNode(svg, node));

  // Render edges
  diagramData.edges.forEach(edge => renderEdge(svg, edge, diagramData.nodes));

  return body.html(); // Returns <svg>...</svg> string
}
```

### 11.3 DiagramData JSON Structure (AI Output)

The AI generates structured JSON matching the existing `DiagramData` interface:

```typescript
{
  title: string,
  subtitle?: string,
  backgroundColor: string,
  nodes: [{
    id: string,
    label: string,
    description?: string,
    type: 'card' | 'icon' | 'box' | 'circle' | 'diamond' | 'actor',
    position?: { x: number, y: number },
    size?: { width: number, height: number },
    style: { backgroundColor, borderColor, textColor, fontSize?, borderRadius?, gradient? },
    icon?: string,
    badge?: string,
    children?: DiagramNode[],
    metadata?: Record<string, any>
  }],
  edges: [{
    id: string,
    source: string,
    target: string,
    label?: string,
    style: { strokeColor, strokeWidth, strokeDash?, arrowHead }
  }],
  layout: 'grid' | 'horizontal' | 'vertical' | 'radial' | 'free',
  gridColumns?: number
}
```

### 11.4 AI Prompt for Diagram Generation

```
System prompt:
"You are a diagram generator. Generate a {diagramType} diagram for an article about '{topicTitle}' in the
context of '{parentPlanTitle}'. Category: {categoryName}.

Return a JSON object matching this schema:
{
  title, subtitle, backgroundColor,
  nodes: [{ id, label, description, type, position, size, style, icon }],
  edges: [{ id, source, target, label, style }],
  layout, gridColumns
}

Rules:
- Use {diagramType}-appropriate node types and layouts
- Ensure nodes don't overlap (provide explicit positions)
- Use professional color schemes matching the theme
- Include 4-12 nodes depending on complexity
- All edges must reference valid node IDs
- Use layout: '{recommendedLayout}' for this diagram type"
```

### 11.5 Diagram Type ↔ Frontend Renderer Compatibility

| Diagram Type | Lambda Generates | Frontend Renders (in blog post) | Fallback |
|-------------|-----------------|-------------------------------|----------|
| `architecture` | ✅ D3+JSDOM SVG | ✅ ArchitectureRenderer | Inline SVG |
| `flow-diagram` | ✅ D3+JSDOM SVG | ✅ FlowDiagramRenderer | Inline SVG |
| `comparison-grid` | ✅ D3+JSDOM SVG | ✅ ComparisonGridRenderer | Inline SVG |
| `concept-explainer` | ✅ D3+JSDOM SVG | ✅ ConceptExplainerRenderer | Inline SVG |
| `timeline` | ✅ D3+JSDOM SVG | ✅ TimelineRenderer | Inline SVG |
| `mind-map` | ✅ D3+JSDOM SVG | ✅ MindMapRenderer | Inline SVG |

Diagram is embedded as inline `<svg>` in blog HTML → works everywhere without client-side re-rendering.

---

## 12. API Specification (OpenAPI)

```json
{
  "paths": {
    "/api/v1/content-plan": {
      "post": {
        "summary": "Create a new content plan",
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["title", "description", "categoryName"],
                "properties": {
                  "title": { "type": "string", "maxLength": 200 },
                  "description": { "type": "string", "maxLength": 50000 },
                  "categoryName": { "type": "string" },
                  "subCategory": { "type": "string" },
                  "nestedSubCategory": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Content plan created" },
          "400": { "description": "Validation error" },
          "401": { "description": "Unauthorized" },
          "409": { "description": "Duplicate plan title" }
        }
      },
      "get": {
        "summary": "List user's content plans",
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": {
            "description": "Array of content plans",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/ContentPlan" }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/content-plan/{id}": {
      "get": {
        "summary": "Get content plan detail",
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "Content plan" },
          "404": { "description": "Not found" }
        }
      },
      "patch": {
        "summary": "Update plan status (pause/resume/cancel)",
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["status"],
                "properties": {
                  "status": {
                    "type": "string",
                    "enum": ["active", "paused", "cancelled"]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Updated plan" },
          "404": { "description": "Not found" }
        }
      },
      "delete": {
        "summary": "Delete a content plan (only paused/cancelled)",
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "204": { "description": "Deleted" },
          "400": { "description": "Can only delete paused/cancelled plans" },
          "404": { "description": "Not found" }
        }
      }
    }
  }
}
```

---

## 13. Data Flow Sequences

### 13.1 Content Plan Creation

```
User                  Frontend              Backend API              MongoDB
 │                       │                      │                      │
 │ Fill form + submit    │                      │                      │
 │──────────────────────►│                      │                      │
 │                       │ POST /content-plan   │                      │
 │                       │─────────────────────►│                      │
 │                       │                      │ Validate category    │
 │                       │                      │─────────────────────►│
 │                       │                      │◄─────────────────────│
 │                       │                      │                      │
 │                       │                      │ Extract topics       │
 │                       │                      │ from description     │
 │                       │                      │ (AI or HTML parse)   │
 │                       │                      │                      │
 │                       │                      │ Create contentPlan   │
 │                       │                      │─────────────────────►│
 │                       │                      │◄─────────────────────│
 │                       │ 201 + plan data      │                      │
 │                       │◄─────────────────────│                      │
 │ Show success          │                      │                      │
 │◄──────────────────────│                      │                      │
```

### 13.2 Lambda Daily Processing

```
EventBridge          Lambda                    MongoDB           AI Provider        S3
    │                   │                        │                   │              │
    │ cron trigger      │                        │                   │              │
    │──────────────────►│                        │                   │              │
    │                   │ Query active plans      │                   │              │
    │                   │───────────────────────►│                   │              │
    │                   │◄───────────────────────│                   │              │
    │                   │                        │                   │              │
    │                   │ For each plan:         │                   │              │
    │                   │ Get user AI config     │                   │              │
    │                   │───────────────────────►│                   │              │
    │                   │◄───────────────────────│                   │              │
    │                   │                        │                   │              │
    │                   │ Mark topic processing  │                   │              │
    │                   │───────────────────────►│                   │              │
    │                   │                        │                   │              │
    │                   │ Generate blog content  │                   │              │
    │                   │───────────────────────────────────────────►│              │
    │                   │◄───────────────────────────────────────────│              │
    │                   │                        │                   │              │
    │                   │ Generate diagram JSON  │                   │              │
    │                   │───────────────────────────────────────────►│              │
    │                   │◄───────────────────────────────────────────│              │
    │                   │                        │                   │              │
    │                   │ Render SVG (D3+JSDOM)  │                   │              │
    │                   │ Embed SVG in content   │                   │              │
    │                   │                        │                   │              │
    │                   │ Compress + upload      │                   │              │
    │                   │─────────────────────────────────────────────────────────►│
    │                   │◄─────────────────────────────────────────────────────────│
    │                   │                        │                   │              │
    │                   │ Insert blogPost        │                   │              │
    │                   │───────────────────────►│                   │              │
    │                   │                        │                   │              │
    │                   │ Mark topic published   │                   │              │
    │                   │───────────────────────►│                   │              │
```

---

## 14. Cost & Performance Analysis

### 14.1 AI Cost per Blog Post

| Provider | Model | ~Tokens (in+out) | Cost per post |
|----------|-------|-------------------|---------------|
| OpenAI | gpt-4.1-mini | ~4000 in + ~3000 out | ~$0.006 |
| Anthropic | Claude Sonnet 4 | ~4000 in + ~3000 out | ~$0.03 |
| Gemini | gemini-2.5-flash | ~4000 in + ~3000 out | ~$0.003 |

**Plus diagram generation**: ~2000 in + ~1500 out → additional ~50% of content cost.

**Per-post total**: ~$0.005 – $0.05 depending on provider.

### 14.2 Lambda Cost

| Resource | Usage | Monthly Cost (5 posts/day) |
|----------|-------|---------------------------|
| Lambda invocations | 30/month | $0.00 (free tier) |
| Lambda duration | ~60s × 30 = 30 min/month (512MB) | ~$0.025 |
| S3 PUTs | ~30/month | $0.0002 |
| CloudWatch Logs | ~5MB/month | $0.03 |
| **Total infra** | | **~$0.06/month** |

### 14.3 Lambda Performance

| Metric | Target | Rationale |
|--------|--------|-----------|
| Cold start | < 5s | Node.js 20 + 512MB memory |
| Per-topic processing | 15–30s | AI call (~10s) + diagram (~10s) + S3/DB (~2s) |
| Total execution time | < 300s (5 min timeout) | 5 topics × 30s = 150s max |
| Memory usage | < 512MB | D3 + JSDOM needs ~200MB |

---

## 15. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI rate limiting (429) | Medium | Medium | Circuit breaker: skip plan for 24h, resume automatically |
| AI generates low-quality content | Medium | High | System prompt engineering with SEO guidelines + human review option |
| Duplicate blog post slugs | Low | Medium | Slug uniqueness check + UUID suffix fallback |
| Lambda timeout (> 5 min) | Low | Medium | Budget guard limits (5 topics/run), process in priority order |
| MongoDB connection exhaustion | Low | High | Cached connection, maxPoolSize: 1, callbackWaitsForEmptyEventLoop=false |
| SVG rendering fails (D3+JSDOM) | Low | Low | Try-catch: publish post without diagram on failure, log error |
| Cost overrun (AI API) | Low | Medium | Budget guard + per-user key resolution (user pays) |
| Category doesn't exist | Low | Low | Validate at plan creation time, not at Lambda time |
| Concurrent Lambda invocations | Low | Medium | Atomic `findOneAndUpdate` with status precondition prevents double-processing |

---

## 16. Testing Strategy

### 16.1 Unit Tests (vitest)

| Target | Test Cases |
|--------|-----------|
| `contentPlanService.createPlan()` | Valid plan, duplicate title, invalid category, too many topics, too few topics |
| `contentPlanService.updatePlanStatus()` | Valid transitions (active→paused, paused→active, active→cancelled), invalid transitions |
| `contentPlanService.deletePlan()` | Delete paused plan, reject delete active plan, IDOR check |
| Topic extraction | HTML parsing, edge cases (empty, single topic, nested lists) |
| Diagram type selection | Category → diagram type mapping for all categories |
| SVG rendering (D3+JSDOM) | Valid DiagramData → SVG string, empty nodes, malformed edges |

### 16.2 Integration Tests

| Target | Test Cases |
|--------|-----------|
| `POST /api/v1/content-plan` | Auth required, valid creation, duplicate rejection |
| `GET /api/v1/content-plan` | Returns only user's plans (IDOR) |
| `PATCH /api/v1/content-plan/:id` | Status transitions, IDOR |
| Lambda handler (mocked AI) | Processes topics, handles errors, circuit breaker triggers |

### 16.3 Test File Locations

```
apps/whatsnxt-bff/app/tests/
├── contentPlanService.test.ts
├── contentPlanRoutes.test.ts
└── contentGeneration.test.ts    (Lambda logic tests)
```

---

## 17. File Inventory

### Phase 1 — Backend (files to create/modify)

| Action | File Path | Description |
|--------|-----------|-------------|
| **CREATE** | `apps/whatsnxt-bff/app/models/contentPlanSchema.ts` | MongoDB model with indexes |
| **CREATE** | `apps/whatsnxt-bff/app/services/contentPlanService.ts` | CRUD + topic extraction |
| **CREATE** | `apps/whatsnxt-bff/app/routes/contentPlan.routes.ts` | REST API routes |
| **MODIFY** | `apps/whatsnxt-bff/app/routes/article/v1/index.ts` | Mount content-plan routes |
| **CREATE** | `apps/whatsnxt-bff/app/tests/contentPlanService.test.ts` | Service unit tests |

### Phase 2 — Frontend (files to create/modify)

| Action | File Path | Description |
|--------|-----------|-------------|
| **MODIFY** | `apps/web/components/Blog/ContentTypeForm/index.tsx` | Add "Auto Create Content" card |
| **CREATE** | `apps/web/app/form/auto-create/page.tsx` | Route page |
| **CREATE** | `apps/web/components/Blog/AutoCreateForm/index.tsx` | Main form component |
| **CREATE** | `apps/web/components/Blog/AutoCreateForm/AutoCreateForm.module.css` | CSS module |

### Phase 3 — Lambda (files to create)

| Action | File Path | Description |
|--------|-----------|-------------|
| **CREATE** | `lambda/content-generation/index.js` | Main handler |
| **CREATE** | `lambda/content-generation/package.json` | Dependencies |
| **CREATE** | `lambda/content-generation/lib/config.js` | Env var loading |
| **CREATE** | `lambda/content-generation/lib/mongo-client.js` | Cached MongoDB |
| **CREATE** | `lambda/content-generation/lib/ai-client.js` | AI provider abstraction |
| **CREATE** | `lambda/content-generation/lib/content-generator.js` | Blog content gen |
| **CREATE** | `lambda/content-generation/lib/diagram-generator.js` | D3+JSDOM SVG rendering |
| **CREATE** | `lambda/content-generation/lib/blog-publisher.js` | Draft → publish flow |
| **CREATE** | `lambda/content-generation/lib/s3-client.js` | S3 + Brotli upload |
| **CREATE** | `lambda/content-generation/lib/logger.js` | Structured logging |
| **CREATE** | `lambda/content-generation/lib/errors.js` | Error classes |

### Phase 4 — Terraform (files to create/modify)

| Action | File Path | Description |
|--------|-----------|-------------|
| **CREATE** | `terraform/1-infra-app/lambda-content-generation.tf` | Full Lambda deployment |
| **MODIFY** | `terraform/1-infra-app/variables.tf` | Add new variables |
| **MODIFY** | `terraform/1-infra-app/terraform.tfvars` | Add variable values |

### Phase 5 — Dashboard (files to create/modify)

| Action | File Path | Description |
|--------|-----------|-------------|
| **CREATE** | `apps/web/components/Blog/ContentPlanDashboard/index.tsx` | Dashboard component |
| **CREATE** | `apps/web/components/Blog/ContentPlanDashboard/ContentPlanCard.tsx` | Plan card |
| **CREATE** | `apps/web/components/Blog/ContentPlanDashboard/ContentPlanDetail.tsx` | Plan detail view |
| **CREATE** | `apps/web/components/Blog/ContentPlanDashboard/ContentPlanDashboard.module.css` | CSS module |

---

## Implementation Order & Dependencies

```
Phase 1 (Backend) ← no dependencies
    │
    ▼
Phase 2 (Frontend) ← depends on Phase 1 API
    │
    ▼
Phase 3 (Lambda) ← depends on Phase 1 schema
    │
    ▼
Phase 4 (Terraform) ← depends on Phase 3 Lambda code
    │
    ▼
Phase 5 (Dashboard) ← depends on Phase 1 API
```

> **Note**: Phase 2 and Phase 3 can be developed in parallel after Phase 1 is complete. Phase 5 can also start after Phase 1.

---

*Auto Create Content Pipeline Plan v1.0.0 | WhatsNxt Constitution v5.4.0*
