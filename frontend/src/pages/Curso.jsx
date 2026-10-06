import React, { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, Lock, Check } from "lucide-react";
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

const line = "1px solid rgba(128,128,128,.3)";
const box = { border: line, borderRadius: 12, padding: 14, marginBottom: 12 };
const btn = { background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const field = { width: "100%", boxSizing: "border-box", borderRadius: 10, border: line, padding: 10, fontSize: 14, background: "transparent", color: "inherit", fontFamily: "inherit" };
const small = { fontSize: 12.5, opacity: 0.75, marginTop: 6 };

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

function Ponto({ p, index, onChanged }) {
  const parts = p.explanation_parts || [];
  const [shown, setShown] = useState(1);
  const [answer, setAnswer] = useState("");
  const [res, setRes] = useState(null);
  const [doubt, setDoubt] = useState("");
  const [doubtA, setDoubtA] = useState("");
  const { busy, err, go } = useGo();

  if (p.status === "bloqueado") {
    return (
      <div style={{ ...box, opacity: 0.6, display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
        <Lock size={16} /> <span>Ponto {index}: {p.title} (bloqueado até confirmares o anterior)</span>
      </div>
    );
  }

  const done = p.status === "compreendido";
  const visible = done ? parts : parts.slice(0, shown);
  const all = done || shown >= parts.length;

  const confirm = () => go("A avaliar a tua resposta…", async () => {
    const r = await call("/points/" + p.point_id + "/answer", "POST", { answer });
    setRes(r);
    if (r.understood) { setAnswer(""); onChanged(); }
  });
  const ask = () => go("A responder à tua dúvida…", async () => {
    const r = await call("/points/" + p.point_id + "/doubt", "POST", { question: doubt });
    setDoubtA(r.answer); setDoubt("");
  });

  return (
    <div style={box}>
      <div style={{ fontWeight: 700, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
        {done && <Check size={16} color="#2e9e5b" />} Ponto {index}: {p.title}
      </div>
      {visible.map((t, i) => <p key={i} style={{ margin: "0 0 8px", lineHeight: 1.5, fontSize: 14 }}>{t}</p>)}
      {!all && <button style={btn} onClick={() => setShown(shown + 1)}>Continuar</button>}
      {all && !done && (
        <>
          <div style={{ fontWeight: 600, margin: "10px 0 6px", fontSize: 14 }}>{p.check_question}</div>
          <textarea style={field} rows={3} maxLength={500} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escreve a tua resposta aqui…" />
          <button style={{ ...btn, marginTop: 8, opacity: answer.trim().length < 10 || busy ? 0.5 : 1 }} disabled={!!busy || answer.trim().length < 10} onClick={confirm}>
            Confirmar resposta
          </button>
        </>
      )}
      {res && <p style={{ fontSize: 14, margin: "10px 0 0", lineHeight: 1.5 }}>{res.feedback}</p>}
      {res && !res.understood && res.reexplanation && (
        <p style={{ fontSize: 14, margin: "8px 0 0", lineHeight: 1.5 }}><b>Vamos de outra forma:</b> {res.reexplanation}</p>
      )}
      {all && (
        <div style={{ marginTop: 12, borderTop: line, paddingTop: 10 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>Tens dúvidas?</div>
          <input style={field} value={doubt} maxLength={500} onChange={(e) => setDoubt(e.target.value)} placeholder="Escreve a tua dúvida…" />
          <button style={{ ...btn, marginTop: 8, opacity: doubt.trim().length < 3 || busy ? 0.5 : 1 }} disabled={!!busy || doubt.trim().length < 3} onClick={ask}>Tirar dúvida</button>
          {doubtA && <p style={{ fontSize: 14, margin: "10px 0 0", lineHeight: 1.5 }}>{doubtA}</p>}
        </div>
      )}
      <Status busy={busy} err={err} />
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
    <div style={box}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Teste e TPC</div>
      {!test && (
        <>
          <p style={{ fontSize: 14, margin: "0 0 8px" }}>Compreendeste todos os pontos. Já podes fazer o teste.</p>
          <button style={btn} disabled={!!busy} onClick={start}>Fazer o teste</button>
        </>
      )}
      {test && !result && (
        <>
          {test.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{i + 1}. {q}</div>
              <textarea style={field} rows={2} maxLength={500} value={answers[i] || ""} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} />
            </div>
          ))}
          <button style={btn} disabled={!!busy} onClick={submit}>Entregar o teste</button>
        </>
      )}
      {result && (
        <>
          <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>Nota: {result.score} / 10</p>
          <p style={{ fontSize: 14, margin: "0 0 6px", lineHeight: 1.5 }}>{result.feedback}</p>
          {result.weak_points.length > 0 && (
            <p style={{ fontSize: 14, margin: "0 0 10px" }}><b>A rever:</b> {result.weak_points.join("; ")}</p>
          )}
          <div style={{ borderTop: line, paddingTop: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>TPC: aplica o que aprendeste e escreve o teu trabalho.</div>
            <textarea style={field} rows={4} maxLength={2000} value={work} onChange={(e) => setWork(e.target.value)} />
            <button style={{ ...btn, marginTop: 8, opacity: work.trim().length < 10 || busy ? 0.5 : 1 }} disabled={!!busy || work.trim().length < 10} onClick={sendWork}>Enviar TPC</button>
            {fb && <p style={{ fontSize: 14, margin: "10px 0 0", lineHeight: 1.5 }}>{fb}</p>}
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
  const { busy, err, go } = useGo();

  async function loadCourse(id) {
    const d = await call("/" + id);
    setCourse(d.course); setLessons(d.lessons); setEnrolled(!!d.enrolled); setView("course");
  }
  async function loadLesson(id) {
    for (let i = 0; i < 20; i++) {
      const d = await call("/lessons/" + id);
      if (d.status !== "a_gerar") { setLesson(d); setView("lesson"); return; }
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
  const allDone = pts.length > 0 && pts.every((p) => p.status === "compreendido");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
        <button onClick={back} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 12, fontSize: 14 }}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <Status busy={busy} err={err} />

        {needPay && (
          <>
            <h2 style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 12px" }}><GraduationCap size={22} /> Cursos D3NA</h2>
            <div style={box}>
              <p style={{ fontSize: 14, margin: "0 0 10px", lineHeight: 1.5 }}>
                Gostaste da aula gratuita? Para continuares e criares mais cursos precisas da inscrição semanal (600 Kz). Depois de pagares, a confirmação é feita e o acesso abre.
              </p>
              <button style={btn} disabled={!!busy} onClick={pay}>Pagar inscrição</button>
              <button style={{ ...btn, marginLeft: 8, background: "transparent", color: "inherit", border: line }} disabled={!!busy} onClick={verify}>Já paguei, verificar</button>
            </div>
            {payInfo && <PaymentModal info={payInfo} onClose={() => setPayInfo(null)} />}
          </>
        )}
        {view === "list" && !needPay && (
          <>
            <h2 style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 12px" }}><GraduationCap size={22} /> Os meus cursos</h2>
            <div style={box}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>O que queres aprender?</div>
              {!enrolled && <div style={{ ...small, marginTop: 0, marginBottom: 8 }}>A primeira aula do teu primeiro curso é gratuita.</div>}
              <input style={field} value={topic} maxLength={200} onChange={(e) => setTopic(e.target.value)} placeholder="Ex: JavaScript do zero" />
              <button style={{ ...btn, marginTop: 8, opacity: topic.trim().length < 3 || busy ? 0.5 : 1 }} disabled={!!busy || topic.trim().length < 3} onClick={createCourse}>Criar curso</button>
            </div>
            {courses.map((c) => (
              <button key={c.course_id} onClick={() => go("A abrir o curso…", () => loadCourse(c.course_id))}
                style={{ ...box, width: "100%", textAlign: "left", background: "transparent", color: "inherit", cursor: "pointer", display: "block" }}>
                <div style={{ fontWeight: 700 }}>{c.topic}</div>
                <div style={small}>Nível: {c.level}</div>
              </button>
            ))}
          </>
        )}

        {!needPay && view === "course" && course && (
          <>
            <h2 style={{ margin: "8px 0 4px" }}>{course.topic}</h2>
            <div style={{ ...small, marginBottom: 12 }}>Nível: {course.level}</div>
            {modules.map((m) => (
              <div key={m} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Módulo {m}</div>
                {lessons.filter((l) => l.module_number === m).map((l) => (
                  <button key={l.lesson_id} onClick={() => (!enrolled && !free(l)) ? setNeedPay(true) : go("A preparar a aula… (a primeira vez demora um pouco)", () => loadLesson(l.lesson_id))}
                    style={{ ...box, width: "100%", textAlign: "left", background: "transparent", color: "inherit", cursor: "pointer", display: "block", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Aula {l.lesson_number}: {l.title}{!enrolled && (free(l) ? " · grátis" : " 🔒")}</div>
                    <div style={small}>{l.summary}</div>
                  </button>
                ))}
              </div>
            ))}
          </>
        )}

        {!needPay && view === "lesson" && lesson && (
          <>
            <div style={small}>Módulo {lesson.lesson.module_number} · Aula {lesson.lesson.lesson_number}</div>
            <h2 style={{ margin: "4px 0 6px" }}>{lesson.lesson.title}</h2>
            <p style={{ fontSize: 14, margin: "0 0 10px", lineHeight: 1.5 }}>{lesson.lesson.summary}</p>
            <div style={{ ...small, marginBottom: 10 }}>
              {lesson.lesson.video_minutes ? "Vídeo: " + lesson.lesson.video_minutes + " min · " : ""}
              Explicação: +{lesson.lesson.extra_minutes || 0} min
            </div>
            {lesson.video ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, marginBottom: 14 }}>
                <iframe src={lesson.video.embed_url} title="Vídeo da aula" allowFullScreen
                  allow="accelerometer; encrypted-media; picture-in-picture"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, borderRadius: 12 }} />
              </div>
            ) : (
              <div style={{ ...small, marginBottom: 14 }}>Esta aula não tem vídeo. A explicação é só por texto.</div>
            )}
            {pts.map((p, i) => (
              <Ponto key={p.point_id} p={p} index={i + 1} onChanged={() => loadLesson(lesson.lesson.lesson_id).catch(() => {})} />
            ))}
            {allDone && <Fim lessonId={lesson.lesson.lesson_id} />}
            {allDone && !enrolled && (
              <div style={box}>
                <p style={{ fontSize: 14, margin: "0 0 8px", lineHeight: 1.5 }}>Gostaste da primeira aula? Continua o curso com a inscrição semanal (600 Kz).</p>
                <button style={btn} onClick={() => setNeedPay(true)}>Continuar o curso</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
