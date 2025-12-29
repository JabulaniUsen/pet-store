-- Add previous_price and rating columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS previous_price NUMERIC(10, 2) CHECK (previous_price >= 0),
ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);

-- Add index on rating for faster queries
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating);

