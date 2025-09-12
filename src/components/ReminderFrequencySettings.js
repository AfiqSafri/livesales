"use client";
import { useState, useEffect } from 'react';
import { useSellerLanguage } from '../app/seller/SellerLanguageContext';

export default function ReminderFrequencySettings({ seller }) {
  const { language } = useSellerLanguage() || { language: 'en' };
  const [reminderFrequency, setReminderFrequency] = useState('30s');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const translations = {
    en: {
      title: 'Email Notification Settings',
      description: 'Choose your email reminder frequency for pending receipts',
      frequency30s: 'Every 30 seconds',
      frequency30m: 'Every 30 minutes', 
      frequency1h: 'Every 1 hour',
      frequencyOff: 'No Email Notifications',
      currentSetting: 'Current setting:',
      changeSetting: 'Change setting',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully!',
      errorSaving: 'Error saving settings. Please try again.'
    },
    ms: {
      title: 'Tetapan Pemberitahuan Email',
      description: 'Pilih kekerapan pemberitahuan email untuk resit yang tertunggak',
      frequency30s: 'Setiap 30 saat',
      frequency30m: 'Setiap 30 minit',
      frequency1h: 'Setiap 1 jam',
      frequencyOff: 'Tiada Pemberitahuan Email',
      currentSetting: 'Tetapan semasa:',
      changeSetting: 'Tukar tetapan',
      saveSettings: 'Simpan Tetapan',
      settingsSaved: 'Tetapan berjaya disimpan!',
      errorSaving: 'Ralat menyimpan tetapan. Sila cuba lagi.'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (seller?.reminderFrequency) {
      setReminderFrequency(seller.reminderFrequency);
    }
  }, [seller?.reminderFrequency]);


  const getFrequencyDescription = (freq) => {
    switch (freq) {
      case '30s': return 'Immediate notifications for urgent receipts';
      case '30m': return 'Regular check-ins without overwhelming your inbox';
      case '1h': return 'Periodic reminders for less urgent situations';
      case 'off': return 'No email reminders for pending receipts';
      default: return '';
    }
  };

  const getFrequencyLabel = (freq) => {
    switch (freq) {
      case '30s': return t.frequency30s;
      case '30m': return t.frequency30m;
      case '1h': return t.frequency1h;
      case 'off': return t.frequencyOff;
      default: return t.frequency30s;
    }
  };

  const getFrequencyBadge = (freq) => {
    switch (freq) {
      case '30s': return { text: 'Urgent', color: 'bg-red-100 text-red-800' };
      case '30m': return { text: 'Balanced', color: 'bg-yellow-100 text-yellow-800' };
      case '1h': return { text: 'Relaxed', color: 'bg-green-100 text-green-800' };
      case 'off': return { text: 'Disabled', color: 'bg-gray-100 text-gray-800' };
      default: return { text: 'Urgent', color: 'bg-red-100 text-red-800' };
    }
  };

  const handleFrequencyChange = async (freq) => {
    setReminderFrequency(freq);
    setIsDropdownOpen(false);
    
    // Auto-save when frequency changes
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/user/reminder-frequency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: seller.id,
          reminderFrequency: freq,
        }),
      });

      if (response.ok) {
        setMessage(t.settingsSaved);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || t.errorSaving);
      }
    } catch (error) {
      console.error('Error saving reminder frequency:', error);
      setMessage(t.errorSaving);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t.title}</h3>
        <p className="text-sm text-gray-600">{t.description}</p>
      </div>

      {/* Current Setting Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{t.currentSetting}</p>
            <p className="text-sm text-gray-600 mt-1">{getFrequencyDescription(reminderFrequency)}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyBadge(reminderFrequency).color}`}>
              {getFrequencyBadge(reminderFrequency).text}
            </span>
            <button
              onClick={() => !loading && setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
              className={`text-sm font-medium transition-colors duration-200 ${
                loading 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {loading ? 'Saving...' : t.changeSetting}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Options */}
      {isDropdownOpen && (
        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
          {/* 30 Seconds Option */}
          <div 
            className={`p-4 transition-colors duration-200 ${
              loading 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
            } ${
              reminderFrequency === '30s' 
                ? 'bg-blue-50 border-l-4 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => !loading && handleFrequencyChange('30s')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t.frequency30s}</p>
                <p className="text-xs text-gray-500 mt-1">{getFrequencyDescription('30s')}</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Urgent
              </span>
            </div>
          </div>

          {/* 30 Minutes Option */}
          <div 
            className={`p-4 transition-colors duration-200 ${
              loading 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
            } ${
              reminderFrequency === '30m' 
                ? 'bg-blue-50 border-l-4 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => !loading && handleFrequencyChange('30m')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t.frequency30m}</p>
                <p className="text-xs text-gray-500 mt-1">{getFrequencyDescription('30m')}</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Balanced
              </span>
            </div>
          </div>

          {/* 1 Hour Option */}
          <div 
            className={`p-4 transition-colors duration-200 ${
              loading 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
            } ${
              reminderFrequency === '1h' 
                ? 'bg-blue-50 border-l-4 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => !loading && handleFrequencyChange('1h')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t.frequency1h}</p>
                <p className="text-xs text-gray-500 mt-1">{getFrequencyDescription('1h')}</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Relaxed
              </span>
            </div>
          </div>

          {/* No Email Notifications Option */}
          <div 
            className={`p-4 transition-colors duration-200 ${
              loading 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer'
            } ${
              reminderFrequency === 'off' 
                ? 'bg-blue-50 border-l-4 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => !loading && handleFrequencyChange('off')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{t.frequencyOff}</p>
                <p className="text-xs text-gray-500 mt-1">{getFrequencyDescription('off')}</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Disabled
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message === t.settingsSaved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}