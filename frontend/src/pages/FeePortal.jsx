import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api, { API_ORIGIN } from '../services/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function FeePortal() {
  const { areaId } = useParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {member, fee}
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ memberName:'', fatherName:'' });

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return Array.from({length:5}, (_,i) => cur - i);
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get(`/reports/area/${areaId}`, { params: { year } });
    setReport(data); setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [areaId, year]);

  const openUpdate = (row) => {
    const fee = row.fee || { memberId: row.member._id, year };
    const base = {};
    MONTHS.forEach(m => base[m] = fee[m] || { paid:false, amount:500 });
    setEditing({ member: row.member, fee: { ...fee, ...base } });
  };

  const saveFee = async () => {
    const payload = { memberId: editing.member._id, year };
    MONTHS.forEach(m => payload[m] = editing.fee[m]);
    await api.post('/fees', payload);
    toast.success('Updated'); setEditing(null); load();
  };

  const deleteMember = async (id) => {
    if (!confirm('Delete this member?')) return;
    await api.delete(`/members/${id}`); toast.success('Deleted'); load();
  };

  const addMember = async (e) => {
    e.preventDefault();
    await api.post('/members', { ...newMember, areaId });
    toast.success('Member added'); setShowAdd(false); setNewMember({memberName:'',fatherName:''}); load();
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18); doc.text('Fees Portal', 14, 15);
    doc.setFontSize(12); doc.text(`Area: ${report.area.areaName}`, 14, 23);
    doc.text(`Year: ${year}`, 14, 29);
    doc.text(`Latest Update: ${new Date(report.latestUpdate).toLocaleString()}`, 14, 35);

    const head = [['#','ID','Name','Father', ...SHORT, 'Total']];
    const body = report.rows.map((r, i) => {
      const cells = MONTHS.map(m => (r.fee?.[m]?.paid ? 'P' : 'U'));
      return [i+1, r.member.memberId, r.member.memberName, r.member.fatherName || 0, ...cells, r.fee?.totalAmount || 0];
    });

    autoTable(doc, { head, body, startY: 42, styles: { fontSize: 7 }, headStyles: { fillColor: [37,99,235] } });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.text(`Total Members: ${report.summary.totalMembers}`, 14, finalY);
    doc.text(`Total Collected: $${report.summary.totalCollected}`, 80, finalY);
    // doc.text(`Total Pending: $${report.summary.totalPending}`, 160, finalY);

    if (report.area.chairmanSignature) {
      try {
        doc.text('Chairman Signature:', 14, finalY + 15);
        doc.text(report.area.chairmanName, 14, finalY + 35);
      } catch {}
    }
    doc.setFontSize(9);
    doc.text('Fees Portal Management System © 2026', 14, doc.internal.pageSize.height - 8);
    doc.save(`${report.area.areaName}-${year}.pdf`);
  };

  if (loading || !report) return <p className="text-center py-10">Loading...</p>;

  const filtered = report.rows.filter(r =>
    !search || r.member.memberName.toLowerCase().includes(search.toLowerCase()) || r.member.memberId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{report.area.areaName}</h1>
          <p className="text-sm text-gray-500">Latest update: {new Date(report.latestUpdate).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-success" onClick={()=>setShowAdd(true)}>+ Add Member</button>
          <input className="input !w-48" placeholder="Search member..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <select className="input !w-32" value={year} onChange={e=>setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-primary" onClick={exportPDF}>Export PDF</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2">#</th><th className="p-2">ID</th><th className="p-2 text-left">Name</th><th className="p-2 text-left">Father</th>
              {SHORT.map(m => <th key={m} className="p-2">{m}</th>)}
              <th className="p-2">Total</th><th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.member._id} className="border-t hover:bg-gray-50">
                <td className="p-2 text-center">{i+1}</td>
                <td className="p-2 font-mono">{r.member.memberId}</td>
                <td className="p-2">{r.member.memberName}</td>
                <td className="p-2">{r.member.fatherName}</td>
                {/* <td className="p-2 text-center text-red-600 font-medium">${r.fee?.pendingAmount || 0}</td> */}
                {MONTHS.map(m => (
                  <td key={m} className="p-2 text-center">
                    {r.fee?.[m]?.paid ? <span className="badge-green">Paid</span> : <span className="badge-red">Unpaid</span>}
                  </td>
                ))}
                <td className="p-2 text-center text-green-600 font-semibold">{r.fee?.totalAmount || 0}</td>
                <td className="p-2 whitespace-nowrap space-x-1">
                  <button className="btn-primary !py-1 !px-2 text-xs" onClick={()=>openUpdate(r)}>Update Fee</button>
                  <button className="btn-danger !py-1 !px-2 text-xs" onClick={()=>deleteMember(r.member._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan="100" className="text-center p-6 text-gray-500">No members</td></tr>}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan="4" className="p-3">Total Members: {report.summary.totalMembers}</td>
              {/* <td className="p-3 text-center text-red-600">${report.summary.totalPending}</td> */}
              <td colSpan="12"></td>
              <td className="p-3 text-center text-green-600">{report.summary.totalCollected}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card text-center">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Chairman Signature</h3>
        {report.area.chairmanSignature
          ? <img src={API_ORIGIN + report.area.chairmanSignature} alt="signature" className="h-20 mx-auto" />
          : <p className="text-gray-400 italic">No signature uploaded</p>}
        <p className="mt-2 font-medium">{report.area.chairmanName}</p>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4">
          <div className="card w-full max-w-2xl">
            <h2 className="text-lg font-semibold mb-3">Update Fees — {editing.member.memberName} ({year})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {MONTHS.map(m => (
                <div key={m} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{m}</span>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={editing.fee[m].paid}
                        onChange={e => setEditing({...editing, fee:{...editing.fee, [m]:{...editing.fee[m], paid:e.target.checked}}})}/>
                      Paid
                    </label>
                  </div>
                  <input type="number" className="input" value={editing.fee[m].amount}
                    onChange={e => setEditing({...editing, fee:{...editing.fee, [m]:{...editing.fee[m], amount:Number(e.target.value)}}})}/>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveFee}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4">
          <form onSubmit={addMember} className="card w-full max-w-md space-y-3">
            <h2 className="text-lg font-semibold">Add Member to {report.area.areaName}</h2>
            <div><label className="label">Member Name</label><input className="input" value={newMember.memberName} onChange={e=>setNewMember({...newMember,memberName:e.target.value})} required/></div>
            <div><label className="label">Father Name</label><input className="input" value={newMember.fatherName} onChange={e=>setNewMember({...newMember,fatherName:e.target.value})} required/></div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
