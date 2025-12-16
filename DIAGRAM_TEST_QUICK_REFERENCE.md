# Diagram Test - Quick Reference for Instructors

## 🎯 How It Works

### You Create
1. Draw the **CORRECT** architecture diagram
2. Place shapes **INSIDE** containers (VPC, Namespace, etc.)
3. Connect shapes with **arrows**

### System Auto-Jumbles
1. Randomizes shape positions
2. Moves shapes **OUT** of containers  
3. Removes all arrow connections

### Students Must
1. Drag shapes **INTO** correct containers
2. Draw **correct arrows** between shapes
3. Match your diagram **EXACTLY** (100% required to pass)

---

## 📊 Grading Formula

```
Overall Score = (Link Score + Nesting Score) / 2

Link Score    = (Correct Arrows / Total Arrows) × 100%
Nesting Score = (Shapes in Correct Containers / Total) × 100%

PASS = 100% (Both scores must be 100%)
```

---

## ✅ Students Get Points For

### 1. Correct Nesting (50%)
- ✓ Placing EC2 inside VPC
- ✓ Placing Pod inside Namespace
- ✓ Placing VM inside Virtual Network

### 2. Correct Connections (50%)
- ✓ Drawing arrow from Load Balancer → Server
- ✓ Drawing arrow from Server → Database
- ✓ All connections match your diagram

---

## 🏗️ Container Types

| Shape | Use For |
|-------|---------|
| **VPC** | AWS Virtual Private Cloud |
| **Namespace** | Kubernetes resource isolation |
| **Zone/Subnet** | Availability zones, subnets |
| **Virtual Network** | Azure networking |
| **Node** | Kubernetes worker nodes |
| **Group** | Logical grouping |

---

## 💡 Best Practices

### ✅ DO
- Use 5-10 shapes per test (manageable)
- Make containers large enough (min 400×300)
- Use clear labels ("Production VPC", "Web Server")
- Test realistic architectures (AWS patterns, K8s patterns)
- Provide clear test instructions

### ❌ DON'T
- Create tests with 20+ shapes (overwhelming)
- Use tiny containers that shapes can't fit in
- Use identical labels (10× "EC2" - confusing)
- Create ambiguous nesting (overlapping containers)
- Leave vague instructions

---

## 📏 Recommended Test Sizes

| Level | Shapes | Containers | Arrows | Time |
|-------|--------|------------|--------|------|
| **Beginner** | 3-5 | 1 | 2-3 | 5 min |
| **Intermediate** | 6-10 | 2-3 | 4-6 | 8 min |
| **Advanced** | 10-15 | 3-5 | 6-10 | 15 min |

---

## 🎓 Example Test

### Your Diagram (What You Draw)
```
┌─────────────────────────────┐
│ Production VPC              │
│                             │
│  ┌─────┐    ┌──────┐       │
│  │ ELB │ →  │ EC2  │ →┐   │
│  └─────┘    └──────┘  │   │
│                        ↓   │
│                  ┌─────────┐│
│                  │   RDS   ││
│                  └─────────┘│
└─────────────────────────────┘
```

### What Students See (Jumbled)
```
┌─────────────────────────────┐
│ Production VPC (empty)      │
└─────────────────────────────┘

  ┌─────┐         ┌──────┐
  │ ELB │         │ EC2  │
  └─────┘         └──────┘

         ┌─────────┐
         │   RDS   │
         └─────────┘
         
(All outside VPC, no arrows)
```

### Students Must Do
1. ✓ Drag ELB **inside** VPC
2. ✓ Drag EC2 **inside** VPC
3. ✓ Drag RDS **inside** VPC
4. ✓ Connect ELB → EC2
5. ✓ Connect EC2 → RDS

### Grading
- Nesting: 3/3 shapes = 100%
- Links: 2/2 arrows = 100%
- **Overall: 100% = PASS ✅**

---

## 🚫 Common Mistakes

### Students Fail When:
```
❌ ELB placed outside VPC
   (Nesting: 2/3 = 67%)
   
❌ Missing EC2→RDS arrow
   (Links: 1/2 = 50%)
   
❌ Both issues
   (Overall: ~58% = FAIL)
```

---

## 📝 Writing Good Test Prompts

### ❌ Bad Prompt
"Arrange the diagram correctly"

### ✅ Good Prompt
"Design an AWS architecture with:
- Load balancer in public subnet
- Application server in private subnet  
- Database in isolated subnet
Connect the data flow from Internet to Database"

---

## ⚡ Quick Tips

1. **Test it yourself** - Solve your own test before publishing
2. **Start simple** - Begin with basic tests, increase complexity
3. **Clear labels** - Use descriptive names, not "Shape1"
4. **Realistic patterns** - Base on real architectures
5. **Provide context** - Explain what students should achieve

---

## 🎯 Key Takeaway

**Students must recreate your EXACT diagram:**
- Same nesting (shapes in correct containers)
- Same connections (arrows between correct shapes)
- 100% accuracy required to pass

**Make it fair, make it educational, make it realistic!**

