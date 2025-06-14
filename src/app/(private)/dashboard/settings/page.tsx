'use client';

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateBinance, updatePagomovil } from '../../actions/settings';
import { banks } from '@/utils/orders';
import { useBinanceInfo, usePagomovilInfo } from '@/utils/pagmovil';

interface FormData {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
}

interface BinanceFormData {
  email: string;
}

interface FormErrors {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
  email: string;
}

interface Notification {
  type: 'success' | 'error';
  title: string;
  message: string;
  visible: boolean;
}

type Tab = 'pagomovil' | 'binance';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pagomovil');
  const {
    pagomovilInfo,
    loading: pagomovilLoading,
    error: pagomovilError,
    refetch: refetchPagomovil,
  } = usePagomovilInfo();
  const {
    binanceInfo,
    loading: binanceLoading,
    error: binanceError,
    refetch: refetchBinance,
  } = useBinanceInfo();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    bank: '',
    identificationNumber: '',
    holderName: '',
  });
  const [binanceFormData, setBinanceFormData] = useState<BinanceFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    phoneNumber: '',
    bank: '',
    identificationNumber: '',
    holderName: '',
    email: '',
  });
  const [notification, setNotification] = useState<Notification>({
    type: 'success',
    title: '',
    message: '',
    visible: false,
  });

  const router = useRouter();

  // Update form data when pagomovilInfo changes
  useEffect(() => {
    if (pagomovilInfo) {
      let bankCode = pagomovilInfo.bank || '';
      if (bankCode.includes(' - ')) {
        bankCode = bankCode.split(' - ')[0];
      }

      setFormData({
        phoneNumber: pagomovilInfo.phoneNumber || '',
        bank: bankCode,
        identificationNumber: pagomovilInfo.identificationNumber || '',
        holderName: pagomovilInfo.holderName || '',
      });
    }
  }, [pagomovilInfo]);

  // Update binance form data when binanceInfo changes
  useEffect(() => {
    if (binanceInfo) {
      setBinanceFormData({
        email: binanceInfo.email || '',
      });
    }
  }, [binanceInfo]);

  // Show error notifications
  useEffect(() => {
    if (pagomovilError) {
      showNotification('error', 'Loading Error', pagomovilError);
    }
    if (binanceError) {
      showNotification('error', 'Loading Error', binanceError);
    }
  }, [pagomovilError, binanceError]);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      visible: true,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  const validateForm = (): boolean => {
    if (activeTab === 'pagomovil') {
      return validatePagomovilForm();
    } else {
      return validateBinanceForm();
    }
  };

  const validatePagomovilForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      phoneNumber: '',
      bank: '',
      identificationNumber: '',
      holderName: '',
      email: '',
    };

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Only numbers are allowed';
      isValid = false;
    } else if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 15) {
      newErrors.phoneNumber = 'Phone number must be between 10 and 15 digits';
      isValid = false;
    }

    if (!formData.bank) {
      newErrors.bank = 'You must select a bank';
      isValid = false;
    }

    if (!formData.identificationNumber) {
      newErrors.identificationNumber = 'Identification number is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.identificationNumber)) {
      newErrors.identificationNumber = 'Only numbers are allowed';
      isValid = false;
    } else if (
      formData.identificationNumber.length < 6 ||
      formData.identificationNumber.length > 12
    ) {
      newErrors.identificationNumber = 'Identification number must be between 6 and 12 digits';
      isValid = false;
    }

    if (!formData.holderName) {
      newErrors.holderName = 'Account holder name is required';
      isValid = false;
    } else if (formData.holderName.length < 3) {
      newErrors.holderName = 'Name must have at least 3 characters';
      isValid = false;
    } else if (formData.holderName.length > 100) {
      newErrors.holderName = 'Name must not exceed 100 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateBinanceForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      phoneNumber: '',
      bank: '',
      identificationNumber: '',
      holderName: '',
      email: '',
    };

    if (!binanceFormData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(binanceFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeTab === 'pagomovil') {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setBinanceFormData({
        ...binanceFormData,
        [name]: value,
      });
    }
  };

  const handleBankChange = (value: string) => {
    setFormData({
      ...formData,
      bank: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'pagomovil') {
        await updatePagomovil(formData);
        showNotification(
          'success',
          'Settings Updated',
          'Your Pagomovil payment information has been successfully updated.'
        );
        await refetchPagomovil();
      } else {
        await updateBinance(binanceFormData);
        showNotification(
          'success',
          'Settings Updated',
          'Your Binance payment information has been successfully updated.'
        );
        await refetchBinance();
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification(
        'error',
        'Error',
        'An error occurred while updating your payment information.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 dark:bg-gray-900">
      <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Settings</h1>
      </div>

      {notification.visible && (
        <div
          className={`mb-6 rounded-md border p-4 ${
            notification.type === 'success'
              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          }`}
        >
          <div
            className={`font-medium ${
              notification.type === 'success'
                ? 'text-blue-800 dark:text-blue-300'
                : 'text-red-800 dark:text-red-300'
            }`}
          >
            {notification.title}
          </div>
          <div
            className={`text-sm ${
              notification.type === 'success'
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pagomovil')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'pagomovil'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Pagomovil
          </button>
          <button
            onClick={() => setActiveTab('binance')}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
              activeTab === 'binance'
                ? 'border-yellow-500 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Binance
          </button>
        </nav>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {activeTab === 'pagomovil' ? 'Pagomovil' : 'Binance'} Payment Details
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'pagomovil'
              ? 'Configure your Pagomovil account information to receive payments.'
              : 'Configure your Binance account information to receive payments.'}
          </p>
        </div>

        {/* Loading overlay */}
        {(activeTab === 'pagomovil' ? pagomovilLoading : binanceLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
          </div>
        )}

        <div className="relative p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'pagomovil' ? (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="04121234567"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.phoneNumber}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the phone number associated with your Pagomovil account.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bank"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Bank
                  </label>
                  <div className="relative">
                    <select
                      id="bank"
                      value={formData.bank}
                      onChange={(e) => handleBankChange(e.target.value)}
                      className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                    >
                      <option value="" disabled>
                        Select a bank
                      </option>
                      {banks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.code} - {bank.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg
                        className="h-4 w-4 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.bank && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.bank}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select the bank where you have your Pagomovil account.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="identificationNumber"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Identification Number
                  </label>
                  <input
                    id="identificationNumber"
                    name="identificationNumber"
                    placeholder="12345678"
                    value={formData.identificationNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                  />
                  {errors.identificationNumber && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {errors.identificationNumber}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your ID number or RIF without dots or dashes.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="holderName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Account Holder Name
                  </label>
                  <input
                    id="holderName"
                    name="holderName"
                    placeholder="John Doe"
                    value={formData.holderName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                  />
                  {errors.holderName && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.holderName}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {`Enter the full name of the account holder's name.`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Binance Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={binanceFormData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-yellow-500"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400">{errors.email}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the email associated with your Binance account.
                  </p>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
                    Important Note:
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {`Customers will send payments to this Binance email address. Make sure it's
                    correct and that you have access to this account.`}
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={
                isLoading || (activeTab === 'pagomovil' ? pagomovilLoading : binanceLoading)
              }
              className={`w-full rounded-md px-4 py-2 font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-gray-800 ${
                activeTab === 'pagomovil'
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'
                  : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-800'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
