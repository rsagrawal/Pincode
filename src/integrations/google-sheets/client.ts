import jwt from 'jsonwebtoken';

// Google Sheets API Client with Service Account
const SPREADSHEET_ID = '1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA';

// Service Account Configuration
const SERVICE_ACCOUNT_CONFIG = {
  type: "service_account",
  project_id: "hip-principle-465308-n6",
  private_key_id: "eeda1688088ecf6709f3a0df5e6c3aea473ae4af",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC46+M8Jzkejwgq\nkwa1BgyNFCokGGL+2fUcKYvXuuHYhIcHa+NAtd3tmxWshiWeQ8S+UKLkC4prHfWz\nLoVKOOpY4sbrsaODA5NpoEN+QJ6yhy4lRrGwn3LST8ocFy0W5L+vyyMDubNKow+c\nWoFTb7fBTBAF+9mW0HGUvrqrFPPOaD0+U/7zh32mhfcxQHBFhQFNZFkCUe8YCgdO\nkfji62NCgqE0bHVFJb2kQG79v7G9J+1RwizSxZcoSG3jLsL736ogy2U1CJkK1QI6\n8nkQw0LVIo/eXmViW1ke/ReZ8lRyOv8Ljvm8aHLJm3OETXBdZDLzPXQyQ7Aw06q8\nhamBbBYxAgMBAAECggEATYJF4Sk5llbyX9H3fjnWWe3JSg7Us6iMxeyeGmLRFg1a\ngaBVhQKVzmlyGLmzm9Yg6XpoBDjYIFTS7vNBWB5qD66iHRl8hUYi7COKFqmkOwVR\nMLukb/ktSfy6pLKMKivgMqFtADs+bLrTKMCAs4XAmis1DiUFi2K8MNIO8PWbyXgO\nSj/mOyttN4M99mDgRPtLZioNr26AoBnG5TZht6ZTMiXdzVLe+pXlDfGJeIACXdRa\nyyn5XdIs9HIBqHeYdM+Bb9nfhqMikCK4n1ur/uj8X0xOVrGuFgGrlowgEHY+CLNB\nwZdLjaK3WCM6OvHgk5QoThG7ABwedCr1GYwF8026RwKBgQDZrQKtVarNcmBulGRl\nTuFd4vJ5LMvtEIkU+fLcIKHLwZuvkTEzu+oIcPYXlINePhKRXhp6gQh3Vy0NOfNT\nnlgIOzMgbJAdwePNsdrM0JlO4SgrQfdFN8AL/kTr3jnIwgOjp0incgJXCkPoXgsP\n8cncdoIUVy+Yyu6JDBZqIqJ4vwKBgQDZepX3RNFw2JyQ9jmbxlFARX5ler2+ArDt\nfm45KNtP0sqV2UvoMO2dR2Vt3asIanxFwLLXoavNMvAgClfH4KLIQceZOfAUoQDk\nXns3C0pP4JGYQ40eS9BkpxW90uU7ezH/rQyz5yddk5m+zjCP9rr9Uk4OkY0/fgAl\naFj/V769DwKBgASXF2VcVxu5+7qZOnzAaxQ1wvM3NJ2tKZbdpndp4L+RN50+LJFw\ntwCykR3yLcsA+BdEqr5Glk0d839B55Wt0yFpTiyy3V8jRZCC3aBQDcuSB+zRmUtG\nX7BhDkcDCqjnHniHAIs3ZkE7oC74PLd7W8xgW2HebMyGCv2s2ZQnYtG1AoGAKvk0\nJPYuRJQo6+QbohJf/8k7nqXQVHmHqIYxFY5jN7S5Xz7e5vS0Hz36ZulEYJdaExZu\nwHkrz5JfLJWentpekB+fZ0GxlQHzgSzCQDA08O+5FVNT0Ua92QXDIA1KSqSfTpxN\nREdK2gzOdoubwPbKIEBhODO+q2skcD/cRih6gjUCgYEAt2q69uotL1MJRVXSW7P2\nzbAD+TfcrAbkihWf4bHFQ2pRMQDy8gPgw1Y3DT0xrb79NooP4jx+NAPSyI/SjuhV\nV2ODZrjlK9OqdkK+opBKikB+OaRGQP7Rw8O6NuTs8b56E7jBQBUrr8kQvOeWfAvz\ne78sS+LyRcLOwJ250OIGc+M=\n-----END PRIVATE KEY-----\n",
  client_email: "google-all-access@hip-principle-465308-n6.iam.gserviceaccount.com",
  client_id: "118022401233972615682",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/google-all-access%40hip-principle-465308-n6.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

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

class GoogleSheetsClient {
  private static instance: GoogleSheetsClient;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private constructor() {}

  public static getInstance(): GoogleSheetsClient {
    if (!GoogleSheetsClient.instance) {
      GoogleSheetsClient.instance = new GoogleSheetsClient();
    }
    return GoogleSheetsClient.instance;
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Create JWT token
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };

      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: SERVICE_ACCOUNT_CONFIG.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: SERVICE_ACCOUNT_CONFIG.token_uri,
        exp: now + 3600, // 1 hour
        iat: now
      };

      // Create JWT (simplified - in production, use a proper JWT library)
      const jwt = this.createJWT(header, payload);
      
      // Exchange JWT for access token
      const response = await fetch(SERVICE_ACCOUNT_CONFIG.token_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  private createJWT(header: any, payload: any): string {
    // Create JWT using the service account private key
    return jwt.sign(payload, SERVICE_ACCOUNT_CONFIG.private_key, {
      algorithm: 'RS256',
      header: header
    });
  }

  async fetchSheetData(): Promise<CRMData[]> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:N`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
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
      const accessToken = await this.getAccessToken();
      
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
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A${rowIndex + 2}:N${rowIndex + 2}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
      const accessToken = await this.getAccessToken();
      
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
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/A:N:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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