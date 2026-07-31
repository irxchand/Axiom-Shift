import fs from 'node:fs/promises';
import { BrowserFrameworkAdapter } from '../adapters/BrowserFrameworkAdapter.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class DocumentHandoffService {
    prismaClient;
    adapter;
    constructor(prismaClient = prisma, adapter = new BrowserFrameworkAdapter()) {
        this.prismaClient = prismaClient;
        this.adapter = adapter;
    }
    async processHandoff(handoffId) {
        const handoff = await this.prismaClient.documentHandoff.findUnique({
            where: { id: handoffId },
            include: { subject: { include: { sourceWorkspaces: true } } }
        });
        if (!handoff || !handoff.transientStagingUri) {
            throw new Error('Handoff target or staged file missing.');
        }
        const workspace = handoff.subject?.sourceWorkspaces[0];
        if (!workspace?.externalWorkspaceId) {
            throw new Error('No active Source Workspace linked to subject.');
        }
        await this.prismaClient.documentHandoff.update({
            where: { id: handoffId },
            data: { handoffStatus: 'UPLOADING' }
        });
        try {
            const result = await this.adapter.execute({
                action: 'UPLOAD_FILE',
                workspaceId: workspace.externalWorkspaceId,
                filePath: handoff.transientStagingUri
            });
            // Cleanup local staging file immediately after success
            await fs.unlink(handoff.transientStagingUri).catch(() => { });
            return await this.prismaClient.documentHandoff.update({
                where: { id: handoffId },
                data: {
                    handoffStatus: 'COMPLETED',
                    transientStagingUri: null, // Wipe local reference
                    externalWorkspaceSourceId: result.data?.sourceId
                }
            });
        }
        catch (error) {
            await this.prismaClient.documentHandoff.update({
                where: { id: handoffId },
                data: { handoffStatus: 'FAILED', metadata: { lastError: error.message } }
            });
            throw error;
        }
    }
    async cleanupExpiredStagedFiles() {
        const expired = await this.prismaClient.documentHandoff.findMany({
            where: {
                stagingExpiresAt: { lte: new Date() },
                transientStagingUri: { not: null }
            }
        });
        let cleanedCount = 0;
        for (const record of expired) {
            if (record.transientStagingUri) {
                await fs.unlink(record.transientStagingUri).catch(() => { });
            }
            await this.prismaClient.documentHandoff.update({
                where: { id: record.id },
                data: {
                    transientStagingUri: null,
                    handoffStatus: record.handoffStatus === 'QUEUED' ? 'EXPIRED' : record.handoffStatus
                }
            });
            cleanedCount++;
        }
        return cleanedCount;
    }
}
// Standalone function wrapper for job queues/workers
export async function processDocumentHandoff(handoffId) {
    const service = new DocumentHandoffService();
    return service.processHandoff(handoffId);
}
//# sourceMappingURL=documentHandoffService.js.map