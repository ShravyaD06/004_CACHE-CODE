import { CheckCircle2, FileBadge2, FileText, FileUser, IdCard, Receipt } from 'lucide-react';

/** Decorative: a source document becoming validated, structured fields. */
export function BrandVisual() {
  return (
    <div className="visual" aria-hidden="true">
      <div className="visual__source">
        <div className="visual__doc">
          <p className="visual__doc-title">INVOICE</p>
          <span className="visual__doc-meta" />
          <div className="visual__doc-table">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <span className="visual__doc-total" />
        </div>
        <ul className="visual__types">
          <li><Receipt size={14} /> Invoices</li>
          <li><FileBadge2 size={14} /> Certificates</li>
          <li><FileText size={14} /> Application forms</li>
          <li><IdCard size={14} /> ID documents</li>
          <li><FileUser size={14} /> and more</li>
        </ul>
      </div>

      <svg className="visual__arrow" viewBox="0 0 64 24" fill="none">
        <path d="M2 12h54M46 3l12 9-12 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="visual__card">
        <p className="visual__card-title">Extracted data</p>
        <dl className="visual__fields">
          <div style={{ ['--i' as string]: 0 }}><dt>Vendor</dt><dd>Northfield Supply Co.</dd></div>
          <div style={{ ['--i' as string]: 1 }}><dt>Invoice no.</dt><dd>INV-2026-0142</dd></div>
          <div style={{ ['--i' as string]: 2 }}><dt>Date</dt><dd>12 Oct 2026</dd></div>
          <div style={{ ['--i' as string]: 3 }}><dt>Total</dt><dd>12,450.00</dd></div>
        </dl>
        <p className="visual__status">
          <CheckCircle2 size={16} /> Validated and structured
        </p>
      </div>
    </div>
  );
}
