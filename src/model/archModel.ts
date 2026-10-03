/**
 * ArchModel definition and interfaces for BuildArch.
 * This is the single source of truth for deterministic architecture facts
 * and optional AI enrichment data.
 */

export interface ArchEvidence {
  file: string;
  line?: number;
  snippet?: string;
}

export type ArchConfidence = 'Extracted' | 'Inferred' | 'AI-generated';

export interface WorkspaceInfo {
  name: string;
  folders: string[];
  generatedAt: string;
  toolVersion: string;
  mode: 'No AI (rule-based)' | 'AI-assisted';
  stats: {
    totalFiles: number;
    totalLoc: number;
    analyzedFiles: number;
    skippedFiles: number;
    projectCount: number;
    componentCount: number;
    interfaceCount: number;
    dataStoreCount: number;
    workflowCount: number;
    riskCount: number;
  };
}

export interface ArchProject {
  id: string;
  name: string;
  type: 'mobile' | 'web-frontend' | 'backend-api' | 'library' | 'cli' | 'worker' | 'infra' | 'database' | 'test' | 'docs' | 'unknown';
  languages: string[];
  frameworks: string[];
  rootPath: string;
  entryPoints: { name: string; file: string; line?: number }[];
  loc: number;
  fileCount: number;
}

export interface ArchComponent {
  id: string;
  name: string;
  type: string; // screen, controller, service, repository, module, etc.
  projectId: string;
  layer: 'presentation' | 'application' | 'domain' | 'data' | 'infrastructure' | 'cross-cutting';
  paths: string[];
  publicSymbols: string[];
  loc: number;
  fanIn: number;
  fanOut: number;
  hasTests: boolean;
  isKey: boolean;
  description?: string;
  confidence: ArchConfidence;
  evidence: ArchEvidence[];
  language?: string;
}

export type RelationshipKind = 'import' | 'http' | 'grpc' | 'event' | 'db' | 'config' | 'deploy' | 'native-dll' | 'process-call' | 'shared-contract';

export interface ArchRelationship {
  id: string;
  fromId: string;
  toId: string;
  kind: RelationshipKind;
  label: string;
  evidence: ArchEvidence[];
  confidence: ArchConfidence;
}

export interface ArchInterface {
  id: string;
  projectId: string;
  kind: 'rest' | 'graphql' | 'grpc' | 'cli' | 'event' | 'custom';
  method?: string; // GET, POST, etc.
  path: string; // /api/v1/orders, command name, event topic
  handler: string;
  file: string;
  line?: number;
}

export interface ArchDataStore {
  id: string;
  name: string;
  kind: 'relational' | 'document' | 'cache' | 'vector' | 'key-value' | 'embedded' | 'local-storage';
  technology: string; // PostgreSQL, EF DbContext, FireDAC, SQLite, Redis, etc.
  usedBy: string[]; // component IDs
  models: string[]; // entity/model names
  evidence: ArchEvidence[];
}

export interface ArchIntegration {
  id: string;
  name: string;
  category: 'auth' | 'payment' | 'maps' | 'analytics' | 'ai-llm' | 'cloud-sdk' | 'messaging' | 'third-party-api';
  usedBy: string[];
  evidence: ArchEvidence[];
}

export interface WorkflowStep {
  stepNumber: number;
  componentId: string;
  action: string;
  evidence?: ArchEvidence;
}

export interface ArchWorkflow {
  id: string;
  name: string;
  trigger: string; // e.g., POST /orders, OnClick = SubmitOrder, main()
  steps: WorkflowStep[];
  touches: string[]; // component IDs
  narrative?: string; // AI enriched narrative or default note
  confidence: ArchConfidence;
}

export interface DeploymentArtifact {
  name: string;
  type: 'docker' | 'k8s' | 'helm' | 'terraform' | 'bicep' | 'ci-pipeline' | 'script';
  path: string;
  details: string;
}

export interface ArchDeployment {
  artifacts: DeploymentArtifact[];
  environments: string[];
  pipelines: string[];
  topology: string[];
}

export interface ArchCrossCutting {
  auth: string[];
  logging: string[];
  errorHandling: string[];
  config: string[];
  testing: string[];
  observability: string[];
}

export interface ArchRisk {
  id: string;
  severity: 'high' | 'medium' | 'low';
  category: 'cycle' | 'god-component' | 'untested' | 'secret-exposure' | 'dead-code' | 'high-coupling' | 'legacy';
  title: string;
  description: string;
  affectedComponents: string[];
  evidence: ArchEvidence[];
}

export interface ArchQuality {
  cycles: string[][]; // component ID chains
  hotspots: { componentId: string; reason: string }[];
  untested: string[]; // component IDs
  risks: ArchRisk[];
  metrics: {
    averageLocPerComponent: number;
    maxFanInComponent?: string;
    maxFanOutComponent?: string;
    testCoverageRatio: number;
  };
}

export interface ArchDependency {
  name: string;
  version?: string;
  scope?: string;
  project: string;
}

export interface ArchTechStack {
  languages: { name: string; fileCount: number; loc: number }[];
  frameworks: string[];
  dependencies: ArchDependency[];
}

export interface DetectedFileStats {
  extension: string;
  languageId: string;
  count: number;
  loc: number;
  analyzed: boolean;
}

export interface ArchModel {
  schemaVersion: string;
  workspace: WorkspaceInfo;
  projects: ArchProject[];
  components: ArchComponent[];
  relationships: ArchRelationship[];
  interfaces: ArchInterface[];
  dataStores: ArchDataStore[];
  integrations: ArchIntegration[];
  workflows: ArchWorkflow[];
  deployment: ArchDeployment;
  crossCutting: ArchCrossCutting;
  quality: ArchQuality;
  techStack: ArchTechStack;
  unsupportedFiles: DetectedFileStats[];
}

export function createEmptyArchModel(workspaceName: string, mode: 'No AI (rule-based)' | 'AI-assisted' = 'No AI (rule-based)'): ArchModel {
  return {
    schemaVersion: '1.0.0',
    workspace: {
      name: workspaceName,
      folders: [],
      generatedAt: new Date().toISOString(),
      toolVersion: '0.1.0',
      mode,
      stats: {
        totalFiles: 0,
        totalLoc: 0,
        analyzedFiles: 0,
        skippedFiles: 0,
        projectCount: 0,
        componentCount: 0,
        interfaceCount: 0,
        dataStoreCount: 0,
        workflowCount: 0,
        riskCount: 0,
      },
    },
    projects: [],
    components: [],
    relationships: [],
    interfaces: [],
    dataStores: [],
    integrations: [],
    workflows: [],
    deployment: {
      artifacts: [],
      environments: [],
      pipelines: [],
      topology: [],
    },
    crossCutting: {
      auth: [],
      logging: [],
      errorHandling: [],
      config: [],
      testing: [],
      observability: [],
    },
    quality: {
      cycles: [],
      hotspots: [],
      untested: [],
      risks: [],
      metrics: {
        averageLocPerComponent: 0,
        testCoverageRatio: 0,
      },
    },
    techStack: {
      languages: [],
      frameworks: [],
      dependencies: [],
    },
    unsupportedFiles: [],
  };
}
