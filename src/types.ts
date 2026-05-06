export type Role = 'admin' | 'farmer' | 'buyer' | 'transport';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Product {
  id: number;
  farmer_id: number;
  farmer_name?: string;
  farmer_stats?: {
    successfulSales: number;
    averageRating: number;
    totalRatings: number;
  };
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image_url: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  buyer_name?: string;
  buyer_phone?: string;
  farmer_id?: number;
  farmer_name?: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
}

export interface TransportRequest {
  id: number;
  order_id: number;
  transport_id: number | null;
  status: string;
  pickup_address: string;
  delivery_address: string;
}
