# Diagram Test Nesting Validation - Enhanced Grading

## Overview
Enhanced the diagram test validation to check not only arrow/link connections but also the **correct nesting order of shapes**. Students must now place shapes inside the correct containers (VPC, Namespace, Zones, etc.) to pass the test.

---

## What Changed

### Before ❌
```typescript
// Only validated link connections
const score = (correctLinks / totalLinks) * 100;
return { score, passed, details: `${correctLinks}/${totalLinks} correct connections` };
```

**Problem**: 
- Students could pass by just connecting arrows correctly
- Shape placement inside containers wasn't validated
- VPC/Namespace/Zone organization was ignored

### After ✅
```typescript
// Validates BOTH links AND nesting
const linkScore = (correctLinks / totalLinks) * 100;
const nestingScore = (correctNesting / totalNesting) * 100;
const overallScore = (linkScore + nestingScore) / 2;

return {
    score: overallScore,
    linkScore,
    nestingScore,
    details: `Links: ${correctLinks}/${totalLinks}, Nesting: ${correctNesting}/${totalNesting}`
};
```

**Benefits**:
- ✅ Validates link connections (arrows)
- ✅ Validates nesting order (shape placement in containers)
- ✅ Weighted scoring (50% links + 50% nesting)
- ✅ Detailed feedback for students

---

## How Nesting Validation Works

### 1. Identify Container Shapes
Container types that can hold other shapes:
- `group` - Generic group/container
- `zone` - Zone/Subnet
- `vpc` - AWS VPC / Virtual Network
- `namespace` - Kubernetes Namespace
- `node` - Kubernetes Node
- `virtualnetwork` - Azure Virtual Network

### 2. Build Nesting Relationships
```typescript
// Master diagram (instructor's correct answer)
VPC_1 contains: [EC2_1, RDS_1, ELB_1]
Namespace_1 contains: [Pod_1, Pod_2, Service_1]

// Student diagram
VPC_1 contains: [EC2_1, RDS_1]  // Missing ELB_1 ❌
Namespace_1 contains: [Pod_1, Pod_2, Service_1]  // Correct ✅
```

### 3. Position-Based Detection
Shapes are considered "inside" a container if their bounding box is within the container's bounds:

```typescript
const isInside = (
    shape.x >= container.x &&
    shape.y >= container.y &&
    (shape.x + shape.width) <= (container.x + container.width) &&
    (shape.y + shape.height) <= (container.y + container.height)
);
```

### 4. Scoring
- Each correct nesting = 1 point
- Total nesting relationships = total possible points
- Nesting score = (correct / total) × 100%

---

## Validation Algorithm

### Step 1: Extract Nodes and Links
```typescript
const masterNodes = masterJson.nodes || [];
const studentNodes = studentJson.nodes || [];
const masterLinks = masterJson.links || [];
const studentLinks = studentJson.links || [];
```

### Step 2: Validate Links (Part 1)
```typescript
// Build set of expected connections
const expectedConnections = new Set(['EC2-1 → RDS-1', 'ELB-1 → EC2-1']);

// Check student connections
let correctLinks = 0;
studentLinks.forEach(link => {
    if (expectedConnections.has(link)) correctLinks++;
});

const linkScore = (correctLinks / totalLinks) * 100;
```

### Step 3: Validate Nesting (Part 2)
```typescript
// Build nesting maps
const masterNesting = {
    'EC2-1': 'VPC-1',
    'RDS-1': 'VPC-1',
    'Pod-1': 'Namespace-1'
};

const studentNesting = {
    'EC2-1': 'VPC-1',  // Correct ✅
    'RDS-1': 'Zone-2', // Wrong container ❌
    'Pod-1': 'Namespace-1'  // Correct ✅
};

let correctNesting = 0;
for (const [shapeId, containerId] of masterNesting) {
    if (studentNesting[shapeId] === containerId) {
        correctNesting++;
    }
}

const nestingScore = (correctNesting / totalNesting) * 100;
```

### Step 4: Calculate Overall Score
```typescript
// Case 1: Both links and nesting exist
if (totalLinks > 0 && totalNesting > 0) {
    overallScore = (linkScore + nestingScore) / 2;
    details = `Links: ${correctLinks}/${totalLinks}, Nesting: ${correctNesting}/${totalNesting}`;
}

// Case 2: Only links (no containers)
else if (totalLinks > 0) {
    overallScore = linkScore;
    details = `Links: ${correctLinks}/${totalLinks} correct`;
}

// Case 3: Only nesting (no connections)
else {
    overallScore = nestingScore;
    details = `Nesting: ${correctNesting}/${totalNesting} correct`;
}
```

---

## Example Scenarios

### Scenario 1: AWS VPC Architecture

**Instructor's Diagram**:
```
VPC (vpc-main)
├── EC2 Instance
├── RDS Database  
└── ELB Load Balancer

Connections:
- Internet → ELB
- ELB → EC2
- EC2 → RDS
```

**Student Must**:
1. ✅ Place EC2, RDS, and ELB **inside VPC**
2. ✅ Connect arrows correctly

**Scoring**:
- Links: 3/3 correct = 100%
- Nesting: 3/3 shapes in correct container = 100%
- **Overall: (100 + 100) / 2 = 100% ✅ PASS**

**Common Mistake**:
- Student places ELB outside VPC
- Links: 3/3 = 100%
- Nesting: 2/3 = 67%
- **Overall: (100 + 67) / 2 = 83.5% ❌ FAIL**

---

### Scenario 2: Kubernetes Namespace

**Instructor's Diagram**:
```
Namespace (production)
├── Pod (app-1)
├── Pod (app-2)
├── Service (app-svc)
└── ConfigMap (config)

Connections:
- Service → Pod-1
- Service → Pod-2
```

**Student Must**:
1. ✅ Place all resources **inside Namespace**
2. ✅ Connect Service to both Pods

**Scoring**:
- Links: 2/2 = 100%
- Nesting: 4/4 = 100%
- **Overall: 100% ✅ PASS**

**Common Mistake**:
- Student places ConfigMap outside Namespace
- Links: 2/2 = 100%
- Nesting: 3/4 = 75%
- **Overall: (100 + 75) / 2 = 87.5% ❌ FAIL**

---

### Scenario 3: Multi-Zone Architecture

**Instructor's Diagram**:
```
VPC
├── Zone-1 (Public Subnet)
│   ├── ELB
│   └── NAT Gateway
└── Zone-2 (Private Subnet)
    ├── EC2
    └── RDS

Connections:
- Internet → ELB
- ELB → NAT
- NAT → EC2
- EC2 → RDS
```

**Student Must**:
1. ✅ Place Zone-1 and Zone-2 **inside VPC**
2. ✅ Place ELB and NAT **inside Zone-1**
3. ✅ Place EC2 and RDS **inside Zone-2**
4. ✅ Connect arrows correctly

**Scoring**:
- Links: 4/4 = 100%
- Nesting: 6/6 = 100% (2 zones + 4 services)
- **Overall: 100% ✅ PASS**

---

## Detailed Feedback

Students now receive detailed feedback on what they got right/wrong:

### Example 1: Perfect Score
```
✅ Test Passed!
Your score: 100%
Links: 5/5 correct connections
Nesting: 3/3 shapes in correct containers
```

### Example 2: Partial Score - Wrong Nesting
```
⚠️ Test Completed
Your score: 75%
Links: 5/5 correct connections (100%)
Nesting: 2/3 shapes in correct containers (67%)

Hint: Check which shapes should be inside containers
```

### Example 3: Partial Score - Wrong Links
```
⚠️ Test Completed
Your score: 87%
Links: 4/5 correct connections (80%)
Nesting: 3/3 shapes in correct containers (100%)

Hint: Review your arrow connections
```

### Example 4: Low Score
```
❌ Test Failed
Your score: 50%
Links: 3/5 correct connections (60%)
Nesting: 1/3 shapes in correct containers (33%)

Please review the architecture diagram carefully
```

---

## Return Value Structure

```typescript
interface ValidationResult {
    // Overall metrics
    score: number;           // 0-100 (weighted average)
    passed: boolean;         // true if score === 100
    details: string;         // Human-readable summary
    
    // Link validation
    linkScore: number;       // 0-100
    correctLinks: number;    // Count
    totalLinks: number;      // Count
    
    // Nesting validation
    nestingScore: number;    // 0-100
    correctNesting: number;  // Count
    totalNesting: number;    // Count
}
```

**Example**:
```typescript
{
    score: 87,
    passed: false,
    details: "Links: 4/5, Nesting: 5/5",
    linkScore: 80,
    correctLinks: 4,
    totalLinks: 5,
    nestingScore: 100,
    correctNesting: 5,
    totalNesting: 5
}
```

---

## Edge Cases Handled

### 1. Diagrams Without Containers
If instructor doesn't use containers (VPC, Namespace, etc.):
- Only link validation is performed
- Nesting score = N/A
- Overall score = link score

### 2. Diagrams Without Links
If instructor creates a diagram with only shape placement:
- Only nesting validation is performed
- Link score = N/A
- Overall score = nesting score

### 3. Nested Containers
Handles containers inside containers:
```
VPC
└── Zone
    └── EC2
```
- Smallest containing shape is used
- Proper hierarchy is validated

### 4. Overlapping Containers
If two containers overlap:
- Smallest container takes precedence
- Most specific nesting is validated

### 5. Tolerance
5-pixel tolerance for boundaries:
- Shapes slightly outside containers (< 5px) are still considered "inside"
- Accounts for minor positioning differences

---

## File Modified

**File**: `apps/web/utils/lab-utils.ts`

### Functions Added
```typescript
// Check if shape is inside container based on position
const isShapeInsideContainer(shape, container, tolerance = 5): boolean

// Build nesting relationships for all shapes
const buildNestingMap(nodes): Map<string, string>
```

### Function Enhanced
```typescript
// Enhanced with nesting validation
export const validateGraph(masterJson, studentJson): ValidationResult
```

---

## Testing Instructions

### Test 1: AWS VPC with Correct Nesting
```
1. Create lab with AWS architecture
2. Add Diagram Test
3. Draw: VPC → place EC2 and RDS inside
4. Connect: EC2 → RDS
5. Save and publish
6. As student: Solve correctly
7. Submit
8. Expected: 100% score
```

### Test 2: Wrong Nesting
```
1. Same setup as Test 1
2. As student: Place EC2 outside VPC
3. Connect: EC2 → RDS correctly
4. Submit
5. Expected: ~83% score (Links: 100%, Nesting: 67%)
```

### Test 3: Kubernetes Namespace
```
1. Create lab with Kubernetes architecture
2. Add Diagram Test
3. Draw: Namespace → place Pod, Service, ConfigMap inside
4. Connect: Service → Pod
5. Save and publish
6. As student: Place ConfigMap outside Namespace
7. Submit
8. Expected: ~87% score (Links: 100%, Nesting: 67%)
```

### Test 4: Only Links (No Containers)
```
1. Create simple diagram: Server → Database
2. No containers used
3. Student connects correctly
4. Expected: 100% score (only link validation)
```

---

## Benefits

### For Instructors
- ✅ Test deeper understanding of architecture
- ✅ Validate proper resource organization
- ✅ Enforce best practices (VPC design, namespaces)
- ✅ More comprehensive assessment

### For Students
- ✅ Learn proper shape placement
- ✅ Understand container hierarchies
- ✅ Practice real-world architecture patterns
- ✅ Get detailed feedback on mistakes

### For Platform
- ✅ More accurate grading
- ✅ Better learning outcomes
- ✅ Industry-aligned assessments
- ✅ Reduced false positives

---

## Common Architecture Patterns

### AWS Patterns
1. **VPC Organization**: EC2, RDS, Lambda inside VPC
2. **Multi-Zone**: Public/Private subnets in different zones
3. **Security Groups**: Resources grouped by function

### Kubernetes Patterns
1. **Namespace Isolation**: Pods, Services in namespace
2. **Node Distribution**: Pods distributed across nodes
3. **Storage**: PersistentVolumes attached to specific pods

### Azure Patterns
1. **Virtual Network**: VMs, databases in VNet
2. **Resource Groups**: Related resources grouped
3. **Subnets**: Network segmentation

---

## Future Enhancements

### Potential Additions
- Label validation (correct shape names)
- Property validation (correct sizes, colors)
- Port/protocol validation (for network diagrams)
- Security group validation (for cloud diagrams)
- Resource count validation (exact number of instances)

---

**Status**: ✅ Implemented and Ready
**Date**: December 16, 2025
**Version**: 2.0
**Breaking Changes**: None (backward compatible)
**Test Coverage**: Enhanced validation for all diagram tests
