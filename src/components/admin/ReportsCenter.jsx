import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Filter, 
  FileSpreadsheet, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';
import { exportWorkersToCSV } from '../../services/reportService';
import { STAGES, STAGE_META, CONTRACTORS, TRADES } from '../../types/constants';

export const ReportsCenter = () => {
  const { workers } = useWorkers();
  const [selectedContractor, setSelectedContractor] = useState('ALL');
  const [selectedTrade, setSelectedTrade] = useState('ALL');
  const [selectedFitness, setSelectedFitness] = useState('ALL');

  const filtered = workers.filter(w => {
    if (selectedContractor !== 'ALL' && w.hr?.contractorName !== selectedContractor) return false;
    if (selectedTrade !== 'ALL' && w.hr?.trade !== selectedTrade) return false;
    if (selectedFitness !== 'ALL') {
      if (selectedFitness === 'FIT' && w.medical?.fitnessStatus !== 'FIT') return false;
      if (selectedFitness === 'UNFIT' && w.medical?.fitnessStatus !== 'UNFIT') return false;
      if (selectedFitness === 'PENDING' && w.medical?.fitnessStatus) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Reports Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Executive Reports & Analytics Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Generate compliant worker rosters, medical clearance summaries, and equipment logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            id="btn-export-csv"
            className="btn btn-primary"
            onClick={() => exportWorkersToCSV(filtered)}
          >
            <Download size={16} />
            <span>Export CSV Dataset</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Print Report View</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        {/* Contractor Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONTRACTOR</label>
          <select
            className="filter-select"
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
          >
            <option value="ALL">All Contractors ({CONTRACTORS.length})</option>
            {CONTRACTORS.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Trade Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SKILL TRADE</label>
          <select
            className="filter-select"
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
          >
            <option value="ALL">All Skill Trades</option>
            {TRADES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Fitness Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>MEDICAL STATUS</label>
          <select
            className="filter-select"
            value={selectedFitness}
            onChange={(e) => setSelectedFitness(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="FIT">Certified FIT Only</option>
            <option value="UNFIT">Flagged UNFIT Only</option>
            <option value="PENDING">Pending Medical Exam</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> matching records
        </div>
      </div>

      {/* Printable Master Report Table */}
      <div className="table-card">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
            Master Workforce Onboarding & Accommodation Register
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Lloyds Metals & Energy Limited • Internal Compliance
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Worker Full Name</th>
                <th>Trade</th>
                <th>Contractor Agency</th>
                <th>Stage & Pipeline</th>
                <th>Medical Fitness</th>
                <th>Vitals (BP/SpO2)</th>
                <th>EHS Briefing</th>
                <th>Biometrics</th>
                <th>Camp Housing</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>
                    {w.assignedWorkerId || w.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{w.hr?.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Age: {w.hr?.age} • Ph: {w.hr?.mobileNumber}</div>
                  </td>
                  <td><span className="badge badge-purple">{w.hr?.trade}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{w.hr?.contractorName}</td>
                  <td>
                    <span className={`badge badge-${STAGE_META[w.stage]?.color || 'info'}`}>
                      {STAGE_META[w.stage]?.label || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {w.medical?.fitnessStatus ? (
                      <span className={`badge badge-${w.medical?.fitnessStatus === 'FIT' ? 'success' : 'danger'}`}>
                        {w.medical?.fitnessStatus}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    {w.medical?.bpSystolic ? `${w.medical.bpSystolic}/${w.medical?.bpDiastolic} mmHg` : '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${w.safety?.briefingDone ? 'success' : 'warning'}`}>
                      {w.safety?.briefingDone ? 'COMPLETE' : 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${w.it?.faceBiometricRegistered ? 'success' : 'danger'}`}>
                      {w.it?.faceBiometricRegistered ? 'ENROLLED' : 'NO'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {w.camp?.campName ? (
                      <div>
                        <strong>{w.camp.campName}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{w.camp.roomNumber} ({w.camp.bedNumber})</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Unallocated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
