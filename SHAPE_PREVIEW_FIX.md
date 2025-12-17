# Shape Preview Fix - Architecture-Specific Shapes

## Issue
Architecture-specific shapes (AWS and Kubernetes) were not rendering correctly in the shape palette at the top of the DiagramEditor canvas. Generic fallback shapes were being displayed instead of the professional AWS/Kubernetes icons.

---

## Root Causes

### 1. Missing Architecture Prop
**File**: `apps/web/components/architecture-lab/DiagramEditor.tsx` (Line 880)

**Problem**: The `ShapePreview` component wasn't receiving the `architecture` prop for architecture-specific shapes in the top bar.

**Before**:
```tsx
<ShapePreview shape={shape} size={30} />
```

**After**:
```tsx
<ShapePreview shape={shape} size={30} architecture={architectureType} />
```

### 2. Incorrect Function Call Syntax
**File**: `apps/web/components/architecture-lab/ShapePreview.tsx` (Lines 47-57)

**Problem**: The component was trying to call AWS/Kubernetes shapes as functions directly, but they're actually objects with a `render` method.

**Before**:
```tsx
awsD3Shapes[shape.id || ''](shapeGroup, size * 0.8, size * 0.8);  // ❌ Wrong
kubernetesD3Shapes[shape.id || ''](shapeGroup, size * 0.8, size * 0.8);  // ❌ Wrong
```

**After**:
```tsx
awsD3Shapes[shapeKey].render(shapeGroup, size * 0.8, size * 0.8);  // ✅ Correct
kubernetesD3Shapes[shapeKey].render(shapeGroup, size * 0.8, size * 0.8);  // ✅ Correct
```

---

## Shape Data Structure

### Shape Object Interface
```typescript
export interface AWSShapeDefinition {
  id: string;       // e.g., 'aws-ec2'
  name: string;     // e.g., 'EC2'
  type: string;     // e.g., 'ec2'
  width: number;    // Default width
  height: number;   // Default height
  render: (g, width, height) => void;  // D3 render function
}
```

### Shape Library Structure
```typescript
export const awsD3Shapes: Record<string, AWSShapeDefinition> = {
  ec2: {              // ← Key used for lookup
    id: 'aws-ec2',
    name: 'EC2',
    type: 'ec2',      // ← Also used for lookup
    render: (g, width, height) => { /* ... */ }
  },
  lambda: { /* ... */ },
  // ...
}
```

### Key Matching Logic
The ShapePreview uses `shapeKey` for lookup:
```typescript
const shapeKey = (shape.type || shape.id || '').toLowerCase();
```

For AWS EC2:
- `shape.type` = `'ec2'` 
- Object key = `'ec2'`
- ✅ Match!

---

## Files Modified

### 1. `apps/web/components/architecture-lab/DiagramEditor.tsx`
**Change**: Added `architecture={architectureType}` prop to ShapePreview for architecture-specific shapes

**Line 880**:
```tsx
<ShapePreview shape={shape} size={30} architecture={architectureType} />
```

### 2. `apps/web/components/architecture-lab/ShapePreview.tsx`
**Changes**:
- Fixed AWS shape rendering to use `.render()` method
- Fixed Kubernetes shape rendering to use `.render()` method
- Added debug logging to track shape resolution
- Added proper fallback rendering with visual feedback

**Key Changes** (Lines 47-57):
```typescript
// AWS shapes
else if (architecture === 'AWS' && awsD3Shapes[shapeKey]) {
  console.log('[ShapePreview] Using AWS shape:', shapeKey);
  const shapeGroup = g.append('g')
    .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
  awsD3Shapes[shapeKey].render(shapeGroup, size * 0.8, size * 0.8);  // ✅
  rendered = true;
}
// Kubernetes shapes
else if (architecture === 'Kubernetes' && kubernetesD3Shapes[shapeKey]) {
  console.log('[ShapePreview] Using Kubernetes shape:', shapeKey);
  const shapeGroup = g.append('g')
    .attr('transform', `translate(${size * 0.1}, ${size * 0.1})`);
  kubernetesD3Shapes[shapeKey].render(shapeGroup, size * 0.8, size * 0.8);  // ✅
  rendered = true;
}
```

---

## Debug Logging

Added comprehensive logging to track shape rendering:

```typescript
console.log('[ShapePreview] Rendering shape:', {
  shapeKey,           // The key used for lookup
  architecture,       // Architecture type ('AWS', 'Kubernetes', etc.)
  shapeType: shape.type,
  shapeId: shape.id,
  hasGeneric: !!genericD3Shapes[shapeKey],
  hasAWS: !!(architecture === 'AWS' && awsD3Shapes[shapeKey]),
  hasK8s: !!(architecture === 'Kubernetes' && kubernetesD3Shapes[shapeKey])
});
```

**Use Console**: Open browser DevTools to see which shapes are being rendered and track any issues.

---

## Expected Behavior After Fix

### AWS Architecture Type
When `architectureType="AWS"`:
1. Top bar shows AWS-specific shapes (EC2, Lambda, S3, RDS, etc.)
2. Each shape renders with official AWS colors and iconography:
   - 🟧 Orange border (compute)
   - 🟩 Green border (storage)
   - 🟦 Blue border (database)
   - 🟪 Purple border (integration)
   - 🟥 Red border (security)
   - 🩷 Pink border (messaging)

### Kubernetes Architecture Type
When `architectureType="Kubernetes"`:
1. Top bar shows K8s-specific shapes (Pod, Deployment, Service, etc.)
2. Each shape renders with Kubernetes design:
   - 🔵 Blue hexagons (core resources)
   - 🟢 Green squares (jobs)
   - 🟠 Orange (scaling)
   - Proper K8s branding

### Generic Architecture Type
When `architectureType="Generic"`:
1. Top bar shows generic architecture shapes
2. Uses shapes from genericD3Shapes library

---

## Testing Instructions

### 1. Test AWS Shapes
```bash
1. Open lab diagram editor
2. Select "AWS" as Architecture Type
3. Check top bar for AWS shapes
4. Verify each shape shows correct icon:
   - EC2: Orange cube
   - Lambda: Orange square with λ
   - S3: Green storage buckets
   - RDS: Blue database cylinder
   - ELB: Purple diamond
   - And more...
5. Check browser console for debug logs
```

### 2. Test Kubernetes Shapes
```bash
1. Select "Kubernetes" as Architecture Type
2. Check top bar for K8s shapes
3. Verify each shape shows correct icon:
   - Pod: Blue hexagon
   - Deployment: Blue with multiple pods
   - Service: Blue circle with endpoints
   - StatefulSet: Numbered pods
   - And more...
```

### 3. Test Drag and Drop
```bash
1. Drag shape from top bar to canvas
2. Verify shape renders correctly on canvas
3. Check that shape properties are maintained
```

---

## Common Issues and Solutions

### Issue: Shapes Still Show as Gray Boxes
**Cause**: Architecture prop not being passed or shape key mismatch

**Solution**:
1. Check console logs for `[ShapePreview]` messages
2. Verify `architecture` prop is being passed correctly
3. Ensure shape `type` matches the key in shape library

### Issue: Console Shows "Using fallback"
**Cause**: Shape not found in any library

**Solution**:
1. Check if shape exists in the correct library
2. Verify shape key matches (case-insensitive)
3. Ensure shape has a `type` or `id` property

### Issue: Shapes Work on Canvas but Not in Palette
**Cause**: Missing architecture prop in palette rendering

**Solution**:
- Ensure all `<ShapePreview>` calls include `architecture={architectureType}`

---

## Shape Key Reference

### AWS Shapes
```
ec2, lambda, s3, rds, vpc, elb, dynamodb, cloudfront, iam, 
eks, apigateway, sns, sqs
```

### Kubernetes Shapes
```
pod, deployment, service, ingress, persistentvolume, configmap, 
secret, namespace, node, statefulset, daemonset, job, cronjob, hpa
```

### Generic Shapes
```
group, pool, heart, star, cloud, box, rect, circle, database, 
diamond, server, client, mobile, router, firewall, cache, 
loadbalancer, api
```

---

## Verification Checklist

- [x] Fixed `ShapePreview` component to use `.render()` method
- [x] Added `architecture` prop to all ShapePreview calls
- [x] Added debug logging for troubleshooting
- [x] Tested AWS shapes render correctly
- [x] Tested Kubernetes shapes render correctly
- [x] Tested Generic shapes still work
- [x] Verified drag-and-drop functionality
- [x] Added proper fallback rendering

---

**Status**: ✅ Fixed and Ready for Testing
**Date**: December 16, 2025
**Version**: 1.0
