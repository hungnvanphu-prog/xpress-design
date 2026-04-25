"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Map { locale → slug } cho entity hiện tại + base path (vd `/projects`).
 * Provider được mount ở layout (để Header/LanguageSwitcher cùng thấy);
 * mỗi trang chi tiết dùng <LocalizedRouteSetter> để đẩy dữ liệu lên context.
 */
export interface LocalizedRouteValue {
  basePath: string;
  slugs: Record<string, string>;
}

interface LocalizedRouteContextType {
  value: LocalizedRouteValue | null;
  set: (value: LocalizedRouteValue | null) => void;
}

const LocalizedRouteContext = createContext<LocalizedRouteContextType>({
  value: null,
  set: () => {},
});

export function LocalizedRouteProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<LocalizedRouteValue | null>(null);

  const ctx = useMemo(
    () => ({ value, set: setValue }),
    [value],
  );

  return (
    <LocalizedRouteContext.Provider value={ctx}>
      {children}
    </LocalizedRouteContext.Provider>
  );
}

export function useLocalizedRoute(): LocalizedRouteValue | null {
  return useContext(LocalizedRouteContext).value;
}

/**
 * Render tại page chi tiết để bơm mapping slug lên context.
 * Khi unmount (điều hướng đi) → reset về null → LanguageSwitcher trở
 * lại hành vi mặc định (giữ nguyên pathname).
 */
export function LocalizedRouteSetter({
  basePath,
  slugs,
}: {
  basePath: string;
  slugs: Record<string, string>;
}) {
  const { set } = useContext(LocalizedRouteContext);
  const slugsKey = JSON.stringify(slugs);
  useEffect(() => {
    set({ basePath, slugs });
    return () => set(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, slugsKey]);
  return null;
}
