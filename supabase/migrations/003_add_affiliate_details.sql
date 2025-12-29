-- Add additional fields to affiliates table for application details
ALTER TABLE public.affiliates
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS traffic_source TEXT CHECK (traffic_source IN ('website', 'youtube', 'social_media', 'others')),
ADD COLUMN IF NOT EXISTS traffic_source_other TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('paypal', 'bank_transfer')),
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.affiliates.country IS 'Country of origin';
COMMENT ON COLUMN public.affiliates.address IS 'Full address';
COMMENT ON COLUMN public.affiliates.phone_number IS 'Phone number';
COMMENT ON COLUMN public.affiliates.traffic_source IS 'Primary traffic source: website, youtube, social_media, or others';
COMMENT ON COLUMN public.affiliates.traffic_source_other IS 'Details if traffic_source is others';
COMMENT ON COLUMN public.affiliates.payment_method IS 'Preferred payment method: paypal or bank_transfer';
COMMENT ON COLUMN public.affiliates.paypal_email IS 'PayPal email if payment_method is paypal';
COMMENT ON COLUMN public.affiliates.bank_name IS 'Bank name if payment_method is bank_transfer';
COMMENT ON COLUMN public.affiliates.bank_account_number IS 'Bank account number if payment_method is bank_transfer';
COMMENT ON COLUMN public.affiliates.bank_routing_number IS 'Bank routing number if payment_method is bank_transfer';
COMMENT ON COLUMN public.affiliates.bank_account_holder_name IS 'Bank account holder name if payment_method is bank_transfer';

