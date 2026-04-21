export type Category = 'aneis' | 'colares' | 'brincos' | 'pulseiras' | 'sets';

export type Material = 'ouro-18k' | 'prata' | 'banhado-ouro' | 'banhado-rosegold';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  material: Material;
  images: string[];
  stock: number;
  featured: boolean;
  sizes?: string[];
  tags?: string[];
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  address?: Address;
  favorites: string[];
  createdAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface Cart {
  userId?: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ProductFilters {
  category?: Category;
  material?: Material;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
