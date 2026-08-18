// Single source of truth for the intake form's fields.
// Used to render the form, validate submissions, and build CSV export headers.

const FORM_SECTIONS = [
  {
    title: 'Personal Information',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        options: ['', 'Female', 'Male', 'Non-binary', 'Prefer not to say'],
      },
      {
        name: 'marital_status',
        label: 'Marital Status',
        type: 'select',
        options: ['', 'Single', 'Married', 'Divorced', 'Widowed', 'Other'],
      },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
      { name: 'alt_phone', label: 'Alternate Phone', type: 'tel' },
      {
        name: 'preferred_contact_method',
        label: 'Preferred Contact Method',
        type: 'select',
        options: ['', 'Email', 'Phone', 'Text'],
      },
    ],
  },
  {
    title: 'Address',
    fields: [
      { name: 'street_address', label: 'Street Address', type: 'text' },
      { name: 'address_line2', label: 'Address Line 2', type: 'text' },
      { name: 'city', label: 'City', type: 'text' },
      { name: 'state', label: 'State / Province', type: 'text' },
      { name: 'zip', label: 'ZIP / Postal Code', type: 'text' },
      { name: 'country', label: 'Country', type: 'text' },
    ],
  },
  {
    title: 'Emergency Contact',
    fields: [
      { name: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text' },
      { name: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'tel' },
      { name: 'emergency_contact_relationship', label: 'Relationship', type: 'text' },
    ],
  },
  {
    title: 'Background',
    fields: [
      { name: 'occupation', label: 'Occupation / Job Title', type: 'text' },
      { name: 'employer', label: 'Current Employer', type: 'text' },
      { name: 'employment_start_date', label: 'Employment Start Date', type: 'date' },
      { name: 'annual_income', label: 'Annual Income', type: 'number' },
      {
        name: 'education_level',
        label: 'Highest Education Level',
        type: 'select',
        options: [
          '',
          'High School',
          'Some College',
          "Associate's Degree",
          "Bachelor's Degree",
          "Master's Degree",
          'Doctorate',
          'Other',
        ],
      },
      { name: 'school_name', label: 'School / Institution Name', type: 'text' },
      { name: 'graduation_year', label: 'Graduation Year', type: 'number' },
    ],
  },
  {
    title: 'Application Details',
    fields: [
      { name: 'reason_for_application', label: 'Reason for Application', type: 'textarea' },
      { name: 'previous_experience', label: 'Previous Experience / Background', type: 'textarea' },
      { name: 'availability_date', label: 'Availability / Start Date', type: 'date' },
      {
        name: 'how_heard',
        label: 'How Did You Hear About Us?',
        type: 'select',
        options: ['', 'Referral', 'Online Search', 'Social Media', 'Advertisement', 'Other'],
      },
      { name: 'additional_comments', label: 'Additional Comments', type: 'textarea' },
    ],
  },
];

const ALL_FIELDS = FORM_SECTIONS.flatMap((s) => s.fields);

const CONSENT_FIELD = {
  name: 'consent',
  label: 'I certify that the information provided above is true and accurate to the best of my knowledge.',
};

module.exports = { FORM_SECTIONS, ALL_FIELDS, CONSENT_FIELD };
