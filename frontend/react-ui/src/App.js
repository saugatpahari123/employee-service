
import React, { useState } from 'react';
import axios from 'axios';

// Use environment variable for API base, fallback to deployed backend URL
const API_BASE = process.env.REACT_APP_API_BASE || 'http://18.191.110.29:8000/api/employees';

function App() {
  const empty = { employee_id: '', first_name: '', last_name: '', dob: '', last4_ssn: '' };
  const [form, setForm] = useState(empty);
  const [fetchId, setFetchId] = useState('');
  const [fetched, setFetched] = useState(null);
  const [message, setMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function createEmployee(e) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(API_BASE + '/', form);
      setFetched(res.data);
      setMessage('Created');
    } catch (err) {
      const msg = err.response?.data || err.message;
      setMessage('Create failed: ' + JSON.stringify(msg));
    }
  }

  async function getEmployee(e) {
    e && e.preventDefault();
    setMessage('');
    if (!fetchId) return setMessage('Enter employee ID to fetch');
    try {
      const res = await axios.get(`${API_BASE}/${encodeURIComponent(fetchId)}`);
      const data = res.data;
      setFetched(data);
      setForm({
        employee_id: data.employee_id ?? '',
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        last4_ssn: data.last4_ssn ?? '',
      });
      setMessage('Fetched');
    } catch (err) {
      if (err.response?.status === 404) return setMessage('Not found');
      const msg = err.response?.data || err.message;
      setMessage('Fetch failed: ' + JSON.stringify(msg));
    }
  }

  async function updateEmployee(e) {
    e.preventDefault();
    setMessage('');
    if (!form.employee_id) return setMessage('employee_id is required to update');
    try {
      const res = await axios.put(`${API_BASE}/${encodeURIComponent(form.employee_id)}`, form);
      setFetched(res.data);
      setMessage('Updated');
    } catch (err) {
      if (err.response?.status === 404) return setMessage('Not found');
      const msg = err.response?.data || err.message;
      setMessage('Update failed: ' + JSON.stringify(msg));
    }
  }

  async function deleteEmployee(e) {
    e.preventDefault();
    setMessage('');
    const id = fetchId || form.employee_id;
    if (!id) return setMessage('employee_id is required to delete');
    try {
      await axios.delete(`${API_BASE}/${encodeURIComponent(id)}`);
      setFetched(null);
      setForm(empty);
      setMessage('Deleted');
    } catch (err) {
      const msg = err.response?.data || err.message;
      setMessage('Delete failed: ' + JSON.stringify(msg));
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Employee Service UI</h2>

      <section style={{ marginBottom: 20 }}>
        <h3>Create Employee</h3>
        <form onSubmit={createEmployee} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
          <input name="employee_id" placeholder="ID" value={form.employee_id} onChange={handleChange} required />
          <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} required />
          <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} required />
          <input name="dob" type="date" placeholder="DOB" value={form.dob} onChange={handleChange} />
          <input name="last4_ssn" placeholder="Last 4 SSN" value={form.last4_ssn} onChange={handleChange} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Create</button>
            <button type="button" onClick={() => { setForm(empty); setMessage(''); }}>Clear</button>
          </div>
        </form>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3>Get / Update / Delete by ID</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input placeholder="employee id" value={fetchId} onChange={(e) => setFetchId(e.target.value)} />
          <button onClick={getEmployee}>Get</button>
          <button onClick={deleteEmployee}>Delete</button>
        </div>

        <form onSubmit={updateEmployee} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
          <input name="employee_id" placeholder="ID" value={form.employee_id} onChange={handleChange} required />
          <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} />
          <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} />
          <input name="dob" type="date" placeholder="DOB" value={form.dob} onChange={handleChange} />
          <input name="last4_ssn" placeholder="Last 4 SSN" value={form.last4_ssn} onChange={handleChange} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Update</button>
            <button type="button" onClick={() => { setForm(empty); setMessage(''); }}>Clear</button>
          </div>
        </form>
      </section>

      <section>
        <h3>Result</h3>
        {message && <div style={{ marginBottom: 8, color: '#333' }}>{message}</div>}
        {fetched ? (
          <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', boxShadow: '0 2px 8px #eee', marginTop: 10 }}>
            <thead style={{ background: '#f0f4f8' }}>
              <tr>
                <th style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'left' }}>Employee ID</th>
                <th style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'left' }}>First Name</th>
                <th style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'left' }}>Last Name</th>
                <th style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'left' }}>DOB</th>
                <th style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'left' }}>Last 4 SSN</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#fafcff', transition: 'background 0.2s' }}>
                <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0' }}>{fetched.employee_id}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0' }}>{fetched.first_name}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0' }}>{fetched.last_name}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0' }}>{fetched.dob}</td>
                <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0' }}>{fetched.last4_ssn}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#666' }}>No employee loaded</div>
        )}
      </section>
    </div>
  );
}

export default App;
