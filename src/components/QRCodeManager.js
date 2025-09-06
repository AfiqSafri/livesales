"use client";
import { useState, useRef } from 'react';
import { useSellerLanguage } from '../app/seller/SellerLanguageContext';

export default function QRCodeManager({ seller, onUpdate }) {
  const { language } = useSellerLanguage() || { language: 'en' };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [description, setDescription] = useState(seller?.qrCodeDescription || '');
  const fileInputRef = useRef(null);

  const translations = {
    en: {
      title: 'QR Code Payment Setup',
      description: 'Upload a QR code image for buyers to scan and make payments',
      currentQR: 'Current QR Code',
      uploadQR: 'Upload QR Code',
      updateQR: 'Update QR Code',
      removeQR: 'Remove QR Code',
      descriptionLabel: 'Payment Description',
      descriptionPlaceholder: 'Enter payment instructions for buyers...',
      uploadSuccess: 'QR code uploaded successfully!',
      uploadError: 'Failed to upload QR code',
      removeSuccess: 'QR code removed successfully!',
      removeError: 'Failed to remove QR code',
      confirmRemove: 'Are you sure you want to remove the QR code?',
      noQRCode: 'No QR code uploaded yet',
      uploadNew: 'Upload New QR Code'
    },
    ms: {
      title: 'Penyediaan Pembayaran Kod QR',
      description: 'Muat naik imej kod QR untuk pembeli mengimbas dan membuat pembayaran',
      currentQR: 'Kod QR Semasa',
      uploadQR: 'Muat Naik Kod QR',
      updateQR: 'Kemas Kini Kod QR',
      removeQR: 'Buang Kod QR',
      descriptionLabel: 'Penerangan Pembayaran',
      descriptionPlaceholder: 'Masukkan arahan pembayaran untuk pembeli...',
      uploadSuccess: 'Kod QR berjaya dimuat naik!',
      uploadError: 'Gagal memuat naik kod QR',
      removeSuccess: 'Kod QR berjaya dibuang!',
      removeError: 'Gagal membuang kod QR',
      confirmRemove: 'Adakah anda pasti mahu membuang kod QR?',
      noQRCode: 'Tiada kod QR dimuat naik lagi',
      uploadNew: 'Muat Naik Kod QR Baru'
    }
  };

  const t = translations[language];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('qrCode', file);
      formData.append('sellerId', seller.id);
      formData.append('description', description);

      const response = await fetch('/api/seller/qr-code', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage(t.uploadSuccess);
        setShowUpload(false);
        if (onUpdate) {
          onUpdate(data);
        }
      } else {
        setMessage(data.error || t.uploadError);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(t.uploadError);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQR = async () => {
    if (!confirm(t.confirmRemove)) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/seller/qr-code?sellerId=${seller.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage(t.removeSuccess);
        if (onUpdate) {
          onUpdate({ qrCodeImage: null, qrCodeDescription: null });
        }
      } else {
        setMessage(data.error || t.removeError);
      }
    } catch (error) {
      console.error('Remove error:', error);
      setMessage(t.removeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{t.description}</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {seller?.qrCodeImage ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.currentQR}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <img
                src={seller.qrCodeImage}
                alt="QR Code"
                className="mx-auto max-w-xs max-h-64 object-contain"
                onError={(e) => {
                  console.error('QR code image failed to load:', e);
                  e.target.style.display = 'none';
                }}
              />
              {seller.qrCodeDescription && (
                <p className="text-sm text-gray-600 mt-2">
                  {seller.qrCodeDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t.updateQR}
            </button>
            <button
              onClick={handleRemoveQR}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {t.removeQR}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">{t.noQRCode}</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.uploadQR}
          </button>
        </div>
      )}

      {showUpload && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">{t.uploadNew}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.descriptionLabel}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Select QR Code Image'}
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
