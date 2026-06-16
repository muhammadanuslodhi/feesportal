import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Card = ({ title, value, color }) => (
  <div className="card">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ totalAreas:0, totalMembers:0, totalCollected:0, totalPending:0, latest:[] });
  const [areas, setAreas] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => { (async () => {
    try {
      const [a, s] = await Promise.all([api.get('/areas'), api.get('/reports/dashboard')]);
      setAreas(a.data); setStats(s.data);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Search Area</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:max-w-sm" value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Select existing area</option>
            {areas.map(a => <option key={a._id} value={a._id}>{a.areaName}</option>)}
          </select>
          <button className="btn-primary" disabled={!selected} onClick={() => nav(`/fees/${selected}`)}>Search Area</button>
          <Link to="/areas" className="btn-secondary">View All Areas</Link>
          <Link to="/areas" className="btn-success">Add New Area</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Areas" value={stats.totalAreas} color="text-brand-600" />
        <Card title="Total Members" value={stats.totalMembers} color="text-indigo-600" />
        <Card title="Total Collected" value={`RS: ${stats.totalCollected}`} color="text-green-600" />
        <Card title="Total Pending" value={`${stats.totalPending}`} color="text-red-600" /> 
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Latest Updates</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr><th className="text-left p-2">Member</th><th className="text-left p-2">Area</th><th className="text-left p-2">Year</th><th className="text-left p-2">Collected</th><th className="text-left p-2">Pending</th><th className="text-left p-2">Updated</th></tr>
            </thead>
            <tbody>
              {stats.latest.map(f => (
                <tr key={f._id} className="border-t">
                  <td className="p-2">{f.memberId?.memberName || '-'}</td>
                  <td className="p-2">{f.memberId?.areaId?.areaName || '-'}</td>
                  <td className="p-2">{f.year}</td>
                  <td className="p-2 text-green-600">Rs: {f.totalAmount}</td>
                  <td className="p-2 text-red-600">Rs: {f.pendingAmount}</td>
                  <td className="p-2">{new Date(f.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
              {!stats.latest.length && <tr><td colSpan="6" className="text-center p-4 text-gray-500">No updates yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
