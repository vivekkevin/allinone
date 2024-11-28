const mongoose = require('mongoose');

// Schema for activity history
const ActivitySchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., Meeting, Call, Email
    date: { type: Date, required: true },
    description: { type: String, required: true },
});

// Schema for next steps
const NextStepSchema = new mongoose.Schema({
    task: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, default: 'Pending' },
    responsiblePerson: { type: String, required: true },
});

// Main schema for sales prospect
const SalesProspectSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true }, // Full name of prospect
    contact: { type: String, required: true }, // Phone number
    email: { type: String, required: true }, // Email address
    company: { type: String }, // Company name (if applicable)
    industry: { type: String, required: true }, // Industry type
    address: { type: String }, // Physical address

    // Demographics
    role: { type: String }, // Position/Role in company
    location: { type: String }, // Geographic location
    companySize: { type: Number }, // Number of employees
    annualRevenue: { type: Number }, // Annual revenue
    website: { type: String }, // Company website

    // Sales-Specific Details
    status: { type: String, required: true }, // e.g., New, In Progress, Closed
    priority: { type: String, required: true }, // High, Medium, Low
    dealSize: { type: Number, required: true }, // Estimated deal size
    salesStage: { type: String, required: true }, // Sales stage (e.g., Proposal Sent)
    probabilityOfClose: { type: Number, required: true }, // Likelihood of closing (in %)

    // Communication and Engagement
    preferredCommunicationChannel: { type: String }, // e.g., Email, Phone
    lastContactDate: { type: Date }, // Date of last interaction
    notes: { type: String }, // Notes from previous conversations

    // Activity History and Next Steps
    activityHistory: [ActivitySchema],
    nextSteps: [NextStepSchema],

    // Additional Details
    referralSource: { type: String }, // How they found out about the service
    specialRequirements: { type: String }, // Unique needs or preferences
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

module.exports = mongoose.model('SalesProspect', SalesProspectSchema);
