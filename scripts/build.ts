import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { env } from '../utils/env';

interface BuildOptions {
  analyze?: boolean;
  production?: boolean;
}

async function build(options: BuildOptions = {}) {
  const {
    analyze = false,
    production = env.NODE_ENV === 'production',
  } = options;

  console.info(
    `Starting ${production ? 'production' : 'development'} build...`
  );

  // Set environment variables for build
  const buildEnv = {
    ...process.env,
    NODE_ENV: production ? ('production' as const) : ('development' as const),
    ANALYZE: analyze ? 'true' : 'false',
  };

  const result = spawnSync('next', ['build'], {
    stdio: 'inherit',
    shell: true,
    env: buildEnv,
  });

  if (result.error) {
    console.error('Build failed with error:', result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Build failed with exit code: ${result.status}`);
    process.exit(1);
  }

  console.info('Build completed successfully');

  if (production) {
    // Create _headers file with security headers
    const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.telegram.org; frame-src 'self' https://telegram.org;
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
`;

    writeFileSync(join(process.cwd(), 'out', '_headers'), headers);
    console.info('Security headers configured for production');
  }
}

// Run build if called directly
if (require.main === module) {
  build().catch(console.error);
}

export default build;
