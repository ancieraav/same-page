"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Link2,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

type Participant = "a" | "b";
type Stage = "setup" | "quiz" | "result";

type Option = {
  id: string;
  label: string;
};

type Question = {
  id: string;
  category: string;
  prompt: string;
  note: string;
  options: Option[];
};

type Answers = Record<Participant, Record<string, string>>;

type ScoreResult = {
  score: number;
  matches: number;
  total: number;
  verdict: string;
  verdictTone: "great" | "okay" | "chaos";
  breakdown: Array<{
    questionId: string;
    prompt: string;
    first: string;
    second: string;
    match: boolean;
  }>;
};

type WebMCPTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (input: unknown, context?: { signal?: AbortSignal }) => unknown;
};

type ModelContext = {
  registerTool: (
    tool: WebMCPTool,
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

const QUESTIONS: Question[] = [
  {
    id: "energy",
    category: "The vibe",
    prompt: "The plan starts in two hours. What are you actually bringing?",
    note: "First impressions are data.",
    options: [
      { id: "camera", label: "A camera and a suspicious amount of snacks" },
      { id: "essentials", label: "Just the essentials. I travel light" },
      { id: "charger", label: "A charger, three backup plans, and anxiety" },
      { id: "nothing", label: "Nothing. I thought you were bringing stuff" },
    ],
  },
  {
    id: "timing",
    category: "The details",
    prompt: "What does “let's meet at 7” mean?",
    note: "A tiny sentence. A massive personality test.",
    options: [
      { id: "sharp", label: "7:00 sharp. I am already outside" },
      { id: "fashionably", label: "7-ish. Fashionably late is still on time" },
      { id: "after", label: "I will arrive after the first reminder" },
      { id: "tomorrow", label: "Wait, today?" },
    ],
  },
  {
    id: "budget",
    category: "The money",
    prompt: "The group budget has one last slice. Where does it go?",
    note: "The answer may reveal your true values.",
    options: [
      { id: "food", label: "One incredible meal" },
      { id: "experience", label: "An experience we will talk about later" },
      { id: "buffer", label: "Keep it. Something always goes wrong" },
      { id: "split", label: "Split it equally and keep things fair" },
    ],
  },
  {
    id: "change",
    category: "The curveball",
    prompt: "The original plan is suddenly unavailable. Your move?",
    note: "Alignment is tested when the plan breaks.",
    options: [
      { id: "improvise", label: "Improvise. The new plan might be better" },
      { id: "vote", label: "Ask everyone and vote" },
      { id: "replace", label: "Find the closest possible replacement" },
      { id: "cancel", label: "Cancel it. We had a plan" },
    ],
  },
  {
    id: "finish",
    category: "The ending",
    prompt: "At the end of the day, what makes the plan a success?",
    note: "The part nobody writes down in the group chat.",
    options: [
      { id: "laugh", label: "Everyone laughed at least once" },
      { id: "done", label: "We did everything we said we would" },
      { id: "safe", label: "Nobody was stressed or left behind" },
      { id: "story", label: "We got a story worth retelling" },
    ],
  },
];

const INITIAL_ANSWERS: Answers = { a: {}, b: {} };

function getOptionLabel(question: Question, answerId?: string) {
  return question.options.find((option) => option.id === answerId)?.label ?? "No answer";
}

function compareAnswers(
  answers: Answers,
  firstName: string,
  secondName: string,
): ScoreResult {
  const breakdown = QUESTIONS.map((question) => {
    const firstId = answers.a[question.id];
    const secondId = answers.b[question.id];
    return {
      questionId: question.id,
      prompt: question.prompt,
      first: `${firstName}: ${getOptionLabel(question, firstId)}`,
      second: `${secondName}: ${getOptionLabel(question, secondId)}`,
      match: Boolean(firstId && secondId && firstId === secondId),
    };
  });

  const matches = breakdown.filter((item) => item.match).length;
  const score = Math.round((matches / QUESTIONS.length) * 100);
  const verdict =
    score >= 80
      ? "Same brain. Same page. Slightly suspicious."
      : score >= 60
        ? "Mostly aligned. One tab is still loading."
        : score >= 40
          ? "This is not even same💀"
          : "Different universes. Same group chat.";
  const verdictTone = score >= 80 ? "great" : score >= 60 ? "okay" : "chaos";

  return { score, matches, total: QUESTIONS.length, verdict, verdictTone, breakdown };
}

function scoreColor(score: number) {
  if (score >= 80) return "#b5f36b";
  if (score >= 60) return "#f5d76e";
  return "#ff7a6e";
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("setup");
  const [topic, setTopic] = useState("Weekend plans");
  const [firstName, setFirstName] = useState("You");
  const [secondName, setSecondName] = useState("Alex");
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [activeParticipant, setActiveParticipant] = useState<Participant>("a");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [notice, setNotice] = useState("");
  const [webmcpStatus, setWebmcpStatus] = useState<"checking" | "ready" | "fallback">(
    "checking",
  );
  const [copied, setCopied] = useState(false);

  const answersRef = useRef(answers);
  const namesRef = useRef({ firstName, secondName });
  const topicRef = useRef(topic);
  const stageRef = useRef(stage);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    namesRef.current = { firstName, secondName };
  }, [firstName, secondName]);

  useEffect(() => {
    topicRef.current = topic;
  }, [topic]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext?.registerTool) {
      setWebmcpStatus("fallback");
      return;
    }

    const controller = new AbortController();
    const getSnapshot = () => ({
      topic: topicRef.current,
      participants: namesRef.current,
      stage: stageRef.current,
      questions: QUESTIONS.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        firstAnswer: answersRef.current.a[question.id] ?? null,
        secondAnswer: answersRef.current.b[question.id] ?? null,
      })),
    });

    const tools: WebMCPTool[] = [
      {
        name: "get_samepage_snapshot",
        description:
          "Read the current SamePage quiz, participant names, and both participants' submitted answers.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        execute: () => getSnapshot(),
      },
      {
        name: "submit_samepage_answer",
        description:
          "Submit one participant's answer to a SamePage quiz question. Use participant 'a' or 'b', a question id, and an option id.",
        inputSchema: {
          type: "object",
          properties: {
            participant: { type: "string", enum: ["a", "b"] },
            questionId: { type: "string", enum: QUESTIONS.map((question) => question.id) },
            optionId: { type: "string" },
          },
          required: ["participant", "questionId", "optionId"],
        },
        annotations: { readOnlyHint: false },
        execute: (rawInput) => {
          const input = (rawInput ?? {}) as {
            participant?: Participant;
            questionId?: string;
            optionId?: string;
          };
          const participant = input.participant;
          const question = QUESTIONS.find((item) => item.id === input.questionId);
          const option = question?.options.find((item) => item.id === input.optionId);
          if (!participant || !question || !option) {
            return { ok: false, error: "Unknown participant, question, or option." };
          }

          const nextAnswers = {
            ...answersRef.current,
            [participant]: {
              ...answersRef.current[participant],
              [question.id]: option.id,
            },
          } as Answers;
          answersRef.current = nextAnswers;
          setAnswers(nextAnswers);
          setStage("quiz");
          return {
            ok: true,
            participant,
            questionId: question.id,
            answer: option.label,
          };
        },
      },
      {
        name: "compare_samepage_answers",
        description:
          "Compare the two completed SamePage answer sets, calculate their percentage match, and reveal the playful verdict.",
        inputSchema: {
          type: "object",
          properties: {
            firstAnswers: { type: "object", description: "Map question ids to option ids for participant A." },
            secondAnswers: { type: "object", description: "Map question ids to option ids for participant B." },
          },
          required: ["firstAnswers", "secondAnswers"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute: (rawInput) => {
          const input = (rawInput ?? {}) as {
            firstAnswers?: Record<string, string>;
            secondAnswers?: Record<string, string>;
          };
          const nextAnswers: Answers = {
            a: input.firstAnswers ?? answersRef.current.a,
            b: input.secondAnswers ?? answersRef.current.b,
          };
          answersRef.current = nextAnswers;
          setAnswers(nextAnswers);
          const nextResult = compareAnswers(
            nextAnswers,
            namesRef.current.firstName,
            namesRef.current.secondName,
          );
          setResult(nextResult);
          setStage("result");
          return {
            topic: topicRef.current,
            score: nextResult.score,
            matches: nextResult.matches,
            total: nextResult.total,
            verdict: nextResult.verdict,
            breakdown: nextResult.breakdown,
          };
        },
      },
    ];

    Promise.all(
      tools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })),
    )
      .then(() => setWebmcpStatus("ready"))
      .catch(() => setWebmcpStatus("fallback"));

    return () => controller.abort();
  }, []);

  const currentQuestion = QUESTIONS[questionIndex];
  const currentAnswers = answers[activeParticipant];
  const currentAnswered = Boolean(currentAnswers[currentQuestion?.id]);
  const bothAnswered = Boolean(
    answers.a[currentQuestion?.id] && answers.b[currentQuestion?.id],
  );
  const totalAnswered = Object.values(answers).reduce(
    (total, participantAnswers) => total + Object.keys(participantAnswers).length,
    0,
  );
  const progress = ((questionIndex + 1) / QUESTIONS.length) * 100;

  const scoreLabel = useMemo(() => {
    if (!result) return "—";
    return `${result.score}%`;
  }, [result]);

  function startQuiz() {
    setAnswers({ a: {}, b: {} });
    answersRef.current = { a: {}, b: {} };
    setQuestionIndex(0);
    setActiveParticipant("a");
    setResult(null);
    setNotice("");
    setStage("quiz");
  }

  function selectAnswer(optionId: string) {
    const nextAnswers = {
      ...answers,
      [activeParticipant]: {
        ...answers[activeParticipant],
        [currentQuestion.id]: optionId,
      },
    } as Answers;
    setAnswers(nextAnswers);
    answersRef.current = nextAnswers;
    setNotice("");
  }

  function continueQuiz() {
    if (!currentAnswered) {
      setNotice(`${activeParticipant === "a" ? firstName : secondName} needs an answer first.`);
      return;
    }

    if (!bothAnswered) {
      setActiveParticipant(activeParticipant === "a" ? "b" : "a");
      setNotice("");
      return;
    }

    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((index) => index + 1);
      setActiveParticipant("a");
      setNotice("");
      return;
    }

    revealResult();
  }

  function revealResult() {
    const nextResult = compareAnswers(answersRef.current, firstName, secondName);
    setResult(nextResult);
    setStage("result");
  }

  function resetToSetup() {
    setStage("setup");
    setResult(null);
    setNotice("");
  }

  async function copyResult() {
    if (!result) return;
    const text = `${firstName} and ${secondName} are ${result.score}% on the same page. ${result.verdict}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f2] text-[#171914]">
      <div className="page-grid" aria-hidden="true" />
      <header className="site-header mx-auto flex w-full max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <button className="brand-lockup" onClick={resetToSetup} aria-label="Back to SamePage home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>SamePage</span>
        </button>
        <div className="header-actions">
          <div className="tool-pill" data-status={webmcpStatus}>
            <span className="status-dot" aria-hidden="true" />
            <span>{webmcpStatus === "ready" ? "WebMCP live" : "WebMCP preview"}</span>
          </div>
          <a className="header-link" href="#how-it-works">
            How it works <ArrowRight size={15} />
          </a>
        </div>
      </header>

      {stage === "setup" && (
        <section className="setup-page mx-auto grid w-full max-w-[1320px] gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:px-10 lg:pb-24 lg:pt-14">
          <div className="hero-copy self-center">
            <div className="eyebrow"><Sparkles size={15} /> Alignment, but make it fun</div>
            <h1>Do you both mean the <em>same thing?</em></h1>
            <p className="hero-lede">
              A tiny quiz that surfaces the assumptions hiding in your group chat. Answer separately, compare honestly, and find out whether you are actually on the same page.
            </p>
            <div className="hero-meta">
              <div className="avatar-stack" aria-hidden="true">
                <span>Y</span><span>A</span><span>+</span>
              </div>
              <span>For friends, teams, clients, and anyone who says “sure, sounds good.”</span>
            </div>
          </div>

          <div className="setup-card">
            <div className="card-topline">
              <span className="mini-label">Start a page</span>
              <span className="step-count">01 / 01</span>
            </div>
            <h2>Let&apos;s test your shared understanding.</h2>
            <p className="card-subtitle">Pick a topic, hand over the phone, and do not peek.</p>

            <div className="field-group">
              <label htmlFor="topic">What are you aligning on?</label>
              <input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Our weekend trip" />
            </div>

            <div className="topic-chips" aria-label="Example topics">
              {["Weekend plans", "Group project", "Freelance scope"].map((example) => (
                <button key={example} className={topic === example ? "chip active" : "chip"} onClick={() => setTopic(example)}>
                  {example}
                </button>
              ))}
            </div>

            <div className="people-grid">
              <div className="field-group">
                <label htmlFor="first-name">Person one</label>
                <div className="name-input"><span className="person-dot first" /> <input id="first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></div>
              </div>
              <div className="field-group">
                <label htmlFor="second-name">Person two</label>
                <div className="name-input"><span className="person-dot second" /> <input id="second-name" value={secondName} onChange={(event) => setSecondName(event.target.value)} /></div>
              </div>
            </div>

            <button className="primary-button full" onClick={startQuiz}>
              Start the quiz <ArrowRight size={18} />
            </button>
            <div className="card-footnote"><Zap size={14} /> 5 questions · about 2 minutes · no account needed</div>
          </div>

          <div className="feature-strip" id="how-it-works">
            <div className="feature-number">01</div>
            <div><strong>Answer apart.</strong><span>Each person gets their own interpretation.</span></div>
            <div className="feature-number">02</div>
            <div><strong>Compare in public.</strong><span>WebMCP turns the answers into a clear verdict.</span></div>
            <div className="feature-number">03</div>
            <div><strong>Fix the gaps.</strong><span>Now you know exactly what to talk about.</span></div>
          </div>
        </section>
      )}

      {stage === "quiz" && (
        <section className="quiz-page mx-auto w-full max-w-[1120px] px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-14">
          <div className="quiz-heading">
            <button className="back-button" onClick={resetToSetup}><ArrowLeft size={16} /> Exit quiz</button>
            <div className="quiz-context"><span>{topic}</span><span className="slash">/</span><span>{totalAnswered} / {QUESTIONS.length * 2} answers</span></div>
          </div>

          <div className="progress-track" aria-label={`Question ${questionIndex + 1} of ${QUESTIONS.length}`}><span style={{ width: `${progress}%` }} /></div>

          <div className="quiz-layout">
            <div className="question-column">
              <div className="question-meta"><span className="question-number">Question {String(questionIndex + 1).padStart(2, "0")}</span><span>{currentQuestion.category}</span></div>
              <h1>{currentQuestion.prompt}</h1>
              <p className="question-note">{currentQuestion.note}</p>

              <div className="participant-tabs" role="tablist" aria-label="Choose who is answering">
                <button role="tab" aria-selected={activeParticipant === "a"} className={activeParticipant === "a" ? "participant-tab active" : "participant-tab"} onClick={() => setActiveParticipant("a")}>
                  <span className="person-dot first" /> {firstName} {answers.a[currentQuestion.id] && <Check size={15} />}
                </button>
                <span className="versus">vs</span>
                <button role="tab" aria-selected={activeParticipant === "b"} className={activeParticipant === "b" ? "participant-tab active" : "participant-tab"} onClick={() => setActiveParticipant("b")}>
                  <span className="person-dot second" /> {secondName} {answers.b[currentQuestion.id] && <Check size={15} />}
                </button>
              </div>

              <div className="answer-list">
                {currentQuestion.options.map((option, index) => {
                  const selected = currentAnswers[currentQuestion.id] === option.id;
                  return (
                    <button key={option.id} className={selected ? "answer-option selected" : "answer-option"} onClick={() => selectAnswer(option.id)}>
                      <span className="option-key">{String.fromCharCode(65 + index)}</span>
                      <span>{option.label}</span>
                      {selected && <CheckCircle2 className="answer-check" size={19} />}
                    </button>
                  );
                })}
              </div>

              <div className="quiz-footer">
                <span className="privacy-note"><Clipboard size={15} /> Answers stay in this page</span>
                <button className="primary-button" onClick={continueQuiz}>
                  {!currentAnswered ? "Choose an answer" : !bothAnswered ? "Pass the phone" : questionIndex === QUESTIONS.length - 1 ? "Reveal our reality" : "Next question"}
                  <ArrowRight size={18} />
                </button>
              </div>
              {notice && <p className="notice" role="status">{notice}</p>}
            </div>

            <aside className="quiz-aside">
              <div className="aside-card tool-card">
                <div className="aside-icon"><Zap size={18} /></div>
                <div className="aside-label">Agent-ready</div>
                <h3>WebMCP is watching the state.</h3>
                <p>The page exposes structured tools so an agent can read answers, submit them, and run the comparison without guessing at buttons.</p>
                <div className="tool-list"><span><Check size={13} /> get snapshot</span><span><Check size={13} /> submit answer</span><span><Check size={13} /> compare score</span></div>
              </div>
              <div className="aside-card handoff-card">
                <div className="aside-label">Tiny ritual</div>
                <h3>Pass the phone after each answer.</h3>
                <p>Do not negotiate mid-quiz. The whole point is finding the assumptions you normally skip.</p>
                <div className="handoff-line"><span className="person-dot first" /><span className="handoff-dash" /><span className="person-dot second" /></div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {stage === "result" && result && (
        <section className="result-page mx-auto w-full max-w-[1180px] px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-12">
          <div className="result-heading">
            <button className="back-button" onClick={resetToSetup}><ArrowLeft size={16} /> New page</button>
            <div className="result-context"><span>{topic}</span><span className="slash">/</span><span>Final readout</span></div>
          </div>

          <div className="result-hero">
            <div>
              <div className="eyebrow"><Sparkles size={15} /> The results are in</div>
              <h1>How much are you<br /><em>on the same page?</em></h1>
              <p>SamePage compared all five answers. No vibes were used in the calculation.</p>
            </div>
            <div className="score-wrap" style={{ "--score-color": scoreColor(result.score), "--score-angle": `${result.score * 3.6}deg` } as React.CSSProperties}>
              <div className="score-ring"><div className="score-inner"><strong>{scoreLabel}</strong><span>match</span></div></div>
            </div>
          </div>

          <div className={`verdict-card ${result.verdictTone}`}>
            <div className="verdict-emoji">{result.verdictTone === "great" ? "🤝" : result.verdictTone === "okay" ? "🫡" : "💀"}</div>
            <div><span className="mini-label">SamePage verdict</span><h2>{result.verdict}</h2><p>{result.matches} out of {result.total} answers landed on the same option.</p></div>
            <button className="icon-button light" onClick={copyResult} aria-label="Copy result"><Copy size={17} /> {copied ? "Copied" : "Copy"}</button>
          </div>

          <div className="breakdown-heading"><div><span className="mini-label">The evidence</span><h2>Where did you drift?</h2></div><span className="match-count"><CheckCircle2 size={16} /> {result.matches} aligned</span></div>
          <div className="breakdown-list">
            {result.breakdown.map((item, index) => (
              <article key={item.questionId} className={item.match ? "breakdown-row matched" : "breakdown-row"}>
                <div className="breakdown-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="breakdown-question"><span>{item.prompt}</span><strong>{item.match ? "Same answer" : "Different answer"}</strong></div>
                <div className="breakdown-answer"><span className="person-dot first" /><p>{item.first.replace(`${firstName}: `, "")}</p></div>
                <div className="breakdown-answer"><span className="person-dot second" /><p>{item.second.replace(`${secondName}: `, "")}</p></div>
                <div className="match-mark">{item.match ? <Check size={16} /> : <span>×</span>}</div>
              </article>
            ))}
          </div>

          <div className="result-actions"><button className="primary-button" onClick={startQuiz}><RotateCcw size={17} /> Run it again</button><button className="secondary-button" onClick={resetToSetup}><Users size={17} /> Start a new page</button></div>
          <p className="result-footnote"><Link2 size={14} /> Built for conversations that deserve a clearer answer than “I thought you meant…”</p>
        </section>
      )}
    </main>
  );
}
