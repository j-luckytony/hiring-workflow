import React from 'react';
import { 
  Settings, 
  Clock, 
  FileText, 
  Users, 
  GitBranch, 
  Square, 
  Calendar,
  Link,
  Mail,
  Phone,
  Bot,
  Briefcase
} from 'lucide-react';
import { ConfigField } from './ConfigField';
import type { WorkflowNode } from '../../../types/workflow';

interface NodeConfigSectionsProps {
  node: WorkflowNode;
  editMode: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export const NodeConfigSections: React.FC<NodeConfigSectionsProps> = ({
  node,
  editMode,
  onFieldChange
}) => {
  const config = node.data.config as any;

  const renderStartConfig = () => {
    const startIntegrationOptions = [
      { label: 'Greenhouse Webhook', value: 'Greenhouse Webhook' },
      { label: 'Lever Webhook', value: 'Lever Webhook' },
      { label: 'Workday Webhook', value: 'Workday Webhook' },
      { label: 'Manual Entry', value: 'Manual Entry' },
      { label: 'Referral Form', value: 'Referral Form' },
      { label: 'LinkedIn Jobs', value: 'LinkedIn Jobs' },
    ];
    if (config?.integration && !startIntegrationOptions.some(o => o.value === config.integration)) {
      startIntegrationOptions.unshift({ label: config.integration, value: config.integration });
    }

    return (
      <div className="space-y-4">
        {/* Integration - Most Important */}
        {config?.integration && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <ConfigField 
              label="🔗 Integration" 
              value={config.integration} 
              icon={<Link className="w-4 h-4" />}
              editable={editMode}
              type="select"
              options={startIntegrationOptions}
              onChange={(value) => onFieldChange('data.config.integration', value)}
            />
          </div>
        )}
        
        {/* Trigger */}
        <ConfigField 
          label="⚙️ Trigger" 
          value={config?.trigger || 'manual_entry'} 
          icon={<Settings className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Job Application', value: 'job_application' },
            { label: 'Referral', value: 'referral' },
            { label: 'LinkedIn Sourcing', value: 'linkedin_sourcing' },
            { label: 'Manual Entry', value: 'manual_entry' },
          ]}
          onChange={(value) => onFieldChange('data.config.trigger', value)}
        />

        <ConfigField 
          label="Job Position" 
          value={config?.jobId || 'Not specified'} 
          icon={<Briefcase className="w-4 h-4" />}
          editable={editMode}
          onChange={(value) => onFieldChange('data.config.jobId', value)}
        />
        
        <ConfigField 
          label="Source System" 
          value={config?.source || 'manual'} 
          icon={<FileText className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Greenhouse', value: 'greenhouse' },
            { label: 'Lever', value: 'lever' },
            { label: 'Workday', value: 'workday' },
            { label: 'BambooHR', value: 'bamboohr' },
            { label: 'Manual', value: 'manual' },
          ]}
          onChange={(value) => onFieldChange('data.config.source', value)}
        />
      </div>
    );
  };

  const renderActionConfig = () => {
    // Options based on actionType
    const map: Record<string, { label: string; value: string }[]> = {
      email_outreach: [
        { label: 'Gmail API', value: 'Gmail API' },
        { label: 'Outlook API', value: 'Outlook API' },
        { label: 'SendGrid API', value: 'SendGrid API' },
        { label: 'Mailgun API', value: 'Mailgun API' },
      ],
      schedule_interview: [
        { label: 'Calendly API', value: 'Calendly API' },
        { label: 'GoodTime API', value: 'GoodTime API' },
        { label: 'Greenhouse Scheduler', value: 'Greenhouse Scheduler' },
      ],
      parse_resume: [
        { label: 'OpenAI GPT-4', value: 'OpenAI GPT-4' },
        { label: 'Anthropic Claude', value: 'Anthropic Claude' },
        { label: 'Resume Parser API', value: 'Resume Parser API' },
      ],
      phone_screen: [
        { label: 'Twilio Voice API', value: 'Twilio Voice API' },
        { label: 'Aircall API', value: 'Aircall API' },
        { label: 'RingCentral API', value: 'RingCentral API' },
      ],
      collect_feedback: [
        { label: 'Google Forms API', value: 'Google Forms API' },
        { label: 'Typeform API', value: 'Typeform API' },
      ],
      send_offer: [
        { label: 'DocuSign API', value: 'DocuSign API' },
        { label: 'HelloSign API', value: 'HelloSign API' },
        { label: 'Adobe Sign API', value: 'Adobe Sign API' },
      ],
      background_check: [
        { label: 'Checkr API', value: 'Checkr API' },
        { label: 'Onfido API', value: 'Onfido API' },
      ],
      reference_check: [
        { label: 'RefNow API', value: 'RefNow API' },
        { label: 'Checkr API', value: 'Checkr API' },
      ],
      wait: [
        { label: 'Zapier Delay', value: 'Zapier Delay' },
        { label: 'n8n Wait', value: 'n8n Wait' },
        { label: 'Temporal Wait', value: 'Temporal Wait' },
        { label: 'AWS Step Functions Wait', value: 'AWS Step Functions Wait' },
      ]
    };
    const actionType = config?.actionType as string | undefined;
    let actionIntegrationOptions = actionType ? (map[actionType] || []) : [];
    if (config?.integration && !actionIntegrationOptions.some(o => o.value === config.integration)) {
      actionIntegrationOptions.unshift({ label: config.integration, value: config.integration });
    }

    return (
      <div className="space-y-4">
        {/* Integration - Most Important */}
        {config?.integration && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <ConfigField 
              label="🔗 Integration" 
              value={config.integration} 
              icon={<Link className="w-4 h-4" />}
              editable={editMode}
              type="select"
              options={actionIntegrationOptions}
              onChange={(value) => onFieldChange('data.config.integration', value)}
            />
          </div>
        )}

        {/* Action Type */}
        {config?.actionType && (
          <ConfigField 
            label="🧩 Action Type" 
            value={config.actionType} 
            icon={<Settings className="w-4 h-4" />}
            editable={editMode}
            type="select"
            options={[
              { label: 'Email Outreach', value: 'email_outreach' },
              { label: 'Schedule Interview', value: 'schedule_interview' },
              { label: 'Parse Resume', value: 'parse_resume' },
              { label: 'Phone Screen', value: 'phone_screen' },
              { label: 'Collect Feedback', value: 'collect_feedback' },
              { label: 'Send Offer', value: 'send_offer' },
              { label: 'Background Check', value: 'background_check' },
              { label: 'Reference Check', value: 'reference_check' },
              { label: 'Wait', value: 'wait' },
            ]}
            onChange={(value) => onFieldChange('data.config.actionType', value)}
          />
        )}
      
      {/* Email Provider */}
      {config?.emailProvider && (
        <ConfigField 
          label="📧 Email Service" 
          value={config.emailProvider} 
          icon={<Mail className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Gmail', value: 'gmail' },
            { label: 'Outlook', value: 'outlook' },
            { label: 'SendGrid', value: 'sendgrid' },
            { label: 'Mailgun', value: 'mailgun' },
          ]}
          onChange={(value) => onFieldChange('data.config.emailProvider', value)}
        />
      )}
      
      {/* Phone Provider */}
      {config?.phoneProvider && (
        <ConfigField 
          label="📞 Phone Service" 
          value={config.phoneProvider} 
          icon={<Phone className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Twilio', value: 'twilio' },
            { label: 'Aircall', value: 'aircall' },
            { label: 'RingCentral', value: 'ringcentral' },
          ]}
          onChange={(value) => onFieldChange('data.config.phoneProvider', value)}
        />
      )}
      
      {/* AI Provider */}
      {config?.aiProvider && (
        <ConfigField 
          label="🤖 AI Service" 
          value={config.aiProvider} 
          icon={<Bot className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'OpenAI', value: 'openai' },
            { label: 'Anthropic', value: 'anthropic' },
            { label: 'Resume Parser API', value: 'resume_parser_api' },
          ]}
          onChange={(value) => onFieldChange('data.config.aiProvider', value)}
        />
      )}
      
      {/* Scheduler */}
      {config?.scheduler && (
        <ConfigField 
          label="📅 Scheduling Tool" 
          value={config.scheduler} 
          icon={<Calendar className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Calendly', value: 'calendly' },
            { label: 'GoodTime', value: 'goodtime' },
            { label: 'Greenhouse Scheduler', value: 'greenhouse_scheduler' },
            { label: 'Manual', value: 'manual' },
          ]}
          onChange={(value) => onFieldChange('data.config.scheduler', value)}
        />
      )}

      {/* Interview Type */}
      {config?.interviewType && (
        <ConfigField 
          label="🎤 Interview Type" 
          value={config.interviewType} 
          icon={<Users className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Phone', value: 'phone' },
            { label: 'Video', value: 'video' },
            { label: 'Onsite', value: 'onsite' },
            { label: 'Technical', value: 'technical' },
          ]}
          onChange={(value) => onFieldChange('data.config.interviewType', value)}
        />
      )}
      
      {/* Duration for interviews/calls */}
      {config?.duration && (
        <ConfigField 
          label="⏱️ Duration" 
          value={`${config.duration} minutes`} 
          icon={<Clock className="w-4 h-4" />}
          editable={editMode}
          onChange={(value) => onFieldChange('data.config.duration', parseInt(value))}
        />
      )}
      
      {/* Template/Message */}
      {config?.template && (
        <ConfigField 
          label="💬 Message Template" 
          value={config.template} 
          icon={<FileText className="w-4 h-4" />}
          editable={editMode}
          onChange={(value) => onFieldChange('data.config.template', value)}
        />
      )}
      
      {/* Interviewers */}
      {config?.interviewerList && config.interviewerList.length > 0 && (
        <ConfigField 
          label="👥 Interviewers" 
          value={config.interviewerList} 
          type="array"
          icon={<Users className="w-4 h-4" />}
          editable={editMode}
          onChange={(value) => onFieldChange('data.config.interviewerList', value)}
        />
      )}
    </div>
  );
  };

  const renderDecisionConfig = () => (
    <div className="space-y-4">
      <ConfigField 
        label="🎯 Decision Type" 
        value={config?.decisionType || 'Not specified'} 
        icon={<GitBranch className="w-4 h-4" />}
        editable={editMode}
        type="select"
        options={[
          { label: 'Resume Score', value: 'resume_score' },
          { label: 'Interview Score', value: 'interview_score' },
          { label: 'Availability', value: 'availability' },
          { label: 'Experience Level', value: 'experience_level' },
          { label: 'Salary Range', value: 'salary_range' },
          { label: 'Background Check', value: 'background_check' },
        ]}
        onChange={(value) => onFieldChange('data.config.decisionType', value)}
      />
      
      {config?.criteria && config.criteria.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">📋 Evaluation Criteria</h4>
          {config.criteria.map((criterion: any, index: number) => (
            <div key={index} className="text-sm text-gray-700 mb-1">
              • {criterion.label || `${criterion.field} ${criterion.operator} ${criterion.value}`}
            </div>
          ))}
        </div>
      )}
      
      {config?.paths && config.paths.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">🛤️ Decision Paths</h4>
          {config.paths.map((path: any, index: number) => (
            <div key={index} className="text-sm text-gray-700 mb-1">
              • <strong>{path.label}</strong>: {path.condition}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTerminalConfig = () => {
    const terminalIntegrationOptions = [
      { label: 'Gmail API', value: 'Gmail API' },
      { label: 'SendGrid API', value: 'SendGrid API' },
      { label: 'Slack API', value: 'Slack API' },
      { label: 'Greenhouse API', value: 'Greenhouse API' },
      { label: 'Lever API', value: 'Lever API' },
      { label: 'BambooHR API', value: 'BambooHR API' },
    ];
    if (config?.integration && !terminalIntegrationOptions.some(o => o.value === config.integration)) {
      terminalIntegrationOptions.unshift({ label: config.integration, value: config.integration });
    }

    return (
      <div className="space-y-4">
        <ConfigField 
          label="🎯 Final Outcome" 
          value={config?.outcome || 'Not specified'} 
          icon={<Square className="w-4 h-4" />}
          editable={editMode}
          type="select"
          options={[
            { label: 'Hired', value: 'hired' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Offer Extended', value: 'offer_extended' },
            { label: 'Withdrawn', value: 'withdrawn' },
            { label: 'On Hold', value: 'on_hold' },
            { label: 'Archived', value: 'archived' },
          ]}
          onChange={(value) => onFieldChange('data.config.outcome', value)}
        />
        
        {/* Integration - Most Important */}
        {config?.integration && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <ConfigField 
              label="🔗 Integration" 
              value={config.integration} 
              icon={<Link className="w-4 h-4" />}
              editable={editMode}
              type="select"
              options={terminalIntegrationOptions}
              onChange={(value) => onFieldChange('data.config.integration', value)}
            />
          </div>
        )}
        
        {/* Email Provider */}
        {config?.emailProvider && (
          <ConfigField 
            label="📧 Email Service" 
            value={config.emailProvider} 
            icon={<Mail className="w-4 h-4" />}
            editable={editMode}
            onChange={(value) => onFieldChange('data.config.emailProvider', value)}
          />
        )}
        
        {/* Template/Message */}
        {config?.template && (
          <ConfigField 
            label="💬 Message Template" 
            value={config.template} 
            icon={<FileText className="w-4 h-4" />}
            editable={editMode}
            onChange={(value) => onFieldChange('data.config.template', value)}
          />
        )}
        
        {/* ATS System */}
        {config?.atsSystem && (
          <ConfigField 
            label="💼 ATS System" 
            value={config.atsSystem} 
            icon={<Briefcase className="w-4 h-4" />}
            editable={editMode}
            type="select"
            options={[
              { label: 'Greenhouse', value: 'greenhouse' },
              { label: 'Lever', value: 'lever' },
              { label: 'Workday', value: 'workday' },
              { label: 'BambooHR', value: 'bamboohr' },
            ]}
            onChange={(value) => onFieldChange('data.config.atsSystem', value)}
          />
        )}

        {/* Slack Notifications */}
        {config?.slackChannel && (
          <ConfigField 
            label="💬 Slack Channel" 
            value={config.slackChannel} 
            icon={<Settings className="w-4 h-4" />}
            editable={editMode}
            onChange={(value) => onFieldChange('data.config.slackChannel', value)}
          />
        )}
      </div>
    );
  };

  switch (node.type) {
    case 'start':
      return renderStartConfig();
    case 'action':
      return renderActionConfig();
    case 'decision':
      return renderDecisionConfig();
    case 'terminal':
      return renderTerminalConfig();
    default:
      return null;
  }
};
