# GitHub Pages Setup

This project is configured to automatically deploy to GitHub Pages.

## Automatic Deployment

The site is automatically deployed when you push to the `main` or `master` branch.

## Manual Deployment

You can also trigger a manual deployment from the GitHub Actions tab:
1. Go to your repository on GitHub
2. Click on "Actions"
3. Select "Deploy GitHub Pages"
4. Click "Run workflow"

## Viewing Your Site

Once deployed, your site will be available at:
```
https://seanvasey.github.io/OmniDev-v3/
```

## What Gets Deployed

The `public/` directory contains:
- `index.html` - Main provider showcase page
- `assets/icons/` - SVG icons for all 8 LLM providers
- `.nojekyll` - Ensures GitHub Pages serves assets correctly

## Enabling GitHub Pages

To enable GitHub Pages for this repository:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. Save the settings

The site will automatically deploy on the next push to main/master.

## Local Preview

To preview the site locally:
```bash
cd public
python3 -m http.server 8000
# Or use any static server
```

Then visit http://localhost:8000
