import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Types
type Lang = "en" | "ru" | "fr";
type Namespace = 'common' | 'settings' | 'auth'; // Ajoutez d'autres namespaces au besoin
type Dictionary = Record<string, string>;
type NamespacedDictionary = Record<Namespace, Dictionary>;

// Import des traductions via glob pour une résolution sûre en dev et prod
const localeModules = import.meta.glob('../locales/*/*.ts', { eager: true });

const loadTranslations = async (lang: Lang, ns: Namespace): Promise<Dictionary> => {
  // Chemins possibles, ex: ../locales/en/common.ts
  const candidatePath = `../locales/${lang}/${ns}.ts`;
  const mod = localeModules[candidatePath] as { default?: Dictionary } | undefined;
  if (mod && typeof (mod as any).default === 'object') {
    return (mod as any).default as Dictionary;
  }
  // Si non trouvé, retourner dictionnaire vide (évite crash et écran blanc)
  console.warn(`Translations not found for ${lang}/${ns}, falling back to empty dictionary.`);
  return {};
};

// Dictionnaire initial vide
const initialDict: NamespacedDictionary = {
  common: {},
  settings: {},
  auth: {}
};

interface I18nContextType {
  lang: Lang;
  t: (key: string, defaultValue?: string, ns?: Namespace) => string;
  setLang: (lang: Lang) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode; initialLang?: Lang }> = ({ 
  children, 
  initialLang 
}) => {
  const [lang, setLangState] = useState<Lang>(
    (initialLang || (localStorage.getItem("lang") as Lang) || "en")
  );
  const [dictionary, setDictionary] = useState<NamespacedDictionary>(initialDict);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les traductions
  useEffect(() => {
    const loadAllTranslations = async () => {
      setIsLoading(true);
      try {
        const namespaces: Namespace[] = ['common', 'settings', 'auth'];
        const loadedDict = { ...initialDict };
        
        for (const ns of namespaces) {
          loadedDict[ns] = await loadTranslations(lang, ns);
        }
        
        setDictionary(loadedDict);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTranslations();
  }, [lang]);

  const setLang = (newLang: Lang) => {
    if (newLang !== lang) {
      setLangState(newLang);
      localStorage.setItem("lang", newLang);
      try {
        document.documentElement.lang = newLang;
      } catch {}
    }
  };

  const t = useMemo(() => {
    return (key: string, defaultValue?: string, ns: Namespace = 'common'): string => {
      // Si le deuxième paramètre est un namespace (rétrocompatibilité)
      if (ns && ['common', 'settings', 'auth'].includes(defaultValue as string)) {
        ns = defaultValue as Namespace;
        defaultValue = undefined;
      }

      // Vérifier si le namespace existe
      if (!dictionary[ns]) {
        console.warn(`Namespace "${ns}" not found in dictionary`);
        return defaultValue || key;
      }

      // Obtenir la traduction ou retourner la clé si non trouvée
      const translation = dictionary[ns][key];
      if (!translation) {
        console.warn(`Translation key "${key}" not found in namespace "${ns}"`);
        return defaultValue || key;
      }

      return translation;
    };
  }, [dictionary, isLoading]);

  const value = useMemo(
    () => ({ lang, t, setLang, isLoading }),
    [lang, t, isLoading]
  );

  return (
    <I18nContext.Provider value={value}>
      {!isLoading ? children : <div>Loading translations...</div>}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

// Helper pour typer les clés de traduction
type NestedKeyOf<ObjectType> = {
  [Key in keyof ObjectType]: ObjectType[Key] extends Record<string, unknown>
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : Key;
}[keyof ObjectType];

type TranslationKey = NestedKeyOf<typeof import('../locales/en/common')['default']>;

export const useTranslation = (ns?: Namespace) => {
  const { t: translate, ...rest } = useI18n();
  
  const t = (key: string | TranslationKey, defaultValue?: string) => {
    if (defaultValue !== undefined) {
      return translate(key as string, defaultValue, ns);
    }
    return translate(key as string, ns);
  };
  
  return { t, ...rest };
};










