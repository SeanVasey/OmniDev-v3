# OmniDev v3.0

Agentic, mobile-first multimodal chat workspace scaffold built with the VASEY/AI teal + charcoal palette and Qwen-inspired aspect ratio capsule selector.

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the dev server
   ```bash
   npm run dev
   ```

The project ships with haptic-aware UI primitives (composer, sidebar, model selector) and the design-token-rich `app/globals.css` for the updated color system.

## Testing & install troubleshooting

The repo uses only public packages from npmjs. If `npm install` fails with `E403`/`Forbidden` errors (common behind locked-down proxies), try the following sequence:

1) Point npm to the public registry and clear stale proxy settings
```bash
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm cache clean --force
```

2) If you must use an outbound proxy, set it explicitly before installing
```bash
npm config set proxy http://YOUR_PROXY:PORT
npm config set https-proxy http://YOUR_PROXY:PORT
```

3) Enforce the public registry via project-local `.npmrc` (already present) and retry with conservative settings
```bash
npm install --no-progress --fetch-retries=3 --registry=https://registry.npmjs.org/
```

4) If you still get `E403` on packages like `@radix-ui/react-avatar`, a corporate proxy is still blocking the request. Confirm your proxy rules (step 2) or ask your network admin for an allowlist entry to `https://registry.npmjs.org`. As a last resort, re-run the install with explicit proxy env vars:
```bash
HTTPS_PROXY=http://YOUR_PROXY:PORT \
HTTP_PROXY=http://YOUR_PROXY:PORT \
npm install --no-progress --fetch-retries=3 --registry=https://registry.npmjs.org/
```

Once dependencies install, you can validate the scaffold with
```bash
npm run lint
```
