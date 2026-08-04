import type { Question } from "./data";

export type RandomSource = () => number;

export function chooseQuestion(bank: Question[], rng: RandomSource = Math.random, previousId?: string): Question {
  if (!bank.length) throw new Error("Question bank is empty.");
  const candidates = bank.length > 1 && previousId ? bank.filter((question) => question.id !== previousId) : bank;
  return candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))];
}

export function shuffleOptions<T>(options: readonly T[], rng: RandomSource = Math.random): T[] {
  const result = [...options];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function isCorrect(question: Question, optionId: string): boolean {
  return question.correctOptionId === optionId;
}

export function validateQuestion(question: Question): string[] {
  const errors: string[] = [];
  if (question.options.length !== 4) errors.push("must have four options");
  if (new Set(question.options.map((option) => option.id)).size !== 4) errors.push("option IDs must be unique");
  if (!question.options.some((option) => option.id === question.correctOptionId)) errors.push("correct option must exist");
  return errors;
}
