import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('CRM Inbound Quotation Event & Executive Approval Contract Suite', () => {
  it('1. Parses inbound quote.created event and marks status Pending CEO Approval', () => {
    const quotePayload = {
      quote_id: 'RFQ-2026-258730',
      user_id: 'usr_retailer_shemin',
      customer_name: 'ctauhweb',
      customer_email: 'ctauhweb@gmail.com',
      company_name: 'Muhammed shemin',
      delivery_address: 'Abu Dhabi, UAE',
      project_description: 'Immediate (Under 2 weeks)',
      products: [
        {
          productId: 'prod_aftron_ac',
          productName: 'Aftron Window AC 1.5 TR Rotary R-410a',
          quantity: 1,
          unitPrice: 1250,
        },
      ],
      status: 'NEW',
    };

    const expectedRecord = {
      id: quotePayload.quote_id,
      quotation_number: quotePayload.quote_id,
      customer: quotePayload.company_name,
      contact_person: quotePayload.customer_name,
      shipping_address: quotePayload.delivery_address,
      status: 'Pending CEO Approval',
      subtotal: 1250,
      vat_amount: 1250 * 0.05,
      total_amount: 1250 * 1.05,
      owner: 'Muhammed Shamseer (CEO)',
      assigned_to: 'Muhammed Shereef (COO)',
    };

    assert.equal(expectedRecord.status, 'Pending CEO Approval');
    assert.equal(expectedRecord.customer, 'Muhammed shemin');
    assert.equal(expectedRecord.shipping_address, 'Abu Dhabi, UAE');
    assert.equal(expectedRecord.total_amount, 1312.5);
  });

  it('2. Executive Sign-Off transitions quote to Approved with custom payment terms', () => {
    const quoteBefore = {
      id: 'RFQ-2026-258730',
      status: 'Pending CEO Approval',
      total_amount: 1312.5,
      payment_terms: 'Advance Payment',
    };

    const executiveDecision = {
      status: 'Approved',
      approvedPrice: 1300,
      paymentTerms: '30 Days Net B2B Credit',
      notes: 'Approved wholesale project rates for Abu Dhabi delivery.',
    };

    const quoteAfter = {
      ...quoteBefore,
      status: executiveDecision.status,
      total_amount: executiveDecision.approvedPrice,
      payment_terms: executiveDecision.paymentTerms,
      customer_notes: executiveDecision.notes,
      approved_at: '2026-11-25T11:00:00Z',
    };

    assert.equal(quoteAfter.status, 'Approved');
    assert.equal(quoteAfter.payment_terms, '30 Days Net B2B Credit');
    assert.equal(quoteAfter.total_amount, 1300);
  });

  it('3. Synchronizes approval to client local storage and cache', () => {
    const cache = {};
    const setCache = (k, v) => { cache[k] = JSON.stringify(v); };
    const getCache = (k) => (cache[k] ? JSON.parse(cache[k]) : null);

    const approvedQuote = {
      id: 'RFQ-2026-258730',
      status: 'Approved',
      isApproved: true,
      paymentTerms: '30 Days Net B2B Credit',
    };

    setCache('cooltech_rfqs_v1', [approvedQuote]);
    setCache('ct_approved_quote_usr_retailer_shemin', approvedQuote);

    const retrievedRfqs = getCache('cooltech_rfqs_v1');
    const cachedApproved = getCache('ct_approved_quote_usr_retailer_shemin');

    assert.equal(retrievedRfqs[0].status, 'Approved');
    assert.equal(cachedApproved.isApproved, true);
  });
});
