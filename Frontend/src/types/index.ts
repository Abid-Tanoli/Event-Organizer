export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Category {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organizer {
  _id: string;
  user: User;
  organizationName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logo?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  address: {
    country: string;
    city: string;
    postalCode: string;
    addressLine: string;
  };
  isVerified: boolean;
  verificationDocuments?: string[];
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  rating: number;
  totalEvents: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  soldCount: number;
  maxPerOrder: number;
  salesStartDate?: string;
  salesEndDate?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Event {
  _id: string;
  organizer: Organizer | string;
  category: Category | string;
  title: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  images: string[];
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  eventDate: string;
  eventTime: string;
  endDate?: string;
  endTime?: string;
  ticketTypes: TicketType[];
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  tags: string[];
  ageRestriction?: number;
  eventType: 'online' | 'offline' | 'hybrid';
  meetingLink?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  rejectionReason?: string;
  isFeatured: boolean;
  isSoldOut: boolean;
  isPublished: boolean;
  views: number;
  likes: number;
  sharesCount: number;
  refundPolicy: string;
  termsAndConditions: string;
  faq?: FAQ[];
  createdAt: string;
  updatedAt: string;
}

export interface BookedTicket {
  ticketType: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Ticket {
  _id: string;
  event: Event | string;
  user: User | string;
  organizer: Organizer | string;
  bookingReference: string;
  tickets: BookedTicket[];
  totalAmount: number;
  serviceFee: number;
  finalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentIntentId?: string;
  transactionId?: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'attended' | 'no-show';
  attendeeInfo: {
    name: string;
    email: string;
    phone: string;
  };
  qrCode?: string;
  checkInTime?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  categories?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    events?: T[];
    organizers?: T[];
    tickets?: T[];
    users?: T[];
    categories?: T[];
    pagination?: PaginationMeta;
  };
}