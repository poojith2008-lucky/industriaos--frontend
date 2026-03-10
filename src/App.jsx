import React, { useState } from 'react';
import { Bell, Menu, LogOut, Plus, Eye, EyeOff, Search, Calendar, DollarSign, Users, TrendingUp, Bot, Send, X, Loader } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 }
];

const performanceData = [
  { name: 'Sales', value: 65 }, { name: 'Marketing', value: 52 },
  { name: 'Operations', value: 48 }, { name: 'Development', value: 72 }
];

const employeeListData = [
  { id: 1, name: 'John Doe', position: 'Senior Developer', department: 'Tech', status: 'Active' },
  { id: 2, name: 'Sarah Smith', position: 'HR Manager', department: 'HR', status: 'Active' },
  { id: 3, name: 'Mike Johnson', position: 'Product Manager', department: 'Product', status: 'On Leave' },
  { id: 4, name: 'Emma Wilson', position: 'Designer', department: 'Design', status: 'Active' },
  { id: 5, name: 'Alex Brown', position: 'Backend Developer', department: 'Tech', status: 'Active' }
];

const leaveRequests = [
  { id: 1, employee: 'John Doe', type: 'Sick Leave', date: '2026-03-10', status: 'Pending' },
  { id: 2, employee: 'Sarah Smith', type: 'Vacation', date: '2026-03-15', status: 'Approved' },
  { id: 3, employee: 'Mike Johnson', type: 'Personal', date: '2026-03-12', status: 'Pending' }
];

const notificationsData = [
  { id: 1, title: 'New leave request', message: 'John Doe requested sick leave', time: '5 min ago' },
  { id: 2, title: 'Report generated', message: 'Monthly performance report is ready', time: '1 hour ago' },
  { id: 3, title: 'New employee', message: 'Alex Brown joined the team', time: '3 hours ago' }
];

// ── AI Hook ────────────────────────────────────────────────────────────────────
function useAI() {
  const [loading, setLoading] = useState(false);
  const ask = async (systemPrompt, userMessage) => {
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });
      const data = await res.json();
      return data.content?.[0]?.text || 'No response.';
    } catch { return 'Error reaching AI backend.'; }
    finally { setLoading(false); }
  };
  return { ask, loading };
}

// ── AI Chat Panel ──────────────────────────────────────────────────────────────
const AIChatPanel = ({ userRole, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I'm your NEXUS AI assistant. Ask me anything about your ${userRole} dashboard — employees, reports, salary, or business insights!` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const { ask } = useAI();
  const bottomRef = React.useRef(null);

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const systemPrompt = `You are NEXUS AI, an intelligent business management assistant embedded in a role-based dashboard.
Current user role: ${userRole}.
Company data:
- Total Employees: 145, Revenue: $2.4M, Growth: 23.5%
- Employees: John Doe (Senior Dev, Tech, Active), Sarah Smith (HR Manager, Active), Mike Johnson (Product Manager, On Leave), Emma Wilson (Designer, Active), Alex Brown (Backend Dev, Active)
- Leave Requests: John Doe (Sick, Pending), Sarah Smith (Vacation, Approved), Mike Johnson (Personal, Pending)
- Monthly Revenue: Jan $45k, Feb $52k, Mar $48k, Apr $61k, May $55k, Jun $67k
- Dept Performance: Sales 65%, Marketing 52%, Operations 48%, Development 72%
- Salary Pool: $245,000 | Processed: $235,000
Respond concisely and professionally. Focus on insights relevant to the ${userRole} role.`;

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setTyping(true);
    const reply = await ask(systemPrompt, msg);
    setTyping(false);
    setMessages(m => [...m, { role: 'assistant', text: reply }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, width: 380, height: 480, display: 'flex', flexDirection: 'column', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,255,247,0.3)', borderRadius: 20, boxShadow: '0 0 40px rgba(0,255,247,0.15)' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={18} color="#00FFF7" />
          <span style={{ fontWeight: 600, fontSize: 14, color: 'white' }}>NEXUS AI Assistant</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFF7', display: 'inline-block', animation: 'pulse 1.8s infinite' }} />
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '9px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.5,
              background: m.role === 'user' ? 'linear-gradient(135deg,#00FFF7,#0099cc)' : 'rgba(255,255,255,0.08)',
              color: m.role === 'user' ? '#0a0a0a' : '#e2e8f0'
            }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FFF7', display: 'inline-block', animation: `bounce 1.2s infinite ${i*0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything..." style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 12px', color: 'white', fontSize: 13, outline: 'none' }} />
        <button onClick={send} style={{ background: 'rgba(0,255,247,0.15)', border: '1px solid rgba(0,255,247,0.3)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#00FFF7' }}><Send size={15} /></button>
      </div>
    </div>
  );
};

// ── AI Smart Summary ───────────────────────────────────────────────────────────
const AISmartSummary = ({ userRole }) => {
  const [summary, setSummary] = useState('');
  const { ask, loading } = useAI();

  const generate = async () => {
    const prompts = {
      admin: 'Generate a concise 3-bullet executive summary. Revenue: $2.4M (+12%), 145 employees, Growth 23.5%, Best dept: Development 72%. Use • bullets only.',
      hr: 'Generate a concise 3-bullet HR summary. 145 employees, 8 pending leaves, Attendance 94.2%, Salary 98% processed ($235k of $245k). Use • bullets only.',
      employee: 'Generate a brief 3-bullet personal work summary. Leave balance: 12 days, Next payslip: Mar 31, Attendance: 96%, Pending tasks: 2 docs. Use • bullets only.'
    };
    const res = await ask('You are a concise business intelligence assistant. Respond with bullet points only using •. No headers, no extra text.', prompts[userRole]);
    setSummary(res);
  };

  return (
    <div className="glass-effect rounded-2xl p-6 card-hover" style={{ borderColor: 'rgba(0,255,247,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={18} color="#00FFF7" />
          <h3 style={{ fontWeight: 600, fontSize: 15, color: 'white', margin: 0 }}>AI Smart Summary</h3>
        </div>
        <button onClick={generate} disabled={loading} className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, fontSize: 12, color: '#00FFF7', cursor: 'pointer' }}>
          {loading ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={12} />}
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {summary
        ? <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>{summary}</p>
        : <p style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', margin: 0 }}>Click Generate to get an AI-powered summary of your dashboard.</p>
      }
    </div>
  );
};

// ── AI Leave Decision ──────────────────────────────────────────────────────────
const AILeaveDecision = ({ request }) => {
  const [decision, setDecision] = useState('');
  const { ask, loading } = useAI();

  const analyze = async () => {
    const res = await ask(
      'You are an HR AI assistant. Give a 1-sentence recommendation (approve/flag) with a brief reason. Be direct.',
      `Employee: ${request.employee}, Leave: ${request.type}, Date: ${request.date}, Status: ${request.status}. Should this be approved?`
    );
    setDecision(res);
  };

  return decision
    ? <p style={{ fontSize: 11, color: '#67e8f9', fontStyle: 'italic', marginTop: 4 }}>{decision}</p>
    : <button onClick={analyze} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00FFF7', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, padding: 0 }}>
        {loading ? <Loader size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={10} />}
        {loading ? 'Analyzing...' : 'AI Analyze'}
      </button>;
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, trend }) => (
  <div className="glass-effect rounded-2xl p-5 card-hover glow-cyan" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ color: '#00FFF7' }}>{icon}</div>
      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,255,247,0.12)', color: '#00FFF7' }}>{trend}</span>
    </div>
    <p style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>{value}</p>
    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{label}</p>
  </div>
);

// ── Dashboard Components ───────────────────────────────────────────────────────
const AdminDashboard = () => (
  <div className="space-y-6">
    <AISmartSummary userRole="admin" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard icon={<DollarSign size={24} />} label="Total Revenue" value="$2.4M" trend="+12%" />
      <StatCard icon={<Users size={24} />} label="Employees" value="145" trend="+5%" />
      <StatCard icon={<TrendingUp size={24} />} label="Growth" value="23.5%" trend="+8%" />
      <StatCard icon={<Bell size={24} />} label="Notifications" value="12" trend="Active" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-effect rounded-2xl p-6 card-hover glow-cyan">
        <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #00FFF7', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="revenue" fill="#00FFF7" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-effect rounded-2xl p-6 card-hover glow-purple">
        <h3 className="text-lg font-semibold mb-4">Performance</h3>
        <div className="space-y-3">
          {performanceData.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.name}</span><span className="text-cyan-400">{item.value}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="glass-effect rounded-2xl p-6 card-hover">
      <h3 className="text-lg font-semibold mb-4">HR Activity Tracker</h3>
      <div className="space-y-3">
        {notificationsData.map((n, idx) => (
          <div key={idx} className="flex items-start justify-between p-3 rounded-lg hover:bg-white/5">
            <div>
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-xs text-gray-400">{n.message}</p>
            </div>
            <span className="text-xs text-gray-500">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HRDashboard = () => {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employees, setEmployees] = useState(employeeListData);
  const [leaves, setLeaves] = useState(leaveRequests);
  const [form, setForm] = useState({ name: '', email: '', position: '', department: '' });
  const [salaryMsg, setSalaryMsg] = useState('');
  const { ask, loading } = useAI();

  const addEmployee = () => {
    if (!form.name || !form.position) return;
    setEmployees(e => [...e, { id: Date.now(), ...form, status: 'Active' }]);
    setForm({ name: '', email: '', position: '', department: '' });
    setShowAddEmployee(false);
  };

  const updateLeave = (id, status) => setLeaves(l => l.map(r => r.id === id ? { ...r, status } : r));

  const processPayroll = async () => {
    const res = await ask(
      'You are a payroll AI. Write a professional 2-sentence payroll confirmation.',
      `Process payroll for 145 employees. Total: $245,000. Pending: $10,000. Date: ${new Date().toDateString()}.`
    );
    setSalaryMsg(res);
  };

  return (
    <div className="space-y-6">
      <AISmartSummary userRole="hr" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Users size={24} />} label="Total Employees" value={employees.length} trend="+3%" />
        <StatCard icon={<Calendar size={24} />} label="Pending Leaves" value={leaves.filter(l => l.status === 'Pending').length} trend="Review" />
        <StatCard icon={<DollarSign size={24} />} label="Salary Processed" value="98%" trend="On Time" />
        <StatCard icon={<TrendingUp size={24} />} label="Attendance" value="94.2%" trend="+2%" />
      </div>

      <div className="glass-effect rounded-2xl p-6 card-hover">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Employee List</h3>
          <button onClick={() => setShowAddEmployee(!showAddEmployee)} className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-cyan-500/10">
            <Plus size={18} /><span>Add Employee</span>
          </button>
        </div>
        {showAddEmployee && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-cyan-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name','email','position','department'].map(f => (
                <input key={f} type="text" placeholder={f.charAt(0).toUpperCase()+f.slice(1)} value={form[f]}
                  onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  className="glass-input px-4 py-2 rounded-lg" />
              ))}
              <button onClick={addEmployee} className="md:col-span-2 bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-400/50">
                Add Employee
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Name','Position','Department','Status'].map(h => <th key={h} className="text-left py-3 px-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{emp.name}</td>
                  <td className="py-3 px-4 text-gray-400">{emp.position}</td>
                  <td className="py-3 px-4 text-gray-400">{emp.department}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${emp.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{emp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h3 className="text-lg font-semibold mb-4">Leave Approvals</h3>
          <div className="space-y-3">
            {leaves.map((req) => (
              <div key={req.id} className="p-3 rounded-lg hover:bg-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{req.employee}</p>
                    <p className="text-xs text-gray-400">{req.type} - {req.date}</p>
                    <AILeaveDecision request={req} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'Pending' ? 'bg-blue-500/20 text-blue-400' : req.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{req.status}</span>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => updateLeave(req.id, 'Approved')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: 'none', cursor: 'pointer' }}>✓ Approve</button>
                        <button onClick={() => updateLeave(req.id, 'Rejected')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', color: '#f87171', border: 'none', cursor: 'pointer' }}>✕ Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h3 className="text-lg font-semibold mb-4">Salary Credits</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
              <p className="text-sm text-gray-300 mb-2">Process Salary with AI</p>
              <button onClick={processPayroll} disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-400/50 flex items-center justify-center gap-2" style={{ cursor: 'pointer', border: 'none' }}>
                {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={16} />}
                {loading ? 'Processing...' : 'Process All with AI'}
              </button>
              {salaryMsg && <p style={{ fontSize: 12, color: '#86efac', marginTop: 10, lineHeight: 1.6 }}>{salaryMsg}</p>}
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-400">Total Salary Pool</span><span className="text-cyan-400 font-medium">$245,000</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Processed</span><span className="text-green-400 font-medium">$235,000</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Pending</span><span className="text-yellow-400 font-medium">$10,000</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [leaveForm, setLeaveForm] = useState({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
  const [leaveStatus, setLeaveStatus] = useState('');
  const { ask, loading } = useAI();

  const submitLeave = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return;
    const res = await ask(
      'You are an HR AI. Respond to a leave submission with a friendly 2-sentence confirmation.',
      `Leave: ${leaveForm.type}, From: ${leaveForm.startDate}, To: ${leaveForm.endDate}, Reason: ${leaveForm.reason || 'Not provided'}.`
    );
    setLeaveStatus(res);
  };

  return (
    <div className="space-y-6">
      <AISmartSummary userRole="employee" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Calendar size={24} />} label="Leave Balance" value="12 days" trend="Available" />
        <StatCard icon={<DollarSign size={24} />} label="Next Payslip" value="Mar 31" trend="On Track" />
        <StatCard icon={<TrendingUp size={24} />} label="Attendance" value="96%" trend="This Month" />
        <StatCard icon={<Users size={24} />} label="Team Size" value="8" trend="Active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h3 className="text-lg font-semibold mb-4">Request Leave</h3>
          <div className="space-y-3">
            <select value={leaveForm.type} onChange={e => setLeaveForm(p => ({ ...p, type: e.target.value }))} className="glass-input w-full px-4 py-2 rounded-lg">
              {['Sick Leave','Vacation','Personal','Emergency'].map(t => <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                <input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(p => ({ ...p, startDate: e.target.value }))} className="glass-input w-full px-3 py-2 rounded-lg text-sm" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">End Date</label>
                <input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(p => ({ ...p, endDate: e.target.value }))} className="glass-input w-full px-3 py-2 rounded-lg text-sm" /></div>
            </div>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Reason (optional)" rows={3} className="glass-input w-full px-4 py-2 rounded-lg resize-none" />
            <button onClick={submitLeave} disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2" style={{ cursor: 'pointer', border: 'none' }}>
              {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            {leaveStatus && <p style={{ fontSize: 12, color: '#67e8f9', lineHeight: 1.6 }}>{leaveStatus}</p>}
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-6 card-hover">
          <h3 className="text-lg font-semibold mb-4">My Payslips</h3>
          <div className="space-y-3">
            {[['February 2026','$7,333','Paid'],['January 2026','$7,333','Paid'],['December 2025','$7,333','Paid']].map(([month, amt, status]) => (
              <div key={month} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
                <span className="text-sm">{month}</span>
                <span className="text-cyan-400 font-medium text-sm">{amt}</span>
                <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────────────
const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
  const menuItems = {
    admin: [['📊','Dashboard'],['📈','Analytics'],['📦','Stock'],['👥','HR Activity'],['⚙️','Settings']],
    hr: [['📊','Dashboard'],['👥','Employees'],['📅','Leave Requests'],['💰','Salary'],['📋','Reports']],
    employee: [['📊','Dashboard'],['👤','Profile'],['📅','Leave Request'],['💰','Salary'],['📄','Documents']]
  };
  return (
    <div className={`glass-effect ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-cyan-500/20 flex flex-col`}>
      <div className="p-6 flex items-center justify-between">
        {sidebarOpen && <h2 className="text-xl font-bold neon-glow">NEXUS</h2>}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg"><Menu size={20} /></button>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems[userRole]?.map(([icon, label], idx) => (
          <button key={idx} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg glass-button hover:bg-cyan-500/10 group">
            <span className="text-xl">{icon}</span>
            {sidebarOpen && <span className="text-sm group-hover:text-cyan-400">{label}</span>}
          </button>
        ))}
      </nav>
      {sidebarOpen && <div className="p-4 border-t border-white/10 text-xs text-gray-400">© 2026 NEXUS</div>}
    </div>
  );
};

// ── Top Navbar ─────────────────────────────────────────────────────────────────
const TopNavbar = ({ userRole, onLogout, onAIOpen }) => (
  <div className="glass-effect border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
    <h1 className="text-2xl font-bold neon-glow capitalize">{userRole} Dashboard</h1>
    <div className="flex items-center space-x-4">
      <div className="relative hidden md:block">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        <input type="text" placeholder="Search..." className="glass-input pl-10 pr-4 py-2 rounded-lg w-48" />
      </div>
      <button onClick={onAIOpen} className="glass-button flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-cyan-500/10" style={{ color: '#00FFF7', border: '1px solid rgba(0,255,247,0.3)' }}>
        <Bot size={18} /><span className="hidden sm:inline text-sm">AI Chat</span>
      </button>
      <button className="relative p-2 hover:bg-white/10 rounded-lg">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full glow-cyan" />
      </button>
      <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 glass-button rounded-lg hover:text-cyan-400">
        <LogOut size={18} /><span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  </div>
);

// ── Login ──────────────────────────────────────────────────────────────────────
const LoginPage = ({ selectedRole, setSelectedRole, onLogin, username, setUsername, password, setPassword, showPassword, setShowPassword }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
    <style>{`
      .glass-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
      .glass-input { background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; }
      .glass-input::placeholder { color: rgba(255,255,255,0.5); }
      .glass-input:focus { outline: none; border-color: rgba(0,255,247,0.5); box-shadow: 0 0 15px rgba(0,255,247,0.2); }
      .glow-button { background: linear-gradient(135deg,#00FFF7 0%,#0099cc 100%); box-shadow: 0 0 20px rgba(0,255,247,0.5); transition: all 0.3s ease; cursor: pointer; border: none; }
      .glow-button:hover { box-shadow: 0 0 30px rgba(0,255,247,0.8); transform: translateY(-2px); }
      .role-card { background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s ease; }
      .role-card.active { border-color: #00FFF7; background: rgba(0,255,247,0.15); box-shadow: 0 0 20px rgba(0,255,247,0.3); }
    `}</style>
    <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl" />
    <div className="glass-card rounded-3xl p-12 w-full max-w-md relative z-10 shadow-2xl">
      <h1 className="text-4xl font-bold text-center mb-2" style={{ textShadow: '0 0 10px rgba(0,255,247,0.6)', color: 'white' }}>Access Portal</h1>
      <p className="text-center text-gray-300 mb-8">Role-Based Business Management</p>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Username</label>
          <input type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} className="glass-input w-full px-4 py-3 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="glass-input w-full px-4 py-3 rounded-xl pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} className="absolute right-3 top-3.5 text-gray-400 hover:text-cyan-400">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-200">Select Role</label>
          <div className="grid grid-cols-3 gap-3">
            {['admin','hr','employee'].map(role => (
              <button key={role} type="button" onClick={() => setSelectedRole(role)} className={`role-card rounded-xl p-4 text-center text-sm font-medium capitalize ${selectedRole === role ? 'active' : ''}`} style={{ color: selectedRole === role ? '#00FFF7' : '#9ca3af' }}>
                {role}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onLogin} className="glow-button w-full py-3 rounded-xl font-semibold text-slate-900 uppercase tracking-wider">Login</button>
      </div>
      <p className="text-center text-gray-400 text-xs mt-6">Demo: Use any username & password</p>
    </div>
  </div>
);

// ── App Root ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [aiOpen, setAiOpen] = useState(false);

  const handleLogin = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (username && password) { setAuthenticated(true); setUserRole(selectedRole); }
  };

  const handleLogout = () => { setAuthenticated(false); setUserRole(''); setUsername(''); setPassword(''); setAiOpen(false); };

  if (!authenticated) {
    return <LoginPage selectedRole={selectedRole} setSelectedRole={setSelectedRole} onLogin={handleLogin}
      username={username} setUsername={setUsername} password={password} setPassword={setPassword}
      showPassword={showPassword} setShowPassword={setShowPassword} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        * { font-family: 'Roboto', sans-serif; }
        .glass-effect { background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .glass-button { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s ease; cursor: pointer; }
        .glass-button:hover { background: rgba(0,255,247,0.15); border-color: rgba(0,255,247,0.5); box-shadow: 0 0 20px rgba(0,255,247,0.3); }
        .glass-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: white; }
        .glass-input::placeholder { color: rgba(255,255,255,0.5); }
        .glass-input:focus { outline: none; border-color: rgba(0,255,247,0.5); box-shadow: 0 0 15px rgba(0,255,247,0.2); }
        .neon-glow { text-shadow: 0 0 10px rgba(0,255,247,0.6), 0 0 20px rgba(0,255,247,0.4); }
        .glow-cyan { box-shadow: 0 0 20px rgba(0,255,247,0.3), inset 0 0 20px rgba(0,255,247,0.1); }
        .glow-purple { box-shadow: 0 0 20px rgba(155,89,182,0.3), inset 0 0 20px rgba(155,89,182,0.1); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.5);} }
        @keyframes spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-8px);} }
      `}</style>
      <div className="flex h-screen">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userRole={userRole} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar userRole={userRole} onLogout={handleLogout} onAIOpen={() => setAiOpen(true)} />
          <main className="flex-1 overflow-auto p-6">
            {userRole === 'admin' && <AdminDashboard />}
            {userRole === 'hr' && <HRDashboard />}
            {userRole === 'employee' && <EmployeeDashboard />}
          </main>
        </div>
      </div>
      {aiOpen && <AIChatPanel userRole={userRole} onClose={() => setAiOpen(false)} />}
    </div>
  );
}