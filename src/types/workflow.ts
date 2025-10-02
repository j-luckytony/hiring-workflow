// Workflow node types
export type NodeType = 'start' | 'action' | 'decision' | 'terminal';

// Base node interface
export interface BaseNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
  };
  parentId?: string;
  children?: string[];
  collapsed?: boolean;
}

// Start node - entry point into workflow
export interface StartNode extends BaseNode {
  type: 'start';
  data: {
    label: string;
    description?: string;
    config: {
      trigger: 'job_application' | 'referral' | 'linkedin_sourcing' | 'manual_entry';
      source: 'greenhouse' | 'lever' | 'workday' | 'bamboohr' | 'manual';
      integration?: string; // Human-readable integration name
      jobId?: string;
      department?: string;
    };
  };
}

// Action node - performs operations
export interface ActionNode extends BaseNode {
  type: 'action';
  data: {
    label: string;
    description?: string;
    config: {
      actionType: 'email_outreach' | 'schedule_interview' | 'parse_resume' | 'phone_screen' | 'collect_feedback' | 'send_offer' | 'background_check' | 'reference_check' | 'wait';
      integration?: string; // Human-readable integration name (e.g., 'Gmail API', 'Calendly + Zoom')
      // Email Outreach
      emailProvider?: 'gmail' | 'outlook' | 'sendgrid' | 'mailgun';
      fromAddress?: string;
      template?: string;
      // Scheduling
      scheduler?: 'calendly' | 'goodtime' | 'greenhouse_scheduler' | 'manual';
      interviewType?: 'phone' | 'video' | 'onsite' | 'technical';
      duration?: number; // minutes
      interviewerList?: string[]; // List of interviewer names
      // Resume Parsing
      aiProvider?: 'openai' | 'anthropic' | 'resume_parser_api';
      extractFields?: string[];
      autoScore?: boolean;
      // Phone/Communication
      phoneProvider?: 'twilio' | 'aircall' | 'ringcentral';
      // Integrations
      atsSystem?: 'greenhouse' | 'lever' | 'workday' | 'bamboohr';
      updateATS?: boolean;
      notifySlack?: boolean;
      slackChannel?: string;
    };
  };
}

// Decision node - branching logic
export interface DecisionNode extends BaseNode {
  type: 'decision';
  data: {
    label: string;
    description?: string;
    config: {
      decisionType: 'resume_score' | 'interview_score' | 'availability' | 'experience_level' | 'salary_range' | 'background_check';
      criteria: {
        field: 'score' | 'years_experience' | 'salary_expectation' | 'availability' | 'skills_match';
        operator: '>' | '<' | '=' | '>=' | '<=' | 'contains';
        value: number | string;
        label: string;
      }[];
      paths: {
        id: string;
        label: 'Accept' | 'Reject' | 'Manual Review' | 'Next Round';
        condition: string;
      }[];
    };
  };
}

// Terminal node - end states
export interface TerminalNode extends BaseNode {
  type: 'terminal';
  data: {
    label: string;
    description?: string;
    config: {
      outcome: 'hired' | 'rejected' | 'offer_extended' | 'withdrawn' | 'on_hold' | 'archived';
      integration?: string; // Human-readable integration name
      // Notifications
      emailProvider?: 'gmail' | 'outlook' | 'sendgrid';
      template?: string;
      notifyCandidate?: boolean;
      notifyHiringManager?: boolean;
      // Integrations
      updateATS?: boolean;
      atsSystem?: 'greenhouse' | 'lever' | 'workday' | 'bamboohr';
      slackNotification?: boolean;
      slackChannel?: string;
      // Documentation
      generateReport?: boolean;
      documentStorage?: 'google_drive' | 'sharepoint' | 'dropbox';
    };
  };
}

// Union type for all nodes
export type WorkflowNode = StartNode | ActionNode | DecisionNode | TerminalNode;

// Edge interface
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'smoothstep' | 'step' | 'straight';
  animated?: boolean;
  style?: Record<string, any>;
}

// Complete workflow interface
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// Node configuration schemas for different action types
export interface NodeConfigSchema {
  parse_resume: {
    requiredFields: string[];
    aiProvider: string;
    extractionRules: string[];
  };
  ai_interview: {
    questionSets: string[];
    format: 'text' | 'video' | 'multiple_choice';
    scoringThreshold: number;
    deadline: number;
  };
  send_email: {
    template: string;
    waitTime: number;
    retryLimit: number;
    stopConditions: string[];
  };
  schedule_interview: {
    duration: number;
    type: 'recruiter' | 'technical' | 'culture' | 'manager';
    interviewerList: string[];
    calendarIntegration: boolean;
    reminders: boolean;
  };
  collect_feedback: {
    template: string;
    deadline: number;
    reminderChannels: ('email' | 'slack')[];
    scoringCriteria: string[];
  };
}

// Subtree operations
export interface SubtreeOperation {
  type: 'collapse' | 'expand' | 'copy' | 'delete';
  nodeId: string;
  targetPosition?: { x: number; y: number };
}

// Workflow state
export interface WorkflowState {
  workflow: Workflow;
  selectedNodeId?: string;
  editMode: boolean;
  draggedNodeId?: string;
  dragOffset?: { x: number; y: number };
  viewMode: 'canvas' | 'details';
  configPanelOpen: boolean;
}
