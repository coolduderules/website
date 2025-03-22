# Environment Variables Setup

This document explains how environment variables are managed in this project, especially for GitHub deployments to Cloudflare Pages.

## Environment Variable Structure

The project uses a centralized approach for handling environment variables via the `utils/env.ts` file. This ensures:

1. Type safety with Zod validation
2. Proper handling in all environments (local, build time, runtime)
3. Security for sensitive information

## Available Environment Variables

| Variable | Type | Purpose | Access | Required |
|----------|------|---------|--------|----------|
| `TELEGRAM_BOT_TOKEN` | Secret | Telegram bot authentication | Server-only | Yes, for Telegram features |
| `TELEGRAM_BOT_NAME` | Secret | Telegram bot display name | Server-only | Yes, for Telegram features |
| `TELEGRAM_BOT_ID` | Secret | Telegram bot identifier | Server-only | Yes, for Telegram features |
| `TELEGRAM_CHANNEL_ID` | Secret | Target channel for messages | Server-only | Yes, for Telegram features |
| `REVIEW_CHANNEL` | Secret | Channel for review notifications | Server-only | Yes, for review features |
| `NEXT_PUBLIC_APP_URL` | Public | Application URL | Client+Server | No, defaults to empty |
| `NEXT_PUBLIC_TELEGRAM_BOT_ID` | Public | Public Telegram bot ID | Client+Server | No, defaults to empty |
| `NODE_ENV` | Public | Environment mode | Client+Server | No, defaults to 'development' |
| `CLOUDFLARE_API_TOKEN` | Secret | Cloudflare API authentication | Build time only | Yes, for deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare account identifier | Build time only | Yes, for deployment |
| `CF_PAGES_PROJECT_NAME` | Public | Cloudflare Pages project name | Build time only | Yes, for deployment |

## Setup in Different Environments

### Local Development

Create a `.env.local` file in the project root with your development variables:

```
NEXT_PUBLIC_APP_URL=your_app_url
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_NAME=YourBotName
TELEGRAM_BOT_ID=your_bot_id
REVIEW_CHANNEL=your_review_channel
NEXT_PUBLIC_TELEGRAM_BOT_ID=public_bot_id
CF_PAGES_PROJECT_NAME=your_project_name
```

⚠️ **IMPORTANT**: Never commit `.env.local` or any files containing sensitive tokens to your repository!

### GitHub Actions

All sensitive variables should be stored as GitHub Secrets, not directly in the workflow file. The workflow uses:

1. `${{ secrets.VARIABLE_NAME }}` for sensitive data
2. `${{ vars.VARIABLE_NAME }}` for non-sensitive configuration

### Cloudflare Pages

Configure environment variables in the Cloudflare Pages dashboard:
1. Go to "Settings" > "Environment variables"
2. Add the required variables as:
   - Production variables for the main branch
   - Preview variables for other environments

## Security Considerations

1. Never commit `.env` files to the repository
2. Only expose variables with the `NEXT_PUBLIC_` prefix to the client
3. Server-side code is the only place where sensitive variables should be accessed
4. The `env.ts` utility ensures variables are only available where appropriate

## Adding New Environment Variables

When adding new environment variables:

1. Add them to the schema in `utils/env.ts`
2. Add them to the GitHub workflow file in `.github/workflows/deploy.yml`
3. Add them to Cloudflare Pages environment variables if needed
4. Update this documentation