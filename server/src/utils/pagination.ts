export async function paginate<T>(
  page: number,
  limit: number,
  runners: {
    findMany: (args: { skip: number; take: number }) => Promise<T[]>;
    count: () => Promise<number>;
  },
): Promise<{ items: T[]; total: number; page: number; limit: number }> {
  const [items, total] = await Promise.all([
    runners.findMany({ skip: (page - 1) * limit, take: limit }),
    runners.count(),
  ]);
  return { items, total, page, limit };
}
