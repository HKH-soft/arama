# Next.js Development Agent Rule Set

## ⚠️ CRITICAL: Version Compatibility Warning

**NEXTJS HAS A NEW VERSION DIFFERENT FROM YOUR TRAINING DATA. THE NEW NEXTJS VERSION HAS BREAKING CHANGES. SO BEFORE ADDING ANYTHING MAKE SURE THE CODE THAT YOU ARE WRITING IS UP TO DATE.**

### Version Verification Protocol:

1. **ALWAYS check `package.json` first** before writing any code
2. **Verify the exact Next.js version** being used in the project
3. **Research current API patterns** for that specific version
4. **Never assume APIs** from previous versions still work
5. **Cross-reference with official docs** for the detected version

---

## 🔍 Project Analysis Rules

### Before Any Code Generation:

1. **Read existing project structure** completely
2. **Understand current patterns** (pages vs app router, layouts, etc.)
3. **Check TypeScript config** and strictness settings
4. **Identify styling solution** (CSS Modules, Tailwind, styled-components, etc.)
5. **Review existing middleware, layouts, and error boundaries**
6. **Check data fetching patterns** already in use

---

## 📦 Package Management Rules

### Dependencies:

1. **Never install packages without verifying compatibility** with the current Next.js version
2. **Check for known conflicts** before suggesting any new dependency
3. **Prefer built-in Next.js features** over external packages when possible
4. **Verify peer dependencies** match the installed Next.js version
5. **Use the project's existing package manager** (npm, yarn, pnpm, bun)

### Installation Protocol:

```bash
# Always specify exact version if compatibility is uncertain
npm install package@version --save-exact
# Or check peer dependencies first
npm info package peerDependencies
```

## 🏗️ Code Generation Rules

### App Router vs Pages Router:

1. **Detect which router** the project uses (check for app/ or pages/ directory)
2. **Follow the project's existing pattern** - don't mix routers unless explicitly asked
3. **Use correct file conventions** for the detected router:
   - **App Router**: page.tsx, layout.tsx, loading.tsx, error.tsx
   - **Pages Router**: index.tsx, \_app.tsx, \_document.tsx

### Component Architecture:

1. **Server Components by default** (App Router) unless client interactivity needed
2. **Add 'use client' directive** only when absolutely necessary
3. **Keep client components as leaf components** when possible
4. **Use proper TypeScript types** - no any unless truly unavoidable
5. **Implement proper error boundaries** for error-prone components

### Data Fetching:

1. **Check the Next.js version** for current data fetching APIs
2. **Use async/await with Server Components** (App Router, Next.js 13+)
3. **Implement proper loading states** with loading.tsx or Suspense
4. **Handle errors gracefully** with error.tsx or try-catch
5. **Cache appropriately** using fetch options or unstable_cache

### API Routes:

1. **Use Route Handlers** (route.ts) for App Router
2. **Use API Routes** (pages/api/) for Pages Router
3. **Validate all inputs** before processing
4. **Return proper status codes** and error messages
5. **Implement rate limiting** for public endpoints

## 🎨 Styling Rules

1. **Use the project's existing styling solution**
2. **Maintain consistent naming conventions**
3. **Make components responsive by default**
4. **Use CSS custom properties for theming** when appropriate
5. **Avoid inline styles** unless dynamically computed

## 🔒 Security Rules

1. **Never expose API keys or secrets** in client-side code
2. **Use environment variables** prefixed with NEXT*PUBLIC* for client-safe values
3. **Sanitize user inputs** before rendering or processing
4. **Implement CSRF protection** for form submissions
5. **Use next/headers server-side** for reading headers (not client-side)
6. **Validate redirect destinations** to prevent open redirects

## ⚡ Performance Rules

1. **Use Next.js Image component** for all images (next/image)
2. **Implement proper code splitting** with dynamic imports
3. **Use next/link** for client-side navigation (not <a> tags)
4. **Optimize fonts** using next/font
5. **Stream content** with Suspense boundaries where appropriate
6. **Prefetch data** when user intent is clear

## 🧪 Testing Requirements

1. **Write tests** for new functionality when test infrastructure exists
2. **Use the project's existing testing framework** (Jest, Vitest, Cypress, Playwright)
3. **Test both happy path and error scenarios**
4. **Mock external dependencies** appropriately
5. **Test across different viewports** for responsive components

## 📝 Code Quality Rules

1. **Follow existing code style** (Prettier, ESLint config)
2. **Maintain consistent naming conventions**
3. **Write meaningful comments** for complex logic
4. **Keep functions small and focused** (single responsibility)
5. **Extract reusable logic** into hooks or utilities
6. **Use proper TypeScript generics** when creating reusable components

## 🚀 Deployment Considerations

1. **Check for edge runtime compatibility** if using Edge features
2. **Ensure middleware logic** works in deployment environment
3. **Verify environment variables** are properly configured
4. **Test static generation** works for pages that should be static
5. **Monitor bundle size** for new additions

## 🔄 Version-Specific Checks

### When Writing Code, ALWAYS Verify:

1. **Is this API/pattern still valid** in the detected Next.js version?
2. **Are there new recommended approaches** for this functionality?
3. **Does this use any deprecated features?**
4. **Are the TypeScript types correct** for this version?
5. **Have I checked the official migration guide** for breaking changes?

### Common Breaking Changes to Watch For:

1. **App Router conventions** and file structure
2. **Image component API changes**
3. **Middleware signature changes**
4. **Data fetching method changes**
5. **Route handler API changes**
6. **Config file structure** (next.config.js vs next.config.mjs)
7. **React version requirements**

## 🚫 What NOT to Do

1. **DON'T assume training data APIs** are current - verify first
2. **DON'T mix router patterns** without explicit instruction
3. **DON'T add unnecessary dependencies**
4. **DON'T ignore TypeScript errors**
5. **DON'T skip error handling**
6. **DON'T hardcode values** that should be configurable
7. **DON'T create components** that can't handle loading/error states

## ✅ Pre-Generation Checklist

### Before writing ANY code:

1. **Checked package.json** for Next.js version
2. **Verified current APIs and patterns**
3. **Understood existing project structure**
4. **Identified which router** is in use
5. **Confirmed styling approach**
6. **Checked for potential breaking changes**
7. **Ready to write version-appropriate code**

Remember: When in doubt about API compatibility, ALWAYS consult the official Next.js documentation for the specific version being used rather than relying on training data which may be outdated.
