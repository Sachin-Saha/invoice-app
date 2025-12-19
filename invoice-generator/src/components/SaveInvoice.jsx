import React, { useState } from 'react';
import { saveInvoice, updateInvoice } from '../utils/storage';

const SaveInvoice = ({ invoiceData, currentInvoiceId, onSaveComplete }) => {
  const [invoiceName, setInvoiceName] = useState(
    invoiceData.clientName
      ? `Invoice for ${invoiceData.clientName} - ${new Date().toLocaleDateString()}`
      : `Invoice - ${new Date().toLocaleDateString()}`
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
    setInvoiceName(
      invoiceData.clientName
        ? `Invoice for ${invoiceData.clientName} - ${new Date().toLocaleDateString()}`
        : `Invoice - ${new Date().toLocaleDateString()}`
    );
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!invoiceName.trim()) {
      setError('Please enter a name for the invoice');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let id;
      if (currentInvoiceId) {
        // Update existing invoice
        updateInvoice(currentInvoiceId, invoiceData, invoiceName);
        id = currentInvoiceId;
      } else {
        // Save new invoice
        id = saveInvoice(invoiceData, invoiceName);
      }

      // Store the ID of the last edited invoice
      localStorage.setItem('last_edited_invoice', id);

      setIsSaving(false);
      closeModal();

      if (onSaveComplete) {
        onSaveComplete(id);
      }
    } catch (err) {
      setError('Failed to save invoice. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <>
      <button className="save-invoice-btn" onClick={openModal}>
        {currentInvoiceId ? 'Save Changes' : 'Save Invoice'}
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{currentInvoiceId ? 'Update Invoice' : 'Save Invoice'}</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="invoiceName">Invoice Name</label>
                <input
                  type="text"
                  id="invoiceName"
                  value={invoiceName}
                  onChange={(e) => setInvoiceName(e.target.value)}
                  placeholder="Enter a name for this invoice"
                />
                {error && <div className="error-message">{error}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : currentInvoiceId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveInvoice;
