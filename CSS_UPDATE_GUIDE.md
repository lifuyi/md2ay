# CSS Update Guide

## Problem
The online version was not getting new CSS updates due to browser caching and Docker build-time file copying.

## Solutions Implemented

### 1. Cache-Busting for Frontend
- Added timestamp-based cache-busting parameter to CSS fetch requests
- CSS files are now loaded with `?v={timestamp}` to force fresh downloads

### 2. Server-Side Cache Headers
- Added `Cache-Control: no-cache, no-store, must-revalidate` headers for CSS files
- Added `Pragma: no-cache` and `Expires: 0` headers
- Prevents browser and proxy caching of CSS files

### 3. Production Docker Volume Mounting
- Modified `docker-compose.prod.yml` to mount CSS files as volumes
- CSS updates no longer require Docker image rebuilds
- Files can be updated on the host and immediately reflected in the container

### 4. CSS Refresh Endpoint
- Added `/styles/refresh` POST endpoint for manual cache clearing
- Returns updated list of available styles with timestamp

## Usage

### For Development
No changes needed - cache-busting is automatic.

### For Production Deployment

#### Option 1: Use Volume Mounting (Recommended)
```bash
# Deploy with volume mounting for live CSS updates
docker-compose -f docker-compose.prod.yml up -d

# Update CSS files on host - changes are immediately available
cp new-theme.css ./themes/
# No restart needed!
```

#### Option 2: Manual Cache Refresh
```bash
# Force refresh CSS cache via API
curl -X POST http://your-server:5002/styles/refresh
```

#### Option 3: Rebuild for Permanent Updates
```bash
# For permanent updates, rebuild the image
docker-compose -f docker-compose.prod.yml up --build -d
```

## Testing the Fix

1. **Add a new CSS file:**
   ```bash
   echo "body { background: red; }" > themes/test-new.css
   ```

2. **Verify it appears in styles list:**
   ```bash
   curl http://localhost:5002/styles
   ```

3. **Test cache-busting:**
   - Open browser developer tools
   - Check Network tab when changing themes
   - Should see CSS requests with `?v=timestamp` parameters

4. **Verify no caching:**
   - CSS files should show "no-cache" in response headers
   - Each theme change should trigger a fresh CSS download

## Files Modified

- `frontend.js`: Added cache-busting parameters
- `api_server.py`: Added cache headers and refresh endpoint
- `docker-compose.prod.yml`: Added volume mounting for CSS files in themes directory

## Benefits

- ✅ Immediate CSS updates without server restart
- ✅ No browser caching issues
- ✅ No Docker rebuild required for CSS changes
- ✅ Backward compatible with existing deployments
- ✅ Manual refresh option available