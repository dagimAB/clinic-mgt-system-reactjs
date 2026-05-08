const buildRoleSpecificGuidance = (userRole) => {
  const role = (userRole || "guest").toLowerCase();

  const guidanceByRole = {
    admin: "Prioritize operations, staffing, auditability, and policy compliance guidance.",
    doctor: "Prioritize clinical workflow support, triage communication, and concise patient-summary style outputs.",
    nurse: "Prioritize queue flow, patient intake, and escalation checklists.",
    patient: "Use plain language, explain next steps clearly, and avoid medical overclaims.",
    lab_technologist: "Prioritize sample handling, test workflow, and result communication best practices.",
  };

  return guidanceByRole[role] || "Provide helpful, concise guidance tailored to the current user context.";
};

const buildSystemPrompt = ({ userRole, userId }) => {
  return [
    "You are SHMS AI Assistant for a Student Health Management System.",
    "You must provide platform-aware answers related to appointments, queue, reports, certificates, laboratory, and role workflows.",
    "If a request is outside available platform features, explain limitation and give the closest actionable workaround.",
    "Do not fabricate patient records, lab results, or confidential data.",
    `Current user role: ${userRole || "guest"}`,
    `Current user id: ${userId || "anonymous"}`,
    buildRoleSpecificGuidance(userRole),
  ].join(" ");
};

const buildDashboardHelpPrompt = ({ userRole, userId, pageName, actionName, contextSummary }) => {
  return [
    "You are SHMS AI Assistant helping the user complete a dashboard action safely and quickly.",
    "Give concise, practical guidance that fits the current dashboard page and role.",
    "Do not invent any data, records, IDs, or results.",
    "Prefer short step-by-step instructions or the next best action.",
    `Current user role: ${userRole || "guest"}`,
    `Current user id: ${userId || "anonymous"}`,
    `Current page: ${pageName || "unknown"}`,
    `Current action: ${actionName || "unknown"}`,
    `Context: ${contextSummary || "none provided"}`,
    "If the action is not supported, explain the limitation and suggest the closest supported workflow.",
  ].join(" ");
};

module.exports = {
  buildSystemPrompt,
  buildDashboardHelpPrompt,
};
