/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Equipment' | 'Apparel' | 'Service' | 'Accessories';
  description?: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Receipt {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  customerName?: string;
  paymentMethod: 'Cash' | 'Card' | 'MPESA';
}
