import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Product, Operator, FilterState } from '@/types';
import { DEFAULT_PRODUCTS } from '@/data/products';

interface AppState {
  products: Product[];
  filter: FilterState;
  lastSync: string;
  generatedImages: Record<string, string>;
  lockedTopics: string[];
}

type Action =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_IMAGES'; payload: Record<string, string> }
  | { type: 'SET_IMAGE'; payload: { id: string; dataUrl: string } }
  | { type: 'RESET_DATA' }
  | { type: 'IMPORT_DATA'; payload: Product[] }
  | { type: 'ADD_LOCKED_TOPICS'; payload: string[] }
  | { type: 'REMOVE_LOCKED_TOPICS'; payload: string[] };

const STORAGE_KEY = 'anqing_card_data';
const IMAGES_KEY = 'anqing_card_images';
const TOPICS_KEY = 'anqing_locked_topics';
const DATA_VERSION = 'v12'; // bump this when DEFAULT_PRODUCTS changes

function loadLockedTopics(): string[] {
  try {
    const saved = localStorage.getItem(TOPICS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check version - if mismatch, reset to default
      if (parsed.version === DATA_VERSION && parsed.products && parsed.products.length > 0) {
        return {
          products: parsed.products,
          filter: { operator: '全部', search: '', areaSearch: '', priceRange: 'all', flowRange: 'all' },
          lastSync: parsed.lastSync || new Date().toLocaleString('zh-CN'),
          generatedImages: {},
          lockedTopics: loadLockedTopics(),
        };
      }
    }
  } catch { /* ignore */ }
  // Reset localStorage to new default data
  const initial = {
    products: DEFAULT_PRODUCTS,
    filter: { operator: '全部', search: '', areaSearch: '', priceRange: 'all', flowRange: 'all' },
    lastSync: new Date().toLocaleString('zh-CN'),
    generatedImages: {},
    lockedTopics: loadLockedTopics(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initial, version: DATA_VERSION }));
    localStorage.removeItem(IMAGES_KEY);
  } catch { /* ignore */ }
  return initial;
}

function loadImages(): Record<string, string> {
  try {
    const saved = localStorage.getItem(IMAGES_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

function reducer(state: AppState, action: Action): AppState {
  let newState: AppState;
  switch (action.type) {
    case 'SET_PRODUCTS':
      newState = { ...state, products: action.payload };
      break;
    case 'ADD_PRODUCT':
      newState = { ...state, products: [...state.products, action.payload] };
      break;
    case 'UPDATE_PRODUCT':
      newState = {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p),
      };
      break;
    case 'DELETE_PRODUCT':
      newState = {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
      break;
    case 'SET_FILTER':
      newState = { ...state, filter: { ...state.filter, ...action.payload } };
      break;
    case 'RESET_FILTERS':
      newState = {
        ...state,
        filter: { operator: '全部', search: '', areaSearch: '', priceRange: 'all', flowRange: 'all' },
      };
      break;
    case 'SET_IMAGES':
      newState = { ...state, generatedImages: action.payload };
      break;
    case 'SET_IMAGE':
      newState = {
        ...state,
        generatedImages: { ...state.generatedImages, [action.payload.id]: action.payload.dataUrl },
      };
      break;
    case 'RESET_DATA':
      newState = {
        ...state,
        products: DEFAULT_PRODUCTS,
        lastSync: new Date().toLocaleString('zh-CN'),
        filter: { operator: '全部', search: '', areaSearch: '', priceRange: 'all', flowRange: 'all' },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          products: DEFAULT_PRODUCTS,
          lastSync: newState.lastSync,
          version: DATA_VERSION,
        }));
        localStorage.removeItem(IMAGES_KEY);
      } catch { /* ignore */ }
      return newState;
    case 'IMPORT_DATA':
      newState = { ...state, products: action.payload, lastSync: new Date().toLocaleString('zh-CN') };
      break;
    case 'ADD_LOCKED_TOPICS': {
      const merged = [...new Set([...state.lockedTopics, ...action.payload])];
      newState = { ...state, lockedTopics: merged };
      try { localStorage.setItem(TOPICS_KEY, JSON.stringify(merged)); } catch { /* ignore */ }
      break;
    }
    case 'REMOVE_LOCKED_TOPICS': {
      const removed = state.lockedTopics.filter(t => !action.payload.includes(t));
      newState = { ...state, lockedTopics: removed };
      try { localStorage.setItem(TOPICS_KEY, JSON.stringify(removed)); } catch { /* ignore */ }
      break;
    }
    default:
      return state;
  }
  // Persist products
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    products: newState.products,
    lastSync: newState.lastSync,
  }));
  return newState;
}

interface DataContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  filteredProducts: Product[];
  operatorCounts: Record<string, number>;
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilters: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetData: () => void;
  importData: (products: Product[]) => void;
  exportData: () => string;
  saveImage: (id: string, dataUrl: string) => void;
  addLockedTopics: (topics: string[]) => void;
  removeLockedTopics: (topics: string[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const s = getInitialState();
    s.generatedImages = loadImages();
    return s;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        products: state.products,
        lastSync: state.lastSync,
        version: DATA_VERSION,
      }));
    } catch { /* ignore */ }
  }, [state.products, state.lastSync]);

  useEffect(() => {
    try {
      localStorage.setItem(IMAGES_KEY, JSON.stringify(state.generatedImages));
    } catch { /* ignore */ }
  }, [state.generatedImages]);

  const filteredProducts = React.useMemo(() => {
    return state.products.filter(p => {
      if (state.filter.operator !== '全部' && p.operator !== state.filter.operator) return false;
      if (state.filter.search && !p.product_name.toLowerCase().includes(state.filter.search.toLowerCase())) return false;
      if (state.filter.areaSearch && !p.areas.includes(state.filter.areaSearch)) return false;
      if (state.filter.priceRange !== 'all') {
        const price = p.monthly_rent;
        switch (state.filter.priceRange) {
          case '0-19': if (price > 19) return false; break;
          case '20-29': if (price < 20 || price > 29) return false; break;
          case '30-39': if (price < 30 || price > 39) return false; break;
          case '40+': if (price < 40) return false; break;
        }
      }
      if (state.filter.flowRange !== 'all') {
        const flow = p.total_flow;
        switch (state.filter.flowRange) {
          case '0-100': if (flow >= 100) return false; break;
          case '100-200': if (flow < 100 || flow > 200) return false; break;
          case '200+': if (flow <= 200) return false; break;
        }
      }
      return true;
    });
  }, [state.products, state.filter]);

  const operatorCounts = React.useMemo(() => {
    const counts: Record<string, number> = { '全部': state.products.length };
    state.products.forEach(p => {
      counts[p.operator] = (counts[p.operator] || 0) + 1;
    });
    return counts;
  }, [state.products]);

  const setFilter = useCallback((filter: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const id = `prod_${Date.now()}`;
    dispatch({ type: 'ADD_PRODUCT', payload: { ...product, id } });
  }, []);

  const updateProduct = useCallback((product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  }, []);

  const resetData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
  }, []);

  const importData = useCallback((products: Product[]) => {
    dispatch({ type: 'IMPORT_DATA', payload: products });
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(state.products, null, 2);
  }, [state.products]);

  const saveImage = useCallback((id: string, dataUrl: string) => {
    dispatch({ type: 'SET_IMAGE', payload: { id, dataUrl } });
  }, []);

  const addLockedTopics = useCallback((topics: string[]) => {
    dispatch({ type: 'ADD_LOCKED_TOPICS', payload: topics });
  }, []);

  const removeLockedTopics = useCallback((topics: string[]) => {
    dispatch({ type: 'REMOVE_LOCKED_TOPICS', payload: topics });
  }, []);

  return (
    <DataContext.Provider value={{
      state, dispatch, filteredProducts, operatorCounts,
      setFilter, resetFilters, addProduct, updateProduct, deleteProduct,
      resetData, importData, exportData, saveImage,
      addLockedTopics, removeLockedTopics,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
