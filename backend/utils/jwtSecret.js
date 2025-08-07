const crypto = require('crypto');

// Cache the development secret to ensure consistency
let devSecretCache = null;

const getJWTSecret = () => {
  let primarySecret = process.env.JWT_SECRET;
  let fallbackSecret = null;
  
  // Always generate fallback secret for extra security
  if (process.env.NODE_ENV === 'production') {
    // Use Render service info for consistent fallback
    const baseString = 'questforge-prod-fallback-' + (process.env.RENDER_SERVICE_ID || 'render-service');
    fallbackSecret = crypto.createHash('sha256').update(baseString).digest('hex');
  } else {
    // Development fallback - use cached value for consistency
    if (!devSecretCache) {
      devSecretCache = 'dev-fallback-secret-' + Date.now();
    }
    fallbackSecret = devSecretCache;
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
