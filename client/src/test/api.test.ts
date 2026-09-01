import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import { getErrorMessage } from '../lib/api';

describe('getErrorMessage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('vraća poruku iz API odgovora', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    const error = {
      response: { data: { message: 'Neispravan email' } },
      message: 'Request failed',
    };
    expect(getErrorMessage(error)).toBe('Neispravan email');
  });

  it('vraća generičku poruku za nepoznatu grešku', () => {
    expect(getErrorMessage('nepoznato')).toBe('Došlo je do greške');
  });
});
