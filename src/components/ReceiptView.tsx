/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef } from 'react';
import { Receipt } from '../types';
import { formatCurrency } from '../lib/utils';
import { Trophy, Instagram, MessageSquare } from 'lucide-react';

interface ReceiptViewProps {
  receipt: Receipt;
}

export const ReceiptView = forwardRef<HTMLDivElement, ReceiptViewProps>(({ receipt }, ref) => {
  return (
    <div
      ref={ref}
      id="receipt-to-capture"
      className="bg-white p-8 max-w-sm mx-auto border shadow-sm font-mono text-xs uppercase tracking-tight text-black"
      style={{ minWidth: '320px' }}
    >
      {/* Header */}
      <div className="text-center mb-6 space-y-2 border-b-2 border-black pb-4">
        <Trophy className="w-8 h-8 mx-auto mb-1" />
        <h1 className="text-xl font-extrabold tracking-tighter">SALAMA SPORTS</h1>
        <p className="text-[10px] opacity-70">TALENT HOUSE & GEAR</p>
        <p className="text-[10px] opacity-70">Nairobi, Kenya</p>
      </div>

      {/* Info */}
      <div className="flex justify-between mb-4 border-b border-black/10 pb-2">
        <span>Receipt #{receipt.id}</span>
        <span>{new Date(receipt.date).toLocaleDateString()}</span>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-4 font-bold border-b border-black/5 pb-1">
          <span className="col-span-2">Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Price</span>
        </div>
        {receipt.items.map((item) => (
          <div key={item.id} className="grid grid-cols-4">
            <span className="col-span-2">{item.name}</span>
            <span className="text-right">x{item.quantity}</span>
            <span className="text-right">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t-2 border-dashed border-black pt-4 space-y-2 mb-6">
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(receipt.total)}</span>
        </div>
        <div className="flex justify-between text-[10px] opacity-70">
          <span>Payment Method</span>
          <span>{receipt.paymentMethod}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center space-y-3">
        <p className="text-[10px] leading-relaxed">
          Thank you for choosing Salama Sports.
          <br />
          Where talent meets excellence.
        </p>
        <div className="flex justify-center gap-4 opacity-50 pt-2 scale-75">
          <Instagram size={16} />
          <MessageSquare size={16} />
        </div>
        <div className="h-4 bg-repeat-x opacity-20" style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 0)', backgroundSize: '4px 4px' }} />
      </div>
    </div>
  );
});

ReceiptView.displayName = 'ReceiptView';
