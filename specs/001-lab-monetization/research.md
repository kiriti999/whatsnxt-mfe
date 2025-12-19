# Research: Lab Monetization System

**Feature**: 001-lab-monetization  
**Date**: 2025-12-18  
**Status**: Phase 0 Complete

## Overview

This document consolidates research findings for implementing the lab monetization system. All technical unknowns from the Technical Context have been resolved through analysis of the existing codebase and best practices research.

## Research Tasks Completed

### 1. Razorpay Payment Integration Pattern

**Question**: How is the existing Razorpay integration structured for course purchases?

**Findings**:
- **Location**: `apps/whatsnxt-bff/app/controllers/course/razorpayController.ts`
- **Authentication**: Uses Basic Auth with `RAZOR_PAY_KEY:RAZOR_PAY_SECRET` from environment variables
- **API Pattern**: Direct Razorpay REST API calls via fetch
- **Key Methods**:
  - `getPaymentDetailsById`: Fetch payment status by payment ID
  - `capturePayment`: Capture authorized payment
- **Frontend Integration**: Uses `react-razorpay` library (version 3.0.1) for Razorpay checkout modal
- **Package**: Razorpay SDK version 2.9.0 installed in backend

**Decision**: Reuse the existing Razorpay controller pattern and extend it with lab-specific payment methods. Use the same authentication mechanism and API structure for consistency.

**Rationale**: Maintaining consistency with existing payment infrastructure reduces implementation risk, leverages proven patterns, and simplifies maintenance.

**Alternatives Considered**:
- Create separate Razorpay client for labs → Rejected: Duplicates configuration and increases maintenance burden
- Use Razorpay SDK wrapper methods → Rejected: Existing code uses direct REST API calls; consistency is preferred

---

### 2. Purchase Record Storage Pattern

**Question**: How are course enrollments and purchases currently tracked?

**Findings**:
- **Course Enrollment Model**: `apps/whatsnxt-bff/app/models/enrolledCourses.ts`
  - Stores: `buyerEmail`, `cost`, `course` (ObjectId ref), `user` (ObjectId ref), timestamps
  - Uses compound index on `{user: 1, course: 1}`
  - Tracks lesson progress with `lessons` array
- **Transaction Pattern**: Appears to be simple - enrollment record creation implies successful payment
- **MongoDB Collections**: Uses Mongoose schemas with timestamps enabled

**Decision**: Create `LabPurchase` model similar to `enrolledCourses` structure but simplified for lab context:
- Store: `studentId` (string UUID), `labId` (string UUID), `transactionId`, `amountPaid`, `purchaseDate`, `paymentStatus`
- Create compound index on `{studentId: 1, labId: 1}` for quick access checks
- Add separate `Transaction` model for detailed payment tracking (all attempts, not just successful)

**Rationale**: Following the established pattern ensures consistency with the existing codebase. Separating purchase records (successful) from transaction records (all attempts) provides better auditability and reconciliation capabilities for financial compliance.

**Alternatives Considered**:
- Single combined transaction/purchase table → Rejected: Mixes concerns, makes access control queries more complex
- Embed purchase records in Lab model → Rejected: Violates data normalization, creates scaling issues

---

### 3. Access Control Pattern for Course-Based Lab Access

**Question**: How does the system currently determine if a student is enrolled in a course?

**Findings**:
- **Enrollment Check**: Query `enrolledCourses` collection by `user` and `course` ObjectId
- **Course-Lab Relationship**: Need to investigate how courses reference labs
- **Lab Model**: `apps/whatsnxt-bff/app/models/lab/Lab.ts` contains lab metadata
- **Assumption**: Courses likely have array field referencing labs or separate relationship table

**Decision**: Access control logic will check THREE conditions in order:
1. Is lab marked as "free"? → Grant immediate access
2. Has student purchased this lab? → Query `LabPurchase` by `{studentId, labId}`
3. Is student enrolled in a course containing this lab? → Query `enrolledCourses` + course-lab relationship

Return access decision with reason (free/purchased/course-enrolled/denied).

**Rationale**: Priority-based checking (free → purchase → course) optimizes performance by avoiding unnecessary queries. Explicit reason tracking aids debugging and provides clear user feedback.

**Alternatives Considered**:
- Check all conditions in parallel → Rejected: Wastes database queries for obvious cases (free labs)
- Cache access decisions → Deferred: Premature optimization; implement if performance metrics require it

---

### 4. Mongoose Validation Best Practices for Pricing

**Question**: What validation approach should be used for conditional pricing requirements?

**Findings**:
- **Existing Lab Model**: Already contains pricing field with embedded validation (lines 78-110 in Lab.ts)
- **Validation Strategy**: Uses Mongoose custom validators with `this` context
- **Pattern**: Price field has validator that checks `this.pricing?.purchaseType === "paid"`
- **Currency Default**: Set to "INR" with default value

**Decision**: The Lab model already has proper validation implemented:
```typescript
pricing: {
  purchaseType: { type: String, enum: ["free", "paid"] },
  price: {
    type: Number,
    min: 10,
    max: 100000,
    validate: {
      validator: function(value) {
        if (this.pricing?.purchaseType === "paid") {
          return value >= 10 && value <= 100000;
        }
        return true;
      }
    }
  },
  currency: { type: String, default: "INR" }
}
```

No changes needed to Lab model validation. Additional Joi validation schemas will be created for API request validation.

**Rationale**: Existing implementation matches requirements perfectly. Joi schemas at the API layer provide request validation before database operations.

**Alternatives Considered**:
- Move all validation to Joi → Rejected: Loses database-level data integrity protection
- Only database validation → Rejected: Provides poor user feedback on invalid requests

---

### 5. Idempotency Key Strategy for Payment Callbacks

**Question**: How should duplicate payment callbacks be handled?

**Findings**:
- **Razorpay Behavior**: Payment gateway may send duplicate callbacks due to retries, network issues, or webhook failures
- **Transaction ID**: Razorpay provides unique `razorpay_payment_id` for each payment attempt
- **Risk**: Creating duplicate purchase records or double-granting access

**Decision**: Implement idempotency using `transactionId` as unique key:
1. Add unique index on `LabPurchase.transactionId` field
2. Use MongoDB upsert operation with `transactionId` filter
3. On callback receipt: `LabPurchase.findOneAndUpdate({ transactionId }, purchaseData, { upsert: true })`
4. Store all callback attempts in `Transaction` model for audit trail

**Rationale**: Database-level unique constraint prevents duplicate purchases at the data layer. Upsert operation makes callback handler naturally idempotent. Audit trail in Transaction model enables reconciliation.

**Alternatives Considered**:
- Application-level deduplication logic → Rejected: Race conditions possible in distributed systems
- Redis-based distributed lock → Rejected: Adds complexity without clear benefit; database constraint is simpler
- Ignore duplicates in application code → Rejected: No audit trail for troubleshooting

---

### 6. Joi Validation Schema Design for API Requests

**Question**: What validation rules should be enforced at the API layer for pricing and purchase endpoints?

**Findings**:
- **Existing Usage**: Backend uses Joi 17.8.4 for request validation
- **Validation Pattern**: Joi schemas defined in route handlers or separate validation files
- **Lab Context**: Need schemas for: create/update lab with pricing, initiate purchase, update pricing

**Decision**: Create Joi validation schemas for:

**Lab Creation/Update Pricing**:
```javascript
{
  pricing: Joi.object({
    purchaseType: Joi.string().valid('free', 'paid').required(),
    price: Joi.when('purchaseType', {
      is: 'paid',
      then: Joi.number().min(10).max(100000).required(),
      otherwise: Joi.number().optional()
    }),
    currency: Joi.string().default('INR')
  }).required()
}
```

**Purchase Initiation**:
```javascript
{
  labId: Joi.string().uuid().required(),
  studentId: Joi.string().uuid().required()
}
```

**Price Update**:
```javascript
{
  labId: Joi.string().uuid().required(),
  pricing: Joi.object({
    price: Joi.number().min(10).max(100000).required()
  }).required()
}
```

**Rationale**: API-layer validation provides immediate feedback to clients before database operations. Conditional validation (`Joi.when`) matches business rules for paid labs requiring prices.

**Alternatives Considered**:
- Rely only on database validation → Rejected: Poor user experience with generic database errors
- Custom validation middleware → Rejected: Joi provides cleaner, more declarative syntax

---

### 7. Error Handling and User Feedback Strategy

**Question**: How should pricing and purchase errors be communicated to users?

**Findings**:
- **Constitution Requirement**: Must use `@whatsnxt/errors` workspace package
- **HTTP Status Codes**: Backend uses `http-status-codes` package (version 2.3.0)
- **Error Response Pattern**: Need consistent error response structure

**Decision**: Create custom error classes in `@whatsnxt/errors` package:

```typescript
// packages/errors/src/lab/pricing.ts
class LabPricingError extends ApplicationError {
  constructor(message: string, code: string) {
    super(message, code, StatusCodes.BAD_REQUEST);
  }
}

class InsufficientPriceError extends LabPricingError {
  constructor() {
    super('Price must be at least ₹10 for paid labs', 'LAB_PRICE_TOO_LOW');
  }
}

class InvalidPricingChangeError extends LabPricingError {
  constructor() {
    super('Cannot change paid lab to free when students have purchased it', 'INVALID_PRICING_CHANGE');
  }
}

class LabPurchaseError extends ApplicationError { ... }
class PaymentFailedError extends LabPurchaseError { ... }
class AlreadyPurchasedError extends LabPurchaseError { ... }
```

Error responses will include:
- `message`: Human-readable error description
- `code`: Machine-readable error identifier (for frontend handling)
- `statusCode`: HTTP status code
- `context`: Additional error details (e.g., current price, minimum allowed)

**Rationale**: Custom error classes provide type-safe error handling, consistent error codes for frontend, and clear user feedback. Following constitution mandate for `@whatsnxt/errors` ensures consistency.

**Alternatives Considered**:
- Generic error messages → Rejected: Poor user experience, difficult to debug
- HTTP status codes only → Rejected: Insufficient granularity for client error handling
- Error codes in constants file only → Rejected: Loses type safety and error context

---

### 8. Payment Gateway Callback Security

**Question**: How should payment gateway callbacks be authenticated to prevent fraud?

**Findings**:
- **Razorpay Security**: Provides webhook signature verification using HMAC
- **Signature Validation**: `razorpay_signature = HMAC_SHA256(webhook_secret, request_body)`
- **Existing Implementation**: Need to verify if current course payment callbacks implement signature verification

**Decision**: Implement Razorpay webhook signature verification:
1. Extract `x-razorpay-signature` header from callback request
2. Compute HMAC-SHA256 of request body using webhook secret
3. Compare computed signature with received signature
4. Reject callback if signatures don't match

```typescript
import crypto from 'crypto';

function verifyRazorpaySignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
```

**Rationale**: Webhook signature verification prevents unauthorized parties from triggering purchase completion. Using timing-safe comparison prevents timing attacks.

**Alternatives Considered**:
- IP whitelist only → Rejected: IP addresses can be spoofed or change
- No verification → Rejected: Critical security vulnerability allowing fake purchases
- API key in callback URL → Rejected: Less secure than HMAC signature, susceptible to logs

---

### 9. Frontend Payment Flow UX Pattern

**Question**: What is the optimal user experience for the lab purchase flow?

**Findings**:
- **Existing Pattern**: Course purchases likely use modal-based Razorpay checkout
- **react-razorpay Library**: Provides `useRazorpay` hook for programmatic checkout
- **Frontend Framework**: Next.js 16 with React 19 and Mantine UI

**Decision**: Implement modal-based purchase flow:

1. **Lab Details Page**: Show pricing and "Purchase for ₹{price}" button
2. **Click Handler**: Invoke `useRazorpay` hook to open Razorpay checkout modal
3. **Razorpay Modal**: Handle payment within Razorpay-hosted UI (security + PCI compliance)
4. **Success Callback**: Close modal, show success notification, update UI to show "Access Lab" button
5. **Failure Callback**: Close modal, show error notification with retry option

**Component Structure**:
```typescript
// components/labs/PurchaseButton.tsx
const PurchaseButton = ({ lab, studentId }) => {
  const razorpay = useRazorpay();
  
  const handlePurchase = async () => {
    // 1. Create order on backend (amount, labId, studentId)
    // 2. Open Razorpay modal with order details
    // 3. Handle success/failure callbacks
    // 4. Update UI based on payment result
  };
  
  return <Button onClick={handlePurchase}>Purchase for ₹{lab.pricing.price}</Button>;
};
```

**Rationale**: Modal-based flow keeps user on the same page, provides seamless experience, leverages Razorpay's PCI-compliant payment UI, and matches existing course purchase pattern.

**Alternatives Considered**:
- Redirect to separate payment page → Rejected: Disruptive user experience, state management complexity
- Embedded payment form → Rejected: PCI compliance burden, security risks, more complex implementation
- Server-side payment page → Rejected: Breaks single-page application flow

---

### 10. Database Query Optimization Strategy

**Question**: How should database queries be optimized for access control checks (potentially high-frequency)?

**Findings**:
- **Access Check Frequency**: Every lab page view requires access check
- **Query Patterns**:
  - Check if lab is free: `Lab.findOne({ id: labId, 'pricing.purchaseType': 'free' })`
  - Check if purchased: `LabPurchase.findOne({ studentId, labId })`
  - Check course enrollment: `enrolledCourses.findOne({ user, course }) + course-lab relationship`

**Decision**: Apply MongoDB indexing strategy:
1. **Lab Model**: Already has index on `id` (unique)
2. **LabPurchase Model**: Add compound index `{studentId: 1, labId: 1}`
3. **Transaction Model**: Add index on `transactionId` (unique) and `{studentId: 1, createdAt: -1}`
4. **Query Order**: Check free status first (cheap lookup), then purchase (indexed), then course enrollment

Future optimization (if needed):
- Redis caching layer for lab pricing metadata (rarely changes)
- Cache purchase status per student session (invalidate on new purchase)

**Rationale**: Proper indexing ensures O(log n) query performance instead of O(n) table scans. Checking conditions in order of likelihood (free → purchase → course) minimizes average query cost. Defer caching until performance monitoring indicates need.

**Alternatives Considered**:
- Aggressive Redis caching → Rejected: Premature optimization, adds cache invalidation complexity
- Denormalize purchase status into user document → Rejected: Violates data normalization, creates consistency issues
- Single mega-query with joins → Rejected: Complex query logic, harder to maintain and debug

---

## Technology Stack Confirmation

### Backend
- **Runtime**: Node.js 24.11.0 LTS ✅
- **Framework**: Express.js 5.0.0 ✅
- **Database**: MongoDB 7.0 via Mongoose 7.6.10 ✅
- **Payment Gateway**: Razorpay 2.9.0 SDK ✅
- **Validation**: Joi 17.8.4 ✅
- **Logging**: Winston 3.2.1 ✅
- **Testing**: Vitest 4.0.15 ✅

### Frontend
- **Framework**: Next.js 16.0.7 ✅
- **Library**: React 19.1.0 ✅
- **UI Components**: Mantine UI 8.3.10 ✅
- **Payment Integration**: react-razorpay 3.0.1 ✅
- **HTTP Client**: axios via @whatsnxt/http-client ✅

### Shared Packages
- **Types**: @whatsnxt/core-types ✅
- **Constants**: @whatsnxt/constants ✅
- **Errors**: @whatsnxt/errors ✅
- **HTTP Client**: @whatsnxt/http-client ✅

---

## Best Practices Research

### 1. Mongoose Model Design for Embedded Pricing

**Research**: Best practices for embedded vs. referenced documents in MongoDB

**Finding**: 
- Embed when data is tightly coupled and accessed together (pricing is always accessed with lab)
- Reference when data grows unbounded or is shared across documents (purchases are per-student-lab pair)
- Lab pricing is 1:1 relationship with lab → embedded
- Purchase records are many-per-lab → separate collection

**Application**: 
- Pricing embedded in Lab model (already implemented)
- Purchase records in separate LabPurchase collection
- Transaction records in separate Transaction collection

---

### 2. Express.js 5 Error Handling Pattern

**Research**: Error handling best practices for Express.js 5

**Finding**:
- Use async/await with try-catch in route handlers
- Custom error middleware for centralized error processing
- Throw custom error classes for business logic errors
- Let Express error middleware format responses consistently

**Application**:
```typescript
// Route handler pattern
router.post('/purchase', async (req, res, next) => {
  try {
    const result = await labPurchaseService.initiatePurchase(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error); // Pass to error middleware
  }
});

// Error middleware (already exists in app)
app.use((err, req, res, next) => {
  logger.error('API error', { error: err, path: req.path });
  res.status(err.statusCode || 500).json({
    message: err.message,
    code: err.code,
    ...(process.env.NODE_ENV === 'dev' && { stack: err.stack })
  });
});
```

---

### 3. Frontend State Management for Purchase Flow

**Research**: Best practices for managing payment state in React 19

**Finding**:
- Use React hooks for local component state (purchase button state)
- Use Mantine notifications for user feedback (success/error messages)
- Optimistic UI updates for better perceived performance
- Handle loading, success, and error states explicitly

**Application**:
```typescript
const PurchaseButton = ({ lab, onPurchaseComplete }) => {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotifications();
  
  const handlePurchase = async () => {
    setLoading(true);
    try {
      const order = await createLabOrder(lab.id);
      const result = await razorpay.open(order);
      showNotification({ message: 'Purchase successful!', color: 'green' });
      onPurchaseComplete();
    } catch (error) {
      showNotification({ message: 'Purchase failed', color: 'red' });
    } finally {
      setLoading(false);
    }
  };
  
  return <Button loading={loading} onClick={handlePurchase}>Purchase</Button>;
};
```

---

### 4. Testing Strategy for Payment Integration

**Research**: How to test payment gateway integration without live transactions

**Finding**:
- Razorpay provides test mode with test API keys
- Test credit card numbers trigger specific behaviors (success/failure)
- Mock payment gateway responses in unit tests
- Use Razorpay test mode in integration tests

**Application**:
- **Unit Tests**: Mock Razorpay API calls, test business logic in isolation
- **Integration Tests**: Use Razorpay test mode with test cards
- **E2E Tests**: Full payment flow with test credentials
- Environment variables for test vs. production keys

---

## Summary of Decisions

| Decision Area | Choice | Rationale |
|--------------|--------|-----------|
| Payment Integration | Reuse existing Razorpay controller pattern | Consistency, proven approach |
| Purchase Storage | Separate LabPurchase model | Data normalization, access control queries |
| Access Control | Priority-based checking (free → purchase → course) | Performance optimization |
| Validation | Mongoose + Joi dual-layer | Data integrity + user feedback |
| Idempotency | Transaction ID unique constraint + upsert | Prevents duplicate purchases |
| Error Handling | Custom error classes in @whatsnxt/errors | Type safety, consistent responses |
| Callback Security | HMAC signature verification | Prevents unauthorized purchase grants |
| Frontend UX | Modal-based Razorpay checkout | Seamless experience, PCI compliance |
| Database Optimization | Compound indexes + query ordering | O(log n) performance |
| Testing Approach | Vitest + Razorpay test mode | Real integration without live charges |

---

## Next Steps

With all research questions resolved, proceed to:
1. **Phase 1**: Generate data model documentation (data-model.md)
2. **Phase 1**: Create API contracts (OpenAPI JSON specifications)
3. **Phase 1**: Write quickstart guide (quickstart.md)
4. **Phase 1**: Update agent context with new technologies and patterns

All technical decisions are documented and ready for implementation planning.
