// Single source of truth for the funding application form's fields.
// Matches "New Future Legal Funding" Funding Application (2026) PDF.

const YES_NO = ['', 'Yes', 'No'];

const FORM_SECTIONS = [
  {
    title: 'Client Information',
    fields: [
      { name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { name: 'client_phone', label: 'Client Phone', type: 'tel', required: true },
      { name: 'client_dob', label: 'Client Date of Birth', type: 'date' },
      { name: 'client_email', label: 'Client Email', type: 'email' },
    ],
  },
  {
    title: 'Attorney Information',
    fields: [
      { name: 'attorney_name', label: 'Attorney Name', type: 'text' },
      { name: 'attorney_phone', label: 'Attorney Phone', type: 'tel' },
      { name: 'attorney_email', label: 'Attorney Email', type: 'email' },
    ],
  },
  {
    title: 'Paralegal Information',
    fields: [
      { name: 'paralegal_name', label: 'Paralegal Name', type: 'text' },
      { name: 'paralegal_phone', label: 'Paralegal Phone', type: 'tel' },
      { name: 'paralegal_email', label: 'Paralegal Email', type: 'email' },
    ],
  },
  {
    title: 'Case Overview',
    fields: [
      { name: 'date_of_event', label: 'Date of Event', type: 'date' },
      { name: 'case_type', label: 'Case Type', type: 'select', options: ['', 'Auto', 'Slip & Fall', 'Other'] },
      { name: 'desired_funds', label: 'Desired Funds ($)', type: 'number' },
      { name: 'state', label: 'State', type: 'text' },
      { name: 'full_case_style', label: 'Full Case Style', type: 'textarea' },
      { name: 'status_of_case', label: 'Status of Case', type: 'text' },
      { name: 'estimated_time_to_settlement', label: 'Estimated Time to Settlement', type: 'text' },
      { name: 'estimated_case_value', label: 'Estimated Case Value ($)', type: 'number' },
      {
        name: 'likelihood_of_settlement',
        label: 'Likelihood of Settlement',
        type: 'select',
        options: ['', 'Poor', 'Fair', 'Good'],
      },
    ],
  },
  {
    title: 'Liability & Settlement',
    fields: [
      { name: 'liability_established', label: 'Liability Established?', type: 'select', options: YES_NO },
      { name: 'suit_filed', label: 'Suit Filed?', type: 'select', options: YES_NO },
      { name: 'demand_sent', label: 'Demand Sent?', type: 'select', options: YES_NO },
      { name: 'settlement_offer', label: 'Settlement Offer?', type: 'select', options: YES_NO },
      { name: 'offer_amount', label: 'Offer Amount ($)', type: 'number' },
    ],
  },
  {
    title: 'Insurance Information',
    fields: [
      { name: 'defendant_insurance_company', label: "Defendant's Insurance Company", type: 'text' },
      { name: 'policy_limits', label: 'Policy Limits ($)', type: 'number' },
      { name: 'claim_number', label: 'Claim Number', type: 'text' },
      { name: 'umuim_name', label: 'UM/UIM Name', type: 'text' },
      { name: 'umuim_policy_limits', label: 'UM/UIM Policy Limits ($)', type: 'number' },
      { name: 'umuim_claim_number', label: 'UM/UIM Claim Number', type: 'text' },
    ],
  },
  {
    title: 'Medical & Financial',
    fields: [
      { name: 'estimated_medical_expenses', label: 'Estimated Medical Expenses to Date ($)', type: 'number' },
      { name: 'medical_liens', label: 'Medical Liens ($)', type: 'number' },
      { name: 'still_treating', label: 'Is Client Still Treating?', type: 'select', options: YES_NO },
      { name: 'lost_wages', label: 'Lost Wages ($)', type: 'number' },
    ],
  },
  {
    title: 'Funding History',
    fields: [
      { name: 'previous_funding', label: 'Has Client Received Previous Funding on This Case?', type: 'select', options: YES_NO },
      { name: 'previous_funding_amount', label: 'If Yes, How Much ($)', type: 'number' },
      { name: 'previous_funding_company', label: 'If Yes, From Which Company?', type: 'text' },
    ],
  },
  {
    title: 'Other Disclosures',
    fields: [
      { name: 'child_support', label: 'Child Support?', type: 'select', options: YES_NO },
      { name: 'bankruptcy', label: 'Bankruptcy?', type: 'select', options: YES_NO },
      { name: 'previous_accidents', label: 'Previous Accidents?', type: 'select', options: YES_NO },
      {
        name: 'other_liens_description',
        label: 'Are there any other liens, assignments, or interests in the case? If yes, please describe',
        type: 'textarea',
      },
    ],
  },
];

const ALL_FIELDS = FORM_SECTIONS.flatMap((s) => s.fields);

// Supporting documents — uploaded as files, stored/tracked separately from the text fields above.
const FILE_FIELDS = [
  { name: 'police_report', label: 'Police Report' },
  { name: 'insurance_coverage', label: 'Copy of Insurance Coverage' },
  { name: 'medical_records', label: 'Overview of Injuries & Medical Treatment Records' },
];

module.exports = { FORM_SECTIONS, ALL_FIELDS, FILE_FIELDS };
