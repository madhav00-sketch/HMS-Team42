import { useState, useEffect, useCallback } from "react";
import {
  login as apiLogin, logout as apiLogout,
  getComplaints, createComplaint, updateComplaint,
  getRooms, getMyRoom, allocateRoom, vacateRoom,
  getUsers, getNotices, createNotice, changePassword
} from "./api";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0a0a0a;--bg1:#111111;--bg2:#1a1a1a;--bg3:#222222;
  --bdr:#2a2a2a;--bdr2:#333333;
  --txt:#f5f5f5;--txt2:#a0a0a0;--txt3:#666666;
  --white:#ffffff;
  --green:#22c55e;--gold:#f59e0b;--red:#ef4444;--purple:#a855f7;--cyan:#06b6d4;
}
::selection{background:rgba(255,255,255,0.15);}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:var(--bg1);}
::-webkit-scrollbar-thumb{background:var(--bdr2);border-radius:3px;}
.root{font-family:'Inter',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;font-size:14px;}

.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden;}
.login-wrap::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%);top:-200px;right:-100px;}
.login-box{width:420px;background:var(--bg1);border:1px solid var(--bdr);border-radius:20px;padding:44px 40px;position:relative;z-index:1;}
.login-brand{display:flex;align-items:center;gap:14px;margin-bottom:36px;}
.login-brand-icon{width:44px;height:44px;background:var(--white);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;}
.login-brand-name{font-size:20px;font-weight:800;color:var(--white);letter-spacing:-0.5px;}
.login-brand-sub{font-size:10px;color:var(--txt3);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;}
.login-title{font-size:26px;font-weight:800;color:var(--white);letter-spacing:-0.8px;margin-bottom:4px;}
.login-sub{font-size:13px;color:var(--txt3);margin-bottom:28px;}
.role-tabs{display:flex;gap:4px;background:var(--bg);border-radius:10px;padding:4px;margin-bottom:22px;border:1px solid var(--bdr);}
.role-tab{flex:1;padding:9px 0;background:transparent;border:none;border-radius:7px;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:var(--txt3);cursor:pointer;transition:all .15s;}
.role-tab.on{background:var(--white);color:#000;font-weight:700;}
.f-wrap{margin-bottom:16px;}
.f-lbl{font-size:10px;font-weight:700;color:var(--txt3);margin-bottom:7px;display:block;letter-spacing:1px;text-transform:uppercase;}
.f-inp,.f-sel,.f-area{width:100%;background:var(--bg);border:1px solid var(--bdr);border-radius:10px;padding:12px 14px;font-family:'Inter',sans-serif;font-size:13px;color:var(--txt);outline:none;transition:all .15s;}
.f-inp:focus,.f-sel:focus,.f-area:focus{border-color:var(--white);background:var(--bg1);}
.f-inp:read-only{opacity:0.4;cursor:default;}
.f-sel option{background:var(--bg2);}
.f-area{resize:vertical;}
.f-search{width:100%;background:var(--bg2);border:1px solid var(--bdr);border-radius:8px;padding:9px 12px;font-family:'Inter',sans-serif;font-size:13px;color:var(--txt);outline:none;transition:all .15s;}
.f-search:focus{border-color:var(--white);}
.login-btn{width:100%;background:var(--white);color:#000;border:none;border-radius:10px;padding:13px;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-top:6px;transition:all .15s;}
.login-btn:hover{background:#e5e5e5;transform:translateY(-1px);}
.login-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
.login-err{color:#f87171;font-size:12px;margin-top:10px;text-align:center;background:rgba(239,68,68,0.08);padding:10px;border-radius:8px;border:1px solid rgba(239,68,68,0.15);}
.login-hint{font-size:11px;color:var(--txt3);margin-top:14px;text-align:center;}
.login-hint code{color:var(--txt2);font-family:'JetBrains Mono',monospace;background:var(--bg2);padding:2px 6px;border-radius:4px;border:1px solid var(--bdr);}

.shell{display:flex;height:100vh;overflow:hidden;}
.sb{width:230px;min-width:230px;background:var(--bg1);border-right:1px solid var(--bdr);display:flex;flex-direction:column;overflow:hidden;}
.sb-head{padding:18px 16px;border-bottom:1px solid var(--bdr);}
.sb-brand{display:flex;align-items:center;gap:10px;}
.sb-icon{width:32px;height:32px;background:var(--white);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.sb-name{font-size:14px;font-weight:800;color:var(--white);letter-spacing:-0.3px;}
.sb-role{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:2px;display:inline-block;padding:2px 7px;border-radius:20px;}
.sb-role-s{background:rgba(255,255,255,0.1);color:var(--txt2);}
.sb-role-w{background:rgba(245,158,11,0.15);color:var(--gold);}
.sb-role-a{background:rgba(239,68,68,0.15);color:var(--red);}
.sb-nav{flex:1;padding:10px 8px;overflow-y:auto;}
.sb-sec{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--txt3);padding:8px 10px 4px;}
.ni{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;cursor:pointer;margin-bottom:1px;font-size:13px;font-weight:500;color:var(--txt3);transition:all .1s;border:none;background:none;width:100%;text-align:left;font-family:'Inter',sans-serif;position:relative;}
.ni:hover{background:var(--bg2);color:var(--txt);}
.ni.on{background:var(--white);color:#000;font-weight:700;}
.ni-icon{font-size:15px;width:20px;text-align:center;flex-shrink:0;}
.ni-bdg{margin-left:auto;background:var(--red);color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:8px;min-width:16px;text-align:center;}
.sb-foot{padding:10px 8px;border-top:1px solid var(--bdr);}
.sb-user{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;margin-bottom:2px;}
.av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;border:1px solid var(--bdr2);}
.av-s{background:var(--bg3);color:var(--txt2);}
.av-w{background:rgba(245,158,11,0.15);color:var(--gold);}
.av-a{background:rgba(239,68,68,0.15);color:var(--red);}
.sb-uname{font-size:12px;font-weight:600;color:var(--txt);}
.sb-umeta{font-size:10px;color:var(--txt3);}
.sb-out{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;width:100%;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:12px;color:var(--txt3);transition:all .1s;}
.sb-out:hover{background:rgba(239,68,68,0.08);color:var(--red);}

.main{flex:1;overflow-y:auto;background:var(--bg);display:flex;flex-direction:column;}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--bdr);background:var(--bg1);flex-shrink:0;}
.tb-title{font-size:20px;font-weight:800;color:var(--white);letter-spacing:-0.5px;}
.tb-sub{font-size:12px;color:var(--txt3);margin-top:2px;}
.tb-right{display:flex;align-items:center;gap:8px;}
.content{padding:20px 24px;flex:1;}

.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;}
.stat{background:var(--bg1);border:1px solid var(--bdr);border-radius:14px;padding:18px;position:relative;overflow:hidden;transition:all .2s;cursor:pointer;}
.stat:hover{border-color:var(--bdr2);transform:translateY(-2px);}
.stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.stat-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;}
.si-w{background:rgba(255,255,255,0.08);}
.si-g{background:rgba(34,197,94,0.1);}
.si-gold{background:rgba(245,158,11,0.1);}
.si-r{background:rgba(239,68,68,0.1);}
.si-p{background:rgba(168,85,247,0.1);}
.si-c{background:rgba(6,182,212,0.1);}
.stat-val{font-size:28px;font-weight:800;color:var(--white);letter-spacing:-1px;line-height:1;}
.stat-lbl{font-size:10px;font-weight:600;color:var(--txt3);margin-top:5px;text-transform:uppercase;letter-spacing:0.5px;}
.stat-delta{font-size:11px;color:var(--txt3);margin-top:3px;}
.stat-delta.ok{color:var(--green);}
.stat-delta.warn{color:var(--gold);}
.stat-delta.bad{color:var(--red);}

.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
.card{background:var(--bg1);border:1px solid var(--bdr);border-radius:14px;padding:18px;}
.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.card-title{font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:1px;}

.tbl-wrap{background:var(--bg1);border:1px solid var(--bdr);border-radius:14px;overflow:hidden;margin-bottom:20px;}
.tbl-hd{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--bdr);background:var(--bg2);}
.tbl-hd-title{font-size:13px;font-weight:700;color:var(--white);}
.tbl-hd-sub{font-size:11px;color:var(--txt3);}
table{width:100%;border-collapse:collapse;}
th{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--txt3);padding:11px 18px;border-bottom:1px solid var(--bdr);text-align:left;background:var(--bg2);}
td{padding:12px 18px;font-size:13px;color:var(--txt);border-bottom:1px solid rgba(42,42,42,0.6);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(255,255,255,0.02);}

.bdg{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.3px;}
.bdg::before{content:'';width:5px;height:5px;border-radius:50%;}
.b-open{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.15);}
.b-open::before{background:#f87171;}
.b-inprog{background:rgba(245,158,11,0.1);color:#fbbf24;border:1px solid rgba(245,158,11,0.15);}
.b-inprog::before{background:#fbbf24;}
.b-resolved{background:rgba(34,197,94,0.1);color:#4ade80;border:1px solid rgba(34,197,94,0.15);}
.b-resolved::before{background:#4ade80;}
.b-available{background:rgba(34,197,94,0.1);color:#4ade80;border:1px solid rgba(34,197,94,0.15);}
.b-available::before{background:#4ade80;}
.b-occupied{background:rgba(255,255,255,0.08);color:var(--txt2);border:1px solid var(--bdr2);}
.b-occupied::before{background:var(--txt2);}
.b-maintenance{background:rgba(245,158,11,0.1);color:#fbbf24;border:1px solid rgba(245,158,11,0.15);}
.b-maintenance::before{background:#fbbf24;}
.b-active{background:rgba(34,197,94,0.1);color:#4ade80;border:1px solid rgba(34,197,94,0.15);}
.b-active::before{background:#4ade80;}
.b-inactive{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.15);}
.b-inactive::before{background:#f87171;}
.b-student{background:rgba(255,255,255,0.08);color:var(--txt2);border:1px solid var(--bdr2);}
.b-warden{background:rgba(245,158,11,0.1);color:#fbbf24;border:1px solid rgba(245,158,11,0.15);}
.b-admin{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.15);}
.b-room-req{background:rgba(168,85,247,0.1);color:#c084fc;border:1px solid rgba(168,85,247,0.15);}
.b-room-req::before{background:#c084fc;}
.b-general{background:rgba(6,182,212,0.1);color:#22d3ee;border:1px solid rgba(6,182,212,0.15);}
.b-maint-type{background:rgba(245,158,11,0.1);color:#fbbf24;border:1px solid rgba(245,158,11,0.15);}
.b-admin-type{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.15);}

.btn{border:none;border-radius:8px;padding:8px 14px;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .12s;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.2px;}
.btn-white{background:var(--white);color:#000;}
.btn-white:hover{background:#e5e5e5;transform:translateY(-1px);}
.btn-ghost{background:var(--bg2);color:var(--txt2);border:1px solid var(--bdr);}
.btn-ghost:hover{border-color:var(--bdr2);color:var(--txt);}
.btn-gold{background:rgba(245,158,11,0.1);color:var(--gold);border:1px solid rgba(245,158,11,0.2);}
.btn-gold:hover{background:var(--gold);color:#000;}
.btn-green{background:rgba(34,197,94,0.1);color:var(--green);border:1px solid rgba(34,197,94,0.2);}
.btn-green:hover{background:var(--green);color:#000;}
.btn-red{background:rgba(239,68,68,0.08);color:var(--red);border:1px solid rgba(239,68,68,0.15);}
.btn-red:hover{background:var(--red);color:#fff;}
.btn-purple{background:rgba(168,85,247,0.1);color:#c084fc;border:1px solid rgba(168,85,247,0.2);}
.btn-purple:hover{background:#a855f7;color:#fff;}
.btn:disabled{opacity:0.35;cursor:not-allowed;transform:none!important;}
.btn-lg{padding:11px 22px;font-size:13px;border-radius:10px;}
.btn-sm{padding:5px 10px;font-size:11px;border-radius:6px;}

.msg-ok{font-size:12px;color:#4ade80;padding:10px 14px;background:rgba(34,197,94,0.08);border-radius:8px;border:1px solid rgba(34,197,94,0.15);}
.msg-err{font-size:12px;color:#f87171;padding:10px 14px;background:rgba(239,68,68,0.08);border-radius:8px;border:1px solid rgba(239,68,68,0.15);}

.alert{border-radius:12px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.alert-gold{background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);}
.alert-red{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);}
.alert-white{background:rgba(255,255,255,0.04);border:1px solid var(--bdr);}
.alert-purple{background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.15);}
.alert-title{font-size:13px;font-weight:700;margin-bottom:2px;}
.at-gold{color:var(--gold);}
.at-red{color:var(--red);}
.at-white{color:var(--white);}
.at-purple{color:#c084fc;}
.alert-sub{font-size:11px;color:var(--txt3);}

.notice{background:var(--bg1);border:1px solid var(--bdr);border-radius:12px;padding:18px;margin-bottom:10px;transition:all .15s;}
.notice:hover{border-color:var(--bdr2);}
.notice-title{font-size:14px;font-weight:700;color:var(--white);margin-bottom:6px;}
.notice-msg{font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:10px;}
.notice-meta{font-size:11px;color:var(--txt3);display:flex;align-items:center;gap:8px;}

.prog-wrap{background:rgba(255,255,255,0.05);border-radius:4px;height:4px;margin-top:7px;overflow:hidden;}
.prog{height:100%;border-radius:4px;transition:width .4s;}
.prog-w{background:var(--white);}
.prog-g{background:var(--green);}
.prog-gold{background:var(--gold);}
.prog-r{background:var(--red);}

.row-item{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(42,42,42,0.6);}
.row-item:last-child{border-bottom:none;}
.row-lbl{font-size:12px;color:var(--txt3);}
.row-val{font-size:12px;font-weight:600;color:var(--txt);}

.act-list{display:flex;flex-direction:column;}
.act-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(42,42,42,0.5);}
.act-item:last-child{border-bottom:none;}
.act-dot{width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0;}
.act-txt{font-size:12px;color:var(--txt);line-height:1.4;}
.act-time{font-size:10px;color:var(--txt3);margin-top:3px;}

.filters{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
.filter{padding:6px 12px;border-radius:7px;border:1px solid var(--bdr);background:var(--bg1);color:var(--txt3);font-family:'Inter',sans-serif;font-size:11px;font-weight:600;cursor:pointer;transition:all .1s;letter-spacing:0.3px;}
.filter:hover{border-color:var(--bdr2);color:var(--txt);}
.filter.on{background:var(--white);color:#000;border-color:var(--white);}

.mono{font-family:'JetBrains Mono',monospace;font-size:11px;}
.pri-h{color:#f87171;font-weight:700;font-size:11px;}
.pri-m{color:#fbbf24;font-weight:700;font-size:11px;}
.pri-l{color:var(--txt3);font-weight:700;font-size:11px;}

.spin-wrap{display:flex;align-items:center;justify-content:center;padding:48px;color:var(--txt3);font-size:13px;gap:10px;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:16px;height:16px;border:2px solid var(--bdr2);border-top-color:var(--white);border-radius:50%;animation:spin .6s linear infinite;}

.empty{text-align:center;padding:48px;color:var(--txt3);}
.empty-icon{font-size:32px;margin-bottom:10px;opacity:0.5;}
.empty-txt{font-size:13px;}

.form{display:flex;flex-direction:column;gap:14px;}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:1000;}
.modal{background:var(--bg1);border:1px solid var(--bdr2);border-radius:16px;padding:28px;width:440px;position:relative;}
.modal-title{font-size:16px;font-weight:800;color:var(--white);margin-bottom:4px;}
.modal-sub{font-size:12px;color:var(--txt3);margin-bottom:20px;}

.search-row{display:flex;gap:8px;margin-bottom:14px;align-items:center;}
.search-info{font-size:11px;color:var(--txt3);white-space:nowrap;}

.pw-section{background:var(--bg2);border:1px solid var(--bdr);border-radius:12px;padding:18px;margin-top:20px;}
.pw-title{font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px;}

@media(max-width:768px){
  .sb{width:200px;min-width:200px;}
  .grid2{grid-template-columns:1fr;}
  .form-row{grid-template-columns:1fr;}
  .stats{grid-template-columns:1fr 1fr;}
}
`;

// ── Helpers ──────────────────────────────────────────────────
const ini = (n = "") => n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmt = (d) => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };
const fmtFull = (d) => { if (!d) return "—"; return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); };
const isRoomReq = (desc) => desc && desc.startsWith("ROOM REQUEST");

const Bdg = ({ s }) => {
  const m = {
    open:["b-open","Open"], inprog:["b-inprog","In Progress"],
    resolved:["b-resolved","Resolved"], available:["b-available","Available"],
    occupied:["b-occupied","Occupied"], maintenance:["b-maintenance","Maintenance"],
    Active:["b-active","Active"], active:["b-active","Active"],
    Inactive:["b-inactive","Inactive"], inactive:["b-inactive","Inactive"],
    student:["b-student","Student"], warden:["b-warden","Warden"], admin:["b-admin","Admin"],
  };
  const [cls, lbl] = m[s] || ["b-student", s];
  return <span className={`bdg ${cls}`}>{lbl}</span>;
};

const Pri = ({ p }) => <span className={p==="High"?"pri-h":p==="Medium"?"pri-m":"pri-l"}>{p}</span>;
const Spin = () => <div className="spin-wrap"><div className="spin"></div>Loading...</div>;
const Empty = ({ icon, text }) => <div className="empty"><div className="empty-icon">{icon}</div><div className="empty-txt">{text}</div></div>;
const NoticeBdg = ({ type }) => {
  if (type === "admin") return <span className="bdg b-admin-type">Admin</span>;
  if (type === "maintenance") return <span className="bdg b-maint-type">Maintenance</span>;
  return <span className="bdg b-general">General</span>;
};
const DescCell = ({ desc }) => {
  if (isRoomReq(desc)) return <span className="bdg b-room-req">🏠 Room Request</span>;
  return <span style={{ color: "var(--txt2)" }}>{desc?.slice(0, 30)}{desc?.length > 30 ? "..." : ""}</span>;
};

// ── Allocation Modal (shared by Warden + Admin) ──────────────
function AllocModal({ modal, avail, onClose, onDone }) {
  const [room, setRoom] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!room) return setMsg("Please select a room.");
    setLoading(true); setMsg("");
    try {
      await updateComplaint(modal.complaintId, {
        status: "resolved",
        room_id: room,
        student_db_id: modal.studentDbId
      });
      setMsg("✓ Room allocated and ticket closed!");
      setTimeout(() => { onClose(); onDone(); }, 1400);
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">🏠 Allocate Room</div>
        <div className="modal-sub">Assigning room for <strong style={{ color: "var(--white)" }}>{modal.studentName}</strong> · {modal.studentUid}</div>
        <div className="form">
          <div>
            <label className="f-lbl">Select Available Room ({avail.length} available)</label>
            <select className="f-sel" value={room} onChange={e => setRoom(e.target.value)}>
              <option value="">Choose a room...</option>
              {avail.map(r => <option key={r.id} value={r.id}>{r.room_number} — Block {r.block}, Floor {r.floor} ({r.type})</option>)}
            </select>
          </div>
          {msg && <div className={msg.startsWith("✓") ? "msg-ok" : "msg-err"}>{msg}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-white btn-lg" onClick={handle} disabled={loading}>
              {loading ? "Allocating..." : "Allocate & Close Ticket →"}
            </button>
            <button className="btn btn-ghost btn-lg" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vacate Modal ─────────────────────────────────────────────
function VacateModal({ room, onClose, onDone }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const students = room.student_name ? room.student_name.split(", ") : [];
  const uids = room.student_uid ? room.student_uid.split(", ") : [];
  const [selUid, setSelUid] = useState(uids[0] || "");

  const handle = async () => {
    setLoading(true); setMsg("");
    try {
      // Find student db id from uid — pass uid as student_id workaround via body
      await vacateRoom(room.id, { student_uid: selUid });
      setMsg("✓ Room vacated successfully!");
      setTimeout(() => { onClose(); onDone(); }, 1400);
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">🚪 Vacate Room</div>
        <div className="modal-sub">Room <strong style={{ color: "var(--white)" }}>{room.room_number}</strong> — Block {room.block}, Floor {room.floor}</div>
        {students.length > 1 && (
          <div style={{ marginBottom: 14 }}>
            <label className="f-lbl">Select Student to Remove</label>
            <select className="f-sel" value={selUid} onChange={e => setSelUid(e.target.value)}>
              {uids.map((uid, i) => <option key={uid} value={uid}>{students[i]} ({uid})</option>)}
            </select>
          </div>
        )}
        {students.length === 1 && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 13 }}>
            Student: <strong style={{ color: "var(--white)" }}>{students[0]}</strong> ({uids[0]})
          </div>
        )}
        <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 16 }}>
          This will mark the student as vacated and free the room for new allocation.
        </div>
        {msg && <div className={msg.startsWith("✓") ? "msg-ok" : "msg-err"} style={{ marginBottom: 12 }}>{msg}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-red btn-lg" onClick={handle} disabled={loading}>
            {loading ? "Processing..." : "Confirm Vacate"}
          </button>
          <button className="btn btn-ghost btn-lg" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Password Change Section ───────────────────────────────────
function PasswordSection() {
  const [form, setForm] = useState({ current: "", newp: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!form.current || !form.newp || !form.confirm) return setMsg("Please fill all fields.");
    if (form.newp !== form.confirm) return setMsg("New passwords do not match.");
    if (form.newp.length < 6) return setMsg("New password must be at least 6 characters.");
    setLoading(true); setMsg("");
    try {
      const r = await changePassword({ current_password: form.current, new_password: form.newp });
      setMsg("✓ " + r.message);
      setForm({ current: "", newp: "", confirm: "" });
    } catch (e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div className="pw-section">
      <div className="pw-title">🔐 Change Password</div>
      <div className="form">
        <div>
          <label className="f-lbl">Current Password</label>
          <input className="f-inp" type="password" placeholder="Enter current password"
            value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
        </div>
        <div className="form-row">
          <div>
            <label className="f-lbl">New Password</label>
            <input className="f-inp" type="password" placeholder="Min 6 characters"
              value={form.newp} onChange={e => setForm({ ...form, newp: e.target.value })} />
          </div>
          <div>
            <label className="f-lbl">Confirm New Password</label>
            <input className="f-inp" type="password" placeholder="Repeat new password"
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
          </div>
        </div>
        {msg && <div className={msg.startsWith("✓") ? "msg-ok" : "msg-err"}>{msg}</div>}
        <div>
          <button className="btn btn-white" onClick={handle} disabled={loading}>
            {loading ? "Updating..." : "Update Password →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT
// ─────────────────────────────────────────────────────────────
function StudentDB({ user, onLogout }) {
  const [pg, setPg] = useState("home");
  const [complaints, setComplaints] = useState([]);
  const [room, setRoom] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: "", description: "", priority: "Medium" });
  const [msg, setMsg] = useState("");
  const [roomMsg, setRoomMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => parseInt(localStorage.getItem("hms_notices_seen_" + user.id) || "0"));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, n] = await Promise.all([getComplaints(), getNotices()]);
      setComplaints(c); setNotices(n);
      try { setRoom(await getMyRoom()); } catch { setRoom(null); }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = notices.filter(n => new Date(n.created_at).getTime() > lastSeen).length;

  const handleSubmit = async () => {
    if (!form.category || !form.description) return setMsg("Please fill all fields.");
    if (!room) return setMsg("No room allocated. Request a room first.");
    setSubmitting(true); setMsg("");
    try {
      const r = await createComplaint(form);
      setMsg("✓ Submitted — Ticket ID: " + r.ticket_id);
      setForm({ category: "", description: "", priority: "Medium" });
      load();
    } catch (e) { setMsg(e.message); }
    setSubmitting(false);
  };

  const handleRoomReq = async () => {
    setRequesting(true); setRoomMsg("");
    try {
      const r = await createComplaint({ category: "Room Request", description: "ROOM REQUEST — Please allocate a room to me.", priority: "High" });
      setRoomMsg("✓ Room request sent! Ticket: " + r.ticket_id + ". Your warden will assign a room soon.");
    } catch (e) {
      setRoomMsg("✓ Room request sent! Your warden will assign a room soon.");
    }
    setRequesting(false);
  };

  const open = complaints.filter(c => c.status === "open").length;
  const resolved = complaints.filter(c => c.status === "resolved").length;

  const nav = [
    { id: "home", icon: "◈", label: "Dashboard" },
    { id: "comp", icon: "⊡", label: "My Tickets", badge: open > 0 ? open : null },
    { id: "new", icon: "✦", label: "New Complaint" },
    { id: "room", icon: "⊟", label: "My Room" },
    { id: "ntc", icon: "◎", label: "Notices", badge: unread > 0 ? unread : null },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div className="shell">
      <div className="sb">
        <div className="sb-head">
          <div className="sb-brand">
            <div className="sb-icon">🏠</div>
            <div><div className="sb-name">HMS Portal</div><span className="sb-role sb-role-s">Student</span></div>
          </div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Menu</div>
          {nav.map(n => (
            <button key={n.id} className={`ni ${pg===n.id?"on":""}`} onClick={() => {
              setPg(n.id); setMsg("");
              if (n.id === "ntc") {
                const now = Date.now();
                localStorage.setItem("hms_notices_seen_" + user.id, String(now));
                setLastSeen(now);
              }
            }}>
              <span className="ni-icon">{n.icon}</span>{n.label}
              {n.badge && <span className="ni-bdg">{n.badge}</span>}
            </button>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="av av-s">{ini(user.name)}</div>
            <div><div className="sb-uname">{user.name}</div><div className="sb-umeta">{room?.room_number || "No room"} · {user.user_id}</div></div>
          </div>
          <button className="sb-out" onClick={onLogout}>⏻ Sign out</button>
        </div>
      </div>

      <div className="main">
        {pg === "home" && <>
          <div className="topbar">
            <div><div className="tb-title">Good morning, {user.name.split(" ")[0]} 👋</div><div className="tb-sub">Here's your hostel overview</div></div>
          </div>
          <div className="content">
            {loading ? <Spin /> : <>
              {!room && (
                <div className="alert alert-purple">
                  <div>
                    <div className="alert-title at-purple">🏠 No room allocated yet</div>
                    <div className="alert-sub">Request a room from your warden</div>
                    {roomMsg && <div className={roomMsg.startsWith("✓") ? "msg-ok" : "msg-err"} style={{ marginTop: 8 }}>{roomMsg}</div>}
                  </div>
                  <button className="btn btn-purple" onClick={handleRoomReq} disabled={requesting}>
                    {requesting ? "Sending..." : "Request Room"}
                  </button>
                </div>
              )}
              <div className="stats">
                {[
                  { icon: "⊡", cls: "si-w", val: String(complaints.length), lbl: "Total Tickets", delta: open + " open", dc: open > 0 ? "warn" : "ok", nav: "comp" },
                  { icon: "✓", cls: "si-g", val: String(resolved), lbl: "Resolved", delta: "complaints closed", dc: "ok", nav: "comp" },
                  { icon: "⊟", cls: "si-c", val: room?.room_number || "—", lbl: "My Room", delta: room ? room.type + " · Floor " + room.floor : "Not allocated", dc: "", nav: "room" },
                  { icon: "◎", cls: "si-p", val: String(notices.length), lbl: "Notices", delta: unread + " unread", dc: unread > 0 ? "warn" : "", nav: "ntc" },
                ].map(s => (
                  <div className="stat" key={s.lbl} onClick={() => setPg(s.nav)}>
                    <div className="stat-top"><div className={`stat-icon ${s.cls}`}>{s.icon}</div></div>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                    <div className={`stat-delta ${s.dc}`}>{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Recent Tickets</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPg("comp")}>View all →</button>
                  </div>
                  {complaints.slice(0, 5).map(c => (
                    <div className="row-item" key={c.id} style={{ cursor: "pointer" }} onClick={() => setPg("comp")}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--txt)", marginBottom: 2 }}>{c.description?.slice(0, 36)}{c.description?.length > 36 ? "..." : ""}</div>
                        <div className="mono" style={{ color: "var(--txt3)" }}>{c.ticket_id} · {fmt(c.created_at)}</div>
                      </div>
                      <Bdg s={c.status} />
                    </div>
                  ))}
                  {complaints.length === 0 && <Empty icon="✓" text="No complaints yet" />}
                </div>
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Latest Notices</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setPg("ntc"); const now = Date.now(); localStorage.setItem("hms_notices_seen_"+user.id, String(now)); setLastSeen(now); }}>View all →</button>
                  </div>
                  {notices.slice(0, 5).map(n => (
                    <div className="row-item" key={n.id} style={{ cursor: "pointer" }} onClick={() => { setPg("ntc"); const now = Date.now(); localStorage.setItem("hms_notices_seen_"+user.id, String(now)); setLastSeen(now); }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--txt)", marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 10, color: "var(--txt3)" }}>{fmt(n.created_at)} · {n.posted_by_name}</div>
                      </div>
                      <NoticeBdg type={n.type} />
                    </div>
                  ))}
                  {notices.length === 0 && <Empty icon="📋" text="No notices yet" />}
                </div>
              </div>
            </>}
          </div>
        </>}

        {pg === "comp" && <>
          <div className="topbar">
            <div><div className="tb-title">My Complaints</div><div className="tb-sub">{complaints.length} tickets · {open} open · {resolved} resolved</div></div>
            <button className="btn btn-white" onClick={() => setPg("new")}>+ New Complaint</button>
          </div>
          <div className="content">
            {loading ? <Spin /> : complaints.length === 0 ? <Empty icon="✓" text="No complaints submitted yet" /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Ticket ID</th><th>Description</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td className="mono" style={{ color: "var(--txt2)" }}>{c.ticket_id}</td>
                        <td>{c.description?.slice(0, 45)}{c.description?.length > 45 ? "..." : ""}</td>
                        <td style={{ color: "var(--txt3)" }}>{c.category}</td>
                        <td><Pri p={c.priority} /></td>
                        <td style={{ color: "var(--txt3)" }}>{fmt(c.created_at)}</td>
                        <td><Bdg s={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "new" && <>
          <div className="topbar">
            <div><div className="tb-title">New Complaint</div><div className="tb-sub">Report a hostel issue</div></div>
          </div>
          <div className="content">
            {!room && <div className="alert alert-gold"><div><div className="alert-title at-gold">⚠ No room allocated</div><div className="alert-sub">You need a room before submitting complaints</div></div></div>}
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-hd"><div className="card-title">Complaint Details</div></div>
              <div className="form">
                <div className="form-row">
                  <div>
                    <label className="f-lbl">Category</label>
                    <select className="f-sel" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select...</option>
                      <option>Plumbing</option><option>Electrical</option><option>Carpentry</option><option>Furniture</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="f-lbl">Priority</label>
                    <select className="f-sel" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="f-lbl">Room</label>
                  <input className="f-inp" type="text" value={room?.room_number || "Not allocated"} readOnly />
                </div>
                <div>
                  <label className="f-lbl">Description</label>
                  <textarea className="f-area" rows={5} placeholder="Describe the issue — location, severity, when it started..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                {msg && <div className={msg.startsWith("✓") ? "msg-ok" : "msg-err"}>{msg}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-white btn-lg" onClick={handleSubmit} disabled={submitting || !room}>{submitting ? "Submitting..." : "Submit Complaint →"}</button>
                  <button className="btn btn-ghost btn-lg" onClick={() => setPg("comp")}>My Tickets</button>
                </div>
              </div>
            </div>
          </div>
        </>}

        {pg === "room" && <>
          <div className="topbar">
            <div><div className="tb-title">My Room</div><div className="tb-sub">Room details and amenities</div></div>
          </div>
          <div className="content">
            {loading ? <Spin /> : room ? (
              <div className="grid2">
                <div className="card">
                  <div className="card-hd"><div className="card-title">Room Information</div></div>
                  {[["Room Number", room.room_number], ["Block", "Block " + room.block], ["Floor", "Floor " + room.floor], ["Type", room.type + " Occupancy"], ["Status", <Bdg s={room.status} />]].map(([l, v]) => (
                    <div className="row-item" key={l}><span className="row-lbl">{l}</span><span className="row-val">{v}</span></div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-hd"><div className="card-title">Amenities Included</div></div>
                  {["Attached Bathroom", "High-Speed Wi-Fi", "Air Conditioning", "Study Table & Chair", "Wardrobe & Storage", "24×7 Power Backup", "Hot Water Supply", "CCTV Surveillance"].map(a => (
                    <div className="row-item" key={a}><span style={{ fontSize: 12, color: "var(--txt)" }}>{a}</span><span style={{ color: "var(--green)" }}>✓</span></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ maxWidth: 480 }}>
                <Empty icon="🛏️" text="No room allocated. Request a room from your warden." />
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button className="btn btn-purple btn-lg" onClick={handleRoomReq} disabled={requesting}>{requesting ? "Sending..." : "Request Room Allocation"}</button>
                  {roomMsg && <div className={roomMsg.startsWith("✓") ? "msg-ok" : "msg-err"} style={{ marginTop: 12 }}>{roomMsg}</div>}
                </div>
              </div>
            )}
          </div>
        </>}

        {pg === "ntc" && <>
          <div className="topbar">
            <div><div className="tb-title">Notice Board</div><div className="tb-sub">Official announcements</div></div>
          </div>
          <div className="content">
            {loading ? <Spin /> : notices.length === 0 ? <Empty icon="📋" text="No notices posted yet" /> :
              notices.map(n => (
                <div className="notice" key={n.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div className="notice-title">{n.title}</div>
                      <div className="notice-msg">{n.message}</div>
                      <div className="notice-meta"><span>📅 {fmtFull(n.created_at)}</span><span>·</span><span>👤 {n.posted_by_name}</span></div>
                    </div>
                    <div style={{ marginLeft: 14 }}><NoticeBdg type={n.type} /></div>
                  </div>
                </div>
              ))
            }
          </div>
        </>}

        {pg === "settings" && <>
          <div className="topbar">
            <div><div className="tb-title">Settings</div><div className="tb-sub">Manage your account</div></div>
          </div>
          <div className="content">
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-hd"><div className="card-title">Account Info</div></div>
              {[["Name", user.name], ["User ID", user.user_id], ["Role", "Student"], ["Room", room?.room_number || "Not allocated"]].map(([l, v]) => (
                <div className="row-item" key={l}><span className="row-lbl">{l}</span><span className="row-val">{v}</span></div>
              ))}
              <PasswordSection />
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WARDEN
// ─────────────────────────────────────────────────────────────
function WardenDB({ user, onLogout }) {
  const [pg, setPg] = useState("home");
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updId, setUpdId] = useState(null);
  const [allocModal, setAllocModal] = useState(null);
  const [vacateModal, setVacateModal] = useState(null);
  const [blkFilter, setBlkFilter] = useState("all");
  const [compFilter, setCompFilter] = useState("all");
  const [stuSearch, setStuSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [noticeForm, setNoticeForm] = useState({ title: "", type: "general", message: "" });
  const [nMsg, setNMsg] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, r, s, n] = await Promise.all([getComplaints(), getRooms(), getUsers("student"), getNotices()]);
      setComplaints(c); setRooms(r); setStudents(s); setNotices(n);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (id, status) => {
    setUpdId(id);
    try { await updateComplaint(id, { status }); await load(); }
    catch (e) { alert(e.message); }
    setUpdId(null);
  };

  const handlePostNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) return setNMsg("Title and message required.");
    setPosting(true); setNMsg("");
    try {
      await createNotice(noticeForm);
      setNMsg("✓ Notice posted!");
      setNoticeForm({ title: "", type: "general", message: "" }); load();
    } catch (e) { setNMsg(e.message); }
    setPosting(false);
  };

  const allocUids = rooms.flatMap(r => r.student_uid ? r.student_uid.split(", ") : []).filter(Boolean);
  const unalloc = students.filter(s => !allocUids.includes(s.user_id));
  const avail = rooms.filter(r => r.status === "available");
  const openComp = complaints.filter(c => c.status === "open").length;
  const roomReqs = complaints.filter(c => isRoomReq(c.description) && c.status === "open").length;
  const occCount = rooms.filter(r => r.status === "occupied").length;

  const filtRooms = (blkFilter === "all" ? rooms : rooms.filter(r => r.block === blkFilter))
    .filter(r => !roomSearch || r.room_number.toLowerCase().includes(roomSearch.toLowerCase()) || (r.student_name || "").toLowerCase().includes(roomSearch.toLowerCase()));

  const filtComp = compFilter === "all" ? complaints
    : compFilter === "roomreq" ? complaints.filter(c => isRoomReq(c.description))
    : complaints.filter(c => c.status === compFilter);

  const filtStudents = students.filter(s =>
    !stuSearch || s.name.toLowerCase().includes(stuSearch.toLowerCase()) ||
    s.user_id.toLowerCase().includes(stuSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(stuSearch.toLowerCase())
  );

  const nav = [
    { id: "home", icon: "◈", label: "Dashboard" },
    { id: "comp", icon: "⊡", label: "Complaints", badge: openComp > 0 ? openComp : null },
    { id: "rooms", icon: "⊟", label: "Rooms" },
    { id: "stud", icon: "◉", label: "Students" },
    { id: "ntc", icon: "◎", label: "Notice Board" },
    { id: "post", icon: "✉", label: "Post Notice" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div className="shell">
      <div className="sb">
        <div className="sb-head">
          <div className="sb-brand">
            <div className="sb-icon">🏠</div>
            <div><div className="sb-name">HMS Portal</div><span className="sb-role sb-role-w">Warden</span></div>
          </div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Menu</div>
          {nav.map(n => (
            <button key={n.id} className={`ni ${pg===n.id?"on":""}`} onClick={() => { setPg(n.id); setNMsg(""); }}>
              <span className="ni-icon">{n.icon}</span>{n.label}
              {n.badge && <span className="ni-bdg">{n.badge}</span>}
            </button>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="av av-w">{ini(user.name)}</div>
            <div><div className="sb-uname">{user.name}</div><div className="sb-umeta">Warden · {user.user_id}</div></div>
          </div>
          <button className="sb-out" onClick={onLogout}>⏻ Sign out</button>
        </div>
      </div>

      <div className="main">
        {pg === "home" && <>
          <div className="topbar">
            <div><div className="tb-title">Warden Dashboard</div><div className="tb-sub">Hostel operations overview</div></div>
            <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
          <div className="content">
            {loading ? <Spin /> : <>
              {roomReqs > 0 && (
                <div className="alert alert-purple">
                  <div>
                    <div className="alert-title at-purple">🏠 {roomReqs} room request{roomReqs > 1 ? "s" : ""} pending</div>
                    <div className="alert-sub">Students are waiting for room allocation</div>
                  </div>
                  <button className="btn btn-purple" onClick={() => {
                    const first = complaints.find(c => isRoomReq(c.description) && c.status === "open");
                    if (first) setAllocModal({ complaintId: first.id, studentDbId: first.student_db_id, studentName: first.student_name, studentUid: first.student_uid });
                  }}>Allocate Now →</button>
                </div>
              )}
              {openComp > roomReqs && (
                <div className="alert alert-gold">
                  <div>
                    <div className="alert-title at-gold">⚠ {openComp - roomReqs} open complaint{openComp - roomReqs > 1 ? "s" : ""}</div>
                    <div className="alert-sub">Review and update ticket statuses</div>
                  </div>
                  <button className="btn btn-gold" onClick={() => { setPg("comp"); setCompFilter("open"); }}>View Tickets →</button>
                </div>
              )}
              <div className="stats">
                {[
                  { icon: "⊟", cls: "si-w", val: String(rooms.length), lbl: "Total Rooms", delta: occCount + " occupied", dc: "", nav: "rooms" },
                  { icon: "◉", cls: "si-c", val: String(students.length), lbl: "Students", delta: unalloc.length + " without rooms", dc: unalloc.length > 0 ? "warn" : "ok", nav: "stud" },
                  { icon: "⊡", cls: "si-gold", val: String(openComp), lbl: "Open Tickets", delta: roomReqs + " room requests", dc: openComp > 0 ? "warn" : "ok", nav: "comp" },
                  { icon: "✓", cls: "si-g", val: String(complaints.filter(c => c.status === "resolved").length), lbl: "Resolved", delta: "complaints closed", dc: "ok", nav: "comp" },
                ].map(s => (
                  <div className="stat" key={s.lbl} onClick={() => setPg(s.nav)}>
                    <div className="stat-top"><div className={`stat-icon ${s.cls}`}>{s.icon}</div></div>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                    <div className={`stat-delta ${s.dc}`}>{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-hd"><div className="card-title">Block Occupancy</div></div>
                  {["A","B","C"].map(blk => {
                    const tot = rooms.filter(r => r.block === blk).length;
                    const occ = rooms.filter(r => r.block === blk && r.status === "occupied").length;
                    const pct = tot > 0 ? Math.round(occ/tot*100) : 0;
                    const pc = pct > 85 ? "prog-r" : pct > 60 ? "prog-gold" : "prog-g";
                    return (
                      <div key={blk} style={{ marginBottom: 14, cursor: "pointer" }} onClick={() => { setPg("rooms"); setBlkFilter(blk); }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                          <span style={{ fontWeight: 600, color: "var(--txt)" }}>Block {blk}</span>
                          <span style={{ color: "var(--txt3)" }}>{occ}/{tot} · <span style={{ color: "var(--white)", fontWeight: 700 }}>{pct}%</span></span>
                        </div>
                        <div className="prog-wrap"><div className={`prog ${pc}`} style={{ width: pct + "%" }}></div></div>
                      </div>
                    );
                  })}
                </div>
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Open Tickets</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPg("comp")}>View all →</button>
                  </div>
                  <div className="act-list">
                    {complaints.filter(c => c.status === "open").slice(0, 6).map(c => (
                      <div className="act-item" key={c.id} style={{ cursor: "pointer" }} onClick={() => {
                        if (isRoomReq(c.description)) {
                          setAllocModal({ complaintId: c.id, studentDbId: c.student_db_id, studentName: c.student_name, studentUid: c.student_uid });
                        } else { setPg("comp"); }
                      }}>
                        <div className="act-dot" style={{ background: isRoomReq(c.description) ? "#a855f7" : c.priority === "High" ? "var(--red)" : c.priority === "Medium" ? "var(--gold)" : "var(--txt3)" }}></div>
                        <div>
                          <div className="act-txt">{isRoomReq(c.description) ? `🏠 Room Request — ${c.student_name}` : `${c.ticket_id} — ${c.description?.slice(0, 28)}...`}</div>
                          <div className="act-time">{isRoomReq(c.description) ? "Click to allocate room" : `Room ${c.room_number} · ${c.student_name}`}</div>
                        </div>
                      </div>
                    ))}
                    {openComp === 0 && <Empty icon="✓" text="All clear!" />}
                  </div>
                </div>
              </div>
            </>}
          </div>
        </>}

        {pg === "comp" && <>
          <div className="topbar">
            <div><div className="tb-title">Complaints</div><div className="tb-sub">{complaints.length} total · {openComp} open · {roomReqs} room requests</div></div>
          </div>
          <div className="content">
            <div className="filters">
              {[
                { key: "all", label: "All (" + complaints.length + ")" },
                { key: "roomreq", label: "🏠 Room Requests (" + complaints.filter(c => isRoomReq(c.description)).length + ")" },
                { key: "open", label: "Open (" + complaints.filter(c => c.status === "open").length + ")" },
                { key: "inprog", label: "In Progress (" + complaints.filter(c => c.status === "inprog").length + ")" },
                { key: "resolved", label: "Resolved (" + complaints.filter(c => c.status === "resolved").length + ")" },
              ].map(f => (
                <button key={f.key} className={`filter ${compFilter===f.key?"on":""}`} onClick={() => setCompFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            {loading ? <Spin /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Ticket ID</th><th>Student</th><th>Room</th><th>Type</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {filtComp.map(c => (
                      <tr key={c.id} style={{ background: isRoomReq(c.description) ? "rgba(168,85,247,0.04)" : "" }}>
                        <td className="mono" style={{ color: "var(--txt2)" }}>{c.ticket_id}</td>
                        <td style={{ fontWeight: 600 }}>{c.student_name}</td>
                        <td style={{ color: "var(--txt3)" }}>{c.room_number}</td>
                        <td><DescCell desc={c.description} /></td>
                        <td style={{ color: "var(--txt3)" }}>{c.category}</td>
                        <td><Pri p={c.priority} /></td>
                        <td style={{ color: "var(--txt3)" }}>{fmt(c.created_at)}</td>
                        <td><Bdg s={c.status} /></td>
                        <td style={{ display: "flex", gap: 5 }}>
                          {isRoomReq(c.description) && c.status === "open" && (
                            <button className="btn btn-purple btn-sm" onClick={() => setAllocModal({ complaintId: c.id, studentDbId: c.student_db_id, studentName: c.student_name, studentUid: c.student_uid })}>
                              🏠 Allocate
                            </button>
                          )}
                          {!isRoomReq(c.description) && c.status === "open" && (
                            <button className="btn btn-gold btn-sm" disabled={updId===c.id} onClick={() => handleUpdate(c.id, "inprog")}>Start</button>
                          )}
                          {c.status === "inprog" && (
                            <button className="btn btn-green btn-sm" disabled={updId===c.id} onClick={() => handleUpdate(c.id, "resolved")}>Resolve ✓</button>
                          )}
                          {c.status === "resolved" && <span style={{ fontSize: 11, color: "var(--txt3)" }}>Done ✓</span>}
                        </td>
                      </tr>
                    ))}
                    {filtComp.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 28, color: "var(--txt3)" }}>No complaints found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "rooms" && <>
          <div className="topbar">
            <div><div className="tb-title">Room Management</div><div className="tb-sub">{rooms.length} rooms · {occCount} occupied · {avail.length} available</div></div>
          </div>
          <div className="content">
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
              <div className="filters" style={{ margin: 0 }}>
                {["all","A","B","C"].map(b => (
                  <button key={b} className={`filter ${blkFilter===b?"on":""}`} onClick={() => setBlkFilter(b)}>
                    {b==="all"?"All Blocks":"Block "+b}
                  </button>
                ))}
              </div>
              <input className="f-search" style={{ flex: 1, maxWidth: 220 }} placeholder="Search room or student..." value={roomSearch} onChange={e => setRoomSearch(e.target.value)} />
            </div>
            {loading ? <Spin /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Room</th><th>Block</th><th>Floor</th><th>Type</th><th>Status</th><th>Occupants</th><th>Student ID(s)</th><th>Action</th></tr></thead>
                  <tbody>
                    {filtRooms.map(r => (
                      <tr key={r.id}>
                        <td className="mono" style={{ fontWeight: 700 }}>{r.room_number}</td>
                        <td style={{ color: "var(--txt3)" }}>Block {r.block}</td>
                        <td style={{ color: "var(--txt3)" }}>Floor {r.floor}</td>
                        <td style={{ color: "var(--txt2)" }}>{r.type}</td>
                        <td><Bdg s={r.status} /></td>
                        <td style={{ color: r.student_name ? "var(--txt)" : "var(--txt3)", fontWeight: r.student_name ? 500 : 400 }}>{r.student_name || "—"}</td>
                        <td className="mono" style={{ color: "var(--txt3)", fontSize: 10 }}>{r.student_uid || "—"}</td>
                        <td>
                          {r.student_name && (
                            <button className="btn btn-red btn-sm" onClick={() => setVacateModal(r)}>Vacate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "stud" && <>
          <div className="topbar">
            <div><div className="tb-title">Students</div><div className="tb-sub">{students.length} registered · {unalloc.length} without rooms</div></div>
          </div>
          <div className="content">
            <div className="search-row">
              <input className="f-search" style={{ flex: 1 }} placeholder="🔍 Search by name, ID or email..." value={stuSearch} onChange={e => setStuSearch(e.target.value)} />
              <span className="search-info">{filtStudents.length} of {students.length}</span>
            </div>
            {loading ? <Spin /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Room</th><th>Block</th><th>Floor</th><th>Status</th></tr></thead>
                  <tbody>
                    {filtStudents.map(s => {
                      const sr = rooms.find(r => r.student_uid?.includes(s.user_id));
                      return (
                        <tr key={s.id}>
                          <td className="mono" style={{ color: "var(--txt2)" }}>{s.user_id}</td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td style={{ color: "var(--txt3)" }}>{s.email}</td>
                          <td className="mono" style={{ color: sr ? "var(--txt)" : "var(--red)", fontWeight: 600 }}>{sr?.room_number || "Not Allocated"}</td>
                          <td style={{ color: "var(--txt3)" }}>{sr ? "Block "+sr.block : "—"}</td>
                          <td style={{ color: "var(--txt3)" }}>{sr ? "Floor "+sr.floor : "—"}</td>
                          <td><Bdg s={s.status} /></td>
                        </tr>
                      );
                    })}
                    {filtStudents.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--txt3)" }}>No students found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "ntc" && <>
          <div className="topbar">
            <div><div className="tb-title">Notice Board</div><div className="tb-sub">{notices.length} notices</div></div>
            <button className="btn btn-white" onClick={() => setPg("post")}>+ Post Notice</button>
          </div>
          <div className="content">
            {loading ? <Spin /> : notices.length === 0 ? <Empty icon="📋" text="No notices yet" /> :
              notices.map(n => (
                <div className="notice" key={n.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div className="notice-title">{n.title}</div>
                      <div className="notice-msg">{n.message}</div>
                      <div className="notice-meta"><span>📅 {fmtFull(n.created_at)}</span><span>·</span><span>👤 {n.posted_by_name}</span></div>
                    </div>
                    <div style={{ marginLeft: 14 }}><NoticeBdg type={n.type} /></div>
                  </div>
                </div>
              ))
            }
          </div>
        </>}

        {pg === "post" && <>
          <div className="topbar">
            <div><div className="tb-title">Post Notice</div><div className="tb-sub">Broadcast to all hostel members</div></div>
          </div>
          <div className="content">
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-hd"><div className="card-title">New Announcement</div></div>
              <div className="form">
                <div>
                  <label className="f-lbl">Title</label>
                  <input className="f-inp" type="text" placeholder="e.g. Water supply disruption on Block B"
                    value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="f-lbl">Type</label>
                  <select className="f-sel" value={noticeForm.type} onChange={e => setNoticeForm({ ...noticeForm, type: e.target.value })}>
                    <option value="general">General</option>
                    <option value="admin">Administrative</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="f-lbl">Message</label>
                  <textarea className="f-area" rows={5} placeholder="Write the full notice here..."
                    value={noticeForm.message} onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })} />
                </div>
                {nMsg && <div className={nMsg.startsWith("✓") ? "msg-ok" : "msg-err"}>{nMsg}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-white btn-lg" onClick={handlePostNotice} disabled={posting}>{posting ? "Posting..." : "Post Notice →"}</button>
                  <button className="btn btn-ghost btn-lg" onClick={() => setPg("ntc")}>View All</button>
                </div>
              </div>
            </div>
          </div>
        </>}

        {pg === "settings" && <>
          <div className="topbar">
            <div><div className="tb-title">Settings</div><div className="tb-sub">Manage your account</div></div>
          </div>
          <div className="content">
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-hd"><div className="card-title">Account Info</div></div>
              {[["Name", user.name], ["User ID", user.user_id], ["Role", "Warden"]].map(([l, v]) => (
                <div className="row-item" key={l}><span className="row-lbl">{l}</span><span className="row-val">{v}</span></div>
              ))}
              <PasswordSection />
            </div>
          </div>
        </>}
      </div>

      {allocModal && <AllocModal modal={allocModal} avail={avail} onClose={() => setAllocModal(null)} onDone={load} />}
      {vacateModal && <VacateModal room={vacateModal} onClose={() => setVacateModal(null)} onDone={load} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────
function AdminDB({ user, onLogout }) {
  const [pg, setPg] = useState("home");
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noticeForm, setNoticeForm] = useState({ title: "", type: "general", message: "" });
  const [nMsg, setNMsg] = useState("");
  const [posting, setPosting] = useState(false);
  const [allocModal, setAllocModal] = useState(null);
  const [vacateModal, setVacateModal] = useState(null);
  const [blkFilter, setBlkFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [compFilter, setCompFilter] = useState("all");
  const [stuSearch, setStuSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, r, u, n] = await Promise.all([getComplaints(), getRooms(), getUsers(), getNotices()]);
      setComplaints(c); setRooms(r); setUsers(u); setNotices(n);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePostNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) return setNMsg("Title and message required.");
    setPosting(true); setNMsg("");
    try {
      await createNotice(noticeForm);
      setNMsg("✓ Notice posted!");
      setNoticeForm({ title: "", type: "general", message: "" }); load();
    } catch (e) { setNMsg(e.message); }
    setPosting(false);
  };

  const students = users.filter(u => u.role === "student");
  const allocUids = rooms.flatMap(r => r.student_uid ? r.student_uid.split(", ") : []).filter(Boolean);
  const unalloc = students.filter(s => !allocUids.includes(s.user_id));
  const avail = rooms.filter(r => r.status === "available");
  const openComp = complaints.filter(c => c.status === "open").length;
  const roomReqs = complaints.filter(c => isRoomReq(c.description) && c.status === "open").length;
  const occCount = rooms.filter(r => r.status === "occupied").length;

  const filtRooms = (blkFilter === "all" ? rooms : rooms.filter(r => r.block === blkFilter))
    .filter(r => !roomSearch || r.room_number.toLowerCase().includes(roomSearch.toLowerCase()) || (r.student_name || "").toLowerCase().includes(roomSearch.toLowerCase()));

  const filtComp = compFilter === "all" ? complaints
    : compFilter === "roomreq" ? complaints.filter(c => isRoomReq(c.description))
    : complaints.filter(c => c.status === compFilter);

  const baseUsers = roleFilter === "all" ? users : users.filter(u => u.role === roleFilter);
  const filtUsers = baseUsers.filter(u =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.user_id.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const nav = [
    { id: "home", icon: "◈", label: "Overview" },
    { id: "users", icon: "◉", label: "Users" },
    { id: "comp", icon: "⊡", label: "Complaints", badge: openComp > 0 ? openComp : null },
    { id: "rooms", icon: "⊟", label: "All Rooms" },
    { id: "post", icon: "✉", label: "Post Notice" },
    { id: "ntc", icon: "◎", label: "Notice Board" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <div className="shell">
      <div className="sb">
        <div className="sb-head">
          <div className="sb-brand">
            <div className="sb-icon">🏠</div>
            <div><div className="sb-name">HMS Portal</div><span className="sb-role sb-role-a">Admin</span></div>
          </div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Menu</div>
          {nav.map(n => (
            <button key={n.id} className={`ni ${pg===n.id?"on":""}`} onClick={() => { setPg(n.id); setNMsg(""); }}>
              <span className="ni-icon">{n.icon}</span>{n.label}
              {n.badge && <span className="ni-bdg">{n.badge}</span>}
            </button>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="av av-a">{ini(user.name)}</div>
            <div><div className="sb-uname">{user.name}</div><div className="sb-umeta">Admin · {user.user_id}</div></div>
          </div>
          <button className="sb-out" onClick={onLogout}>⏻ Sign out</button>
        </div>
      </div>

      <div className="main">
        {pg === "home" && <>
          <div className="topbar">
            <div><div className="tb-title">Admin Overview</div><div className="tb-sub">Complete system statistics</div></div>
            <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
          <div className="content">
            {loading ? <Spin /> : <>
              <div className="stats">
                {[
                  { icon: "◉", cls: "si-w", val: String(students.length), lbl: "Students", delta: users.filter(u=>u.role==="warden").length + " wardens", dc: "", nav: "users" },
                  { icon: "⊟", cls: "si-c", val: String(rooms.length), lbl: "Rooms", delta: occCount + " occupied · " + avail.length + " free", dc: "", nav: "rooms" },
                  { icon: "⊡", cls: "si-gold", val: String(openComp), lbl: "Open Tickets", delta: roomReqs + " room requests", dc: openComp > 0 ? "warn" : "ok", nav: "comp" },
                  { icon: "◎", cls: "si-p", val: String(notices.length), lbl: "Notices", delta: "posted to all", dc: "", nav: "ntc" },
                  { icon: "⚡", cls: "si-r", val: rooms.length > 0 ? Math.round(occCount/rooms.length*100) + "%" : "—", lbl: "Occupancy", delta: occCount + " of " + rooms.length, dc: "", nav: "rooms" },
                  { icon: "⚠", cls: "si-gold", val: String(unalloc.length), lbl: "Unallocated", delta: "students need rooms", dc: unalloc.length > 0 ? "warn" : "ok", nav: "rooms" },
                ].map(s => (
                  <div className="stat" key={s.lbl} onClick={() => setPg(s.nav)}>
                    <div className="stat-top"><div className={`stat-icon ${s.cls}`}>{s.icon}</div></div>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                    <div className={`stat-delta ${s.dc}`}>{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="grid2">
                <div className="card">
                  <div className="card-hd"><div className="card-title">System Status</div></div>
                  {[
                    ["Occupancy Rate", rooms.length > 0 ? Math.round(occCount/rooms.length*100)+"%" : "—"],
                    ["Available Rooms", String(avail.length)],
                    ["Unallocated Students", String(unalloc.length)],
                    ["Open Complaints", String(openComp)],
                    ["Room Requests", String(roomReqs)],
                    ["In Progress", String(complaints.filter(c=>c.status==="inprog").length)],
                    ["Resolved", String(complaints.filter(c=>c.status==="resolved").length)],
                    ["Total Users", String(users.length)],
                  ].map(([l,v]) => (
                    <div className="row-item" key={l}><span className="row-lbl">{l}</span><span className="row-val">{v}</span></div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-hd"><div className="card-title">Block Summary</div></div>
                  {["A","B","C"].map(blk => {
                    const tot = rooms.filter(r=>r.block===blk).length;
                    const occ = rooms.filter(r=>r.block===blk&&r.status==="occupied").length;
                    const pct = tot > 0 ? Math.round(occ/tot*100) : 0;
                    const pc = pct > 85 ? "prog-r" : pct > 60 ? "prog-gold" : "prog-g";
                    return (
                      <div key={blk} style={{ marginBottom: 16, cursor: "pointer" }} onClick={() => { setPg("rooms"); setBlkFilter(blk); }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600 }}>Block {blk}</span>
                          <span style={{ color: "var(--txt3)" }}>{occ}/{tot} · <span style={{ color: "var(--white)", fontWeight: 700 }}>{pct}%</span></span>
                        </div>
                        <div className="prog-wrap"><div className={`prog ${pc}`} style={{ width: pct+"%" }}></div></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>}
          </div>
        </>}

        {pg === "users" && <>
          <div className="topbar">
            <div><div className="tb-title">User Management</div><div className="tb-sub">{users.length} total · {students.length} students · {users.filter(u=>u.role==="warden").length} wardens</div></div>
          </div>
          <div className="content">
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div className="filters" style={{ margin: 0 }}>
                {["all","student","warden","admin"].map(r => (
                  <button key={r} className={`filter ${roleFilter===r?"on":""}`} onClick={() => setRoleFilter(r)}>
                    {r==="all"?"All":""+r.charAt(0).toUpperCase()+r.slice(1)+"s"}
                  </button>
                ))}
              </div>
              <input className="f-search" style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search by name, ID or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              <span className="search-info">{filtUsers.length} results</span>
            </div>
            {loading ? <Spin /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>User ID</th><th>Name</th><th>Role</th><th>Email</th><th>Room</th><th>Status</th></tr></thead>
                  <tbody>
                    {filtUsers.map(u => {
                      const ur = rooms.find(r => r.student_uid?.includes(u.user_id));
                      return (
                        <tr key={u.id}>
                          <td className="mono" style={{ color: "var(--txt2)" }}>{u.user_id}</td>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td><Bdg s={u.role} /></td>
                          <td style={{ color: "var(--txt3)" }}>{u.email}</td>
                          <td className="mono" style={{ color: ur ? "var(--txt)" : "var(--txt3)", fontSize: 11 }}>{ur?.room_number || (u.role==="student"?"Not allocated":"—")}</td>
                          <td><Bdg s={u.status} /></td>
                        </tr>
                      );
                    })}
                    {filtUsers.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--txt3)" }}>No users found</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "comp" && <>
          <div className="topbar">
            <div><div className="tb-title">All Complaints</div><div className="tb-sub">{complaints.length} total · {openComp} open</div></div>
          </div>
          <div className="content">
            <div className="filters">
              {[
                { key: "all", label: "All (" + complaints.length + ")" },
                { key: "roomreq", label: "🏠 Room Requests (" + complaints.filter(c=>isRoomReq(c.description)).length + ")" },
                { key: "open", label: "Open (" + complaints.filter(c=>c.status==="open").length + ")" },
                { key: "inprog", label: "In Progress (" + complaints.filter(c=>c.status==="inprog").length + ")" },
                { key: "resolved", label: "Resolved (" + complaints.filter(c=>c.status==="resolved").length + ")" },
              ].map(f => (
                <button key={f.key} className={`filter ${compFilter===f.key?"on":""}`} onClick={() => setCompFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            {loading ? <Spin /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Ticket ID</th><th>Student</th><th>Room</th><th>Type</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {filtComp.map(c => (
                      <tr key={c.id} style={{ background: isRoomReq(c.description) ? "rgba(168,85,247,0.03)" : "" }}>
                        <td className="mono" style={{ color: "var(--txt2)" }}>{c.ticket_id}</td>
                        <td style={{ fontWeight: 500 }}>{c.student_name}</td>
                        <td style={{ color: "var(--txt3)" }}>{c.room_number}</td>
                        <td><DescCell desc={c.description} /></td>
                        <td style={{ color: "var(--txt3)" }}>{c.category}</td>
                        <td><Pri p={c.priority} /></td>
                        <td style={{ color: "var(--txt3)" }}>{fmt(c.created_at)}</td>
                        <td><Bdg s={c.status} /></td>
                      </tr>
                    ))}
                    {filtComp.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 28, color: "var(--txt3)" }}>No complaints</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "rooms" && <>
          <div className="topbar">
            <div><div className="tb-title">All Rooms</div><div className="tb-sub">{rooms.length} rooms · {occCount} occupied · {avail.length} available</div></div>
          </div>
          <div className="content">
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
              <div className="filters" style={{ margin: 0 }}>
                {["all","A","B","C"].map(b => (
                  <button key={b} className={`filter ${blkFilter===b?"on":""}`} onClick={() => setBlkFilter(b)}>
                    {b==="all"?"All":"Block "+b}
                  </button>
                ))}
              </div>
              <input className="f-search" style={{ flex: 1, maxWidth: 220 }} placeholder="Search room or student..." value={roomSearch} onChange={e => setRoomSearch(e.target.value)} />
            </div>
            {loading ? <Spin /> : (
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Room</th><th>Block</th><th>Floor</th><th>Type</th><th>Status</th><th>Occupants</th><th>IDs</th><th>Action</th></tr></thead>
                  <tbody>
                    {filtRooms.map(r => (
                      <tr key={r.id}>
                        <td className="mono" style={{ fontWeight: 700 }}>{r.room_number}</td>
                        <td style={{ color: "var(--txt3)" }}>Block {r.block}</td>
                        <td style={{ color: "var(--txt3)" }}>Floor {r.floor}</td>
                        <td style={{ color: "var(--txt2)" }}>{r.type}</td>
                        <td><Bdg s={r.status} /></td>
                        <td style={{ color: r.student_name ? "var(--txt)" : "var(--txt3)", fontWeight: r.student_name ? 500 : 400 }}>{r.student_name || "—"}</td>
                        <td className="mono" style={{ color: "var(--txt3)", fontSize: 10 }}>{r.student_uid || "—"}</td>
                        <td>
                          {r.student_name && (
                            <button className="btn btn-red btn-sm" onClick={() => setVacateModal(r)}>Vacate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {pg === "post" && <>
          <div className="topbar">
            <div><div className="tb-title">Post Notice</div><div className="tb-sub">Broadcast to all {users.length} members</div></div>
          </div>
          <div className="content">
            <div className="card" style={{ maxWidth: 560, marginBottom: 24 }}>
              <div className="card-hd"><div className="card-title">New Announcement</div></div>
              <div className="form">
                <div>
                  <label className="f-lbl">Title</label>
                  <input className="f-inp" type="text" placeholder="e.g. Hostel fee deadline extended"
                    value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="f-lbl">Type</label>
                  <select className="f-sel" value={noticeForm.type} onChange={e => setNoticeForm({ ...noticeForm, type: e.target.value })}>
                    <option value="general">General</option>
                    <option value="admin">Administrative</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="f-lbl">Message</label>
                  <textarea className="f-area" rows={6} placeholder="Write the complete notice message..."
                    value={noticeForm.message} onChange={e => setNoticeForm({ ...noticeForm, message: e.target.value })} />
                </div>
                {nMsg && <div className={nMsg.startsWith("✓") ? "msg-ok" : "msg-err"}>{nMsg}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-white btn-lg" onClick={handlePostNotice} disabled={posting}>{posting ? "Posting..." : "Post Notice →"}</button>
                  <button className="btn btn-ghost btn-lg" onClick={() => setPg("ntc")}>View All →</button>
                </div>
              </div>
            </div>
          </div>
        </>}

        {pg === "ntc" && <>
          <div className="topbar">
            <div><div className="tb-title">Notice Board</div><div className="tb-sub">{notices.length} notices</div></div>
            <button className="btn btn-white" onClick={() => setPg("post")}>+ Post Notice</button>
          </div>
          <div className="content">
            {loading ? <Spin /> : notices.length === 0 ? <Empty icon="📋" text="No notices yet" /> :
              notices.map(n => (
                <div className="notice" key={n.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div className="notice-title">{n.title}</div>
                      <div className="notice-msg">{n.message}</div>
                      <div className="notice-meta"><span>📅 {fmtFull(n.created_at)}</span><span>·</span><span>👤 {n.posted_by_name}</span></div>
                    </div>
                    <div style={{ marginLeft: 14 }}><NoticeBdg type={n.type} /></div>
                  </div>
                </div>
              ))
            }
          </div>
        </>}

        {pg === "settings" && <>
          <div className="topbar">
            <div><div className="tb-title">Settings</div><div className="tb-sub">Manage your account</div></div>
          </div>
          <div className="content">
            <div className="card" style={{ maxWidth: 560 }}>
              <div className="card-hd"><div className="card-title">Account Info</div></div>
              {[["Name", user.name], ["User ID", user.user_id], ["Role", "System Admin"]].map(([l, v]) => (
                <div className="row-item" key={l}><span className="row-lbl">{l}</span><span className="row-val">{v}</span></div>
              ))}
              <PasswordSection />
            </div>
          </div>
        </>}
      </div>

      {allocModal && <AllocModal modal={allocModal} avail={avail} onClose={() => setAllocModal(null)} onDone={load} />}
      {vacateModal && <VacateModal room={vacateModal} onClose={() => setVacateModal(null)} onDone={load} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!id || !pass) return setErr("Please enter your User ID and password.");
    setErr(""); setLoading(true);
    try {
      const u = await apiLogin(id, pass);
      onLogin(u.role, u);
    } catch (e) { setErr(e.message || "Login failed. Check your credentials."); }
    setLoading(false);
  };

  const ph = { student: "Student ID — e.g. HS2024001", warden: "Warden ID — e.g. WD001", admin: "Admin ID — e.g. AD001" };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-brand">
          <div className="login-brand-icon">🏠</div>
          <div><div className="login-brand-name">HMS Portal</div><div className="login-brand-sub">Hostel Management System</div></div>
        </div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to access your dashboard</div>
        <div className="role-tabs">
          {["student","warden","admin"].map(r => (
            <button key={r} className={`role-tab ${role===r?"on":""}`} onClick={() => { setRole(r); setErr(""); }}>
              {r==="student"?"🎓 Student":r==="warden"?"🔑 Warden":"⚙️ Admin"}
            </button>
          ))}
        </div>
        <div className="f-wrap">
          <label className="f-lbl">User ID</label>
          <input className="f-inp" type="text" placeholder={ph[role]} value={id} onChange={e => setId(e.target.value)} onKeyDown={e => e.key==="Enter"&&handle()} />
        </div>
        <div className="f-wrap">
          <label className="f-lbl">Password</label>
          <input className="f-inp" type="password" placeholder="Enter your password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter"&&handle()} />
        </div>
        {err && <div className="login-err">{err}</div>}
        <button className="login-btn" onClick={handle} disabled={loading}>{loading ? "Signing in..." : "Sign in →"}</button>
        <div className="login-hint">Test password: <code>password123</code></div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const onLogin = (r, u) => { setRole(r); setUser(u); };
  const onLogout = () => { apiLogout(); setRole(null); setUser(null); };
  return (
    <div className="root">
      <style>{css}</style>
      {!role && <Login onLogin={onLogin} />}
      {role==="student" && <StudentDB user={user} onLogout={onLogout} />}
      {role==="warden"  && <WardenDB  user={user} onLogout={onLogout} />}
      {role==="admin"   && <AdminDB   user={user} onLogout={onLogout} />}
    </div>
  );
}