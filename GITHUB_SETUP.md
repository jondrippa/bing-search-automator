# GitHub Setup Guide

This guide explains how to push the Bing Rewards Automator project to GitHub and set up continuous integration.

## Prerequisites

- GitHub account
- Git installed locally
- SSH key configured (optional but recommended)

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository" or use [this link](https://github.com/new)
3. Fill in repository details:
   - **Repository name**: `bing-rewards-automator`
   - **Description**: "A powerful React Native mobile app that automates and optimizes your Bing Rewards earnings"
   - **Visibility**: Public (for open source) or Private (for personal use)
   - **Initialize repository**: Leave unchecked (we'll push existing code)

4. Click "Create repository"

## Step 2: Push Code to GitHub

### Using HTTPS (Easier)

```bash
cd /home/ubuntu/bing-rewards-mobile

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/bing-rewards-automator.git

# Rename branch to main if needed
git branch -M main

# Push code
git push -u origin main
```

### Using SSH (More Secure)

```bash
cd /home/ubuntu/bing-rewards-mobile

# Add GitHub as remote
git remote add origin git@github.com:YOUR_USERNAME/bing-rewards-automator.git

# Rename branch to main if needed
git branch -M main

# Push code
git push -u origin main
```

## Step 3: Configure Repository Settings

### Add Topics

1. Go to your repository on GitHub
2. Click "Settings" → "Options"
3. Under "About", add topics:
   - `bing-rewards`
   - `automation`
   - `react-native`
   - `expo`
   - `mobile-app`

### Enable Features

1. **Discussions**: Enable for community support
2. **Wiki**: Enable for documentation
3. **Issues**: Enable for bug tracking
4. **Projects**: Enable for project management

### Add Branch Protection

1. Go to "Settings" → "Branches"
2. Click "Add rule"
3. Set branch name pattern: `main`
4. Enable:
   - "Require pull request reviews before merging"
   - "Require status checks to pass before merging"
   - "Require branches to be up to date before merging"

## Step 4: Create GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm check
      
      - name: Lint
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
```

## Step 5: Add License

Create `LICENSE` file with MIT License:

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Step 6: Create .gitignore

Ensure `.gitignore` includes:

```
# Dependencies
node_modules/
.pnpm-debug.log*

# Environment
.env
.env.local
.env.*.local

# Expo
.expo/
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Build
dist/
build/
```

## Step 7: Create Contributing Guide

Create `CONTRIBUTING.md`:

```markdown
# Contributing to Bing Rewards Automator

We welcome contributions! Here's how to get started:

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/bing-rewards-automator.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feature/my-feature`
5. Start development: `pnpm dev`

## Making Changes

1. Make your changes
2. Write tests for new features
3. Run tests: `pnpm test`
4. Type check: `pnpm check`
5. Format code: `pnpm format`

## Submitting Changes

1. Commit your changes: `git commit -m "feat: add my feature"`
2. Push to your fork: `git push origin feature/my-feature`
3. Open a pull request on GitHub
4. Describe your changes clearly
5. Link related issues

## Code Style

- Use TypeScript
- Follow existing patterns
- Write tests for new features
- Use Tailwind for styling
- Keep components small and focused

## Reporting Issues

- Check if issue already exists
- Provide clear description
- Include steps to reproduce
- Attach screenshots if applicable
- Include device and OS info

Thank you for contributing!
```

## Step 8: Create Release Notes

Create `CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-07-09

### Added
- Initial release
- UI/UX redesign for accessibility
- Real data fetching integration
- Microsoft OAuth authentication
- Push notifications system
- Advanced analytics dashboard
- Background sync functionality
- Comprehensive documentation

### Features
- Automated Bing searches
- Quiz and survey automation
- Real-time analytics
- Opportunity tracking
- Account health monitoring
- Dark/light theme support
- Loading states and error handling
- Responsive design

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/).
```

## Step 9: Update README for GitHub

Add GitHub-specific sections to README.md:

```markdown
## 🌟 Features at a Glance

- ✅ Automated Bing searches with safety features
- 📊 Real-time analytics dashboard
- 🔔 Push notifications for opportunities
- 🔐 Secure Microsoft OAuth integration
- 📱 Cross-platform (iOS, Android, Web)
- ♿ Accessible design for all ages
- 🌙 Dark/light theme support

## 📦 Quick Links

- [GitHub Repository](https://github.com/yourusername/bing-rewards-automator)
- [Issues & Bug Reports](https://github.com/yourusername/bing-rewards-automator/issues)
- [Discussions & Q&A](https://github.com/yourusername/bing-rewards-automator/discussions)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.
```

## Step 10: Verify Everything

```bash
# Check git status
git status

# View remote
git remote -v

# Check recent commits
git log --oneline -5

# Verify all files are tracked
git ls-files
```

## Troubleshooting

### Remote Already Exists

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/bing-rewards-automator.git
```

### Authentication Failed

- For HTTPS: Use Personal Access Token instead of password
- For SSH: Verify SSH key is added to GitHub account

### Large Files

If you get "File too large" error:
- Remove large files from git history
- Use Git LFS for large files
- Commit smaller changes

## Next Steps

1. **Set up CI/CD**: GitHub Actions automatically tests your code
2. **Create releases**: Tag versions and create releases on GitHub
3. **Enable discussions**: Allow community to ask questions
4. **Promote project**: Share on social media and dev communities
5. **Gather feedback**: Listen to user issues and suggestions

## Resources

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Actions](https://github.com/features/actions)
- [GitHub Pages](https://pages.github.com)

---

Your project is now ready for GitHub! 🚀
