# Project notes (managed by Prompt Optimizer)

<!-- prompt-optimizer:memory:begin -->

> Auto-generated from Prompt Optimizer workspace memory.
> Do not edit between markers — edits will be overwritten on the next sync.

### AGENTS.md

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
4. **Use proper TypeScript t
... (truncated)

### Project knowledge graph (auto)

- **Next.js App Router**: Framework: Next.js App Router
- **TypeScript/JavaScript**: Language: TypeScript/JavaScript
- **Drizzle ORM**: ORM: Drizzle ORM
- **__workspace_seed__**: Aggregated workspace harvest
- **Next.js**: Framework: Next.js
- **React**: Framework: React
- **session**: Symbol: session (defined in src/proxy.ts)
- **auth**: File name: src/types/auth.ts

<!-- prompt-optimizer:memory:end -->
