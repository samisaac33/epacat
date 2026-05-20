import * as fs from 'fs/promises';
import * as path from 'path';
import type { EpacomExportResult, EpacomExporter, EpacomVisitaPayload } from './types';

export class StubEpacomExporter implements EpacomExporter {
  constructor(private readonly outboxPath: string) {}

  async exportApproved(visita: EpacomVisitaPayload): Promise<EpacomExportResult> {
    await fs.mkdir(this.outboxPath, { recursive: true });
    const filename = `epacom-${visita.visitaId}-${Date.now()}.json`;
    const outputPath = path.join(this.outboxPath, filename);
    await fs.writeFile(outputPath, JSON.stringify(visita, null, 2), 'utf-8');
    return { success: true, outputPath, format: 'json' };
  }
}
