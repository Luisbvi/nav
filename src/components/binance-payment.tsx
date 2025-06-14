'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, ExternalLink, Smartphone, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

interface BinancePaymentProps {
  binanceData: {
    checkoutUrl: string;
    qrcodeLink: string;
    qrContent: string;
    deeplink: string;
    universalUrl: string;
    prepayId: string;
    expireTime: number;
  };
  orderId: string;
  total: number;
  onPaymentComplete: () => void;
}

export default function BinancePayment({
  binanceData,
  orderId,
  total,
  onPaymentComplete,
}: BinancePaymentProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = binanceData.expireTime - now;

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [binanceData.expireTime]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const checkPaymentStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/check-binance-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prepayId: binanceData.prepayId,
          orderId: orderId,
        }),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.orderStatus === 'PAID') {
        setPaymentStatus('completed');
        onPaymentComplete();
      } else if (data.orderStatus === 'EXPIRED' || data.orderStatus === 'CANCELLED') {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const openBinanceApp = () => {
    // Intentar abrir la app de Binance
    window.location.href = binanceData.deeplink;

    // Fallback a la URL universal después de un breve delay
    setTimeout(() => {
      window.open(binanceData.universalUrl, '_blank');
    }, 1500);
  };

  if (paymentStatus === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center"
      >
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold text-green-600">{t('payment_successful')}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t('payment_confirmed')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <img
              src="/binance-logo.png"
              alt="Binance"
              className="h-6 w-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            Binance Pay
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('total')}: <span className="font-bold">${total.toFixed(2)} USDT</span>
          </p>
        </CardHeader>
      </Card>

      {/* Timer */}
      {!isExpired && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-center">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('expires_in')}:</span>
              <Badge variant="outline" className="font-mono">
                {formatTime(timeLeft)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-4 shadow-inner">
                <img
                  src={binanceData.qrcodeLink}
                  alt="Binance Pay QR Code"
                  className="mx-auto h-48 w-48"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" font-family="Arial" font-size="12" text-anchor="middle" fill="%236b7280">QR Code</text></svg>`;
                  }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('scan_qr_with_binance')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Open Binance App */}
        <Button
          onClick={openBinanceApp}
          className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
          disabled={isExpired}
        >
          <Smartphone className="mr-2 h-4 w-4" />
          {t('open_binance_app')}
        </Button>

        {/* Web Checkout */}
        <Button
          onClick={() => window.open(binanceData.checkoutUrl, '_blank')}
          variant="outline"
          className="w-full"
          disabled={isExpired}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {t('pay_on_web')}
        </Button>

        {/* Check Payment Status */}
        <Button
          onClick={checkPaymentStatus}
          variant="secondary"
          className="w-full"
          disabled={isChecking || isExpired}
        >
          {isChecking ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t('checking')}...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              {t('check_payment_status')}
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              {t('payment_instructions')}:
            </h4>
            <ol className="list-inside list-decimal space-y-1 text-blue-800 dark:text-blue-200">
              <li>{t('open_binance_app_instruction')}</li>
              <li>{t('scan_qr_or_click_button')}</li>
              <li>{t('confirm_payment_in_app')}</li>
              <li>{t('wait_for_confirmation')}</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Expired State */}
      {isExpired && (
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6 text-center">
            <p className="font-medium text-red-600 dark:text-red-400">{t('payment_expired')}</p>
            <p className="mt-1 text-sm text-red-500 dark:text-red-300">
              {t('please_create_new_order')}
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
