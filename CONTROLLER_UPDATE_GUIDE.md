# Controller Update Guide

This guide explains how to update remaining controllers to use the new standard response format.

## What Was Implemented

All API responses now follow this standard format:

### Success Response
```json
{
  "message": "success",
  "code": 200,
  "data": {
    // your response data here
  }
}
```

### Error Response
```json
{
  "message": "fail",
  "code": 400,
  "data": {
    // optional error details
  }
}
```

## Changes Made

1. Created `/src/common/dto/api-response.dto.ts` - Standard response DTOs
2. Created `/src/common/interceptors/response-transform.interceptor.ts` - Auto-wraps all responses
3. Created `/src/common/filters/http-exception.filter.ts` - Standardizes error responses
4. Created `/src/common/decorators/api-standard-responses.decorator.ts` - Swagger decorators
5. Updated `/src/main.ts` - Applied interceptor and filter globally
6. Updated `/src/auth/auth.controller.ts` - Example implementation
7. Updated `/src/admins/admins.controller.ts` - Example implementation

## How To Update Remaining Controllers

### Step 1: Update Imports

Replace:
```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
```

With:
```typescript
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ApiStandardResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiValidationErrorResponse,
} from '../common/decorators/api-standard-responses.decorator';
```

### Step 2: Replace @ApiResponse Decorators

**Before:**
```typescript
@Get(':id')
@ApiResponse({ status: 200, description: 'Success', type: MyDto })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Not found' })
findOne(@Param('id') id: string) {
  return this.service.findOne(id);
}
```

**After:**
```typescript
@Get(':id')
@ApiStandardResponse(200, 'Success', MyDto)
@ApiUnauthorizedResponse()
@ApiNotFoundResponse('Resource')
findOne(@Param('id') id: string) {
  return this.service.findOne(id);
}
```

## Available Decorator Helpers

### Success Responses
- `@ApiStandardResponse(status, description, dataType?)` - Generic success response

### Error Responses
- `@ApiUnauthorizedResponse()` - 401 Unauthorized
- `@ApiForbiddenResponse()` - 403 Forbidden
- `@ApiNotFoundResponse(resource?)` - 404 Not Found
- `@ApiBadRequestResponse(message?)` - 400 Bad Request
- `@ApiValidationErrorResponse()` - 400 Validation Failed

## Controllers Still Needing Updates

1. /src/email/email.controller.ts
2. /src/password-reset/password-reset.controller.ts
3. /src/file-upload/file-upload.controller.ts
4. /src/leads/leads.controller.ts
5. /src/roles/roles.controller.ts
6. /src/units/units.controller.ts
7. /src/kyc/kyc.controller.ts
8. /src/properties/properties.controller.ts
9. /src/payments/payments.controller.ts
10. /src/invoices/invoices.controller.ts
11. /src/sales-targets/sales-targets.controller.ts
12. /src/schedules/schedules.controller.ts
13. /src/partnership/partnership.controller.ts
14. /src/appointments/appointments.controller.ts
15. /src/cases/cases.controller.ts
16. /src/requirements/requirements.controller.ts
17. /src/support/support.controller.ts
18. /src/disbursements/disbursements.controller.ts
19. /src/disbursement-config/disbursement-config.controller.ts
20. /src/commissions/commissions.controller.ts
21. /src/interests/interests.controller.ts
22. /src/campaigns/campaigns.controller.ts
23. /src/dashboard/dashboard.controller.ts
24. /src/users/users.controller.ts
25. /src/enrollments/enrollments.controller.ts
26. /src/clients/clients.controller.ts

## Important Notes

- Services don't need changes - the interceptor automatically wraps responses
- Existing response DTOs remain unchanged
- All validation errors are automatically formatted
- All exceptions are automatically caught and formatted
