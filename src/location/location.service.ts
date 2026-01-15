import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StatesListResponseDto } from './dto/state-response.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async getStates(): Promise<StatesListResponseDto> {
    const states = await this.prisma.state.findMany({
      orderBy: { name: 'asc' },
    });
    return { data: states };
  }
}
