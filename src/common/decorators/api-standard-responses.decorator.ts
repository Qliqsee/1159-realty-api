import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { ApiResponse, ApiErrorResponse } from '../dto/api-response.dto';

export const ApiStandardResponse = <TModel extends Type<any>>(
  status: number,
  description: string,
  dataType?: TModel,
) => {
  const responseSchema = dataType
    ? {
        allOf: [
          { $ref: `#/components/schemas/${dataType.name}` },
          {
            properties: {
              message: {
                type: 'string',
                example: 'success',
                description: 'Response message',
              },
              code: {
                type: 'number',
                example: status,
                description: 'HTTP status code',
              },
            },
          },
        ],
      }
    : {
        properties: {
          message: {
            type: 'string',
            example: 'success',
            description: 'Response message',
          },
          code: {
            type: 'number',
            example: status,
            description: 'HTTP status code',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
        },
      };

  return applyDecorators(
    SwaggerApiResponse({
      status,
      description,
      type: dataType,
      schema: responseSchema,
    }),
  );
};

export const ApiStandardErrorResponse = (status: number, description: string) => {
  return applyDecorators(
    SwaggerApiResponse({
      status,
      description,
      schema: {
        properties: {
          message: {
            type: 'string',
            example: 'fail',
            description: 'Error message',
          },
          code: {
            type: 'number',
            example: status,
            description: 'HTTP status code',
          },
          data: {
            type: 'object',
            description: 'Error details (optional)',
            nullable: true,
          },
        },
      },
    }),
  );
};

// Common error responses
export const ApiUnauthorizedResponse = () =>
  ApiStandardErrorResponse(401, 'Unauthorized');

export const ApiForbiddenResponse = () =>
  ApiStandardErrorResponse(403, 'Forbidden - Insufficient permissions');

export const ApiNotFoundResponse = (resource: string = 'Resource') =>
  ApiStandardErrorResponse(404, `${resource} not found`);

export const ApiBadRequestResponse = (message: string = 'Bad request') =>
  ApiStandardErrorResponse(400, message);

export const ApiValidationErrorResponse = () =>
  ApiStandardErrorResponse(400, 'Validation failed');
