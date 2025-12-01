-- Fix product_categories table to include description column
-- This resolves the error: column "description" of relation "product_categories" does not exist

-- Add description columns to product_categories table
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS description_fr TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Update existing categories with empty descriptions if needed
UPDATE product_categories 
SET description_fr = '', description_en = '' 
WHERE description_fr IS NULL OR description_en IS NULL;