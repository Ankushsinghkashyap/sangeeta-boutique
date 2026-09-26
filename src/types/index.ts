export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  displayOrder?: number;
  createdAt?: string;
}

export interface DesignImage {
  id: number;
  designId: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder?: number;
}

export interface Design {
  id: number;
  designCode: string;
  name: string;
  slug: string;
  categoryId?: number;
  categoryName: string;
  description: string;
  designPrice: string;
  sewingPrice: string;
  customizationPrice: string;
  totalPrice: string;
  fabricInfo?: string;
  estimatedTime?: string;
  availableSizes?: string;
  customizationOptions?: string[];
  mainImage: string;
  featured: boolean;
  popular: boolean;
  status: 'active' | 'inactive' | 'unavailable';
  createdAt?: string;
  updatedAt?: string;
  images?: DesignImage[];
}

export interface OrderMeasurement {
  id?: number;
  orderId?: number;
  measurementType: string;
  measurementValue: string;
}

export interface OrderCustomization {
  id?: number;
  orderId?: number;
  customizationType: string;
  customizationValue: string;
}

export interface OrderStatusHistoryItem {
  id: number;
  orderId: number;
  status: string;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'New Order'
  | 'Contact Customer'
  | 'Confirmed'
  | 'Measurement Verified'
  | 'Sewing Started'
  | 'Sewing in Progress'
  | 'Ready'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending Payment'
  | 'Pending Verification'
  | 'Payment Verified'
  | 'Payment Rejected'
  | 'Refunded';

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  customerCity?: string;
  preferredContact?: string;
  designId?: number;
  designCode: string;
  designName: string;
  designCategory?: string;
  designImage?: string;
  status: OrderStatus;
  designPrice: string;
  sewingPrice: string;
  customizationPrice: string;
  totalAmount: string;
  sizeType: 'Standard' | 'Custom';
  standardSize?: string;
  specialInstructions?: string;
  referenceImageUrl?: string;
  expectedCompletionDate?: string;
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  paymentScreenshotUrl?: string | null;
  paymentTransactionId?: string | null;
  paymentAmount?: string | null;
  paymentVerifiedBy?: string | null;
  paymentVerifiedAt?: string | null;
  paymentNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  history?: OrderStatusHistoryItem[];
  measurements?: OrderMeasurement[];
  customizations?: OrderCustomization[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt?: string;
  totalOrders?: number;
  completedOrders?: number;
  pendingOrders?: number;
  totalSpent?: string;
  orders?: Order[];
}

export interface WebsiteContent {
  hero_title?: string;
  hero_tagline?: string;
  hero_description?: string;
  phone_number?: string;
  whatsapp_number?: string;
  email_address?: string;
  physical_address?: string;
  opening_hours?: string;
  announcement_banner?: string;
  about_story?: string;
  [key: string]: string | undefined;
}

export interface DailyTrend {
  date: string;
  displayDate: string;
  shortDay: string;
  orders: number;
  revenue: number;
  completed: number;
}

export interface AdminAnalytics {
  totalDesigns: number;
  activeDesigns: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  sewingInProgress: number;
  completedOrders: number;
  totalCustomers: number;
  totalRevenue: string;
  categoryStats: Record<string, number>;
  statusStats: Record<string, number>;
  recentOrders: Order[];
  orderTrends?: DailyTrend[];
  trends30Days?: {
    totalVolume: number;
    totalRevenue: number;
    avgDailyOrders: number;
    peakVolume: number;
    peakDate: string;
  };
}
