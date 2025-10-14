"use client";
import { useState, useEffect } from 'react';
import { useSellerLanguage } from '../app/seller/SellerLanguageContext';
import { downloadImage, isMobileDevice, saveImageToPhotos } from '@/utils/mobileDownload';

export default function ReceiptManager({ seller }) {
  const { language } = useSellerLanguage() || { language: 'en' };
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sellerNotes, setSellerNotes] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const receiptsPerPage = 10;

  const translations = {
    en: {
      title: 'Payment Receipts',
      description: 'Review and approve/reject payment receipts from buyers',
      noReceipts: 'No receipts pending review',
      viewReceipt: 'View Receipt',
      approve: 'Approve',
      reject: 'Reject',
      buyer: 'Buyer',
      product: 'Product',
      amount: 'Amount',
      uploadedAt: 'Uploaded',
      status: 'Status',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      approvePayment: 'Approve Payment',
      rejectPayment: 'Reject Payment',
      notes: 'Notes (Optional)',
      notesPlaceholder: 'Add any notes for the buyer...',
      confirmApprove: 'Are you sure you want to approve this payment?',
      confirmReject: 'Are you sure you want to reject this payment?',
      approveSuccess: 'Payment approved successfully!',
      rejectSuccess: 'Payment rejected successfully!',
      approveError: 'Failed to approve payment',
      rejectError: 'Failed to reject payment',
      close: 'Close',
      showing: 'Showing',
      of: 'of',
      results: 'results',
      previous: 'Previous',
      next: 'Next',
      page: 'Page'
    },
    ms: {
      title: 'Resit Pembayaran',
      description: 'Semak dan lulus/tolak resit pembayaran dari pembeli',
      noReceipts: 'Tiada resit menunggu semakan',
      viewReceipt: 'Lihat Resit',
      approve: 'Lulus',
      reject: 'Tolak',
      buyer: 'Pembeli',
      product: 'Produk',
      amount: 'Jumlah',
      uploadedAt: 'Dimuat Naik',
      status: 'Status',
      pending: 'Menunggu',
      approved: 'Diluluskan',
      rejected: 'Ditolak',
      approvePayment: 'Lulus Pembayaran',
      rejectPayment: 'Tolak Pembayaran',
      notes: 'Nota (Pilihan)',
      notesPlaceholder: 'Tambah nota untuk pembeli...',
      confirmApprove: 'Adakah anda pasti mahu meluluskan pembayaran ini?',
      confirmReject: 'Adakah anda pasti mahu menolak pembayaran ini?',
      approveSuccess: 'Pembayaran berjaya diluluskan!',
      rejectSuccess: 'Pembayaran berjaya ditolak!',
      approveError: 'Gagal meluluskan pembayaran',
      rejectError: 'Gagal menolak pembayaran',
      close: 'Tutup',
      showing: 'Menunjukkan',
      of: 'daripada',
      results: 'hasil',
      previous: 'Sebelum',
      next: 'Seterusnya',
      page: 'Halaman'
    }
  };

  const t = translations[language];

  useEffect(() => {
    console.log('ReceiptManager: seller prop received:', seller);
    if (seller?.id) {
      console.log('ReceiptManager: Fetching receipts for seller ID:', seller.id);
      fetchReceipts();
    } else {
      console.log('ReceiptManager: No seller ID, not fetching receipts');
    }
  }, [seller?.id]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      console.log('ReceiptManager: Fetching receipts from API...');
      const response = await fetch(`/api/receipt/approve?sellerId=${seller.id}`);
      console.log('ReceiptManager: API response status:', response.status);
      
      const data = await response.json();
      console.log('ReceiptManager: API response data:', data);

      if (data.success) {
        console.log('ReceiptManager: Successfully fetched receipts:', data.receipts?.length || 0);
        setReceipts(data.receipts || []);
      } else {
        console.log('ReceiptManager: API error:', data.error);
        setMessage(data.error || 'Failed to fetch receipts');
      }
    } catch (error) {
      console.error('ReceiptManager: Fetch receipts error:', error);
      setMessage('Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReceipt) return;

    console.log('ReceiptManager: Approve button clicked for receipt:', selectedReceipt.id);
    if (!confirm(t.confirmApprove)) return;

    setActionLoading(true);
    setMessage('');

    try {
      console.log('ReceiptManager: Sending approve request...');
      const response = await fetch('/api/receipt/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedReceipt.id,
          action: 'approved',
          sellerNotes: sellerNotes
        })
      });

      console.log('ReceiptManager: Approve response status:', response.status);
      const data = await response.json();
      console.log('ReceiptManager: Approve response data:', data);

      if (data.success) {
        setMessage(t.approveSuccess);
        setShowModal(false);
        setSellerNotes('');
        fetchReceipts(); // Refresh the list
      } else {
        setMessage(data.error || t.approveError);
      }
    } catch (error) {
      console.error('ReceiptManager: Approve error:', error);
      setMessage(t.approveError);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt) return;

    console.log('ReceiptManager: Reject button clicked for receipt:', selectedReceipt.id);
    if (!confirm(t.confirmReject)) return;

    setActionLoading(true);
    setMessage('');

    try {
      console.log('ReceiptManager: Sending reject request...');
      const response = await fetch('/api/receipt/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptId: selectedReceipt.id,
          action: 'rejected',
          sellerNotes: sellerNotes
        })
      });

      console.log('ReceiptManager: Reject response status:', response.status);
      const data = await response.json();
      console.log('ReceiptManager: Reject response data:', data);

      if (data.success) {
        setMessage(t.rejectSuccess);
        setShowModal(false);
        setSellerNotes('');
        fetchReceipts(); // Refresh the list
      } else {
        setMessage(data.error || t.rejectError);
      }
    } catch (error) {
      console.error('ReceiptManager: Reject error:', error);
      setMessage(t.rejectError);
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (receipt) => {
    console.log('ReceiptManager: Opening modal for receipt:', receipt);
    console.log('ReceiptManager: Receipt status:', receipt.status);
    console.log('ReceiptManager: Receipt can be approved/rejected:', receipt.status === 'pending');
    setSelectedReceipt(receipt);
    setSellerNotes('');
    setShowModal(true);
  };

  // Auto-download receipt image on mobile when modal opens
  useEffect(() => {
    if (showModal && selectedReceipt?.receiptImage && isMobileDevice()) {
      handleDownloadReceipt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, selectedReceipt?.receiptImage]);

  const handleDownloadReceipt = async () => {
    if (!selectedReceipt?.receiptImage || isDownloading) return;
    setIsDownloading(true);
    setDownloadMessage('');
    const filename = `receipt-${selectedReceipt.id}.jpg`;
    try {
      await saveImageToPhotos(selectedReceipt.receiptImage, filename, {
        onSuccess: (msg) => {
          setDownloadMessage(msg);
          setTimeout(() => setDownloadMessage(''), 5000);
        },
        onError: (err) => {
          setDownloadMessage(err);
          setTimeout(() => setDownloadMessage(''), 5000);
        },
        showInstructions: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return t.pending;
      case 'approved': return t.approved;
      case 'rejected': return t.rejected;
      default: return status;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(receipts.length / receiptsPerPage);
  const startIndex = (currentPage - 1) * receiptsPerPage;
  const endIndex = startIndex + receiptsPerPage;
  const currentReceipts = receipts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when receipts change
  useEffect(() => {
    setCurrentPage(1);
  }, [receipts.length]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{t.description}</p>
          {receipts.filter(r => r.status === 'pending').length > 0 && (
            <div className="mt-2 flex items-center text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded-md">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <span className="font-medium">
                {receipts.filter(r => r.status === 'pending').length} pending receipt(s) require your attention
              </span>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {receipts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-500">{t.noReceipts}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.buyer}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.product}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.uploadedAt}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentReceipts.map((receipt) => (
                <tr key={receipt.id} className={`${receipt.status === 'pending' ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''} hover:bg-gray-50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.order ? receipt.order.buyerName : (receipt.buyerName || receipt.buyer?.name || `Buyer ID: ${receipt.buyerId}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.order ? receipt.order.product.name : (receipt.productName || 'QR Payment')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {receipt.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(receipt.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receipt.status)}`}>
                        {getStatusText(receipt.status)}
                      </span>
                      {receipt.status === 'pending' && (
                        <div className="ml-2 flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="ml-1 text-xs text-yellow-600 font-medium">NEW</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(receipt)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      {t.viewReceipt}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {receipts.length > receiptsPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t.showing} {startIndex + 1} {t.of} {Math.min(endIndex, receipts.length)} {t.of} {receipts.length} {t.results}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.previous}
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  const shouldShow = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  if (!shouldShow) {
                    // Show ellipsis for gaps
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'text-white bg-blue-600'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.next}
              </button>
            </div>
          </div>
        )}
      </>
      )}

      {/* Receipt Review Modal */}
      {showModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Review Payment Receipt</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Receipt Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Buyer</label>
                    <p className="text-sm text-gray-900">
                      {selectedReceipt.order ? selectedReceipt.order.buyerName : (selectedReceipt.buyerName || selectedReceipt.buyer?.name || `Buyer ID: ${selectedReceipt.buyerId}`)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <p className="text-sm text-gray-900">
                      {selectedReceipt.order ? selectedReceipt.order.product.name : (selectedReceipt.productName || 'QR Payment')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm text-gray-900">RM {selectedReceipt.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {selectedReceipt.order ? 'Order ID' : 'Receipt ID'}
                    </label>
                    <p className="text-sm text-gray-900">
                      #{selectedReceipt.order ? selectedReceipt.orderId : selectedReceipt.id}
                    </p>
                  </div>
                  {!selectedReceipt.order && selectedReceipt.paymentType === 'qr_payment' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <p className="text-sm text-gray-900">{selectedReceipt.quantity || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Buyer Email</label>
                        <p className="text-sm text-gray-900">{selectedReceipt.buyerEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Buyer Phone</label>
                        <p className="text-sm text-gray-900">{selectedReceipt.buyerPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                        <p className="text-sm text-gray-900">{selectedReceipt.shippingAddress || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Receipt Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {selectedReceipt.receiptImage ? (
                      <>
                        <img
                          src={selectedReceipt.receiptImage}
                          alt="Payment Receipt"
                          className="mx-auto max-w-full max-h-96 object-contain"
                          onLoad={() => console.log('Receipt image loaded successfully')}
                          onError={(e) => {
                            console.error('Failed to load receipt image:', e);
                            e.target.style.display = 'none';
                            // Show error message
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-red-600 text-sm mt-2';
                            errorDiv.textContent = 'Failed to load receipt image';
                            e.target.parentNode.appendChild(errorDiv);
                          }}
                        />
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            onClick={handleDownloadReceipt}
                            disabled={isDownloading}
                            className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isDownloading ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                        {downloadMessage && (
                          <div className="mt-2 text-sm text-green-700 bg-green-100 border border-green-200 px-3 py-2 rounded-md">
                            {downloadMessage}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">No receipt image available</div>
                    )}
                  </div>
                </div>

                {/* Seller Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.notes}
                  </label>
                  <textarea
                    value={sellerNotes}
                    onChange={(e) => setSellerNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading || selectedReceipt.status !== 'pending'}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : t.approvePayment}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || selectedReceipt.status !== 'pending'}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : t.rejectPayment}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
