# Login Persistence Fix

## Problem
Users were getting logged out whenever the application was redeployed or updated because JWT tokens were being invalidated.

## Root Cause
The issue was caused by:

1. **Dynamic JWT Secret Generation**: The JWT secret was being generated with a timestamp (`Date.now()`) in development, which changed on every server restart.

2. **Render's generateValue**: The Render deployment configuration had `generateValue: true` for `JWT_SECRET`, causing Render to generate a new secret on every deployment.

3. **Token Invalidation**: Since JWT tokens are signed with a specific secret, they can only be verified with the same secret. When the secret changes, all existing tokens become invalid.

## Solution Applied

### 1. Fixed Development Secret Persistence
- Updated `backend/utils/jwtSecret.js` to save the development JWT secret to a file (`.dev-jwt-secret`)
- The secret is now persistent across local development restarts
- Added the secret file to `.gitignore` to prevent it from being committed

### 2. Fixed Production Secret Configuration
- Updated both `render.yaml` and `render-backend-root.yaml` to use a fixed JWT secret instead of `generateValue: true`
- Set a consistent production secret: `questforge_jwt_secret_2024_production_v1_do_not_change`

### 3. Improved Error Handling
- Enhanced the frontend auth context to show a clearer message when tokens expire
- Better error handling for token verification failures

## Files Modified

- `backend/utils/jwtSecret.js` - Persistent secret generation
- `render.yaml` - Fixed JWT secret configuration
- `render-backend-root.yaml` - Fixed JWT secret configuration  
- `.gitignore` - Added development secret file to ignore list
- `frontend/src/contexts/AuthContext.js` - Improved error handling

## Testing the Fix

### Local Development
1. Start the server: `npm run dev` 
2. Log in to the application
3. Restart the server
4. Refresh the browser - you should remain logged in

### Production
1. Deploy the application with the updated configuration
2. Log in to the application
3. Trigger a new deployment
4. The login session should persist after deployment

## Important Notes

- **Security**: The production JWT secret should be treated as sensitive. Consider using environment variables on your hosting platform for better security.

- **Existing Users**: Users who were already logged in before this fix will need to log in again once, as their old tokens were signed with the previous (now invalid) secret.

- **Backup Plan**: If you need to invalidate all existing sessions for security reasons, you can change the JWT secret, which will log out all users.

## Future Improvements

Consider implementing:
- Refresh tokens for longer-term sessions
- Session management in a database for better control
- Token rotation strategies for enhanced security
