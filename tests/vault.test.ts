import test from "node:test";
import assert from "node:assert/strict";
import { supportedYears, vaultData } from "../components/vault/data.ts";
import { chooseQuestion, isCorrect, shuffleOptions, validateQuestion } from "../components/vault/utils.ts";

test("all five year configurations are complete", () => {
  assert.deepEqual(supportedYears, ["2021", "2022", "2023", "2024", "2025"]);
  for (const year of supportedYears) {
    const config = vaultData[year];
    assert.equal(config.questions.length, 3);
    assert.equal(config.archiveUrl, `/vault/${year}`);
    assert.equal(config.pageClass, `theme-${config.variant}`);
    assert.match(config.logoAsset, /^\/brand-palettes-/);
    for (const question of config.questions) assert.deepEqual(validateQuestion(question), []);
  }
});

test("updated quiz bank is loaded for every year", () => {
  assert.equal(vaultData["2021"].questions[0].question, "How was Malhar 2021 conducted, given the pandemic?");
  assert.match(vaultData["2022"].questions[0].question, /Little Things/);
  assert.match(vaultData["2023"].questions[0].question, /real-world tension/);
  assert.match(vaultData["2024"].questions[0].question, /standout musical performance/);
  assert.match(vaultData["2025"].questions[0].question, /closed the Malhar 2025 Conclave/);
});

test("selection stays inside the chosen bank and can vary", () => {
  const bank = vaultData["2023"].questions;
  assert.equal(chooseQuestion(bank, () => 0).id, "2023-q1");
  assert.equal(chooseQuestion(bank, () => 0.99).id, "2023-q3");
});

test("selection avoids an immediate repeat when alternatives exist", () => {
  const bank = vaultData["2025"].questions;
  const previous = bank[0].id;
  assert.notEqual(chooseQuestion(bank, () => 0, previous).id, previous);
});

test("shuffle keeps all options and correct answer identity", () => {
  const question = vaultData["2024"].questions[1];
  const low = shuffleOptions(question.options, () => 0);
  const high = shuffleOptions(question.options, () => 0.99);
  assert.equal(low.length, 4);
  assert.deepEqual(new Set(low.map((option) => option.id)), new Set(question.options.map((option) => option.id)));
  assert.notDeepEqual(low.map((option) => option.id), high.map((option) => option.id));
  assert.equal(isCorrect(question, question.correctOptionId), true);
  assert.equal(isCorrect(question, low.find((option) => option.id !== question.correctOptionId)!.id), false);
});

test("empty banks fail clearly", () => {
  assert.throws(() => chooseQuestion([], () => 0), /empty/);
});
