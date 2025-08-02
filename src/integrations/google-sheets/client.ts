// Google Sheets API Client
const GOOGLE_SHEETS_API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = '1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA';

export interface CRMData {
  id?: number;
  state: string;
  district: string;
  pincode: string;
  hp: number;
  amp: number;
  dsn: number;
  ssm: number;
  yltp: number;
  wltp: number;
  vtp: number;
  ruralHp: number;
  ruralAmp: number;
  rhpLegacy: number;
  lastUpdated?: string;
}

export class GoogleSheetsClient {
  private static instance: GoogleSheetsClient;
  private apiKey: string;

  private constructor() {
    this.apiKey = GOOGLE_SHEETS_API_KEY || '';
  }

  public static getInstance(): GoogleSheetsClient {
    if (!GoogleSheetsClient.instance) {
      GoogleSheetsClient.instance = new GoogleSheetsClient();
    }
    return GoogleSheetsClient.instance;
  }

  async fetchSheetData(): Promise<CRMData[]> {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:N?key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];

      // Skip header row and convert to CRMData objects
      const crmData: CRMData[] = rows.slice(1).map((row: any[], index: number) => ({
        id: index + 1,
        state: row[0] || '',
        district: row[1] || '',
        pincode: row[2] || '',
        hp: parseFloat(row[3]) || 0,
        amp: parseFloat(row[4]) || 0,
        dsn: parseFloat(row[5]) || 0,
        ssm: parseFloat(row[6]) || 0,
        yltp: parseFloat(row[7]) || 0,
        wltp: parseFloat(row[8]) || 0,
        vtp: parseFloat(row[9]) || 0,
        ruralHp: parseFloat(row[10]) || 0,
        ruralAmp: parseFloat(row[11]) || 0,
        rhpLegacy: parseFloat(row[12]) || 0,
        lastUpdated: new Date().toISOString()
      }));

      return crmData;
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  }

  async updateSheetRow(rowIndex: number, data: CRMData): Promise<void> {
    try {
      const values = [
        data.state,
        data.district,
        data.pincode,
        data.hp.toString(),
        data.amp.toString(),
        data.dsn.toString(),
        data.ssm.toString(),
        data.yltp.toString(),
        data.wltp.toString(),
        data.vtp.toString(),
        data.ruralHp.toString(),
        data.ruralAmp.toString(),
        data.rhpLegacy.toString()
      ];

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A${rowIndex + 2}:N${rowIndex + 2}?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [values]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }

  async appendRow(data: CRMData): Promise<void> {
    try {
      const values = [
        data.state,
        data.district,
        data.pincode,
        data.hp.toString(),
        data.amp.toString(),
        data.dsn.toString(),
        data.ssm.toString(),
        data.yltp.toString(),
        data.wltp.toString(),
        data.vtp.toString(),
        data.ruralHp.toString(),
        data.ruralAmp.toString(),
        data.rhpLegacy.toString()
      ];

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:N:append?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [values]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error appending to Google Sheets:', error);
      throw error;
    }
  }
}

export const googleSheetsClient = GoogleSheetsClient.getInstance(); 