// Utility functions for storing and retrieving invoices from localStorage

// Key for storing the list of invoice IDs
const INVOICE_LIST_KEY = 'invoice_list';
// Prefix for individual invoice storage keys
const INVOICE_PREFIX = 'invoice_';
// Key for storing the current form state
const CURRENT_FORM_KEY = 'current_invoice_form';

/**
 * Save an invoice to localStorage
 * @param {Object} invoice - The invoice data to save
 * @param {string} name - A name/identifier for the invoice
 * @returns {string} The ID of the saved invoice
 */
export const saveInvoice = (invoice, name) => {
  // Generate a unique ID for the invoice
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create a deep copy of the invoice to avoid reference issues
  const invoiceData = JSON.parse(JSON.stringify(invoice));

  // Log the invoice data to ensure it's complete
  console.log('Saving invoice data:', invoiceData);

  // Ensure all required fields are present
  if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
    console.error('Invoice items are missing or not an array');
    invoiceData.items = invoiceData.items || [{ description: '', quantity: 1, price: 0 }];
  }

  // Create the invoice object with metadata
  const invoiceWithMeta = {
    id,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data: invoiceData
  };

  // Save the invoice data
  localStorage.setItem(`${INVOICE_PREFIX}${id}`, JSON.stringify(invoiceWithMeta));

  // Update the list of invoices
  const invoiceList = getInvoiceList();
  invoiceList.push({
    id,
    name,
    createdAt: invoiceWithMeta.createdAt,
    updatedAt: invoiceWithMeta.updatedAt,
    clientName: invoiceData.clientName || 'Unnamed Client',
    invoiceNumber: invoiceData.invoiceNumber || ''
  });
  localStorage.setItem(INVOICE_LIST_KEY, JSON.stringify(invoiceList));

  console.log('Saved invoice with ID:', id, 'Data:', invoiceData);
  return id;
};

/**
 * Update an existing invoice
 * @param {string} id - The ID of the invoice to update
 * @param {Object} invoice - The updated invoice data
 * @param {string} name - The updated name/identifier for the invoice
 * @returns {boolean} Whether the update was successful
 */
export const updateInvoice = (id, invoice, name) => {
  // Check if the invoice exists
  const existingInvoice = getInvoice(id);
  if (!existingInvoice) {
    console.error('Cannot update: Invoice not found with ID:', id);
    return false;
  }

  // Create a deep copy of the invoice to avoid reference issues
  const invoiceData = JSON.parse(JSON.stringify(invoice));

  // Log the invoice data to ensure it's complete
  console.log('Updating invoice data:', invoiceData);

  // Ensure all required fields are present
  if (!invoiceData.items || !Array.isArray(invoiceData.items)) {
    console.error('Invoice items are missing or not an array');
    invoiceData.items = invoiceData.items || [{ description: '', quantity: 1, price: 0 }];
  }

  // Update the invoice object
  const invoiceWithMeta = {
    ...existingInvoice,
    name,
    updatedAt: new Date().toISOString(),
    data: invoiceData
  };

  // Save the updated invoice
  localStorage.setItem(`${INVOICE_PREFIX}${id}`, JSON.stringify(invoiceWithMeta));

  // Update the invoice in the list
  const invoiceList = getInvoiceList();
  const index = invoiceList.findIndex(inv => inv.id === id);
  if (index !== -1) {
    invoiceList[index] = {
      id,
      name,
      createdAt: invoiceWithMeta.createdAt,
      updatedAt: invoiceWithMeta.updatedAt,
      clientName: invoiceData.clientName || 'Unnamed Client',
      invoiceNumber: invoiceData.invoiceNumber || ''
    };
    localStorage.setItem(INVOICE_LIST_KEY, JSON.stringify(invoiceList));
  }

  console.log('Updated invoice with ID:', id, 'Data:', invoiceData);
  return true;
};

/**
 * Get a list of all saved invoices
 * @returns {Array} Array of invoice metadata objects
 */
export const getInvoiceList = () => {
  const list = localStorage.getItem(INVOICE_LIST_KEY);
  return list ? JSON.parse(list) : [];
};

/**
 * Get a specific invoice by ID
 * @param {string} id - The ID of the invoice to retrieve
 * @returns {Object|null} The invoice data or null if not found
 */
export const getInvoice = (id) => {
  const key = `${INVOICE_PREFIX}${id}`;
  console.log('Getting invoice with key:', key);
  const invoice = localStorage.getItem(key);
  console.log('Raw invoice data from localStorage:', invoice);

  if (!invoice) {
    console.error('Invoice not found in localStorage');
    return null;
  }

  try {
    const parsedInvoice = JSON.parse(invoice);
    console.log('Parsed invoice:', parsedInvoice);

    // Ensure the data property exists and has all required fields
    if (!parsedInvoice.data) {
      console.error('Invoice data property is missing');
      return null;
    }

    return parsedInvoice;
  } catch (error) {
    console.error('Error parsing invoice data:', error);
    return null;
  }
};

/**
 * Delete an invoice by ID
 * @param {string} id - The ID of the invoice to delete
 * @returns {boolean} Whether the deletion was successful
 */
export const deleteInvoice = (id) => {
  // Remove the invoice data
  localStorage.removeItem(`${INVOICE_PREFIX}${id}`);

  // Update the list of invoices
  const invoiceList = getInvoiceList();
  const updatedList = invoiceList.filter(invoice => invoice.id !== id);
  localStorage.setItem(INVOICE_LIST_KEY, JSON.stringify(updatedList));

  // If this was the last edited invoice, clear that reference
  if (localStorage.getItem('last_edited_invoice') === id) {
    localStorage.removeItem('last_edited_invoice');
  }

  return true;
};

/**
 * Save the current form state to localStorage
 * @param {Object} formData - The current form data
 */
export const saveFormState = (formData) => {
  localStorage.setItem(CURRENT_FORM_KEY, JSON.stringify(formData));
};

/**
 * Load the current form state from localStorage
 * @returns {Object|null} The saved form data or null if not found
 */
export const loadFormState = () => {
  const formData = localStorage.getItem(CURRENT_FORM_KEY);
  return formData ? JSON.parse(formData) : null;
};
