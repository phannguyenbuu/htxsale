-- Migration to remove 'khac' product from product_type table
-- Date: 2026-03-11

-- 1. Remove from inventory_item first due to potential foreign key or logic dependencies
DELETE FROM inventory_item WHERE product_code = 'khac';

-- 2. Remove from product_type
DELETE FROM product_type WHERE code = 'khac';

-- Note: We don't delete from order_services to preserve historical data, 
-- but 'khac' will no longer appear in any active menus.
