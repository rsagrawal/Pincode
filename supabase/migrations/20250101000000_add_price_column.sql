-- Add Price column to Region Mapping table
ALTER TABLE "Region Mapping" ADD COLUMN "Price" DECIMAL(10,2);

-- Create policy to allow public update access to Price column
CREATE POLICY "Allow public update of Price" ON "Region Mapping"
  FOR UPDATE
  USING (true); 