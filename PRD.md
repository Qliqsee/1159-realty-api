# Product Requirements Document

## Real Estate Management System

### System Overview

Three-application ecosystem:

1. **Admin/CRM Portal** - Management and operations
2. **Client App** - Client and partner portal
3. **API** - Single API with RBAC serving both applications

---

## Admin/CRM Portal

### Dashboard

**Stats:**

- Total/ongoing/completed enrollments
- Total generated/pending/overdue payments (all-time)
- Total leads, my revenue
- Sales target, sales achieved
- Partners count, conversion rate, commissions

**Recent Lists:**

- Recent properties
- Recent leads

---

### Leads Management

**Core Features:**

- CRUD operations for leads
- Import leads from spreadsheets with agent email assignment and batch creation
- Lead status: `reserved`, `available`, `closed`
- Status tracking: changed on, changed by

**Reservation System:**

- Reserved leads auto-reset to available after 48 hours
- Cannot be reserved by another agent during active period
- Head of Sales can manually make available
- Agents can reserve max 3 leads; additional require HoS assignment
- Auto-reserved for 1 week when agent creates lead

**Lead Details:**

- Feedback table: date, agent, comment about client/interest
- Reserved by column, reservation expiry date
- Added by field (company leads vs agent leads)

**Lead Closure:**

- Must provide client signup email
- Email validation against existing clients
- Links lead to client, changes status to closed
- Cannot close 2 leads with same email
- Leads have separate ID, linked to client on closure

**Agent History:**

- Track all agent assignments on lead
- Used for conversion rate calculation

**Stats:**

- Total leads, total closed, conversion rate
- My total leads, my closed, my conversion rate

**Restrictions:**

- Suspended agents cannot reserve or interact with leads

**Search & Filters:**

- Search and filter capabilities

---

### Sales Management

**Sales Targets:**

- Import from CSV: email, target amount, start/end date
- Error if target exists for same period
- Multiple target periods per user
- Targets can be changed or deleted
- Achievement persists even if target deleted
- Rendering based on selected period
- Target resets to 0 after period ends

---

### KYC Management

**KYC Flow (5 Steps):**

- Step 1 compulsory, sets `onboarding = true`
- Options: "Submit and skip" or "Submit and continue"
- Next/Previous saves as draft
- Final submission: "Submit for approval"
- Validation on submit alerts which steps have issues

**KYC States:**

- `pending` - Not submitted
- `awaiting verification` - Submitted, pending review
- `verified` - Approved
- `rejected` - Rejected with message

**Draft Management:**

- Shows draft vs submission differences
- Displays by section: old value, current value (trims ignored)

**Client Restrictions:**

- Incomplete KYC restricts: view map, view plots, etc.
- KYC required for partnership application

**Rejection Handling:**

- Shows rejection status and truncated message
- "Read more" opens modal with full details
- Client contacts support for more info

---

### KYC Approval

**Features:**

- List: submission date, client, feedback, status
- Click opens full KYC detail
- Pending reviews show Approve/Reject buttons
- Approve: confirmation dialog
- Reject: confirmation dialog with reason textarea

---

### Property Management

**Property Creation:**

- Payment structure configuration
- Optional plots
- Media: map coordinates, videos, images, YouTube, Instagram
- Status: `prelaunch`, `available`, `sold out`, `reserved`
- Type: `land`, `apartment`
- Subtype: `duplex`, `bungalow`, `farming land`, `industrial land`
- Pricing: prelaunch price, regular price

**Payment Options:**

- Installments or outright
- Outright can be split into 3 installments (no interest)

**Property Features:**

- Inspection dates (clients see next date)
- Client-agent chat on property detail
- Interest tracking with messages
- Contact status tracking

**Property Restrictions:**

- Can edit all fields except payment plans and units
- Can add new payment plans/units, cannot remove existing
- Can archive (not delete) - hides from list, enrolled clients can still pay

**Property Stats (Admin):**

- Total properties, total landed, total apartments
- Total sold out, total available
- Most sold property
- All who showed interest, total enrollments

**Property Details Page:**

- Description, map, features, available plots
- Payment structure, pricing
- Schedule appointment (site visitation)

**Search & Filters:**

- Filter by most/all property fields

---

### Enrollment Management

**Access Levels:**

- Admins: all enrollments in `/enrollments`
- Agents: own enrollments in `/my-enrollments`
- Clients/Partners: own enrollments (client side)

**Enrollment Creation:**

- Linked to: property, agent, client
- User preferences: installments, configurations
- From agent view: agentId auto-sent (agent field hidden)
- From admin view: agent selection required
- Partner field auto-populated if client has partner (disabled field)
- Client field optional on creation
- Admin can select enrollment date (past/future)

**Enrollment Status:**

- `ongoing` - Unsettled invoices remaining
- `completed` - All invoices settled
- `suspended` - Halted due to overdue
- `cancelled` - Admin cancelled

**Stats:**

- Total enrollments, ongoing, completed, cancelled, revoked, suspended

**Enrollment Detail Page:**

- Total/completed/overdue/pending installments
- Installment list with: due date, status, overdue period
- Agent view: commission due date, payment date, invoice status
- Client view: agent info, WhatsApp chat button, countdown to next due
- Partner ID sent with enrollment (not visible to client)

**Overdue Management:**

- Fixed fee per overdue installment (charged once per installment)
- 32-day grace period total (across all installments)
- Auto-suspend after grace period exhausted
- Overdue countdown visible to clients

**Enrollment Actions (Admin Only):**

- Cancel enrollment (except already cancelled)
- Resume enrollment with new grace period
- Manually resolve invoice (must resolve previous first)
- Undo invoice payment (only paid invoices)
- Resolve/undo buttons conditionally shown

**Payment Link System:**

- Generate for enrollments without client
- Requires: first name, last name
- Links to first installment only
- Unauthenticated invoice page: download or pay via Paystack
- Disabled after first payment or if client linked
- Can generate for other installments if first is cleared

**Client Linking:**

- Add client button (shown if no client)
- Triggers synchronization when client linked
- Button disappears after client added

**Payment Processing:**

- Paystack integration
- Webhook updates invoice
- Post-payment: download original invoice

**Search & Filters:**

- Filter by multiple properties

---

### Invoices

**Features:**

- Vouchers for installments (1:1 relationship)
- Admin only access
- Actions: manually resolve, undo payment, download
- List shows: enrollment, agent, partner
- Search & filter capabilities

---

### Appointments/Schedules

**Schedules (Admin):**

- Create: property, date/time, location, optional message
- Delete schedule auto-cancels linked appointments

**Appointments:**

- Clients book from property page
- Booking sets `booked` status/flag
- Clients can cancel
- Email reminder sent 24 hours before
- Admin view: all appointments with client, property, date

---

### Partnership Management

**Partnership Application:**

- Clients apply to become partners
- Status: `none`, `awaiting approval`, `approved`, `rejected`
- 90-day cooldown after rejection
- No rejection message displayed

**Partnership Approval:**

- List: client name, request date, status, last updated by
- Approve/Reject actions

**Partner Features:**

- See application status
- View clients they onboarded (list)
- Client detail: enrollments, installments, commission status
- Commission: 3% of total payment
- Unique partner link (combo of agent + partner link)

**Partner Restrictions:**

- Suspended partners: entitled to existing commissions, cannot add enrollments
- Suspended status shown in profile
- Voided link on BE, hidden on FE

**Partner Revenue:**

- Earn from all payments by onboarded clients

---

### Documentation

**Cases (Admin):**

- Create/edit/delete cases
- Fields: name, title, linked user/property
- List with search at `/cases`

**Case Requirements:**

- Description, title, status (`pending`, `completed`, `rejected`)
- Sample documents for client reference
- Admin: add/edit/delete requirements and samples
- Manual status change after all documents complete

**Case Requirement Detail (Admin):**

- List submitted documents
- Approve/reject individual documents with reason
- Stats: total completed/pending/rejected documents

**Requirements (Client):**

- View list with: title, description, status, created date
- Tutorial on documentation usage
- Search through requirements
- View sample documents
- Upload valid documents
- Download sample and uploaded documents
- See individual document status and rejection reason

**Case Detail Stats:**

- Total completed/pending/rejected requirements

---

### Support

**Client Features:**

- Open ticket: category, reason, attached images
- View status: `opened`, `closed`

**Admin Features:**

- Change status
- View support tickets
- Navigate through attached images
- Stats: total tickets, opened, closed

---

### Campaigns

**Integration:**

- Managed on Brevo
- Segments created in app

**Segment Criteria:**

- Gender
- Properties (enrolled clients)
- Location (country/state - multiple)
- Traffic source
- Agents
- Partners

**Export:**

- Segment list to Brevo with email and phone

---

### Disbursement

**Sources:**

- Commissions
- Cancelled enrollments

**Features:**

- Link to enrollment
- Status tracking
- Release date, created date
- Recipients: agent (+ partner if applicable)
- Release action with confirmation modal
- Immediate payment via Paystack

**Auto-Disbursement Configuration:**

- Auto disburse to: `all (except)` or `none (except)`
- Exception list: searchable, removable
- Sort: latest to earliest added

---

### Reporting

**Report Types:**

- Enrollments
- Payments
- Revenue
- Agent performance
- Leads and conversion

**Intervals:**

- Daily, weekly, monthly, quarterly, biannual, annual

---

### Analytics/Recommendations

**Analytics:**

- Properties by: most used, base country, location
- Prediction models for analysis
- Most preferred location
- Agent performance
- Agent with most: sales, lead generation, revenue
- Other relevant stats from app data

**Recommendations:**

- Property recommendations for clients
- List recommended properties per client

---

### Commissions

**Agent View:**

- All commissions
- Linked: clients, partners, enrollments
- Filter & search

**Partner View:**

- Same as agent (even if suspended)

---

### Client Interests

**Features:**

- Clients express interest in property with message
- Admin view: all interests
- Fields: client, message, agent, request date, status
- Status: `open`, `closed`
- Action: mark as attended, WhatsApp chat with agent

---

### Teams

**Role Management:**

- Assign roles to admins: agent, admin, manager, HR, etc.
- Lowest role: agent

**Admin Actions:**

- Ban: no portal access (status: `active` → `banned`)
- Suspend: lose agent capabilities
  - Cannot reserve leads
  - Referral link/ID disabled
  - Retain other features

---

## Client App

### Client Features

**KYC:**

- 5-step KYC flow
- Submit/skip on step 1
- View KYC status and rejection messages
- Draft management

**Properties:**

- Browse properties with search/filters
- Property details: description, map, features, plots, pricing
- Payment structure
- Schedule appointments
- Express interest with message
- Agent chat via WhatsApp
- View next inspection date

**Enrollments:**

- View own enrollments
- Enrollment details: installments, stats
- Invoice management: pay, download
- Overdue countdown
- Agent contact info

**Profile:**

- Fields: `leadId`, `closedBy`

**Appointments:**

- Book appointments
- Cancel appointments
- Receive email reminders (24 hours before)

**Documentation:**

- View requirements
- Upload documents
- Download samples and uploaded docs
- See document status and rejection reasons

**Support:**

- Open tickets
- View ticket status

**Restrictions:**

- Incomplete KYC: cannot view map, plots, etc.

---

### Partner Features

**Partnership:**

- Apply for partnership
- View application status
- 90-day cooldown after rejection
- Copy partner link

**Partner Dashboard:**

- View onboarded clients
- Client enrollments
- Installment details
- Commission status (expected and released)

**Commission:**

- View all commissions
- Filter & search
- Linked: clients, enrollments

**Restrictions:**

- Suspended: see status, cannot add enrollments, link voided

---

## API Features

### RBAC (Role-Based Access Control)

- Single API serving Admin/CRM Portal and Client App
- Role-based permissions
- User roles: admin, manager, HR, agent, client, partner

### Payment Integration

- Paystack for payments and disbursements
- Webhook for payment updates

### Email System

- Appointment reminders (24 hours before)
- KYC status notifications

### Data Validation

- Lead reservation validation
- Payment link validation
- Email uniqueness for lead closure
- Target period validation
- Enrollment date validation

### Automation

- Lead auto-reset (48 hours)
- Enrollment auto-suspend (32-day grace period)
- Auto-disbursement (configurable)

---

## Data Model Notes

### User/Profile

- `leadId` - Link to lead if converted
- `closedBy` - Agent who closed the lead

### Lead

- Separate entity from client
- Linked to client on closure
- Agent assignment history tracked

### Enrollment

- Optional client on creation
- Payment link for client-less enrollments
- Synchronization when client linked

### Invoice/Installment

- 1:1 relationship
- Fixed overdue fee per invoice
- Sequential payment resolution

### Partnership

- Clients become partners via approval
- 3% commission on client payments
- Agent receives 7% commission

### KYC

- 5-step process
- Draft and submission tracking
- Required for certain actions

### Property

- Cannot delete, only archive
- Units and payment plans immutable (can add, not remove)
- Media: images, videos, YouTube, Instagram, map

---

## Business Rules

1. **Leads:** Max 3 reserved per agent, 48-hour auto-reset, suspended agents cannot interact
2. **Sales Targets:** One target per period per user, achievement persists after deletion
3. **KYC:** Step 1 required for onboarding, full KYC for partnership
4. **Enrollments:** 32-day total grace period, auto-suspend after exhaustion
5. **Commissions:** Agent 7%, Partner 3% (if applicable)
6. **Payment Links:** First installment only, disabled after payment/client link
7. **Partnership:** 90-day cooldown after rejection, suspended keeps commissions
8. **Invoices:** Sequential resolution, undo only paid invoices
9. **Properties:** Archive only, enrolled clients can still pay
10. **Appointments:** Auto-cancel when schedule deleted, 24-hour reminder

---

## Future Considerations

- Advanced analytics with ML predictions
- Enhanced recommendation engine
- Additional payment gateway options
- Mobile app versions
- Third-party CRM integrations
