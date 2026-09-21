'use client'

import { Printer, X } from 'lucide-react'
import type { Sale } from '@/lib/types/sale'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type ReceiptPreviewProps = {
  sale: Sale
  storeName: string
  storeAddress?: string
  storePhone?: string
  receiptHeader?: string
  receiptFooter?: string
  onClose: () => void
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character)
}

export function ReceiptPreview({ sale, storeName, storeAddress, storePhone, receiptHeader, receiptFooter, onClose }: ReceiptPreviewProps) {
  const printReceipt = () => {
    const items = sale.items.map(item => `<div class="item"><div><strong>${escapeHtml(item.productName)}</strong><small>${item.quantity} x ${formatCurrency(item.sellingPrice)}</small></div><strong>${formatCurrency(item.subtotal)}</strong></div>`).join('')
    const printWindow = window.open('', '_blank', 'width=420,height=720')
    if (!printWindow) return
    printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(sale.invoiceNumber)}</title><style>
      *{box-sizing:border-box}body{margin:0;background:#f3f1eb;color:#24312e;font-family:Arial,sans-serif}.receipt{width:80mm;max-width:100%;margin:18px auto;padding:16px 12px;background:#fffdf8;box-shadow:0 8px 28px #173f3a1c}.brand{text-align:center;border-bottom:1px dashed #a7b5ae;padding-bottom:12px}.mark{width:40px;height:40px;object-fit:contain;border-radius:8px;margin-bottom:6px}.brand h1{margin:0;font-size:17px;letter-spacing:.04em}.brand p{margin:4px 0 0;color:#65736d;font-size:9px;line-height:1.4}.meta{display:flex;justify-content:space-between;gap:8px;margin:11px 0;color:#65736d;font-size:9px}.items{border-top:1px solid #d8dfda;border-bottom:1px solid #d8dfda;padding:8px 0}.item{display:flex;justify-content:space-between;gap:8px;margin:7px 0;font-size:10px}.item div{min-width:0}.item strong{font-size:10px}.item small{display:block;color:#76847e;font-size:9px;margin-top:2px}.summary{padding-top:8px;font-size:10px}.row{display:flex;justify-content:space-between;margin:5px 0;color:#65736d}.total{border-top:1px solid #173f3a;margin-top:8px;padding-top:8px;color:#173f3a;font-size:13px;font-weight:bold}.paid{margin-top:8px;padding-top:6px;border-top:1px dashed #a7b5ae}.thanks{text-align:center;margin-top:13px;padding-top:10px;border-top:1px dashed #a7b5ae;color:#173f3a;font-size:10px;line-height:1.5}@media print{body{background:#fff}.receipt{width:80mm;margin:0;box-shadow:none}}
    </style></head><body><article class="receipt"><header class="brand"><img class="mark" src="/rencana-kantin-mama.jpeg" alt="Logo"/><h1>${escapeHtml(storeName)}</h1><p>${escapeHtml(storeAddress ?? '')}${storePhone ? `<br>${escapeHtml(storePhone)}` : ''}</p>${receiptHeader ? `<p>${escapeHtml(receiptHeader)}</p>` : ''}</header><div class="meta"><span>${escapeHtml(sale.invoiceNumber)}</span><span>${escapeHtml(formatDateTime(sale.createdAt))}</span></div><section class="items">${items}</section><section class="summary"><div class="row"><span>Subtotal</span><span>${formatCurrency(sale.subtotal)}</span></div><div class="row"><span>Diskon</span><span>- ${formatCurrency(sale.discount)}</span></div><div class="row total"><span>Total</span><span>${formatCurrency(sale.total)}</span></div><div class="paid"><div class="row"><span>Pembayaran</span><span>${escapeHtml(sale.paymentMethod)}</span></div><div class="row"><span>Dibayar</span><span>${formatCurrency(sale.paymentAmount)}</span></div><div class="row"><span>Kembalian</span><span>${formatCurrency(Math.max(0, sale.change))}</span></div></div></section><footer class="thanks">${escapeHtml(receiptFooter ?? 'Terima kasih telah berbelanja')}<br><span>Simpan struk ini sebagai bukti transaksi.</span></footer></article><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`)
    printWindow.document.close()
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"><Card className="max-h-[90vh] w-full max-w-sm overflow-hidden bg-[#fffdf8] shadow-2xl"><div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Transaksi berhasil</p><h2 className="mt-1 text-lg font-bold text-stone-900">Preview Struk</h2></div><Button size="icon" variant="ghost" onClick={onClose} aria-label="Tutup"><X className="h-4 w-4" /></Button></div><div className="max-h-[65vh] overflow-y-auto p-5"><div className="rounded-xl border border-stone-200 bg-white px-4 py-5 text-center shadow-sm"><img src="/rencana-kantin-mama.jpeg" alt="Logo" className="mx-auto h-12 w-12 rounded-lg object-contain" /><h3 className="mt-2 font-bold tracking-wide text-stone-900">{storeName}</h3><p className="mt-1 text-[10px] text-stone-500">{storeAddress || 'Struk pembayaran resmi'}</p><div className="my-4 border-t border-dashed border-stone-300" /><div className="mb-3 flex justify-between text-[10px] text-stone-500"><span>{sale.invoiceNumber}</span><span>{formatDateTime(sale.createdAt)}</span></div><div className="space-y-3 text-left">{sale.items.map(item => <div key={item.productId} className="flex justify-between gap-3 text-xs"><div><p className="font-semibold text-stone-800">{item.productName}</p><p className="text-stone-500">{item.quantity} x {formatCurrency(item.sellingPrice)}</p></div><span className="font-semibold text-stone-800">{formatCurrency(item.subtotal)}</span></div>)}</div><div className="my-4 border-t border-stone-300" /><div className="space-y-2 text-xs text-stone-600"><div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div><div className="flex justify-between"><span>Diskon</span><span>- {formatCurrency(sale.discount)}</span></div><div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-[#173f3a]"><span>Total</span><span>{formatCurrency(sale.total)}</span></div><div className="flex justify-between"><span>Kembalian</span><span>{formatCurrency(Math.max(0, sale.change))}</span></div></div><div className="mt-5 border-t border-dashed border-stone-300 pt-3 text-center text-[10px] leading-5 text-teal-800">{receiptFooter || 'Terima kasih telah berbelanja'}<br />Simpan struk ini sebagai bukti transaksi.</div></div></div><div className="flex gap-2 border-t border-stone-200 p-4"><Button variant="outline" className="flex-1" onClick={onClose}>Tutup</Button><Button className="flex-1 bg-[#173f3a] text-white hover:bg-[#245a52]" onClick={printReceipt}><Printer className="h-4 w-4" />Cetak Struk</Button></div></Card></div>
}
