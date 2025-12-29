-- Add courier field to orders table
-- Courier will store the selected delivery service (UPS, FedEx, USPS, etc.)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS courier TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.courier IS 'Selected delivery courier service (e.g., UPS, FedEx, USPS, DHL)';

