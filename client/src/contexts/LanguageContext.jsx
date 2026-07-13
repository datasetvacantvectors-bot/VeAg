import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const LANGUAGE_KEY = "veag_language";

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      return saved || "en";
    } catch (error) {
      // console.error('Error reading language preference:', error);
      return "en";
    }
  });

  // Save language preference to localStorage
  const changeLanguage = (lang) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
      setLanguage(lang);
    } catch (error) {
      // console.error('Error saving language preference:', error);
    }
  };

  const value = {
    language,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};