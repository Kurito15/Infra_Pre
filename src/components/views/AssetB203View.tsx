import React, { useState } from 'react';
import { Building, Inspection, ActiveTab, Defect, TelemetryRecord } from '../../types';
import {
  Building2,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  PlusCircle,
  Wrench,
  Layers,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Activity,
  Radio,
  Clock,
  Scan,
  TrendingUp,
  Cpu,
  Download,
  Eye,
  Crosshair,
  BadgeAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';

interface AssetB203ViewProps {
  building?: Building | null;
  inspections: Inspection[];
  telemetry?: TelemetryRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectInspection: (inspection: Inspection) => void;
}

export const AssetB203View: React.FC<AssetB203ViewProps> = ({
  building,
  inspections,
  telemetry = [],
  setActiveTab,
  onSelectInspection,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'defects' | 'cracks' | 'telemetry' | 'history' | 'recommendations'>('defects');
  const [selectedElement, setSelectedElement] = useState<string>('all');

  if (!building) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Registered Buildings in Your Account</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            You haven't registered any infrastructure assets yet. Register a building to perform structural deep-dive monitoring, sensor telemetry, and defect analysis.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('buildings')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Go to Buildings & Register Asset
          </button>
        </div>
      </div>
    );
  }

  // Filter inspections for B-203
  const b203Inspections = inspections.filter(
    (i) => i.buildingCode === 'B-203' || (building && (i.buildingId === building.id || i.buildingId === 'bld_b203'))
  );

  // Extract all real defects from B-203 inspections
  const allB203Defects: { defect: Defect; inspection: Inspection }[] = [];
  b203Inspections.forEach((insp) => {
    insp.defects?.forEach((def) => {
      allB203Defects.push({ defect: def, inspection: insp });
    });
  });

  // Filter defects by selected element if any
  const filteredDefects = selectedElement === 'all'
    ? allB203Defects
    : allB203Defects.filter((d) => d.inspection.element.toLowerCase().includes(selectedElement.toLowerCase()));

  // Crack propagation historical timeseries for B-203
  const crackProgressionData = [
    { date: '2026-02-15', crackWidth: 0.25, is456Limit: 0.20, label: 'Baseline Scan' },
    { date: '2026-04-10', crackWidth: 0.65, is456Limit: 0.20, label: 'Post-Monsoon Seepage' },
    { date: '2026-06-22', crackWidth: 1.20, is456Limit: 0.20, label: 'Dynamic Traffic Load' },
    { date: '2026-08-01', crackWidth: 1.75, is456Limit: 0.20, label: 'Spalling Expansion' },
    { date: '2026-08-19', crackWidth: 2.14, is456Limit: 0.20, label: 'Latest AI Scan (Critical)' },
  ];

  // Sensor Telemetry for B-203
  const sensorStreamData = [
    { time: '00:00', strainVW: 310, crackLVDT: 1.82, inclination: 0.032 },
    { time: '04:00', strainVW: 318, crackLVDT: 1.89, inclination: 0.034 },
    { time: '08:00', strainVW: 332, crackLVDT: 1.98, inclination: 0.038 },
    { time: '12:00', strainVW: 348, crackLVDT: 2.11, inclination: 0.042 },
    { time: '16:00', strainVW: 345, crackLVDT: 2.14, inclination: 0.041 },
    { time: '20:00', strainVW: 338, crackLVDT: 2.12, inclination: 0.039 },
    { time: 'Now', strainVW: 342.5, crackLVDT: 2.14, inclination: 0.042 },
  ];

  const workOrders = [
    {
      id: 'WO-B203-01',
      title: 'Structural Propping & Load Redistribution (Column C-04)',
      assignedTo: 'CPWD Structural Engineering Division',
      status: 'Completed (Verified on Site)',
      statusColor: 'bg-emerald-100 text-emerald-800',
      dueDate: '2026-08-20',
      priority: 'Immediate',
    },
    {
      id: 'WO-B203-02',
      title: 'Ultra-Low Viscosity Epoxy Pressure Injection (Beam B-12)',
      assignedTo: 'Specialist Grouting Contractor (M/s Sika India)',
      status: 'In Progress (50% Injected)',
      statusColor: 'bg-amber-100 text-amber-800',
      dueDate: '2026-08-23',
      priority: 'High',
    },
    {
      id: 'WO-B203-03',
      title: 'Hydrophilic Polyurethane Grouting (Slab S-08 Retaining Wall)',
      assignedTo: 'Waterproofing & Civil Maintenance Wing',
      status: 'Scheduled',
      statusColor: 'bg-blue-100 text-blue-800',
      dueDate: '2026-08-26',
      priority: 'Moderate',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Asset Hero Header */}
      <div className="bg-[#0B192C] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-lg bg-red-600 text-white font-mono text-xs font-extrabold uppercase tracking-wider shadow-sm">
                Asset B-203
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold font-mono">
                Level-3 Critical Distress
              </span>
              <span className="text-xs font-mono text-slate-400">CPWD Northern Zone-IV / NDZ-II</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {building.name}
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              {building.structuralSystem} &bull; Built in {building.yearBuilt}. Currently under active CPWD forensic structural monitoring following severe rebar cover spalling and diagonal shear fractures in basement transfer members.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-red-400" />
                {building.address || 'Plot 4, Pragati Vihar, Shahdara'}, {building.city}
              </span>
              <span>&bull;</span>
              <span>Total Inspections: <strong className="text-white">{b203Inspections.length}</strong></span>
              <span>&bull;</span>
              <span>Critical Defects: <strong className="text-red-400">{allB203Defects.filter(d => d.defect.severity === 'Critical' || d.defect.severity === 'High').length}</strong></span>
            </div>
          </div>

          {/* Health Index Card */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl shrink-0 text-center w-full md:w-60 shadow-md flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Structural Health Index
              </div>
              <div className="text-4xl font-extrabold font-mono text-red-400 mt-1">
                {building.healthIndex} <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="text-[11px] text-red-300 mt-1 font-semibold flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Hazard Rating: {building.riskStatus}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('new-inspection')}
              className="mt-4 w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Scan New Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structural Key Elements Quick Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Monitored Structural Elements in B-203</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">IS 456 Critical Zone</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {building.keyElements.map((elem) => (
            <div
              key={elem.code}
              className={`p-3 rounded-xl border transition-all ${
                elem.condition === 'Critical'
                  ? 'bg-red-50/70 border-red-300 text-red-950'
                  : elem.condition === 'High'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-300 shadow-2xs">
                  {elem.code}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    elem.condition === 'Critical'
                      ? 'bg-red-600 text-white'
                      : elem.condition === 'High'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {elem.condition}
                </span>
              </div>
              <h4 className="font-bold text-xs mt-2 truncate">{elem.name}</h4>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">Inspected: {elem.lastInspected}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs for B-203 Deep Dive */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'defects', label: 'REAL Detected Defects', icon: Crosshair, count: allB203Defects.length },
          { id: 'cracks', label: 'Crack Growth & Analysis', icon: TrendingUp },
          { id: 'telemetry', label: 'Live Telemetry & Sensors', icon: Radio },
          { id: 'history', label: 'Inspection History', icon: FileCheck, count: b203Inspections.length },
          { id: 'recommendations', label: 'Recommendations & Orders', icon: Wrench, count: workOrders.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: REAL Detected Defects */}
      {activeSubTab === 'defects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-600" />
                <span>Real Roboflow AI Detected Defects for Asset B-203</span>
              </h3>
              <p className="text-xs text-slate-500">
                All real detected defects extracted from stored inspection scans with exact dimensions and bounding coordinates
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Member:</span>
              <select
                aria-label="Filter structural element"
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono px-2.5 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Elements ({allB203Defects.length})</option>
                <option value="column">Column C-04</option>
                <option value="beam">Beam B-12</option>
                <option value="slab">Slab S-08</option>
              </select>
            </div>
          </div>

          {filteredDefects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">No Defects Found for this Filter</h4>
              <p className="text-xs text-slate-500">
                Upload and analyze a structural image for B-203 to detect new defects.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('new-inspection')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-500"
              >
                Run AI Scan Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDefects.map(({ defect, inspection }, idx) => (
                <div
                  key={defect.id || `def-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {inspection.element}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            defect.severity === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : defect.severity === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {defect.severity} Severity
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{defect.type}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {defect.confidence}% Conf.
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {defect.technicalDescription}
                  </p>

                  {/* Defect Physical Metrics Table */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center font-mono border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Length</span>
                      <span className="text-xs font-bold text-slate-800">{defect.estimatedLengthMm} mm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Crack / Void Width</span>
                      <span className={`text-xs font-bold ${defect.estimatedWidthMm >= 2.0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {defect.estimatedWidthMm} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Surface Coverage</span>
                      <span className="text-xs font-bold text-slate-800">{defect.coveragePercent}%</span>
                    </div>
                  </div>

                  {/* Bounding box coords and standards */}
                  <div className="text-[11px] font-mono text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Standard Reference:</span>
                      <span className="font-bold text-slate-700">{defect.standardsReference}</span>
                    </div>
                    {defect.box2d && (
                      <div className="flex items-center justify-between">
                        <span>CAD Box [ymin, xmin, ymax, xmax]:</span>
                        <span className="font-bold text-slate-600">[{defect.box2d.join(', ')}]</span>
                      </div>
                    )}
                  </div>

                  {/* Remediation protocol */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900">
                    <span className="font-bold text-[11px] block mb-0.5">Mandated Remediation Protocol:</span>
                    <p className="text-[11px] text-amber-800">{defect.remediationProtocol}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Audit: {inspection.inspectionCode} ({inspection.date})
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectInspection(inspection)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Certificate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Crack Growth & Analysis */}
      {activeSubTab === 'cracks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span>Column C-04 Crack Aperture Growth Velocity (mm vs. Time)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Aperture progression comparison against IS 456:2000 Cl. 35.3.2 maximum permissible limit (0.20 mm)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  Growth Velocity: +0.31 mm/mo
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crackProgressionData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 2.5]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-mono shadow-xl border border-slate-800 space-y-1">
                            <p className="font-bold text-amber-400">{d.label} ({label})</p>
                            <p className="text-red-300">Measured Crack Width: <strong>{d.crackWidth} mm</strong></p>
                            <p className="text-slate-400">IS 456 Limit: 0.20 mm</p>
                            <p className="text-amber-300">Exceedance: +{(d.crackWidth - 0.20).toFixed(2)} mm</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0.20} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'IS 456 Limit (0.20mm)', position: 'insideTopLeft', fill: '#EF4444', fontSize: 11 }} />
                  <Line type="monotone" dataKey="crackWidth" name="Measured Width (mm)" stroke="#DC2626" strokeWidth={3} dot={{ r: 5, fill: '#DC2626' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crack Progression Technical Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase">Primary Crack Morphology</span>
              <h4 className="font-bold text-sm text-slate-900">Diagonal 45° Shear Fracture</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Initiated at beam-column junction node under combined gravity and seismic shear stress. High risk of brittle failure without shoring.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase">Rebar Corrosion Spalling</span>
              <h4 className="font-bold text-sm text-slate-900">Volumetric Oxide Expansion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chloride ion penetration through 40mm cover concrete causing ferric rust expansion (2.5x volume), spalling outer cover and exposing main rebars.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase">Intervention Urgency</span>
              <h4 className="font-bold text-sm text-red-600">Immediate Propping Mandate</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acro props installed on 2026-08-20. Low-pressure epoxy injection and CFRP bidirectional wrap strengthening scheduled for completion.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Live Telemetry & Sensors */}
      {activeSubTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>VW-STR-04</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Warning</span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-amber-600">342.5 με</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Column C-04 Microstrain (Limit: 350 με)</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>LVDT-CRK-01</span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">Critical</span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-red-600">2.14 mm</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Crack Aperture LVDT (Limit: 2.0 mm)</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>INCL-B2-01</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Normal</span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-emerald-600">0.042°</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">B2 Shear Wall Inclination (Limit: 0.15°)</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>CORR-POT-03</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Warning</span>
              </div>
              <div className="mt-2 text-2xl font-mono font-extrabold text-amber-600">-380 mV</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Half-Cell Potential (ASTM C876 Active)</div>
            </div>
          </div>

          {/* Telemetry Stream Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Real-Time Sensor Telemetry Stream (Last 24 Hours)</span>
                </h3>
                <p className="text-xs text-slate-500">Live IoT strain gauge and displacement transducers</p>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Connected &bull; 100% Signal
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorStreamData} margin={{ top: 10, right: 30, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis yAxisId="strain" domain={[290, 360]} tick={{ fontSize: 10, fill: '#3B82F6' }} />
                  <YAxis yAxisId="crack" orientation="right" domain={[1.5, 2.5]} tick={{ fontSize: 10, fill: '#EF4444' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs font-mono shadow-xl space-y-1">
                            <p className="font-bold text-amber-400">Timestamp: {label}</p>
                            <p className="text-blue-300">Strain (VW-STR-04): {payload[0].value} με</p>
                            <p className="text-red-300">Crack LVDT: {payload[1]?.value} mm</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Line yAxisId="strain" type="monotone" dataKey="strainVW" name="Microstrain (με)" stroke="#3B82F6" strokeWidth={2.5} />
                  <Line yAxisId="crack" type="monotone" dataKey="crackLVDT" name="Crack Aperture (mm)" stroke="#EF4444" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Inspection History */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Certified Audit History for Asset B-203 ({b203Inspections.length} Records)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Complete chronological sequence of certified non-destructive AI inspections
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('new-inspection')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Inspection</span>
            </button>
          </div>

          <div className="space-y-3">
            {b203Inspections.map((insp) => (
              <div
                key={insp.id}
                onClick={() => onSelectInspection(insp)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={insp.originalImage}
                      alt={insp.element}
                      className="h-14 w-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{insp.element}</h4>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {insp.inspectionCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            insp.overallRiskLevel === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {insp.overallRiskLevel} Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{insp.diagnosisSummary}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="font-mono font-extrabold text-sm text-red-600">
                      SHI: {insp.structuralHealthIndex} / 100
                    </div>
                    <span className="text-xs text-blue-600 font-bold underline">
                      View Certificate &rarr;
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100 font-mono">
                  <span>Inspector: {insp.inspectorName} ({insp.inspectorBadge})</span>
                  <span>Date: {insp.date}</span>
                  <span className="text-blue-600 font-bold">{insp.defects?.length || 0} real defects mapped</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Recommendations & Orders */}
      {activeSubTab === 'recommendations' && (
        <div className="space-y-6">
          {/* CPWD Formal Directives */}
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-red-950">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-sm">CPWD Immediate Remediation Directives (Asset B-203)</h3>
            </div>
            <ul className="space-y-2 text-xs text-red-900 list-disc list-inside">
              <li>
                <strong>Shoring Protocol:</strong> Maintain 4x Acro props around Column C-04 until polymer modified micro-concreting reaches 28-day characteristic cube strength (45 MPa).
              </li>
              <li>
                <strong>Pressure Grouting:</strong> Inject low-viscosity epoxy resin (viscosity &lt; 200 mPa.s) under 0.2-0.4 MPa pressure along all 45° diagonal shear fissures on Beam B-12.
              </li>
              <li>
                <strong>CFRP Wrap Strengthening:</strong> Apply 2 layers of bidirectional Carbon Fiber Reinforced Polymer (CFRP) composite wrap around Column C-04 & Beam B-12 tension zone.
              </li>
              <li>
                <strong>Waterproofing & Drainage:</strong> Excavate perimeter retaining wall and install hydrophilic swelling waterstops and drainage geocomposite behind Basement B1 slab.
              </li>
            </ul>
          </div>

          {/* Active Remediation Work Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Active Remediation Work Orders ({workOrders.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Track structural rehabilitation milestones on site</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
                Live Tracking
              </span>
            </div>

            <div className="space-y-3">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                        {wo.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{wo.title}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${wo.statusColor}`}>
                      {wo.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/60 font-mono gap-1">
                    <span>Assigned: <strong>{wo.assignedTo}</strong></span>
                    <span className="font-semibold text-slate-800">Due Date: {wo.dueDate} ({wo.priority} Priority)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
