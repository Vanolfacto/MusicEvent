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
};
