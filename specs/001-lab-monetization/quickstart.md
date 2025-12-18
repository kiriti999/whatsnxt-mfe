# Quickstart: Lab Monetization Development

**Feature**: 001-lab-monetization  
**Date**: 2025-12-18

## Prerequisites

- Node.js 24 LTS installed
- MongoDB 7.0 running locally (or connection string)
- Redis (optional, for caching)
- Razorpay test account credentials
- pnpm package manager

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd /Users/arjun/whatsnxt-mfe

# Install dependencies
pnpm install

# Verify turbo build system
pnpm build
```

### 2. Configure Environment Variables

Create/update `.env.local` in `apps/whatsnxt-bff/`:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/whatsnxt
MONGODB_DB_NAME=whatsnxt

# Redis Configuration (optional, for caching)
REDIS_URL=redis://localhost:6379

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application Configuration
NODE_ENV=development
PORT=3000

# Session Configuration
SESSION_SECRET=your_session_secret_key_here
```

Create/update `.env.local` in `apps/web/`:

```bash
# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Start MongoDB and Redis (macOS with Homebrew)

```bash
# Start MongoDB
brew services start mongodb-community@7.0

# Start Redis (if using cache)
brew services start redis

# Verify MongoDB is running
mongosh --eval "db.version()"

# Verify Redis is running
redis-cli ping
```

## Database Setup

### 1. Connect to MongoDB

```bash
mongosh mongodb://localhost:27017/whatsnxt
```

### 2. Create Collections and Indexes

```javascript
// Create lab_purchases collection with indexes
db.createCollection('lab_purchases');

db.lab_purchases.createIndex(
  { studentId: 1, labId: 1 },
  { unique: true }
);

db.lab_purchases.createIndex({ studentId: 1, purchaseDate: -1 });
db.lab_purchases.createIndex({ labId: 1, purchaseDate: -1 });
db.lab_purchases.createIndex({ transactionId: 1 }, { unique: true });

// Create transactions collection with indexes
db.createCollection('transactions');

db.transactions.createIndex({ timestamp: -1 });
db.transactions.createIndex({ studentId: 1, timestamp: -1 });
db.transactions.createIndex({ labId: 1, timestamp: -1 });
db.transactions.createIndex({ status: 1, timestamp: -1 });

// Add validation to labs collection for pricing field
db.runCommand({
  collMod: 'labs',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      properties: {
        pricing: {
          bsonType: 'object',
          required: ['purchaseType', 'currency', 'updatedAt', 'updatedBy'],
          properties: {
            purchaseType: {
              enum: ['free', 'paid']
            },
            price: {
              bsonType: ['number'],
              minimum: 10,
              maximum: 100000
            },
            currency: {
              enum: ['INR']
            },
            updatedAt: { bsonType: 'date' },
            updatedBy: { bsonType: 'objectId' }
          }
        }
      }
    }
  },
  validationLevel: 'moderate'
});
```

### 3. Seed Test Data (Optional)

```javascript
// Create test instructor user
const instructorId = ObjectId();
db.users.insertOne({
  _id: instructorId,
  email: 'instructor@test.com',
  name: 'Test Instructor',
  role: 'instructor',
  createdAt: new Date()
});

// Create test student user
const studentId = ObjectId();
db.users.insertOne({
  _id: studentId,
  email: 'student@test.com',
  name: 'Test Student',
  role: 'student',
  createdAt: new Date()
});

// Create a free lab
const freeLab = {
  _id: ObjectId(),
  title: 'Free AWS Basics Lab',
  description: 'Introduction to AWS services',
  instructorId: instructorId,
  content: {},
  status: 'published',
  pricing: {
    purchaseType: 'free',
    currency: 'INR',
    updatedAt: new Date(),
    updatedBy: instructorId
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
db.labs.insertOne(freeLab);

// Create a paid lab
const paidLab = {
  _id: ObjectId(),
  title: 'Advanced AWS Architecture Lab',
  description: 'Design scalable cloud architectures',
  instructorId: instructorId,
  content: {},
  status: 'published',
  pricing: {
    purchaseType: 'paid',
    price: 500,
    currency: 'INR',
    updatedAt: new Date(),
    updatedBy: instructorId
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
db.labs.insertOne(paidLab);

print('Test data seeded successfully');
print('Free Lab ID: ' + freeLab._id);
print('Paid Lab ID: ' + paidLab._id);
print('Instructor ID: ' + instructorId);
print('Student ID: ' + studentId);
```

## Running the Application

### Start Backend (BFF)

```bash
cd apps/whatsnxt-bff
pnpm dev
```

Expected output:
```
[nodemon] starting `ts-node server.ts`
MongoDB connected successfully
Express server running on port 3000
```

### Start Frontend (Next.js)

```bash
cd apps/web
pnpm dev
```

Expected output:
```
▲ Next.js 16.0.7
- Local:        http://localhost:3001
- Experiments (use with caution):
  · turbopack

✓ Ready in 2.3s
```

## Development Workflow

### 1. Test TDD Approach (Red-Green-Refactor)

#### Backend Tests

```bash
cd apps/whatsnxt-bff

# Run all tests
pnpm test

# Run specific test file
pnpm test -- labPricingService.test.ts

# Run tests in watch mode
pnpm test:watch
```

#### Frontend Tests

```bash
cd apps/web

# Run all tests
pnpm test

# Run specific component test
pnpm test -- LabPricingForm.test.tsx

# Run tests in watch mode
pnpm test:watch
```

### 2. Access API Documentation

Once backend is running, access Swagger UI:

```
http://localhost:3000/api-docs
```

This provides interactive API documentation generated from the OpenAPI spec.

### 3. Test Razorpay Integration

Use Razorpay test cards for payment testing:

**Successful Payment**:
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment**:
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Test Webhook Locally** (requires ngrok or similar):

```bash
# Install ngrok
brew install ngrok

# Expose local backend
ngrok http 3000

# Copy ngrok URL and configure in Razorpay dashboard
# Webhook URL: https://your-ngrok-url.ngrok.io/api/webhooks/razorpay
```

## Key Development Files

### Backend Files to Implement

```
apps/whatsnxt-bff/src/
├── models/
│   ├── LabPricing.ts           # START HERE: Mongoose schema
│   ├── LabPurchase.ts          # Mongoose schema for purchases
│   └── Transaction.ts          # Mongoose schema for audit
├── services/
│   ├── labPricingService.ts    # Business logic for pricing
│   ├── purchaseService.ts      # Purchase processing logic
│   ├── accessControlService.ts # Access validation logic
│   └── paymentGatewayService.ts # Razorpay integration
├── routes/
│   ├── labPricing.ts           # Pricing endpoints
│   ├── labPurchase.ts          # Purchase endpoints
│   └── paymentCallback.ts      # Webhook handler
└── middleware/
    └── accessControl.ts        # Lab access middleware
```

### Frontend Files to Implement

```
apps/web/src/
├── components/lab/
│   ├── LabPricingForm.tsx      # START HERE: Instructor pricing UI
│   ├── LabPurchaseButton.tsx   # Student purchase button
│   └── LabAccessButton.tsx     # Access control UI
├── services/
│   ├── labPricingService.ts    # API client for pricing
│   └── paymentService.ts       # Razorpay client integration
└── pages/labs/
    └── [id].tsx                # Lab detail page (extend existing)
```

### Shared Types

```
packages/core-types/src/
├── LabPricing.ts               # Shared pricing types
├── Purchase.ts                 # Shared purchase types
└── Transaction.ts              # Shared transaction types
```

## Testing Checklist

### Phase 0: Setup ✅
- [x] MongoDB running and accessible
- [x] Redis running (if using cache)
- [x] Razorpay test credentials configured
- [x] Dependencies installed
- [x] Test data seeded

### Phase 1: Backend Tests (Write First)
- [ ] `labPricingService.test.ts` - Pricing CRUD operations
- [ ] `purchaseService.test.ts` - Purchase flow logic
- [ ] `accessControlService.test.ts` - Access validation
- [ ] `paymentGatewayService.test.ts` - Razorpay integration

### Phase 2: Backend Implementation
- [ ] Lab model with pricing schema
- [ ] LabPurchase model
- [ ] Transaction model
- [ ] Pricing service implementation
- [ ] Purchase service implementation
- [ ] Access control service implementation
- [ ] Payment gateway integration

### Phase 3: API Integration Tests
- [ ] POST /labs/:id/pricing (create/update pricing)
- [ ] GET /labs/:id/pricing (fetch pricing)
- [ ] POST /labs/:id/purchase/initiate (create order)
- [ ] POST /labs/:id/purchase/verify (verify payment)
- [ ] GET /labs/:id/access (check access)
- [ ] POST /webhooks/razorpay (webhook handler)

### Phase 4: Frontend Tests (Write First)
- [ ] `LabPricingForm.test.tsx` - Instructor pricing UI
- [ ] `LabPurchaseButton.test.tsx` - Purchase button logic
- [ ] `LabAccessButton.test.tsx` - Access button logic

### Phase 5: Frontend Implementation
- [ ] LabPricingForm component
- [ ] LabPurchaseButton component
- [ ] LabAccessButton component
- [ ] API service clients
- [ ] Razorpay modal integration

### Phase 6: E2E Testing
- [ ] Instructor creates free lab
- [ ] Instructor creates paid lab
- [ ] Student views free lab (immediate access)
- [ ] Student purchases paid lab (full flow)
- [ ] Student views purchased lab (access granted)
- [ ] Instructor updates price (validation)
- [ ] Course enrollment grants lab access

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community@7.0

# Check logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Razorpay Integration Issues

```bash
# Verify test credentials
curl https://api.razorpay.com/v1/payments \
  -u rzp_test_your_key_id:your_secret_key

# Check webhook signature verification
# Ensure RAZORPAY_WEBHOOK_SECRET matches Razorpay dashboard
```

### Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port 3000
kill -9 <PID>
```

### Cache Issues

```bash
# Clear Redis cache
redis-cli FLUSHALL

# Clear Next.js cache
cd apps/web
rm -rf .next
pnpm dev
```

## Next Steps

1. **Review Spec**: Read `spec.md` for feature requirements
2. **Review Plan**: Read `plan.md` for implementation structure
3. **Review Research**: Read `research.md` for technical decisions
4. **Review Data Model**: Read `data-model.md` for schema details
5. **Review API Contract**: Open `contracts/api-spec.yaml` in Swagger Editor
6. **Verify Implementation**: All tasks in `tasks.md` are complete ✅

## Implementation Status

### ✅ Completed Features

All phases of the Lab Monetization System have been implemented:

- **Phase 1: Setup** - Database collections, environment configuration, shared types
- **Phase 2: Foundational** - Core models, services, and access control
- **Phase 3: User Story 1** - Free lab pricing and access (MVP)
- **Phase 4: User Story 2** - Paid lab pricing with validation
- **Phase 5: User Story 3** - Student purchase flow with Razorpay integration
- **Phase 6: User Story 4** - Course enrollment grants lab access
- **Phase 7: User Story 5** - Instructor pricing updates with constraints
- **Phase 8: Polish** - Caching, error handling, loading states

### Frontend Integration

The following UI components are integrated:

- **LabPricingForm**: Used in lab creation and edit flows
- **LabAccessButton**: Shows access status and options on lab detail page
- **LabPurchaseButton**: Handles Razorpay payment modal and verification

### Backend API

All endpoints are implemented and documented:

- `PUT /labs/:labId/pricing` - Set/update pricing
- `GET /labs/:labId/pricing` - Get pricing info
- `POST /labs/:labId/purchase/initiate` - Create Razorpay order
- `POST /labs/:labId/purchase/verify` - Verify payment
- `GET /labs/:labId/access` - Check access status
- `POST /webhooks/razorpay` - Payment webhook handler

See full API documentation in `apps/whatsnxt-bff/README.md`

## Useful Commands

```bash
# Monorepo-level commands (from root)
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
pnpm clean                  # Clean all build artifacts

# Backend-specific commands
cd apps/whatsnxt-bff
pnpm dev                    # Start backend with hot reload
pnpm test                   # Run backend tests
pnpm test:watch             # Run tests in watch mode
pnpm lint                   # Lint backend code

# Frontend-specific commands
cd apps/web
pnpm dev                    # Start Next.js with Turbopack
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm test                   # Run frontend tests

# Database commands
mongosh                     # Connect to MongoDB
redis-cli                   # Connect to Redis
```

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Mantine UI Components](https://mantine.dev/)
- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Jest Testing Framework](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Ready to Start Development** 🚀  
Follow the TDD approach: Write tests → Get user approval → Tests fail → Implement → Tests pass
