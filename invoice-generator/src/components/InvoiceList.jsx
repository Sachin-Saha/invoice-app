import React, { useState, useEffect } from 'react';
import { getInvoiceList, deleteInvoice } from '../utils/storage';

const InvoiceList = ({ onLoadInvoice, onNewInvoice }) => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load the list of invoices
  useEffect(() => {
    const loadInvoices = () => {
      const invoiceList = getInvoiceList();
      setInvoices(invoiceList);
    };

    loadInvoices();
  }, []);

  // Handle editing an invoice
  const handleEditInvoice = (id, e) => {
    // If this is from a button click, stop propagation
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    console.log('Editing invoice with ID:', id);
    // Get the invoice from the current list to ensure it exists
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      onLoadInvoice(id);
    } else {
      console.error('Invoice not found in list:', id);
      alert('Could not find the invoice. Please refresh the page and try again.');
    }
  };

  // Handle deleting an invoice
  const handleDeleteInvoice = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice =>
      invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'clientName') {
        comparison = a.clientName.localeCompare(b.clientName);
      } else if (sortBy === 'invoiceNumber') {
        // Handle invoice numbers (which might be alphanumeric)
        comparison = (a.invoiceNumber || '').localeCompare(b.invoiceNumber || '');
      } else if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        comparison = new Date(a[sortBy]) - new Date(b[sortBy]);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Format date for display (DD/MM/YYYY HH:MM)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="invoice-list">
      <div className="invoice-list-header">
        <h2>Saved Invoices</h2>
        <button className="new-invoice-btn" onClick={onNewInvoice}>
          + New Invoice
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by invoice #, name, or client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {invoices.length === 0 ? (
        <div className="no-invoices">
          <p>No saved invoices found. Create a new invoice to get started.</p>
        </div>
      ) : (
        <>
          <div className="invoice-count">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </div>

          <div className="invoice-table">
            <div className="invoice-table-header">
              <div
                className={`table-cell invoice-number ${sortBy === 'invoiceNumber' ? 'sorted' : ''}`}
                onClick={() => handleSort('invoiceNumber')}
              >
                Invoice #
                {sortBy === 'invoiceNumber' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div
                className={`table-cell name ${sortBy === 'name' ? 'sorted' : ''}`}
                onClick={() => handleSort('name')}
              >
                Invoice Name
                {sortBy === 'name' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div
                className={`table-cell client ${sortBy === 'clientName' ? 'sorted' : ''}`}
                onClick={() => handleSort('clientName')}
              >
                Client
                {sortBy === 'clientName' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div
                className={`table-cell date ${sortBy === 'updatedAt' ? 'sorted' : ''}`}
                onClick={() => handleSort('updatedAt')}
              >
                Last Updated
                {sortBy === 'updatedAt' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div
                className={`table-cell date ${sortBy === 'createdAt' ? 'sorted' : ''}`}
                onClick={() => handleSort('createdAt')}
              >
                Created
                {sortBy === 'createdAt' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
              <div className="table-cell actions">
                Actions
              </div>
            </div>

            <div className="invoice-table-body">
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="invoice-row"
                  onClick={(e) => handleEditInvoice(invoice.id, e)}
                >
                  <div className="table-cell invoice-number">{invoice.invoiceNumber}</div>
                  <div className="table-cell name">{invoice.name}</div>
                  <div className="table-cell client">{invoice.clientName}</div>
                  <div className="table-cell date">{formatDate(invoice.updatedAt)}</div>
                  <div className="table-cell date">{formatDate(invoice.createdAt)}</div>
                  <div className="table-cell actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => handleEditInvoice(invoice.id, e)}
                      title="Edit Invoice"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                      title="Delete Invoice"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceList;
