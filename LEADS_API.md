# Leads Management API Endpoints

## Authentication
All endpoints require JWT authentication via Bearer token.

## Admin/CRM Endpoints

### Create Lead
**POST** `/leads`
- **Roles**: admin, agent
- **Guards**: SuspendedAgentGuard
- **Body**:
  ```json
  {
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string (optional)"
  }
  ```
- **Notes**: Auto-reserves for 1 week when agent creates lead

### Batch Create Leads
**POST** `/leads/batch`
- **Roles**: admin, head-of-sales
- **Body**:
  ```json
  {
    "leads": [
      {
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "phone": "string (optional)",
        "agentEmail": "string (optional)"
      }
    ]
  }
  ```
- **Returns**: Success and failure arrays

### Get All Leads
**GET** `/leads`
- **Roles**: admin, head-of-sales
- **Query Params**:
  - `search`: string
  - `status`: AVAILABLE | RESERVED | CLOSED
  - `reservedBy`: string (userId)
  - `addedBy`: string (userId)
  - `startDate`: ISO date string
  - `endDate`: ISO date string
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
- **Returns**: Paginated leads list

### Get My Leads
**GET** `/leads/my`
- **Roles**: agent, admin
- **Query Params**: Same as Get All Leads
- **Returns**: Leads reserved by the current agent

### Get Lead Statistics
**GET** `/leads/stats`
- **Roles**: admin, head-of-sales
- **Returns**:
  ```json
  {
    "total": number,
    "closed": number,
    "available": number,
    "reserved": number,
    "conversionRate": number
  }
  ```

### Get My Statistics
**GET** `/leads/my-stats`
- **Roles**: agent, admin
- **Returns**:
  ```json
  {
    "myTotal": number,
    "myClosed": number,
    "myConversionRate": number
  }
  ```

### Get Single Lead
**GET** `/leads/:id`
- **Roles**: admin, head-of-sales, agent
- **Returns**: Lead details with feedbacks

### Update Lead
**PUT** `/leads/:id`
- **Roles**: admin, head-of-sales, agent
- **Body**:
  ```json
  {
    "email": "string (optional)",
    "firstName": "string (optional)",
    "lastName": "string (optional)",
    "phone": "string (optional)"
  }
  ```

### Delete Lead
**DELETE** `/leads/:id`
- **Roles**: admin, head-of-sales

### Reserve Lead
**POST** `/leads/:id/reserve`
- **Roles**: agent, admin
- **Guards**: SuspendedAgentGuard, MaxLeadReservationGuard
- **Notes**:
  - Max 3 leads per agent
  - 48-hour reservation period
  - Auto-resets to available after expiry

### Make Lead Available
**PUT** `/leads/:id/make-available`
- **Roles**: admin, head-of-sales
- **Notes**: Manual override to unreserve a lead

### Close Lead
**POST** `/leads/:id/close`
- **Roles**: admin, head-of-sales, agent
- **Body**:
  ```json
  {
    "clientEmail": "string"
  }
  ```
- **Notes**:
  - Links lead to existing client
  - Validates email exists in system
  - Prevents duplicate closures with same email

### Add Feedback
**POST** `/leads/:id/feedback`
- **Roles**: admin, head-of-sales, agent
- **Body**:
  ```json
  {
    "comment": "string"
  }
  ```

### Get Lead Feedbacks
**GET** `/leads/:id/feedback`
- **Roles**: admin, head-of-sales, agent
- **Returns**: Array of feedback with agent info

### Get Agent History
**GET** `/leads/:id/history`
- **Roles**: admin, head-of-sales
- **Returns**: Assignment history for conversion tracking

## Business Rules

1. **Lead Reservation**:
   - Agents can reserve max 3 leads at a time
   - Head of Sales can override limit
   - Reservations expire after 48 hours
   - Auto-reset via hourly cron job

2. **Lead Creation**:
   - Agent-created leads auto-reserve for 1 week
   - Batch-created leads start as AVAILABLE

3. **Lead Closure**:
   - Requires existing client email
   - One lead per client email
   - Links lead to client record

4. **Suspended Agents**:
   - Cannot reserve leads
   - Cannot create leads
   - Cannot interact with leads

5. **Agent History**:
   - Tracks all assignments
   - Used for conversion rate calculation
   - Never deleted, only closed

## Automated Tasks

- **Hourly Cron Job**: Auto-reset expired reservations (48 hours)

## Client Side

No direct client endpoints - leads are internal to CRM only.
