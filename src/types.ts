export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type RiskLevel = 'Unassessed' | 'Low' | 'Moderate' | 'High' | 'Critical';
export type InspectionStatus = 'Pending' | 'Completed' | 'Under Remediation' | 'Verified';

export type BuildingType =
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Hospital'
  | 'School'
  | 'Government'
  | 'Other';

export interface Defect {
  id: string;
  userId?: string;
  inspectionId?: string;
  buildingId?: string;
  type: string;
  confidence: number;
  severity: SeverityLevel;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  estimatedLengthMm: number;
  estimatedWidthMm: number;
  coveragePercent: number;
  technicalDescription: string;
  standardsReference: string;
  remediationProtocol: string;
  createdAt?: string;
}

export interface Inspection {
  id: string;
  userId?: string;
  inspectionCode: string;
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  element: string; // e.g. "Column C-04", "Beam B-12", "Shear Wall W-02"
  locationDetails: string;
  inspectorName: string;
  inspectorBadge: string;
  inspectorRole?: string;
  date: string;
  status: InspectionStatus;
  structuralHealthIndex: number; // 0-100
  riskScore: number; // 0-100
  overallRiskLevel: RiskLevel;
  totalDefectCoveragePercent: number;
  diagnosisSummary: string;
  safetyPrecautions: string[];
  defects: Defect[];
  originalImage: string;
  notes: string;
  createdAt: string;
}

export interface BuildingKeyElement {
  code: string;
  name: string;
  type: 'Column' | 'Beam' | 'Slab' | 'Pier' | 'Shear Wall' | 'Abutment' | 'Foundation' | 'Other';
  condition: RiskLevel;
  lastInspected?: string;
}

export interface BuildingContactOfficer {
  name: string;
  title: string;
  phone: string;
  agency: string;
}

export interface Building {
  id: string;
  userId?: string;
  code: string;
  name: string;
  type: string; // "Residential", "Commercial", "Industrial", "Hospital", "School", "Government", "Other" or custom
  customType?: string;
  address?: string;
  locality?: string;
  city: string;
  state: string;
  yearBuilt: number;
  totalFloorsOrSpans: string;
  buildingUse?: string; // e.g. "Multi-Family Residential Housing", "Critical Care & ICU", etc.
  ownerName?: string; // e.g. "East Delhi Municipal Corp (EDMC)", "Private Housing Society", etc.
  structuralSystem: string; // e.g. "RC Framed Structure with Post-Tensioned Slabs"
  totalInspections: number;
  healthIndex: number; // 0-100 (100 for unassessed)
  riskStatus: RiskLevel;
  criticalDefectsCount: number;
  activeRemediations: number;
  thumbnail: string;
  contactOfficer: BuildingContactOfficer;
  keyElements: BuildingKeyElement[];
  createdAt?: string;
}

export interface TelemetryRecord {
  id: string;
  userId?: string;
  buildingId: string;
  sensorId: string;
  elementCode: string;
  metricType: string;
  readingValue: number;
  unit: string;
  thresholdWarning: number;
  thresholdCritical: number;
  status: 'Normal' | 'Warning' | 'Critical';
  recordedAt: string;
  createdAt?: string;
}

export interface GeneratedForensicReport {
  id: string;
  userId?: string;
  inspectionId: string;
  buildingId: string;
  reportNumber: string;
  title: string;
  auditStandard: string;
  provider: string; // "Gemini 3.7 Flash" or "Deterministic Civil Heuristics Engine"
  isFallback: boolean;
  generatedAt: string;

  // Explicit Required Report Sections
  buildingInformation: {
    name: string;
    code: string;
    type: string;
    location: string;
    yearBuilt: number;
    structuralSystem: string;
    totalFloorsOrSpans: string;
    ownerOrAgency: string;
  };
  inspectionSummary: {
    inspectionCode: string;
    auditDate: string;
    auditorName: string;
    auditorBadge: string;
    inspectedElement: string;
    locationDetails: string;
    structuralHealthIndex: number;
    riskScore: number;
    overallRiskLevel: RiskLevel;
  };
  detectedDefectsSummary: {
    totalCount: number;
    coveragePercent: number;
    defectsList: Array<{
      type: string;
      severity: SeverityLevel;
      confidence: number;
      estimatedLengthMm: number;
      estimatedWidthMm: number;
      coveragePercent: number;
      technicalDescription: string;
      standardsReference: string;
      remediationProtocol: string;
    }>;
  };
  aiAssessment: string;
  structuralRisk: {
    riskRating: RiskLevel;
    healthIndex: number;
    riskScore: number;
    loadBearingCapacityImpact: string;
    serviceabilityStatus: string;
    riskEvaluationNarrative: string;
  };
  sensorObservations: {
    activeSensorsCount: number;
    observationsNarrative: string;
    readings: Array<{
      sensorId: string;
      metricType: string;
      readingValue: number;
      unit: string;
      status: 'Normal' | 'Warning' | 'Critical';
      elementCode: string;
    }>;
  };
  recommendedActions: {
    immediateActions: string[]; // 24-48 hours
    shortTermActions: string[]; // 7-14 days
    longTermMonitoring: string[]; // 30-90 days
  };
  priority: string; // "CRITICAL / IMMEDIATE (24-48 Hours)" | "HIGH / SCHEDULED (7-14 Days)" | "MODERATE / ROUTINE (30-90 Days)" | "LOW / ANNUAL (Routine)"
  disclaimer: string;
  rawMarkdown?: string;
}

export interface AuditReport {
  id: string;
  userId?: string;
  inspectionId?: string;
  buildingId: string;
  reportNumber: string;
  title: string;
  auditStandard: string;
  status: 'Draft' | 'Under Review' | 'Certified' | 'Remediation Mandated';
  certifiedBy: string;
  certificateHash?: string;
  summary: string;
  reportData?: GeneratedForensicReport;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organization: string;
  badgeNumber: string;
  confirmedAt?: string;
  lastSignInAt?: string;
}

export type ActiveTab = 'overview' | 'new-inspection' | 'buildings' | 'b-203' | 'risk-monitor' | 'reports';

export interface SampleStructuralImage {
  id: string;
  title: string;
  category: string;
  element: string;
  description: string;
  url: string;
  defaultBuildingCode: string;
}
