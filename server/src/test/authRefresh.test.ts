import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/refreshToken.repository.js', () => ({
  refreshTokenRepository: {
    findByToken: vi.fn(),
    deleteByToken: vi.fn(),
    markUsed: vi.fn(),
    deleteByUserId: vi.fn(),
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

const baseUser = {
  id: 1,
  email: 'test@example.com',
  role: 'ORGANIZER' as const,
  status: 'ACTIVE' as const,
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('authService.refresh — reuse detection grace window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('issues fresh tokens without wiping sessions when the same token is reused within the grace window', async () => {
    const { refreshTokenRepository } = await import('../repositories/refreshToken.repository.js');
    const { authService } = await import('../services/auth.service.js');

    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      token: 'tok-1',
      userId: 1,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(Date.now() - 2_000), // used 2s ago — inside the 10s grace window
      createdAt: new Date(),
      user: baseUser,
    } as never);

    const result = await authService.refresh('tok-1');

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(refreshTokenRepository.deleteByUserId).not.toHaveBeenCalled();
    expect(refreshTokenRepository.markUsed).not.toHaveBeenCalled();
  });

  it('wipes every session and throws when the same token is reused outside the grace window', async () => {
    const { refreshTokenRepository } = await import('../repositories/refreshToken.repository.js');
    const { authService } = await import('../services/auth.service.js');

    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      token: 'tok-2',
      userId: 1,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(Date.now() - 20_000), // used 20s ago — past the 10s grace window
      createdAt: new Date(),
      user: baseUser,
    } as never);

    await expect(authService.refresh('tok-2')).rejects.toMatchObject({ statusCode: 401 });
    expect(refreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(1);
  });

  it('marks the token used and issues tokens on a normal, first-time refresh', async () => {
    const { refreshTokenRepository } = await import('../repositories/refreshToken.repository.js');
    const { authService } = await import('../services/auth.service.js');

    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      token: 'tok-3',
      userId: 1,
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      createdAt: new Date(),
      user: baseUser,
    } as never);

    const result = await authService.refresh('tok-3');

    expect(result.accessToken).toBeTruthy();
    expect(refreshTokenRepository.markUsed).toHaveBeenCalledWith('tok-3');
    expect(refreshTokenRepository.deleteByUserId).not.toHaveBeenCalled();
  });

  it('rejects an expired token and deletes it', async () => {
    const { refreshTokenRepository } = await import('../repositories/refreshToken.repository.js');
    const { authService } = await import('../services/auth.service.js');

    vi.mocked(refreshTokenRepository.findByToken).mockResolvedValue({
      token: 'tok-4',
      userId: 1,
      expiresAt: new Date(Date.now() - 1_000),
      usedAt: null,
      createdAt: new Date(),
      user: baseUser,
    } as never);

    await expect(authService.refresh('tok-4')).rejects.toMatchObject({ statusCode: 401 });
    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith('tok-4');
  });
});
