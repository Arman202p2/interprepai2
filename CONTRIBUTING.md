# Contributing to interprepai2

Thank you for your interest in contributing!

How to get started
- Fork the repo and create your feature branch from main.
- Ensure you have the prerequisites installed:
  - Python 3.11+ (recommended)
  - Node 18+ and Yarn
  - Conda (optional) for Python envs
- Set up backend:
  - conda create -n interprepai_latest python=3.11
  - conda activate interprepai_latest
  - cd backend
  - pip install -r requirements.txt
  - cp .env.example .env  # fill values
  - uvicorn server:app --reload
- Set up frontend:
  - cd frontend
  - yarn install
  - cp .env.example .env  # fill values
  - yarn start

Branching and commits
- Branch names: feature/<short-name>, fix/<short-name>, docs/<short-name>
- Keep commits small and descriptive. Use imperative mood (e.g., “Add X,” “Fix Y”).

Coding standards
- Python: black, isort, ruff (or flake8). Type hints preferred.
- JS/TS: ESLint and Prettier.
- Run linters before pushing.

Tests
- Back end:
  - cd backend
  - pytest  # or python -m pytest
- Aim for tests on new logic and bug fixes.

Pull request checklist
- PR title: concise and descriptive.
- Include: what/why/how, screenshots/GIFs if UI.
- Confirm:
  - [ ] Code compiles locally and CI passes
  - [ ] Tests added/updated when applicable
  - [ ] Docs/README updated if behavior or config changed

Reporting issues
- Use the issue templates when possible.
- Provide steps to reproduce, expected vs actual behavior, and logs/screens.

Community
- Be respectful and follow the Code of Conduct.