# CaseWorkAIAuto

WebdriverIO e2e test suite for [CaseWork](https://app.thecasework.com). Uses Mocha, ESModules, and the Page Object Model pattern.

## Run tests

```bash
npm run wdio
```

## Project structure

```
test/
├── helpers/auth.js          # Session token caching — runs before all tests via wdio.conf.js
├── pageobjects/
│   ├── base.js              # Base class — provides navigateTo(path)
│   ├── login.js             # Login form
│   ├── dashboard.js         # Dashboard nav verification
│   ├── newCase.js           # New case form — also holds all test data getters
│   ├── cases.js             # Cases list page — delete flows
│   └── clients.js           # Clients/parties — ensureClientExists()
└── specs/
    ├── newCaseTest.js       # Form validation & UI tests (21 tests)
    ├── createCaseTest.js    # Case submission tests (4 tests)
    └── deleteCaseTest.js    # Case deletion tests (2 tests)
```

`.env` — `TEST_EMAIL` / `TEST_PASSWORD` credentials
`.auth-tokens.json` — cached session tokens (auto-generated; delete to force re-login)

## Language and style

- **JavaScript** (ESModules — `import`/`export`, no CommonJS `require`)
- **No semicolons**
- **4-space indentation**
- **camelCase** for variables, methods, and file names (`newCase.js`, `deleteAllByName`)
- **PascalCase** for classes (`Base`, `NewCase`, `Cases`)
- **async/await** for all asynchronous code — no raw Promises or `.then()` chains
- **Arrow functions** for callbacks and inline functions
- Prefer `const` over `let`; never use `var`

## Conventions

- All page objects extend `Base` and export a singleton: `export default new ClassName()`
- Selectors are always getters defined in page objects — never strings in spec files
- Spec files contain only `describe`/`it`/`before`/`beforeEach`/`afterEach` blocks — no helper functions, no `const`/`let` declarations outside test scope, no logic
- All test data is stored as getters on the relevant page object, prefixed with `AUTOTEST`
- Each test includes a Jira comment: `// MTQA-XXXX — description`
- No `browser.pause()` or arbitrary sleeps — always use `waitForDisplayed`, `waitForExist`, or `waitUntil`
- No wdio boilerplate names (`inputUsername`, `btnSubmit`, `ensureLoggedIn`, etc.)

## Selector priority

1. `data-testid` attributes (preferred)
2. ARIA roles: `[role="option"]`, `[role="row"]`, `[role="dialog"]`
3. Semantic CSS: `input[name="username"]`
4. Text matching: `button=Yes`
5. Scoped selectors when `data-testid` values are duplicated: `$('[data-testid="parent-card"] [data-testid="link-button-"]')`

## Known UI quirks

**React inputs** — `setValue()` does not trigger React synthetic events on the case name field. Use `fillCaseName()` which types character-by-character via W3C Key Actions.

**Hidden delete button** — The hover-reveal Delete button sits behind a gridcell overlay that blocks WebDriver's hit-test. Use `clickHiddenDeleteBtn()` which calls `btn.click()` via `browser.execute()` to bypass it.

**Post-delete toast** — After confirming deletion, a toast briefly displays the case name. `waitForCaseGone()` navigates to `/cases` first to get a fresh page load before asserting the case is gone.

**Three-dot menu** — Always visible, so W3C `pointerClick()` works. The hidden Delete button requires the JS approach above.

## Cleanup pattern

- `before` hooks call `Cases.deleteAllByName()` to remove AUTOTEST duplicates left by prior runs
- `afterEach` hooks delete any case created during that test; wrapped in `.catch(() => {})` to prevent cascade failures
