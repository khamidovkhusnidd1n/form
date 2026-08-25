export type EventType = 'conference' | 'forum' | 'exhibition' | 'symposium' | 'workshop' | 'seminar' | 'article_call';
export type EventFormat = 'online' | 'offline' | 'hybrid';
export type EventStatus = 'planned' | 'ongoing' | 'completed';
export type ApplicationStatus = 'submitted' | 'under_review' | 'info_required' | 'approved' | 'rejected';
export type AttendanceType = 'online' | 'offline';
export type UserRole = 'super_admin' | 'administrator' | 'moderator';
export type Gender = 'male' | 'female';
export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'phone' | 'file' | 'image' | 'pdf';

export interface Region {
  id: number;
  name: string;
  districts: District[];
}
export interface District {
  id: number;
  name: string;
  regionId: number;
}
export interface Event {
  id: number;
  title: string;
  type: EventType;
  format: EventFormat;
  status: EventStatus;
  shortDescription: string;
  fullDescription: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  venue: string;
  bannerUrl: string;
  bannerFile?: File;
  gallery: string[];
  programPdfUrl?: string;
  participantLimit?: number;
  registrationEnabled: boolean;
  applicationsCount: number;
  createdAt: string;
  translations?: Record<string, Partial<Event>>;
  targetAudience?: string;
  registrationUrl?: string;
  isActive?: boolean;
}
export interface Application {
  id: number;
  applicationId: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  organization: string;
  position: string;
  country: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  eventId: number;
  eventTitle: string;
  attendanceType: AttendanceType;
  presentationTitle: string;
  abstract: string;
  documentUrl?: string;
  documentFile?: File;
  passportUrl?: string;
  passportFile?: File;
  photoUrl?: string;
  photoFile?: File;
  status: ApplicationStatus;
  adminComment?: string;
  invitationPdfUrl?: string;
  certificatePdfUrl?: string;
  submittedAt: string;
  updatedAt: string;
  translations?: Record<string, Partial<Application>>;
  birthDate?: string;
  workStudyPlace?: string;
  passportSeriesNumber?: string;
  createdAt?: string;
}
export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  isActive?: boolean;
  createdAt?: string;
  translations?: Record<string, Partial<FAQ>>;
}
export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalApplications: number;
  todayApplications: number;
  approved: number;
  rejected: number;
  pending: number;
  underReview: number;
  infoRequired: number;
}
export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
export interface ApplicationFormData {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  organization: string;
  position: string;
  regionId: string;
  districtId: string;
  eventId: string;
  attendanceType: AttendanceType;
  presentationTitle: string;
  abstract: string;
  document?: FileList;
  passport?: FileList;
  photo?: FileList;
}
