# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Build: `npm run build`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test all: `npm test`
- Test single file: `npm test -- path/to/test`

## Code Style Guidelines
- Formatting: Use Prettier with 2-space indentation
- Typing: TypeScript strict mode, explicit return types on functions
- Imports: Group imports (external, internal, types), sort alphabetically
- Naming: camelCase for variables/functions, PascalCase for classes/interfaces
- Error handling: Use custom error classes, avoid try/catch without proper error reporting
- Async: Prefer async/await over raw promises
- Comments: JSDoc for public APIs and complex functions