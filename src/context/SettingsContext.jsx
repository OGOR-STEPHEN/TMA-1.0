import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { getTheme } from "../config/themes";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    theme: "dark",
    hideCompleted: false,
  });
  const [loading, setLoading] = useState(true);

  // Apply theme to document
  useEffect(() => {
    const theme = getTheme(settings.theme);
    document.body.style.background = theme.background;
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.color = theme.text;
    document.body.style.minHeight = "100vh";
  }, [settings.theme]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      const ref = doc(db, "users", user.uid, "settings", "preferences");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSettings(snap.data());
      }

      setLoading(false);
    };

    loadSettings();
  }, [user]);

  const saveSettings = async (newSettings) => {
    if (!user) return;

    setSettings(newSettings);

    const ref = doc(db, "users", user.uid, "settings", "preferences");
    await setDoc(ref, {
      ...newSettings,
      updatedAt: serverTimestamp(),
    });
  };

  const currentTheme = getTheme(settings.theme);

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, loading, theme: currentTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
