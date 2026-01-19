import { GetPersonalInfoResponseDto } from './get-personal-info-response.dto';
import { GetOccupationInfoResponseDto } from './get-occupation-info-response.dto';
import { GetNextOfKinInfoResponseDto } from './get-next-of-kin-info-response.dto';
import { GetAddressInfoResponseDto } from './get-address-info-response.dto';
import { GetIdentityInfoResponseDto } from './get-identity-info-response.dto';
import { GetBankInfoResponseDto } from './get-bank-info-response.dto';

export class SavePersonalStepResponseDto extends GetPersonalInfoResponseDto {}

export class SaveAddressStepResponseDto extends GetAddressInfoResponseDto {}

export class SaveOccupationStepResponseDto extends GetOccupationInfoResponseDto {}

export class SaveIdentityStepResponseDto extends GetIdentityInfoResponseDto {}

export class SaveNextOfKinStepResponseDto extends GetNextOfKinInfoResponseDto {}

export class SaveBankStepResponseDto extends GetBankInfoResponseDto {}
