// API 配置
const API_BASE_URL = 'https://duiniang.onrender.com'; // 替换为你的 Render 后端地址

// DOM 元素
const loading = document.getElementById('loading');
const productList = document.getElementById('product-list');
const empty = document.getElementById('empty');

// 页面加载时获取商品列表
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// 加载商品列表
async function loadProducts() {
    try {
        loading.style.display = 'block';
        productList.style.display = 'none';
        empty.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            renderProducts(data.items);
            productList.style.display = 'grid';
        } else {
            empty.style.display = 'block';
        }
    } catch (error) {
        console.error('加载商品失败:', error);
        empty.style.display = 'block';
        empty.querySelector('p').textContent = '加载失败，请稍后重试';
    } finally {
        loading.style.display = 'none';
    }
}

// 渲染商品列表
function renderProducts(products) {
    productList.innerHTML = products.map(product => `
        <div class="product-card" onclick="goToDetail(${product.id})">
            <div class="image-wrapper">
                <img src="${getImageUrl(product.image_urls)}"
                     alt="${product.title}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lm77niYc8L3RleHQ+PC9zdmc+'">
            </div>
            <div class="card-content">
                <h3 class="title">${product.title}</h3>
                <p class="description">${product.description || '暂无描述'}</p>
                ${product.price ? `<p class="price">¥${product.price}</p>` : ''}
                ${product.video_url ? '<span class="video-tag">📹 有演示视频</span>' : ''}
            </div>
        </div>
    `).join('');
}

// 获取图片URL
function getImageUrl(imageUrls) {
    if (!imageUrls) {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lm77niYc8L3RleHQ+PC9zdmc+';
    }
    const urls = imageUrls.split(',');
    const firstUrl = urls[0].trim();
    if (firstUrl.startsWith('http')) {
        return firstUrl;
    }
    return `${API_BASE_URL}${firstUrl}`;
}

// 跳转到商品详情
function goToDetail(productId) {
    window.location.href = `detail.html?id=${productId}`;
}