# Foundation Testing Checklist

## **Automated Tests** ✅

### Run All Tests

```bash
cd apps/web
npm run test:run
```

**Expected Results:**

- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Coverage includes components and stores

---

## **Manual Testing** 🧪

### **1. Development Server**

```bash
npm run dev
```

**Check:**

- [ ] Server starts without errors
- [ ] Hot reload works when editing files
- [ ] No console errors in browser
- [ ] Page loads at http://localhost:3000

### **2. UI Components (Left Panel)**

**Check each component works:**

- [ ] Email input accepts text
- [ ] Name input accepts text
- [ ] All 4 button variants render correctly
- [ ] Primary, Secondary, Outline, Ghost buttons clickable
- [ ] Theme colors display properly
- [ ] Responsive layout on mobile/desktop

### **3. State Management (Right Panel)**

**Authentication Store:**

- [ ] Initially shows "Not logged in"
- [ ] Click "Demo Login" → Shows user details
- [ ] User info displays: "Demo User", email, role
- [ ] Click "Logout" → Returns to "Not logged in"
- [ ] Login notification appears

**UI Store:**

- [ ] Initially shows "Sidebar: Closed"
- [ ] Click "Toggle Sidebar" → Shows "Sidebar: Open"
- [ ] Toggle again → Returns to "Sidebar: Closed"
- [ ] Click "Add Notification" → Notification count increases
- [ ] Notification content appears in bottom panel

### **4. Build Process**

```bash
npm run build
```

**Check:**

- [ ] Build completes without errors
- [ ] No TypeScript compilation errors
- [ ] All dependencies resolve correctly

### **5. Code Quality**

```bash
npm run lint
```

**Check:**

- [ ] No ESLint errors
- [ ] Code follows consistent formatting
- [ ] No unused imports or variables

### **6. Git Hooks (Pre-commit)**

```bash
# Make any small change and commit
git add .
git commit -m "Test commit"
```

**Check:**

- [ ] Pre-commit hook runs automatically
- [ ] Linting runs on changed files
- [ ] Tests run on related files
- [ ] Prettier formats code
- [ ] Commit succeeds only if all checks pass

---

## **Architecture Verification** 🏗️

### **Monorepo Structure**

**Check all packages exist:**

- [ ] `apps/web/` - Next.js frontend
- [ ] `apps/supabase/` - Supabase configuration
- [ ] `packages/db/` - Prisma database
- [ ] `packages/types/` - Shared TypeScript types
- [ ] `packages/ui/` - Shared UI components

### **Technology Stack**

**Verify each technology works:**

- [ ] ✅ Next.js (React framework)
- [ ] ✅ TypeScript (type safety)
- [ ] ✅ Tailwind CSS (styling)
- [ ] ✅ Shadcn/ui (component library)
- [ ] ✅ Prisma (database ORM)
- [ ] ✅ tRPC (API layer)
- [ ] ✅ Supabase (backend setup)
- [ ] ✅ Vitest (testing framework)
- [ ] ✅ Zustand (state management)

---

## **Browser Testing** 🌐

### **Different Browsers**

Test in multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

### **Responsive Design**

Test different screen sizes:

- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1024px+ width)
- [ ] Components layout correctly at all sizes

### **Dark Mode Support**

- [ ] CSS variables are set up for dark mode
- [ ] Light theme works correctly
- [ ] Ready for future dark mode toggle

---

## **Performance Testing** ⚡

### **Development Mode**

- [ ] Page loads under 2 seconds
- [ ] No memory leaks in DevTools
- [ ] State updates are fast and responsive

### **Build Mode**

```bash
npm run build && npm run start
```

- [ ] Production build loads quickly
- [ ] Bundle size is reasonable
- [ ] No runtime errors in production

---

## **Documentation Testing** 📚

**Check all documentation is accurate:**

- [ ] README instructions work
- [ ] DEVELOPMENT_SETUP.md commands work
- [ ] TESTING_SETUP.md instructions work
- [ ] STATE_MANAGEMENT.md examples work
- [ ] SHADCN_SETUP.md information is correct

---

## **Common Issues & Solutions** 🔧

### **If Tests Fail:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run test:run
```

### **If Build Fails:**

```bash
# Check TypeScript
npm run build:check
# Fix import paths
# Ensure all dependencies are installed
```

### **If State Doesn't Work:**

- Check browser console for errors
- Verify Zustand store imports
- Check React DevTools for state changes

---

## **Ready for Story 2.1?** ✅

**All checks pass?** You're ready to build real Cleanly platform features! 🚀
