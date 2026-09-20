// API 配置
const API_BASE_URL = 'https://duiniang.onrender.com';// 替换为你的 Render 后端地址

// DOM 元素
const loading = document.getElementById('loading');
const detailWrapper = document.getElementById('product-detail');
const errorDiv = document.getElementById('error');

// 轮播相关
let currentSlide = 0;
let totalSlides = 0;

// 页面加载时获取商品详情
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadProductDetail(productId);
    } else {
        showError();
    }
});

// 加载商品详情
async function loadProductDetail(productId) {
    try {
        loading.style.display = 'block';
        detailWrapper.style.display = 'none';
        errorDiv.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);

        if (!response.ok) {
            throw new Error('商品不存在');
        }

        const product = await response.json();
        renderProductDetail(product);
        detailWrapper.style.display = 'block';
    } catch (error) {
        console.error('加载商品详情失败:', error);
        showError();
    } finally {
        loading.style.display = 'none';
    }
}

// 渲染商品详情
function renderProductDetail(product) {
    // 设置标题
    document.getElementById('product-title').textContent = product.title;

    // 设置价格
    const priceElement = document.getElementById('product-price');
    if (product.price) {
        priceElement.textContent = `¥${product.price}`;
    } else {
        priceElement.style.display = 'none';
    }

    // 设置描述
    const descElement = document.getElementById('product-description');
    if (product.description) {
        descElement.textContent = product.description;
    } else {
        descElement.style.display = 'none';
    }

    // 处理图片轮播
    if (product.image_urls) {
        const imageUrls = product.image_urls.split(',').map(url => {
            url = url.trim();
            return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        });
        initCarousel(imageUrls);
    }

    // 处理视频
    if (product.video_url) {
        const videoSection = document.getElementById('video-section');
        const videoElement = document.getElementById('product-video');
        const videoUrl = product.video_url.startsWith('http')
            ? product.video_url
            : `${API_BASE_URL}${product.video_url}`;
        videoElement.src = videoUrl;
        videoSection.style.display = 'block';
    }

    // 存储商品ID用于预定
    window.currentProductId = product.id;
}

// 初始化图片轮播
function initCarousel(imageUrls) {
    const container = document.getElementById('carousel-container');
    const dotsContainer = document.getElementById('carousel-dots');

    totalSlides = imageUrls.length;

    // 渲染图片
    container.innerHTML = imageUrls.map(url => `
        <img src="${url}" alt="商品图片" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lm77niYc8L3RleHQ+PC9zdmc+'">
    `).join('');

    // 渲染指示点
    dotsContainer.innerHTML = imageUrls.map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
    `).join('');

    // 如果只有一张图片，隐藏指示点
    if (totalSlides <= 1) {
        dotsContainer.style.display = 'none';
    }
}

// 跳转到指定幻灯片
function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;

    currentSlide = index;
    const container = document.getElementById('carousel-container');
    container.style.transform = `translateX(-${index * 100}%)`;

    // 更新指示点
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// 显示错误
function showError() {
    loading.style.display = 'none';
    detailWrapper.style.display = 'none';
    errorDiv.style.display = 'block';
}

// 跳转到预定页面
function goToOrder() {
    if (window.currentProductId) {
        window.location.href = `order.html?product_id=${window.currentProductId}`;
    }
}