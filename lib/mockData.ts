export type UserRole = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessCategory: string;
  photoUrl?: string;
}

export interface Referral {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  referralName: string;
  type: 'Tier 1' | 'Tier 2' | 'Tier 3';
  heat: 'Hot' | 'Warm' | 'Cold';
  phone: string;
  email: string;
  comments: string;
  date: string;
  status: 'pending' | 'approved' | 'completed';
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizerId: string;
  registrants: string[];
  description: string;
}

export interface RevenueData {
  month: string;
  amount: number;
}

// Mock Members
export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543210',
    businessCategory: 'IT Services',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543211',
    businessCategory: 'Real Estate',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '9876543212',
    businessCategory: 'Finance & Insurance',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
  {
    id: '4',
    name: 'Deepa Desai',
    email: 'deepa@example.com',
    phone: '9876543213',
    businessCategory: 'Consulting',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '9876543214',
    businessCategory: 'Manufacturing',
    photoUrl: 'https://images.unsplash.com/photo-1507742622603-bc45589b118d?w=100&h=100&fit=crop',
  },
  {
    id: '6',
    name: 'Neha Gupta',
    email: 'neha@example.com',
    phone: '9876543215',
    businessCategory: 'Healthcare',
    photoUrl: 'https://images.unsplash.com/photo-1494761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
  {
    id: '7',
    name: 'Sanjay Verma',
    email: 'sanjay@example.com',
    phone: '9876543216',
    businessCategory: 'Education',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
  {
    id: '8',
    name: 'Anjali Reddy',
    email: 'anjali@example.com',
    phone: '9876543217',
    businessCategory: 'Retail & E-commerce',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
  {
    id: '9',
    name: 'Manish Nair',
    email: 'manish@example.com',
    phone: '9876543218',
    businessCategory: 'Hospitality',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: '10',
    name: 'Sneha Bhat',
    email: 'sneha@example.com',
    phone: '9876543219',
    businessCategory: 'Legal Services',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
];

export const categories = [
  'IT Services',
  'Real Estate',
  'Finance & Insurance',
  'Consulting',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Retail & E-commerce',
  'Hospitality',
  'Legal Services',
  'Marketing',
  'Construction',
  'Automobile',
  'Agriculture',
  'Others'
];

// Mock Referrals
export const mockReferrals: Referral[] = [
  {
    id: 'REF001',
    fromMemberId: '1',
    toMemberId: '2',
    referralName: 'ABC Tech Solutions',
    type: 'Tier 1',
    heat: 'Hot',
    phone: '9999888877',
    email: 'contact@abctech.com',
    comments: 'Excellent company, very professional',
    date: '2024-02-10',
    status: 'approved',
  },
  {
    id: 'REF002',
    fromMemberId: '2',
    toMemberId: '3',
    referralName: 'XYZ Properties',
    type: 'Tier 2',
    heat: 'Warm',
    phone: '8888777766',
    email: 'info@xyzprops.com',
    comments: 'Good potential',
    date: '2024-02-09',
    status: 'pending',
  },
  {
    id: 'REF003',
    fromMemberId: '3',
    toMemberId: '1',
    referralName: 'PQR Financial',
    type: 'Tier 1',
    heat: 'Hot',
    phone: '7777666655',
    email: 'support@pqrfin.com',
    comments: 'Highly recommended',
    date: '2024-02-08',
    status: 'completed',
  },
  {
    id: 'REF004',
    fromMemberId: '4',
    toMemberId: '5',
    referralName: 'DEF Industries',
    type: 'Tier 3',
    heat: 'Cold',
    phone: '6666555544',
    email: 'hello@defind.com',
    comments: 'Potential opportunity',
    date: '2024-02-07',
    status: 'pending',
  },
  {
    id: 'REF005',
    fromMemberId: '5',
    toMemberId: '6',
    referralName: 'GHI Healthcare',
    type: 'Tier 1',
    heat: 'Hot',
    phone: '5555444433',
    email: 'contact@ghihc.com',
    comments: 'Perfect fit',
    date: '2024-02-06',
    status: 'completed',
  },
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: 'MTG001',
    title: 'Monthly Networking Session',
    date: '2024-02-25',
    time: '18:00',
    location: 'Grand Conference Hall, Bangalore',
    organizerId: '1',
    registrants: ['2', '3', '4', '5'],
    description: 'Monthly networking session for members to connect and share experiences',
  },
  {
    id: 'MTG002',
    title: 'Business Growth Workshop',
    date: '2024-03-05',
    time: '15:00',
    location: 'Innovation Center, Bangalore',
    organizerId: '2',
    registrants: ['1', '3', '6', '7'],
    description: 'Workshop on scaling your business efficiently',
  },
  {
    id: 'MTG003',
    title: 'Women Entrepreneurs Meetup',
    date: '2024-03-10',
    time: '17:30',
    location: 'Cafe Corner, Bangalore',
    organizerId: '4',
    registrants: ['2', '6', '8', '10'],
    description: 'Exclusive meetup for women entrepreneurs',
  },
  {
    id: 'MTG004',
    title: 'Industry Leaders Panel',
    date: '2024-03-15',
    time: '16:00',
    location: 'Executive Club, Bangalore',
    organizerId: '3',
    registrants: ['1', '5', '7', '9'],
    description: 'Panel discussion with industry leaders on market trends',
  },
];

// Mock Revenue Data
export const mockRevenueData: RevenueData[] = [
  { month: 'Jan', amount: 45000 },
  { month: 'Feb', amount: 52000 },
  { month: 'Mar', amount: 48000 },
  { month: 'Apr', amount: 61000 },
  { month: 'May', amount: 55000 },
  { month: 'Jun', amount: 67000 },
  { month: 'Jul', amount: 72000 },
  { month: 'Aug', amount: 68000 },
  { month: 'Sep', amount: 75000 },
  { month: 'Oct', amount: 78000 },
  { month: 'Nov', amount: 85000 },
  { month: 'Dec', amount: 92000 },
];

// Mock Performance Data
export const mockPerformanceData = [
  { month: 'Jan', referrals: 4 },
  { month: 'Feb', referrals: 6 },
  { month: 'Mar', referrals: 5 },
  { month: 'Apr', referrals: 8 },
  { month: 'May', referrals: 7 },
  { month: 'Jun', referrals: 9 },
  { month: 'Jul', referrals: 10 },
  { month: 'Aug', referrals: 8 },
  { month: 'Sep', referrals: 11 },
  { month: 'Oct', referrals: 12 },
  { month: 'Nov', referrals: 14 },
  { month: 'Dec', referrals: 16 },
];

// Mock Heat Distribution Data
export const mockHeatDistribution = [
  { name: 'Hot', value: 35, fill: '#D4AF37' },
  { name: 'Warm', value: 40, fill: '#FDB022' },
  { name: 'Cold', value: 25, fill: '#64748B' },
];

// Mock Revenue by Member
export const mockRevenueByMember = [
  { member: 'Rajesh Kumar', revenue: 125000 },
  { member: 'Priya Sharma', revenue: 98000 },
  { member: 'Amit Patel', revenue: 115000 },
  { member: 'Deepa Desai', revenue: 87000 },
  { member: 'Vikram Singh', revenue: 102000 },
];

// Utility Functions
export const getMemberById = (id: string): Member | undefined => {
  return mockMembers.find(m => m.id === id);
};

export const getReferralsByMember = (memberId: string): Referral[] => {
  return mockReferrals.filter(r => r.fromMemberId === memberId || r.toMemberId === memberId);
};

export const getMeetingsByMember = (memberId: string): Meeting[] => {
  return mockMeetings.filter(m => m.registrants.includes(memberId) || m.organizerId === memberId);
};

export const generateReferralId = (): string => {
  return `REF${Date.now()}`;
};
