export type StockStatus = 'in-stock' | 'pre-order';

export interface Product {
  id: string;
  name: string;
  image?: string | null;
  price: number;
  description?: string;
  rating?: number;
  category: string;
  featured?: boolean;
  wholesale?: boolean;
  stockStatus?: StockStatus; // 'in-stock' = Бэлэн байгаа, 'pre-order' = Захиалгаар
  inventory?: number; // Үлдэгдэл тоо (зөвхөн in-stock бараанд)
  attributes?: Record<string, string>;
}
