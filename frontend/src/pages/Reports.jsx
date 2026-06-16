import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Reports() {
  const [areas, setAreas] = useState([]);
  useEffect(() => { api.get('/areas').then(r => setAreas(r.data)); }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map(a => (
          <Link key={a._id} to={`/fees/${a._id}`} className="card hover:shadow-lg transition">
            <h3 className="font-semibold text-lg">{a.areaName}</h3>
            <p className="text-sm text-gray-500">Chairman: {a.chairmanName}</p>
            <p className="text-sm text-gray-500">Members: {a.totalMembers}</p>
            <p className="mt-2 text-brand-600 text-sm font-medium">View report →</p>
          </Link>
        ))}
        {!areas.length && <p className="text-gray-500">No areas yet.</p>}
      </div>
    </div>
  );
}
