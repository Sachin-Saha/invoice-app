import { useState, useEffect } from 'react'
import './App.css'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import InvoiceList from './components/InvoiceList'
import SaveInvoice from './components/SaveInvoice'
import PDFExport from './components/PDFExport'
import { defaultLogo } from './assets/default-logo'
import { getInvoice, saveInvoice, updateInvoice, saveFormState, loadFormState } from './utils/storage'

function App() {
  // Default invoice data
  const defaultInvoiceData = {
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),

    // Business details
    businessName: 'Smart Eye Surveillance',
    businessAddress: '',
    businessPhone: import.meta.env.VITE_BUSINESS_PHONE,
    businessEmail: import.meta.env.VITE_BUSINESS_EMAIL,
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

  // State for the current invoice data
  const [invoiceData, setInvoiceData] = useState(defaultInvoiceData);

  // State for tracking the current view (edit or list)
  const [view, setView] = useState('edit');

  // State for tracking the current invoice ID (if editing a saved invoice)
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  // Load the last edited invoice or the most recent invoice when the app starts
  useEffect(() => {
    // First, try to load the current form state
    const formState = loadFormState();
    if (formState) {
      setInvoiceData(formState);
    }

    // Try to get the last edited invoice ID from localStorage
    const lastEditedId = localStorage.getItem('last_edited_invoice');

    if (lastEditedId) {
      // If we have a last edited invoice, try to load it
      const invoice = getInvoice(lastEditedId);
      if (invoice) {
        setInvoiceData(invoice.data);
        setCurrentInvoiceId(lastEditedId);
        return;
      }
    }

    // If no last edited invoice or it couldn't be loaded, try to get the most recent invoice
    const invoiceList = JSON.parse(localStorage.getItem('invoice_list') || '[]');
    if (invoiceList.length > 0) {
      // Sort by updatedAt in descending order
      invoiceList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      const mostRecentId = invoiceList[0].id;

      const invoice = getInvoice(mostRecentId);
      if (invoice) {
        setInvoiceData(invoice.data);
        setCurrentInvoiceId(mostRecentId);
      }
    } else if (!formState) {
      // If no invoices exist and no form state, create a default one
      const defaultName = 'Default Invoice';
      const id = saveInvoice(defaultInvoiceData, defaultName);
      setCurrentInvoiceId(id);
      localStorage.setItem('last_edited_invoice', id);
    }
  }, []);

  // Handle invoice data changes
  const handleInvoiceDataChange = (newData) => {
    setInvoiceData(newData);

    // Save the current form state
    saveFormState(newData);

    // Auto-save if we're editing an existing invoice
    if (currentInvoiceId) {
      const invoice = getInvoice(currentInvoiceId);
      if (invoice) {
        // Update the invoice with the new data but keep the same name
        updateInvoice(currentInvoiceId, newData, invoice.name);
      }
    }
  };

  // Handle loading a saved invoice
  const handleLoadInvoice = (id) => {
    console.log('Loading invoice with ID:', id);
    const invoice = getInvoice(id);
    console.log('Retrieved invoice:', invoice);

    if (invoice) {
      console.log('Setting invoice data:', invoice.data);

      // Ensure we have all the required fields in the invoice data
      const completeInvoiceData = {
        ...defaultInvoiceData,  // Start with default values
        ...invoice.data,        // Override with saved values
      };

      console.log('Complete invoice data:', completeInvoiceData);
      setInvoiceData(completeInvoiceData);
      setCurrentInvoiceId(id);
      setView('edit');

      // Store the ID of the last edited invoice
      localStorage.setItem('last_edited_invoice', id);
    } else {
      console.error('Failed to load invoice with ID:', id);
    }
  };

  // Handle creating a new invoice
  const handleNewInvoice = () => {
    setInvoiceData(defaultInvoiceData);
    setCurrentInvoiceId(null);
    setView('edit');
  };

  // Handle saving an invoice
  const handleSaveComplete = (id) => {
    setCurrentInvoiceId(id);
    // Optionally show a success message
  };

  // Handle switching to the invoice list view
  const handleViewInvoices = () => {
    setView('list');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Invoice Generator</h1>
        <div className="header-actions">
          {view === 'edit' ? (
            <button className="view-invoices-btn" onClick={handleViewInvoices}>
              View Saved Invoices
            </button>
          ) : (
            <button className="new-invoice-btn" onClick={handleNewInvoice}>
              + New Invoice
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {view === 'edit' ? (
          // Edit Invoice View
          <>
            <div className="form-container">
              <div className="form-header">
                <h2>{currentInvoiceId ? 'Edit Invoice' : 'New Invoice'}</h2>
              </div>
              <InvoiceForm onInvoiceDataChange={handleInvoiceDataChange} initialData={invoiceData} />
            </div>

            <div className="preview-container">
              <div className="preview-header">
                <h2>Invoice Preview</h2>
                <div className="preview-actions">
                  <SaveInvoice
                    invoiceData={invoiceData}
                    currentInvoiceId={currentInvoiceId}
                    onSaveComplete={handleSaveComplete}
                  />
                  <PDFExport invoiceData={invoiceData} />
                </div>
              </div>
              <InvoicePreview invoiceData={invoiceData} />
            </div>
          </>
        ) : (
          // Invoice List View
          <div className="list-container">
            <InvoiceList
              onLoadInvoice={handleLoadInvoice}
              onNewInvoice={handleNewInvoice}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Invoice Generator</p>
      </footer>
    </div>
  )
}

export default App
