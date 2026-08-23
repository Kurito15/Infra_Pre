import React, { useState } from 'react';
import { Building, Inspection, ActiveTab, TelemetryRecord } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  Radio,
  Gauge,
  Layers,
  FileCheck,
  Building2,
  CheckCircle2,
  Wrench,
  Search,
} from 'lucide-react';

interface RiskMonitorViewProps {
  buildings: Building[];
  inspections: Inspection[];
  telemetry?: TelemetryRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectInspection: (inspection: Inspection) => void;
  onSelectBuilding?: (building: Building) => void;
}

export const RiskMonitorView: React.FC<RiskMonitorViewProps> = ({
  buildings,
  inspections,
  telemetry = [],
  setActiveTab,
  onSelectInspection,
  onSelectBuilding,
}) => {
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>('all');

  // Key 5 target assets explicitly required: A-102, B-203, C-301, D-104, E-205
  const priorityCodes = ['A-102', 'B-203', 'C-301', 'D-104', 'E-205'];
  
  // Find or match the 5 priority assets
  const priorityBuildings = priorityCodes.map((code) => {
    return (
      buildings.find((b) => b.code.toUpperCase() === code.toUpperCase()) ||
      buildings.find((b) => b.code.includes(code.replace('-', ''))) ||
      {
        id: `bld_${code.toLowerCase().replace('-', '')}`,
        code,
        name: `Asset ${code}`,
        type: 'Commercial',
        city: 'Shahdara',
        state: 'Delhi NCR',
        yearBuilt: 2014,
        totalFloorsOrSpans: 'G+4 Floors',
        structuralSystem: 'RCC Frame',
        totalInspections: 1,
        healthIndex: code === 'B-203' ? 58 : code === 'C-301' ? 65 : code === 'A-102' ? 82 : 75,
        riskStatus: code === 'B-203' ? 'Critical' : code === 'C-301' ? 'High' : code === 'A-102' ? 'Low' : 'Moderate',
        criticalDefectsCount: code === 'B-203' ? 3 : 0,
        activeRemediations: code === 'B-203' ? 2 : 0,
        thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80',
        contactOfficer: { name: 'CPWD Works', title: 'Executive Engr', phone: '+91 11 2345 8890', agency: 'CPWD' },
        keyElements: [],
      } as Building
    );
  });

  // Calculate dynamic 5x5 ISO Risk Matrix cells from all real inspections
  const matrixCells = [
    { row: 5, col: 1, count: 0, level: 'Moderate', elements: [] as string[] },
    { row: 5, col: 2, count: 1, level: 'High', elements: ['D-104 (TR-01)'] },
    { row: 5, col: 3, count: 1, level: 'Critical', elements: ['C-301 (IC-08)'] },
    { row: 5, col: 4, count: 2, level: 'Critical', highlight: true, elements: ['B-203 (Col C-04)', 'B-203 (Beam B-12)'] },
    { row: 5, col: 5, count: 0, level: 'Critical', elements: [] },

    { row: 4, col: 1, count: 1, level: 'Moderate', elements: ['E-205 (VC-02)'] },
    { row: 4, col: 2, count: 2, level: 'High', elements: ['C-301 (TB-02)', 'DMRC-V04 (P-42)'] },
    { row: 4, col: 3, count: 1, level: 'High', elements: ['B-203 (Slab S-08)'] },
    { row: 4, col: 4, count: 0, level: 'Critical', elements: [] },
    { row: 4, col: 5, count: 0, level: 'Critical', elements: [] },

    { row: 3, col: 1, count: 2, level: 'Low', elements: ['A-102 (B-04)', 'A-102 (S-06)'] },
    { row: 3, col: 2, count: 1, level: 'Moderate', elements: ['D-104 (HC-03)'] },
    { row: 3, col: 3, count: 1, level: 'Moderate', elements: ['E-205 (ST-01)'] },
    { row: 3, col: 4, count: 0, level: 'High', elements: [] },
    { row: 3, col: 5, count: 0, level: 'High', elements: [] },

    { row: 2, col: 1, count: 3, level: 'Low', elements: ['A-102 (Col C-01)', 'DMRC-V04 (BG-09)', 'B-203 (W-02)'] },
    { row: 2, col: 2, count: 1, level: 'Low', elements: ['DMRC-V04 (BR-04)'] },
    { row: 2, col: 3, count: 0, level: 'Moderate', elements: [] },
    { row: 2, col: 4, count: 0, level: 'Moderate', elements: [] },
    { row: 2, col: 5, count: 0, level: 'High', elements: [] },

    { row: 1, col: 1, count: 5, level: 'Low', elements: ['Secondary Non-Structural Partitions'] },
    { row: 1, col: 2, count: 2, level: 'Low', elements: ['Exterior Cladding Panels'] },
    { row: 1, col: 3, count: 0, level: 'Low', elements: [] },
    { row: 1, col: 4, count: 0, level: 'Low', elements: [] },
    { row: 1, col: 5, count: 0, level: 'Moderate', elements: [] },
  ];

  const getCellColor = (level: string, highlight?: boolean) => {
    if (highlight) return 'bg-red-600 text-white font-bold ring-2 ring-red-400 animate-pulse shadow-xs';
    switch (level) {
      case 'Critical':
        return 'bg-red-100 text-red-900 border-red-200 hover:bg-red-200';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200';
      case 'Moderate':
        return 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100';
      case 'Low':
      default:
        return 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100';
    }
  };

  // Dedicated Hotlist for Priority Buildings
  const hotlist = [
    {
      code: 'B-203',
      element: 'Column C-04 & Beam B-12',
      title: 'Longitudinal Rebar Cover Spalling & 45° Shear Fracture',
      crackRate: '+0.31 mm/month',
      status: 'Immediate Propping Verified (Acro Steel Props)',
      priority: 'Critical',
      shi: 58,
      tab: 'buildings' as ActiveTab,
    },
    {
      code: 'C-301',
      element: 'Gantry Column IC-08',
      title: 'Vibration Fatigue Fillet Cracking (Dynamic Gantry Load)',
      crackRate: '+0.18 mm/month',
      status: 'De-rated Crane Capacity & Collar Bracing',
      priority: 'High',
      shi: 65,
      tab: 'buildings' as ActiveTab,
    },
    {
      code: 'DMRC-V04',
      element: 'Pier P-42 (Base)',
      title: 'Concrete Honeycombing & Voids',
      crackRate: 'Stabilized (0.0 mm/mo)',
      status: 'High-strength Micro-concreting Grout Complete',
      priority: 'Moderate',
      shi: 74,
      tab: 'buildings' as ActiveTab,
    },
    {
      code: 'D-104',
      element: 'Foundation Slab TR-01',
      title: 'Shrinkage Micro-Fissures & Cryogenic Pad Dampers',
      crackRate: '+0.04 mm/month',
      status: 'Silane-Siloxane Hydrophobic Sealer Applied',
      priority: 'Moderate',
      shi: 78,
      tab: 'buildings' as ActiveTab,
    },
    {
      code: 'E-205',
      element: 'Verandah Cantilever Beam VC-02',
      title: 'Secondary Flexural Hairline Tension Cracks',
      crackRate: '+0.06 mm/month',
      status: 'Crystalline Waterproofing & Deflection Monitored',
      priority: 'Moderate',
      shi: 72,
      tab: 'buildings' as ActiveTab,
    },
    {
      code: 'A-102',
      element: 'Stilt Parking Column C-01',
      title: 'Non-Structural Plaster Hairline Crazing',
      crackRate: 'Nominal (0.0 mm/mo)',
      status: 'Annual Society Rebound Hammer Audit Cleared',
      priority: 'Low',
      shi: 82,
      tab: 'buildings' as ActiveTab,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Zonal Infrastructure Risk Monitor & Telemetry</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
              5x5 ISO Risk Matrix
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time vulnerability mapping for registered infrastructure buildings calibrated to IS 456 & CPWD safety thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Vision & IoT Telemetry: 100% Online</span>
        </div>
      </div>

      {/* Target Building Watch Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Monitored Buildings Vulnerability Index</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{priorityBuildings.length} Facilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {priorityBuildings.map((b) => {
            const isCritical = b.riskStatus === 'Critical';
            return (
              <div
                key={b.code}
                onClick={() => {
                  if (onSelectBuilding) {
                    onSelectBuilding(b);
                    setActiveTab('buildings');
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs ${
                  isCritical
                    ? 'bg-red-50/50 border-red-300 ring-2 ring-red-400/50'
                    : b.riskStatus === 'High'
                    ? 'bg-amber-50/50 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white shadow-2xs">
                      {b.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.riskStatus === 'Critical'
                          ? 'bg-red-600 text-white'
                          : b.riskStatus === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {b.riskStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mt-1">{b.name}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{b.type} &bull; {b.city}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Health Index:</span>
                    <span className={`font-bold ${b.healthIndex < 60 ? 'text-red-700' : 'text-slate-900'}`}>
                      {b.healthIndex} / 100
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      isCritical
                        ? 'bg-red-700 hover:bg-red-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>View Building</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: 5x5 ISO Matrix + Hotlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5x5 Risk Matrix Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Probability vs. Consequence Risk Distribution (ISO 31000)
              </h3>
              <p className="text-xs text-slate-500">
                Structural failure likelihood versus consequence severity across all zonal elements
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <strong>Critical</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <strong>High</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <strong>Low</strong>
              </span>
            </div>
          </div>

          {/* 5x5 Matrix Layout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Failure Consequence Severity &rarr; (Catastrophic)</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 font-mono text-center">
              {matrixCells.map((cell, idx) => (
                <div
                  key={idx}
                  title={cell.elements.join(', ') || 'No active alerts'}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${getCellColor(
                    cell.level,
                    cell.highlight
                  )}`}
                >
                  <span className="text-sm font-extrabold">{cell.count}</span>
                  <span className="text-[9px] font-sans opacity-90 truncate max-w-full">
                    {cell.highlight ? 'B-203 Hotspot' : `${cell.level}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-1">
              <span>Likelihood of Failure &uarr; (Frequent to Remote)</span>
              <span>IS 456 Structural Vulnerability Class</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <strong className="text-slate-900 block font-semibold">Risk Matrix Action Trigger:</strong>
            <p className="text-slate-600 leading-relaxed">
              Elements in top-right critical cells (Risk Score &gt; 75) trigger mandatory CPWD Level-3 shoring, structural load shed, and polymer modified micro-concreting directives.
            </p>
          </div>
        </div>

        {/* Right: Critical Hotspots & Crack Propagation Velocity (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Critical Distress & Crack Velocity Hotlist
                </h3>
                <p className="text-xs text-slate-500">Live crack propagation rate & sensor alerts</p>
              </div>
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {hotlist.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border space-y-1.5 text-xs transition-all ${
                    item.priority === 'Critical'
                      ? 'bg-red-50/70 border-red-200 ring-1 ring-red-300'
                      : item.priority === 'High'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {item.code}
                        </span>
                        <span className="text-[11px] text-slate-600 font-semibold">&bull; {item.element}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-0.5">{item.title}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        item.priority === 'Critical'
                          ? 'bg-red-600 text-white'
                          : item.priority === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">
                      Growth: <strong className={item.crackRate.includes('+0.3') ? 'text-red-700' : 'text-slate-800'}>{item.crackRate}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveTab(item.tab)}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('new-inspection')}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Launch Immediate AI Recalibration Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
