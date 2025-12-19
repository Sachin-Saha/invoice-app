import React from 'react';

// Helper function to format currency without trailing zeros for whole numbers
const formatCurrency = (value) => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
};

// Helper function to format date as DD/MM/YYYY
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const InvoicePreview = ({ invoiceData }) => {
  return (
    <div className="invoice-preview invoice-with-border" id="invoice-to-print">
      <div className="invoice-header">
        <div className="invoice-branding">
          {invoiceData.businessLogo && (
            <div className="business-logo">
              <img src={invoiceData.businessLogo} alt="Business Logo" />
            </div>
          )}
          <div className="invoice-title-container">
            <div className="business-title">{invoiceData.businessName || 'Your Business'}</div>
            <div className="invoice-label">INVOICE</div>
          </div>
        </div>
        <div className="invoice-number">{invoiceData.invoiceNumber}</div>
      </div>

      <div className="invoice-info">
        <div className="invoice-dates">
          <div className="date-row">
            <span className="label">Invoice Date:</span>
            <span className="value">{formatDate(invoiceData.invoiceDate)}</span>
          </div>
          <div className="date-row">
            <span className="label">Due Date:</span>
            <span className="value">{formatDate(invoiceData.dueDate)}</span>
          </div>
        </div>
      </div>

      <div className="invoice-addresses">
        <div className="business-info">
          <div className="section-title">From</div>
          <div className="business-name">{invoiceData.businessName}</div>
          <div className="address">{invoiceData.businessAddress}</div>
          <div className="contact">
            {invoiceData.businessPhone && <div>{invoiceData.businessPhone}</div>}
            {invoiceData.businessEmail && <div>{invoiceData.businessEmail}</div>}
          </div>
        </div>

        <div className="client-info">
          <div className="section-title">Bill To</div>
          <div className="client-name">{invoiceData.clientName}</div>
          <div className="address">{invoiceData.clientAddress}</div>
          <div className="contact">
            {invoiceData.clientPhone && <div>{invoiceData.clientPhone}</div>}
            {invoiceData.clientEmail && <div>{invoiceData.clientEmail}</div>}
          </div>
        </div>
      </div>

      <div className="invoice-items">
        <table>
          <thead>
            <tr>
              <th className="item-number">Sr.no</th>
              <th className="description">Description</th>
              <th className="quantity">Quantity</th>
              <th className="price">Price</th>
              <th className="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td className="item-number">{index + 1}</td>
                <td className="description">{item.description}</td>
                <td className="quantity">{item.quantity}</td>
                <td className="price">₹{formatCurrency(item.price)}</td>
                <td className="amount">₹{formatCurrency(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-totals">
        <div className="total-row">
          <span className="label">Subtotal:</span>
          <span className="value">₹{formatCurrency(invoiceData.subtotal)}</span>
        </div>

        <div className="total-row">
          <span className="label">Tax ({invoiceData.taxRate}%):</span>
          <span className="value">₹{formatCurrency(invoiceData.taxAmount)}</span>
        </div>

        <div className="total-row">
          <span className="label">Installation Charge:</span>
          <span className="value">₹{formatCurrency(invoiceData.installationCharge)}</span>
        </div>

        <div className="total-row grand-total">
          <span className="label">Total:</span>
          <span className="value">₹{formatCurrency(invoiceData.total)}</span>
        </div>
      </div>

      <div className="invoice-payment-status">
        <div className="section-title">Payment Status</div>
        <div className="payment-status-container">
          <div className="payment-status">
            <span className={`status-label ${invoiceData.isPaid ? 'paid' : ''}`}>
              {invoiceData.isPaid ? 'PAID' : 'UNPAID'}
            </span>
          </div>

          <div className="payment-details">
            <div className="payment-row">
              <span className="label">Paid Amount:</span>
              <span className="value">₹{formatCurrency(invoiceData.paidAmount)}</span>
            </div>

            <div className="payment-row balance-amount">
              <span className="label">Balance Amount:</span>
              <span className="value">₹{formatCurrency(invoiceData.balanceAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {invoiceData.notes && (
        <div className="invoice-notes">
          <div className="section-title">Notes</div>
          <div className="notes-content">{invoiceData.notes}</div>
        </div>
      )}

      <div className="invoice-footer">
        <div className="thank-you">Thank you for your business!</div>
      </div>
    </div>
  );
};

export default InvoicePreview;
