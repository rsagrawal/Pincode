-- Enable Row Level Security on Region Mapping table
ALTER TABLE "Region Mapping" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to Region Mapping data
CREATE POLICY "Allow public read access" ON "Region Mapping"
  FOR SELECT
  USING (true);

-- Create policy to allow public update access to Tier column
CREATE POLICY "Allow public update of Tier" ON "Region Mapping"
  FOR UPDATE
  USING (true);