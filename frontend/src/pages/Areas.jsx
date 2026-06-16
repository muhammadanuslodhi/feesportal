import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { API_ORIGIN } from '../services/api';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ areaName: '', chairmanName: '', file: null });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); const { data } = await api.get('/areas'); setAreas(data); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ areaName:'', chairmanName:'', file:null }); setShow(true); };
  const openEdit = (a) => { setEditing(a); setForm({ areaName:a.areaName, chairmanName:a.chairmanName, file:null }); setShow(true); };

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('areaName', form.areaName);
    fd.append('chairmanName', form.chairmanName);
    if (form.file) fd.append('chairmanSignature', form.file);
    try {
      if (editing) await api.put(`/areas/${editing._id}`, fd);
      else await api.post('/areas', fd);
      toast.success('Saved'); setShow(false); load();
    } catch (e) { toast.error('Save failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this area and its members?')) return;
    await api.delete(`/areas/${id}`); toast.success('Deleted'); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Areas</h1>
        <button className="btn-primary" onClick={openNew}>+ Add New Area</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <p>Loading...</p> : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Area Name</th>
                <th className="p-3 text-left">Chairman</th>
                <th className="p-3 text-left">Members</th>
                <th className="p-3 text-left">Signature</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a._id} className="border-t">
                  <td className="p-3 font-medium">{a.areaName}</td>
                  <td className="p-3">{a.chairmanName}</td>
                  <td className="p-3">{a.totalMembers}</td>
                  <td className="p-3">{a.chairmanSignature ? <img src={API_ORIGIN + a.chairmanSignature} className="h-10" /> : '-'}</td>
                  <td className="p-3 space-x-2">
                    <Link className="btn-secondary !py-1 !px-3 text-xs" to={`/fees/${a._id}`}>View</Link>
                    <button className="btn-secondary !py-1 !px-3 text-xs" onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn-danger !py-1 !px-3 text-xs" onClick={() => remove(a._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!areas.length && <tr><td colSpan="5" className="text-center p-6 text-gray-500">No areas yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50 p-4">
          <form onSubmit={save} className="card w-full max-w-md space-y-3">
            <h2 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Area</h2>
            <div><label className="label">Area Name</label><input className="input" value={form.areaName} onChange={e=>setForm({...form,areaName:e.target.value})} required/></div>
            <div><label className="label">Chairman Name</label><input className="input" value={form.chairmanName} onChange={e=>setForm({...form,chairmanName:e.target.value})} required/></div>
            <div><label className="label">Chairman Signature</label><input type="file" accept="image/*" onChange={e=>setForm({...form,file:e.target.files[0]})}/></div>
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
