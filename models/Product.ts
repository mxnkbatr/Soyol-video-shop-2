export type StockStatus = 'in-stock' | 'pre-order';

export interface Product {
  id: string;
  name: string;
  image?: string | null;
  price: number; // Final price after discount
  originalPrice?: number; // Base price before discount
  discountPercent?: number; // 0-100
  description?: string;
  rating?: number;
  category: string;
  featured?: boolean;
  wholesale?: boolean;
  stockStatus?: StockStatus;
  inventory?: number;
  sections?: string[]; // ['Шинэ', 'Бэлэн', etc.]
  attributes?: Record<string, string>;
}
