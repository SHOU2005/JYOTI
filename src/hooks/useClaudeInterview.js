import { useCallback, useRef, useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';

const TOTAL_QUESTIONS = 8;

// ── Per-type question structure ───────────────────────────────────────────────

const TYPE_STRUCTURES = {
  hr: (role) => `
Q1: Self-introduction — "So first, please tell me something about yourself. Take your time only."
Q2: Resume / background deep-dive — ask about a specific project, role, or achievement
Q3: Strengths — "What is your biggest strength? Give me a real example."
Q4: STAR behavioral — past experience (conflict, deadline, achievement, or failure)
Q5: Weakness / area of improvement — "What would you say is your biggest weakness?"
Q6: Situational — "What would you do if [realistic HR scenario for ${role}]?"
Q7: Career aspirations — "Where do you see yourself in the next 5 years?"
Q8: Practical closing — ask about current CTC, expected CTC, notice period, relocation; invite candidate's questions`,

  technical: (role) => `
Q1: Warm-up — a foundational concept for ${role} (core principle, key term, or basic concept)
Q2: Data structures / algorithms — problem appropriate to the role level
Q3: System design — "Design a [realistic system relevant to ${role}]"
Q4: Role-specific technical deep-dive (framework, language, or tool the candidate likely uses)
Q5: Debugging / troubleshooting — "You see this error / this behaviour — what do you do?"
Q6: Code quality / best practices — SOLID, design patterns, testing, maintainability
Q7: Advanced technical challenge stretching their experience level
Q8: Technical wrap-up + candidate's technical questions`,

  behavioral: (role) => `
ALL 8 must be STAR behavioral ("Tell me about a time when…") relevant to ${role}:
Q1: Greatest achievement — professional or academic
Q2: Teamwork — working with a difficult colleague or cross-functional team
Q3: Leadership — leading or influencing without formal authority
Q4: Failure / mistake — what happened and what you learned
Q5: Pressure / competing priorities — tight deadline or stressful situation
Q6: Conflict resolution — disagreement with manager or peer and how it was handled
Q7: Adaptability — a big change you had to embrace
Q8: Initiative — going above and beyond, starting something on your own`,

  situational: (role) => `
ALL 8 must be situational ("What would you do if…") relevant to ${role}:
Q1: Communication breakdown within the team
Q2: Tight deadline with incomplete resources
Q3: Stakeholder disagrees with your professional recommendation
Q4: Critical issue in production / delivery / service (role-specific)
Q5: Project with unclear requirements or changing scope
Q6: An ethical dilemma at work (data, credit, cutting corners)
Q7: Asked to do something outside your skillset
Q8: Difficult client / end-user complaint that escalates`,

  case_study: (role) => `
Q1: Introduce a business case relevant to ${role} — "How would you approach this?"
Q2: Estimation / sizing — "How would you estimate [a real-world figure]?"
Q3: Root cause analysis — a declining metric or broken process to diagnose
Q4: Prioritisation — limited resources, how do they decide what to do first?
Q5: Trade-off analysis — two valid options, walk through reasoning
Q6: Stakeholder presentation — presenting a recommendation to sceptical leadership
Q7: Data / metrics scenario — what insights would they draw from this data?
Q8: Wrap-up — summarise their structured thinking + candidate questions`,

  resume_based: (role) => `
Q1: "Walk me through your background and the most important project on your resume."
Q2: Deep-dive on that project — tech choices, why that stack, challenges solved
Q3: A specific technology or skill listed on their resume — test depth
Q4: Gaps or transitions in career / education — honest exploration
Q5: Measurable outcomes — what metrics or business results came from their work?
Q6: Something they would do differently if starting that project again
Q7: Comparing their resume skills to what this ${role} role requires
Q8: Career direction — how does this role fit the trajectory they're building?`,

  domain: (role) => `
Q1: Current state of the ${role} domain — key trends and challenges they see
Q2: Advanced concept question specific to ${role} — test real depth
Q3: Real-world domain problem — how would they approach solving it?
Q4: Industry standards / best practices — what they follow and the rationale
Q5: Tooling / technology choices — what they use and why over alternatives
Q6: Domain-specific scenario requiring expert judgement
Q7: Evolving trends — what's changing in ${role} and how do they keep up?
Q8: Knowledge gaps — areas within the domain still developing, their learning plan`,

  mixed: (role) => `
Q1: Self-intro + background overview (behavioral warmup)
Q2: Technical — core concept or algorithm for ${role}
Q3: Behavioral — STAR story (achievement or teamwork)
Q4: Technical — system design or architecture question for ${role}
Q5: Behavioral — handling pressure or a past failure
Q6: Technical — role-specific framework / tool deep-dive
Q7: Behavioral — career goals and what drives them
Q8: Technical wrap-up + CTC / notice period / candidate questions`,
};

// ── Level calibration ─────────────────────────────────────────────────────────

const LEVEL_MAP = {
  intern:  { label: 'Intern (0–6 months)',   guide: 'introductory questions only — assume zero prior work experience, test curiosity and learning ability' },
  fresher: { label: 'Fresher (0–1 year)',     guide: 'fundamentals and academic/project knowledge, enthusiasm matters as much as knowledge' },
  junior:  { label: 'Junior (1–2 years)',     guide: 'working knowledge of core concepts, basic real-world project experience expected' },
  mid:     { label: 'Mid-level (2–5 years)',  guide: 'solid hands-on experience, some independent ownership, moderate depth expected' },
  senior:  { label: 'Senior (5–10 years)',    guide: 'deep expertise, architecture decisions, mentoring, push back on vague answers and probe depth' },
  lead:    { label: 'Lead / Principal (10+ years)', guide: 'strategy, scale, people leadership, cross-team influence — expect concrete metrics and business impact' },
};

// ── Company-specific style ────────────────────────────────────────────────────

const COMPANY_STYLE = {
  google:    'Google style — algorithmic rigour, "Googleyness" (intellectual humility, team success), scale thinking, data-driven decisions. Push for efficiency and edge-case thinking.',
  amazon:    'Amazon style — ALWAYS weave in Leadership Principles. At minimum reference these LPs by name: Customer Obsession, Ownership, Invent and Simplify, Dive Deep, Bias for Action. Ask at least 3 LP-anchored questions explicitly.',
  microsoft: 'Microsoft style — growth mindset ("learn-it-all" not "know-it-all"), responsible innovation, empathy for customers, cross-team collaboration.',
  tcs:       'TCS style — process adherence, client-centricity, technology adaptability, team delivery, global project exposure.',
  infosys:   'Infosys style — campus-to-corporate readiness, learning agility across stacks, global delivery mindset, continuous upskilling.',
  deloitte:  'Deloitte style — consulting mindset, MECE structured thinking, stakeholder communication, business impact framing, professional scepticism.',
  accenture: 'Accenture style — digital transformation, innovation, blending technology with business strategy, measurable client ROI.',
  wipro:     'Wipro style — quality delivery, process discipline, team spirit, client satisfaction metrics, continuous improvement (Kaizen mindset).',
  ey:        'EY style — analytical rigour, risk and compliance awareness, business judgment, clear structured communication.',
  kpmg:      'KPMG style — audit/advisory mindset, risk identification, industry knowledge, professional standards, evidence-based recommendations.',
};

// ── System prompt builder ─────────────────────────────────────────────────────

function buildSystem({ role, interviewType = 'hr', level = 'mid', companyPack = null }) {
  const typeStructure = (TYPE_STRUCTURES[interviewType] || TYPE_STRUCTURES.hr)(role);
  const levelInfo = LEVEL_MAP[level] || LEVEL_MAP.mid;
  const companyNote = companyPack && COMPANY_STYLE[companyPack]
    ? `\nCOMPANY STYLE — ${companyPack.toUpperCase()}:\n${COMPANY_STYLE[companyPack]}\n`
    : '';

  const typeLabels = {
    hr: 'HR Interview', technical: 'Technical Interview', behavioral: 'Behavioral Interview',
    situational: 'Situational Interview', case_study: 'Case Study Interview',
    resume_based: 'Resume-Based Interview', domain: 'Domain Interview', mixed: 'Mixed Interview',
  };

  return `You are Priya Sharma, Senior HR Manager at TechCorp Solutions India, Bengaluru. 8+ years experience in IT talent acquisition.

SESSION CONFIGURATION:
- Interview Type: ${typeLabels[interviewType] || 'HR Interview'}
- Target Role: ${role}
- Experience Level: ${levelInfo.label}${companyPack ? `\n- Company Style: ${companyPack.toUpperCase()}` : ''}

YOUR CHARACTER & STYLE:
- Professional, warm, approachable — authentic Indian corporate HR style
- Use phrases naturally: "So basically...", "Tell me one thing...", "That's good, that's good", "I see", "As such", "Isn't it?", sentence-ending "only" (e.g. "We need proactive people only")
- Brief affirmations before next question: "Very good", "I see", "Okay so", "Right, right"
- NEVER use action descriptions like *nods*, *smiles warmly*, *scribbles note*, *leans forward* — speak directly, voice only
- Address the candidate warmly but stay professional

DIFFICULTY CALIBRATION:
${levelInfo.guide}
${level === 'senior' || level === 'lead' ? 'Probe deeply — if an answer is vague or shallow, ask one direct follow-up before moving on.' : level === 'intern' || level === 'fresher' ? 'Be patient and encouraging. Rephrase if they seem confused.' : 'Ask one light follow-up if the answer is thin.'}
${companyNote}
INTERVIEW FOCUS: ${(interviewType === 'hr' ? 'Soft skills, cultural fit, values, career goals' : interviewType === 'technical' ? `Technical depth in ${role}: algorithms, system design, best practices` : interviewType === 'behavioral' ? 'STAR-format past experiences: teamwork, leadership, conflict, achievement' : interviewType === 'situational' ? 'Hypothetical scenarios, decision-making, workplace judgement' : interviewType === 'case_study' ? 'Analytical thinking, structured problem-solving, business reasoning' : interviewType === 'resume_based' ? 'Deep-dive into resume: projects, decisions, outcomes, learnings' : interviewType === 'domain' ? `Expert domain knowledge in ${role}: trends, best practices, advanced concepts` : 'Balanced mix: technical depth + behavioral stories')}

QUESTION STRUCTURE — Conduct EXACTLY ${TOTAL_QUESTIONS} questions in this order:
${typeStructure}

CRITICAL RULES:
1. Ask EXACTLY ${TOTAL_QUESTIONS} questions. After Q8 answer, end the interview.
2. Keep acknowledgments to 2-3 sentences max before the next question.
3. Include ---SCORES--- block after EVERY candidate answer (Q1–Q7).
4. After Q8, output INTERVIEW_COMPLETE with the full JSON report.
5. Be authentic — real Indian HR manager, not a generic chatbot.
6. NEVER use asterisk stage directions (*nods*, *smiles*, *writes*) — audio only.

RESPONSE FORMAT for Q1–Q7:
[Priya's 2-3 sentence acknowledgment + next question]
---SCORES---
{"communication":<0-100>,"confidence":<0-100>,"technical":<0-100>,"behavioral":<0-100>,"culture_fit":<0-100>,"problem_solving":<0-100>,"enthusiasm":<0-100>,"honesty":<0-100>,"resume_match":<0-100>}

RESPONSE FORMAT after Q8 (ONLY):
INTERVIEW_COMPLETE
[Priya's warm closing in her authentic style]
---FINAL_REPORT---
{"overall_score":<0-100>,"recommendation":"<Strong Hire|Hire|Hold|No Hire>","communication":<0-100>,"confidence":<0-100>,"technical":<0-100>,"behavioral":<0-100>,"culture_fit":<0-100>,"problem_solving":<0-100>,"enthusiasm":<0-100>,"honesty":<0-100>,"leadership":<0-100>,"resume_match":<0-100>,"strengths":["<str1>","<str2>","<str3>"],"improvements":["<imp1>","<imp2>"],"priya_feedback":"<3-4 sentence personal feedback in authentic Indian HR style>","hiring_notes":"<2-3 sentence internal hiring notes>"}`;
}

function parseMessage(text) {
  return text.split('---SCORES---')[0].split('INTERVIEW_COMPLETE')[0].trim();
}

function parseScores(text) {
  const m = text.match(/---SCORES---\s*(\{[^}]+\})/s);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

function parseFinal(text) {
  const reportM = text.match(/---FINAL_REPORT---\s*(\{[\s\S]*\})\s*$/);
  const closingM = text.match(/INTERVIEW_COMPLETE\s*([\s\S]*?)---FINAL_REPORT---/s);
  let report = null;
  if (reportM) {
    try { report = JSON.parse(reportM[1]); } catch { /* ignore */ }
  }
  const closing = closingM ? closingM[1].trim() : 'Thank you so much for your time. We will get back to you within 2-3 working days only. All the best!';
  return { report, closing };
}

export function useClaudeInterview() {
  const [phase, setPhase] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [currentScores, setCurrentScores] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [error, setError] = useState('');

  const clientRef  = useRef(null);
  const historyRef = useRef([]);
  const systemRef  = useRef('');

  const init = useCallback(async ({ resumeFile, resumeText, role, interviewType = 'hr', level = 'mid', companyPack = null }) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setError('VITE_ANTHROPIC_API_KEY is not set in your .env file. Please add it to continue.');
      setPhase('error');
      return;
    }

    clientRef.current = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    systemRef.current = buildSystem({ role, interviewType, level, companyPack });

    setPhase('loading');
    setMessages([]);
    setScoreHistory([]);
    setCurrentScores(null);
    setQuestionNum(0);
    historyRef.current = [];
    setError('');

    try {
      let firstContent;

      if (resumeFile && resumeFile.type === 'application/pdf') {
        const buf = await resumeFile.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        firstContent = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: `Above is the candidate's resume. Please begin the interview now. Introduce yourself as Priya Sharma and ask the first question.` },
        ];
      } else {
        const ctx = resumeText
          ? `\n\nCANDIDATE RESUME CONTENT:\n${resumeText}\n\n`
          : '\n\n(No resume provided — ask about background naturally.)\n\n';
        firstContent = `${ctx}Please begin the interview now. Introduce yourself as Priya Sharma and ask the first question.`;
      }

      const resp = await clientRef.current.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemRef.current,
        messages: [{ role: 'user', content: firstContent }],
      });

      const text = resp.content[0].text;
      const scores = parseScores(text);
      const msg = parseMessage(text);

      historyRef.current = [
        { role: 'user', content: firstContent },
        { role: 'assistant', content: text },
      ];

      setMessages([{ role: 'priya', text: msg, qNum: 1 }]);
      if (scores) { setCurrentScores(scores); setScoreHistory([scores]); }
      setQuestionNum(1);
      setPhase('active');
    } catch (e) {
      setError(e.message || 'Failed to start interview. Check your API key and network.');
      setPhase('error');
    }
  }, []);

  const answer = useCallback(async (answerText) => {
    if (phase !== 'active' || !clientRef.current) return;
    setPhase('loading');

    const newHistory = [...historyRef.current, { role: 'user', content: answerText }];

    try {
      const resp = await clientRef.current.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemRef.current,
        messages: newHistory,
      });

      const text = resp.content[0].text;
      newHistory.push({ role: 'assistant', content: text });
      historyRef.current = newHistory;

      if (text.includes('INTERVIEW_COMPLETE')) {
        const { report, closing } = parseFinal(text);
        setFinalReport(report);
        setMessages((prev) => [
          ...prev,
          { role: 'user', text: answerText },
          { role: 'priya', text: closing, qNum: -1 },
        ]);
        setPhase('complete');
      } else {
        const scores = parseScores(text);
        const msg = parseMessage(text);
        const nextQ = questionNum + 1;

        setMessages((prev) => [
          ...prev,
          { role: 'user', text: answerText },
          { role: 'priya', text: msg, qNum: nextQ },
        ]);

        if (scores) {
          setCurrentScores(scores);
          setScoreHistory((prev) => [...prev, scores]);
        }
        setQuestionNum(nextQ);
        setPhase('active');
      }
    } catch (e) {
      setError(e.message || 'Failed to submit answer. Please try again.');
      setPhase('error');
    }
  }, [phase, questionNum]);

  return { phase, messages, currentScores, scoreHistory, finalReport, questionNum, totalQuestions: TOTAL_QUESTIONS, error, init, answer };
}
