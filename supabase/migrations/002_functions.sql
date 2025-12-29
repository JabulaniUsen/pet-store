-- Database functions for PetSpace

-- Function to check if current user is an admin (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to increment affiliate clicks
CREATE OR REPLACE FUNCTION increment_affiliate_clicks(affiliate_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.affiliates
  SET total_clicks = total_clicks + 1
  WHERE id = affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update affiliate stats after a sale
CREATE OR REPLACE FUNCTION update_affiliate_stats(
  affiliate_id UUID,
  sale_amount NUMERIC,
  commission_amount NUMERIC
)
RETURNS void AS $$
BEGIN
  UPDATE public.affiliates
  SET 
    total_sales = total_sales + 1,
    total_earnings = total_earnings + commission_amount
  WHERE id = affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - quantity
  WHERE id = product_id AND stock >= quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

