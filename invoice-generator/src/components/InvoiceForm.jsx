import { useState, useEffect } from 'react';
import { defaultLogo } from '../assets/default-logo';

// Helper function to format currency without trailing zeros for whole numbers
const formatCurrency = (value) => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
};

const InvoiceForm = ({ onInvoiceDataChange, initialData }) => {
  // Function to generate a random invoice number
  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    const timestamp = new Date().getTime().toString().slice(-4); // Last 4 digits of timestamp
    return `${prefix}-${randomDigits}-${timestamp}`;
  };
  // Create a default invoice data object
  const defaultInvoiceData = {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),

    // Business details
    businessName: 'Smart Eye Surveillance',
    businessAddress: '',
    businessPhone: '9673119663',
    businessEmail: 'smarteyesurveillance.tech@gmail.com',
    businessLogo: defaultLogo,

    // Client details
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',

    // Line items
    items: [{ description: '', quantity: 1, price: 0 }],

    // Tax and totals
    taxRate: 0,
    taxAmount: 0,
    installationCharge: 0,
    subtotal: 0,
    total: 0,

    // Payment status
    isPaid: false,
    paidAmount: 0,
    balanceAmount: 0,

    // Notes
    notes: '',
  };

  // Merge default data with initialData if provided
  const initialInvoiceData = initialData ? {
    ...defaultInvoiceData,
    ...initialData,
    // Ensure items is an array
    items: initialData.items && Array.isArray(initialData.items) && initialData.items.length > 0
      ? initialData.items
      : defaultInvoiceData.items
  } : defaultInvoiceData;

  // Initialize state with the merged data
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);

  // Initialize invoice data and generate a random invoice number if needed
  useEffect(() => {
    // Only generate a new invoice number if one doesn't already exist
    if (!invoiceData.invoiceNumber) {
      console.log('Generating new invoice number');
      const randomInvoiceNumber = generateInvoiceNumber();
      const updatedInvoiceData = {
        ...invoiceData,
        invoiceNumber: randomInvoiceNumber
      };
      setInvoiceData(updatedInvoiceData);
      onInvoiceDataChange(updatedInvoiceData);
    } else {
      console.log('Using existing invoice number:', invoiceData.invoiceNumber);
    }
  }, []);

  // Log the invoice data when it changes
  useEffect(() => {
    console.log('Current invoice data:', invoiceData);
  }, [invoiceData]);

  // Handle changes to form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: value
    });

    // Update parent component
    onInvoiceDataChange({
      ...invoiceData,
      [name]: value
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoDataUrl = event.target.result;
        const updatedInvoiceData = {
          ...invoiceData,
          businessLogo: logoDataUrl
        };
        setInvoiceData(updatedInvoiceData);
        onInvoiceDataChange(updatedInvoiceData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo removal
  const handleRemoveLogo = () => {
    const updatedInvoiceData = {
      ...invoiceData,
      businessLogo: ''
    };
    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Handle changes to line items
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...invoiceData.items];
    items[index] = {
      ...items[index],
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    };

    // Calculate subtotal, tax, and total
    const subtotal = calculateSubtotal(items);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = calculateTotal(subtotal, invoiceData.taxRate, invoiceData.installationCharge);
    const balanceAmount = calculateBalanceAmount(total, invoiceData.paidAmount);

    const updatedInvoiceData = {
      ...invoiceData,
      items,
      subtotal,
      taxAmount,
      total,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Calculate subtotal from items
  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  // Calculate total
  const calculateTotal = (subtotal, taxRate, installationCharge) => {
    const taxAmount = subtotal * (taxRate / 100);
    return subtotal + taxAmount + installationCharge;
  };

  // Calculate balance amount
  const calculateBalanceAmount = (total, paidAmount) => {
    return total - paidAmount;
  };

  // Add a new line item
  const addItem = () => {
    const items = [...invoiceData.items, { description: '', quantity: 1, price: 0 }];

    // Recalculate totals
    const subtotal = calculateSubtotal(items);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = calculateTotal(subtotal, invoiceData.taxRate, invoiceData.installationCharge);
    const balanceAmount = calculateBalanceAmount(total, invoiceData.paidAmount);

    const updatedInvoiceData = {
      ...invoiceData,
      items,
      subtotal,
      taxAmount,
      total,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Remove a line item
  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return;

    const items = invoiceData.items.filter((_, i) => i !== index);

    // Recalculate totals
    const subtotal = calculateSubtotal(items);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = calculateTotal(subtotal, invoiceData.taxRate, invoiceData.installationCharge);
    const balanceAmount = calculateBalanceAmount(total, invoiceData.paidAmount);

    const updatedInvoiceData = {
      ...invoiceData,
      items,
      subtotal,
      taxAmount,
      total,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Handle generating a new random invoice number
  const handleGenerateInvoiceNumber = () => {
    const randomInvoiceNumber = generateInvoiceNumber();
    const updatedInvoiceData = {
      ...invoiceData,
      invoiceNumber: randomInvoiceNumber
    };
    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Handle tax rate change
  const handleTaxRateChange = (e) => {
    const taxRate = parseFloat(e.target.value) || 0;
    const taxAmount = invoiceData.subtotal * (taxRate / 100);
    const total = invoiceData.subtotal + taxAmount + invoiceData.installationCharge;
    const balanceAmount = total - invoiceData.paidAmount;

    const updatedInvoiceData = {
      ...invoiceData,
      taxRate,
      taxAmount,
      total,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Handle installation charge change
  const handleInstallationChargeChange = (e) => {
    const installationCharge = parseFloat(e.target.value) || 0;
    const total = invoiceData.subtotal + invoiceData.taxAmount + installationCharge;
    const balanceAmount = total - invoiceData.paidAmount;

    const updatedInvoiceData = {
      ...invoiceData,
      installationCharge,
      total,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Handle payment status change
  const handlePaymentStatusChange = (e) => {
    const isPaid = e.target.checked;
    let paidAmount = invoiceData.paidAmount;

    // If marked as paid and paid amount is 0, set paid amount to total
    if (isPaid && paidAmount === 0) {
      paidAmount = invoiceData.total;
    }

    // If marked as not paid, set paid amount to 0
    if (!isPaid) {
      paidAmount = 0;
    }

    const balanceAmount = invoiceData.total - paidAmount;

    const updatedInvoiceData = {
      ...invoiceData,
      isPaid,
      paidAmount,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  // Handle paid amount change
  const handlePaidAmountChange = (e) => {
    const paidAmount = parseFloat(e.target.value) || 0;
    const balanceAmount = invoiceData.total - paidAmount;

    const updatedInvoiceData = {
      ...invoiceData,
      paidAmount,
      balanceAmount
    };

    setInvoiceData(updatedInvoiceData);
    onInvoiceDataChange(updatedInvoiceData);
  };

  return (
    <div className="invoice-form">
      <h2>Invoice Details</h2>

      <div className="form-section">
        <h3>Invoice Information</h3>
        <div className="form-row">
          <div className="form-group invoice-number-group">
            <label htmlFor="invoiceNumber">Invoice Number</label>
            <div className="invoice-number-input-group">
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="generate-invoice-number"
                onClick={handleGenerateInvoiceNumber}
                title="Generate Random Invoice Number"
              >
                🔄 Generate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="invoiceDate">Invoice Date</label>
            <input
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={invoiceData.invoiceDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={invoiceData.dueDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Your Business Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={invoiceData.businessName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group logo-upload-group">
            <label htmlFor="businessLogo">Business Logo</label>
            <div className="logo-upload-container">
              {invoiceData.businessLogo ? (
                <div className="logo-preview">
                  <img src={invoiceData.businessLogo} alt="Business Logo" />
                  <button
                    type="button"
                    className="remove-logo"
                    onClick={handleRemoveLogo}
                    title="Remove Logo"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="logo-upload">
                  <input
                    type="file"
                    id="businessLogo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="logo-input"
                  />
                  <label htmlFor="businessLogo" className="logo-upload-label">
                    <span className="upload-icon">📷</span>
                    <span>Upload Logo</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="businessAddress">Business Address</label>
          <textarea
            id="businessAddress"
            name="businessAddress"
            value={invoiceData.businessAddress}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="businessPhone">Business Phone</label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={invoiceData.businessPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessEmail">Business Email</label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              value={invoiceData.businessEmail}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Client Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientName">Client Name</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={invoiceData.clientName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="clientAddress">Client Address</label>
          <textarea
            id="clientAddress"
            name="clientAddress"
            value={invoiceData.clientAddress}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientPhone">Client Phone</label>
            <input
              type="tel"
              id="clientPhone"
              name="clientPhone"
              value={invoiceData.clientPhone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientEmail">Client Email</label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={invoiceData.clientEmail}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Invoice Items</h3>
        {invoiceData.items.map((item, index) => (
          <div key={index} className="line-item">
            <div className="form-row">
              <div className="form-group description">
                <label htmlFor={`description-${index}`}>Description</label>
                <input
                  type="text"
                  id={`description-${index}`}
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>

              <div className="form-group quantity">
                <label htmlFor={`quantity-${index}`}>Quantity</label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  name="quantity"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>

              <div className="form-group price">
                <label htmlFor={`price-${index}`}>Price</label>
                <input
                  type="number"
                  id={`price-${index}`}
                  name="price"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, e)}
                  required
                />
              </div>

              <div className="form-group amount">
                <label>Amount</label>
                <div className="amount-value">
                  ₹{formatCurrency(item.quantity * item.price)}
                </div>
              </div>

              <button
                type="button"
                className="remove-item"
                onClick={() => removeItem(index)}
                disabled={invoiceData.items.length === 1}
              >
                &times;
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="add-item" onClick={addItem}>
          + Add Item
        </button>
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="form-group tax-rate">
            <label htmlFor="taxRate">Tax Rate (%)</label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              min="0"
              step="0.1"
              value={invoiceData.taxRate}
              onChange={handleTaxRateChange}
            />
          </div>

          <div className="form-group installation-charge">
            <label htmlFor="installationCharge">Installation Charge (₹)</label>
            <input
              type="number"
              id="installationCharge"
              name="installationCharge"
              min="0"
              step="0.01"
              value={invoiceData.installationCharge}
              onChange={handleInstallationChargeChange}
            />
          </div>
        </div>

        <div className="totals">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>₹{formatCurrency(invoiceData.subtotal)}</span>
          </div>

          <div className="total-row">
            <span>Tax ({invoiceData.taxRate}%):</span>
            <span>₹{formatCurrency(invoiceData.taxAmount)}</span>
          </div>

          <div className="total-row">
            <span>Installation Charge:</span>
            <span>₹{formatCurrency(invoiceData.installationCharge)}</span>
          </div>

          <div className="total-row grand-total">
            <span>Total:</span>
            <span>₹{formatCurrency(invoiceData.total)}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Payment Status</h3>
        <div className="form-row">
          <div className="form-group payment-status">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={invoiceData.isPaid}
                onChange={handlePaymentStatusChange}
              />
              <label htmlFor="isPaid">Paid</label>
            </div>
          </div>

          <div className="form-group paid-amount">
            <label htmlFor="paidAmount">Paid Amount (₹)</label>
            <input
              type="number"
              id="paidAmount"
              name="paidAmount"
              min="0"
              step="0.01"
              value={invoiceData.paidAmount}
              onChange={handlePaidAmountChange}
              disabled={!invoiceData.isPaid}
            />
          </div>
        </div>

        <div className="totals">
          <div className="total-row">
            <span>Total Amount:</span>
            <span>₹{formatCurrency(invoiceData.total)}</span>
          </div>

          <div className="total-row">
            <span>Paid Amount:</span>
            <span>₹{formatCurrency(invoiceData.paidAmount)}</span>
          </div>

          <div className="total-row balance-amount">
            <span>Balance Amount:</span>
            <span>₹{formatCurrency(invoiceData.balanceAmount)}</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={invoiceData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Payment terms, thank you notes, etc."
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
