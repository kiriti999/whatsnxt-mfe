# Research: Lab Monetization System

**Feature**: 001-lab-monetization  
**Date**: 2025-12-18  
**Status**: Phase 0 Complete

## Overview

Research findings for implementing lab monetization with free/paid pricing options, Razorpay payment integration, and course-based access bundling.

## Research Areas

### 1. Testing Framework (NEEDS CLARIFICATION → RESOLVED)

**Decision**: Use existing Jest + React Testing Library for frontend, Jest + Supertest for backend

**Rationale**: 
- Next.js 16 projects typically use Jest with React Testing Library as standard
- Express.js backend testing commonly uses Jest + Supertest for API endpoint testing
- Monorepo structure likely already has Jest configured at workspace level
- Maintains consistency across frontend/backend testing

**Alternatives Considered**:
- Vitest: Modern alternative but would require migration from existing setup
- Mocha/Chai: Less integrated with React ecosystem, steeper learning curve for component tests

**Action Items**:
- Verify existing `jest.config.js` in apps/web and apps/whatsnxt-bff
- Check for existing test examples to match conventions
- If not present, configure Jest with TypeScript support

---

### 2. MongoDB Schema Design for Lab Pricing

**Decision**: Embed pricing configuration within existing Lab document, separate collections for purchases and transactions

**Rationale**:
- Lab pricing is 1-to-1 with Lab entity - embedding avoids JOIN overhead
- Purchase records need independent querying (by student, by date, by transaction)
- Transaction records need audit trail independence and compliance retention
- MongoDB 7.0 supports schema validation for embedded documents

**Schema Approach**:
```typescript
// Embedded in Lab collection
Lab {
  _id: ObjectId,
  // ... existing lab fields
  pricing: {
    purchaseType: 'free' | 'paid',  // Required, no default
    price?: number,                  // Required if purchaseType='paid', min 10, max 100000
    currency: 'INR',                 // Fixed for this phase
    updatedAt: Date,
    updatedBy: ObjectId              // Instructor who last updated
  },
  // ... other fields
}

// Separate LabPurchase collection
LabPurchase {
  _id: ObjectId,
  studentId: ObjectId,              // Indexed
  labId: ObjectId,                  // Indexed
  purchaseDate: Date,               // Indexed for reporting
  transactionId: string,            // Razorpay transaction ID
  amountPaid: number,               // Preserve price at purchase time
  currency: 'INR',
  status: 'completed' | 'failed' | 'refunded',
  metadata: {
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  }
}

// Separate Transaction collection (audit trail)
Transaction {
  _id: ObjectId,
  studentId: ObjectId,              // Indexed
  labId: ObjectId,                  // Indexed
  timestamp: Date,                  // Indexed
  type: 'purchase_attempt' | 'purchase_success' | 'purchase_failed',
  amount: number,
  currency: 'INR',
  gatewayResponse: object,          // Full response from Razorpay
  status: 'pending' | 'success' | 'failed' | 'cancelled'
}
```

**Alternatives Considered**:
- Separate LabPricing collection: Adds complexity with no benefit for 1-to-1 relationship
- Single denormalized collection: Violates audit trail requirements, complicates refunds

**Indexes Required**:
- `LabPurchase: { studentId: 1, labId: 1 }` (unique compound) - fast access checks
- `LabPurchase: { purchaseDate: 1 }` - reporting queries
- `Transaction: { timestamp: 1 }` - audit log queries
- `Transaction: { studentId: 1 }` - student transaction history

---

### 3. Razorpay Integration Pattern (Existing Implementation)

**Decision**: Extend existing Razorpay integration for course payments to support lab purchases

**Rationale**:
- Spec assumption: "platform already has a functioning Razorpay payment gateway integration"
- Reusing established integration reduces risk and maintains consistency
- Existing webhook/callback handlers can be extended for lab purchase events
- Same merchant account, API keys, and security patterns

**Integration Pattern**:
```typescript
// Frontend (apps/web)
1. User clicks "Purchase for ₹{price}"
2. Call BFF endpoint POST /api/labs/{labId}/purchase/initiate
3. BFF creates Razorpay order with lab details
4. BFF returns order_id to frontend
5. Frontend opens Razorpay modal with order_id
6. User completes payment in Razorpay modal
7. Razorpay calls frontend callback with payment details
8. Frontend calls BFF POST /api/labs/{labId}/purchase/verify
9. BFF verifies signature, creates purchase record, grants access

// Backend webhook (apps/whatsnxt-bff)
10. Razorpay webhook POST /api/webhooks/razorpay
11. Verify webhook signature
12. Update transaction status
13. Handle idempotency (payment.captured may arrive multiple times)
```

**Best Practices**:
- Signature verification mandatory (prevents payment fraud)
- Idempotent callback handling (track by transaction ID)
- Store full gateway response for dispute resolution
- Timeout handling: 5-minute order expiry, allow retry with new order
- Error messages: User-friendly for failures, detailed logging for debugging

**Alternatives Considered**:
- Direct Razorpay SDK on frontend: Reduces server control, harder to audit
- Synchronous payment verification: Webhook failures would break flow

**Action Items**:
- Locate existing Razorpay integration code in apps/whatsnxt-bff
- Review existing order creation and verification logic
- Extend for lab-specific metadata (labId, labTitle)

---

### 4. Course-Lab Access Control Integration

**Decision**: Query-based access check combining purchase records and course enrollments

**Rationale**:
- Spec requires automatic lab access for course-enrolled students
- Access decision happens at lab access time (on-demand check)
- Avoids denormalization of access grants across purchase and enrollment systems

**Access Control Logic**:
```typescript
// When student attempts to access lab
async function canAccessLab(studentId: ObjectId, labId: ObjectId): Promise<boolean> {
  const lab = await Lab.findById(labId);
  
  // Free labs: always accessible
  if (lab.pricing.purchaseType === 'free') {
    return true;
  }
  
  // Check direct purchase
  const purchase = await LabPurchase.findOne({
    studentId,
    labId,
    status: 'completed'
  });
  if (purchase) {
    return true;
  }
  
  // Check course enrollment
  const enrollment = await CourseEnrollment.findOne({
    studentId,
    status: 'active',
    'course.labs': labId  // Assumes courses have lab references
  });
  if (enrollment) {
    return true;
  }
  
  return false;
}
```

**Performance Optimization**:
- Cache access decisions for 5 minutes (Redis if available)
- Compound indexes on (studentId, labId) for fast lookups
- Target <200ms response time per spec

**Alternatives Considered**:
- Denormalized access table: Requires sync on purchase + enrollment changes, increases complexity
- Real-time event propagation: Overkill for access checks, adds infrastructure requirements

**Action Items**:
- Verify existing Course and CourseEnrollment schema for lab references
- Confirm if Redis is available for caching
- Implement access middleware for lab routes

---

### 5. Price Update Validation Rules

**Decision**: Allow price updates with constraints, prevent paid-to-free conversion if purchases exist

**Rationale**:
- Spec requirement: "prevent instructors from changing a paid lab to free if any students have purchased it"
- Existing purchase records preserve original price paid (immutable)
- New purchases use updated price immediately

**Validation Logic**:
```typescript
async function validatePricingUpdate(
  labId: ObjectId,
  currentPricing: LabPricing,
  newPricing: LabPricing
): Promise<ValidationResult> {
  
  // Paid to Free: Check for existing purchases
  if (currentPricing.purchaseType === 'paid' && newPricing.purchaseType === 'free') {
    const purchaseCount = await LabPurchase.countDocuments({
      labId,
      status: 'completed'
    });
    
    if (purchaseCount > 0) {
      return {
        valid: false,
        error: 'Cannot change paid lab to free - students have already purchased this lab'
      };
    }
  }
  
  // Free to Paid: Always allowed, existing free accessors grandfathered
  // (Spec: "existing students who accessed it as free retain access")
  // Implementation: Create purchase records with amountPaid=0 for existing free accessors
  
  // Paid price change: Always allowed
  if (currentPricing.purchaseType === 'paid' && newPricing.purchaseType === 'paid') {
    // Validate new price range
    if (newPricing.price < 10 || newPricing.price > 100000) {
      return {
        valid: false,
        error: 'Price must be between ₹10 and ₹100,000'
      };
    }
  }
  
  return { valid: true };
}
```

**Alternatives Considered**:
- Allow all changes: Violates spec requirement and creates confusion for paying students
- Version pricing history: Over-engineering for this phase, covered by transaction records

---

### 6. Free-to-Paid Migration Strategy

**Decision**: Create zero-amount purchase records for existing free-lab accessors when converting to paid

**Rationale**:
- Spec requirement: "existing students who accessed it as free retain access without payment requirement"
- Unifies access control logic (always check LabPurchase + CourseEnrollment)
- Provides audit trail of grandfathered access

**Migration Implementation**:
```typescript
async function convertFreeToPaid(
  labId: ObjectId,
  newPrice: number,
  instructorId: ObjectId
): Promise<void> {
  // Find students with current access to free lab
  const freeAccessors = await findStudentsWithFreeAccess(labId);
  
  // Create grandfathered purchase records
  const grandfatheredPurchases = freeAccessors.map(studentId => ({
    studentId,
    labId,
    purchaseDate: new Date(),
    transactionId: `GRANDFATHERED_${labId}_${studentId}`,
    amountPaid: 0,
    currency: 'INR',
    status: 'completed',
    metadata: {
      reason: 'free_to_paid_conversion',
      convertedBy: instructorId,
      convertedAt: new Date()
    }
  }));
  
  await LabPurchase.insertMany(grandfatheredPurchases);
  
  // Update lab pricing
  await Lab.updateOne(
    { _id: labId },
    {
      $set: {
        'pricing.purchaseType': 'paid',
        'pricing.price': newPrice,
        'pricing.updatedAt': new Date(),
        'pricing.updatedBy': instructorId
      }
    }
  );
}
```

**Alternatives Considered**:
- Maintain separate "grandfathered" flag: Complicates access logic
- Don't track free accessors: No audit trail, can't identify who was grandfathered

---

## Technology Best Practices

### Next.js 16 + React 19
- Use Server Components for lab listing pages (SEO, performance)
- Use Client Components for interactive pricing forms and payment modals
- API routes in `app/api/` for BFF communication
- Mantine UI components for consistent styling

### Express.js 5 + MongoDB 7
- Use async/await with try-catch for all async operations
- Implement request validation with Joi or Zod
- Use MongoDB transactions for multi-document updates (pricing migrations)
- Connection pooling already configured in existing setup

### Razorpay SDK
- Server-side order creation for security
- Client-side modal for payment UX
- Webhook signature verification using crypto.createHmac
- Test mode vs production mode environment configuration

---

## Open Questions Resolved

1. **Testing Framework**: Jest + React Testing Library (frontend), Jest + Supertest (backend)
2. **Caching Strategy**: Redis if available, otherwise in-memory with 5-min TTL for access checks
3. **Currency Support**: INR only for Phase 1, multi-currency deferred
4. **Tax Handling**: Prices inclusive of tax (spec assumption confirmed)
5. **Refund Process**: Out of scope - manual admin workflow
6. **Access Revocation**: Course unenrollment revokes course-granted lab access, purchases remain valid

---

## Next Steps (Phase 1)

1. Generate `data-model.md` with detailed entity schemas
2. Create API contracts in `contracts/` directory (OpenAPI specs)
3. Generate `quickstart.md` for development setup
4. Update agent context with new technologies/patterns
5. Re-evaluate Constitution Check with design artifacts

---

**Research Complete** ✅  
All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design artifacts.
