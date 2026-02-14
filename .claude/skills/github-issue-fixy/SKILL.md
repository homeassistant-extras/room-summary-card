---
name: github-issue-solver
description: Accept a GitHub issue URL or issue details, create a comprehensive plan (in plan mode - shows plan first), then implement the solution including tests and documentation, create/update release notes for Home Assistant users, and update the README roadmap for new features. Use when the user provides a GitHub issue or asks to solve an issue. ALWAYS presents the plan first and waits for user approval before implementing.
---

# GitHub Issue Solver

This skill guides you through solving GitHub issues for the Home Assistant device-card project. It ensures comprehensive planning, testing, documentation, and release notes.

## When to Use

- Use this skill when the user provides a GitHub issue URL or issue details
- Use when asked to solve, fix, or implement something from a GitHub issue
- Use when planning work based on an issue or feature request

## Instructions

**IMPORTANT: This skill runs in PLAN MODE first. You MUST present a comprehensive plan to the user and wait for their approval before implementing any code changes.**

### Step 1: Analyze the GitHub Issue

1. **Fetch the issue details**:
   - If a GitHub issue URL is provided, fetch it using the web fetch tool or ask the user for the issue details
   - Extract key information:
     - Issue title and description
     - Issue type (bug fix, feature request, enhancement, etc.)
     - Labels and milestones
     - Comments and discussion
     - Related issues or PRs

2. **Understand the requirements**:
   - Identify what needs to be fixed or implemented
   - Note any edge cases or special considerations mentioned
   - Check if there are any related issues or dependencies

### Step 2: Create and Present the Plan (STOP HERE - DO NOT IMPLEMENT YET)

1. **Break down the work**:
   - List all files that need to be created or modified
   - Identify the core functionality changes required
   - Note any dependencies or related components
   - Review existing code patterns in the project for consistency

2. **Create a comprehensive task list**:
   - Use the todo_write tool to create a structured task list with all tasks marked as "pending"
   - Include detailed tasks for:
     - Code implementation (specific files and functions)
     - Test creation/updates (specific test files and test cases)
     - Documentation updates (specific sections and files)
     - Release notes (draft the entry)
     - README roadmap update (if new feature, draft the entry)

3. **Present the plan to the user**:
   - **CRITICAL: You MUST stop here and present the complete plan**
   - Show a clear, formatted plan including:
     - Summary of the issue and what needs to be done
     - List of files to be created/modified
     - Overview of code changes needed
     - Test strategy and test cases
     - Documentation updates planned
     - Draft release notes entry
     - Draft roadmap entry (if new feature)
   - **Wait for user approval before proceeding to Step 3**
   - Use language like: "Here's my plan. Please review and let me know if you'd like me to proceed with implementation."

### Step 3: Implement the Solution (ONLY AFTER USER APPROVAL)

**DO NOT proceed to this step until the user has reviewed and approved the plan from Step 2.**

1. **Code changes**:
   - Follow TypeScript best practices
   - Match the existing code style (check `.prettierrc` for formatting)
   - Ensure type safety (check `tsconfig.json`)
   - Follow the project's file structure conventions

2. **Key areas to consider**:
   - `src/cards/` - Card implementations
   - `src/delegates/` - Business logic and data retrieval
   - `src/html/` - HTML rendering components
   - `src/hass/` - Home Assistant integration code
   - `src/common/` - Shared utilities
   - `src/types/` - TypeScript type definitions

### Step 4: Write Tests

1. **Test coverage**:
   - **PREFER updating existing tests** over creating many new test cases
   - When possible, add assertions to existing tests that already cover similar functionality
   - Create or update test files in `test/` directory matching the source structure
   - Follow existing test patterns (check `test/` directory for examples)
   - Use Mocha test framework (check `.mocharc.json` and `mocha.setup.ts`)

2. **Test requirements**:
   - **Keep tests concise**: Aim for 1-2 focused test cases, or update existing tests to cover multiple scenarios
   - Unit tests for new functions and methods
   - Edge case testing (when necessary, but consolidate into existing tests when possible)
   - Integration tests if applicable
   - Ensure tests pass: `yarn test` or `npm test`

3. **Test file naming**:
   - Test files should match source files with `.spec.ts` extension
   - Example: `src/cards/device-card/card.ts` → `test/cards/device-card/card.spec.ts`

4. **Test consolidation strategy**:
   - **Reuse existing setup/mocks**: Before creating new test cases, check if existing tests already have similar mocks, stubs, or setup code that can be reused
   - Review existing tests to see if new functionality can be tested alongside existing assertions
   - Update existing test data/mocks to include new scenarios rather than creating separate tests
   - Only create new test cases when the functionality is truly distinct and cannot be tested within existing tests
   - **Avoid duplicating setup code**: If multiple tests need similar mocks or stubs, consider:
     - Adding shared setup to `beforeEach` hooks
     - Extending existing mock data structures
     - Creating helper functions for common test setup

5. **Test quality review**:
   - **Review the entire test file** after making changes to ensure:
     - No duplicative tests that test the same thing in slightly different ways
     - No low-value tests that don't add meaningful coverage
     - Tests are well-organized and follow the existing patterns
     - Setup code is not unnecessarily duplicated across tests
   - If you notice duplicative or low-value tests while working, consider removing or consolidating them
   - Focus on tests that provide real value: catching bugs, ensuring correctness, and documenting expected behavior

### Step 5: Update Documentation

1. **README.md updates**:
   - If adding a new feature, add it to the "Features" section
   - Update "Configuration Options" table if adding new config options
   - Add example configurations in "Example Configurations" section
   - Update the "Project Roadmap" section (see Step 7)

2. **Code comments**:
   - Add JSDoc comments for public functions and classes
   - Document complex logic and algorithms
   - Explain non-obvious decisions

3. **Translation files** (if adding user-facing strings):
   - Update `src/translations/en.json` (English)
   - Consider updating other language files: `fr.json`, `pt.json`, `ru.json`
   - Follow the existing translation structure

### Step 6: Create/Update Release Notes

1. **Release notes format**:
   - Create or update a release notes file (check if one exists, otherwise create `RELEASE_NOTES.md` or similar)
   - Format entries clearly with issue/PR references

2. **Release notes structure**:
   - **Main header**: Release title with 2 random emojis at the end
   - **Each bug/feature**: Use `##` heading (level 2) for each bug fix or feature, starting with a relevant emoji
   - **Notes under each section**: Small descriptive notes under each heading

3. **Release notes content**:
   - **Bug fixes**: "Fixed [description] - fixes #[issue-number]"
   - **New features**: "Added [feature name] - thanks @[username] - fixes #[issue-number]"
   - **Enhancements**: "Improved [description] - fixes #[issue-number]"
   - **Breaking changes**: Clearly mark with "⚠️ BREAKING CHANGE:" prefix

4. **Example format**:

   ```markdown
   # Hidden Entity Filtering & Dark Mode!🎉✨

   ## 🔍 Hidden Entity Filtering

   Hidden entities are now automatically filtered out from device cards, matching Home Assistant's more-info popup behavior - thanks @warmfire540 - fixes #43

   ## 🌙 Dark Mode Support

   Added dark mode theme option for better visibility in low-light environments - thanks @username - fixes #123
   ```

5. **Home Assistant user-friendly language**:
   - Write in clear, non-technical language
   - Focus on what users can do or what problems are solved
   - Avoid internal implementation details
   - Use Home Assistant terminology where appropriate

### Step 7: Update README Roadmap (for New Features)

1. **Check if it's a new feature**:
   - If the issue is a feature request or adds new functionality
   - If it's a bug fix, skip this step

2. **Add to roadmap**:
   - Locate the "Project Roadmap" section in README.md
   - Add a new entry in the format:
     ```markdown
     - [ ] **`Feature Name`**: Description of feature - thanks @[username]
     ```
   - Use present tense for completed features (change `[ ]` to `[x]` after implementation)
   - Use future tense for planned features

3. **Thank the contributor**:
   - If the issue was opened by a GitHub user, include their username
   - Format: `- thanks @[username]`
   - If multiple contributors, list them all

### Step 8: Final Checklist

Before completing, verify:

- [ ] All code changes are implemented
- [ ] All tests are written and passing
- [ ] **Test quality**: Reviewed test files for duplicative or low-value tests that could be removed
- [ ] **Test reuse**: Confirmed that existing test setup/mocks were reused where possible
- [ ] Documentation is updated (README.md, code comments)
- [ ] Release notes are created/updated
- [ ] README roadmap is updated (if new feature)
- [ ] Code follows project style guidelines
- [ ] TypeScript types are correct
- [ ] No linter errors
- [ ] Translation files updated (if needed)

### Step 9: Summary

Provide a summary of:

- What was implemented
- Files created/modified
- Test coverage added
- Documentation updates
- Release notes entry
- Roadmap update (if applicable)

## Notes

- **CRITICAL**: This skill operates in PLAN MODE - always present the plan first and wait for user approval
- Never implement code changes without showing the plan and getting user confirmation
- Always maintain consistency with existing code patterns
- Follow the project's TypeScript and testing conventions
- Ensure backward compatibility unless it's a breaking change
- Consider Home Assistant version compatibility
- Test with multiple browsers if UI changes are involved
- Keep release notes user-friendly and focused on user benefits

## Plan Presentation Format

When presenting the plan, use this structure:

````markdown
## Plan for Issue #[number]: [Title]

### Issue Summary

[Brief summary of what needs to be done]

### Files to Create/Modify

- `path/to/file1.ts` - [what will change]
- `path/to/file2.ts` - [what will change]
- ...

### Implementation Approach

[High-level description of how you'll implement the solution]

### Test Strategy

- Test file: `test/path/to/file1.spec.ts`
  - **Prefer updating existing tests** rather than creating many new test cases
  - **Reuse existing setup/mocks**: [describe what existing mocks or setup will be reused]
  - If updating existing test: [which test and what will be added]
  - If new test needed: [brief description of why and what it covers, and how it reuses existing setup]
  - Aim for 1-2 focused test cases total
  - **Review test file**: Check for any duplicative or low-value tests that could be removed or consolidated

### Documentation Updates

- README.md: [what sections will be updated]
- Code comments: [what will be documented]
- Translations: [if applicable]

### Release Notes Draft

```markdown
## [Emoji] [Feature/Bug Name]

Brief description, yaml example, doc links, etc.
```
````

### Roadmap Entry Draft (if new feature)

[Draft of the roadmap entry]

---

**Ready to proceed?** Please review the plan above and let me know if you'd like me to continue with implementation.

```

## Example Workflow

1. User provides: "Solve issue #123: Add dark mode support"
2. Fetch issue details from GitHub
3. **PLAN MODE**: Create comprehensive plan:
   - Files to modify: `src/cards/device-card/styles.ts`, `src/cards/device-card/types.ts`, `src/cards/device-card/editor.ts`
   - Tests: Update existing test in `test/cards/device-card/card.spec.ts` to include dark mode scenarios (prefer updating over creating new tests)
   - Documentation: Update README.md Features section, add config option to table
   - Release notes draft: "## Dark Mode Support\n\nAdded dark mode theme option"
   - Roadmap draft: "- [ ] **`Dark mode support`**: Add dark mode theme option - thanks @username"
4. **PRESENT PLAN TO USER** - Wait for approval
5. **ONLY AFTER APPROVAL**: Implement code changes
6. **ONLY AFTER APPROVAL**: Create/update test files
7. **ONLY AFTER APPROVAL**: Update documentation
8. **ONLY AFTER APPROVAL**: Create/update release notes
9. **ONLY AFTER APPROVAL**: Update roadmap
10. Summary: List all changes made
```
