type User = {
  _id: string;
  name: string;
  email: string;
  emailResetToken: string;
  emailConfirmed: boolean;
  as_trainer_apply: boolean;
  active: boolean;
  agreedTerms: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  as_trainer_req_desc: string;
  phone: string;
  role: string;
  as_trainer_confirmed: boolean;
  as_trainer_confirmed_at: string;
};

export type Review = {
  _id: string;
  courseId: string;
  userId: string;
  __v: number;
  comments: string;
  createdAt: string;
  rating: number;
  updatedAt: string;
  user: User[];
};

export type ReviewListResponse = {
  reviews: Review[]
  total: number;
}