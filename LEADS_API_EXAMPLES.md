# Leads Management API - Request/Response Examples

All requests require authentication via Bearer token in the Authorization header.

---

## 1. Create Lead

**POST** `/leads`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "RESERVED",
  "reservedBy": "agent-user-id",
  "reservationExpiresAt": "2026-01-15T10:30:00.000Z",
  "addedBy": "agent-user-id",
  "closedBy": null,
  "clientId": null,
  "statusChangedAt": "2026-01-08T10:30:00.000Z",
  "statusChangedBy": "agent-user-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T10:30:00.000Z",
  "creator": {
    "id": "agent-user-id",
    "name": "Agent Name",
    "email": "agent@company.com"
  },
  "reserver": {
    "id": "agent-user-id",
    "name": "Agent Name",
    "email": "agent@company.com"
  }
}
```

**Error Response (403 - Suspended Agent):**
```json
{
  "statusCode": 403,
  "message": "Suspended agents cannot perform lead operations",
  "error": "Forbidden"
}
```

---

## 2. Batch Create Leads

**POST** `/leads/batch`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "leads": [
    {
      "email": "lead1@example.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "phone": "+1234567891",
      "agentEmail": "agent1@company.com"
    },
    {
      "email": "lead2@example.com",
      "firstName": "Bob",
      "lastName": "Johnson",
      "phone": "+1234567892",
      "agentEmail": "agent2@company.com"
    },
    {
      "email": "lead3@example.com",
      "firstName": "Charlie",
      "lastName": "Brown",
      "phone": "+1234567893"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "successful": [
    {
      "id": "lead-id-1",
      "email": "lead1@example.com",
      "assignedTo": "agent1-user-id"
    },
    {
      "id": "lead-id-2",
      "email": "lead2@example.com",
      "assignedTo": "agent2-user-id"
    },
    {
      "id": "lead-id-3",
      "email": "lead3@example.com",
      "assignedTo": "current-user-id"
    }
  ],
  "failed": []
}
```

**Partial Success Response (201):**
```json
{
  "successful": [
    {
      "id": "lead-id-1",
      "email": "lead1@example.com",
      "assignedTo": "agent1-user-id"
    }
  ],
  "failed": [
    {
      "email": "lead2@example.com",
      "reason": "Agent with email invalid@company.com not found"
    },
    {
      "email": "lead3@example.com",
      "reason": "User notanagent@company.com is not an agent"
    }
  ]
}
```

---

## 3. Get All Leads

**GET** `/leads?page=1&limit=10&status=RESERVED&search=john`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in email, firstName, lastName, phone
- `status` (optional): AVAILABLE | RESERVED | CLOSED
- `reservedBy` (optional): User ID
- `addedBy` (optional): User ID
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "lead-id-1",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "status": "RESERVED",
      "reservedBy": "agent-id",
      "reservationExpiresAt": "2026-01-10T10:30:00.000Z",
      "addedBy": "admin-id",
      "closedBy": null,
      "clientId": null,
      "statusChangedAt": "2026-01-08T10:30:00.000Z",
      "statusChangedBy": "agent-id",
      "createdAt": "2026-01-08T10:30:00.000Z",
      "updatedAt": "2026-01-08T10:30:00.000Z",
      "creator": {
        "id": "admin-id",
        "name": "Admin Name",
        "email": "admin@company.com"
      },
      "reserver": {
        "id": "agent-id",
        "name": "Agent Name",
        "email": "agent@company.com"
      },
      "closer": null
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 4. Get My Leads

**GET** `/leads/my?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:** Same as Get All Leads

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "lead-id-1",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "status": "RESERVED",
      "reservedBy": "current-agent-id",
      "reservationExpiresAt": "2026-01-10T10:30:00.000Z",
      "addedBy": "current-agent-id",
      "closedBy": null,
      "clientId": null,
      "statusChangedAt": "2026-01-08T10:30:00.000Z",
      "statusChangedBy": "current-agent-id",
      "createdAt": "2026-01-08T10:30:00.000Z",
      "updatedAt": "2026-01-08T10:30:00.000Z",
      "creator": {
        "id": "current-agent-id",
        "name": "Current Agent",
        "email": "agent@company.com"
      },
      "reserver": {
        "id": "current-agent-id",
        "name": "Current Agent",
        "email": "agent@company.com"
      },
      "closer": null
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 5. Get Lead Statistics

**GET** `/leads/stats`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "total": 150,
  "closed": 45,
  "available": 80,
  "reserved": 25,
  "conversionRate": 30.00
}
```

---

## 6. Get My Statistics

**GET** `/leads/my-stats`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "myTotal": 12,
  "myClosed": 5,
  "myConversionRate": 41.67
}
```

---

## 7. Get Single Lead

**GET** `/leads/:id`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "id": "lead-id-1",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "RESERVED",
  "reservedBy": "agent-id",
  "reservationExpiresAt": "2026-01-10T10:30:00.000Z",
  "addedBy": "admin-id",
  "closedBy": null,
  "clientId": null,
  "statusChangedAt": "2026-01-08T10:30:00.000Z",
  "statusChangedBy": "agent-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T10:30:00.000Z",
  "creator": {
    "id": "admin-id",
    "name": "Admin Name",
    "email": "admin@company.com"
  },
  "reserver": {
    "id": "agent-id",
    "name": "Agent Name",
    "email": "agent@company.com"
  },
  "closer": null,
  "client": null,
  "feedbacks": [
    {
      "id": "feedback-id-1",
      "leadId": "lead-id-1",
      "agentId": "agent-id",
      "comment": "Client is interested in land properties",
      "createdAt": "2026-01-08T11:00:00.000Z",
      "agent": {
        "id": "agent-id",
        "name": "Agent Name",
        "email": "agent@company.com"
      }
    }
  ]
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Lead not found",
  "error": "Not Found"
}
```

---

## 8. Update Lead

**PUT** `/leads/:id`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.updated@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1987654321"
}
```

**Success Response (200):**
```json
{
  "id": "lead-id-1",
  "email": "john.updated@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1987654321",
  "status": "RESERVED",
  "reservedBy": "agent-id",
  "reservationExpiresAt": "2026-01-10T10:30:00.000Z",
  "addedBy": "admin-id",
  "closedBy": null,
  "clientId": null,
  "statusChangedAt": "2026-01-08T10:30:00.000Z",
  "statusChangedBy": "agent-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T12:00:00.000Z",
  "creator": {
    "id": "admin-id",
    "name": "Admin Name",
    "email": "admin@company.com"
  },
  "reserver": {
    "id": "agent-id",
    "name": "Agent Name",
    "email": "agent@company.com"
  }
}
```

---

## 9. Delete Lead

**DELETE** `/leads/:id`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "id": "lead-id-1",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "AVAILABLE",
  "reservedBy": null,
  "reservationExpiresAt": null,
  "addedBy": "admin-id",
  "closedBy": null,
  "clientId": null,
  "statusChangedAt": "2026-01-08T10:30:00.000Z",
  "statusChangedBy": "admin-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T10:30:00.000Z"
}
```

---

## 10. Reserve Lead

**POST** `/leads/:id/reserve`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "id": "lead-id-1",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "RESERVED",
  "reservedBy": "current-agent-id",
  "reservationExpiresAt": "2026-01-10T10:30:00.000Z",
  "addedBy": "admin-id",
  "closedBy": null,
  "clientId": null,
  "statusChangedAt": "2026-01-08T10:30:00.000Z",
  "statusChangedBy": "current-agent-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T10:30:00.000Z",
  "creator": {
    "id": "admin-id",
    "name": "Admin Name",
    "email": "admin@company.com"
  },
  "reserver": {
    "id": "current-agent-id",
    "name": "Current Agent",
    "email": "agent@company.com"
  }
}
```

**Error Response (400 - Max Limit):**
```json
{
  "statusCode": 400,
  "message": "Maximum 3 leads can be reserved at a time. Please contact Head of Sales for additional assignments.",
  "error": "Bad Request"
}
```

**Error Response (400 - Already Reserved):**
```json
{
  "statusCode": 400,
  "message": "Lead is already reserved by another agent",
  "error": "Bad Request"
}
```

**Error Response (403 - Suspended):**
```json
{
  "statusCode": 403,
  "message": "Suspended agents cannot reserve leads",
  "error": "Forbidden"
}
```

---

## 11. Make Lead Available

**PUT** `/leads/:id/make-available`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
{
  "id": "lead-id-1",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "AVAILABLE",
  "reservedBy": null,
  "reservationExpiresAt": null,
  "addedBy": "admin-id",
  "closedBy": null,
  "clientId": null,
  "statusChangedAt": "2026-01-08T12:00:00.000Z",
  "statusChangedBy": "hos-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T12:00:00.000Z",
  "creator": {
    "id": "admin-id",
    "name": "Admin Name",
    "email": "admin@company.com"
  }
}
```

---

## 12. Close Lead

**POST** `/leads/:id/close`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientEmail": "existing.client@example.com"
}
```

**Success Response (200):**
```json
{
  "id": "lead-id-1",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "status": "CLOSED",
  "reservedBy": "agent-id",
  "reservationExpiresAt": "2026-01-10T10:30:00.000Z",
  "addedBy": "admin-id",
  "closedBy": "agent-id",
  "clientId": "client-user-id",
  "statusChangedAt": "2026-01-08T14:00:00.000Z",
  "statusChangedBy": "agent-id",
  "createdAt": "2026-01-08T10:30:00.000Z",
  "updatedAt": "2026-01-08T14:00:00.000Z",
  "creator": {
    "id": "admin-id",
    "name": "Admin Name",
    "email": "admin@company.com"
  },
  "closer": {
    "id": "agent-id",
    "name": "Agent Name",
    "email": "agent@company.com"
  },
  "client": {
    "id": "client-user-id",
    "name": "Client Name",
    "email": "existing.client@example.com"
  }
}
```

**Error Response (404 - Client Not Found):**
```json
{
  "statusCode": 404,
  "message": "Client with this email does not exist in the system",
  "error": "Not Found"
}
```

**Error Response (400 - Duplicate):**
```json
{
  "statusCode": 400,
  "message": "Another lead is already closed with this client email",
  "error": "Bad Request"
}
```

**Error Response (400 - Already Closed):**
```json
{
  "statusCode": 400,
  "message": "Lead is already closed",
  "error": "Bad Request"
}
```

---

## 13. Add Feedback

**POST** `/leads/:id/feedback`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "comment": "Client is very interested in agricultural land. Prefers properties near the river. Budget is flexible."
}
```

**Success Response (201):**
```json
{
  "id": "feedback-id-1",
  "leadId": "lead-id-1",
  "agentId": "agent-id",
  "comment": "Client is very interested in agricultural land. Prefers properties near the river. Budget is flexible.",
  "createdAt": "2026-01-08T15:00:00.000Z",
  "agent": {
    "id": "agent-id",
    "name": "Agent Name",
    "email": "agent@company.com"
  }
}
```

---

## 14. Get Lead Feedbacks

**GET** `/leads/:id/feedback`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
[
  {
    "id": "feedback-id-2",
    "leadId": "lead-id-1",
    "agentId": "agent-id-2",
    "comment": "Follow-up call scheduled for tomorrow at 2 PM",
    "createdAt": "2026-01-08T16:00:00.000Z",
    "agent": {
      "id": "agent-id-2",
      "name": "Agent Two",
      "email": "agent2@company.com"
    }
  },
  {
    "id": "feedback-id-1",
    "leadId": "lead-id-1",
    "agentId": "agent-id-1",
    "comment": "Client is very interested in agricultural land. Prefers properties near the river.",
    "createdAt": "2026-01-08T15:00:00.000Z",
    "agent": {
      "id": "agent-id-1",
      "name": "Agent One",
      "email": "agent1@company.com"
    }
  }
]
```

---

## 15. Get Agent History

**GET** `/leads/:id/history`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Success Response (200):**
```json
[
  {
    "id": "history-id-3",
    "leadId": "lead-id-1",
    "agentId": "agent-id-2",
    "assignedAt": "2026-01-08T14:00:00.000Z",
    "unassignedAt": null,
    "reason": "Lead reserved",
    "agent": {
      "id": "agent-id-2",
      "name": "Agent Two",
      "email": "agent2@company.com"
    }
  },
  {
    "id": "history-id-2",
    "leadId": "lead-id-1",
    "agentId": "agent-id-1",
    "assignedAt": "2026-01-08T11:00:00.000Z",
    "unassignedAt": "2026-01-08T14:00:00.000Z",
    "reason": "Reservation expired (48 hours)",
    "agent": {
      "id": "agent-id-1",
      "name": "Agent One",
      "email": "agent1@company.com"
    }
  },
  {
    "id": "history-id-1",
    "leadId": "lead-id-1",
    "agentId": "admin-id",
    "assignedAt": "2026-01-08T10:30:00.000Z",
    "unassignedAt": "2026-01-08T11:00:00.000Z",
    "reason": "Lead created by agent",
    "agent": {
      "id": "admin-id",
      "name": "Admin Name",
      "email": "admin@company.com"
    }
  }
]
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Invalid Role)
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 400 Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "firstName should not be empty"
  ],
  "error": "Bad Request"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Notes

1. **Date Formats**: All dates are in ISO 8601 format (UTC timezone)
2. **Pagination**: Default page size is 10, maximum is 100
3. **Search**: Case-insensitive partial matching on email, firstName, lastName, phone
4. **Reservation Expiry**:
   - Agent-created leads: 7 days
   - Manually reserved leads: 48 hours
5. **Auto-reset**: Runs every hour to reset expired reservations
6. **Role Names**: Must match exactly as defined in the database (case-sensitive for role checks internally)
