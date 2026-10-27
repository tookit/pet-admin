/** Shapes returned by pet-api. Keep these aligned with app/schemas in pet-api. */

export type ApiUserStatus = 0 | 1 | 2;

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface ApiPermission {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiRole extends Role {
  description: string | null;
  permissions: ApiPermission[];
  created_at: string;
  updated_at: string;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  /** 0 = inactive, 1 = active, 2 = frozen */
  status: ApiUserStatus;
  roles: Role[];
  created_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

/** Fields `PUT /users/{id}` and `PATCH /me` accept. */
export interface UserUpdateParams {
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  avatar?: string | null;
  gender?: string;
}

export interface UserListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  status?: ApiUserStatus;
  role_id?: number;
}

/** Shared list query accepted by every paginated pet-api endpoint. */
export interface ListParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export type ProductStatus = 'draft' | 'active' | 'discontinued' | 'archived';
export type ProductType = 'physical' | 'digital' | 'service';

export interface ProductTagRef {
  id: number;
  name: string;
}

export interface ProductCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  url: string;
  featured: boolean;
}

export interface PriceTier {
  id: number;
  product_id: number;
  min_quantity: number;
  unit_price: number;
  currency: string;
  label: string | null;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

/** `GET /products` item (`ProductListResponse`). */
export interface ApiProduct {
  id: number;
  sku: string;
  slug: string | null;
  name: string;
  short_description: string | null;
  status: ProductStatus;
  type: ProductType;
  is_featured: boolean;
  featured_image: string | null;
  images: ProductImage[];
  tags: ProductTagRef[];
  categories: ProductCategoryRef[];
  suppliers: ApiProductSupplierLink[];
  min_price: number | null;
  moq: number;
  created_at: string | null;
}

/** Supplier attached to a product, with the 1688 purchase-order details. */
export interface ApiProductSupplierLink {
  product_id: number;
  supplier_id: number;
  is_primary: boolean;
  offer_id: string | null;
  offer_url: string | null;
  supplier_sku: string | null;
  source_price: number | null;
  source_currency: string;
  moq: number | null;
  lead_time_days: number | null;
  notes: string | null;
  supplier: {
    id: number;
    name: string;
    phone: string | null;
    wechat: string | null;
    email: string | null;
    shop_url: string | null;
    province: string | null;
    city: string | null;
    status: SupplierStatus;
  };
}

export interface ProductProp {
  id: number;
  name: string;
  value: string | null;
  unit: string | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string | null;
  attributes: Array<Record<string, unknown>>;
  description: string | null;
  barcode: string | null;
  weight: number | null;
  dimensions: Record<string, unknown> | null;
  is_default: boolean;
  status: 'active' | 'inactive' | 'discontinued';
  prices: ProductPrice[];
}

export interface ProductPrice {
  id: number;
  product_id: number;
  variant_id: number | null;
  base_price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  effective_from: string | null;
  effective_to: string | null;
  created_at: string | null;
}

/** `GET /products/{id}` (`ProductResponse`). */
export interface ApiProductDetail extends ApiProduct {
  description: string | null;
  is_virtual: boolean;
  weight: number | null;
  dimensions: Record<string, unknown> | null;
  attrs: Array<Record<string, unknown>> | null;
  default_attrs: Array<Record<string, unknown>> | null;
  props: ProductProp[];
  variants: ProductVariant[];
  prices: ProductPrice[];
  tiers: PriceTier[];
  updated_at: string | null;
}

export interface ProductCreateParams {
  sku: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  short_description?: string | null;
  status?: ProductStatus;
  type?: ProductType;
  is_featured?: boolean;
  is_virtual?: boolean;
  category_ids?: number[];
  tags?: string[];
}

export type ProductUpdateParams = Partial<Omit<ProductCreateParams, 'sku' | 'name'>> & {
  sku?: string;
  name?: string;
};

export interface ProductQueryParams {
  current?: number;
  pageSize?: number;
  search?: string;
  status?: ProductStatus;
  type?: ProductType;
  is_featured?: boolean;
  category_id?: number;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CategoryTree extends ApiCategory {
  children: CategoryTree[];
}

export interface CategoryCreateParams {
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  display_order?: number;
  is_active?: boolean;
  image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

export type CategoryUpdateParams = Partial<CategoryCreateParams>;

export interface ApiTag {
  id: number;
  name: string;
  slug: string;
  created_at: string | null;
}

export interface TagCreateParams {
  name: string;
  slug: string;
}

export type TagUpdateParams = Partial<TagCreateParams>;

/** Price-tier payload for `POST /products/{id}/tiers`. */
export interface PriceTierCreateParams {
  min_quantity: number;
  unit_price: number;
  currency?: string;
  label?: string | null;
  display_order?: number;
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ApiQuote {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
  items: QuoteItem[];
}

export interface QuoteQueryParams {
  current?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

export type MediaAggregateType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface ApiMedia {
  id: number;
  uuid: string;
  filename: string;
  directory: string;
  disk: string;
  extension: string;
  mime_type: string;
  aggregate_type: MediaAggregateType;
  size: number;
  fingerprint: string | null;
  custom_properties: Record<string, unknown> | null;
  cloud_url: string | null;
  url: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface MediaUploadResponse {
  media: ApiMedia;
  message: string;
}

export interface EntityMediaGroup {
  tag: string;
  media: ApiMedia[];
}

export interface MediaQueryParams {
  current?: number;
  pageSize?: number;
  aggregate_type?: MediaAggregateType;
  filename?: string;
  directory?: string;
}

export interface MediaDirectory {
  directory: string;
  count: number;
}

export type AttributeType = 'text' | 'number' | 'select' | 'boolean' | 'date';

export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  alias: string | null;
  display_order: number;
  created_at: string | null;
}

export interface ApiAttribute {
  id: number;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  filterable: boolean;
  is_required: boolean;
  display_order: number;
  values: AttributeValue[];
  created_at: string | null;
  updated_at: string | null;
}

export interface AttributeValueCreateParams {
  value: string;
  alias?: string | null;
  display_order?: number;
}

export interface AttributeCreateParams {
  name: string;
  slug: string;
  type: AttributeType;
  unit?: string | null;
  filterable?: boolean;
  is_required?: boolean;
  display_order?: number;
  values?: AttributeValueCreateParams[];
}

export type AttributeUpdateParams = Partial<Omit<AttributeCreateParams, 'values'>>;

export interface AttributeQueryParams extends ListParams {
  filterable_only?: boolean;
}

// ── Suppliers ──
export type SupplierStatus = 'prospect' | 'active' | 'on_hold' | 'blacklisted';

export interface ApiSupplier {
  id: number;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  wechat: string | null;
  platform: string;
  shop_url: string | null;
  province: string | null;
  city: string | null;
  main_category: string | null;
  years_on_platform: number | null;
  repeat_rate: number | null;
  min_order_qty: number | null;
  certifications: string | null;
  score: number | null;
  status: SupplierStatus;
  notes: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiSupplierProduct {
  product_id: number;
  sku: string;
  name: string;
  status: string;
  featured_image: string | null;
  product_min_price: number | null;
  is_primary: boolean;
  offer_id: string | null;
  offer_url: string | null;
  supplier_sku: string | null;
  source_price: number | null;
  source_currency: string;
  moq: number | null;
  lead_time_days: number | null;
}

export interface SupplierProductList {
  supplier_id: number;
  supplier_name: string;
  total: number;
  items: ApiSupplierProduct[];
}

export interface SupplierQueryParams {
  current?: number;
  pageSize?: number;
  name?: string;
  platform?: string;
  status?: SupplierStatus;
  province?: string;
  main_category?: string;
}

export interface SupplierCreateParams {
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  platform?: string;
  shop_url?: string | null;
  province?: string | null;
  city?: string | null;
  main_category?: string | null;
  years_on_platform?: number | null;
  repeat_rate?: number | null;
  min_order_qty?: number | null;
  certifications?: string | null;
  score?: number | null;
  status?: SupplierStatus;
  notes?: string | null;
}

export type SupplierUpdateParams = Partial<SupplierCreateParams>;
