// Test script to check product data
async function testProductData() {
  try {
    console.log('🔍 Testing product data...');
    
    // Test the products API
    const productsResponse = await fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: 1 })
    });
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('✅ Products API response:', productsData);
      
      if (productsData.products && productsData.products.length > 0) {
        const product = productsData.products[0];
        console.log('📦 First product:', {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images
        });
        
        // Test the product detail API
        const detailResponse = await fetch('/api/product/detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          console.log('✅ Product detail API response:', detailData);
          
          if (detailData.product) {
            console.log('🖼️ Product images:', detailData.product.images);
          }
        } else {
          console.error('❌ Product detail API failed:', detailResponse.status);
        }
      }
    } else {
      console.error('❌ Products API failed:', productsResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductData();
