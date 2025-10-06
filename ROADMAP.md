# Roadmap

**Major upcoming milestones:**
- [ ] Automated deployment workflow (CI/CD)
- [ ] Add API documentation (Swagger UI endpoints with usage samples)
- [ ] Accessibility improvements for UI (keyboard, contrast, ARIA labels)
- [ ] Internationalization (i18n) support
- [ ] Add unit and integration test coverage badges
- [ ] Multi-user authentication and roles

**Future ideas:**
- Pluggable analytics provider (support Matomo, Amplitude as well as PostHog)
- Export/import settings for user profiles
- Desktop packaging (Electron or Tauri option)
- Community translations

**How to contribute to roadmap:**
- Open a Discussion or Issue to suggest roadmap features.
- Upvote existing roadmap items to help prioritize!

***

**Sample “good first issue” and “help wanted” to open in Issues:**

1. **good first issue: Fix typo in README or docstring**
   - There’s a minor typo or formatting error. Find and correct it in README.md or a code docstring.

2. **good first issue: Add basic backend test for /health endpoint**
   - Write a test in backend_test.py to call the /health API route, check HTTP 200 and expected JSON response.

3. **good first issue: Add screenshot to README**
   - Take a screenshot or make a GIF of the main frontend UI, add to README.md with a relevant caption.

4. **help wanted: Create a script to lint frontend codebase**
   - Add or fix ESLint and/or Prettier config, ensure yarn lint works and passes on CI.

5. **help wanted: Accessibility audit**
   - Check frontend for keyboard accessibility and run aXe or Lighthouse. File follow-up Issues for specific fixes.

Use these as templates: Open a new Issue on your repo, paste the description, and apply the “good first issue” or “help wanted” label.
