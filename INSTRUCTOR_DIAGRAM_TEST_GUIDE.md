# Instructor Guide: Creating Effective Diagram Tests

## 📚 Table of Contents
1. [Overview](#overview)
2. [How Diagram Tests Work](#how-diagram-tests-work)
3. [The Jumbling System](#the-jumbling-system)
4. [What Students Must Do](#what-students-must-do)
5. [Grading System](#grading-system)
6. [Best Practices](#best-practices)
7. [Example Test Scenarios](#example-test-scenarios)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
9. [Tips for Creating Better Tests](#tips-for-creating-better-tests)

---

## Overview

**Diagram Tests** are interactive assessments where students must reconstruct an architecture diagram by:
1. **Organizing shapes** in the correct nesting order (placing shapes inside correct containers)
2. **Connecting shapes** with arrows to show data/control flow

The system automatically **jumbles** your correct diagram to create the student's starting point, ensuring they must actively solve the problem rather than simply viewing the answer.

---

## How Diagram Tests Work

### Instructor's Workflow
```
1. Create diagram test in lab page editor
2. Draw the CORRECT architecture diagram
   ├── Add container shapes (VPC, Namespace, Zones)
   ├── Place shapes INSIDE containers
   └── Connect shapes with arrows
3. Save and publish the lab
```

### What Happens Behind the Scenes
```
1. System saves your diagram as the "master" (correct answer)
2. System automatically JUMBLES the diagram:
   ├── Randomizes shape positions
   ├── Moves shapes OUT of their containers
   └── Keeps shapes/arrows but scrambles organization
3. Student receives the jumbled diagram
4. Student must reconstruct your original diagram
5. System validates BOTH nesting AND connections
```

### Student's Experience
```
1. Opens diagram test
2. Sees all shapes scattered randomly on canvas
3. Must:
   ├── Drag shapes INTO correct containers
   ├── Draw arrows between correct shapes
   └── Match your exact architecture
4. Submits for grading
5. Receives score based on accuracy
```

---

## The Jumbling System

### 🔀 What Gets Jumbled

The system automatically jumbles your correct diagram to create the student's starting state:

#### 1. **Shape Positions** 🎲
```
YOUR DIAGRAM (Instructor):
┌─────────────────────────────────────┐
│ VPC                                 │
│  ┌────┐    ┌────┐    ┌─────┐      │
│  │EC2 │ →  │RDS │    │ELB  │      │
│  └────┘    └────┘    └─────┘      │
└─────────────────────────────────────┘

JUMBLED FOR STUDENT:
┌─────────────────────────────────────┐
│ VPC (empty)                         │
└─────────────────────────────────────┘

  ┌────┐         ┌─────┐      ┌────┐
  │EC2 │         │ELB  │      │RDS │
  └────┘         └─────┘      └────┘
  (scattered randomly outside VPC)
```

#### 2. **Nesting Order** 🏗️
```
YOUR DIAGRAM:
Namespace
├── Pod-1    ✓ Inside namespace
├── Pod-2    ✓ Inside namespace
└── Service  ✓ Inside namespace

JUMBLED:
Namespace (empty)
Pod-1 (outside)
Pod-2 (outside)
Service (outside)
```

#### 3. **Connection Arrows** 🔗
```
YOUR DIAGRAM:
Internet → ELB → EC2 → RDS

JUMBLED:
Internet (no arrows)
ELB (no arrows)
EC2 (no arrows)
RDS (no arrows)
```

### ✅ What Stays the Same

The following are **NOT** jumbled (students don't need to recreate these):

1. **Shape Types** - EC2 stays as EC2, Pod stays as Pod
2. **Shape Labels** - "Production Server" label remains
3. **Shape Count** - Same number of shapes as your diagram
4. **Container Shapes** - VPC/Namespace containers are present (just empty)

---

## What Students Must Do

To pass your test with 100%, students must **EXACTLY** recreate your diagram:

### ✅ Required Actions

#### 1. Correct Nesting (50% of grade)
```
Student must drag shapes INTO the correct containers:

YOUR REQUIREMENT:
VPC-1 contains: EC2, RDS, ELB

STUDENT MUST DO:
✓ Drag EC2 inside VPC-1
✓ Drag RDS inside VPC-1
✓ Drag ELB inside VPC-1
```

**Validation**: System checks if each shape's position is inside the correct container boundaries.

#### 2. Correct Connections (50% of grade)
```
Student must draw arrows between correct shapes:

YOUR REQUIREMENT:
Internet → ELB
ELB → EC2
EC2 → RDS

STUDENT MUST DO:
✓ Click Internet, click ELB (creates arrow)
✓ Click ELB, click EC2 (creates arrow)
✓ Click EC2, click RDS (creates arrow)
```

**Validation**: System checks if all connections match your diagram exactly.

---

## Grading System

### Weighted Scoring Formula

```typescript
Overall Score = (Link Score + Nesting Score) / 2

where:
  Link Score = (Correct Arrows / Total Required Arrows) × 100
  Nesting Score = (Shapes in Correct Containers / Total Nested Shapes) × 100
```

### Scoring Examples

#### Example 1: Perfect Score ✅
```
Instructor's Diagram:
- VPC contains: [EC2, RDS, ELB]
- Arrows: Internet→ELB, ELB→EC2, EC2→RDS

Student's Solution:
- VPC contains: [EC2, RDS, ELB] ✓
- Arrows: Internet→ELB, ELB→EC2, EC2→RDS ✓

Grading:
- Nesting: 3/3 = 100%
- Links: 3/3 = 100%
- Overall: (100 + 100) / 2 = 100% ✅ PASS
```

#### Example 2: Wrong Nesting ⚠️
```
Instructor's Diagram:
- VPC contains: [EC2, RDS, ELB]
- Arrows: Internet→ELB, ELB→EC2, EC2→RDS

Student's Solution:
- VPC contains: [EC2, RDS] (ELB outside) ❌
- Arrows: Internet→ELB, ELB→EC2, EC2→RDS ✓

Grading:
- Nesting: 2/3 = 67%
- Links: 3/3 = 100%
- Overall: (67 + 100) / 2 = 83.5% ❌ FAIL
```

#### Example 3: Wrong Connections ⚠️
```
Instructor's Diagram:
- VPC contains: [EC2, RDS, ELB]
- Arrows: Internet→ELB, ELB→EC2, EC2→RDS

Student's Solution:
- VPC contains: [EC2, RDS, ELB] ✓
- Arrows: Internet→ELB, ELB→EC2 (missing EC2→RDS) ❌

Grading:
- Nesting: 3/3 = 100%
- Links: 2/3 = 67%
- Overall: (100 + 67) / 2 = 83.5% ❌ FAIL
```

#### Example 4: Both Wrong ❌
```
Instructor's Diagram:
- VPC contains: [EC2, RDS, ELB]
- Arrows: Internet→ELB, ELB→EC2, EC2→RDS

Student's Solution:
- VPC contains: [EC2] (RDS, ELB outside) ❌
- Arrows: Internet→ELB, ELB→EC2 ❌

Grading:
- Nesting: 1/3 = 33%
- Links: 2/3 = 67%
- Overall: (33 + 67) / 2 = 50% ❌ FAIL
```

### Special Cases

#### Case 1: No Containers (Only Connections)
```
If your diagram has NO container shapes:
- Only link score is used
- Overall Score = Link Score

Example: Server → Database → Cache
- No VPC, no Namespace, no containers
- Student only needs correct arrows
- Grade = 100% if all arrows correct
```

#### Case 2: No Connections (Only Nesting)
```
If your diagram has NO arrows:
- Only nesting score is used
- Overall Score = Nesting Score

Example: VPC with EC2, RDS (no arrows)
- Student only needs correct placement
- Grade = 100% if all shapes in correct containers
```

---

## Best Practices

### ✅ DO: Create Clear, Logical Tests

#### 1. Use Realistic Architectures
```
GOOD ✅:
VPC
├── Public Subnet
│   └── Load Balancer
└── Private Subnet
    ├── Application Server
    └── Database

This mirrors real AWS architecture patterns
```

```
BAD ❌:
Random shapes with no logical relationship
- No clear purpose
- Confusing for students
- Doesn't teach real-world skills
```

#### 2. Use Meaningful Labels
```
GOOD ✅:
- "Production VPC"
- "Web Server Tier"
- "Database Primary"

BAD ❌:
- "Shape 1"
- "Box A"
- "Thing"
```

#### 3. Progressive Difficulty
```
Level 1: Simple (3-5 shapes, 1 container)
├── VPC
│   ├── EC2
│   └── RDS

Level 2: Medium (6-10 shapes, 2 containers)
├── VPC
│   ├── Public Subnet
│   │   └── ELB
│   └── Private Subnet
│       ├── EC2
│       └── RDS

Level 3: Complex (10+ shapes, nested containers)
├── VPC
│   ├── AZ-1
│   │   ├── Public Subnet
│   │   │   └── ELB
│   │   └── Private Subnet
│   │       └── EC2
│   └── AZ-2
│       └── Private Subnet
│           └── RDS
```

### ❌ DON'T: Common Pitfalls

#### 1. Too Many Shapes
```
BAD ❌:
- 30+ shapes on one diagram
- Students get overwhelmed
- Takes too long to solve
- High chance of minor errors

BETTER ✅:
- Break into multiple tests
- 5-10 shapes per test
- Focus on one concept per test
```

#### 2. Ambiguous Nesting
```
BAD ❌:
Two overlapping containers:
┌──────────────┐
│ VPC-1        │
│   ┌──────────┼────┐
│   │ Zone-1   │    │
└───┼──────────┘    │
    │  VPC-2        │
    └───────────────┘

Unclear which shapes go where
```

```
GOOD ✅:
Clear, non-overlapping containers:
┌────────────────────┐
│ VPC                │
│  ┌────┐  ┌──────┐ │
│  │Zone│  │Zone-2│ │
│  └────┘  └──────┘ │
└────────────────────┘
```

#### 3. Unclear Connection Direction
```
BAD ❌:
Multiple arrows between same shapes:
A ⟷ B (bidirectional)
Hard to tell which is expected

GOOD ✅:
Clear, unidirectional flow:
Client → Load Balancer → Server → Database
```

---

## Example Test Scenarios

### Scenario 1: Basic AWS VPC (Beginner)

**Learning Objective**: Understand AWS VPC organization

**Your Diagram**:
```
┌─────────────────────────────────────┐
│ Production VPC                      │
│                                     │
│  ┌────────┐    ┌──────────┐       │
│  │  ELB   │───→│    EC2   │───┐   │
│  └────────┘    └──────────┘   │   │
│                                ↓   │
│                         ┌──────────┐
│                         │   RDS    │
│                         └──────────┘
└─────────────────────────────────────┘
```

**Students Must**:
1. Drag ELB, EC2, and RDS **inside** VPC
2. Connect: ELB → EC2
3. Connect: EC2 → RDS

**Grading**:
- Nesting: 3 shapes must be in VPC
- Links: 2 connections required
- Pass: 100% needed

**Expected Time**: 3-5 minutes

---

### Scenario 2: Kubernetes Namespace (Intermediate)

**Learning Objective**: Understand K8s resource organization

**Your Diagram**:
```
┌─────────────────────────────────────┐
│ Production Namespace                │
│                                     │
│  ┌─────────┐                       │
│  │ Service │                       │
│  └────┬────┘                       │
│       │                             │
│   ┌───┴───┬────────┐               │
│   ↓       ↓        ↓               │
│ ┌────┐ ┌────┐  ┌────┐             │
│ │Pod1│ │Pod2│  │Pod3│             │
│ └────┘ └────┘  └────┘             │
│                                     │
│ ┌───────────┐  ┌────────┐         │
│ │ConfigMap  │  │Secret  │         │
│ └───────────┘  └────────┘         │
└─────────────────────────────────────┘
```

**Students Must**:
1. Drag Service, Pod1, Pod2, Pod3, ConfigMap, Secret **inside** Namespace
2. Connect: Service → Pod1
3. Connect: Service → Pod2
4. Connect: Service → Pod3

**Grading**:
- Nesting: 6 shapes must be in Namespace
- Links: 3 connections required
- Pass: 100% needed

**Expected Time**: 5-7 minutes

---

### Scenario 3: Multi-Tier Web App (Advanced)

**Learning Objective**: Design multi-tier architecture with zones

**Your Diagram**:
```
┌─────────────────────────────────────────────────┐
│ Production VPC                                  │
│                                                 │
│  ┌────────────────────┐  ┌────────────────────┐
│  │ Public Zone        │  │ Private Zone       │
│  │                    │  │                    │
│  │  ┌──────────┐     │  │  ┌──────────┐     │
│  │  │   ELB    │─────┼──┼─→│   EC2    │─┐   │
│  │  └──────────┘     │  │  └──────────┘ │   │
│  │                    │  │                │   │
│  │  ┌──────────┐     │  │                │   │
│  │  │   NAT    │     │  │                │   │
│  │  └──────────┘     │  │                ↓   │
│  └────────────────────┘  │  ┌──────────┐     │
│                          │  │   RDS    │     │
│                          │  └──────────┘     │
│                          │                    │
│                          │  ┌──────────┐     │
│                          │  │  Cache   │     │
│                          │  └──────────┘     │
│                          └────────────────────┘
└─────────────────────────────────────────────────┘
```

**Students Must**:
1. Drag Public Zone and Private Zone **inside** VPC
2. Drag ELB and NAT **inside** Public Zone
3. Drag EC2, RDS, and Cache **inside** Private Zone
4. Connect: ELB → EC2
5. Connect: EC2 → RDS
6. Connect: EC2 → Cache

**Grading**:
- Nesting: 7 shapes (2 zones + 5 services)
- Links: 3 connections
- Pass: 100% needed

**Expected Time**: 8-10 minutes

---

## Common Mistakes to Avoid

### Mistake 1: Creating Unsolvable Tests ❌
```
PROBLEM:
- Containers too small for shapes to fit
- Overlapping required positions
- Physically impossible to solve

SOLUTION:
✓ Make containers large enough (min 400x300)
✓ Test your own diagram before publishing
✓ Leave space between shapes
```

### Mistake 2: Too Many Similar Shapes ❌
```
PROBLEM:
- 10 identical "EC2" instances
- Students can't tell which goes where
- No way to differentiate

SOLUTION:
✓ Use unique labels: "EC2-Web-1", "EC2-Web-2"
✓ Or use different shape types
✓ Max 3-4 of the same shape type
```

### Mistake 3: Circular Dependencies ❌
```
PROBLEM:
A → B → C → A (circular)
Confusing and unrealistic

SOLUTION:
✓ Use clear, unidirectional flow
✓ Follow data flow patterns
✓ Start → Process → End
```

### Mistake 4: Unclear Instructions ❌
```
PROBLEM:
Test prompt: "Draw the diagram"
Too vague

SOLUTION:
✓ Clear prompt: "Organize the AWS VPC by placing resources in correct subnets and connecting the data flow from Internet to Database"
✓ Specify what to focus on
✓ Give context about the architecture
```

---

## Tips for Creating Better Tests

### 💡 Tip 1: Start with the Learning Objective
```
Ask yourself:
- What concept am I testing?
- What should students learn?
- What's the key takeaway?

Example:
Objective: "Students should understand that databases 
           go in private subnets, not public subnets"

Then design diagram to test this specific concept.
```

### 💡 Tip 2: Use Real-World Patterns
```
Base tests on actual architectures:
✓ AWS Well-Architected Framework
✓ Kubernetes official patterns
✓ Azure reference architectures
✓ Your own production systems

Students learn practical skills, not abstract concepts.
```

### 💡 Tip 3: Provide Context
```
GOOD TEST PROMPT ✅:
"You are deploying a web application on AWS. 
The architecture must have:
- A load balancer in the public subnet
- Application servers in the private subnet
- Database in an isolated subnet
Organize the resources and connect the data flow."

BAD TEST PROMPT ❌:
"Arrange the shapes correctly."
```

### 💡 Tip 4: Test Before Publishing
```
1. Create your diagram
2. Preview the test
3. Try to solve it yourself
4. Check if it's too easy/hard
5. Adjust and republish
```

### 💡 Tip 5: Consider Time Limits
```
Estimate solving time:
- Simple (3-5 shapes): 3-5 minutes
- Medium (6-10 shapes): 5-8 minutes  
- Complex (10+ shapes): 10-15 minutes

Set reasonable expectations for students.
```

### 💡 Tip 6: Progressive Complexity
```
Lab Structure:
Page 1: Theory + MCQ (understand concepts)
Page 2: Simple diagram (3 shapes, 1 container)
Page 3: Medium diagram (5 shapes, 2 containers)
Page 4: Complex diagram (10 shapes, nested containers)

Build skills incrementally.
```

### 💡 Tip 7: Use Color Coding (Labels)
```
Help students by using consistent labels:
✓ "Public Subnet" (students know it's public)
✓ "Database Primary" (students know it's main DB)
✓ "Web Tier" (students understand the function)

Clear labels = better learning experience.
```

---

## Quick Reference Card

### Container Types
| Type | Use For | Example |
|------|---------|---------|
| `VPC` | AWS networking | Production VPC |
| `Namespace` | K8s organization | Production NS |
| `Zone` | Availability zones | Public Subnet |
| `Group` | Logical grouping | Web Tier |
| `Node` | K8s nodes | Worker Node 1 |
| `Virtual Network` | Azure networking | Azure VNet |

### Recommended Test Sizes
| Level | Shapes | Containers | Connections | Time |
|-------|--------|------------|-------------|------|
| Beginner | 3-5 | 1 | 2-3 | 3-5 min |
| Intermediate | 6-10 | 2-3 | 4-6 | 5-8 min |
| Advanced | 10-15 | 3-5 | 6-10 | 10-15 min |

### Grading Formula
```
Overall Score = (Link Score + Nesting Score) / 2

Must be 100% to pass (both metrics at 100%)
```

---

## Troubleshooting

### Problem: Students Getting 0% Despite Correct Solution
**Cause**: Shape IDs don't match between master and student diagrams
**Solution**: Don't manually edit JSON. Use the visual editor only.

### Problem: Test is Too Hard (Everyone Failing)
**Causes**:
- Too many shapes
- Unclear requirements
- Ambiguous nesting

**Solutions**:
- Reduce shape count
- Improve test prompt
- Simplify container structure

### Problem: Test is Too Easy (Everyone Passing)
**Causes**:
- Too few shapes
- Obvious answers
- No real learning

**Solutions**:
- Add more complexity
- Add nested containers
- Add more connections

---

## Summary Checklist

Before publishing your diagram test, ensure:

- [ ] Container shapes are large enough for nested shapes
- [ ] All shapes have clear, unique labels
- [ ] Connections follow logical data flow
- [ ] Test prompt is clear and specific
- [ ] Test is solvable (you tested it yourself)
- [ ] Difficulty matches student skill level
- [ ] Time to complete is reasonable
- [ ] Test teaches a specific concept
- [ ] No overlapping containers
- [ ] No ambiguous requirements

---

## Additional Resources

### Architecture Shapes Available
- **AWS**: EC2, Lambda, S3, RDS, VPC, ELB, DynamoDB, CloudFront, etc.
- **Azure**: Virtual Machine, App Service, SQL Database, VNet, etc.
- **GCP**: Compute Engine, Cloud Functions, Cloud Storage, Cloud SQL, etc.
- **Kubernetes**: Pod, Deployment, Service, Namespace, Node, etc.
- **Generic**: Server, Database, Load Balancer, Firewall, etc.

### Example Architecture Patterns
1. Three-tier web application
2. Microservices with service mesh
3. Event-driven architecture
4. Multi-region deployment
5. High-availability setup
6. Security-layered design

---

**Remember**: The goal is to test understanding, not to trick students. Create fair, educational, and realistic diagram tests that help students learn architecture design patterns.

---

**Last Updated**: December 16, 2025
**Version**: 1.0
**For Questions**: Refer to platform documentation or contact support

