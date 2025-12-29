-- Add 'both' as a valid pet_type option
-- This allows products to be applicable to both cats and dogs
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_pet_type_check;

ALTER TABLE public.products 
ADD CONSTRAINT products_pet_type_check 
CHECK (pet_type IN ('dog', 'cat', 'bird', 'fish', 'small_pet', 'all', 'both'));

-- Add comment for documentation
COMMENT ON COLUMN public.products.pet_type IS 'Pet type: dog, cat, both (for both cats and dogs), bird, fish, small_pet, or all';

