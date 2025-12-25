#!/bin/bash

# Configure CloudFront for SPA (Single Page Application)
# This fixes 404 errors with React Router

DISTRIBUTION_ID=$1

if [ -z "$DISTRIBUTION_ID" ]; then
  echo "Usage: ./configure-cloudfront-spa.sh DISTRIBUTION_ID"
  echo ""
  echo "This script configures CloudFront to work with React Router by:"
  echo "  - Setting 404 errors to redirect to index.html"
  echo "  - Setting 403 errors to redirect to index.html"
  echo "  - Keeping response code as 200"
  exit 1
fi

echo "🔧 Configuring CloudFront Distribution: $DISTRIBUTION_ID"
echo "   This fixes 404 errors for React Router..."
echo ""

# Get current distribution config
echo "📥 Fetching current configuration..."
aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID \
  --query 'DistributionConfig' \
  --output json > dist-config.json

# Get ETag
ETAG=$(aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID \
  --query 'ETag' \
  --output text)

echo "✅ Current config saved"
echo ""

# Update config with error pages
echo "✏️  Updating error page configuration..."

# Create custom error responses JSON
cat > error-pages.json << 'EOF'
{
  "Quantity": 2,
  "Items": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    },
    {
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    }
  ]
}
EOF

# Merge error pages into config
jq '.CustomErrorResponses = input' dist-config.json error-pages.json > updated-config.json

echo "✅ Configuration updated"
echo ""

# Apply updated config
echo "🚀 Applying configuration to CloudFront..."
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --if-match $ETAG \
  --distribution-config file://updated-config.json

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ CloudFront configuration updated successfully!"
  echo ""
  echo "📋 Changes applied:"
  echo "   - 404 errors → redirect to /index.html (200 response)"
  echo "   - 403 errors → redirect to /index.html (200 response)"
  echo "   - React Router will now handle all routes client-side"
  echo ""
  echo "⏳ CloudFront is deploying these changes..."
  echo "   This may take 10-15 minutes to propagate globally"
  echo ""
  echo "🧪 Test your routes after deployment:"
  echo "   https://your-domain.com/reviews/some-product"
  echo "   Should load without 404 errors!"
else
  echo ""
  echo "❌ Failed to update CloudFront configuration"
  echo ""
  echo "Common issues:"
  echo "  1. Check AWS credentials are configured"
  echo "  2. Verify distribution ID is correct"
  echo "  3. Ensure you have CloudFront update permissions"
  exit 1
fi

# Cleanup
rm -f dist-config.json error-pages.json updated-config.json

echo ""
echo "🎉 Configuration complete!"
