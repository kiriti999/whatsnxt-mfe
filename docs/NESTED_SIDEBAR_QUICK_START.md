# Nested Sidebar - Quick Start Guide

## 🚀 Initial Setup (One Command Only)

```bash
# Run from backend directory
cd /Users/arjun/whatsnxt-bff
ts-node scripts/migrations/001-seed-icons.ts
```

**That's it!** This seeds the icon library. No other setup needed.

---

## 📋 Create Sections (Frontend Admin UI Only)

1. **Navigate to Admin UI:**
   ```
   http://localhost:3001/admin/sidebar-management
   ```

2. **Click "Create Section"**

3. **Fill in the form:**
   - Title: e.g., "Web Development"
   - Description: Brief description
   - Icon: Choose from dropdown (50+ icons)
   - Content Type: Blog or Tutorial
   - Parent: Leave blank for top-level
   - Order: Display order number
   - Visible: Toggle on

4. **Click "Save"**

5. **Repeat** for all sections you need

---

## ✅ DO:
- ✅ Create sections via Admin UI
- ✅ Create sections as you need them
- ✅ Build structure based on actual content
- ✅ Run icon migration once (001)

## ❌ DON'T:
- ❌ Run migrations 002 or 003 (they're disabled)
- ❌ Auto-generate sections programmatically
- ❌ Create sections before you have content
- ❌ Edit database directly

---

## 📁 Files Changed

**Disabled (renamed):**
- `002-seed-default-sections.ts` → `002-seed-default-sections.ts.DISABLED`
- `003-migrate-existing-posts.ts` → `003-migrate-existing-posts.ts.DISABLED`

**Active:**
- `001-seed-icons.ts` ✅ (run this once)

---

## 🎯 Key Principle

**Sections are user-created content, not system configuration.**

Think of sections like:
- ✅ WordPress categories (created by admins as needed)
- ✅ Gmail labels (add when you need organization)
- ✅ File system folders (created when needed)

NOT like:
- ❌ Database tables (pre-populated)
- ❌ Config files (deployed with app)
- ❌ System defaults (forced on users)

---

## 📖 Full Documentation

- **Quick Start:** This file
- **Full Workflow:** `/docs/SECTION_MANAGEMENT_WORKFLOW.md`
- **Migration Docs:** `/scripts/migrations/README.md`
- **Feature Spec:** `/specs/001-nested-sidebar/spec.md`

---

## 🆘 Need Help?

**Q: Where do I create sections?**
A: Admin UI at `/admin/sidebar-management`

**Q: Should I run migration 002?**
A: No, it's disabled. Create sections in the UI.

**Q: I already ran migration 002, what now?**
A: Either use those sections or clear the database and start fresh via UI.

**Q: Icons aren't showing in the UI**
A: Run `001-seed-icons.ts` migration.

**Q: Can I pre-populate sections for my users?**
A: No, let users create their own section structure via the UI.
