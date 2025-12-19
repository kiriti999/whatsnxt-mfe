# Data Model: Lab Monetization System

**Feature**: 001-lab-monetization  
**Date**: 2025-12-18  
**Status**: Phase 1 Design

## Overview

Data models for lab pricing configuration, purchase records, transaction audit trail, and access control integration with existing course system.

---

## Entity Schemas

### 1. Lab (Extended Existing Entity)

**Collection**: `labs`  
**Purpose**: Stores lab content and metadata, extended with pricing configuration

#### Schema Definition

```typescript
interface Lab {
  _id: ObjectId;
  
  // Existing fields (not modified)
  title: string;
  description: string;
  instructorId: ObjectId;
  content: object;  // Lab diagram/test content
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  
  // NEW: Pricing configuration (embedded document)
  pricing: {
    purchaseType: 'free' | 'paid';    // Required, no default
    price?: number;                    // Required if purchaseType='paid'
    currency: 'INR';                   // Fixed for Phase 1
    updatedAt: Date;                   // Pricing last modified timestamp
    updatedBy: ObjectId;               // Instructor who last updated pricing
  };
  
  // ... other existing fields
}
```

#### Validation Rules

- `pricing.purchaseType`: Required, must be 'free' or 'paid'
- `pricing.price`: 
  - Required if `purchaseType === 'paid'`
  - Must not be present if `purchaseType === 'free'`
  - Minimum value: 10
  - Maximum value: 100000
  - Type: number (integer representing amount in rupees)
- `pricing.currency`: Always 'INR', fixed value
- `pricing.updatedAt`: Auto-set on pricing changes
- `pricing.updatedBy`: Must reference valid instructor

#### MongoDB Schema Validation

```javascript
db.labs.createIndex({ instructorId: 1 });  // Existing index

// Schema validation for pricing
db.runCommand({
  collMod: 'labs',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['pricing'],
      properties: {
        pricing: {
          bsonType: 'object',
          required: ['purchaseType', 'currency', 'updatedAt', 'updatedBy'],
          properties: {
            purchaseType: {
              enum: ['free', 'paid']
            },
            price: {
              bsonType: 'number',
              minimum: 10,
              maximum: 100000
            },
            currency: {
              enum: ['INR']
            },
            updatedAt: { bsonType: 'date' },
            updatedBy: { bsonType: 'objectId' }
          },
          // Custom validation: price required if paid
          additionalProperties: true
        }
      }
    }
  }
});
```

#### State Transitions

```
[New Lab Creation]
    ↓
[Instructor selects purchaseType]
    ↓
┌─────────────────────┬─────────────────────┐
│  purchaseType='free'│  purchaseType='paid'│
│  (no price)         │  (price required)   │
└─────────────────────┴─────────────────────┘
    ↓                         ↓
[Published with Free]    [Published with Price]
    ↓                         ↓
    └───────────────┬─────────┘
                    ↓
            [Price Updates Allowed]
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
[Update Price]              [Change purchaseType]
(always allowed)                    ↓
                    ┌───────────────┴───────────────┐
                    │                               │
            [Paid → Free]                   [Free → Paid]
            (blocked if purchases)          (grandfathered access)
```

---

### 2. LabPurchase (New Entity)

**Collection**: `lab_purchases`  
**Purpose**: Records completed student purchases of labs for access control and transaction history

#### Schema Definition

```typescript
interface LabPurchase {
  _id: ObjectId;
  studentId: ObjectId;              // Student who purchased
  labId: ObjectId;                  // Lab that was purchased
  purchaseDate: Date;               // When purchase completed
  transactionId: string;            // Razorpay transaction identifier
  amountPaid: number;               // Amount paid (preserves price at purchase time)
  currency: 'INR';                  // Currency used
  status: 'completed' | 'refunded'; // Purchase status
  
  // Razorpay metadata
  metadata: {
    razorpayOrderId: string;        // order_xxxxx
    razorpayPaymentId: string;      // pay_xxxxx
    razorpaySignature: string;      // Signature verification hash
    
    // Optional: For grandfathered free-to-paid conversions
    reason?: 'purchase' | 'free_to_paid_conversion';
    convertedBy?: ObjectId;         // Instructor who converted (if applicable)
    convertedAt?: Date;             // Conversion timestamp (if applicable)
  };
}
```

#### Validation Rules

- `studentId`: Required, must reference valid user with role 'student'
- `labId`: Required, must reference valid lab
- `purchaseDate`: Required, auto-set on creation, immutable
- `transactionId`: Required, unique, immutable
- `amountPaid`: Required, minimum 0 (for grandfathered), immutable
- `currency`: Fixed 'INR'
- `status`: Default 'completed', can transition to 'refunded' (manual process)
- `metadata.razorpayOrderId`: Required for purchases (not grandfathered)
- `metadata.razorpayPaymentId`: Required for purchases
- `metadata.razorpaySignature`: Required for purchases

#### Indexes

```javascript
// Unique constraint: One purchase per student per lab
db.lab_purchases.createIndex(
  { studentId: 1, labId: 1 },
  { unique: true }
);

// Query by student (transaction history)
db.lab_purchases.createIndex({ studentId: 1, purchaseDate: -1 });

// Query by lab (sales reporting)
db.lab_purchases.createIndex({ labId: 1, purchaseDate: -1 });

// Query by transaction ID (idempotency checks)
db.lab_purchases.createIndex({ transactionId: 1 }, { unique: true });
```

#### Relationships

- **studentId** → User (role: student)
- **labId** → Lab
- **metadata.convertedBy** → User (role: instructor)

---

### 3. Transaction (New Entity)

**Collection**: `transactions`  
**Purpose**: Audit trail for all payment attempts (successful, failed, cancelled) for compliance and debugging

#### Schema Definition

```typescript
interface Transaction {
  _id: ObjectId;
  studentId: ObjectId;              // Student who attempted transaction
  labId: ObjectId;                  // Lab being purchased
  timestamp: Date;                  // Transaction attempt time
  type: 'purchase_attempt' | 'purchase_success' | 'purchase_failed';
  amount: number;                   // Attempted amount
  currency: 'INR';
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  
  // Full gateway response (for debugging and dispute resolution)
  gatewayResponse: {
    orderId?: string;
    paymentId?: string;
    errorCode?: string;
    errorDescription?: string;
    raw: object;                    // Full Razorpay response
  };
  
  // Client context (for debugging payment issues)
  clientContext?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
  };
}
```

#### Validation Rules

- `studentId`: Required, must reference valid user
- `labId`: Required, must reference valid lab
- `timestamp`: Required, auto-set, immutable
- `type`: Required, immutable
- `amount`: Required, minimum 10 (except for failed attempts)
- `status`: Required, tracks transaction lifecycle
- `gatewayResponse.raw`: Required, stores full response for audit

#### Indexes

```javascript
// Query by timestamp (audit log queries)
db.transactions.createIndex({ timestamp: -1 });

// Query by student (user transaction history)
db.transactions.createIndex({ studentId: 1, timestamp: -1 });

// Query by lab (lab-specific transaction analysis)
db.transactions.createIndex({ labId: 1, timestamp: -1 });

// Query by status (monitoring failed transactions)
db.transactions.createIndex({ status: 1, timestamp: -1 });
```

#### State Transitions

```
[Purchase Initiated]
    ↓
[type: 'purchase_attempt', status: 'pending']
    ↓
┌───────────────────────────────┐
│                               │
[Payment Success]         [Payment Failed/Cancelled]
    ↓                               ↓
[type: 'purchase_success']    [type: 'purchase_failed']
[status: 'success']           [status: 'failed' or 'cancelled']
```

---

### 4. Course-Lab Relationship (Existing Entity)

**Collection**: `courses`  
**Purpose**: Existing entity that references included labs for bundled access

#### Existing Schema (Assumed)

```typescript
interface Course {
  _id: ObjectId;
  title: string;
  instructorId: ObjectId;
  
  // Labs included in this course
  labs: ObjectId[];  // Array of lab IDs
  
  // ... other course fields
}
```

#### No Schema Changes Required

Course entity already references labs. Access control logic queries this relationship.

---

### 5. CourseEnrollment (Existing Entity)

**Collection**: `course_enrollments`  
**Purpose**: Existing entity tracking student course enrollments, used for access control

#### Existing Schema (Assumed)

```typescript
interface CourseEnrollment {
  _id: ObjectId;
  studentId: ObjectId;
  courseId: ObjectId;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  
  // ... other enrollment fields
}
```

#### No Schema Changes Required

Existing enrollment records provide course-based lab access.

---

## Access Control Query Logic

### canAccessLab Function

**Input**: studentId (ObjectId), labId (ObjectId)  
**Output**: boolean (can access or not)

#### Decision Tree

```
1. Load lab by labId
   └─ If not found → return false

2. Check if lab is free
   └─ If pricing.purchaseType === 'free' → return true

3. Check for direct purchase
   └─ Query lab_purchases: { studentId, labId, status: 'completed' }
   └─ If found → return true

4. Check for course enrollment access
   └─ Query courses: { labs: labId } → Get courseIds
   └─ Query course_enrollments: { studentId, courseId: { $in: courseIds }, status: 'active' }
   └─ If found → return true

5. No access found
   └─ return false
```

#### Query Optimization

```typescript
async function canAccessLab(
  studentId: ObjectId,
  labId: ObjectId
): Promise<boolean> {
  
  // Check cache first (Redis or in-memory, 5-min TTL)
  const cacheKey = `lab_access:${studentId}:${labId}`;
  const cached = await cache.get(cacheKey);
  if (cached !== null) return cached;
  
  // 1. Load lab
  const lab = await Lab.findById(labId).select('pricing').lean();
  if (!lab) return false;
  
  // 2. Free lab → immediate access
  if (lab.pricing.purchaseType === 'free') {
    await cache.set(cacheKey, true, 300);  // Cache for 5 minutes
    return true;
  }
  
  // 3. Check purchase
  const purchase = await LabPurchase.findOne({
    studentId,
    labId,
    status: 'completed'
  }).lean();
  
  if (purchase) {
    await cache.set(cacheKey, true, 300);
    return true;
  }
  
  // 4. Check course enrollment
  // First, find courses containing this lab
  const coursesWithLab = await Course.find(
    { labs: labId }
  ).select('_id').lean();
  
  if (coursesWithLab.length === 0) {
    await cache.set(cacheKey, false, 300);
    return false;
  }
  
  const courseIds = coursesWithLab.map(c => c._id);
  
  // Check if student is enrolled in any of those courses
  const enrollment = await CourseEnrollment.findOne({
    studentId,
    courseId: { $in: courseIds },
    status: 'active'
  }).lean();
  
  const hasAccess = !!enrollment;
  await cache.set(cacheKey, hasAccess, 300);
  return hasAccess;
}
```

**Performance**: Target <200ms with indexes, <50ms with cache hit

---

## Data Migration Scenarios

### Scenario 1: Initial Lab Creation

**Before**: Lab document without pricing field  
**After**: Lab document with pricing field set by instructor

```javascript
// Create new lab
const newLab = {
  title: "New Lab Title",
  instructorId: instructorId,
  // ... other fields
  pricing: {
    purchaseType: 'free',  // or 'paid'
    price: undefined,      // or numeric value if paid
    currency: 'INR',
    updatedAt: new Date(),
    updatedBy: instructorId
  }
};
```

**No migration needed** - new field added at creation time.

---

### Scenario 2: Free to Paid Conversion with Grandfathering

**Before**: 
- Lab with `pricing.purchaseType = 'free'`
- Students have accessed lab (no purchase records exist)

**After**: 
- Lab with `pricing.purchaseType = 'paid'` and `pricing.price = 500`
- Existing students have grandfathered LabPurchase records

```typescript
async function convertFreeToPaid(
  labId: ObjectId,
  newPrice: number,
  instructorId: ObjectId
): Promise<void> {
  
  // Find students who accessed this free lab
  // (Implementation depends on existing access tracking)
  // Option 1: Query CourseEnrollment for courses containing this lab
  // Option 2: Query activity logs for lab access events
  
  const accessedStudents = await findStudentsWhoAccessedLab(labId);
  
  // Create grandfathered purchase records
  const grandfatheredPurchases = accessedStudents.map(studentId => ({
    studentId,
    labId,
    purchaseDate: new Date(),
    transactionId: `GRANDFATHERED_${labId}_${studentId}`,
    amountPaid: 0,
    currency: 'INR',
    status: 'completed',
    metadata: {
      razorpayOrderId: 'N/A',
      razorpayPaymentId: 'N/A',
      razorpaySignature: 'N/A',
      reason: 'free_to_paid_conversion',
      convertedBy: instructorId,
      convertedAt: new Date()
    }
  }));
  
  // Insert grandfathered records
  if (grandfatheredPurchases.length > 0) {
    await LabPurchase.insertMany(grandfatheredPurchases, { ordered: false });
  }
  
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

---

### Scenario 3: Price Update (Paid Lab)

**Before**: Lab with `pricing.price = 500`  
**After**: Lab with `pricing.price = 750`

```javascript
// Simple update, no purchase records affected
await Lab.updateOne(
  { _id: labId },
  {
    $set: {
      'pricing.price': 750,
      'pricing.updatedAt': new Date(),
      'pricing.updatedBy': instructorId
    }
  }
);
```

**Existing purchases** retain `amountPaid = 500` in their records (immutable).

---

## Relationships Diagram

```
┌─────────────────┐
│      User       │
│  (Instructor)   │
└────────┬────────┘
         │ creates/updates
         │
         ↓
┌─────────────────┐      included in      ┌─────────────────┐
│      Lab        │◄─────────────────────┐ │     Course      │
│  + pricing      │                      └─┤  + labs[]       │
└────────┬────────┘                        └────────┬────────┘
         │                                          │
         │ references                               │ enrolled in
         │                                          │
         ↓                                          ↓
┌─────────────────┐                        ┌─────────────────┐
│  LabPurchase    │                        │CourseEnrollment │
│  + studentId    │                        │  + studentId    │
│  + labId        │                        │  + courseId     │
└────────┬────────┘                        └────────┬────────┘
         │                                          │
         │ creates transaction                      │
         │                                          │
         ↓                                          ↓
┌─────────────────┐                        ┌─────────────────┐
│  Transaction    │                        │      User       │
│  + studentId    │◄───────────────────────│   (Student)     │
│  + labId        │                        └─────────────────┘
└─────────────────┘
```

---

## Data Integrity Constraints

### Application-Level Constraints

1. **Cannot delete lab with purchases**: Check `LabPurchase` count before lab deletion
2. **Cannot change paid to free with purchases**: Validate before pricing update
3. **Unique purchase per student-lab**: Enforced by compound unique index
4. **Immutable purchase records**: Only `status` field can change (to 'refunded')
5. **Transaction ID uniqueness**: Enforced by unique index, prevents duplicate processing

### Database-Level Constraints

1. MongoDB schema validation on `labs.pricing`
2. Unique indexes on `lab_purchases.transactionId`
3. Compound unique index on `lab_purchases.{studentId, labId}`
4. Indexes for performance on access control queries

---

## Cache Strategy

### Cache Keys

- `lab_access:{studentId}:{labId}` → boolean (TTL: 5 minutes)
- `lab_pricing:{labId}` → pricing object (TTL: 10 minutes)

### Cache Invalidation

- On lab pricing update → delete `lab_pricing:{labId}` and all `lab_access:*:{labId}` keys
- On lab purchase → delete `lab_access:{studentId}:{labId}`
- On course enrollment → delete all `lab_access:{studentId}:*` keys for student

---

**Data Model Complete** ✅  
All entities, schemas, validation rules, and relationships defined. Ready for API contract generation.
