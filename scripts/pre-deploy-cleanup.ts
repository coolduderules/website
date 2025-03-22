import fs from 'fs/promises';
import path from 'path';

interface CleanupResult {
  success: boolean;
  dir: string;
  error?: unknown;
  notFound?: boolean;
}

interface CleanupOptions {
  additionalDirs?: string[];
  strict?: boolean;
}

const DEFAULT_CLEANUP_DIRS = ['.next', 'out', 'coverage', '.wrangler'];

async function cleanDirectory(dir: string): Promise<CleanupResult> {
  try {
    const dirPath = path.resolve(process.cwd(), dir);

    try {
      await fs.access(dirPath);
    } catch {
      return { success: true, dir, notFound: true };
    }

    await fs.rm(dirPath, { recursive: true, force: true });
    return { success: true, dir };
  } catch (error) {
    return { success: false, dir, error };
  }
}

export async function cleanupBuildArtifacts(
  options: CleanupOptions = {}
): Promise<CleanupResult[]> {
  const dirsToClean = [
    ...DEFAULT_CLEANUP_DIRS,
    ...(options.additionalDirs || []),
  ];

  const results = await Promise.allSettled(
    dirsToClean.map(dir => cleanDirectory(dir))
  );

  const cleanupResults = results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    // Handle rejected promises
    return {
      success: false,
      dir: 'unknown',
      error: result.reason,
    };
  });

  const failures = cleanupResults.filter(r => !r.success && !r.notFound);

  if (failures.length > 0 && options.strict) {
    const errorMessages = failures
      .map(f => `Failed to clean ${f.dir}: ${f.error}`)
      .join('\n');
    throw new Error(`Cleanup failed:\n${errorMessages}`);
  }

  return cleanupResults;
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupBuildArtifacts().catch(console.error);
}

export default cleanupBuildArtifacts;
