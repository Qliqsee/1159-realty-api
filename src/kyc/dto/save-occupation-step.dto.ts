import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, ValidateIf, MinLength } from 'class-validator';
import { EmploymentStatus } from '@prisma/client';

export class SaveOccupationStepDto {
  @ApiProperty({ enum: EmploymentStatus, example: EmploymentStatus.EMPLOYED })
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus;

  // For EMPLOYED
  @ApiPropertyOptional({ example: 'Acme Corp' })
  @ValidateIf((o) => o.employmentStatus === EmploymentStatus.EMPLOYED)
  @IsString()
  @MinLength(2)
  employerName?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @ValidateIf((o) => o.employmentStatus === EmploymentStatus.EMPLOYED)
  @IsString()
  @MinLength(2)
  jobTitle?: string;

  // For SELF_EMPLOYED
  @ApiPropertyOptional({ example: 'My Business Ltd' })
  @ValidateIf((o) => o.employmentStatus === EmploymentStatus.SELF_EMPLOYED)
  @IsString()
  @MinLength(2)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Retail' })
  @ValidateIf((o) => o.employmentStatus === EmploymentStatus.SELF_EMPLOYED)
  @IsString()
  @MinLength(2)
  businessType?: string;

  @ApiPropertyOptional({ example: '45 Commerce Avenue' })
  @ValidateIf((o) => o.employmentStatus === EmploymentStatus.SELF_EMPLOYED)
  @IsString()
  @MinLength(5)
  officeAddress?: string;
}
