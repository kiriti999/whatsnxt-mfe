# Feature Specification: Lab Monetization System

**Feature Branch**: `001-lab-monetization`  
**Created**: 2025-12-16  
**Status**: Draft  
**Input**: User description: "Lab can be sold by instructor separately or as part of a course. Instructors need options to set pricing (paid/free) when creating labs. Students should see purchase buttons with prices and be able to buy labs using the existing Razorpay payment gateway."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instructor Sets Free Lab Pricing (Priority: P1)

An instructor creates a new lab and designates it as free to access. This allows students to immediately access the lab content without any payment barrier, enabling the instructor to share educational content widely.

**Why this priority**: This is the foundational capability that establishes the pricing model framework. It delivers immediate value by allowing instructors to publish free content and must work before paid labs can be introduced. This represents the minimum viable monetization feature.

**Independent Test**: Can be fully tested by creating a lab with "Free" pricing option selected, publishing it, and verifying students can access it without purchase prompts. Delivers value by allowing free educational content distribution.

**Acceptance Scenarios**:

1. **Given** an instructor is creating a new lab, **When** they reach the pricing configuration step, **Then** they must see "Free" and "Paid" options with "Free" as a valid selection
2. **Given** an instructor selects "Free" as the purchase type, **When** they save and publish the lab, **Then** the lab is saved with free access and no price field is required
3. **Given** a student views a free lab, **When** they access the lab details page, **Then** they see an "Access Lab" or "Start Lab" button with no pricing information displayed
4. **Given** a student clicks "Access Lab" on a free lab, **When** the action completes, **Then** they are granted immediate access to the lab content without any payment flow

---

### User Story 2 - Instructor Sets Paid Lab Pricing (Priority: P2)

An instructor creates a lab and sets it as a paid offering by specifying a price. This enables instructors to monetize their content and creates a revenue stream from individual lab sales.

**Why this priority**: This builds on the free lab foundation (P1) by adding monetization capability. While not needed for basic lab distribution, it's critical for instructor revenue generation and must precede the student purchase flow.

**Independent Test**: Can be tested by creating a lab with "Paid" option, entering a valid price, and verifying the lab is saved with correct pricing metadata. Delivers value by enabling instructors to set up paid content offerings.

**Acceptance Scenarios**:

1. **Given** an instructor is creating a lab, **When** they select "Paid" as the purchase type, **Then** a price input field appears and becomes mandatory
2. **Given** an instructor enters a price, **When** the price is below the minimum allowed amount (₹10), **Then** validation feedback indicates the minimum price requirement
3. **Given** an instructor enters a price above ₹100,000, **When** they attempt to save, **Then** validation feedback indicates the maximum price limit
4. **Given** an instructor has filled all required fields including valid price, **When** they save the lab, **Then** the lab is saved with purchase type "Paid" and the specified price
5. **Given** an instructor tries to save a paid lab without entering a price, **When** they submit, **Then** validation prevents saving and highlights the missing price field

---

### User Story 3 - Student Purchases a Paid Lab (Priority: P3)

A student discovers a paid lab, views its price, initiates a purchase through the payment gateway, and gains access upon successful payment. This completes the monetization cycle by enabling actual transactions.

**Why this priority**: This depends on both P1 (pricing framework) and P2 (paid lab setup) being complete. It's the culminating feature that enables actual revenue flow but cannot function without the prerequisite pricing infrastructure.

**Independent Test**: Can be tested by having a student view a paid lab they haven't purchased, clicking the purchase button, completing payment, and verifying access is granted. Delivers value by enabling lab sales and student access to paid content.

**Acceptance Scenarios**:

1. **Given** a student views a paid lab they have not purchased, **When** they see the lab details, **Then** they see a "Purchase for ₹{price}" button instead of "Access Lab"
2. **Given** a student clicks "Purchase for ₹{price}", **When** the action is processed, **Then** the payment gateway (Razorpay) modal opens with the correct lab price
3. **Given** a student completes payment successfully, **When** the payment callback is received, **Then** a purchase record is created linking the student to the lab with transaction details
4. **Given** a student's payment succeeds, **When** they return to the lab page, **Then** they now see "Access Lab" button and can enter the lab content
5. **Given** a student's payment fails or is cancelled, **When** they return to the lab page, **Then** they still see the "Purchase for ₹{price}" button and can retry the purchase
6. **Given** a student has already purchased a paid lab, **When** they view the lab details, **Then** they see "Access Lab" button (same as free labs) without pricing information

---

### User Story 4 - Course Enrollment Grants Lab Access (Priority: P4)

When a student enrolls in a course that includes one or more labs (free or paid), they automatically receive access to all included labs without requiring separate lab purchases. This provides a seamless bundled experience.

**Why this priority**: This is an integration feature that depends on existing course enrollment functionality and the access control system from P1-P3. While valuable for bundling, it's not essential for standalone lab monetization.

**Independent Test**: Can be tested by enrolling a student in a course containing paid labs and verifying they can access those labs without separate purchase prompts. Delivers value by enabling course-based bundling and improving user experience.

**Acceptance Scenarios**:

1. **Given** a course includes one or more labs (paid or free), **When** a student enrolls in that course, **Then** access is automatically granted to all included labs without separate purchase requirements
2. **Given** a student is enrolled in a course with included labs, **When** they view any included lab, **Then** they see "Access Lab" button regardless of the lab's standalone pricing
3. **Given** a lab is both sold standalone and included in courses, **When** a student accesses it via course enrollment, **Then** no separate purchase record is created for the standalone lab

---

### User Story 5 - Instructor Updates Lab Pricing (Priority: P5)

An instructor can update the price of an existing paid lab. Existing student purchases remain valid at their original price, while new purchases use the updated price. Instructors cannot change a paid lab to free if students have already purchased it.

**Why this priority**: This is a management feature that enhances flexibility but is not required for initial launch. It depends on the core monetization features (P1-P3) being operational.

**Independent Test**: Can be tested by updating a lab's price, verifying new purchase attempts use the new price, and confirming existing purchasers retain access. Delivers value by allowing instructors to adjust pricing strategies.

**Acceptance Scenarios**:

1. **Given** an instructor views an existing paid lab, **When** they update the price to a new valid amount, **Then** the price is updated and new purchases use the updated price
2. **Given** students have already purchased a lab at a previous price, **When** the instructor updates the price, **Then** existing purchasers retain access and their purchase records show the original price paid
3. **Given** students have purchased a paid lab, **When** an instructor attempts to change it to free, **Then** validation prevents the change and indicates the constraint
4. **Given** a lab is currently free with student access, **When** an instructor changes it to paid, **Then** existing students who accessed it as free retain access without payment requirement

---

### Edge Cases

- What happens when a student attempts to purchase a lab they've already purchased? (Should show "Access Lab" instead of purchase button)
- How does the system handle payment gateway timeout or network failure during purchase? (Display user-friendly error message, allow retry)
- What if a student is mid-payment when the lab price is updated? (Complete payment at the price displayed when initiated)
- What happens if an instructor deletes or unpublishes a lab that students have purchased? (Students retain access to purchased content)
- How does the system handle refund requests? (Requires transaction record lookup and manual refund processing workflow)
- What if course enrollment is revoked - does lab access granted via course also revoke? (Lab access should follow course enrollment status)
- What happens when the payment succeeds but the callback fails to update purchase records? (System uses transaction ID as idempotency key to prevent duplicate processing; manual reconciliation process available for failed callbacks)
- How are tax calculations handled for lab pricing? (Assumes prices are inclusive of taxes, or requires clarification on tax jurisdiction)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require instructors to select a purchase type (Free or Paid) when creating a lab, with no default value
- **FR-002**: System MUST display a price input field when "Paid" purchase type is selected, and this field MUST be mandatory
- **FR-003**: System MUST validate that paid lab prices are within acceptable range (minimum ₹10, maximum ₹100,000)
- **FR-004**: System MUST store purchase type and price information for each lab
- **FR-005**: System MUST display "Access Lab" button for free labs without any pricing information
- **FR-006**: System MUST display "Purchase for ₹{price}" button for paid labs that the student has not purchased and is not enrolled in via a course
- **FR-007**: System MUST display "Access Lab" button for paid labs that the student has either purchased or has access to via course enrollment
- **FR-008**: System MUST integrate with the existing Razorpay payment gateway to process lab purchases
- **FR-009**: System MUST create a purchase record containing student ID, lab ID, purchase timestamp, transaction ID, and amount paid when payment succeeds
- **FR-010**: System MUST grant lab access to students who have purchased the lab or are enrolled in a course containing the lab
- **FR-011**: System MUST prevent lab access for paid labs when the student has neither purchased the lab nor enrolled in a course containing it
- **FR-012**: System MUST maintain transaction records for all purchase attempts (successful and failed)
- **FR-013**: System MUST allow instructors to update prices for paid labs
- **FR-014**: System MUST preserve original purchase price in existing purchase records when lab price is updated
- **FR-015**: System MUST prevent instructors from changing a paid lab to free if any students have purchased it
- **FR-016**: System MUST allow instructors to change a free lab to paid, while grandfathering existing students who accessed it as free
- **FR-017**: System MUST handle payment gateway callbacks to update purchase status and grant access, using transaction ID as idempotency key to prevent duplicate processing
- **FR-018**: System MUST display appropriate error messages when payment fails and allow students to retry purchase
- **FR-019**: System MUST support currency display in Indian Rupees (₹) for pricing

### Key Entities

- **Lab Purchase Configuration**: Represents the monetization settings for a lab, including purchase type (free or paid) and price amount if paid. Links to a specific lab and determines its access requirements.

- **Lab Purchase Record**: Represents a completed student purchase of a lab, including student identifier, lab identifier, purchase timestamp, transaction identifier from payment gateway, amount paid, and payment status. Used for access control and transaction tracking.

- **Course-Lab Relationship**: Represents the inclusion of labs within courses. When this relationship exists, enrolled students gain automatic access to included labs without separate purchase requirements.

- **Transaction Record**: Represents all payment attempts (successful, failed, or cancelled), including timestamp, student identifier, lab identifier, amount, status, and gateway response details. Used for reconciliation, refunds, and dispute resolution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Instructors can create and publish a lab with pricing configuration (free or paid) in under 5 minutes
- **SC-002**: 100% of paid labs have valid price values stored and displayed to students
- **SC-003**: Students can complete lab purchase from viewing lab details to gaining access in under 3 minutes (assuming successful payment)
- **SC-004**: Payment success rate matches existing Razorpay integration baseline (95%+ successful callbacks processed correctly)
- **SC-005**: Zero unauthorized access to paid labs by students who have neither purchased nor enrolled in courses containing those labs
- **SC-006**: 100% of successful purchase transactions are recorded with complete transaction details (student, lab, price, transaction ID, timestamp)
- **SC-007**: Students enrolled in courses can access included labs without encountering purchase prompts (100% seamless access)
- **SC-008**: Price update operations complete within 2 seconds and are reflected in new purchase attempts immediately
- **SC-009**: Instructors attempting invalid operations (e.g., paid-to-free conversion with existing purchases) receive clear validation feedback within 1 second

## Clarifications

### Session 2025-12-18

- Q: How should the system handle duplicate payment callbacks from Razorpay (e.g., retries or network issues)? → A: Use transaction ID as idempotency key - ignore duplicate callbacks with same transaction ID

## Assumptions

- The platform already has a functioning Razorpay payment gateway integration for course purchases that can be reused for lab purchases
- Currency is Indian Rupees (₹) based on Razorpay usage; no multi-currency support required initially
- Pricing is assumed to be inclusive of all taxes (no separate tax calculation required)
- Students have user accounts and authentication is handled by existing system
- Course enrollment system exists and can be queried to determine if a student has access to a course
- Instructors have appropriate permissions to create and manage labs they own
- Minimum viable price is set at ₹10 to align with payment gateway minimums and prevent nominal pricing issues
- Maximum price of ₹100,000 represents a reasonable upper bound for educational lab content
- Refund processing is handled manually outside this feature scope (requires separate admin workflow)
- Revenue sharing and platform commission rules are defined outside this specification
- Transaction records are retained indefinitely for financial compliance (no automatic deletion)
