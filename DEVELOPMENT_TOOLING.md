# Development Tooling Documentation

## Overview

This project includes automated development tooling to maintain code quality and consistency.

## Git Hooks (Husky)

### Pre-commit Hook

Automatically runs before each commit to ensure code quality:

1. **Linting**: Runs ESLint with auto-fix on changed files
2. **Testing**: Runs tests related to changed files
3. **Formatting**: Runs Prettier on all staged files

### Configuration

- **Husky Config**: `.husky/pre-commit`
- **Lint-staged**: `package.json` lint-staged section

## Code Formatting (Prettier)

### Configuration

- **Config File**: `.prettierrc`
- **Settings**: Single quotes, semicolons, 80 char width, 2 spaces

### Usage

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

## Linting (ESLint)

### Configuration

- **Web App**: `apps/web/eslint.config.js`
- **Rules**: Next.js recommended + TypeScript

### Usage

```bash
# Lint with auto-fix
cd apps/web && npm run lint --fix

# Lint check only
cd apps/web && npm run lint
```

## Development Workflow

### Before Committing

The pre-commit hook automatically:

1. Runs ESLint on changed TypeScript/JavaScript files
2. Runs tests for changed components
3. Formats all staged files with Prettier

### Manual Commands

```bash
# Run all quality checks
npm run lint
npm run test:run

# Format code
npx prettier --write .

# Test pre-commit hook
npx husky .husky/pre-commit
```

## Bypassing Hooks

Only in emergencies:

```bash
git commit --no-verify -m "Emergency commit"
```

## Benefits

- ✅ Consistent code style across team
- ✅ Catch issues before they reach CI/CD
- ✅ Automatic formatting prevents style debates
- ✅ Tests run automatically on relevant changes
- ✅ Improved code quality and maintainability
