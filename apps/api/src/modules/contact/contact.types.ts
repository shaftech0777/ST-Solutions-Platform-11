export interface CreateContactInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  country?: string;
  companyName?: string;
  subject?: string;
  message: string;
  sourcePage?: string;
}

export interface ContactResponse {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
