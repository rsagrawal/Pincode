# Google Sheets Integration Setup

This guide will help you set up the Google Sheets integration for the CRM data management system.

## Prerequisites

1. **Google Cloud Console Access**
2. **Google Sheets API Enabled**
3. **Service Account Created**

## Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Sheets API"
5. Click on "Google Sheets API" and click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - **Name**: `google-all-access`
   - **Description**: Service account for Google Sheets integration
4. Click "Create and Continue"
5. Skip role assignment (we'll handle permissions separately)
6. Click "Done"

## Step 3: Generate Service Account Key

1. Click on the created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file
6. **Important**: Keep this file secure and never commit it to version control

## Step 4: Share Google Sheet with Service Account

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA/edit?usp=sharing
2. Click "Share" in the top right
3. Add the service account email: `google-all-access@hip-principle-465308-n6.iam.gserviceaccount.com`
4. Give it "Editor" permissions
5. Click "Send"

## Step 5: Update Service Account Configuration

The service account configuration is already included in the code. If you need to use a different service account, update the `SERVICE_ACCOUNT_CONFIG` in `src/integrations/google-sheets/client.ts`.

## Step 6: Run Database Migrations

```bash
# Apply the new migrations
npx supabase db push
```

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/crm` to access the CRM Data Management page
3. Click "Sync with Google Sheets" to import data
4. Test editing functionality - changes will sync to both database and Google Sheets

## Features

### ✅ **Two-Way Sync**
- Database ↔ Google Sheets synchronization
- Real-time updates in both systems
- Conflict resolution and error handling

### ✅ **Inline Editing**
- Edit any field directly in the table
- Automatic formatting with ₹ symbol
- Number validation and step controls

### ✅ **Advanced Filtering**
- Global search across all fields
- State, District, and Pincode filters
- Debounced search for performance

### ✅ **Pagination**
- Efficient data loading
- Page navigation controls
- Results summary

### ✅ **Error Handling**
- Toast notifications for success/error states
- Graceful error recovery
- Loading states and indicators

## API Limits

- **Google Sheets API**: 1,000 requests/day (free tier)
- **Supabase**: Based on your plan limits
- **Rate Limiting**: Implemented to prevent API abuse

## Security Considerations

1. **Service Account Security**: Service account credentials are embedded in the code (for demo purposes)
2. **Row Level Security**: Enabled on database tables
3. **Input Validation**: All user inputs are validated
4. **Error Logging**: Comprehensive error logging for debugging
5. **Token Management**: Automatic token refresh and caching

## Troubleshooting

### Common Issues:

1. **Service Account Permissions**: Ensure the service account has editor access to the Google Sheet
2. **Sheet Not Found**: Verify the sheet ID and sharing permissions
3. **JWT Token Errors**: Check service account configuration and private key
4. **Database Errors**: Check Supabase connection and table permissions

### Debug Steps:

1. Check browser console for errors
2. Verify service account email has access to the Google Sheet
3. Test service account access with curl:
   ```bash
   # First get an access token
   curl -X POST "https://oauth2.googleapis.com/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=YOUR_JWT_TOKEN"
   
   # Then test the API
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     "https://sheets.googleapis.com/v4/spreadsheets/1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA/values/A:N"
   ```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify service account has proper permissions on the Google Sheet
3. Ensure Google Sheets API is enabled in your Google Cloud project
4. Check Supabase dashboard for database errors
5. Verify the service account configuration in the code matches your setup 