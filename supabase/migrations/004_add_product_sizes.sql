-- Add sizes column to products table
-- Sizes will be stored as JSONB: [{"size": "S", "stock": 10, "price": 29.99}, {"size": "M", "stock": 5, "price": 34.99}]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;

-- Add colors column to products table
-- Colors will be stored as JSONB: [{"color": "Red", "stock": 10, "price": 29.99, "hex": "#FF0000"}, {"color": "Blue", "stock": 5, "price": 34.99, "hex": "#0000FF"}]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;

-- Add size column to order_items table to track which size was ordered
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS size TEXT;

-- Add color column to order_items table to track which color was ordered
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS color TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.products.sizes IS 'Array of size options with stock and optional price override. Format: [{"size": "S", "stock": 10, "price": 29.99}]';
COMMENT ON COLUMN public.products.colors IS 'Array of color options with stock and optional price override. Format: [{"color": "Red", "stock": 10, "price": 29.99, "hex": "#FF0000"}]';
COMMENT ON COLUMN public.order_items.size IS 'The size selected for this order item';
COMMENT ON COLUMN public.order_items.color IS 'The color selected for this order item';

