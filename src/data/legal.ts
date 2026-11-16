/**
 * ============================================================================
 *  LEGAL COPY — TERMS & CONDITIONS
 * ============================================================================
 *  Supplied by the owner. Edit the wording here, not in the page component.
 *  `id` doubles as the anchor (deep links such as /terms#cancellation) and as
 *  the entry shown in the on-page index.
 * ============================================================================
 */

export interface LegalSection {
  id: string
  title: string
  paragraphs: string[]
  /** Renders the shop phone number (and WhatsApp) under the copy. */
  contactBlock?: boolean
}

export const termsSections: LegalSection[] = [
  {
    id: 'pricing',
    title: 'Product Pricing & Availability',
    paragraphs: [
      'All product prices are displayed in INR (Indian Rupees) and are subject to change without prior notice. Product availability may vary depending on seasonal factors and production schedules.',
    ],
  },
  {
    id: 'payment',
    title: 'Payment Policy',
    paragraphs: [
      'We accept payments through UPI/QR codes or other payment methods provided during checkout. An order will be considered confirmed only after successful receipt of the payment.',
    ],
  },
  {
    id: 'delivery',
    title: 'Shipping & Delivery',
    paragraphs: [
      'Delivery estimates may differ depending on the customer’s location and the courier service involved. ZEESHAN — Mutton & Chicken shall not be held responsible for delays resulting from courier-related issues or unforeseen circumstances beyond our control.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Order Cancellation & Refund Policy',
    paragraphs: [
      'As our products are prepared on a made-to-order basis, cancellation requests can only be considered before the production process has started. If you experience any problems with your order, please contact us as soon as possible so that we can assist you in resolving the issue.',
    ],
  },
  {
    id: 'usage',
    title: 'Website Usage Policy',
    paragraphs: [
      'By accessing or using this website, you agree not to engage in any activity that misuses the website or interferes with its normal operation. All website content, materials, and branding belong to ZEESHAN — Mutton & Chicken.',
    ],
  },
  {
    id: 'liability',
    title: 'Liability Disclaimer',
    paragraphs: [
      'ZEESHAN — Mutton & Chicken will not be liable for any indirect, incidental, or consequential damages arising from the use of this website or the purchase of our products.',
    ],
  },
  {
    id: 'contact',
    title: 'Get in Touch',
    paragraphs: [
      'If you have any questions or concerns regarding these Terms & Conditions, please reach out to us at:',
    ],
    contactBlock: true,
  },
]
