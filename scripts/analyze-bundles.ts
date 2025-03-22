import { readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '..', '.next');
const MAX_BUNDLE_SIZE_KB = 500;

interface BuildManifest {
  pages: Record<string, string[]>;
}

interface BundleInfo {
  page: string;
  jsFiles: number;
  cssFiles: number;
  totalSizeKB: number;
  files: Array<{
    name: string;
    sizeKB: number;
  }>;
}

async function analyzeBundles() {
  try {
    // Analyze page-specific bundles
    const buildManifest = JSON.parse(
      readFileSync(join(BUILD_DIR, 'build-manifest.json'), 'utf8')
    ) as BuildManifest;

    const clientJsDir = join(BUILD_DIR, 'static', 'chunks');
    const entries = Object.entries(buildManifest.pages);

    const results: BundleInfo[] = [];
    let hasLargeBundle = false;

    // Analyze each page's bundles
    for (const [page, files] of entries) {
      const pageInfo: BundleInfo = {
        page,
        jsFiles: 0,
        cssFiles: 0,
        totalSizeKB: 0,
        files: [],
      };

      for (const file of files) {
        if (!file.endsWith('.js') && !file.endsWith('.css')) continue;

        const isJs = file.endsWith('.js');
        const fileName = file.split('/').pop();
        if (!fileName) continue;

        const filePath = join(clientJsDir, fileName);

        try {
          const stats = statSync(filePath);
          const sizeKB = stats.size / 1024;

          if (isJs) pageInfo.jsFiles++;
          else pageInfo.cssFiles++;

          pageInfo.totalSizeKB += sizeKB;
          pageInfo.files.push({
            name: file,
            sizeKB,
          });

          if (sizeKB > MAX_BUNDLE_SIZE_KB) {
            hasLargeBundle = true;
            console.warn(
              `⚠️  Large bundle detected: ${file} (${sizeKB.toFixed(2)} KB)`
            );
          }
        } catch (err) {
          console.warn(`Could not analyze file ${file}:`, err);
        }
      }

      results.push(pageInfo);
    }

    // Print analysis results
    console.info('\nBundle Analysis Results:');
    console.info('======================\n');

    results.forEach(({ page, jsFiles, cssFiles, totalSizeKB, files }) => {
      console.info(`📄 ${page}`);
      console.info(`   JS Files: ${jsFiles}, CSS Files: ${cssFiles}`);
      console.info(`   Total Size: ${totalSizeKB.toFixed(2)} KB\n`);

      files
        .sort((a, b) => b.sizeKB - a.sizeKB)
        .forEach(({ name, sizeKB }) => {
          const sizeIndicator = sizeKB > MAX_BUNDLE_SIZE_KB ? '🔴' : '🟢';
          console.info(`   ${sizeIndicator} ${name}: ${sizeKB.toFixed(2)} KB`);
        });
      console.info('');
    });

    if (hasLargeBundle) {
      console.warn(
        '\n⚠️  Some bundles exceed the recommended size limit of 500KB.'
      );
      console.warn(
        'Consider code splitting or optimizing imports in those pages.'
      );
      return false;
    }

    console.info('\n✅ All bundles are within size limits.');
    return true;
  } catch (error) {
    console.error('Failed to analyze bundles:', error);
    process.exit(1);
  }
}

// Run analysis if called directly
if (require.main === module) {
  analyzeBundles().catch(console.error);
}

export default analyzeBundles;
