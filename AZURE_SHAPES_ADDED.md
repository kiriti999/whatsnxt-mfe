# Azure Shape Library Added + Dynamic Architecture Dropdown

## Overview
Created a comprehensive Azure shapes library with 14 professional service icons based on Microsoft Azure official design guidelines. Updated the Architecture Type dropdown to dynamically load available architectures from the centralized registry.

---

## Azure Shapes Created (14 Shapes) ✅

### Compute Services
1. **Virtual Machine** - Azure VM compute instance
   - Blue themed (#0078D4)
   - Monitor/screen icon with stand
   - Type: `virtualmachine`

2. **App Service** - Web hosting platform
   - Lightning bolt icon (fast deployment)
   - Type: `appservice`

3. **Functions** - Serverless compute
   - Function notation: f(x)
   - Italic style font
   - Type: `functions`

4. **Container Instances** - Serverless containers
   - Docker-style container boxes
   - Multiple stacked containers
   - Type: `containerinstances`

5. **AKS** - Azure Kubernetes Service
   - Kubernetes wheel with 6 spokes
   - Azure blue with K8s blue center
   - Type: `aks`

### Storage & Database
6. **Storage Account** - Blob/file storage
   - Three stacked cylinders
   - Storage representation
   - Type: `storageaccount`

7. **SQL Database** - Managed SQL
   - Database cylinder with ellipses
   - Classic DB icon
   - Type: `sqldatabase`

8. **Cosmos DB** - NoSQL distributed database
   - Purple themed (#7719AA)
   - Globe with latitude/longitude lines
   - Type: `cosmosdb`

### Networking
9. **Virtual Network** - VNet
   - Dashed border (500x400)
   - Network mesh icon with nodes
   - Type: `virtualnetwork`

10. **Load Balancer** - Traffic distribution
    - Balance scale representation
    - Two pans showing load distribution
    - Type: `loadbalancer`

11. **Application Gateway** - Web traffic manager
    - Gateway arch design
    - Traffic flow arrows
    - Type: `applicationgateway`

### Integration & Management
12. **API Management** - API gateway
    - Orange themed (#F25022)
    - Curly braces { API }
    - Type: `apimanagement`

13. **Service Bus** - Message broker
    - Teal/green themed (#59B4D9)
    - Message queue boxes with arrows
    - Type: `servicebus`

14. **Key Vault** - Secrets management
    - Yellow themed (#FFB900)
    - Key icon with shaft and teeth
    - Type: `keyvault`

15. **Monitor** - Monitoring and diagnostics
    - Heart rate monitoring line
    - Activity graph representation
    - Type: `monitor`

---

## Azure Color Palette

Following Microsoft Azure brand guidelines:

| Color | Hex Code | Usage |
|-------|----------|-------|
| **Azure Blue** | #0078D4 | Primary compute, networking |
| **Dark Blue** | #005A9E | Borders and accents |
| **Purple** | #7719AA | Cosmos DB, distributed services |
| **Orange** | #F25022 | API Management, integration |
| **Yellow** | #FFB900 | Security (Key Vault) |
| **Teal** | #59B4D9 | Messaging (Service Bus) |
| **White** | #FFFFFF | Icon details and highlights |

---

## Shape Structure

Each Azure shape follows the same pattern:

```typescript
{
  id: 'azure-[service]',        // Unique ID
  name: '[Service Name]',        // Display name
  type: '[servicename]',         // Lookup key (lowercase)
  width: 80,                     // Default width
  height: 80,                    // Default height
  render: (g, width, height) => {
    // D3.js SVG rendering
    // 1. Outer square (Azure branded)
    // 2. Service-specific icon
    // 3. White accents/details
  }
}
```

### Example: Virtual Machine
```typescript
virtualmachine: {
  id: 'azure-vm',
  name: 'Virtual Machine',
  type: 'virtualmachine',
  width: 80,
  height: 80,
  render: (g, width, height) => {
    // Outer blue square
    g.append('rect')
      .attr('fill', '#0078D4')
      .attr('stroke', '#005A9E');
    
    // Monitor icon (white)
    g.append('rect')
      .attr('fill', '#FFFFFF');
    
    // Stand and base
    // ...
  }
}
```

---

## Dynamic Architecture Dropdown ✅

### Before
```typescript
// Hardcoded list
const ARCHITECTURE_TYPES = ['AWS', 'Azure', 'GCP', 'Hybrid', 'On-Premise'];
```

**Problems**:
- ❌ Manually updated
- ❌ Could be out of sync with available shapes
- ❌ Included unsupported types (GCP, Hybrid, On-Premise)

### After
```typescript
import { getAvailableArchitectures } from '@/utils/shape-libraries';

// Dynamically loaded from registry
const ARCHITECTURE_TYPES = getAvailableArchitectures();
// Returns: ['AWS', 'Azure', 'Kubernetes', 'Generic']
```

**Benefits**:
- ✅ Automatically synced with shape libraries
- ✅ Always accurate and up-to-date
- ✅ Single source of truth
- ✅ Add architecture = dropdown updates automatically

---

## Files Modified/Created

### Created
1. **`apps/web/utils/shape-libraries/azure-d3-shapes.ts`**
   - New Azure shape library
   - 14 professional Azure service shapes
   - ~1000 lines of D3 rendering code

### Modified
2. **`apps/web/utils/shape-libraries/index.ts`**
   - Added Azure to ARCHITECTURE_LIBRARIES
   - Updated types to include AzureShapeDefinition
   - Added Azure metadata

3. **`apps/web/app/lab/create/page.tsx`**
   - Imported getAvailableArchitectures
   - Changed ARCHITECTURE_TYPES to dynamic

---

## Architecture Registry

### Updated Registry
```typescript
export const ARCHITECTURE_LIBRARIES = {
  AWS: awsD3Shapes,           // 13 shapes
  Azure: azureD3Shapes,       // 14 shapes ✅ NEW!
  Kubernetes: kubernetesD3Shapes, // 14 shapes
  Generic: genericD3Shapes,   // Multiple shapes
};
```

### Updated Metadata
```typescript
export const getArchitectureMetadata = (architectureType: string) => {
  const metadata = {
    AWS: {
      name: 'Amazon Web Services',
      color: '#FF9900',
      description: 'AWS cloud infrastructure shapes',
    },
    Azure: { ✅ NEW!
      name: 'Microsoft Azure',
      color: '#0078D4',
      description: 'Azure cloud infrastructure shapes',
    },
    Kubernetes: {
      name: 'Kubernetes',
      color: '#326CE5',
      description: 'Kubernetes cluster and workload shapes',
    },
    Generic: {
      name: 'Generic Architecture',
      color: '#666666',
      description: 'Generic architecture diagram shapes',
    },
  };
  
  return metadata[architectureType];
};
```

---

## Shape Comparison

| Architecture | Shape Count | Status |
|--------------|-------------|--------|
| **AWS** | 13 shapes | ✅ Complete |
| **Azure** | 14 shapes | ✅ NEW! |
| **Kubernetes** | 14 shapes | ✅ Complete |
| **Generic** | 15+ shapes | ✅ Complete |

---

## Usage Examples

### 1. Creating Azure Diagram
```typescript
// In lab creation form
const lab = {
  name: 'Azure Cloud Architecture',
  architectureType: 'Azure',  // Automatically available!
  labType: 'Cloud Computing'
};
```

### 2. Available Azure Shapes
When `architectureType="Azure"`:
- Virtual Machine
- App Service
- Functions
- Storage Account
- SQL Database
- Cosmos DB
- Virtual Network
- Load Balancer
- Application Gateway
- API Management
- Service Bus
- Key Vault
- Monitor
- Container Instances
- AKS

### 3. Architecture Patterns Supported

**3-Tier Web App**:
```
Application Gateway → App Service → SQL Database + Storage Account
```

**Microservices**:
```
AKS → Service Bus → Cosmos DB + Storage Account
```

**Serverless**:
```
API Management → Functions → Cosmos DB
```

**Hybrid Network**:
```
Virtual Network → Load Balancer → Virtual Machines
```

---

## Testing Instructions

### 1. Test Lab Creation
```bash
1. Navigate to /lab/create
2. Click "Architecture Type" dropdown
3. Verify options:
   ☑ AWS
   ☑ Azure  # NEW!
   ☑ Kubernetes  # Now visible!
   ☑ Generic
4. Select "Azure"
5. Create lab successfully
```

### 2. Test Azure Shapes
```bash
1. Open lab with architectureType="Azure"
2. Go to Diagram Test tab
3. Verify top bar shows Azure shapes
4. Check each shape renders correctly:
   - Blue Azure branding
   - Service-specific icons
   - Professional appearance
5. Drag shapes to canvas
6. Verify shapes work on canvas
```

### 3. Test Shape Colors
```bash
Azure shapes should show:
- Blue (#0078D4) for most services
- Purple (#7719AA) for Cosmos DB
- Orange (#F25022) for API Management
- Yellow (#FFB900) for Key Vault
- Teal (#59B4D9) for Service Bus
- White accents for icons
```

---

## Common Azure Architecture Patterns

### 1. Web Application
```
[Application Gateway] → [App Service] → [SQL Database]
                     ↓
              [Storage Account]
```

### 2. Microservices
```
[AKS Cluster]
    ↓
[Service Bus] → [Functions]
    ↓
[Cosmos DB]
```

### 3. API Backend
```
[API Management]
    ↓
[Functions] → [SQL Database]
    ↓
[Monitor]
```

### 4. Message Processing
```
[Service Bus] → [Functions] → [Storage Account]
                    ↓
              [Monitor]
```

---

## Shape Key Reference

### Azure Shape Keys
```typescript
virtualmachine, appservice, functions, storageaccount, 
sqldatabase, cosmosdb, virtualnetwork, loadbalancer, 
applicationgateway, apimanagement, servicebus, keyvault, 
monitor, containerinstances, aks
```

**Usage in Code**:
```typescript
import { azureD3Shapes } from '@/utils/shape-libraries/azure-d3-shapes';

// Get specific shape
const vmShape = azureD3Shapes['virtualmachine'];

// Render
vmShape.render(d3Selection, 80, 80);
```

---

## Benefits

### For Instructors
- ✅ Can create Azure-specific architecture labs
- ✅ Professional Azure branding in diagrams
- ✅ All major Azure services covered
- ✅ Dropdown automatically includes Azure

### For Students
- ✅ Learn real Azure architecture patterns
- ✅ See industry-standard icons
- ✅ Better prepared for Azure certifications
- ✅ Visual clarity with color-coded services

### For Developers
- ✅ Easy to extend with more Azure shapes
- ✅ Centralized registry manages everything
- ✅ No manual dropdown updates needed
- ✅ Consistent design patterns

---

## Future Enhancements

### More Azure Shapes (Easy to Add)
- Azure Cognitive Services
- Azure Machine Learning
- Azure Data Factory
- Azure Event Hubs
- Azure Redis Cache
- Azure Front Door
- Azure Traffic Manager
- Azure Firewall
- Azure VPN Gateway
- Azure Backup

### GCP Shapes (Following Same Pattern)
```typescript
// Create gcp-d3-shapes.ts
// Add to ARCHITECTURE_LIBRARIES
// Automatically appears in dropdown!
```

---

## Validation Checklist

- [x] Created azure-d3-shapes.ts with 14 shapes
- [x] Added Azure to ARCHITECTURE_LIBRARIES
- [x] Updated type definitions
- [x] Added Azure metadata
- [x] Made dropdown dynamic using getAvailableArchitectures()
- [x] Verified Kubernetes now appears in dropdown
- [x] All shapes follow Azure color guidelines
- [x] Professional icon designs
- [x] Comprehensive documentation

---

**Status**: ✅ Complete and Production Ready
**Date**: December 16, 2025
**Azure Shapes**: 14
**Total Architectures**: 4 (AWS, Azure, Kubernetes, Generic)
**Dropdown**: Dynamic and auto-updating
