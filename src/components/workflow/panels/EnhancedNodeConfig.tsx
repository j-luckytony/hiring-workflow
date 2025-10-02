import React, { useState } from 'react';
import { 
  Settings, Clock, FileText, Users, GitBranch, Square, Link, Mail, Phone, Bot, Briefcase,
  Plus, Trash2, Check
} from 'lucide-react';
import type { WorkflowNode } from '../../../types/workflow';

interface EnhancedNodeConfigProps {
  node: WorkflowNode;
  editMode: boolean;
  onFieldChange: (field: string, value: any) => void;
}

export const EnhancedNodeConfig: React.FC<EnhancedNodeConfigProps> = ({
  node,
  editMode,
  onFieldChange
}) => {
  const config = node.data.config as any;

  // Smart node naming helper
  const suggestNodeName = (nodeType: string, configKey: string, value: string): string | null => {
    if (nodeType === 'terminal') {
      const outcomeLabels: Record<string, string> = {
        'hired': '🎉 Hired',
        'rejected': '❌ Rejected',
        'offer_extended': '📬 Offer Extended',
        'withdrawn': '🚫 Withdrawn',
        'on_hold': '⏸️ On Hold',
        'archived': '📁 Archived',
      };
      if (configKey === 'outcome') {
        return outcomeLabels[value] || value;
      }
    }
    
    if (nodeType === 'action') {
      const actionLabels: Record<string, string> = {
        'email_outreach': '📧 Email Outreach',
        'schedule_interview': '📅 Schedule Interview',
        'parse_resume': '🤖 AI Resume Parser',
        'phone_screen': '📞 Phone Screen',
        'collect_feedback': '📝 Collect Feedback',
        'send_offer': '✍️ Send Offer Letter',
        'background_check': '🔍 Background Check',
        'reference_check': '📋 Reference Check',
        'wait': '⏰ Wait Period',
      };
      if (configKey === 'actionType') {
        return actionLabels[value] || value;
      }
    }
    
    if (nodeType === 'decision') {
      const decisionLabels: Record<string, string> = {
        'resume_score': '📄 Resume Review',
        'interview_score': '🎯 Interview Evaluation',
        'availability': '📅 Availability Check',
        'experience_level': '💼 Experience Check',
        'salary_range': '💰 Salary Review',
        'background_check': '✅ Background Check',
      };
      if (configKey === 'decisionType') {
        return decisionLabels[value] || value;
      }
    }
    
    return null;
  };

  const handleSmartFieldChange = (field: string, value: any) => {
    onFieldChange(field, value);
    
    // Auto-update node name when key fields change
    const fieldParts = field.split('.');
    const configKey = fieldParts[fieldParts.length - 1];
    
    if (['outcome', 'actionType', 'decisionType'].includes(configKey)) {
      const suggestedName = suggestNodeName(node.type, configKey, value);
      if (suggestedName) {
        // Auto-update the node label
        onFieldChange('data.label', suggestedName);
      }
    }

    // Auto-update decision criteria and paths when decision type changes
    if (configKey === 'decisionType' && node.type === 'decision') {
      const templates = getDecisionTemplate(value);
      if (templates) {
        onFieldChange('data.config.criteria', templates.criteria);
        onFieldChange('data.config.paths', templates.paths);
      }
    }
  };

  // Decision templates based on decision type
  const getDecisionTemplate = (decisionType: string) => {
    const templates: Record<string, { criteria: any[], paths: any[] }> = {
      resume_score: {
        criteria: [
          { field: 'resume_score', operator: '>=', value: 3, label: 'Resume quality score of 3 or higher (out of 5)' }
        ],
        paths: [
          { id: 'reject', label: 'Reject', condition: 'Score below 3/5' },
          { id: 'advance', label: 'Next Round', condition: 'Score 3/5 or higher' }
        ]
      },
      interview_score: {
        criteria: [
          { field: 'interview_score', operator: '>=', value: 4, label: 'Interview performance score of 4 or higher (out of 5)' }
        ],
        paths: [
          { id: 'reject', label: 'Reject', condition: 'Score below 4/5' },
          { id: 'advance', label: 'Next Round', condition: 'Score 4/5 or higher' }
        ]
      },
      experience_level: {
        criteria: [
          { field: 'years_experience', operator: '>=', value: 3, label: 'Minimum 3 years of relevant experience' }
        ],
        paths: [
          { id: 'reject', label: 'Reject', condition: 'Less than 3 years experience' },
          { id: 'advance', label: 'Advance', condition: '3+ years experience' }
        ]
      },
      salary_range: {
        criteria: [
          { field: 'salary_expectation', operator: '<=', value: 120000, label: 'Salary expectation within budget ($120k)' }
        ],
        paths: [
          { id: 'reject', label: 'Reject', condition: 'Salary too high (over $120k)' },
          { id: 'negotiate', label: 'Negotiate', condition: 'Salary within range' },
          { id: 'advance', label: 'Advance', condition: 'Salary below budget' }
        ]
      },
      availability: {
        criteria: [
          { field: 'available_within', operator: '<=', value: 30, label: 'Can start within 30 days' }
        ],
        paths: [
          { id: 'hold', label: 'On Hold', condition: 'Not available for 30+ days' },
          { id: 'advance', label: 'Advance', condition: 'Available within 30 days' }
        ]
      },
      background_check: {
        criteria: [
          { field: 'background_check_status', operator: '==', value: 'clear', label: 'Background check came back clear' }
        ],
        paths: [
          { id: 'reject', label: 'Reject', condition: 'Issues found in background check' },
          { id: 'advance', label: 'Advance to Offer', condition: 'Background check clear' }
        ]
      }
    };

    return templates[decisionType] || null;
  };

  // Dynamic integration options based on action type
  const getIntegrationOptions = (nodeType: string, actionType?: string) => {
    if (nodeType === 'start') {
      return [
        { label: '🏢 Greenhouse (ATS)', value: 'Greenhouse Webhook' },
        { label: '🏢 Lever (ATS)', value: 'Lever Webhook' },
        { label: '🏢 Workday (ATS)', value: 'Workday Webhook' },
        { label: '✍️ Manual Entry', value: 'Manual Entry' },
        { label: '👥 Referral Form', value: 'Referral Form' },
        { label: '💼 LinkedIn Jobs', value: 'LinkedIn Jobs' },
      ];
    }

    if (nodeType === 'action') {
      const integrationMap: Record<string, any[]> = {
        email_outreach: [
          { label: '📧 Gmail', value: 'Gmail API' },
          { label: '📧 Outlook', value: 'Outlook API' },
          { label: '📧 SendGrid', value: 'SendGrid API' },
        ],
        schedule_interview: [
          { label: '📅 Calendly', value: 'Calendly API' },
          { label: '📅 GoodTime', value: 'GoodTime API' },
          { label: '📅 Greenhouse Scheduler', value: 'Greenhouse Scheduler' },
        ],
        parse_resume: [
          { label: '🤖 ChatGPT', value: 'OpenAI GPT-4' },
          { label: '🤖 Claude AI', value: 'Anthropic Claude' },
        ],
        phone_screen: [
          { label: '📞 Twilio', value: 'Twilio Voice API' },
          { label: '📞 Aircall', value: 'Aircall API' },
        ],
        collect_feedback: [
          { label: '📝 Google Forms', value: 'Google Forms API' },
          { label: '📝 Typeform', value: 'Typeform API' },
        ],
        send_offer: [
          { label: '✍️ DocuSign', value: 'DocuSign API' },
          { label: '✍️ HelloSign', value: 'HelloSign API' },
        ],
        background_check: [
          { label: '🔍 Checkr', value: 'Checkr API' },
          { label: '🔍 Onfido', value: 'Onfido API' },
        ],
        wait: [
          { label: '⏰ Automatic Delay', value: 'Zapier Delay' },
          { label: '⏰ Workflow Timer', value: 'Temporal Wait' },
        ]
      };
      return integrationMap[actionType || ''] || [];
    }

    if (nodeType === 'terminal') {
      return [
        { label: '📧 Gmail', value: 'Gmail API' },
        { label: '📧 SendGrid', value: 'SendGrid API' },
        { label: '💬 Slack', value: 'Slack API' },
        { label: '🏢 Greenhouse', value: 'Greenhouse API' },
        { label: '🏢 Lever', value: 'Lever API' },
      ];
    }

    return [];
  };

  const renderStartConfig = () => (
    <div className="space-y-4">
      <SectionHeader title="Where do applications come from?" />
      
      <Field
        label="Integration / Source"
        value={config?.integration || 'Manual Entry'}
        editable={editMode}
        type="select"
        options={getIntegrationOptions('start')}
        onChange={(value) => onFieldChange('data.config.integration', value)}
        icon={<Link />}
        highlighted
      />
      
      <Field
        label="Job Position"
        value={config?.jobId || ''}
        editable={editMode}
        onChange={(value) => onFieldChange('data.config.jobId', value)}
        icon={<Briefcase />}
        placeholder="e.g., Senior Frontend Engineer"
      />

      <Field
        label="Trigger Type"
        value={config?.trigger || 'manual_entry'}
        editable={editMode}
        type="select"
        options={[
          { label: '📄 Job Application', value: 'job_application' },
          { label: '👥 Employee Referral', value: 'referral' },
          { label: '💼 LinkedIn Sourcing', value: 'linkedin_sourcing' },
          { label: '✍️ Manual Entry', value: 'manual_entry' },
        ]}
        onChange={(value) => onFieldChange('data.config.trigger', value)}
        icon={<Settings />}
      />
    </div>
  );

  const renderActionConfig = () => {
    const actionType = config?.actionType;
    const integrationOptions = getIntegrationOptions('action', actionType);

    return (
      <div className="space-y-4">
        <SectionHeader title="What action should happen?" />
        
        <Field
          label="Action Type"
          value={actionType || 'email_outreach'}
          editable={editMode}
          type="select"
          options={[
            { label: '📧 Send Email', value: 'email_outreach' },
            { label: '📅 Schedule Interview', value: 'schedule_interview' },
            { label: '🤖 Parse Resume (AI)', value: 'parse_resume' },
            { label: '📞 Phone Screen', value: 'phone_screen' },
            { label: '📝 Collect Feedback', value: 'collect_feedback' },
            { label: '✍️ Send Offer Letter', value: 'send_offer' },
            { label: '🔍 Background Check', value: 'background_check' },
            { label: '⏰ Wait / Delay', value: 'wait' },
          ]}
          onChange={(value) => {
            handleSmartFieldChange('data.config.actionType', value);
            // Auto-update integration based on action type
            const newIntegrations = getIntegrationOptions('action', value);
            if (newIntegrations.length > 0) {
              onFieldChange('data.config.integration', newIntegrations[0].value);
            }
          }}
          icon={<Settings />}
          highlighted
        />

        {integrationOptions.length > 0 && (
          <Field
            label="Integration Tool"
            value={config?.integration || integrationOptions[0].value}
            editable={editMode}
            type="select"
            options={integrationOptions}
            onChange={(value) => onFieldChange('data.config.integration', value)}
            icon={<Link />}
            highlighted
          />
        )}

        {/* Email-specific fields */}
        {(actionType === 'email_outreach' || actionType === 'send_offer') && (
          <>
            <Field
              label="Email Template / Message"
              value={config?.template || ''}
              editable={editMode}
              type="textarea"
              onChange={(value) => onFieldChange('data.config.template', value)}
              icon={<Mail />}
              placeholder="Hi {{name}}, we'd like to schedule an interview for {{position}}..."
            />
            <Field
              label="From Email"
              value={config?.fromAddress || 'hiring@company.com'}
              editable={editMode}
              onChange={(value) => onFieldChange('data.config.fromAddress', value)}
              icon={<Mail />}
              placeholder="hiring@company.com"
            />
          </>
        )}

        {/* Interview scheduling fields */}
        {actionType === 'schedule_interview' && (
          <>
            <Field
              label="Interview Type"
              value={config?.interviewType || 'video'}
              editable={editMode}
              type="select"
              options={[
                { label: '🎥 Video Call', value: 'video' },
                { label: '📞 Phone Call', value: 'phone' },
                { label: '🏢 In-Person / Onsite', value: 'onsite' },
                { label: '💻 Technical Interview', value: 'technical' },
              ]}
              onChange={(value) => onFieldChange('data.config.interviewType', value)}
              icon={<Users />}
            />
            <Field
              label="Duration (minutes)"
              value={config?.duration || 30}
              editable={editMode}
              type="number"
              onChange={(value) => onFieldChange('data.config.duration', parseInt(value))}
              icon={<Clock />}
            />
            {config?.interviewerList && (
              <Field
                label="Interviewers"
                value={config.interviewerList}
                editable={editMode}
                type="array"
                onChange={(value) => onFieldChange('data.config.interviewerList', value)}
                icon={<Users />}
                placeholder="john@company.com, sarah@company.com"
              />
            )}
          </>
        )}

        {/* Wait/Delay fields */}
        {actionType === 'wait' && (
          <Field
            label="Wait Duration (hours)"
            value={config?.duration || 24}
            editable={editMode}
            type="number"
            onChange={(value) => onFieldChange('data.config.duration', parseInt(value))}
            icon={<Clock />}
          />
        )}

        {/* Phone screen fields */}
        {actionType === 'phone_screen' && (
          <>
            <Field
              label="Phone Service"
              value={config?.phoneProvider || 'twilio'}
              editable={editMode}
              type="select"
              options={[
                { label: 'Twilio', value: 'twilio' },
                { label: 'Aircall', value: 'aircall' },
              ]}
              onChange={(value) => onFieldChange('data.config.phoneProvider', value)}
              icon={<Phone />}
            />
            <Field
              label="Call Duration (minutes)"
              value={config?.duration || 15}
              editable={editMode}
              type="number"
              onChange={(value) => onFieldChange('data.config.duration', parseInt(value))}
              icon={<Clock />}
            />
          </>
        )}

        {/* AI Resume parsing fields */}
        {actionType === 'parse_resume' && (
          <>
            <Field
              label="AI Service"
              value={config?.aiProvider || 'openai'}
              editable={editMode}
              type="select"
              options={[
                { label: 'OpenAI (ChatGPT)', value: 'openai' },
                { label: 'Anthropic (Claude)', value: 'anthropic' },
              ]}
              onChange={(value) => onFieldChange('data.config.aiProvider', value)}
              icon={<Bot />}
            />
            {config?.extractFields && (
              <Field
                label="Fields to Extract"
                value={config.extractFields}
                editable={editMode}
                type="array"
                onChange={(value) => onFieldChange('data.config.extractFields', value)}
                icon={<FileText />}
                placeholder="Skills, Experience, Education"
              />
            )}
          </>
        )}
      </div>
    );
  };

  const renderDecisionConfig = () => {
    const [criteria, setCriteria] = useState(config?.criteria || []);
    const [paths, setPaths] = useState(config?.paths || []);

    return (
      <div className="space-y-4">
        <SectionHeader title="What are you evaluating?" />
        
        <Field
          label="Decision Type"
          value={config?.decisionType || 'resume_score'}
          editable={editMode}
          type="select"
          options={[
            { label: '📄 Resume Quality Score', value: 'resume_score' },
            { label: '🎯 Interview Performance Score', value: 'interview_score' },
            { label: '📅 Candidate Availability', value: 'availability' },
            { label: '💼 Years of Experience', value: 'experience_level' },
            { label: '💰 Salary Expectations', value: 'salary_range' },
            { label: '✅ Background Check Result', value: 'background_check' },
          ]}
          onChange={(value) => handleSmartFieldChange('data.config.decisionType', value)}
          icon={<GitBranch />}
          highlighted
        />

        {/* Editable Criteria */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Evaluation Criteria
            </h4>
            {editMode && (
              <button
                onClick={() => {
                  const newCriteria = [...criteria, { field: 'score', operator: '>=', value: 3, label: 'New criterion' }];
                  setCriteria(newCriteria);
                  onFieldChange('data.config.criteria', newCriteria);
                }}
                className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>
          {criteria.map((criterion: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={criterion.label || ''}
                    onChange={(e) => {
                      const updated = [...criteria];
                      updated[index].label = e.target.value;
                      setCriteria(updated);
                      onFieldChange('data.config.criteria', updated);
                    }}
                    className="flex-1 text-sm p-1.5 border rounded"
                    placeholder="Criterion description"
                  />
                  <button
                    onClick={() => {
                      const updated = criteria.filter((_: any, i: number) => i !== index);
                      setCriteria(updated);
                      onFieldChange('data.config.criteria', updated);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-700">
                  • {criterion.label || `${criterion.field} ${criterion.operator} ${criterion.value}`}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Editable Decision Paths */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Decision Paths (Outcomes)
            </h4>
            {editMode && (
              <button
                onClick={() => {
                  const newPaths = [...paths, { id: `path-${paths.length}`, label: 'New Path', condition: '' }];
                  setPaths(newPaths);
                  onFieldChange('data.config.paths', newPaths);
                }}
                className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            )}
          </div>
          {paths.map((path: any, index: number) => (
            <div key={index} className="mb-2">
              {editMode ? (
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={path.label || ''}
                      onChange={(e) => {
                        const updated = [...paths];
                        updated[index].label = e.target.value;
                        setPaths(updated);
                        onFieldChange('data.config.paths', updated);
                      }}
                      className="w-full text-sm p-1.5 border rounded font-semibold"
                      placeholder="Path name (e.g., Reject, Advance)"
                    />
                    <input
                      type="text"
                      value={path.condition || ''}
                      onChange={(e) => {
                        const updated = [...paths];
                        updated[index].condition = e.target.value;
                        setPaths(updated);
                        onFieldChange('data.config.paths', updated);
                      }}
                      className="w-full text-sm p-1.5 border rounded"
                      placeholder="Condition (e.g., Score below 3)"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const updated = paths.filter((_: any, i: number) => i !== index);
                      setPaths(updated);
                      onFieldChange('data.config.paths', updated);
                    }}
                    className="text-red-600 hover:text-red-800 mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-700">
                  • <strong>{path.label}</strong>: {path.condition}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTerminalConfig = () => {
    const integrationOptions = getIntegrationOptions('terminal');

    return (
      <div className="space-y-4">
        <SectionHeader title="What's the final outcome?" />
        
        <Field
          label="Outcome"
          value={config?.outcome || 'archived'}
          editable={editMode}
          type="select"
          options={[
            { label: '🎉 Hired', value: 'hired' },
            { label: '❌ Rejected', value: 'rejected' },
            { label: '📬 Offer Extended', value: 'offer_extended' },
            { label: '🚫 Candidate Withdrawn', value: 'withdrawn' },
            { label: '⏸️ On Hold', value: 'on_hold' },
            { label: '📁 Archived', value: 'archived' },
          ]}
          onChange={(value) => handleSmartFieldChange('data.config.outcome', value)}
          icon={<Square />}
          highlighted
        />

        <Field
          label="Notification Service"
          value={config?.integration || 'Gmail API'}
          editable={editMode}
          type="select"
          options={integrationOptions}
          onChange={(value) => onFieldChange('data.config.integration', value)}
          icon={<Link />}
        />

        <Field
          label="Message Template"
          value={config?.template || ''}
          editable={editMode}
          type="textarea"
          onChange={(value) => onFieldChange('data.config.template', value)}
          icon={<FileText />}
          placeholder="Thank you for your interest in {{position}}..."
        />

        <Field
          label="Update ATS System"
          value={config?.atsSystem || 'greenhouse'}
          editable={editMode}
          type="select"
          options={[
            { label: 'Greenhouse', value: 'greenhouse' },
            { label: 'Lever', value: 'lever' },
            { label: 'Workday', value: 'workday' },
            { label: 'BambooHR', value: 'bamboohr' },
          ]}
          onChange={(value) => onFieldChange('data.config.atsSystem', value)}
          icon={<Briefcase />}
        />

        <Field
          label="Notify Candidate"
          value={config?.notifyCandidate ?? true}
          editable={editMode}
          type="boolean"
          onChange={(value) => onFieldChange('data.config.notifyCandidate', value)}
          icon={<Mail />}
        />
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

// Helper Components
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 mb-3">
    <Check className="w-4 h-4 text-green-600" />
    <h4 className="font-semibold text-gray-900">{title}</h4>
  </div>
);

interface FieldProps {
  label: string;
  value: any;
  editable?: boolean;
  type?: 'text' | 'textarea' | 'select' | 'boolean' | 'number' | 'array';
  options?: { label: string; value: string }[];
  onChange?: (value: any) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  highlighted?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  editable = false,
  type = 'text',
  options,
  onChange,
  icon,
  placeholder,
  highlighted = false
}) => {
  const containerClass = highlighted ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3' : '';

  const renderInput = () => {
    if (!editable || !onChange) {
      return (
        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border">
          {type === 'boolean' ? (value ? 'Yes' : 'No') : 
           type === 'array' ? (Array.isArray(value) ? value.join(', ') : value) :
           String(value || '-')}
        </div>
      );
    }

    switch (type) {
      case 'boolean':
        return (
          <select
            value={value ? 'true' : 'false'}
            onChange={(e) => onChange(e.target.value === 'true')}
            className="w-full text-sm p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">✅ Yes</option>
            <option value="false">❌ No</option>
          </select>
        );
      case 'select':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {(options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full text-sm p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder={placeholder}
          />
        );
      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value || ''}
            onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="w-full text-sm p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
        {icon && <span className="text-blue-600">{icon}</span>}
        {label}
      </div>
      {renderInput()}
    </div>
  );
};
