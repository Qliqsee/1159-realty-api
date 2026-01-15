import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExtraModels } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { ApiStandardResponse } from '../common/decorators/api-standard-responses.decorator';
import { StatesListResponseDto } from './dto/state-response.dto';

@ApiTags('Location')
@ApiExtraModels(StatesListResponseDto)
@Controller('location')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get('states')
  @ApiOperation({ summary: 'Get list of all Nigerian states with capitals (Public)' })
  @ApiStandardResponse(200, 'Returns list of all states', StatesListResponseDto)
  getStates(): Promise<StatesListResponseDto> {
    return this.locationService.getStates();
  }
}
