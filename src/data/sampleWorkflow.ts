import type { Workflow } from '../types/workflow';

// Automated Hiring Workflow with Real Integrations
export const sampleWorkflow = {
  id: 'hiring-workflow-automated',
  name: 'Automated Hiring Workflow',
  description: 'End-to-end candidate journey with real-world integrations: Gmail, Calendly, Twilio, AI parsing, and more',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  nodes: [
    // Start Node - Application Trigger
    {
      id: 'start-1',
      type: 'start',
      position: { x: 265, y: 50 },
      data: {
        label: '📧 Application Received',
        description: 'Webhook triggered from job board or career page',
        config: {
          trigger: 'job_application',
          source: 'greenhouse',
          integration: 'Greenhouse Webhook',
          jobId: 'Software Engineer - Frontend'
        }
      }
    },

    // AI Resume Parsing
    {
      id: 'action-1',
      type: 'action',
      position: { x: 245, y: 390 },
      parentId: 'start-1',
      data: {
        label: '🤖 AI Resume Parser',
        description: 'Extract skills, experience, and contact info using OpenAI',
        config: {
          actionType: 'parse_resume',
          aiProvider: 'openai',
          integration: 'OpenAI GPT-4',
          extractFields: ['Skills', 'Years Experience', 'Education', 'Contact Info'],
          autoScore: true
        }
      }
    },

    // Experience Check
    {
      id: 'decision-1',
      type: 'decision',
      position: { x: 255, y: 670 },
      parentId: 'action-1',
      data: {
        label: '⚖️ Experience Check',
        description: 'Check if candidate meets minimum 3+ years experience',
        config: {
          decisionType: 'experience_level',
          criteria: [{
            field: 'years_experience',
            operator: '>=',
            value: 3,
            label: 'Minimum 3 years required'
          }],
          paths: [
            { id: 'reject', label: 'Reject', condition: 'Less than 3 years' },
            { id: 'advance', label: 'Next Round', condition: '3+ years experience' }
          ]
        }
      }
    },

    // Rejection - Experience
    {
      id: 'terminal-1',
      type: 'terminal',
      position: { x: 50, y: 1030 },
      parentId: 'decision-1',
      data: {
        label: '❌ Reject - Experience',
        description: 'Send personalized rejection email via Gmail',
        config: {
          outcome: 'rejected',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          template: 'Thank you for your interest. We require 3+ years experience.',
          notifyCandidate: true
        }
      }
    },

    // Email Outreach
    {
      id: 'action-2',
      type: 'action',
      position: { x: 460, y: 1060 },
      parentId: 'decision-1',
      data: {
        label: '📧 Email Outreach',
        description: 'Send initial contact email to qualified candidate',
        config: {
          actionType: 'email_outreach',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          fromAddress: 'hiring@company.com',
          template: 'Hi {{name}}, we reviewed your application and would like to schedule a phone screening.'
        }
      }
    },

    // Wait for Email Response
    {
      id: 'action-3',
      type: 'action',
      position: { x: 460, y: 1370 },
      parentId: 'action-2',
      data: {
        label: '⏳ Wait 3 Days',
        description: 'Wait for candidate response to email outreach',
        config: {
          actionType: 'wait',
          integration: 'Zapier Delay',
          duration: 72,
          scheduler: 'calendly',
          template: 'Wait 3 business days for candidate response'
        }
      }
    },

    // Check Email Response
    {
      id: 'decision-2',
      type: 'decision',
      position: { x: 470, y: 1650 },
      parentId: 'action-3',
      data: {
        label: '📬 Response Check',
        description: 'Did candidate respond to email?',
        config: {
          decisionType: 'interview_score',
          criteria: [{
            field: 'email_response',
            operator: '>=',
            value: 1,
            label: 'Candidate responded to email'
          }],
          paths: [
            { id: 'follow_up', label: 'Send Follow-up', condition: 'No response received' },
            { id: 'advance', label: 'Schedule Call', condition: 'Response received' }
          ]
        }
      }
    },

    // Follow-up Email
    {
      id: 'action-4',
      type: 'action',
      position: { x: 255, y: 2010 },
      parentId: 'decision-2',
      data: {
        label: '📧 Follow-up Email',
        description: 'Send reminder email after no response',
        config: {
          actionType: 'email_outreach',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          fromAddress: 'hiring@company.com',
          template: 'Hi {{name}}, just following up on our previous email about the phone screening opportunity.'
        }
      }
    },

    // Wait Again After Follow-up
    {
      id: 'action-5',
      type: 'action',
      position: { x: 255, y: 2290 },
      parentId: 'action-4',
      data: {
        label: '⏳ Wait 2 Days',
        description: 'Final wait period after follow-up email',
        config: {
          actionType: 'wait',
          integration: 'Zapier Delay',
          duration: 48,
          template: 'Wait 2 business days for follow-up response'
        }
      }
    },

    // Final Response Check
    {
      id: 'decision-3',
      type: 'decision',
      position: { x: 265, y: 2570 },
      parentId: 'action-5',
      data: {
        label: '📬 Final Check',
        description: 'Final check for candidate response',
        config: {
          decisionType: 'interview_score',
          criteria: [{
            field: 'follow_up_response',
            operator: '>=',
            value: 1,
            label: 'Candidate responded to follow-up'
          }],
          paths: [
            { id: 'archive', label: 'Archive', condition: 'No response - candidate not interested' },
            { id: 'advance', label: 'Schedule Call', condition: 'Response received' }
          ]
        }
      }
    },

    // Archive - No Response
    {
      id: 'terminal-3',
      type: 'terminal',
      position: { x: 265, y: 2930 },
      parentId: 'decision-3',
      data: {
        label: '📁 Archive - No Response',
        description: 'Archive candidate due to no response after follow-up',
        config: {
          outcome: 'archived',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          template: 'Candidate archived due to no response after multiple attempts.',
          atsSystem: 'greenhouse'
        }
      }
    },

    // Phone Screening
    {
      id: 'action-6',
      type: 'action',
      position: { x: 675, y: 2960 },
      parentId: 'decision-2',
      data: {
        label: '📞 Phone Screening',
        description: 'Initial phone call with recruiter using Twilio',
        config: {
          actionType: 'phone_screen',
          phoneProvider: 'twilio',
          integration: 'Twilio Voice API',
          duration: 30,
          scheduler: 'calendly',
          interviewType: 'phone'
        }
      }
    },

    // Phone Screen Decision
    {
      id: 'decision-4',
      type: 'decision',
      position: { x: 685, y: 3270 },
      parentId: 'action-6',
      data: {
        label: '🎯 Phone Screen Result',
        description: 'Evaluate phone screening outcome',
        config: {
          decisionType: 'interview_score',
          criteria: [{
            field: 'score',
            operator: '>=',
            value: 3,
            label: 'Minimum score of 3/5'
          }],
          paths: [
            { id: 'reject', label: 'Reject', condition: 'Score below 3' },
            { id: 'advance', label: 'Next Round', condition: 'Score 3 or above' }
          ]
        }
      }
    },

    // Phone Screen Rejection
    {
      id: 'terminal-4',
      type: 'terminal',
      position: { x: 480, y: 3630 },
      parentId: 'decision-4',
      data: {
        label: '❌ Reject - Phone Screen',
        description: 'Send rejection email after phone screening',
        config: {
          outcome: 'rejected',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          template: 'Thank you for your time. We decided to move forward with other candidates.',
          notifyCandidate: true
        }
      }
    },

    // Schedule Technical Interview
    {
      id: 'action-7',
      type: 'action',
      position: { x: 890, y: 3660 },
      parentId: 'decision-4',
      data: {
        label: '📅 Schedule Technical Interview',
        description: 'Book technical interview using Calendly integration',
        config: {
          actionType: 'schedule_interview',
          scheduler: 'calendly',
          integration: 'Calendly API',
          duration: 90,
          interviewType: 'technical',
          interviewerList: ['John (Senior Dev)', 'Sarah (Tech Lead)']
        }
      }
    },

    // Wait for Interview Response
    {
      id: 'action-8',
      type: 'action',
      position: { x: 890, y: 3970 },
      parentId: 'action-7',
      data: {
        label: '⏳ Wait 5 Days',
        description: 'Wait for candidate to confirm technical interview',
        config: {
          actionType: 'wait',
          integration: 'Zapier Delay',
          duration: 120,
          template: 'Wait 5 business days for interview confirmation'
        }
      }
    },

    // Check Interview Response
    {
      id: 'decision-5',
      type: 'decision',
      position: { x: 900, y: 4250 },
      parentId: 'action-8',
      data: {
        label: '📬 Interview Confirmation',
        description: 'Did candidate confirm technical interview?',
        config: {
          decisionType: 'interview_score',
          criteria: [{
            field: 'interview_confirmed',
            operator: '>=',
            value: 1,
            label: 'Interview confirmed by candidate'
          }],
          paths: [
            { id: 'follow_up', label: 'Send Reminder', condition: 'No confirmation received' },
            { id: 'advance', label: 'Proceed', condition: 'Interview confirmed' }
          ]
        }
      }
    },

    // Interview Reminder
    {
      id: 'action-9',
      type: 'action',
      position: { x: 685, y: 4610 },
      parentId: 'decision-5',
      data: {
        label: '📧 Interview Reminder',
        description: 'Send reminder about technical interview',
        config: {
          actionType: 'email_outreach',
          emailProvider: 'sendgrid',
          integration: 'SendGrid API',
          fromAddress: 'hiring@company.com',
          template: 'Hi {{name}}, just confirming your technical interview scheduled for {{date}}.'
        }
      }
    },

    // Final Interview Wait
    {
      id: 'action-10',
      type: 'action',
      position: { x: 685, y: 4890 },
      parentId: 'action-9',
      data: {
        label: '⏳ Wait 2 Days',
        description: 'Final wait for interview confirmation',
        config: {
          actionType: 'wait',
          integration: 'Zapier Delay',
          duration: 48,
          template: 'Final 2-day wait for interview confirmation'
        }
      }
    },

    // Final Interview Check
    {
      id: 'decision-6',
      type: 'decision',
      position: { x: 695, y: 5170 },
      parentId: 'action-10',
      data: {
        label: '📬 Final Interview Check',
        description: 'Final check for interview confirmation',
        config: {
          decisionType: 'interview_score',
          criteria: [{
            field: 'final_confirmation',
            operator: '>=',
            value: 1,
            label: 'Final confirmation received'
          }],
          paths: [
            { id: 'archive', label: 'Archive', condition: 'No confirmation - candidate not interested' },
            { id: 'advance', label: 'Proceed', condition: 'Confirmed' }
          ]
        }
      }
    },

    // Archive - No Interview Confirmation
    {
      id: 'terminal-5',
      type: 'terminal',
      position: { x: 695, y: 5530 },
      parentId: 'decision-6',
      data: {
        label: '📁 Archive - No Interview Confirmation',
        description: 'Archive candidate due to no interview confirmation',
        config: {
          outcome: 'archived',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          template: 'Candidate archived due to no interview confirmation after multiple attempts.',
          atsSystem: 'greenhouse'
        }
      }
    },

    // Send Interview Confirmation
    {
      id: 'action-11',
      type: 'action',
      position: { x: 1105, y: 5560 },
      parentId: 'decision-5',
      data: {
        label: '✅ Send Confirmation',
        description: 'Send interview details via email and Slack notification',
        config: {
          actionType: 'send_offer',
          emailProvider: 'sendgrid',
          integration: 'SendGrid API',
          template: 'Technical interview scheduled for {{date}} at {{time}}. Meeting link: {{zoom_link}}',
          notifySlack: true,
          slackChannel: '#hiring'
        }
      }
    },

    // Collect Technical Feedback
    {
      id: 'action-12',
      type: 'action',
      position: { x: 1105, y: 5870 },
      parentId: 'action-11',
      data: {
        label: '📝 Collect Feedback',
        description: 'Gather technical interview feedback via Google Forms',
        config: {
          actionType: 'collect_feedback',
          integration: 'Google Forms API',
          template: 'Technical skills, problem-solving, communication assessment',
          atsSystem: 'greenhouse',
          updateATS: true
        }
      }
    },

    // Technical Interview Decision
    {
      id: 'decision-7',
      type: 'decision',
      position: { x: 1115, y: 6150 },
      parentId: 'action-12',
      data: {
        label: '🔧 Technical Assessment',
        description: 'Evaluate technical interview performance',
        config: {
          decisionType: 'interview_score',
          criteria: [{
            field: 'score',
            operator: '>=',
            value: 4,
            label: 'Strong technical performance (4/5)'
          }],
          paths: [
            { id: 'reject', label: 'Reject', condition: 'Technical skills insufficient' },
            { id: 'advance', label: 'Next Round', condition: 'Strong technical performance' }
          ]
        }
      }
    },

    // Technical Rejection
    {
      id: 'terminal-6',
      type: 'terminal',
      position: { x: 910, y: 6510 },
      parentId: 'decision-7',
      data: {
        label: '❌ Reject - Technical',
        description: 'Send technical feedback and rejection',
        config: {
          outcome: 'rejected',
          emailProvider: 'gmail',
          integration: 'Gmail API',
          template: 'Thank you for the technical interview. We appreciate your time and effort.',
          generateReport: true,
          documentStorage: 'google_drive'
        }
      }
    },

    // Final Interview with Manager
    {
      id: 'action-13',
      type: 'action',
      position: { x: 1320, y: 6540 },
      parentId: 'decision-7',
      data: {
        label: '👔 Manager Interview',
        description: 'Final interview with hiring manager via Zoom',
        config: {
          actionType: 'schedule_interview',
          scheduler: 'goodtime',
          integration: 'GoodTime API',
          duration: 60,
          interviewType: 'video',
          interviewerList: ['Alex (Hiring Manager)']
        }
      }
    },

    // Final Hiring Decision
    {
      id: 'decision-8',
      type: 'decision',
      position: { x: 1330, y: 6850 },
      parentId: 'action-13',
      data: {
        label: '🎯 Final Decision',
        description: 'Manager makes final hiring decision',
        config: {
          decisionType: 'salary_range',
          criteria: [{
            field: 'salary_expectation',
            operator: '<=',
            value: 120000,
            label: 'Within budget range'
          }],
          paths: [
            { id: 'reject', label: 'Reject', condition: 'Not the right fit' },
            { id: 'advance', label: 'Accept', condition: 'Extend job offer' }
          ]
        }
      }
    },

    // Final Rejection
    {
      id: 'terminal-7',
      type: 'terminal',
      position: { x: 1125, y: 7210 },
      parentId: 'decision-8',
      data: {
        label: '❌ Final Rejection',
        description: 'Send final rejection with feedback',
        config: {
          outcome: 'rejected',
          emailProvider: 'sendgrid',
          integration: 'SendGrid API',
          template: 'Thank you for your interest. We have decided to move forward with another candidate.',
          notifyCandidate: true,
          updateATS: true
        }
      }
    },

    // Generate Job Offer
    {
      id: 'action-14',
      type: 'action',
      position: { x: 1535, y: 7240 },
      parentId: 'decision-8',
      data: {
        label: '📄 Generate Offer',
        description: 'Create job offer using DocuSign and HRIS integration',
        config: {
          actionType: 'send_offer',
          integration: 'DocuSign API',
          template: 'Software Engineer offer letter with salary, benefits, start date',
          atsSystem: 'bamboohr',
          updateATS: true
        }
      }
    },

    // Background Check
    {
      id: 'action-15',
      type: 'action',
      position: { x: 1535, y: 7550 },
      parentId: 'action-14',
      data: {
        label: '🔍 Background Check',
        description: 'Run background check via Checkr integration',
        config: {
          actionType: 'background_check',
          integration: 'Checkr API',
          template: 'Standard background and reference check',
          atsSystem: 'greenhouse',
          updateATS: true
        }
      }
    },

    // Successful Hire
    {
      id: 'terminal-8',
      type: 'terminal',
      position: { x: 1555, y: 7830 },
      parentId: 'action-15',
      data: {
        label: '🎉 Hired Successfully',
        description: 'Welcome new team member and start onboarding',
        config: {
          outcome: 'hired',
          emailProvider: 'sendgrid',
          integration: 'SendGrid API',
          template: 'Welcome to the team! Your onboarding starts on {{start_date}}.',
          notifyCandidate: true,
          slackNotification: true,
          slackChannel: '#team-announcements'
        }
      }
    }
  ],
  edges: [
    // Main hiring flow
    { id: 'e1', source: 'start-1', target: 'action-1' },
    { id: 'e2', source: 'action-1', target: 'decision-1' },
    { id: 'e3', source: 'decision-1', target: 'terminal-1', label: 'Reject' },
    { id: 'e4', source: 'decision-1', target: 'action-2', label: 'Qualified' },
    
    // Email outreach and follow-up sequence
    { id: 'e5', source: 'action-2', target: 'action-3' },
    { id: 'e6', source: 'action-3', target: 'decision-2' },
    { id: 'e7', source: 'decision-2', target: 'action-4', label: 'Follow-up' },
    { id: 'e8', source: 'decision-2', target: 'action-6', label: 'Response' },
    { id: 'e9', source: 'action-4', target: 'action-5' },
    { id: 'e10', source: 'action-5', target: 'decision-3' },
    { id: 'e11', source: 'decision-3', target: 'terminal-3', label: 'Archive' },
    { id: 'e12', source: 'decision-3', target: 'action-6', label: 'Response' },
    
    // Phone screening and interview sequence
    { id: 'e13', source: 'action-6', target: 'decision-4' },
    { id: 'e14', source: 'decision-4', target: 'terminal-4', label: 'Reject' },
    { id: 'e15', source: 'decision-4', target: 'action-7', label: 'Advance' },
    
    // Interview confirmation sequence
    { id: 'e16', source: 'action-7', target: 'action-8' },
    { id: 'e17', source: 'action-8', target: 'decision-5' },
    { id: 'e18', source: 'decision-5', target: 'action-9', label: 'Reminder' },
    { id: 'e19', source: 'decision-5', target: 'action-11', label: 'Confirmed' },
    { id: 'e20', source: 'action-9', target: 'action-10' },
    { id: 'e21', source: 'action-10', target: 'decision-6' },
    { id: 'e22', source: 'decision-6', target: 'terminal-5', label: 'Archive' },
    { id: 'e23', source: 'decision-6', target: 'action-11', label: 'Response' },
    
    // Technical interview flow
    { id: 'e24', source: 'action-11', target: 'action-12' },
    { id: 'e25', source: 'action-12', target: 'decision-7' },
    { id: 'e26', source: 'decision-7', target: 'terminal-6', label: 'Reject' },
    { id: 'e27', source: 'decision-7', target: 'action-13', label: 'Advance' },
    
    // Final hiring flow
    { id: 'e28', source: 'action-13', target: 'decision-8' },
    { id: 'e29', source: 'decision-8', target: 'terminal-7', label: 'Reject' },
    { id: 'e30', source: 'decision-8', target: 'action-14', label: 'Accept' },
    { id: 'e31', source: 'action-14', target: 'action-15' },
    { id: 'e32', source: 'action-15', target: 'terminal-8' }
  ]
} as Workflow;
