import { mlClientService } from './mlClient.service.js';
import { prisma } from '../lib/prisma.js';

export const modelService = {
  async getMlInfo() {
    return mlClientService.modelInfo();
  },

  async getMlHealth() {
    return mlClientService.health();
  },

  async getTrainingRuns() {
    return prisma.modelTrainingRun.findMany({
      orderBy: { trainingDate: 'desc' },
    });
  },

  async getLatestTrainingRun() {
    return prisma.modelTrainingRun.findFirst({
      orderBy: { trainingDate: 'desc' },
    });
  },

  // Kicks off training on the ML service and returns immediately — the ML
  // service runs the pipeline as a background task, since it takes longer
  // than any reverse proxy (Render included) will hold an HTTP connection
  // open. Poll getTrainStatus() for progress/completion.
  async retrain() {
    return mlClientService.train();
  },

  async getTrainStatus() {
    const result = await mlClientService.trainStatus();

    if (result.status === 'done' && result.modelVersion && result.algorithm) {
      const metrics = result.metrics ?? {};
      await prisma.modelTrainingRun.upsert({
        where: { modelVersion: result.modelVersion },
        create: {
          modelVersion: result.modelVersion,
          algorithm: result.algorithm,
          datasetSize: 0,
          accuracy: metrics.accuracy ?? 0,
          precision: metrics.precision ?? 0,
          recall: metrics.recall ?? 0,
          f1Score: metrics.f1 ?? 0,
          rocAuc: metrics.roc_auc ?? null,
          notes: 'Ručno pokrenuto ponovno treniranje iz admin panela.',
        },
        update: {
          algorithm: result.algorithm,
          trainingDate: new Date(),
          accuracy: metrics.accuracy ?? 0,
          precision: metrics.precision ?? 0,
          recall: metrics.recall ?? 0,
          f1Score: metrics.f1 ?? 0,
          rocAuc: metrics.roc_auc ?? null,
          notes: 'Ručno pokrenuto ponovno treniranje iz admin panela.',
        },
      });
    }

    return result;
  },
};
