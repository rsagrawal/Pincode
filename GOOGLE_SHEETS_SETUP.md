# Google Sheets Integration Setup

This guide will help you set up the Google Sheets integration for the CRM data management system.

## Prerequisites

1. **Google Cloud Console Access**
2. **Google Sheets API Enabled**
3. **API Key Generated**

## Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Sheets API"
5. Click on "Google Sheets API" and click "Enable"

## Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to Google Sheets API only for security

## Step 3: Set Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration (already configured)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Sheets API Configuration
VITE_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here
```

## Step 4: Share Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA/edit?usp=sharing
2. Click "Share" in the top right
3. Set permissions to "Anyone with the link can view"
4. Copy the Sheet ID from the URL: `1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA`

## Step 5: Run Database Migrations

```bash
# Apply the new migrations
npx supabase db push
```

## Step 6: Test the Integration

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

1. **API Key Security**: Never commit API keys to version control
2. **Row Level Security**: Enabled on database tables
3. **Input Validation**: All user inputs are validated
4. **Error Logging**: Comprehensive error logging for debugging

## Troubleshooting

### Common Issues:

1. **API Key Invalid**: Check your Google Sheets API key
2. **Sheet Not Found**: Verify the sheet ID and sharing permissions
3. **CORS Errors**: Ensure your domain is allowed in Google Cloud Console
4. **Database Errors**: Check Supabase connection and table permissions

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API key with curl:
   ```bash
   curl "https://sheets.googleapis.com/v4/spreadsheets/1qsCkQGiwVdeY9Tn6Pp-ZZeudr-G6r2UoJYDqjyH2tyA/values/A:N?key=YOUR_API_KEY"
   ```

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Google Sheets API is enabled
4. Check Supabase dashboard for database errors 