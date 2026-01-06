import { Gender, MaritalStatus, EmploymentStatus } from '@prisma/client';

export interface KycPersonalData {
  firstName: string;
  lastName: string;
  dob: string; // ISO date string
  gender: Gender;
  maritalStatus: MaritalStatus;
  referralSource?: string;
}

export interface KycAddressData {
  country: string;
  state: string;
  lga: string;
  address: string;
  nationality: string;
}

export interface KycOccupationData {
  employmentStatus: EmploymentStatus;
  // For EMPLOYED
  employerName?: string;
  jobTitle?: string;
  // For SELF_EMPLOYED
  businessName?: string;
  businessType?: string;
  officeAddress?: string;
}

export interface KycIdentityData {
  idImageUrl: string; // URL to uploaded ID image
  profilePictureUrl: string; // URL to uploaded profile picture
  phoneNumber: string;
}

export interface KycNextOfKinData {
  fullName: string;
  phoneNumber: string;
  relationship: string;
  address: string;
}

export interface KycBankData {
  bankName: string;
  accountNumber: string; // Should be 10 digits
  accountName: string;
}
