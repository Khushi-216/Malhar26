"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supportedYears, vaultData, type Question } from "./data";
import { chooseQuestion, isCorrect, shuffleOptions } from "./utils";

type Status = "locked" | "dismissing" | "activating" | "wheel" | "bars" | "bolts" | "opening" | "open" | "zooming";

function Spokes() {
  return <div className="spokes" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>;
}

function Bolts() {
  return <div className="bolts" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>;
}

function CentreEmblem({ year }: { year: string }) {
  return <Image className="centre-emblem" src={`/emblems/${year}-cropped.png`} alt="" width={1080} height={1080} unoptimized />;
}

function Atmosphere({ variant }: { variant: string }) {
  return <div className={`atmosphere atmosphere-${variant}`} aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>;
}

function VaultMachine({ variant, status, year, title }: { variant: string; status: Status; year: string; title: string }) {
  return (
    <section className={`vault-machine ${variant} state-${status}`} aria-label={`${status === "locked" ? "Closed" : "Unlocking"} ${title} physical security vault`}>
      <div className="floor-shadow" aria-hidden="true" />
      <div className="frame" aria-hidden="true">
        <div className="passage">
          <Image className="interior-logo" src={`/emblems/${year}-cropped.png`} alt="" width={1080} height={1080} unoptimized />
        </div>
        <div className="rim rim-one" /><div className="rim rim-two" /><Bolts />
        <div className="hinges"><i /><i /><i /></div>
        <div className="side-lock"><b /><i /><i /></div>
      </div>
      <div className="door" aria-hidden="true">
        <div className="door-edge" /><div className="panel panel-one" /><div className="panel panel-two" />
        <div className="theme-rings"><i /><i /></div><Spokes />
        <div className="wheel"><span /><span /><span /><span /><b><CentreEmblem year={year} /></b></div>
        <div className="clamps">{Array.from({ length: 4 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>
      </div>
      <p className="vault-entry-label">Entering Archives</p>
    </section>
  );
}

export function VaultExperience() {
  const [year, setYear] = useState("2021");
  const [status, setStatus] = useState<Status>("locked");
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [incorrectOptionIds, setIncorrectOptionIds] = useState<string[]>([]);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [question, setQuestion] = useState<Question>(vaultData["2021"].questions[0]);
  const [options, setOptions] = useState(vaultData["2021"].questions[0].options);
  const previousByYear = useRef<Record<string, string>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const config = vaultData[year];
  const unlocking = status !== "locked";

  function loadQuestion(nextYear: string) {
    const next = chooseQuestion(vaultData[nextYear].questions, Math.random, previousByYear.current[nextYear]);
    previousByYear.current[nextYear] = next.id;
    setQuestion(next);
    setOptions(shuffleOptions(next.options));
    setSelected("");
    setWrongAttempts(0);
    setIncorrectOptionIds([]);
    setAnswerRevealed(false);
    setFeedback("");
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const timer = window.setTimeout(() => loadQuestion(year), 0);
    return () => window.clearTimeout(timer);
    // Randomize once whenever the selected year changes.
  }, [year]);

  function changeYear(nextYear: string) {
    if (!vaultData[nextYear]) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setYear(nextYear);
    setStatus("locked");
    setFeedback("");
    setWrongAttempts(0);
    setIncorrectOptionIds([]);
    setAnswerRevealed(false);
    setSelected("");
    window.history.replaceState({}, "", `?year=${nextYear}`);
  }

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("year");
    const timer = window.setTimeout(() => {
      if (requested && vaultData[requested]) setYear(requested);
      else if (requested) setFeedback("That year is unavailable. Choose a year from 2021–2025.");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function beginUnlock(message: string) {
    if (unlocking) return;
    setFeedback(message);
    setStatus("dismissing");
    const stages: [Status, number][] = [
      ["activating", 220], ["wheel", 820], ["bars", 1570], ["bolts", 2320], ["opening", 3070],
      ["open", 4470], ["zooming", 5270],
    ];
    stages.forEach(([next, delay]) => timers.current.push(setTimeout(() => setStatus(next), delay)));
    timers.current.push(setTimeout(() => window.location.assign(`${config.archiveUrl}?year=${year}`), 6320));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (unlocking || !selected) return;
    if (!isCorrect(question, selected)) {
      const nextAttempts = wrongAttempts + 1;
      setWrongAttempts(nextAttempts);
      setIncorrectOptionIds((current) => current.includes(selected) ? current : [...current, selected]);
      if (nextAttempts >= 1) {
        setAnswerRevealed(true);
        setFeedback("The correct memory key has been revealed.");
      } else {
        setFeedback("❌ Incorrect memory key. Try again.");
      }
      return;
    }
    beginUnlock("Access granted");
  }

  return (
    <main className={`vault-page ${config.pageClass} status-${status}`}>
      <Atmosphere variant={config.variant} />
      <header className="topbar">
        <div><p>Malhar Archives</p><h1>{config.year} · {config.title}</h1><span>{config.subtitle}</span></div>
        {/* <label className="year-picker">Demo year
          <select value={year} onChange={(event) => changeYear(event.target.value)} disabled={unlocking}>
            {supportedYears.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label> */}
      </header>

      <div className="experience">
        <VaultMachine variant={config.variant} status={status} year={year} title={config.title} />
        <div className="machine-connector" aria-hidden="true" />
        <form className="access-console" onSubmit={submit} aria-busy={unlocking}>
          <div className="console-connector" aria-hidden="true" />
          <p className="console-kicker">Memory access console · {config.year}</p>
          <h2>Puddles found a locked memory.</h2>
          <fieldset disabled={unlocking}>
            <legend>{question.question}</legend>
            <div className="answer-grid">
              {options.map((option, index) => (
                <label key={`${option.id}-${incorrectOptionIds.includes(option.id) && selected === option.id ? wrongAttempts : 0}`}
                  className={`answer-card${selected === option.id ? " selected" : ""}${incorrectOptionIds.includes(option.id) ? " incorrect" : ""}${answerRevealed && option.id === question.correctOptionId ? " correct-revealed" : ""}${incorrectOptionIds.includes(option.id) && selected === option.id ? " shake" : ""}`}>
                  <input type="radio" name="vault-answer" value={option.id} checked={selected === option.id}
                    onChange={() => { setSelected(option.id); if (!answerRevealed) setFeedback(""); }} />
                  <span className="option-key">{String.fromCharCode(65 + index)}</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="console-actions">
            <button type="submit" disabled={unlocking || !selected}>Unlock Vault</button>
            <button type="button" className="skip" disabled={unlocking} onClick={() => beginUnlock("Access granted")}>Skip</button>
          </div>
          <p className={`feedback${wrongAttempts ? " feedback-error" : ""}${answerRevealed ? " feedback-revealed" : ""}`} role="status" aria-live="polite">{feedback || "Choose a memory key or skip to release the lock."}</p>
          <ol className="sequence" aria-label="Unlock sequence">
            {["Alignment", "Wheel", "Bars", "Bolts", "Door"].map((label, index) => <li key={label} className={["activating", "wheel", "bars", "bolts", "opening", "open", "zooming"].indexOf(status) >= index ? "done" : ""}>{label}</li>)}
          </ol>
        </form>
      </div>
      <footer>St. Xavier&apos;s College, Mumbai · Heavy mechanical archive series</footer>
    </main>
  );
}
