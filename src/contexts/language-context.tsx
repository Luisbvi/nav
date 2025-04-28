'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

// Define available languages
export type Language = 'en' | 'es' | 'fr' | 'zh' | 'ru' | 'hi' | 'fil';

// Define language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
  isLoading: false,
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

// Simple translations for initial rendering
const defaultTranslations: Record<string, Record<Language, string>> = {
  // Add some basic translations for common elements
  order: {
    en: 'Order',
    es: 'Pedido',
    fr: 'Commande',
    zh: '订单',
    ru: 'Заказ',
    hi: 'आदेश',
    fil: 'Order',
  },
  back_to_orders: {
    en: 'Back to Orders',
    es: 'Volver a Pedidos',
    fr: 'Retour aux Commandes',
    zh: '返回订单列表',
    ru: 'Назад к заказам',
    hi: 'आदेशों पर वापस जाएं',
    fil: 'Bumalik sa Mga Order',
  },
};

// Provider component
export function LanguageProvider({
  children,
  user,
  initialLanguage = 'en',
}: {
  children: ReactNode;
  user?: User | null;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [translations, setTranslations] =
    useState<Record<string, Record<Language, string>>>(defaultTranslations);
  const [isLoading, setIsLoading] = useState(false);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);

        // Fetch translations from your API or static file
        const response = await fetch('/api/translations');
        if (response.ok) {
          const data = await response.json();
          setTranslations((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, []);

  // Load user's language preference from database
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching language preference:', error);
          return;
        }

        if (data && data.preferred_language) {
          setLanguageState(data.preferred_language as Language);
        }
      } catch (error) {
        console.error('Failed to load user language preference:', error);
      }
    };

    // Check localStorage first
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && ['en', 'es', 'fr', 'zh'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }

    // Then check database for authenticated users
    if (user) {
      loadUserLanguage();
    }
  }, [user]);

  // Function to change language and save preference
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

    // Save to localStorage for all users
    localStorage.setItem('language', lang);

    // Save to database for authenticated users
    if (user) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('user_profiles')
          .update({
            preferred_language: lang,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select();

        if (error) {
          console.error('Error saving language preference:', error);
        }
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Get the translation string
    let translation = translations[key]?.[language] || translations[key]?.['en'];

    // If there are parameters, replace them in the translation string
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), value.toString());
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}
