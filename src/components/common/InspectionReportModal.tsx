import React, { useRef } from 'react';
import { Inspection } from '../../types';
import { X, Printer, Download, ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

interface InspectionReportModalProps {
  inspection: Inspection;
  onClose: () => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  inspection,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Structural Forensic Inspection Audit Report</h3>
              <p className="text-xs text-slate-400 font-mono">
                Certificate ID: {inspection.inspectionCode} &bull; Generated: {new Date(inspection.createdAt || Date.now()).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div ref={reportRef} className="p-8 overflow-y-auto space-y-6 text-slate-900 print:p-0 print:m-0 font-sans">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                Government of India &bull; Ministry of Housing & Urban Affairs
              </div>
              <h1 className="text-2xl font-bold text-slate-950 mt-0.5 tracking-tight">
                Structural Health & Forensic Audit Certificate
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Issued under IS 456:2000 (Plain and Reinforced Concrete), IS 13920:2016, and CPWD Maintenance Manual Protocols
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800">
                {inspection.inspectionCode}
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Audit Date: <strong>{inspection.date}</strong>
              </div>
            </div>
          </div>

          {/* Asset & Auditor Profile Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Asset Information</div>
              <div className="font-bold text-sm text-slate-900">{inspection.buildingName}</div>
              <div><span className="text-slate-500">Asset Code:</span> <strong className="font-mono">{inspection.buildingCode}</strong></div>
              <div><span className="text-slate-500">Inspected Member:</span> <strong className="text-blue-700">{inspection.element}</strong></div>
              <div><span className="text-slate-500">Location:</span> {inspection.locationDetails || 'Main Structural Grid'}</div>
            </div>

            <div className="space-y-1.5 border-l border-slate-200 pl-4">
              <div className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Lead Structural Auditor</div>
              <div className="font-bold text-sm text-slate-900">{inspection.inspectorName}</div>
              <div><span className="text-slate-500">Designation:</span> {inspection.inspectorRole || 'Senior Structural Auditor (Grade I)'}</div>
              <div><span className="text-slate-500">Inspector Badge:</span> <strong className="font-mono">{inspection.inspectorBadge}</strong></div>
              <div><span className="text-slate-500">Audit Status:</span> <span className="font-semibold text-emerald-700">{inspection.status}</span></div>
            </div>
          </div>

          {/* Key Metric Gauges Banner */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-900 text-white rounded-xl">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Structural Health Index</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {inspection.structuralHealthIndex} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Composite SHI Rating</div>
            </div>

            <div className="p-3.5 bg-slate-900 text-white rounded-xl">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Risk Matrix Score</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {inspection.riskScore} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Level: {inspection.overallRiskLevel}</div>
            </div>

            <div className="p-3.5 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Defects Identified</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {inspection.defects?.length || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Coverage: {inspection.totalDefectCoveragePercent}%</div>
            </div>

            <div className="p-3.5 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Remediation Priority</div>
              <div className={`text-xl font-bold font-mono mt-1 ${
                inspection.overallRiskLevel === 'Critical' ? 'text-red-700' : 'text-amber-700'
              }`}>
                {inspection.overallRiskLevel === 'Critical' ? 'IMMEDIATE (48H)' : 'SCHEDULED (7D)'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Action Plan Mandated</div>
            </div>
          </div>

          {/* Photographic Evidence & Overlay */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Photographic Evidence & AI Defect Mapping
            </h4>
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-950 p-2 flex justify-center">
              <img
                src={inspection.originalImage}
                alt="Audit evidence"
                className="max-h-72 object-contain rounded"
              />
            </div>
          </div>

          {/* Itemized Defect Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Itemized Forensic Findings
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Defect Classification</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Max Width</th>
                    <th className="p-2.5">Length</th>
                    <th className="p-2.5">Code Reference</th>
                    <th className="p-2.5">Prescribed Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {inspection.defects?.map((defect, i) => (
                    <tr key={defect.id || i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-500">0{i + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{defect.type}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          defect.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                          defect.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {defect.severity}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-amber-700 font-bold">{defect.estimatedWidthMm} mm</td>
                      <td className="p-2.5 font-mono">{defect.estimatedLengthMm} mm</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{defect.standardsReference}</td>
                      <td className="p-2.5 text-[11px] text-slate-700 leading-tight">{defect.remediationProtocol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety Directives & Engineering Sign-Off */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Mandatory Safety Directives & Immediate Precautions
            </h4>
            <ul className="list-disc list-inside space-y-1 text-amber-950 leading-relaxed">
              {inspection.safetyPrecautions?.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>

          {/* Official Sign-Off Footer */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-1">
              <div className="font-mono text-slate-400">Digitally Verified</div>
              <div className="font-bold text-slate-800">{inspection.inspectorName}</div>
              <div className="text-[10px] text-slate-500">Lead Inspecting Engineer ({inspection.inspectorBadge})</div>
            </div>

            <div className="space-y-1 flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full border-2 border-emerald-600 border-dashed flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">CPWD / IS 456 CERTIFIED</div>
            </div>

            <div className="space-y-1">
              <div className="font-mono text-slate-400">Approved by</div>
              <div className="font-bold text-slate-800">Chief Superintending Engineer</div>
              <div className="text-[10px] text-slate-500">Structural Safety & Audit Directorate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
