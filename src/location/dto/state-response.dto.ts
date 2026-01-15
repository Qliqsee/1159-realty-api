import { ApiProperty } from '@nestjs/swagger';

export class StateDto {
  @ApiProperty({ example: 1, description: 'State ID' })
  id: number;

  @ApiProperty({ example: 'Lagos', description: 'State name' })
  name: string;

  @ApiProperty({ example: 'Ikeja', description: 'State capital' })
  capital: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;
}

export class StatesListResponseDto {
  @ApiProperty({ type: [StateDto], description: 'List of all Nigerian states' })
  data: StateDto[];
}
