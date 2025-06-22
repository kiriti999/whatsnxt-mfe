import { isAuthenticated } from './../../context/Authentication/authUtils';

export type Link = {
  url: string;
  title: string;
  linkType: string;
};

export type User = {
  _id: string;
  about: string;
  active: boolean;
  agreedTerms?: boolean;
  as_trainer_apply: boolean;
  availability: any;
  certification?: string;
  createdAt: string;
  designation?: string;
  email: string;
  emailConfirmed: boolean;
  emailResetToken: string;
  enrolled_courses: any[];
  experience?: string;
  from?: any;
  highestQualification?: string;
  isAuthenticated: boolean;
  languageIds?: [];
  name: string;
  phone: string;
  rate: number;
  role: string;
  skills: string[];
  to?: any;
  trainerProfilePhoto?: any;
  updatedAt: string;
  address: string;
};