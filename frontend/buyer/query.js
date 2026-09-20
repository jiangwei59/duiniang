// API 配置
const API_BASE_URL = 'https://duiniang.onrender.com'; // 替换为你的 Render 后端地址

// 订单状态映射
const ORDER_STATUS_MAP = {
    0: { text: '待处理', class: 'status-0' },
    1: { text: '处理中', class: 'status-1' },
    2: { text: '已完成', class: 'status-2' },
    3: { text: '已取消', class: 'status-3' }
};

// DOM 元素
const queryForm = document.getElementById('query-form');
const queryPhone = document.getElementById('query-phone');
const orderListWrapper = document.getElementById('order-list-wrapper');
const orderList = document.getElementById('order-list');
const orderCount = document.getElementById('order-count');
const empty = document.getElementById('empty');
const loading = document.getElementById('loading');

// 页面加载时检查URL参数
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get('phone');
    if (phone) {
        queryPhone.value = phone;
        loadOrders(phone);
    }
});

// 表单提交
queryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = queryPhone.value.trim();
    if (phone) {
        // 更新URL参数
        const url = new URL(window.location);
        url.searchParams.set('phone', phone);
        window.history.pushState({}, '', url);

        loadOrders(phone);
    }
});

// 加载订单列表
async function loadOrders(phone) {
    try {
        loading.style.display = 'block';
        orderListWrapper.style.display = 'none';
        empty.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/api/orders/my?phone=${encodeURIComponent(phone)}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            renderOrders(data.items);
            orderListWrapper.style.display = 'block';
            orderCount.textContent = `共 ${data.total} 条`;
        } else {
            empty.style.display = 'block';
        }
    } catch (error) {
        console.error('加载订单失败:', error);
        empty.style.display = 'block';
        empty.querySelector('p').textContent = '加载失败，请稍后重试';
    } finally {
        loading.style.display = 'none';
    }
}

// 渲染订单列表
function renderOrders(orders) {
    orderList.innerHTML = orders.map(order => {
        const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP[0];
        const imageUrl = getImageUrl(order.product_image_urls);

        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-no">订单号：${order.order_no}</span>
                    <span class="order-status ${statusInfo.class}">${statusInfo.text}</span>
                </div>
                <div class="order-product">
                    <img src="${imageUrl}" alt="商品图片">
                    <div class="order-product-info">
                        <h4>${order.product_title || '商品'}</h4>
                        ${order.product_price ? `<p>¥${order.product_price}</p>` : ''}
                    </div>
                </div>
                <div class="order-info">
                    <p>姓名：${order.buyer_name}</p>
                    <p>手机号：${order.buyer_phone}</p>
                    <p>收货地址：${order.buyer_address}</p>
                    ${order.custom_remark ? `<p>备注：${order.custom_remark}</p>` : ''}
                </div>
                <div class="order-time">
                    下单时间：${formatTime(order.created_at)}
                </div>
            </div>
        `;
    }).join('');
}

// 获取图片URL
function getImageUrl(imageUrls) {
    if (!imageUrls) {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWbvueJhzwvdGV4dD48L3N2Zz4=';
    }
    const urls = imageUrls.split(',');
    const firstUrl = urls[0].trim();
    if (firstUrl.startsWith('http')) {
        return firstUrl;
    }
    return `${API_BASE_URL}${firstUrl}`;
}

// 格式化时间
function formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}