-- Create CRM Data table to sync with Google Sheets
CREATE TABLE "CRM Data" (
  id SERIAL PRIMARY KEY,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  hp DECIMAL(10,2) DEFAULT 0,
  amp DECIMAL(10,2) DEFAULT 0,
  dsn DECIMAL(10,2) DEFAULT 0,
  ssm DECIMAL(10,2) DEFAULT 0,
  yltp DECIMAL(10,2) DEFAULT 0,
  wltp DECIMAL(10,2) DEFAULT 0,
  vtp DECIMAL(10,2) DEFAULT 0,
  rural_hp DECIMAL(10,2) DEFAULT 0,
  rural_amp DECIMAL(10,2) DEFAULT 0,
  rhp_legacy DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "CRM Data" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to CRM Data" ON "CRM Data"
  FOR SELECT
  USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access to CRM Data" ON "CRM Data"
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public update access
CREATE POLICY "Allow public update access to CRM Data" ON "CRM Data"
  FOR UPDATE
  USING (true);

-- Create policy to allow public delete access
CREATE POLICY "Allow public delete access to CRM Data" ON "CRM Data"
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_crm_data_state ON "CRM Data" (state);
CREATE INDEX idx_crm_data_district ON "CRM Data" (district);
CREATE INDEX idx_crm_data_pincode ON "CRM Data" (pincode);
CREATE INDEX idx_crm_data_state_district ON "CRM Data" (state, district); 