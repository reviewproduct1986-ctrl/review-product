#!/usr/bin/env node

/**
 * Generate SEO-optimized blog posts for products using Claude AI
 * Updates blogs.json - No HTML generation needed (React Router handles rendering)
 */

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Read products from JSON file
 */
function loadProducts() {
  // Try both locations: public/data and data
  const publicPath = path.join(__dirname, '../public/data/products.json');
  const dataPath = path.join(__dirname, '../data/products.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
    console.log(`📂 Using data/products.json (should be in public/data/ for React)`);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ products.json not found!');
    console.error('   Checked: public/data/products.json and data/products.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return data.products || data; // Support both wrapped and unwrapped formats
}

/**
 * Read existing blogs to avoid regenerating
 */
function loadExistingBlogs() {
  // Try both locations
  const publicPath = path.join(__dirname, '../public/data/blogs.json');
  const dataPath = path.join(__dirname, '../data/blogs.json');
  
  let filePath = publicPath;
  if (!fs.existsSync(publicPath) && fs.existsSync(dataPath)) {
    filePath = dataPath;
  }
  
  if (!fs.existsSync(filePath)) {
    return { posts: [], metadata: {} };
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Generate blog post for a product using Claude AI
 */
async function generateBlogPost(product) {
  console.log(`📝 Generating blog post for: ${product.title}`);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Write a comprehensive, SEO-optimized blog post review about this product:

Product: ${product.title}
Category: ${product.category}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviews.toLocaleString()} reviews)
Features: ${product.features?.join(', ') || 'N/A'}
Description: ${product.description || ''}
ASIN: ${product.asin || 'N/A'}

Requirements:
1. Engaging, SEO-friendly headline (60-70 characters)
2. Meta description (150-160 characters)
3. Comprehensive review in MARKDOWN format with:
   - Introduction highlighting key benefits
   - Multiple ## sections for detailed features
   - Real-world use cases
   - Detailed analysis of performance
4. 7 specific pros (not generic)
5. 3-4 specific cons
6. Final verdict paragraph (3-4 sentences)
7. Target audience paragraph (who should buy this)
8. 8-10 SEO keywords
9. URL slug (lowercase, hyphens, include product name and "review")

IMPORTANT: 
- Content should be in MARKDOWN with ## headings for sections
- Write 600-800 words of actual review content
- Be specific about features, not generic
- Include numbers and specific details from the product info

Format as JSON with these exact fields:
{
  "title": "...",
  "slug": "...",
  "metaDescription": "...",
  "content": "Full markdown content with ## headings...",
  "keywords": ["...", "..."],
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "verdict": "...",
  "targetAudience": "..."
}`
          }
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === "text")?.text || "";
    
    // Clean JSON from markdown code fences
    const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const blogData = JSON.parse(cleanJson);

    return {
      id: `blog-${product.id}`,
      productId: product.id,
      asin: product.asin,
      ...blogData,
      publishedDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error generating blog for ${product.title}:`, error.message);
    return null;
  }
}

/**
 * Generate blog posts for products that don't have them yet
 */
async function generateMissingBlogs(products, existingBlogs) {
  const existingProductIds = new Set(existingBlogs.posts.map(b => b.productId));
  const productsNeedingBlogs = products.filter(p => !existingProductIds.has(p.id));
  
  if (productsNeedingBlogs.length === 0) {
    console.log('✅ All products already have blog posts!');
    return existingBlogs.posts;
  }

  console.log(`🤖 Generating blog posts for ${productsNeedingBlogs.length} products...`);
  
  const newBlogPosts = [];
  
  // Generate posts sequentially to avoid rate limits
  for (const product of productsNeedingBlogs) {
    const blog = await generateBlogPost(product);
    if (blog) {
      newBlogPosts.push(blog);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Combine existing and new blogs
  return [...existingBlogs.posts, ...newBlogPosts];
}

/**
 * Save blog posts to JSON (no HTML files needed with React Router)
 */
function saveBlogPosts(blogPosts) {
  // Save to both data/ and public/data/ for compatibility
  const dataDirPublic = path.join(__dirname, '../public/data');
  const dataDir = path.join(__dirname, '../data');
  
  // Create directories if needed
  if (!fs.existsSync(dataDirPublic)) {
    fs.mkdirSync(dataDirPublic, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const blogsData = {
    posts: blogPosts,
    metadata: {
      totalPosts: blogPosts.length,
      lastUpdated: new Date().toISOString(),
      categories: [...new Set(blogPosts.map(b => {
        // Get category from first product in products.json that matches
        const publicPath = path.join(dataDirPublic, 'products.json');
        const localPath = path.join(dataDir, 'products.json');
        const productsFile = fs.existsSync(publicPath) ? publicPath : localPath;
        
        if (fs.existsSync(productsFile)) {
          const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
          const productList = products.products || products;
          const product = productList.find(p => p.id === b.productId);
          return product?.category || 'Uncategorized';
        }
        return 'Uncategorized';
      }))]
    }
  };
  
  // Save to both locations
  const jsonPathPublic = path.join(dataDirPublic, 'blogs.json');
  const jsonPath = path.join(dataDir, 'blogs.json');
  
  fs.writeFileSync(jsonPathPublic, JSON.stringify(blogsData, null, 2));
  fs.writeFileSync(jsonPath, JSON.stringify(blogsData, null, 2));
  
  console.log(`✅ Saved ${blogPosts.length} blog posts to:`);
  console.log(`   - ${jsonPathPublic}`);
  console.log(`   - ${jsonPath}`);
  console.log(`   React Router will handle rendering at /reviews/:slug`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting blog generation...');
    console.log('   (React Router architecture - no HTML files needed)');
    
    // Validate API key
    if (!ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY environment variable not set!');
      console.error('   Set it with: export ANTHROPIC_API_KEY=your_key_here');
      process.exit(1);
    }

    const products = loadProducts();
    console.log(`📦 Loaded ${products.length} products`);

    const existingBlogs = loadExistingBlogs();
    console.log(`📄 Found ${existingBlogs.posts.length} existing blog posts`);

    const allBlogs = await generateMissingBlogs(products, existingBlogs);
    
    if (allBlogs.length === 0) {
      console.warn('⚠️  No blog posts to save!');
      return;
    }

    saveBlogPosts(allBlogs);
    
    console.log('🎉 Blog generation completed successfully!');
    console.log(`   - Total posts: ${allBlogs.length}`);
    console.log(`   - New posts: ${allBlogs.length - existingBlogs.posts.length}`);
    console.log(`   - Average keywords: ${(allBlogs.reduce((sum, b) => sum + b.keywords.length, 0) / allBlogs.length).toFixed(1)}`);
    console.log('');
    console.log('📍 Blog posts available at:');
    allBlogs.forEach(blog => {
      console.log(`   - /reviews/${blog.slug}`);
    });
    console.log('');
    console.log('💡 Next step: Run generate-sitemap.js to update sitemap.xml');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();