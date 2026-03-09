import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   CREDENTIALS
═══════════════════════════════════════════════════════════ */
const USERS = [
  { email: "admin@industria.com",    password: "admin123",    role: "ADMIN",    name: "Super Admin",   id: 1 },
  { email: "hr@industria.com",       password: "hr123",       role: "HR",       name: "HR Manager",    id: 2 },
  { email: "employee@industria.com", password: "emp123",      role: "EMPLOYEE", name: "John Employee", id: 3 },
];

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const MOCK_EMPLOYEES = [
  { id:1, user:{name:"Arun Patel",   email:"arun@co.com",   is_active:true}, department:"Engineering", position:"Developer",       base_salary:85000 },
  { id:2, user:{name:"Priya Sharma", email:"priya@co.com",  is_active:true}, department:"Design",      position:"UI Designer",     base_salary:72000 },
  { id:3, user:{name:"Rahul Mehta",  email:"rahul@co.com",  is_active:true}, department:"Sales",       position:"Sales Executive", base_salary:68000 },
  { id:4, user:{name:"Sneha Rao",    email:"sneha@co.com",  is_active:false},department:"Marketing",   position:"Marketing Lead",  base_salary:78000 },
  { id:5, user:{name:"Vikram Singh", email:"vikram@co.com", is_active:true}, department:"Engineering", position:"Sr. Developer",   base_salary:95000 },
];

const MOCK_LEAVES = [
  { id:1, leave_type:"SICK",   days:2, start_date:"2026-03-10", end_date:"2026-03-11", reason:"Fever",        status:"PENDING"  },
  { id:2, leave_type:"CASUAL", days:3, start_date:"2026-03-15", end_date:"2026-03-17", reason:"Family event", status:"APPROVED" },
  { id:3, leave_type:"ANNUAL", days:5, start_date:"2026-03-20", end_date:"2026-03-24", reason:"Vacation",     status:"PENDING"  },
];

const MOCK_PAYROLL = [
  { id:1, employee_id:1, month:3, year:2026, base_salary:85000, bonus:5000, deductions:3000, net_salary:87000, status:"PENDING" },
  { id:2, employee_id:2, month:3, year:2026, base_salary:72000, bonus:3000, deductions:2500, net_salary:72500, status:"PAID"    },
  { id:3, employee_id:3, month:3, year:2026, base_salary:68000, bonus:2000, deductions:2000, net_salary:68000, status:"PENDING" },
];

const MOCK_REVENUE = [
  { month:1, amount:4500000, expense:2100000, profit:2400000 },
  { month:2, amount:5200000, expense:2400000, profit:2800000 },
  { month:3, amount:4800000, expense:2200000, profit:2600000 },
  { month:4, amount:6100000, expense:2700000, profit:3400000 },
  { month:5, amount:5500000, expense:2500000, profit:3000000 },
  { month:6, amount:6700000, expense:2900000, profit:3800000 },
];

const MOCK_LOGS = [
  { action:"Employee added",        user:"HR Manager",  created_at:"2026-03-09T10:30:00" },
  { action:"Leave approved",        user:"HR Manager",  created_at:"2026-03-09T11:00:00" },
  { action:"Payroll processed",     user:"HR Manager",  created_at:"2026-03-09T12:00:00" },
  { action:"Revenue entry saved",   user:"Super Admin", created_at:"2026-03-09T13:00:00" },
  { action:"Email announcement sent",user:"HR Manager", created_at:"2026-03-09T14:00:00" },
];

/* ═══════════════════════════════════════════════════════════
   AI HOOK
═══════════════════════════════════════════════════════════ */
function useAI() {
  const [aiLoading, setAiLoading] = useState(false);
  const ask = async (system, user) => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      const d = await res.json();
      return d.content?.[0]?.text || "No response.";
    } catch { return "AI unavailable. Check your API key."; }
    finally { setAiLoading(false); }
  };
  return { ask, aiLoading };
}

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const GLOW  = { ADMIN: "#ff6b35", HR: "#00f5d4", EMPLOYEE: "#a78bfa" };
const LABEL = { ADMIN: "Super Admin", HR: "HR Manager", EMPLOYEE: "Employee" };
const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const NAV = {
  ADMIN:    [["⬡","dashboard","Overview"],["◈","hrmonitor","HR Monitor"],["◎","revenue","Revenue"],["◉","comms","Communications"]],
  HR:       [["⬡","dashboard","Overview"],["◈","employees","Employees"],["◎","leaves","Leave Mgmt"],["◉","payroll","Payroll"],["⬟","comms","Communications"]],
  EMPLOYEE: [["⬡","dashboard","Overview"],["◎","myleave","My Leaves"],["◉","mypayroll","My Payroll"],["◈","profile","My Profile"]],
};

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg0:#020812; --bg1:#060f1e; --bg2:#0a1628;
    --glass:rgba(255,255,255,0.04); --border:rgba(255,255,255,0.09);
    --text:#e8edf5; --mute:rgba(255,255,255,0.35);
    --cyan:#00f5d4; --orange:#ff6b35; --purple:#a78bfa;
    --red:#ff4466; --yellow:#ffd166;
  }
  html,body { background:var(--bg0); color:var(--text); font-family:'Space Grotesk',sans-serif; height:100%; overflow:hidden; }
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,245,212,0.25); border-radius:99px; }
  input,textarea,select { font-family:'Space Grotesk',sans-serif; background:rgba(255,255,255,0.04); border:1px solid var(--border); color:var(--text); outline:none; transition:border 0.2s,box-shadow 0.2s; }
  input:focus,textarea:focus,select:focus { border-color:rgba(0,245,212,0.4); box-shadow:0 0 0 3px rgba(0,245,212,0.07); }
  input::placeholder,textarea::placeholder { color:rgba(255,255,255,0.2); }
  select option { background:#060f1e; }
  button { font-family:'Space Grotesk',sans-serif; cursor:pointer; border:none; }
  button:disabled { opacity:0.5; cursor:not-allowed; }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes orb     { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(30px,-20px) scale(1.08);} }
  @keyframes fadein  { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes blink   { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  @keyframes bounce3 { 0%,80%,100%{transform:translateY(0);} 40%{transform:translateY(-7px);} }
  @keyframes shimmer { 0%{left:-100%;} 100%{left:200%;} }
`;

/* ═══════════════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════════════ */
function Card({ children, glow, style, onClick }) {
  const g = glow || "transparent";
  return (
    <div onClick={onClick} style={{
      background:"var(--glass)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      border:"1px solid var(--border)", borderRadius:18, position:"relative", overflow:"hidden",
      boxShadow: glow ? `0 4px 24px rgba(0,0,0,0.5),0 0 0 1px ${g}18,inset 0 1px 0 rgba(255,255,255,0.06)` : "0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)",
      animation:"fadein 0.35s ease both", ...style,
    }}>
      {glow && <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse at 0% 0%,${g}0a 0%,transparent 60%)`,pointerEvents:"none" }} />}
      {children}
    </div>
  );
}

function Btn({ children, color="var(--cyan)", onClick, style, disabled, outline }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding:"9px 20px", borderRadius:11, fontSize:13, fontWeight:600, letterSpacing:"0.3px",
      background: outline ? "transparent" : `${color}18`, border:`1px solid ${color}44`, color,
      transition:"all 0.18s", boxShadow:`0 0 16px ${color}18`, ...style,
    }}
    onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.background=`${color}28`;e.currentTarget.style.boxShadow=`0 0 24px ${color}44`;e.currentTarget.style.transform="translateY(-1px)";} }}
    onMouseLeave={e=>{ e.currentTarget.style.background=outline?"transparent":`${color}18`;e.currentTarget.style.boxShadow=`0 0 16px ${color}18`;e.currentTarget.style.transform="translateY(0)"; }}
    >{children}</button>
  );
}

function Badge({ children, color }) {
  return <span style={{ padding:"3px 11px",borderRadius:20,fontSize:11,fontWeight:700,background:`${color}16`,color,border:`1px solid ${color}35`,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap" }}>{children}</span>;
}

function SectionHead({ children, color="var(--cyan)" }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:16 }}>
      <div style={{ width:2,height:16,borderRadius:2,background:color,boxShadow:`0 0 8px ${color}` }} />
      <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff",letterSpacing:"1.2px",textTransform:"uppercase" }}>{children}</span>
    </div>
  );
}

function Field({ label, type="text", value, onChange, placeholder, readOnly, style }) {
  return (
    <div style={{ marginBottom:11, ...style }}>
      {label && <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"1.4px",textTransform:"uppercase",marginBottom:5 }}>{label}</div>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{ width:"100%",padding:"10px 13px",borderRadius:11,fontSize:13,background:readOnly?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.04)",color:readOnly?"var(--mute)":"var(--text)" }} />
    </div>
  );
}

function Drop({ label, value, onChange, options, style }) {
  return (
    <div style={{ marginBottom:11, ...style }}>
      {label && <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"1.4px",textTransform:"uppercase",marginBottom:5 }}>{label}</div>}
      <select value={value} onChange={onChange} style={{ width:"100%",padding:"10px 13px",borderRadius:11,fontSize:13 }}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

function Spinner({ color="var(--cyan)", size=18 }) {
  return <span style={{ display:"inline-block",width:size,height:size,border:`2px solid ${color}30`,borderTop:`2px solid ${color}`,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />;
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const c = type==="error" ? "var(--red)" : "var(--cyan)";
  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:9999,padding:"13px 18px",background:`${c}14`,border:`1px solid ${c}40`,borderRadius:14,color:c,fontSize:13,fontWeight:600,backdropFilter:"blur(20px)",boxShadow:`0 0 24px ${c}20`,maxWidth:320,animation:"fadein 0.3s ease" }}>
      {type==="error"?"⚠ ":"✓ "}{msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED BACKGROUND
═══════════════════════════════════════════════════════════ */
function BG() {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,#020812 0%,#060f1e 45%,#09071a 75%,#030b15 100%)" }} />
      <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,245,212,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.025) 1px,transparent 1px)",backgroundSize:"64px 64px" }} />
      <div style={{ position:"absolute",width:560,height:560,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,245,212,0.07) 0%,transparent 70%)",top:"-15%",left:"-12%",filter:"blur(50px)",animation:"orb 12s ease-in-out infinite" }} />
      <div style={{ position:"absolute",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,53,0.06) 0%,transparent 70%)",bottom:"-8%",right:"-8%",filter:"blur(50px)",animation:"orb 15s ease-in-out infinite reverse" }} />
      <div style={{ position:"absolute",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,0.05) 0%,transparent 70%)",top:"45%",left:"48%",filter:"blur(50px)",animation:"orb 18s ease-in-out infinite 2s" }} />
      {[...Array(8)].map((_,i)=>(
        <div key={i} style={{ position:"absolute",borderRadius:"50%",width:3+Math.sin(i)*2,height:3+Math.sin(i)*2,
          background:["var(--cyan)","var(--orange)","var(--purple)","var(--cyan)","var(--yellow)","var(--orange)","var(--cyan)","var(--purple)"][i],
          left:`${12+i*11}%`,top:`${18+Math.sin(i*0.8)*22}%`,
          boxShadow:`0 0 14px ${["var(--cyan)","var(--orange)","var(--purple)","var(--cyan)","var(--yellow)","var(--orange)","var(--cyan)","var(--purple)"][i]}`,
          animation:`blink ${3.5+i*0.6}s ${i*0.4}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════ */
function KPI({ icon, label, value, sub, color }) {
  return (
    <Card glow={color} style={{ padding:"20px 18px" }}>
      <div style={{ position:"absolute",top:-15,right:-15,width:70,height:70,borderRadius:"50%",background:`${color}14`,filter:"blur(18px)",pointerEvents:"none" }} />
      <div style={{ fontSize:26,marginBottom:10 }}>{icon}</div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:21,color:"#fff",letterSpacing:"-0.5px" }}>{value}</div>
      <div style={{ fontSize:11,color:"var(--mute)",marginTop:3,letterSpacing:"0.4px" }}>{label}</div>
      {sub && <div style={{ fontSize:11,color,marginTop:6,fontWeight:700 }}>{sub}</div>}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   AI SMART SUMMARY
═══════════════════════════════════════════════════════════ */
function AISmartSummary({ user }) {
  const glow = GLOW[user.role];
  const [summary, setSummary] = useState("");
  const { ask, aiLoading } = useAI();

  const PROMPTS = {
    ADMIN:    "Generate a concise 3-bullet executive business summary. Cover: revenue health, workforce status, one risk. Use • bullets only. No headers.",
    HR:       "Generate a concise 3-bullet HR summary. Cover: employee management, leave pipeline, payroll status. Use • bullets only. No headers.",
    EMPLOYEE: "Generate a brief 3-bullet personal work productivity tip set. Cover: leave management, salary, attendance. Use • bullets only. No headers.",
  };

  const gen = async () => {
    const res = await ask("You are a concise business intelligence assistant inside IndustriaOS. Respond with exactly 3 bullet points using • symbol. No headers, no extra text.", PROMPTS[user.role]);
    setSummary(res);
  };

  return (
    <Card glow={glow} style={{ padding:"22px 24px" }}>
      <div style={{ position:"absolute",top:0,left:0,width:"40%",height:"100%",background:`linear-gradient(90deg,transparent,${glow}08,transparent)`,animation:"shimmer 3s ease-in-out infinite",pointerEvents:"none" }} />
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:summary?14:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:`${glow}18`,border:`1.5px solid ${glow}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17 }}>🤖</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff",letterSpacing:"0.8px" }}>AI SMART SUMMARY</div>
            <div style={{ fontSize:10,color:"var(--mute)",marginTop:1 }}>Powered by Claude</div>
          </div>
        </div>
        <Btn color={glow} onClick={gen} disabled={aiLoading} style={{ padding:"7px 15px",fontSize:12 }}>
          {aiLoading ? <span style={{ display:"flex",alignItems:"center",gap:6 }}><Spinner color={glow} size={13}/> Generating…</span> : "⚡ Generate"}
        </Btn>
      </div>
      {summary
        ? <p style={{ fontSize:13,color:"rgba(255,255,255,0.72)",lineHeight:1.85,whiteSpace:"pre-line",margin:0,marginTop:12 }}>{summary}</p>
        : <p style={{ fontSize:12,color:"rgba(255,255,255,0.2)",fontStyle:"italic",marginTop:8 }}>Click Generate to get an AI-powered summary of your dashboard.</p>
      }
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   AI CHAT PANEL
═══════════════════════════════════════════════════════════ */
function AIChatPanel({ user, onClose }) {
  const glow = GLOW[user.role];
  const [msgs, setMsgs]     = useState([{ role:"ai", text:`Hey ${user.name.split(" ")[0]}! 👋 I'm your IndustriaOS AI — ask me anything about employees, payroll, leaves, or business insights.` }]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const { ask } = useAI();
  const bottom = useRef(null);
  useEffect(()=>{ bottom.current?.scrollIntoView({ behavior:"smooth" }); },[msgs,typing]);

  const QUICK = {
    ADMIN:    ["Revenue summary","AI warnings","Team performance"],
    HR:       ["Leave tips","Payroll advice","Employee insights"],
    EMPLOYEE: ["My leave balance","Salary info","Productivity tips"],
  };

  const SYS = `You are IndustriaOS AI — an intelligent business assistant built into a role-based management platform.
User: ${user.name}, Role: ${user.role}.
Company data: 5 employees, Monthly payroll ₹4.98L, Revenue ₹67L (Jun), Profit ₹38L, 3 pending leaves, 2 pending payrolls.
Be concise, direct, professional. Tailor insights to the ${user.role} role.`;

  const send = async (msg) => {
    const m = (msg || input).trim();
    if (!m) return;
    setInput("");
    setMsgs(p=>[...p,{ role:"user",text:m }]);
    setTyping(true);
    const reply = await ask(SYS, m);
    setTyping(false);
    setMsgs(p=>[...p,{ role:"ai",text:reply }]);
  };

  return (
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:1000,width:370,height:490,display:"flex",flexDirection:"column",
      background:"rgba(4,10,22,0.97)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      border:`1px solid ${glow}40`,borderRadius:22,boxShadow:`0 0 60px ${glow}18,0 20px 60px rgba(0,0,0,0.6)`,animation:"fadein 0.3s ease" }}>

      <div style={{ padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:`${glow}18`,border:`1.5px solid ${glow}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🤖</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,color:"#fff",letterSpacing:"0.6px" }}>INDUSTRIA AI</div>
            <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:1 }}>
              <div style={{ width:6,height:6,borderRadius:"50%",background:"var(--cyan)",boxShadow:"0 0 6px var(--cyan)",animation:"blink 1.8s infinite" }} />
              <span style={{ fontSize:10,color:"var(--mute)" }}>Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,80,80,0.1)",border:"1px solid rgba(255,80,80,0.28)",borderRadius:8,padding:"6px 10px",color:"#ff7a7a",fontSize:12 }}>✕</button>
      </div>

      <div style={{ flex:1,overflowY:"auto",padding:"13px 14px",display:"flex",flexDirection:"column",gap:10 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{
              maxWidth:"82%",padding:"9px 13px",fontSize:13,lineHeight:1.6,
              borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
              background:m.role==="user"?`linear-gradient(135deg,${glow},${glow}99)`:"rgba(255,255,255,0.06)",
              color:m.role==="user"?"#000":"rgba(255,255,255,0.82)",
              border:m.role==="ai"?"1px solid rgba(255,255,255,0.07)":"none",
            }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex",justifyContent:"flex-start" }}>
            <div style={{ background:"rgba(255,255,255,0.06)",padding:"11px 15px",borderRadius:"16px 16px 16px 4px",display:"flex",gap:5,border:"1px solid rgba(255,255,255,0.07)" }}>
              {[0,1,2].map(i=><span key={i} style={{ width:7,height:7,borderRadius:"50%",background:glow,display:"inline-block",animation:`bounce3 1.1s infinite ${i*0.18}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div style={{ padding:"7px 12px",display:"flex",gap:6,overflowX:"auto",flexShrink:0 }}>
        {QUICK[user.role].map(q=>(
          <button key={q} onClick={()=>send(q)} style={{ whiteSpace:"nowrap",padding:"5px 11px",borderRadius:20,background:`${glow}10`,border:`1px solid ${glow}30`,color:glow,fontSize:11,fontWeight:600 }}>{q}</button>
        ))}
      </div>

      <div style={{ padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:7,flexShrink:0 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask IndustriaOS AI…"
          style={{ flex:1,padding:"9px 13px",borderRadius:11,fontSize:13 }} />
        <button onClick={()=>send()} style={{ padding:"9px 13px",borderRadius:11,background:`${glow}18`,border:`1px solid ${glow}40`,color:glow,fontSize:15 }}>➤</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
function Sidebar({ user, page, setPage, onLogout }) {
  const glow = GLOW[user.role];
  return (
    <div style={{ width:210,minHeight:"100vh",position:"relative",zIndex:10,flexShrink:0,
      background:"rgba(2,8,18,0.6)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",
      borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column" }}>

      <div style={{ padding:"22px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${glow},${glow}66)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 0 18px ${glow}55` }}>⬡</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff",letterSpacing:"2px" }}>INDUSTRIA</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:9,color:glow,letterSpacing:"3px" }}>OS v1.0</div>
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 18px 11px",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:36,height:36,borderRadius:9,background:`${glow}18`,border:`1.5px solid ${glow}50`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12,color:glow,boxShadow:`0 0 12px ${glow}28`,flexShrink:0 }}>{user.avatar}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{user.name}</div>
            <div style={{ fontSize:10,color:glow,fontWeight:600,letterSpacing:"0.3px" }}>{LABEL[user.role]}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1,padding:"10px 10px" }}>
        {NAV[user.role].map(([icon,id,label])=>{
          const active = page===id;
          return (
            <button key={id} onClick={()=>setPage(id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:11,border:"none",marginBottom:3,
              background:active?`${glow}16`:"transparent",
              borderLeft:active?`2px solid ${glow}`:"2px solid transparent",
              color:active?"#fff":"rgba(255,255,255,0.32)",
              fontSize:12,fontWeight:active?600:400,transition:"all 0.18s",textAlign:"left",
              boxShadow:active?`inset 0 0 20px ${glow}07`:"none",
            }}>
              <span style={{ fontSize:14,color:active?glow:"rgba(255,255,255,0.22)" }}>{icon}</span>
              <span>{label}</span>
              {active && <div style={{ marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:glow,boxShadow:`0 0 7px ${glow}` }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={onLogout} style={{ width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 13px",borderRadius:11,border:"1px solid rgba(255,80,80,0.18)",background:"rgba(255,80,80,0.05)",color:"#ff8888",fontSize:12,fontWeight:500 }}>🚪 Sign Out</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════════ */
function Topbar({ user, page, onAI }) {
  const glow = GLOW[user.role];
  const TITLES = { dashboard:"Dashboard",hrmonitor:"HR Monitor",revenue:"Revenue Analytics",comms:"Communications",employees:"Employees",leaves:"Leave Management",payroll:"Payroll",myleave:"My Leaves",mypayroll:"My Payroll",profile:"My Profile" };
  const now = new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  return (
    <div style={{ height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",flexShrink:0,position:"relative",zIndex:10,background:"rgba(2,8,18,0.5)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#fff",letterSpacing:"0.8px" }}>{TITLES[page]||"Dashboard"}</div>
        <div style={{ fontSize:10,color:"var(--mute)",marginTop:1 }}>{now}</div>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:11 }}>
        <button onClick={onAI} style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 15px",borderRadius:11,background:`${glow}10`,border:`1px solid ${glow}30`,color:glow,fontSize:12,fontWeight:700 }}>🤖 AI Assistant</button>
        <div style={{ position:"relative" }}>
          <div style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer" }}>🔔</div>
          <div style={{ position:"absolute",top:-2,right:-2,width:9,height:9,borderRadius:"50%",background:glow,boxShadow:`0 0 6px ${glow}`,border:"2px solid var(--bg0)" }} />
        </div>
        <Badge color={glow}>{LABEL[user.role]}</Badge>
        <div style={{ width:34,height:34,borderRadius:9,background:`${glow}18`,border:`1.5px solid ${glow}40`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:11,color:glow,boxShadow:`0 0 12px ${glow}28` }}>{user.avatar}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVENUE CHART
═══════════════════════════════════════════════════════════ */
function RevenueBar({ data }) {
  if (!data?.length) return <Card style={{ padding:22,display:"flex",alignItems:"center",justifyContent:"center",minHeight:200 }}><span style={{ color:"var(--mute)",fontSize:13 }}>No revenue data</span></Card>;
  const chart = [...data].slice(0,6).map(d=>({ name:MONTHS[d.month],Revenue:d.amount,Expense:d.expense }));
  const tip = { contentStyle:{background:"rgba(4,10,22,0.95)",border:"1px solid rgba(0,245,212,0.3)",borderRadius:10,fontSize:12},cursor:{fill:"rgba(0,245,212,0.04)"} };
  return (
    <Card style={{ padding:"20px 18px" }}>
      <SectionHead>Revenue vs Expense Trend</SectionHead>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chart} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize:10}} axisLine={false} tickLine={false} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} />
          <Tooltip {...tip} formatter={(v,n)=>[`₹${v.toLocaleString("en-IN")}`,n]} />
          <Legend wrapperStyle={{fontSize:11}} />
          <Bar dataKey="Revenue" fill="var(--cyan)"   radius={[6,6,0,0]} />
          <Bar dataKey="Expense" fill="var(--orange)" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function PerfBars() {
  const data = [{ name:"Sales",value:65 },{ name:"Marketing",value:52 },{ name:"Operations",value:48 },{ name:"Development",value:72 }];
  const colors = ["var(--cyan)","var(--orange)","var(--purple)","var(--yellow)"];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      {data.map((d,i)=>(
        <div key={i}>
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:4 }}><span>{d.name}</span><span style={{ color:colors[i%4],fontWeight:700 }}>{d.value}%</span></div>
          <div style={{ height:6,borderRadius:4,background:"rgba(255,255,255,0.07)",overflow:"hidden" }}>
            <div style={{ width:`${d.value}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg,${colors[i%4]},${colors[(i+1)%4]})`,boxShadow:`0 0 8px ${colors[i%4]}60`,transition:"width 1s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════ */
function AdminDash({ user }) {
  const total = MOCK_PAYROLL.reduce((s,p)=>s+p.net_salary,0);
  const revenue = MOCK_REVENUE[MOCK_REVENUE.length-1];
  const WARNINGS = [
    { level:"ALERT",   icon:"⚠️", message:"3 payroll entries pending for March 2026." },
    { level:"NOTICE",  icon:"📅", message:"2 leave requests awaiting HR approval." },
    { level:"OK",      icon:"✅", message:"Revenue up 21.8% compared to last month." },
  ];
  const LC = { CRITICAL:"var(--red)",ALERT:"var(--orange)",WARNING:"#ff8c00",NOTICE:"var(--yellow)",OK:"var(--cyan)" };
  return (
    <div style={{ padding:22,display:"flex",flexDirection:"column",gap:18 }}>
      <AISmartSummary user={user} />
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13 }}>
        <KPI icon="👥" label="Total Employees"  value={MOCK_EMPLOYEES.length}                              sub="In system"  color="var(--cyan)"   />
        <KPI icon="🧑‍💼" label="Active Employees"  value={MOCK_EMPLOYEES.filter(e=>e.user.is_active).length} sub="Active"     color="var(--orange)" />
        <KPI icon="💰" label="Monthly Payroll"  value={`₹${(total/100000).toFixed(1)}L`}                  sub="This month" color="var(--purple)" />
        <KPI icon="📈" label="Revenue"          value={`₹${(revenue.amount/100000).toFixed(1)}L`}         sub="Latest"     color="var(--cyan)"   />
        <KPI icon="🏆" label="Net Profit"       value={`₹${(revenue.profit/100000).toFixed(1)}L`}         sub="Latest"     color="var(--orange)" />
        <KPI icon="📊" label="Profit Margin"    value={`${((revenue.profit/revenue.amount)*100).toFixed(1)}%`} sub="Ratio" color="var(--purple)" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.65fr 1fr",gap:13 }}>
        <RevenueBar data={MOCK_REVENUE} />
        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          <Card style={{ padding:"18px 20px",flex:1 }}>
            <SectionHead color="var(--purple)">Dept Performance</SectionHead>
            <PerfBars />
          </Card>
          <Card style={{ padding:"18px 20px" }}>
            <SectionHead color="var(--orange)">AI Warnings</SectionHead>
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {WARNINGS.map((w,i)=>{
                const c = LC[w.level]||"var(--cyan)";
                return (
                  <div key={i} style={{ display:"flex",gap:9,padding:"9px 11px",background:`${c}09`,border:`1px solid ${c}20`,borderRadius:10 }}>
                    <span style={{ fontSize:14 }}>{w.icon}</span>
                    <div>
                      <div style={{ fontSize:9,fontWeight:700,color:c,letterSpacing:"1.4px",textTransform:"uppercase" }}>{w.level}</div>
                      <div style={{ fontSize:11,color:"rgba(255,255,255,0.65)",marginTop:1,lineHeight:1.4 }}>{w.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HR MONITOR
═══════════════════════════════════════════════════════════ */
function HRMonitorPage() {
  const COLS = ["var(--cyan)","var(--purple)","var(--orange)","var(--yellow)","var(--red)"];
  return (
    <div style={{ padding:22,display:"flex",flexDirection:"column",gap:18 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13 }}>
        <KPI icon="✅" label="Activity Logs"  value={MOCK_LOGS.length} sub="Total"      color="var(--cyan)"   />
        <KPI icon="📅" label="Today"          value={2}                sub="Today"      color="var(--orange)" />
        <KPI icon="👥" label="Active Users"   value={4}                sub="All roles"  color="var(--purple)" />
        <KPI icon="📨" label="Emails Sent"    value={12}               sub="This month" color="var(--cyan)"   />
      </div>
      <Card style={{ padding:"20px 22px" }}>
        <SectionHead>HR Activity Log</SectionHead>
        <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
          {MOCK_LOGS.map((l,i)=>(
            <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,borderLeft:`2px solid ${COLS[i%5]}` }}>
              <div>
                <span style={{ fontSize:12,color:"rgba(255,255,255,0.72)" }}>{l.action}</span>
                <span style={{ fontSize:11,color:"var(--mute)",marginLeft:8 }}>by {l.user}</span>
              </div>
              <span style={{ fontSize:10,color:"rgba(255,255,255,0.22)",flexShrink:0,marginLeft:14 }}>{new Date(l.created_at).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVENUE PAGE
═══════════════════════════════════════════════════════════ */
function RevenuePage() {
  const [revenue, setRevenue] = useState(MOCK_REVENUE);
  const [toast,   setToast]   = useState(null);
  const [form, setForm] = useState({ month:new Date().getMonth()+1,year:new Date().getFullYear(),amount:"",expense:"" });
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  const lat = revenue[revenue.length-1];
  const pred = { predicted: lat.amount * 1.12, growth_pct: 12.0, confidence: 87 };

  const save = () => {
    if (!form.amount||!form.expense) return toast_("Fill all fields","error");
    const entry = { month:+form.month,year:+form.year,amount:+form.amount,expense:+form.expense,profit:+form.amount - +form.expense };
    setRevenue(p=>[...p,entry]);
    toast_("Revenue saved!");
    setForm(p=>({...p,amount:"",expense:""}));
  };

  return (
    <div style={{ padding:22,display:"flex",flexDirection:"column",gap:18 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13 }}>
        <KPI icon="📈" label="Revenue" value={`₹${(lat.amount/100000).toFixed(1)}L`}  sub="Latest" color="var(--cyan)"   />
        <KPI icon="📉" label="Expense" value={`₹${(lat.expense/100000).toFixed(1)}L`} sub="Latest" color="var(--orange)" />
        <KPI icon="🏆" label="Profit"  value={`₹${(lat.profit/100000).toFixed(1)}L`}  sub="Latest" color="var(--purple)" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:13 }}>
        <RevenueBar data={revenue} />
        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          <Card glow="var(--purple)" style={{ padding:"18px 20px" }}>
            <SectionHead color="var(--purple)">AI Forecast</SectionHead>
            <div style={{ padding:"14px",background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.22)",borderRadius:12 }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:9,color:"var(--purple)",letterSpacing:"2px",marginBottom:5 }}>NEXT MONTH PREDICTION</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"var(--purple)" }}>₹{(pred.predicted/100000).toFixed(1)}L</div>
              <div style={{ fontSize:11,color:"var(--mute)",marginTop:3 }}>{pred.growth_pct}% growth · {pred.confidence}% confidence</div>
            </div>
          </Card>
          <Card style={{ padding:"18px 20px" }}>
            <SectionHead>Add Revenue</SectionHead>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
              <Field label="Month" type="number" value={form.month}   onChange={e=>setForm(p=>({...p,month:e.target.value}))} />
              <Field label="Year"  type="number" value={form.year}    onChange={e=>setForm(p=>({...p,year:e.target.value}))} />
            </div>
            <Field label="Revenue ₹" type="number" value={form.amount}  onChange={e=>setForm(p=>({...p,amount:e.target.value}))}  placeholder="5000000" />
            <Field label="Expense ₹" type="number" value={form.expense} onChange={e=>setForm(p=>({...p,expense:e.target.value}))} placeholder="2000000" />
            <Btn color="var(--cyan)" onClick={save} style={{ width:"100%",textAlign:"center" }}>Save Revenue</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HR DASHBOARD
═══════════════════════════════════════════════════════════ */
function HRDash({ user }) {
  const total = MOCK_PAYROLL.reduce((s,p)=>s+p.net_salary,0);
  return (
    <div style={{ padding:22,display:"flex",flexDirection:"column",gap:18 }}>
      <AISmartSummary user={user} />
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13 }}>
        <KPI icon="👥" label="Employees"       value={MOCK_EMPLOYEES.length}                              sub="Active"       color="var(--cyan)"   />
        <KPI icon="📅" label="Pending Leaves"  value={MOCK_LEAVES.filter(l=>l.status==="PENDING").length} sub="Review"       color="var(--orange)" />
        <KPI icon="⏳" label="Payroll Pending" value={MOCK_PAYROLL.filter(p=>p.status!=="PAID").length}   sub="This month"   color="var(--purple)" />
        <KPI icon="💰" label="Payroll Total"   value={`₹${(total/100000).toFixed(1)}L`}                  sub="This month"   color="var(--cyan)"   />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPLOYEES
═══════════════════════════════════════════════════════════ */
function EmployeesPage() {
  const [emps,    setEmps]    = useState(MOCK_EMPLOYEES);
  const [search,  setSearch]  = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [toast,   setToast]   = useState(null);
  const [form, setForm] = useState({ name:"",email:"",department:"",position:"",base_salary:"" });
  const COLS = ["var(--purple)","var(--orange)","var(--cyan)","var(--yellow)","var(--red)","#34d399"];
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const add = () => {
    if (!form.name||!form.email) return toast_("Fill required fields","error");
    setEmps(p=>[...p,{ id:Date.now(),user:{name:form.name,email:form.email,is_active:true},department:form.department,position:form.position,base_salary:+form.base_salary||0 }]);
    toast_("Employee added!"); setShowAdd(false); setForm({name:"",email:"",department:"",position:"",base_salary:""});
  };

  const del = (id) => { if(window.confirm("Deactivate?")) { setEmps(p=>p.filter(e=>e.id!==id)); toast_("Removed!"); } };
  const filtered = emps.filter(e=>e.user.name.toLowerCase().includes(search.toLowerCase())||e.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:22 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <SectionHead color="var(--cyan)">Employee Directory</SectionHead>
        <Btn color="var(--cyan)" onClick={()=>setShowAdd(p=>!p)}>+ Add Employee</Btn>
      </div>

      {showAdd && (
        <Card glow="var(--cyan)" style={{ padding:22,marginBottom:18,animation:"fadein 0.25s ease" }}>
          <SectionHead>New Employee</SectionHead>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
            <Field label="Full Name"   value={form.name}        onChange={e=>setForm(p=>({...p,name:e.target.value}))}        placeholder="Arun Patel" />
            <Field label="Email"       value={form.email}       onChange={e=>setForm(p=>({...p,email:e.target.value}))}       placeholder="arun@co.com" />
            <Field label="Department"  value={form.department}  onChange={e=>setForm(p=>({...p,department:e.target.value}))}  placeholder="Engineering" />
            <Field label="Position"    value={form.position}    onChange={e=>setForm(p=>({...p,position:e.target.value}))}    placeholder="Developer" />
            <Field label="Base Salary" value={form.base_salary} onChange={e=>setForm(p=>({...p,base_salary:e.target.value}))} type="number" placeholder="85000" />
          </div>
          <div style={{ display:"flex",gap:9,marginTop:4 }}>
            <Btn color="var(--cyan)" onClick={add}>Save</Btn>
            <Btn color="var(--red)"  onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ position:"relative",marginBottom:14 }}>
        <span style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",opacity:0.35,fontSize:14 }}>🔍</span>
        <input placeholder="Search by name or department…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:"100%",padding:"10px 13px 10px 38px",borderRadius:11,fontSize:13 }} />
      </div>

      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              {["Employee","Department","Position","Salary","Status",""].map(h=>(
                <th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:10,color:"var(--mute)",letterSpacing:"1.2px",textTransform:"uppercase",fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>{
              const col = COLS[i%COLS.length];
              const av  = e.user.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
              return (
                <tr key={e.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.02)"}
                  onMouseLeave={ev=>ev.currentTarget.style.background=""}>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:32,height:32,borderRadius:8,background:`${col}18`,border:`1.5px solid ${col}40`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:11,color:col,flexShrink:0 }}>{av}</div>
                      <span style={{ fontWeight:600 }}>{e.user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px",color:"var(--mute)" }}>{e.department}</td>
                  <td style={{ padding:"11px 14px",color:"var(--mute)" }}>{e.position}</td>
                  <td style={{ padding:"11px 14px",fontWeight:600 }}>₹{e.base_salary.toLocaleString("en-IN")}</td>
                  <td style={{ padding:"11px 14px" }}><Badge color={e.user.is_active?"var(--cyan)":"var(--red)"}>{e.user.is_active?"Active":"Inactive"}</Badge></td>
                  <td style={{ padding:"11px 14px" }}><Btn color="var(--red)" style={{ padding:"4px 11px",fontSize:11 }} onClick={()=>del(e.id)}>Remove</Btn></td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={6} style={{ padding:30,textAlign:"center",color:"var(--mute)",fontSize:13 }}>No employees found</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEAVES (HR)
═══════════════════════════════════════════════════════════ */
function LeavesPage() {
  const [leaves,  setLeaves]  = useState(MOCK_LEAVES);
  const [filter,  setFilter]  = useState("PENDING");
  const [aiDec,   setAiDec]   = useState({});
  const [toast,   setToast]   = useState(null);
  const { ask, aiLoading }    = useAI();
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const review = (id,status) => { setLeaves(p=>p.map(l=>l.id===id?{...l,status}:l)); toast_(`Leave ${status.toLowerCase()}!`); };

  const analyze = async (l) => {
    const r = await ask(
      "You are an HR AI. Give a 1-sentence recommendation: approve or flag, with brief reason. Be direct.",
      `Leave: ${l.leave_type}, Days: ${l.days}, From: ${l.start_date} To: ${l.end_date}, Reason: ${l.reason||"Not provided"}. Recommend?`
    );
    setAiDec(p=>({...p,[l.id]:r}));
  };

  const filtered = leaves.filter(l=>l.status===filter);

  return (
    <div style={{ padding:22 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <SectionHead>Leave Requests</SectionHead>
        <div style={{ display:"flex",gap:7 }}>
          {["PENDING","APPROVED","REJECTED"].map(s=>(
            <Btn key={s} color={filter===s?"var(--cyan)":"rgba(255,255,255,0.2)"} style={{ padding:"5px 13px",fontSize:11 }} onClick={()=>setFilter(s)}>{s}</Btn>
          ))}
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
        {filtered.map(l=>(
          <Card key={l.id} style={{ padding:"15px 18px" }}>
            <div style={{ display:"flex",alignItems:"flex-start",gap:13 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:"#fff" }}>Leave #{l.id} — {l.leave_type}</div>
                <div style={{ fontSize:11,color:"var(--mute)",marginTop:3 }}>{l.days} days · {l.start_date} → {l.end_date}</div>
                {l.reason && <div style={{ fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:3 }}>"{l.reason}"</div>}
                {aiDec[l.id]
                  ? <div style={{ marginTop:8,padding:"7px 11px",background:"rgba(0,245,212,0.06)",border:"1px solid rgba(0,245,212,0.2)",borderRadius:8,fontSize:11,color:"#67e8f9" }}>🤖 {aiDec[l.id]}</div>
                  : l.status==="PENDING" && (
                    <button onClick={()=>analyze(l)} disabled={aiLoading} style={{ marginTop:7,background:"none",border:"none",color:"var(--cyan)",fontSize:11,display:"flex",alignItems:"center",gap:4,padding:0 }}>
                      {aiLoading?<Spinner size={11}/>:"🤖"} AI Analyze
                    </button>
                  )
                }
              </div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:7 }}>
                <Badge color={l.status==="APPROVED"?"var(--cyan)":l.status==="REJECTED"?"var(--red)":"var(--yellow)"}>{l.status}</Badge>
                {l.status==="PENDING" && (
                  <div style={{ display:"flex",gap:7 }}>
                    <Btn color="var(--cyan)" style={{ padding:"5px 13px" }} onClick={()=>review(l.id,"APPROVED")}>Approve</Btn>
                    <Btn color="var(--red)"  style={{ padding:"5px 13px" }} onClick={()=>review(l.id,"REJECTED")}>Reject</Btn>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length===0 && <div style={{ color:"var(--mute)",fontSize:13,textAlign:"center",padding:40 }}>No {filter.toLowerCase()} leaves</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAYROLL (HR)
═══════════════════════════════════════════════════════════ */
function PayrollPage() {
  const [payrolls, setPayrolls] = useState(MOCK_PAYROLL);
  const [showAdd,  setShowAdd]  = useState(false);
  const [aiMsg,    setAiMsg]    = useState("");
  const [toast,    setToast]    = useState(null);
  const { ask, aiLoading }      = useAI();
  const now = new Date();
  const [form, setForm] = useState({ employee_id:"",base_salary:"",bonus:"0",deductions:"0" });
  const COLS = ["var(--purple)","var(--orange)","var(--cyan)","var(--yellow)"];
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const add = () => {
    if (!form.employee_id||!form.base_salary) return toast_("Fill all fields","error");
    const net = +form.base_salary + (+form.bonus||0) - (+form.deductions||0);
    setPayrolls(p=>[...p,{ id:Date.now(),employee_id:+form.employee_id,month:now.getMonth()+1,year:now.getFullYear(),base_salary:+form.base_salary,bonus:+form.bonus||0,deductions:+form.deductions||0,net_salary:net,status:"PENDING" }]);
    toast_("Payroll created!"); setShowAdd(false);
  };

  const markPaid = (id) => { setPayrolls(p=>p.map(x=>x.id===id?{...x,status:"PAID"}:x)); toast_("Marked paid! 📧"); };

  const aiProcess = async () => {
    const total   = payrolls.reduce((s,p)=>s+p.net_salary,0);
    const pending = payrolls.filter(p=>p.status!=="PAID").reduce((s,p)=>s+p.net_salary,0);
    const r = await ask(
      "You are a payroll AI. Write a professional 2-sentence payroll confirmation including amounts and date.",
      `Process payroll for ${MOCK_EMPLOYEES.length} employees. Total: ₹${total.toLocaleString("en-IN")}. Pending: ₹${pending.toLocaleString("en-IN")}. Date: ${now.toDateString()}.`
    );
    setAiMsg(r);
  };

  const net = (+form.base_salary||0)+(+form.bonus||0)-(+form.deductions||0);

  return (
    <div style={{ padding:22 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <SectionHead>Payroll — {MONTHS[now.getMonth()+1]} {now.getFullYear()}</SectionHead>
        <div style={{ display:"flex",gap:9 }}>
          <Btn color="var(--purple)" onClick={aiProcess} disabled={aiLoading} style={{ padding:"7px 14px",fontSize:12 }}>
            {aiLoading?<Spinner color="var(--purple)" size={12}/>:"🤖 AI Process"}
          </Btn>
          <Btn color="var(--cyan)" onClick={()=>setShowAdd(p=>!p)}>+ Add Payroll</Btn>
        </div>
      </div>

      {aiMsg && (
        <Card glow="var(--purple)" style={{ padding:"14px 18px",marginBottom:16 }}>
          <div style={{ fontSize:12,color:"#c4b5fd",lineHeight:1.7 }}>🤖 {aiMsg}</div>
        </Card>
      )}

      {showAdd && (
        <Card glow="var(--cyan)" style={{ padding:22,marginBottom:18,animation:"fadein 0.25s ease" }}>
          <SectionHead>Create Payroll Entry</SectionHead>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
            <Drop label="Employee" value={form.employee_id} onChange={e=>setForm(p=>({...p,employee_id:e.target.value}))}
              options={[{value:"",label:"Select employee"},...MOCK_EMPLOYEES.map(e=>({value:e.id,label:e.user.name}))]} />
            <Field label="Base Salary" type="number" value={form.base_salary} onChange={e=>setForm(p=>({...p,base_salary:e.target.value}))} placeholder="85000" />
            <Field label="Bonus"       type="number" value={form.bonus}       onChange={e=>setForm(p=>({...p,bonus:e.target.value}))}       placeholder="0" />
            <Field label="Deductions"  type="number" value={form.deductions}  onChange={e=>setForm(p=>({...p,deductions:e.target.value}))}  placeholder="0" />
          </div>
          <div style={{ padding:"11px 14px",background:"rgba(0,245,212,0.05)",border:"1px solid rgba(0,245,212,0.18)",borderRadius:11,marginBottom:13 }}>
            <span style={{ fontSize:12,color:"var(--mute)" }}>Net Salary: </span>
            <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,color:"var(--cyan)",fontSize:16 }}>₹{net.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display:"flex",gap:9 }}>
            <Btn color="var(--cyan)" onClick={add}>Create</Btn>
            <Btn color="var(--red)"  onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {payrolls.map((p,i)=>{
          const emp = MOCK_EMPLOYEES.find(e=>e.id===p.employee_id);
          const col = COLS[i%COLS.length];
          const av  = emp?.user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()||"--";
          return (
            <Card key={p.id} glow={p.status==="PAID"?"var(--cyan)":col} style={{ padding:"13px 16px",display:"flex",alignItems:"center",gap:13 }}>
              <div style={{ width:36,height:36,borderRadius:8,background:`${col}18`,border:`1.5px solid ${col}38`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:11,color:col,flexShrink:0 }}>{av}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#fff" }}>{emp?.user?.name||`Employee #${p.employee_id}`}</div>
                <div style={{ fontSize:11,color:"var(--mute)" }}>Base ₹{p.base_salary.toLocaleString("en-IN")} · Bonus ₹{p.bonus.toLocaleString("en-IN")} · Ded ₹{p.deductions.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#fff",marginRight:8 }}>₹{p.net_salary.toLocaleString("en-IN")}</div>
              <Badge color={p.status==="PAID"?"var(--cyan)":"var(--yellow)"}>{p.status}</Badge>
              {p.status!=="PAID" && <Btn color="var(--cyan)" style={{ padding:"5px 12px",fontSize:11,marginLeft:8 }} onClick={()=>markPaid(p.id)}>Mark Paid</Btn>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMMS
═══════════════════════════════════════════════════════════ */
function CommsPage() {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [dept,    setDept]    = useState("all");
  const [toast,   setToast]   = useState(null);
  const { ask, aiLoading }    = useAI();
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const send = () => {
    if (!subject||!body) return toast_("Fill subject and message","error");
    toast_("Email sent! 📨 (demo mode)"); setSubject(""); setBody("");
  };

  const draft = async () => {
    const r = await ask(
      "You are a professional business communication AI. Write an email body only — no subject, no greeting, no sign-off. Just the message body. Be clear and professional.",
      `Write a professional company announcement body about: "${subject||"company update"}". Department: ${dept==="all"?"All employees":dept}.`
    );
    setBody(r);
  };

  return (
    <div style={{ padding:22 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SectionHead>Send Announcement</SectionHead>
      <Card style={{ padding:24,maxWidth:560 }}>
        <Drop label="Send To" value={dept} onChange={e=>setDept(e.target.value)}
          options={[{value:"all",label:"All Employees"},{value:"Engineering",label:"Engineering"},{value:"Design",label:"Design"},{value:"Sales",label:"Sales"},{value:"Marketing",label:"Marketing"}]} />
        <Field label="Subject" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Enter subject…" />
        <div style={{ marginBottom:13 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
            <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"1.4px",textTransform:"uppercase" }}>Message</div>
            <button onClick={draft} disabled={aiLoading} style={{ background:"none",border:"none",color:"var(--cyan)",fontSize:11,display:"flex",alignItems:"center",gap:4 }}>
              {aiLoading?<Spinner size={11}/>:"🤖"} AI Draft
            </button>
          </div>
          <textarea rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message or use AI Draft…"
            style={{ width:"100%",padding:"10px 13px",borderRadius:11,fontSize:13,resize:"vertical" }} />
        </div>
        <Btn color="var(--cyan)" onClick={send} style={{ width:"100%",textAlign:"center" }}>Send Email 📨</Btn>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPLOYEE DASHBOARD
═══════════════════════════════════════════════════════════ */
function EmpDash({ user }) {
  const glow = GLOW[user.role];
  const myPayroll = MOCK_PAYROLL.find(p=>p.status==="PAID");
  return (
    <div style={{ padding:22,display:"flex",flexDirection:"column",gap:18 }}>
      <AISmartSummary user={user} />
      <Card glow={glow} style={{ padding:"22px 26px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <div style={{ width:58,height:58,borderRadius:14,background:`${glow}18`,border:`2px solid ${glow}40`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:glow,boxShadow:`0 0 18px ${glow}28` }}>{user.avatar}</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#fff" }}>Hey, {user.name.split(" ")[0]}! 👋</div>
            <div style={{ fontSize:12,color:"var(--mute)",marginTop:3 }}>{new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</div>
            <div style={{ marginTop:8 }}><Badge color={glow}>{LABEL[user.role]}</Badge></div>
          </div>
        </div>
      </Card>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:13 }}>
        <KPI icon="🌿" label="Leave Balance" value="12 days" sub="Available"   color="var(--cyan)"   />
        <KPI icon="📅" label="Used Leave"    value="3 days"  sub="This year"   color="var(--yellow)" />
        <KPI icon="⏳" label="Pending Leave" value={MOCK_LEAVES.filter(l=>l.status==="PENDING").length} sub="Awaiting HR" color="var(--orange)" />
        <KPI icon="💰" label="Last Salary"   value={myPayroll?`₹${myPayroll.net_salary.toLocaleString("en-IN")}`:"—"} sub="March 2026" color="var(--purple)" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY LEAVE (Employee)
═══════════════════════════════════════════════════════════ */
function MyLeavePage({ user }) {
  const glow = GLOW[user.role];
  const [leaves,  setLeaves]  = useState(MOCK_LEAVES);
  const [show,    setShow]    = useState(false);
  const [toast,   setToast]   = useState(null);
  const [aiConf,  setAiConf]  = useState("");
  const { ask, aiLoading }    = useAI();
  const [form, setForm] = useState({ leave_type:"SICK",start_date:"",end_date:"",reason:"" });
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const apply = async () => {
    if (!form.start_date||!form.end_date) return toast_("Fill dates","error");
    const days = Math.ceil((new Date(form.end_date)-new Date(form.start_date))/(1000*60*60*24))+1;
    setLeaves(p=>[...p,{ id:Date.now(),...form,days,status:"PENDING" }]);
    const conf = await ask(
      "You are an HR AI. Respond to a leave submission with a friendly 2-sentence confirmation.",
      `Leave: ${form.leave_type}, From: ${form.start_date}, To: ${form.end_date}, Reason: ${form.reason||"Not provided"}.`
    );
    setAiConf(conf);
    toast_("Leave applied!"); setShow(false);
  };

  return (
    <div style={{ padding:22 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <SectionHead color={glow}>My Leave Requests</SectionHead>
        <Btn color={glow} onClick={()=>setShow(p=>!p)}>+ Apply Leave</Btn>
      </div>

      {aiConf && (
        <Card glow="var(--cyan)" style={{ padding:"13px 16px",marginBottom:14 }}>
          <div style={{ fontSize:12,color:"#67e8f9",lineHeight:1.7 }}>🤖 {aiConf}</div>
        </Card>
      )}

      {show && (
        <Card glow={glow} style={{ padding:20,marginBottom:15,animation:"fadein 0.25s ease" }}>
          <Drop label="Leave Type" value={form.leave_type} onChange={e=>setForm(p=>({...p,leave_type:e.target.value}))}
            options={[{value:"SICK",label:"Sick Leave"},{value:"CASUAL",label:"Casual Leave"},{value:"ANNUAL",label:"Annual Leave"},{value:"OTHER",label:"Other"}]} />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
            <Field label="Start Date" type="date" value={form.start_date} onChange={e=>setForm(p=>({...p,start_date:e.target.value}))} />
            <Field label="End Date"   type="date" value={form.end_date}   onChange={e=>setForm(p=>({...p,end_date:e.target.value}))} />
          </div>
          <div style={{ marginBottom:11 }}>
            <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"1.4px",textTransform:"uppercase",marginBottom:5 }}>Reason</div>
            <textarea rows={2} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}
              style={{ width:"100%",padding:"9px 12px",borderRadius:10,fontSize:13,resize:"vertical" }} />
          </div>
          <div style={{ display:"flex",gap:9 }}>
            <Btn color={glow} onClick={apply} disabled={aiLoading}>
              {aiLoading?<span style={{ display:"flex",alignItems:"center",gap:6 }}><Spinner color={glow} size={13}/> Submitting…</span>:"Submit + AI Confirm"}
            </Btn>
            <Btn color="var(--red)" onClick={()=>setShow(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
        {leaves.map(l=>(
          <Card key={l.id} style={{ padding:"13px 16px",display:"flex",alignItems:"center",gap:13 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#fff" }}>{l.leave_type}</div>
              <div style={{ fontSize:11,color:"var(--mute)",marginTop:2 }}>{l.days} days · {l.start_date} → {l.end_date}</div>
              {l.reason && <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2 }}>"{l.reason}"</div>}
            </div>
            <Badge color={l.status==="APPROVED"?"var(--cyan)":l.status==="REJECTED"?"var(--red)":"var(--yellow)"}>{l.status}</Badge>
          </Card>
        ))}
        {leaves.length===0 && <div style={{ color:"var(--mute)",fontSize:13,textAlign:"center",padding:40 }}>No leave requests yet</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MY PAYROLL (Employee)
═══════════════════════════════════════════════════════════ */
function MyPayrollPage() {
  return (
    <div style={{ padding:22 }}>
      <SectionHead color="var(--purple)">Payroll History</SectionHead>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        {MOCK_PAYROLL.map(p=>(
          <Card key={p.id} glow="var(--purple)" style={{ padding:"17px 20px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13 }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff" }}>{MONTHS[p.month]} {p.year}</div>
              <Badge color={p.status==="PAID"?"var(--cyan)":"var(--yellow)"}>{p.status}</Badge>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9 }}>
              {[["Base",p.base_salary,"var(--cyan)"],["Bonus",p.bonus,"#34d399"],["Deductions",p.deductions,"var(--orange)"],["Net Pay",p.net_salary,"var(--purple)"]].map(([l,v,c])=>(
                <div key={l} style={{ background:`${c}09`,border:`1px solid ${c}20`,borderRadius:11,padding:"11px 13px" }}>
                  <div style={{ fontSize:10,color:"var(--mute)",textTransform:"uppercase",letterSpacing:"0.5px" }}>{l}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:c,marginTop:5 }}>₹{v.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROFILE (Employee)
═══════════════════════════════════════════════════════════ */
function ProfilePage({ user }) {
  const glow = GLOW[user.role];
  const [phone,     setPhone]     = useState("+91 98765 43210");
  const [address,   setAddress]   = useState("Hyderabad, Telangana");
  const [emergency, setEmergency] = useState("+91 91234 56789");
  const [toast,     setToast]     = useState(null);
  const toast_ = (msg,type="success")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  return (
    <div style={{ padding:22 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <SectionHead color={glow}>My Profile</SectionHead>
      <div style={{ display:"grid",gridTemplateColumns:"220px 1fr",gap:14 }}>
        <Card glow={glow} style={{ padding:"26px 18px",textAlign:"center" }}>
          <div style={{ width:72,height:72,borderRadius:18,background:`${glow}18`,border:`2px solid ${glow}45`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,color:glow,margin:"0 auto 13px",boxShadow:`0 0 22px ${glow}35` }}>{user.avatar}</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff" }}>{user.name}</div>
          <div style={{ fontSize:11,color:"var(--mute)",marginTop:3 }}>Engineering</div>
          <div style={{ marginTop:9,display:"flex",flexDirection:"column",gap:5 }}>
            <Badge color={glow}>{LABEL[user.role]}</Badge>
            <Badge color="var(--purple)">Sr. Developer</Badge>
          </div>
        </Card>
        <Card style={{ padding:22 }}>
          <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.25)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:13 }}>Editable Info</div>
          <Field label="Phone"             value={phone}     onChange={e=>setPhone(e.target.value)}     placeholder="+91 98765 43210" />
          <Field label="Address"           value={address}   onChange={e=>setAddress(e.target.value)}   placeholder="City, State" />
          <Field label="Emergency Contact" value={emergency} onChange={e=>setEmergency(e.target.value)} placeholder="+91 91234 56789" />
          <div style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.25)",letterSpacing:"2px",textTransform:"uppercase",margin:"16px 0 11px" }}>Read-only Info</div>
          {[["Email",user.email],["Department","Engineering"],["Position","Sr. Developer"],["Base Salary","₹95,000"],["Join Date","Jan 2024"]].map(([l,v])=>(
            <div key={l} style={{ display:"flex",justifyContent:"space-between",padding:"8px 11px",background:"rgba(255,255,255,0.02)",borderRadius:8,marginBottom:5,border:"1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize:12,color:"rgba(255,255,255,0.25)" }}>{l}</span>
              <span style={{ fontSize:12,color:"rgba(255,255,255,0.52)" }}>{v}</span>
            </div>
          ))}
          <Btn color={glow} onClick={()=>toast_("Profile updated!")} style={{ marginTop:14 }}>Save Changes</Btn>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE ROUTER
═══════════════════════════════════════════════════════════ */
function Pages({ user, page }) {
  if (user.role==="ADMIN") {
    if (page==="dashboard") return <AdminDash user={user} />;
    if (page==="hrmonitor") return <HRMonitorPage />;
    if (page==="revenue")   return <RevenuePage />;
    if (page==="comms")     return <CommsPage />;
  }
  if (user.role==="HR") {
    if (page==="dashboard") return <HRDash user={user} />;
    if (page==="employees") return <EmployeesPage />;
    if (page==="leaves")    return <LeavesPage />;
    if (page==="payroll")   return <PayrollPage />;
    if (page==="comms")     return <CommsPage />;
  }
  if (user.role==="EMPLOYEE") {
    if (page==="dashboard") return <EmpDash user={user} />;
    if (page==="myleave")   return <MyLeavePage user={user} />;
    if (page==="mypayroll") return <MyPayrollPage />;
    if (page==="profile")   return <ProfilePage user={user} />;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════ */
function Login({ onLogin }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [show,    setShow]    = useState(false);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [ready,   setReady]   = useState(false);
  useEffect(()=>{ setTimeout(()=>setReady(true),120); },[]);

  const submit = (e) => {
    e?.preventDefault();
    setErr(""); setLoading(true);
    setTimeout(()=>{
      const found = USERS.find(u=>u.email===email && u.password===pass);
      if (found) {
        onLogin({ id:found.id, name:found.name, email:found.email, role:found.role, avatar:found.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() });
      } else {
        setErr("Invalid email or password.");
        setLoading(false);
      }
    },600);
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative" }}>
      <BG />
      <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:400,opacity:ready?1:0,transform:ready?"translateY(0)":"translateY(28px)",transition:"all 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ width:62,height:62,borderRadius:16,background:"linear-gradient(135deg,var(--cyan),rgba(0,245,212,0.55))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 14px",boxShadow:"0 0 36px rgba(0,245,212,0.4)" }}>⬡</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#fff",letterSpacing:"4px" }}>INDUSTRIA<span style={{ color:"var(--cyan)" }}>OS</span></div>
          <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"3.5px",marginTop:5,textTransform:"uppercase" }}>Business Management Platform</div>
        </div>

        <Card glow="var(--cyan)" style={{ padding:"30px 28px" }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff",letterSpacing:"0.5px",marginBottom:3 }}>Welcome Back</div>
          <div style={{ fontSize:12,color:"var(--mute)",marginBottom:22 }}>Sign in to access your dashboard</div>

          {/* Credential hints */}
          <div style={{ marginBottom:18,padding:"12px 14px",background:"rgba(0,245,212,0.05)",border:"1px solid rgba(0,245,212,0.18)",borderRadius:11 }}>
            <div style={{ fontSize:10,color:"var(--cyan)",letterSpacing:"1.2px",fontWeight:700,marginBottom:8 }}>DEMO CREDENTIALS</div>
            {USERS.map(u=>(
              <div key={u.role} style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:4,cursor:"pointer" }}
                onClick={()=>{ setEmail(u.email); setPass(u.password); setErr(""); }}>
                <span style={{ color:GLOW[u.role],fontWeight:600 }}>{u.role}</span>
                <span>{u.email}</span>
                <span style={{ opacity:0.6 }}>{u.password}</span>
              </div>
            ))}
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:4 }}>👆 Click a role to auto-fill</div>
          </div>

          <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"1.4px",textTransform:"uppercase",marginBottom:6 }}>Email</div>
              <input type="email" placeholder="you@company.com" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
                style={{ width:"100%",padding:"11px 13px",borderRadius:11,fontSize:13 }} />
            </div>
            <div>
              <div style={{ fontSize:10,color:"var(--mute)",letterSpacing:"1.4px",textTransform:"uppercase",marginBottom:6 }}>Password</div>
              <div style={{ position:"relative" }}>
                <input type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}}
                  style={{ width:"100%",padding:"11px 38px 11px 13px",borderRadius:11,fontSize:13 }} />
                <button type="button" onClick={()=>setShow(p=>!p)} style={{ position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--mute)",fontSize:14,cursor:"pointer" }}>{show?"🙈":"👁"}</button>
              </div>
            </div>
            {err && <div style={{ background:"rgba(255,68,68,0.08)",border:"1px solid rgba(255,68,68,0.22)",borderRadius:10,padding:"10px 13px",color:"#ff8888",fontSize:12 }}>⚠ {err}</div>}
            <button type="submit" disabled={loading} style={{ padding:"13px",borderRadius:11,background:"linear-gradient(135deg,rgba(0,245,212,0.22),rgba(0,245,212,0.06))",border:"1px solid rgba(0,245,212,0.38)",color:"var(--cyan)",fontSize:14,fontWeight:800,fontFamily:"'Syne',sans-serif",letterSpacing:"2px",boxShadow:"0 0 24px rgba(0,245,212,0.15)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s",marginTop:2 }}>
              {loading?<Spinner size={16}/>:"SIGN IN →"}
            </button>
          </form>
        </Card>
        <p style={{ textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.15)",marginTop:18,letterSpacing:"1.5px" }}>INDUSTRIAOS v1.0 · © 2026 · SECURED</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [aiOn, setAiOn] = useState(false);

  const logout = () => { setUser(null); setPage("dashboard"); setAiOn(false); };

  if (!user) return (<><style>{G}</style><BG /><Login onLogin={u=>{setUser(u);setPage("dashboard");}}/></>);

  return (
    <>
      <style>{G}</style>
      <div style={{ display:"flex",height:"100vh",overflow:"hidden",position:"relative" }}>
        <BG />
        <Sidebar user={user} page={page} setPage={setPage} onLogout={logout} />
        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1 }}>
          <Topbar user={user} page={page} onAI={()=>setAiOn(true)} />
          <div style={{ flex:1,overflowY:"auto" }}>
            <Pages user={user} page={page} />
          </div>
        </div>
        {aiOn && <AIChatPanel user={user} onClose={()=>setAiOn(false)} />}
      </div>
    </>
  );
}
```

Now add your Anthropic API key to `.env` file in your project root:
```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx