export interface Product {
  id: string;
  operator: string;
  product_name: string;
  package_intro: string;
  monthly_rent: number;
  total_flow: number;
  general_flow: number;
  directed_flow: number;
  provincial_flow: number;
  minutes: number;
  main_tag: string;
  sub_tag: string;
  areas: string;
  full_areas: string;
  age_limit: string;
  need_idcard: string;
  discount_package: string;
  agreement_period: string;
  extra_card: string;
  flow_rollover: string;
}

export type Operator = string;

export type PageType = "data" | "generator" | "gallery" | "manage";

export interface FilterState {
  operator: Operator;
  search: string;
  areaSearch: string;
  priceRange: string;
  flowRange: string;
}

export interface AppState {
  products: Product[];
  filter: FilterState;
  lastSync: string;
  generatedImages: Record<string, string>;
}
