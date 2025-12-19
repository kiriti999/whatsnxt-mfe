## Running the app

````bash
# Running the app
$ npm run local # run app in local window/linux os
$ npm run mac # run app in local mac os
$ npm run prod # run app in prod

## Deploying the app to aws

```bash
# run command in root folder
$ docker compose up

# push image to ecr and run terraform to deploy
$ sh deploy.sh

#ts-migration {file_name} e.g (user)
$ npx migrate up {file_name}
$ npx migrate down {file_name}
# when you want to create new migration
$ npx migrate create {file_name}

# env parameter
### Pass required params in .env or .env.local
### example:
````

MIGRATE_MONGO_URI=mongodb://localhost/<db-name-here>
MIGRATE_MONGO_COLLECTION=migrations
MIGRATE_MIGRATIONS_PATH=.//app/database/migrations
MIGRATE_AUTOSYNC=true

$ npx migrate down base-insert-column-template
$ npx migrate up base-insert-column-template

$ npx migrate up base-update-column-template
$ npx migrate down base-update-column-template

$ npx migrate up base-remove-column-template
$ npx migrate down base-remove-column-template

npx migrate up base-insert-record-template
npx migrate down base-insert-record-template

npx migrate up base-update-record-template
npx migrate down base-update-record-template

npx migrate up base-remove-record-template
npx migrate down base-remove-record-template

```

# Swgger docs at the following path:
Assuming you running your app on port 4444
Open http://localhost:4444/api-docs to see Swagger UI for your REST API.
OpenApi2 (default): http://localhost:4444/api-docs/v2
OpenApi3: http://localhost:4444/api-docs/v3
Specification file is available http://localhost:4444/api-spec. Link is prepended to description field.
OpenApi2 (default): http://localhost:4444/api-spec/v2
OpenApi3: http://localhost:4444/api-spec/v3


## Deployment setup
1. Install terraform cli and run `terraform init` inside terraform folder
2. Install aws cli
3. Create aws profile with credentials using `aws configure`
4. Install JQ to run inside deployment bash scripts using `sudo apt update && sudo apt install jq -y`
5. Run `npm run deploy`

## Node version changes
1. Update the package.json with engine
2. Dockerfile base must be updated with relevant node-alpine image
3. Push the dockerfile.base file into dockerhub

# To inspect redis data, install redis-commander as global npm package
# set port 8081 or custom port on npm script command in package.json, for example: REDIS_COMMANDER_PORT=8081 and run the following command to start redis commander on localhost, run the command:
$ redis-commander

# To check the redis on prod, open the prod ec2 public IP with redis commander port
example: http://<ec2-ip>:8081/

## Course builder steps and its function names:
| Stage                   | Function Name            | Allowed Course Status                     |
|-------------------------|--------------------------|-------------------------------------------|
| **Course Creation**     |                          |                                           |
| Create Course Name      | `createCourseName`       | draft                                     |
| **Course Type**         |                          |                                           |
| Update Course Type      | `updateCourseType`       | draft/pending_review/approved/published   |
| **Pricing**             |                          |                                           |
| Update Pricing          | `updatePricing`          | draft/pending_review/approved/published   |
| **Curriculum**          |                          |                                           |
| Update Course Name      | `updateCourseName`       | draft/pending_review/approved/published   |
| Update Section Title    | `updateSectionOrVideoTitle` | -                                     |
| Update Lecture Title    | `updateSectionOrVideoTitle` | -                                     |
| Upload Lecture Video    | `addVideoToLecture`      | -                                         |
| Upload Lecture Document | `addDocToLecture`        | -                                         |
| Update Course Details   | `updateCourseLandingPageDetails`    | draft/pending_review/approved/published   |
| - Course Overview       | "                        | "                                         |
| - Description           | "                        | "                                         |
| - Image                 | "                        | "                                         |
| - Language              | "                        | "                                         |
| - Category              | "                        | "                                         |
| Add Interview Question  | `createQuestionAnswer`   | -                                         |
| **Final Step**          |                          |                                           |
| Submit for Review       | -                        | → pending_review                          |

Intermediary data api's:
getCourseById
```

## Lab Monetization API Endpoints

### Lab Pricing Endpoints

#### Set/Update Lab Pricing
```http
PUT /labs/:labId/pricing
```

**Description**: Set or update pricing configuration for a lab. Instructors can set labs as free or paid.

**Authentication**: Required (Instructor only)

**Request Body**:
```json
{
  "purchaseType": "free" | "paid",
  "price": 500  // Required if purchaseType is "paid", range: ₹10-₹100,000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "labId": "64a1b2c3d4e5f6...",
    "pricing": {
      "purchaseType": "paid",
      "price": 500,
      "currency": "INR",
      "updatedAt": "2025-12-18T12:00:00Z"
    }
  }
}
```

**Validation Rules**:
- Cannot change paid to free if purchases exist
- Price must be between ₹10 and ₹100,000
- Free-to-paid conversion grandfathers existing free accessors

---

#### Get Lab Pricing
```http
GET /labs/:labId/pricing
```

**Description**: Retrieve pricing configuration for a specific lab.

**Authentication**: Optional (public data)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "purchaseType": "paid",
    "price": 500,
    "currency": "INR"
  }
}
```

---

### Lab Purchase Endpoints

#### Initiate Purchase
```http
POST /labs/:labId/purchase/initiate
```

**Description**: Create Razorpay order for lab purchase. Returns order details to open payment modal.

**Authentication**: Required (Student only)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxxx",
    "amount": 500,
    "currency": "INR",
    "key": "rzp_test_xxxxx",
    "labTitle": "AWS Architecture Lab"
  }
}
```

**Error** (400 Bad Request):
```json
{
  "success": false,
  "message": "You have already purchased this lab"
}
```

---

#### Verify Purchase
```http
POST /labs/:labId/purchase/verify
```

**Description**: Verify Razorpay payment signature and create purchase record to grant access.

**Authentication**: Required (Student only)

**Request Body**:
```json
{
  "razorpayOrderId": "order_xxxxx",
  "razorpayPaymentId": "pay_xxxxx",
  "razorpaySignature": "signature_hash"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "purchaseId": "64a1b2c3d4e5f6...",
    "labId": "64a1b2c3d4e5f6...",
    "amountPaid": 500,
    "hasAccess": true
  }
}
```

**Error** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

---

#### Check Lab Access
```http
GET /labs/:labId/access
```

**Description**: Check if student has access to a lab (via purchase, course enrollment, or free access).

**Authentication**: Required (Student only)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "hasAccess": true,
    "reason": "purchased" | "course_enrollment" | "free"
  }
}
```

---

### Payment Webhook

#### Razorpay Webhook Handler
```http
POST /webhooks/razorpay
```

**Description**: Handles payment notifications from Razorpay. Verifies signature and updates transaction status.

**Authentication**: Webhook signature verification

**Request Headers**:
```
X-Razorpay-Signature: webhook_signature_hash
```

**Request Body**: Razorpay event payload (varies by event type)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Features**:
- Idempotent transaction handling
- Signature verification for security
- Audit trail creation
- Handles payment.captured, payment.failed events

---

### Access Control

All lab monetization endpoints enforce:
- **Authentication**: JWT token required
- **Authorization**: Role-based access (instructor/student)
- **Rate Limiting**: Prevents abuse
- **Caching**: Access checks cached for 5 minutes (Redis)

### Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Lab or resource doesn't exist |
| 409 | Conflict - Already purchased or pricing constraint |
| 500 | Internal Server Error - Server-side failure |

---

For complete API documentation with interactive testing, see:
- Swagger UI: http://localhost:4444/api-docs
- OpenAPI Spec: http://localhost:4444/api-spec/v3
```
