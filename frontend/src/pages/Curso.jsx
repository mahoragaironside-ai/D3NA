import React, { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, Lock, Check, ChevronDown, Clock, BookOpen, Timer, MessageCircle, ArrowRight } from "lucide-react";
import { C } from "../tokens.js";
import PaymentModal from "../components/PaymentModal.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function call(path, method = "GET", body) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(API_URL + "/courses" + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || "Erro de rede."); e.status = res.status; throw e; }
  return data;
}

async function createEnrollment() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(API_URL + "/course-enrollments/create", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro de rede.");
  return data;
}

const CSS = `
@keyframes dnaUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes dnaShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes dnaLed{0%,100%{box-shadow:0 0 6px rgba(124,106,232,.5),0 0 14px rgba(91,127,224,.3)}50%{box-shadow:0 0 12px rgba(124,106,232,.95),0 0 28px rgba(91,127,224,.6)}}
@keyframes dnaBorder{0%,100%{box-shadow:0 0 0 1px rgba(124,106,232,.4),0 0 10px rgba(124,106,232,.35)}50%{box-shadow:0 0 0 1px rgba(124,106,232,.8),0 0 22px rgba(124,106,232,.7)}}
@keyframes dnaPulse{0%,100%{box-shadow:0 0 0 0 rgba(124,106,232,.6)}50%{box-shadow:0 0 0 7px rgba(124,106,232,0)}}
@keyframes dnaGreen{0%,100%{box-shadow:0 0 4px rgba(46,158,91,.5)}50%{box-shadow:0 0 12px rgba(46,158,91,.95)}}
@keyframes dnaSweep{0%{left:-40%}100%{left:100%}}
.dna-root button{transition:transform .15s}
.dna-root button:active:not(:disabled){transform:scale(.97)}
.dna-root *{-webkit-tap-highlight-color:transparent}
@media (prefers-reduced-motion:reduce){.dna-root *{animation:none!important}}
`;

const GRAD = "linear-gradient(135deg,#8A5FE0,#5B7FE0)";
const ACCENT = "#7C6AE8";
const SOFT = "rgba(124,106,232,.13)";
const line = "1px solid rgba(128,128,128,.25)";
const card = { background: C.surface || "transparent", border: line, borderRadius: 14, padding: 14, marginBottom: 10, animation: "dnaUp .45s ease both" };
const btn = { background: GRAD, color: "#fff", border: "none", borderRadius: 12, padding: "11px 16px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", animation: "dnaLed 2.6s ease-in-out infinite", display: "inline-flex", alignItems: "center", gap: 8 };
const ghost = { background: "transparent", color: "inherit", border: line, borderRadius: 12, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
const field = { width: "100%", boxSizing: "border-box", borderRadius: 12, border: line, padding: 11, fontSize: 14.5, background: "transparent", color: "inherit", fontFamily: "inherit" };
const small = { fontSize: 12.5, opacity: 0.75, marginTop: 6 };
const chip = { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, padding: "5px 10px", borderRadius: 999, background: SOFT };

function useGo() {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  async function go(msg, fn) {
    setErr(""); setBusy(msg);
    try { await fn(); } catch (e) { setErr(e.message); }
    setBusy("");
  }
  return { busy, err, go, setErr };
}

function Status({ busy, err }) {
  return (
    <>
      {busy && <div style={small}>{busy}</div>}
      {err && <div style={{ color: "#d33", fontSize: 13.5, marginTop: 6 }}>{err}</div>}
    </>
  );
}

function Ponto({ p, index, open, onToggle, onChanged }) {
  const parts = p.explanation_parts || [];
  const [shown, setShown] = useState(1);
  const [answer, setAnswer] = useState("");
  const [res, setRes] = useState(null);
  const [doubt, setDoubt] = useState("");
  const [doubtA, setDoubtA] = useState("");
  const [showDoubt, setShowDoubt] = useState(false);
  const { busy, err, go } = useGo();
  const blocked = p.status === "bloqueado";
  const done = p.status === "compreendido";
  const visible = done ? parts : parts.slice(0, shown);
  const all = done || shown >= parts.length;
  const ok = res && res.understood;

  const confirm = () => go("A avaliar a tua resposta…", async () => {
    const r = await call("/points/" + p.point_id + "/answer", "POST", { answer });
    setRes(r);
    if (r.understood) setAnswer("");
  });
  const ask = () => go("A responder à tua dúvida…", async () => {
    const r = await call("/points/" + p.point_id + "/doubt", "POST", { question: doubt });
    setDoubtA(r.answer); setDoubt("");
  });
  const next = () => { setRes(null); onChanged(); };

  const circle = {
    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, flexShrink: 0, color: "#fff",
    background: done ? "#2e9e5b" : blocked ? "rgba(128,128,128,.35)" : GRAD,
    animation: !done && !blocked ? "dnaPulse 2s ease-in-out infinite" : "none",
  };

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", opacity: blocked ? 0.55 : 1, border: open ? "1.5px solid " + ACCENT : line, animation: open ? "dnaBorder 2.6s ease-in-out infinite" : "dnaUp .45s ease both" }}>
      <button onClick={blocked ? undefined : onToggle} disabled={blocked}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "transparent", border: "none", color: "inherit", textAlign: "left", cursor: blocked ? "default" : "pointer" }}>
        <span style={circle}>{done ? <Check size={15} /> : blocked ? <Lock size={13} /> : index}</span>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{p.title}</span>
        {!blocked && <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", opacity: 0.6 }} />}
      </button>

      {open && !blocked && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ borderLeft: "3px solid " + ACCENT, boxShadow: "-4px 0 14px -4px rgba(124,106,232,.7)", background: SOFT, borderRadius: "0 10px 10px 0", padding: "12px 13px", marginBottom: 12 }}>
            {visible.map((t, i) => (
              <p key={i} style={{ margin: i === visible.length - 1 ? 0 : "0 0 10px", fontSize: 15.5, lineHeight: 1.65, animation: "dnaUp .5s ease both", animationDelay: (i * 0.08) + "s" }}>{t}</p>
            ))}
          </div>

          {!all && <button style={btn} onClick={() => setShown(shown + 1)}>Continuar <ArrowRight size={16} /></button>}

          {all && !done && !ok && (
            <div style={{ border: line, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: ACCENT, marginBottom: 6 }}>Confirma que entendeste</div>
              <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 8, lineHeight: 1.5 }}>{p.check_question}</div>
              <textarea style={field} rows={3} maxLength={500} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escreve a tua resposta aqui…" />
              <button style={{ ...btn, marginTop: 8, opacity: answer.trim().length < 10 || busy ? 0.5 : 1 }} disabled={!!busy || answer.trim().length < 10} onClick={confirm}>
                <Check size={16} /> Confirmar resposta
              </button>
            </div>
          )}

          {res && (
            <div style={{ marginTop: 10, borderRadius: 12, padding: 12, background: ok ? "rgba(46,158,91,.14)" : "rgba(230,160,40,.15)" }}>
              <p style={{ fontSize: 14.5, margin: 0, lineHeight: 1.55 }}>{res.feedback}</p>
              {!ok && res.reexplanation && (
                <p style={{ fontSize: 14.5, margin: "8px 0 0", lineHeight: 1.55 }}><b>Vamos de outra forma:</b> {res.reexplanation}</p>
              )}
              {ok && <button style={{ ...btn, marginTop: 10 }} onClick={next}>{res.lesson_done ? "Ver teste e TPC" : "Próximo ponto"} <ArrowRight size={16} /></button>}
            </div>
          )}

          {all && (
            <div style={{ marginTop: 12 }}>
              {!showDoubt ? (
                <button style={ghost} onClick={() => setShowDoubt(true)}><MessageCircle size={16} /> Tens dúvidas?</button>
              ) : (
                <>
                  <input style={field} value={doubt} maxLength={500} onChange={(e) => setDoubt(e.target.value)} placeholder="Escreve a tua dúvida…" />
                  <button style={{ ...ghost, marginTop: 8, opacity: doubt.trim().length < 3 || busy ? 0.5 : 1 }} disabled={!!busy || doubt.trim().length < 3} onClick={ask}>Tirar dúvida</button>
                  {doubtA && <p style={{ fontSize: 14.5, margin: "10px 0 0", lineHeight: 1.6 }}>{doubtA}</p>}
                </>
              )}
            </div>
          )}
          <Status busy={busy} err={err} />
        </div>
      )}
    </div>
  );
}

function Fim({ lessonId }) {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [work, setWork] = useState("");
  const [fb, setFb] = useState("");
  const { busy, err, go } = useGo();

  const start = () => go("A preparar o teste…", async () => {
    const t = await call("/lessons/" + lessonId + "/test", "POST");
    setTest(t); setAnswers(t.questions.map(() => ""));
  });
  const submit = () => go("A corrigir o teste…", async () => {
    setResult(await call("/lessons/" + lessonId + "/test/submit", "POST", { test_id: test.test_id, answers }));
  });
  const sendWork = () => go("A avaliar o TPC…", async () => {
    setFb((await call("/lessons/" + lessonId + "/homework", "POST", { text: work })).feedback);
  });

  return (
    <div style={{ ...card, border: "1.5px solid " + ACCENT }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Teste e TPC</div>
      {!test && (
        <>
          <p style={{ fontSize: 14.5, margin: "0 0 10px", lineHeight: 1.55 }}>Compreendeste todos os pontos. Já podes fazer o teste.</p>
          <button style={btn} disabled={!!busy} onClick={start}>Fazer o teste</button>
        </>
      )}
      {test && !result && (
        <>
          {test.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 5, lineHeight: 1.5 }}>{i + 1}. {q}</div>
              <textarea style={field} rows={2} maxLength={500} value={answers[i] || ""} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} />
            </div>
          ))}
          <button style={btn} disabled={!!busy} onClick={submit}>Entregar o teste</button>
        </>
      )}
      {result && (
        <>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{result.score}<span style={{ fontSize: 15, opacity: 0.6 }}> / 10</span></div>
          <p style={{ fontSize: 14.5, margin: "6px 0", lineHeight: 1.55 }}>{result.feedback}</p>
          {result.weak_points.length > 0 && (
            <p style={{ fontSize: 14.5, margin: "0 0 10px" }}><b>A rever:</b> {result.weak_points.join("; ")}</p>
          )}
          <div style={{ borderTop: line, paddingTop: 10 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>TPC: aplica o que aprendeste e escreve o teu trabalho.</div>
            <textarea style={field} rows={4} maxLength={2000} value={work} onChange={(e) => setWork(e.target.value)} />
            <button style={{ ...btn, marginTop: 8, opacity: work.trim().length < 10 || busy ? 0.5 : 1 }} disabled={!!busy || work.trim().length < 10} onClick={sendWork}>Enviar TPC</button>
            {fb && <p style={{ fontSize: 14.5, margin: "10px 0 0", lineHeight: 1.6 }}>{fb}</p>}
          </div>
        </>
      )}
      <Status busy={busy} err={err} />
    </div>
  );
}

export default function Curso({ onBack }) {
  const [view, setView] = useState("list");
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [topic, setTopic] = useState("");
  const [needPay, setNeedPay] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [payInfo, setPayInfo] = useState(null);
  const [openId, setOpenId] = useState(null);
  const { busy, err, go } = useGo();

  async function loadCourse(id) {
    const d = await call("/" + id);
    setCourse(d.course); setLessons(d.lessons); setEnrolled(!!d.enrolled); setView("course");
  }
  async function loadLesson(id) {
    for (let i = 0; i < 20; i++) {
      const d = await call("/lessons/" + id);
      if (d.status !== "a_gerar") {
        setLesson(d); setView("lesson");
        const cur = d.points.find((p) => p.status === "em_andamento");
        setOpenId(cur ? cur.point_id : null);
        return;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    throw new Error("A aula demorou demasiado. Tenta de novo.");
  }
  function loadList() {
    return go("A carregar…", async () => {
      const d = await call("");
      setCourses(d.courses); setEnrolled(!!d.enrolled); setNeedPay(false);
    });
  }
  useEffect(() => { loadList(); }, []);

  const createCourse = () => go("A montar o teu curso… (pode demorar até 30 segundos)", async () => {
    let d;
    try { d = await call("", "POST", { topic }); }
    catch (e) { if (e.status === 403) { setNeedPay(true); return; } throw e; }
    setTopic("");
    await loadCourse(d.course.course_id);
  });

  function back() {
    if (needPay) { setNeedPay(false); return; }
    if (view === "lesson") go("A carregar…", () => loadCourse(course.course_id));
    else if (view === "course") { setView("list"); loadList(); }
    else onBack();
  }

  const pay = () => go("A gerar a referência…", async () => { setPayInfo(await createEnrollment()); });
  const verify = () => go("A verificar…", async () => {
    const d = await call("");
    setCourses(d.courses); setEnrolled(!!d.enrolled);
    if (!d.enrolled) throw new Error("Ainda não vimos a confirmação do pagamento. Tenta de novo daqui a pouco.");
    setNeedPay(false);
  });
  const free = (l) => l.module_number === 1 && l.lesson_number === 1;

  const modules = [...new Set(lessons.map((l) => l.module_number))];
  const pts = lesson ? lesson.points : [];
  const L = lesson ? lesson.lesson : null;
  const vm = L ? Math.round(Number(L.video_minutes) || 0) : 0;
  const em = L ? Math.round(Number(L.extra_minutes) || 0) : 0;
  const doneCount = pts.filter((p) => p.status === "compreendido").length;
  const allDone = pts.length > 0 && doneCount === pts.length;
  const idx = L ? lessons.findIndex((l) => l.lesson_id === L.lesson_id) : -1;
  const nextL = idx >= 0 ? lessons[idx + 1] : null;
  const goNext = () => { if (nextL) go("A preparar a aula…", () => loadLesson(nextL.lesson_id)); };

  const title = needPay ? "Cursos D3NA"
    : view === "list" ? "Os meus cursos"
    : view === "course" ? (course ? course.topic : "")
    : (L ? "Módulo " + L.module_number + " · Aula " + L.lesson_number : "");

  return (
    <div className="dna-root" style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 10, overflow: "hidden", background: GRAD, color: "#fff", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", boxShadow: "0 2px 18px rgba(124,106,232,.55)" }}>
        <button onClick={back} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, display: "flex" }}><ArrowLeft size={22} /></button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 15.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <GraduationCap size={20} />
        <div style={{ position: "absolute", bottom: 0, height: 2, width: "40%", background: "linear-gradient(90deg,transparent,#fff,transparent)", animation: "dnaSweep 2.8s linear infinite" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 14px 40px" }}>
        <Status busy={busy} err={err} />

        {needPay && (
          <>
            <div style={{ ...card, textAlign: "center", padding: 20, marginTop: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: GRAD, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}><GraduationCap size={26} color="#fff" /></div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Continua a aprender</div>
              <p style={{ fontSize: 14.5, margin: "0 0 14px", lineHeight: 1.55, opacity: 0.85 }}>
                Gostaste da aula gratuita? Para continuares e criares mais cursos precisas da inscrição semanal (600 Kz). Depois de pagares, a confirmação é feita e o acesso abre.
              </p>
              <button style={{ ...btn, width: "100%", justifyContent: "center", marginBottom: 8 }} disabled={!!busy} onClick={pay}>Pagar inscrição</button>
              <button style={{ ...ghost, width: "100%", justifyContent: "center" }} disabled={!!busy} onClick={verify}>Já paguei, verificar</button>
            </div>
            {payInfo && <PaymentModal info={payInfo} onClose={() => setPayInfo(null)} />}
          </>
        )}

        {!needPay && view === "list" && (
          <>
            <div style={{ background: "linear-gradient(135deg,#8A5FE0,#5B7FE0,#8A5FE0)", backgroundSize: "200% 200%", animation: "dnaShift 8s ease infinite", boxShadow: "0 8px 28px rgba(124,106,232,.45)", borderRadius: 16, padding: 16, color: "#fff", margin: "10px 0 14px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>O que queres aprender?</div>
              {!enrolled && <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>A primeira aula do teu primeiro curso é gratuita.</div>}
              <input style={{ ...field, background: "rgba(255,255,255,.96)", color: "#222", border: "none", marginTop: enrolled ? 8 : 0 }} value={topic} maxLength={200} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: JavaScript do zero" />
              <button style={{ ...btn, background: "#fff", color: "#5B4FD0", boxShadow: "none", marginTop: 10, opacity: topic.trim().length < 3 || busy ? 0.6 : 1 }} disabled={!!busy || topic.trim().length < 3} onClick={createCourse}>Criar curso</button>
            </div>
            {courses.map((c) => (
              <button key={c.course_id} onClick={() => go("A abrir o curso…", () => loadCourse(c.course_id))}
                style={{ ...card, width: "100%", textAlign: "left", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><GraduationCap size={20} color="#fff" /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 15 }}>{c.topic}</span>
                  <span style={{ ...chip, marginTop: 5 }}>Nível: {c.level}</span>
                </span>
                <ArrowRight size={18} style={{ opacity: 0.5 }} />
              </button>
            ))}
          </>
        )}

        {!needPay && view === "course" && course && (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0 14px" }}>
              <span style={chip}>Nível: {course.level}</span>
              <span style={chip}>{lessons.length} aulas</span>
              <span style={chip}>{modules.length} módulos</span>
            </div>
            {modules.map((m) => (
              <div key={m} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: ACCENT, margin: "6px 2px 8px" }}>Módulo {m}</div>
                {lessons.filter((l) => l.module_number === m).map((l) => (
                  <button key={l.lesson_id}
                    onClick={() => (!enrolled && !free(l)) ? setNeedPay(true) : go("A preparar a aula… (a primeira vez demora um pouco)", () => loadLesson(l.lesson_id))}
                    style={{ ...card, width: "100%", textAlign: "left", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ minWidth: 38, height: 38, borderRadius: 12, background: SOFT, color: ACCENT, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m}.{l.lesson_number}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 700, fontSize: 14.5 }}>{l.title}</span>
                      <span style={{ display: "block", fontSize: 12.5, opacity: 0.7, marginTop: 3, lineHeight: 1.4 }}>{l.summary}</span>
                    </span>
                    {!enrolled && (free(l)
                      ? <span style={{ ...chip, background: "rgba(46,158,91,.18)", color: "#2e9e5b", fontWeight: 700, animation: "dnaGreen 2.2s ease-in-out infinite" }}>Grátis</span>
                      : <Lock size={16} style={{ opacity: 0.55 }} />)}
                  </button>
                ))}
              </div>
            ))}
          </>
        )}

        {!needPay && view === "lesson" && lesson && (
          <>
            <h1 style={{ fontSize: 21, lineHeight: 1.25, margin: "6px 0", fontWeight: 800 }}>{L.title}</h1>
            <p style={{ fontSize: 13.5, opacity: 0.75, margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{L.summary}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {vm > 0 && <span style={chip}><Clock size={13} /> Vídeo {vm} min</span>}
              <span style={chip}><BookOpen size={13} /> Explicação +{em} min</span>
              <span style={chip}><Timer size={13} /> ~{vm + em} min</span>
            </div>
            {lesson.video ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, marginBottom: 12, borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: "0 0 0 1.5px rgba(124,106,232,.6), 0 8px 30px rgba(91,127,224,.35)" }}>
                <iframe src={lesson.video.embed_url} title="Vídeo da aula" allowFullScreen
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }} />
              </div>
            ) : (
              <div style={{ ...small, marginBottom: 12 }}>Esta aula não tem vídeo. A explicação é só por texto.</div>
            )}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {pts.map((p) => (
                  <div key={p.point_id} style={{ flex: 1, height: 6, borderRadius: 3, background: p.status === "compreendido" ? GRAD : "rgba(128,128,128,.3)", boxShadow: p.status === "compreendido" ? "0 0 8px rgba(124,106,232,.85)" : "none", transition: "all .4s" }} />
                ))}
              </div>
              <div style={small}>{doneCount} de {pts.length} pontos concluídos</div>
            </div>
            {pts.map((p, i) => (
              <Ponto key={p.point_id} p={p} index={i + 1}
                open={openId === p.point_id}
                onToggle={() => setOpenId(openId === p.point_id ? null : p.point_id)}
                onChanged={() => loadLesson(L.lesson_id).catch(() => {})} />
            ))}
            {allDone && <Fim lessonId={L.lesson_id} />}
            {allDone && !enrolled && (
              <div style={card}>
                <p style={{ fontSize: 14.5, margin: "0 0 10px", lineHeight: 1.55 }}>Gostaste da primeira aula? Continua o curso com a inscrição semanal (600 Kz).</p>
                <button style={btn} onClick={() => setNeedPay(true)}>Continuar o curso</button>
              </div>
            )}
            {allDone && enrolled && nextL && (
              <button style={{ ...btn, width: "100%", justifyContent: "center", marginTop: 4 }} onClick={goNext}>Aula seguinte <ArrowRight size={18} /></button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
