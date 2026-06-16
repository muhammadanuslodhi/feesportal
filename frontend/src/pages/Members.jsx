import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filter, setFilter] = useState({ areaId:'', q:'', memberId:'' });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ memberName:'', fatherName:'', areaId:'' });

  const load = async () => {
    const { data } = await api.get('/members', { params: filter });
    setMembers(data); setPage(1);
  };
  useEffect(() => { api.get('/areas').then(r => setAreas(r.data)); load(); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter.areaId]);

  const openNew = () => { setEditing(null); setForm({ memberName:'', fatherName:'', areaId: areas[0]?._id || '' }); setShow(true); };
  const openEdit = (m) => { setEditing(m); setForm({ memberName:m.memberName, fatherName:m.fatherName, areaId:m.areaId?._id||m.areaId }); setShow(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/members/${editing._id}`, form);
      else await api.post('/members', form);
      toast.success('Saved'); setShow(false); load();
    } catch { toast.error('Save failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this member?')) return;
    await api.delete(`/members/${id}`); toast.success('Deleted'); load();
  };

  const paged = members.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members</h1>
        <button className="btn-primary" onClick={openNew}>+ Add Member</button>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-4 gap-3">
        <select className="input" value={filter.areaId} onChange={e=>setFilter({...filter,areaId:e.target.value})}>
          <option value="">All Areas</option>
          {areas.map(a => <option key={a._id} value={a._id}>{a.areaName}</option>)}
        </select>
        <input className="input" placeholder="Search by name" value={filter.q} onChange={e=>setFilter({...filter,q:e.target.value})}/>
        <input className="input" placeholder="Search by Member ID" value={filter.memberId} onChange={e=>setFilter({...filter,memberId:e.target.value})}/>
        <button className="btn-primary" onClick={load}>Search</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="p-3 text-left">Member ID</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Father</th><th className="p-3 text-left">Area</th><th className="p-3 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {paged.map(m => (
              <tr key={m._id} className="border-t">
                <td className="p-3 font-mono">{m.memberId}</td>
                <td className="p-3">{m.memberName}</td>
                <td className="p-3">{m.fatherName}</td>
                <td className="p-3">{m.areaId?.areaName || '-'}</td>
                <td className="p-3 space-x-2">
                  <button className="btn-secondary !py-1 !px-3 text-xs" onClick={()=>openEdit(m)}>Edit</button>
                  <button className="btn-danger !py-1 !px-3 text-xs" onClick={()=>remove(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!paged.length && <tr><td colSpan="5" className="text-center p-6 text-gray-500">No members</td></tr>}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-3 text-sm">
          <span>Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button className="btn-secondary !py-1" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <button className="btn-secondary !py-1" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4">
          <form onSubmit={save} className="card w-full max-w-md space-y-3">
            <h2 className="text-lg font-semibold">{editing?'Edit':'Add'} Member</h2>
            <div><label className="label">Member Name</label><input className="input" value={form.memberName} onChange={e=>setForm({...form,memberName:e.target.value})} required/></div>
            <div><label className="label">Father Name</label><input className="input" value={form.fatherName} onChange={e=>setForm({...form,fatherName:e.target.value})} required/></div>
            <div><label className="label">Area</label>
              <select className="input" value={form.areaId} onChange={e=>setForm({...form,areaId:e.target.value})} required>
                <option value="">Select area</option>
                {areas.map(a => <option key={a._id} value={a._id}>{a.areaName}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500">Member ID will be auto-generated.</p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={()=>setShow(false)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
