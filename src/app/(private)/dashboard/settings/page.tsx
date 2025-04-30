'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updatePagomovil } from '../../actions/settings';
import { banks } from '@/utils/orders';

interface FormData {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
}

interface FormErrors {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
}

interface Notification {
  type: 'success' | 'error';
  title: string;
  message: string;
  visible: boolean;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    bank: '',
    identificationNumber: '',
    holderName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    phoneNumber: '',
    bank: '',
    identificationNumber: '',
    holderName: '',
  });
  const [notification, setNotification] = useState<Notification>({
    type: 'success',
    title: '',
    message: '',
    visible: false,
  });

  const router = useRouter();

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      visible: true,
    });

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {
      phoneNumber: '',
      bank: '',
      identificationNumber: '',
      holderName: '',
    };

    // Validate phone number
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

    // Validate bank
    if (!formData.bank) {
      newErrors.bank = 'You must select a bank';
      isValid = false;
    }

    // Validate identification number
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

    // Validate holder name
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
      await updatePagomovil(formData);
      showNotification(
        'success',
        'Settings Updated',
        'Your Pagomovil payment information has been successfully updated.'
      );
      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification(
        'error',
        'Error',
        'An error occurred while updating your Pagomovil information.'
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

      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Pagomovil Payment Details
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure your Pagomovil account information to receive payments.
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                Enter the full name of the account holder.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-offset-gray-800"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
