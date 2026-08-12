import { calculateVerifiedScore } from './attempt-score';

describe('attempt score', () => {
  beforeEach(() => {
    delete process.env.MAX_VERIFIED_WPM;
  });

  it('scores only the characters typed during a timed partial run', () => {
    expect(calculateVerifiedScore('hello world', 'hallo', 30_000)).toEqual({
      wpm: 2,
      accuracy: 80,
    });
  });

  it('returns a zero score when no characters were typed', () => {
    expect(calculateVerifiedScore('hello world', '', 30_000)).toEqual({
      wpm: 0,
      accuracy: 0,
    });
  });
});
