/** Shapes returned by pet-api. Keep these aligned with app/schemas in pet-api. */

export type ApiUserStatus = 0 | 1 | 2;

export interface Role {
  id: number;
  name: string;
  slug: string;
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
  min_price: number | null;
  moq: number;
  created_at: string | null;
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
