#!/bin/bash

# OmniDev-v3 Security & Configuration Check
# Run this script to verify everything is properly configured

set -e

echo "🔍 OmniDev-v3 Configuration & Security Check"
echo "==========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
}

# Check 1: .env files not in git
echo "📁 Checking for sensitive files in git..."
if git ls-files | grep -E "^app/\.env\.local$\|^\.env\.local$" > /dev/null; then
    fail ".env.local file is tracked by git! SECURITY RISK!"
    echo "   Run: git rm --cached app/.env.local"
    exit 1
else
    pass ".env files properly excluded from git"
fi

# Check 2: .gitignore exists and has proper entries
echo ""
echo "🔒 Checking .gitignore configuration..."
if [ -f ".gitignore" ]; then
    if grep -q "\.env\.local" .gitignore; then
        pass ".gitignore properly configured"
    else
        fail ".env.local not in .gitignore"
        exit 1
    fi
else
    fail ".gitignore file missing!"
    exit 1
fi

# Check 3: Lock files exist
echo ""
echo "📦 Checking dependency lock files..."
if [ -f "package-lock.json" ]; then
    pass "Root package-lock.json exists"
else
    warn "Root package-lock.json missing"
fi

if [ -f "app/package-lock.json" ]; then
    pass "App package-lock.json exists"
else
    fail "App package-lock.json missing"
    exit 1
fi

# Check 4: Environment variables configured
echo ""
echo "🔑 Checking environment configuration..."
if [ -f "app/.env.local" ]; then
    pass ".env.local file exists"

    # Check for required keys (without exposing values)
    REQUIRED_KEYS=("OPENAI_API_KEY" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")

    for key in "${REQUIRED_KEYS[@]}"; do
        if grep -q "^${key}=" app/.env.local; then
            pass "$key is configured"
        else
            warn "$key not found in .env.local"
        fi
    done
else
    warn ".env.local not found (optional for development)"
fi

# Check 5: Node modules not in git
echo ""
echo "📚 Checking node_modules..."
if git ls-files | grep "node_modules" > /dev/null; then
    fail "node_modules are tracked by git!"
    exit 1
else
    pass "node_modules properly excluded"
fi

# Check 6: Build directories not in git
echo ""
echo "🏗️  Checking build artifacts..."
if git ls-files | grep -E "\.next/|dist/" > /dev/null; then
    warn "Build artifacts found in git"
else
    pass "Build artifacts properly excluded"
fi

# Check 7: CI workflow configuration
echo ""
echo "⚙️  Checking CI configuration..."
if [ -f ".github/workflows/ci.yml" ]; then
    pass "CI workflow exists"

    if grep -q "cache-dependency-path" .github/workflows/ci.yml; then
        pass "CI cache paths configured"
    else
        warn "CI cache paths not configured"
    fi
else
    warn "CI workflow not found"
fi

# Check 8: Security headers in Next.js config
echo ""
echo "🛡️  Checking security headers..."
if [ -f "app/next.config.mjs" ]; then
    if grep -q "X-Frame-Options" app/next.config.mjs; then
        pass "Security headers configured"
    else
        warn "Security headers not found in next.config.mjs"
    fi
else
    fail "next.config.mjs not found"
fi

# Check 9: API key validation
echo ""
echo "🔐 Checking API key validation..."
if [ -f "app/app/lib/env.ts" ]; then
    if grep -q "isProviderConfigured" app/app/lib/env.ts; then
        pass "Environment validation utilities exist"
    else
        warn "Environment validation not found"
    fi
else
    warn "env.ts validation file not found"
fi

# Check 10: Try to build the app
echo ""
echo "🔨 Testing build process..."
cd app
if npm run build > /dev/null 2>&1; then
    pass "Build successful"
else
    fail "Build failed! Run 'npm run build' in the app directory for details"
    exit 1
fi
cd ..

# Summary
echo ""
echo "==========================================="
echo "✅ Configuration check complete!"
echo ""
echo "📝 Recommendations:"
echo "   - Rotate API keys regularly"
echo "   - Keep dependencies updated"
echo "   - Review security headers periodically"
echo "   - Monitor CI/CD pipeline for failures"
echo ""
echo "🔗 Useful commands:"
echo "   npm audit              - Check for vulnerabilities"
echo "   npm outdated           - Check for outdated packages"
echo "   git secrets --scan     - Scan for exposed secrets"
echo ""
