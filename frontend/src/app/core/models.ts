export interface Shop {
  shop_name: string; app_name: string; address: string; phone: string; email: string;
  gst_number: string; logo: string | null; invoice_footer: string;
}
export interface Category { id: number; name: string; description: string; product_count?: number; }
export interface Product {
  id: number; category_id: number; category_name?: string; name: string; unit: string; price: number; description: string;
}
export interface BillItem {
  id?: number; product_id: number | null; product_name: string; unit: string; price: number; quantity: number; amount: number;
}
export interface Bill {
  id: number; bill_number: string; customer_name: string; customer_phone: string; subtotal: number;
  discount_percent: number; discount_amount: number; total: number; created_at: string; items?: BillItem[];
}
