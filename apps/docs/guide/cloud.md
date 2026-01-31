# Cloud Features

**Team environments in the cloud. Perfect consistency, zero hassle.**

---

## **🌟 Why Cloud Features Matter**

Remember these problems?

- New developer spends Day 1 setting up their environment
- "Works on my machine" bugs in production
- Different team members have slightly different tool versions
- Onboarding takes forever
- CI/CD environments don't match local development

**Genesis Cloud fixes all of this.**

---

## **🚀 Getting Started with Cloud**

### Login to Genesis Cloud

```bash
# Login with OAuth (opens browser)
genesis login

# Or use an API token
genesis login --token your-api-token

# Or specify a custom cloud endpoint
genesis login --url https://cloud.mycompany.com
```

### First Time Setup

```bash
# After login, Genesis creates a local profile
genesis login

# Output:
# ✅ Successfully logged in as user@company.com
# 📁 Profile saved to ~/.genesis/profile.json
# 🔗 Connected to Genesis Cloud at https://cloud.genesis-docs.vercel.app
```

---

## **📋 Managing Environments**

### List All Your Environments

```bash
# List both local and cloud environments
genesis list

# List only cloud environments
genesis list --cloud

# List only local environments
genesis list --local

# Output in JSON format
genesis list --format json
```

**Sample Output:**

```
🌐 Cloud Environments:
  - production-prod-123 (Production setup)
    Description: Production environment with Node.js 20, PostgreSQL, Redis
    Created: 2024-01-15 by devops@company.com
    Updated: 2024-01-20 by devops@company.com

  - staging-stage-456 (Staging setup)
    Description: Staging environment mirrors production
    Created: 2024-01-10 by devops@company.com
    Updated: 2024-01-19 by devops@company.com

  - dev-dev-789 (Development setup)
    Description: Development environment with latest tools
    Created: 2024-01-05 by devops@company.com
    Updated: 2024-01-18 by devops@company.com

🏠 Local Environments:
  - current (./genesis.config.yaml)
    Description: Local development environment
    Last applied: 2024-01-20 14:30:25

  - experiment (./experiment.config.yaml)
    Description: Experimental configuration
    Last applied: 2024-01-19 10:15:42
```

### Environment Details

```bash
# Get detailed information about a cloud environment
genesis show production-prod-123

# Output:
# 📦 Environment: production-prod-123
# 📝 Description: Production setup
# 👤 Created by: devops@company.com
# 📅 Created: 2024-01-15 10:30:00
# 🔄 Updated: 2024-01-20 15:45:22
#
# 🛠️ Tools:
#   - Node.js v20.10.0 (via NVM)
#   - Python v3.11.5 (via pyenv)
#   - Docker v24.0.7
#   - Git v2.43.0
#
# 📁 Repositories:
#   - https://github.com/company/backend (branch: main)
#   - https://github.com/company/frontend (branch: main)
#
# 🔧 Environment Variables:
#   - NODE_ENV=production
#   - API_URL=https://api.company.com
#   - DATABASE_URL=postgresql://prod-db:5432/app
```

---

## **⚡ Applying Cloud Environments**

### Apply a Cloud Environment

```bash
# Apply a cloud environment by ID
genesis apply production-prod-123

# Apply with verbose output
genesis apply production-prod-123 --verbose

# Dry run to see what would change
genesis apply production-prod-123 --dry-run
```

**What happens when you apply a cloud environment:**

1. **Download** - Genesis downloads the environment configuration
2. **Validate** - Checks compatibility with your system
3. **Plan** - Shows what will be installed/changed
4. **Apply** - Installs tools, clones repos, sets up environment
5. **Validate** - Verifies everything works correctly

### Sample Apply Output

```
🌐 Applying Cloud Environment: production-prod-123

📥 Downloading environment configuration...
✓ Configuration downloaded successfully

🔍 Validating system compatibility...
✓ System is compatible

📋 Planning changes:
  📦 Tools to install:
    - Node.js v20.10.0 (via NVM)
    - Python v3.11.5 (via pyenv)
    - Docker v24.0.7
    - Git v2.43.0

  📁 Repositories to clone:
    - company/backend (main branch)
    - company/frontend (main branch)

  🔧 Environment variables to set:
    - NODE_ENV=production
    - API_URL=https://api.company.com

🚀 Applying changes...
Phase 1: Registering tasks...
  ✓ Node.js plugin registered system tasks
  ✓ Python plugin registered system tasks
  ✓ Docker plugin registered system tasks
  ✓ Git plugin registered system tasks

Phase 2: Executing system tasks...
  ✓ Updated package manager (deduplicated)
  ✓ Installed curl (deduplicated)
  ✓ Installed Git v2.43.0
  ✓ Installed Docker v24.0.7

Phase 3: Installing plugins...
  ✓ Node.js v20.10.0 installed via NVM
  ✓ Python v3.11.5 installed via pyenv
  ✓ Docker daemon started and configured
  ✓ Git configured with production settings

📁 Cloning repositories...
  ✓ Cloned company/backend to ./backend
  ✓ Cloned company/frontend to ./frontend

🔧 Setting up environment...
  ✓ Set NODE_ENV=production
  ✓ Set API_URL=https://api.company.com
  ✓ Updated shell configuration

✅ Environment setup complete!

🎯 Summary:
  ✓ 4 tools installed
  ✓ 2 repositories cloned
  ✓ 2 environment variables set
  ✓ 0 errors
```

---

## **🔄 Creating and Managing Cloud Environments**

### Create a New Cloud Environment

```bash
# Create from local configuration
genesis cloud create --name "my-project-dev" --description "Development setup for my project"

# Create from a specific config file
genesis cloud create --config ./production-config.yaml --name "production" --description "Production environment"

# Create with tags
genesis cloud create --name "frontend-team" --description "Frontend development setup" --tags frontend,react,nodejs
```

### Update an Existing Environment

```bash
# Update from local configuration
genesis cloud update production-prod-123

# Update with a new description
genesis cloud update production-prod-123 --description "Updated production setup"

# Add tags
genesis cloud update production-prod-123 --tags production,critical,main
```

### Delete an Environment

```bash
# Delete a cloud environment
genesis cloud delete production-prod-123

# Force delete (without confirmation)
genesis cloud delete production-prod-123 --force
```

---

## **👥 Team Collaboration**

### Share Environments with Team

```bash
# Share an environment with team members
genesis cloud share production-prod-123 --team developers

# Share with specific users
genesis cloud share production-prod-123 --users alice@company.com,bob@company.com

# Set permissions
genesis cloud share production-prod-123 --team developers --permissions read,apply

# Make public (anyone in organization can access)
genesis cloud share production-prod-123 --public
```

### List Shared Environments

```bash
# List environments shared with you
genesis cloud shared

# List environments you've shared
genesis cloud shared --mine

# List environments shared with your team
genesis cloud shared --team developers
```

### Environment History

```bash
# Show version history of an environment
genesis cloud history production-prod-123

# Revert to a previous version
genesis cloud revert production-prod-123 --version 5

# Compare versions
genesis cloud diff production-prod-123 --from 3 --to 5
```

---

## **🏢 Enterprise Features**

### Organization Management

```bash
# List organizations you belong to
genesis org list

# Switch to a different organization
genesis org switch my-company

# Create a new organization
genesis org create new-company --name "New Company Inc."
```

### Team Management

```bash
# List teams in your organization
genesis team list

# Create a new team
genesis team create frontend-devs --name "Frontend Developers"

# Add members to a team
genesis team add frontend-devs alice@company.com bob@company.com

# Remove members from a team
genesis team remove frontend-devs alice@company.com
```

### Access Control

```bash
# Set environment permissions
genesis cloud acl production-prod-123 --team developers --permissions read,apply
genesis cloud acl production-prod-123 --user devops@company.com --permissions read,write,delete

# List current permissions
genesis cloud acl production-prod-123 --list

# Remove permissions
genesis cloud acl production-prod-123 --team developers --remove
```

---

## **🔧 Advanced Cloud Features**

### Environment Templates

```bash
# Create a template from an environment
genesis cloud template create production-prod-123 --name "nodejs-production" --description "Node.js production template"

# List available templates
genesis cloud template list

# Create environment from template
genesis cloud create --template nodejs-production --name "my-project-prod"
```

### Environment Variables and Secrets

```bash
# Set environment variables
genesis cloud env production-prod-123 set DATABASE_URL=postgresql://prod-db:5432/app
genesis cloud env production-prod-123 set API_KEY=secret123 --secret

# List environment variables
genesis cloud env production-prod-123 list

# Remove environment variables
genesis cloud env production-prod-123 remove API_KEY
```

### Environment Validation

```bash
# Validate an environment configuration
genesis cloud validate production-prod-123

# Validate against specific platform
genesis cloud validate production-prod-123 --platform linux

# Validate with strict mode
genesis cloud validate production-prod-123 --strict
```

---

## **📊 Monitoring and Analytics**

### Environment Usage Statistics

```bash
# Show usage statistics
genesis cloud stats

# Show statistics for specific environment
genesis cloud stats production-prod-123

# Show team usage
genesis cloud stats --team developers
```

### Audit Logs

```bash
# Show audit log for an environment
genesis cloud audit production-prod-123

# Show audit log for organization
genesis cloud audit --org my-company

# Filter by date range
genesis cloud audit production-prod-123 --from 2024-01-01 --to 2024-01-31
```

---

## **🔒 Security**

### API Keys and Tokens

```bash
# Generate a new API token
genesis cloud token create --name "CI/CD Token" --permissions read,apply

# List active tokens
genesis cloud token list

# Revoke a token
genesis cloud token revoke token-id-123
```

### Two-Factor Authentication

```bash
# Enable 2FA
genesis cloud 2fa enable

# Disable 2FA
genesis cloud 2fa disable

# Generate backup codes
genesis cloud 2fa backup-codes
```

---

## **🚀 Best Practices**

### Environment Naming

```bash
# Use consistent naming conventions
production-prod-123    # environment-type-identifier
staging-stage-456      # environment-type-identifier
dev-dev-789           # environment-type-identifier

# Include version or date
frontend-v1.0.0
backend-2024-01-15
```

### Environment Organization

```bash
# Use tags for categorization
genesis cloud create --name "api-prod" --tags api,production,v1
genesis cloud create --name "web-prod" --tags web,production,v1
genesis cloud create --name "api-staging" --tags api,staging,v1
```

### Team Workflows

```bash
# 1. DevOps creates production environment
genesis cloud create --config ./prod-config.yaml --name "production-v1" --tags production

# 2. Shares with development team
genesis cloud share production-v1 --team developers --permissions read

# 3. Developers apply locally for testing
genesis apply production-v1 --dry-run

# 4. Apply in CI/CD pipeline
genesis apply production-v1
```

---

## **🤝 Need Help?**

- **Cloud Documentation**: [Full Cloud Docs](https://cloud.genesis-docs.vercel.app/docs)
- **API Reference**: [Cloud API](https://cloud.genesis-docs.vercel.app/api)
- **Issues**: [GitHub Issues](https://github.com/your-org/genesis/issues)
- **Support**: [Cloud Support](https://cloud.genesis-docs.vercel.app/support)

---

**Ready to transform your team's development environment consistency?** 🚀

Start with `genesis login` and experience the power of cloud-based environment management.
