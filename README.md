4WE2 2W`SX. 34# StiflingChip

A Cloudflare Pages application using React, TypeScript, and D1 database, with Telegram authentication.

## Key Features

- React with TypeScript
- Cloudflare Pages/Workers integration
- D1 database for data persistence
- Telegram authentication
- Error tracking and monitoring
- Rate limiting and security headers
- Comprehensive test coverage

## Getting Started

### Prerequisites

- Node.js >= 18
- Wrangler CLI
- Telegram Bot Token

### Environment Setup

1. Create `.dev.vars` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_NAME=your_bot_name
TELEGRAM_BOT_ID=your_bot_id
NEXT_PUBLIC_APP_URL=your_app_url
REVIEW_CHANNEL=your_review_channel
```

2. Initialize D1 database:

```bash
wrangler d1 create stiflingchip
wrangler d1 execute stiflingchip --file=./migrations/0000_initial.sql
```

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run pages:dev

# Type checking
npm run typecheck

# Run tests
npm run test
```

### Deployment

```bash
# Validate and deploy
npm run deploy
```

## Project Structure

- `/app` - Next.js pages and API routes
- `/components` - React components
- `/hooks` - Custom React hooks
- `/types` - TypeScript type definitions
- `/utils` - Utility functions
- `/migrations` - D1 database migrations
- `/__tests__` - Test files

## Error Handling

The application includes a comprehensive error tracking system:

- Client-side error boundary
- Error logging to D1 database
- Severity levels (low, medium, high, critical)
- Rate limiting on API endpoints
- Development mode detailed error reporting

## Security Features

- Telegram authentication validation
- Rate limiting on API endpoints
- Secure headers (CSP, CORS, etc.)
- Environment variable validation
- SQL injection prevention with prepared statements

## Testing

- Jest for unit and integration tests
- React Testing Library for component tests
- 100% type coverage
- Error tracking tests
- API endpoint tests

## Performance Optimizations

- Edge runtime optimization
- Bundle size minimization
- Code splitting
- Cached database queries
- Optimized image loading

## Database Schema

The D1 database includes tables for:

- Users (Telegram authentication data)
- Reviews (User reviews and ratings)
- Error logs (Application error tracking)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checks
5. Submit a pull request

## License

MIT License - see LICENSE file for details
