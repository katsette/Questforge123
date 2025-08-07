const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cache the development secret to ensure consistency across restarts
let devSecretCache = null;
const DEV_SECRET_FILE = path.join(__dirname, '../.dev-jwt-secret');

// Get or create a persistent development secret
const getPersistentDevSecret = () => {
  if (devSecretCache) {
    return devSecretCache;
  }

  try {
    // Try to read existing secret from file
    if (fs.existsSync(DEV_SECRET_FILE)) {
      devSecretCache = fs.readFileSync(DEV_SECRET_FILE, 'utf8').trim();
      console.log('📁 Loaded existing development JWT secret');
      return devSecretCache;
    }
  } catch (error) {
    console.warn('⚠️  Could not read development secret file:', error.message);
  }

  // Generate new secret and save it
  devSecretCache = 'dev-secret-' + crypto.randomBytes(32).toString('hex');
  
  try {
    fs.writeFileSync(DEV_SECRET_FILE, devSecretCache, 'utf8');
    console.log('💾 Created new persistent development JWT secret');
  } catch (error) {
    console.warn('⚠️  Could not save development secret to file:', error.message);
    console.log('🔄 Using in-memory secret (will change on restart)');
  }

  return devSecretCache;
};

const getJWTSecret = () => {
  let primarySecret = process.env.JWT_SECRET;
  let fallbackSecret = null;
  
  // Always generate fallback secret for extra security
  if (process.env.NODE_ENV === 'production') {
    // Use a consistent base for production fallback
    // This ensures the same secret across deployments unless environment changes
    const serviceId = process.env.RENDER_SERVICE_ID || process.env.RENDER_SERVICE_NAME || 'questforge-prod';
    const baseString = `questforge-prod-${serviceId}-v1`; // v1 for versioning
    fallbackSecret = crypto.createHash('sha256').update(baseString).digest('hex');
  } else {
    // Development - use persistent secret that survives restarts
    fallbackSecret = getPersistentDevSecret();
  }
  
  if (primarySecret && fallbackSecret) {
    // Combine both secrets for maximum security
    const combinedSecret = primarySecret + '::' + fallbackSecret;
    const finalSecret = crypto.createHash('sha256').update(combinedSecret).digest('hex');
    return { secret: finalSecret, type: 'combined' };
  } else if (primarySecret) {
    // Use manual secret only
    return { secret: primarySecret, type: 'manual' };
  } else {
    // Use fallback only
    return { secret: fallbackSecret, type: 'fallback' };
  }
};

module.exports = { getJWTSecret };
