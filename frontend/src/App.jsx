import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { api } from "./api.js";
import { C } from "./tokens.js";
import Auth from "./pages/Auth.jsx";
import Chat from "./pages/Chat.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import SiteBuilder from "./pages/SiteBuilder.jsx";
import PaymentModal from "./components/PaymentModal.jsx";
import PhoneVerifyBanner from "./components/PhoneVerifyBanner.jsx";
import Sidebar from "./components/Sidebar.jsx";

export default function App() {
  if (window.location.pathname === "/admin") return <AdminPanel />;
  if (window.location.pathname === "/construtor") return <SiteBuilder />;

  return <MainApp />;
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loadingBoot, setLoadingBoot] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [me, setMe] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [projectList, setProjectList] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [phoneNoticeDismissed, setPhoneNoticeDismissed] = useState(localStorage.getItem("phone_notice_dismissed") === "1");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setLoadingBoot(false); return; }
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const projects = await api.listProjects();
      setProjectList(projects);
      let p = projects[0];
      if (!p) p = await api.createProject("Consultoria");
      const full = await api.getProject(p.project_id);
      setProject(full);
      const sub = await api.subscriptionStatus();
      setSubscription(sub);
      const meData = await api.me();
      setMe(meData);
      setUser({ authenticated: true });
    } catch {
      localStorage.removeItem("access_token");
    } finally {
      setLoadingBoot(false);
    }
  }

  async function refreshProjectList() {
    const projects = await api.listProjects();
    setProjectList(projects);
  }

  async function onAuthenticated() {
    setLoadingBoot(true);
    await bootstrap();
  }

  async function onNewConversation() {
    setLoadingBoot(true);
    const p = await api.createProject("Consultoria " + new Date().toLocaleDateString("pt-PT"));
    const full = await api.getProject(p.project_id);
    setProject(full);
    await refreshProjectList();
    if (window.innerWidth < 768) setSidebarOpen(false);
    setLoadingBoot(false);
  }

  async function onSelectProject(projectId) {
    setLoadingBoot(true);
    const full = await api.getProject(projectId);
    setProject(full);
    if (window.innerWidth < 768) setSidebarOpen(false);
    setLoadingBoot(false);
  }

  async function onUpgrade(plan) {
    const data = await api.createSubscription(plan);
    setPaymentInfo(data);
  }

  function dismissPhoneNotice() {
    localStorage.setItem("phone_notice_dismissed", "1");
    setPhoneNoticeDismissed(true);
  }

  async function onOpenCourse() {
    setLoadingBoot(true);
    const p = await api.createProject("Curso de Marketing Digital", "curso_marketing");
    const full = await api.getProject(p.project_id);
    setProject(full);
    await refreshProjectList();
    if (window.innerWidth < 768) setSidebarOpen(false);
    setLoadingBoot(false);
  }

  if (loadingBoot) return <Centered>A carregar…</Centered>;
  if (!user) return <Auth onAuthenticated={onAuthenticated} />;
  if (!project) return <Centered>A preparar o teu projeto…</Centered>;

  return (
    <div style={{ height: "100vh", display: "flex", background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.ink, overflow: "hidden" }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        projects={projectList}
        currentId={project.project.project_id}
        onSelect={onSelectProject}
        onNewConversation={onNewConversation}
        me={me}
        subscription={subscription}
        onUpgrade={onUpgrade}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        onOpenCourse={onOpenCourse}
      />

      <div className="app-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ background: C.navy, color: "#fff", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Menu size={16} color="#fff" />
            </button>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <img src="/logo.png" alt="" style={{ width: 22, height: 22, borderRadius: 6, objectFit: "cover" }} />
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.6 }}>D3NA</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 500, fontFamily: "Georgia, serif", opacity: 0.78, marginTop: 2 }}>{project.project.name || "Decisões de negócio, com clareza"}</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {me && !me.phone_verified && !phoneNoticeDismissed && (
            <PhoneVerifyBanner onVerified={() => setMe({ ...me, phone_verified: true })} onDismiss={dismissPhoneNotice} />
          )}
          <Chat
            key={project.project.project_id}
            project={{ ...project.project, messages: project.messages, memory: project.memory }}
            subscription={subscription}
            onUpgrade={onUpgrade}
            onProjectUpdate={refreshProjectList}
          />
        </div>
      </div>

      {paymentInfo && <PaymentModal info={paymentInfo} onClose={() => setPaymentInfo(null)} />}

      <style>{`
        :root {
          --bg: #F5F6F8; --surface: #FFFFFF; --ink: #15181F; --ink-soft: #5B6270; --border: #E3E6EB;
          --navy: #16305C; --navy-soft: #EAF0F9; --accent: #2F6FE4; --accent: #2F6FE4; --accent: #2F6FE4; --green: #1E7A52; --green-bg: #EAF5EF;
          --amber: #946B1D; --amber-bg: #FAF1E1; --red: #B03A2E; --red-bg: #FBEAE8;
        }
        [data-theme="dark"] {
          --bg: #15171C; --surface: #1D2027; --ink: #ECEEF2; --ink-soft: #9AA1AE; --border: #2B2F38;
          --navy: #3663B0; --navy-soft: #202B40; --accent: #5B93F0; --accent: #5B93F0; --accent: #5B93F0; --green: #3FBE8B; --green-bg: #163229;
          --amber: #E0AA4E; --amber-bg: #3A2E15; --red: #E27263; --red-bg: #3B1D1A;
        }
        .sidebar {
          position: fixed; top: 0; left: 0; height: 100vh; width: 260px;
          background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; z-index: 50;
          transition: transform .22s ease;
        }
        .sidebar-closed { transform: translateX(-100%); }
        .sidebar-open { transform: translateX(0); }
        .sidebar-backdrop {
          position: fixed; inset: 0; background: rgba(21,24,31,0.45); z-index: 40;
          backdrop-filter: blur(2px);
        }
        @media (min-width: 768px) {
          .sidebar { position: static; transition: width .22s ease, border-color .22s ease; }
          .sidebar-closed { transform: none; width: 0; border-right: none; overflow: hidden; }
          .sidebar-open { width: 260px; }
          .sidebar-backdrop { display: none; }
        }
      `}</style>
    </div>
  );
}

function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.inkSoft, fontFamily: "-apple-system, sans-serif" }}>{children}</div>;
}
