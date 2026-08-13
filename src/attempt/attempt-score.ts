import { BadRequestException } from '@nestjs/common';
import { maxVerifiedWpm } from './attempt-policy';

export type VerifiedScore = {
  wpm: number;
  accuracy: number;
};

export function calculateVerifiedScore(
  challengeText: string,
  typedText: string,
  durationMs: number,
): VerifiedScore {
  const expectedCharacters = [...challengeText];
  const typedCharacters = [...typedText];
  const correctCharacters = typedCharacters.reduce(
    (total, character, index) =>
      total + (character === expectedCharacters[index] ? 1 : 0),
    0,
  );
  const minutes = Math.max(durationMs, 1000) / 60_000;
  const wpm = Math.round(correctCharacters / 5 / minutes);
  const accuracy = typedCharacters.length
    ? Math.round((correctCharacters / typedCharacters.length) * 1000) / 10
    : 0;
  const maximumWpm = maxVerifiedWpm();

  if (wpm > maximumWpm) {
    throw new BadRequestException(
      `Calculated WPM exceeds the maximum of ${maximumWpm}`,
    );
  }

  return { wpm, accuracy };
}
