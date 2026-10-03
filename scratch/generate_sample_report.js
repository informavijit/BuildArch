import { AnalysisPipeline } from '../src/pipeline/orchestrator.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const fixturePath = path.join(__dirname, '../test/fixtures/multi-service-suite');
  const pipeline = new AnalysisPipeline();

  console.log('Running BuildArch analysis on multi-service-suite fixture...');
  const { archModel, htmlReport } = await pipeline.run({
    workspacePath: fixturePath,
    workspaceName: 'MultiServiceSuiteDemo',
    isAiMode: false,
  });

  const outputPath = path.join(__dirname, 'MultiServiceSuite-architecture.html');
  fs.writeFileSync(outputPath, htmlReport, 'utf-8');
  console.log('Sample HTML report successfully written to:', outputPath);

  const modelPath = path.join(__dirname, 'MultiServiceSuite-architecture.archmodel.json');
  fs.writeFileSync(modelPath, JSON.stringify(archModel, null, 2), 'utf-8');
  console.log('ArchModel JSON successfully written to:', modelPath);
}

main().catch(err => {
  console.error('Error generating sample report:', err);
  process.exit(1);
});
