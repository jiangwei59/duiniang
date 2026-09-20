// API 配置
const API_BASE_URL = 'https://duiniang.onrender.com'; // 替换为你的 Render 后端地址

// 检查登录状态
const token = localStorage.getItem('seller_token');
if (!token) {
    window.location.href = 'login.html';
}

// 显示用户名
document.getElementById('nav-user').textContent = `欢迎，${localStorage.getItem('seller_username') || '管理员'}`;

// 分页状态
let currentPage = 1;
const pageSize = 10;
let totalProducts = 0;

// DOM 元素
const loading = document.getElementById('loading');
const productTable = document.getElementById('product-table');
const productList = document.getElementById('product-list');
const empty = document.getElementById('empty');
const pagination = document.getElementById('pagination');
const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productForm = document.getElementById('product-form');

// 页面加载时获取商品列表
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// 加载商品列表
async function loadProducts(page = 1) {
    try {
        loading.style.display = 'block';
        productTable.style.display = 'none';
        empty.style.display = 'none';
        pagination.style.display = 'none';

        const response = await fetch(
            `${API_BASE_URL}/api/products/all?page=${page}&page_size=${pageSize}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            logout();
            return;
        }

        const data = await response.json();
        totalProducts = data.total;
        currentPage = page;

        if (data.items && data.items.length > 0) {
            renderProducts(data.items);
            productTable.style.display = 'block';
            renderPagination();
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
        <tr>
            <td>
                <img class="product-image" src="${getImageUrl(product.image_urls)}" alt="商品图片">
            </td>
            <td>${product.title}</td>
            <td>${product.price ? `¥${product.price}` : '-'}</td>
            <td>
                <span class="status-badge status-${product.status}">
                    ${product.status === 1 ? '上架' : '下架'}
                </span>
            </td>
            <td>${formatTime(product.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id}, '${product.title}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 渲染分页
function renderPagination() {
    const totalPages = Math.ceil(totalProducts / pageSize);
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    let html = '';

    // 上一页
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="loadProducts(${currentPage - 1})">上一页</button>`;

    // 页码
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
    }

    // 下一页
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="loadProducts(${currentPage + 1})">下一页</button>`;

    pagination.innerHTML = html;
}

// 获取图片URL
function getImageUrl(imageUrls) {
    if (!imageUrls) {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWbvueJhzwvdGV4dD48L3N2Zz4=';
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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
}

// 打开添加模态框
function openAddModal() {
    modalTitle.textContent = '添加商品';
    productForm.reset();
    document.getElementById('product-id').value = '';
    modal.classList.add('show');
}

// 打开编辑模态框
async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const product = await response.json();
            modalTitle.textContent = '编辑商品';
            document.getElementById('product-id').value = product.id;
            document.getElementById('title').value = product.title || '';
            document.getElementById('description').value = product.description || '';
            document.getElementById('price').value = product.price || '';
            document.getElementById('image-urls').value = product.image_urls || '';
            document.getElementById('video-url').value = product.video_url || '';
            document.getElementById('status').value = product.status;
            modal.classList.add('show');
        }
    } catch (error) {
        console.error('获取商品详情失败:', error);
        alert('获取商品详情失败');
    }
}

// 关闭模态框
function closeModal() {
    modal.classList.remove('show');
}

// 保存商品
async function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const formData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: document.getElementById('price').value ? parseFloat(document.getElementById('price').value) : null,
        image_urls: document.getElementById('image-urls').value.trim(),
        video_url: document.getElementById('video-url').value.trim(),
        status: parseInt(document.getElementById('status').value)
    };

    if (!formData.title) {
        alert('请输入商品名称');
        return;
    }

    try {
        const url = productId
            ? `${API_BASE_URL}/api/products/${productId}`
            : `${API_BASE_URL}/api/products`;
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeModal();
            loadProducts(currentPage);
            alert(productId ? '商品更新成功' : '商品添加成功');
        } else {
            const error = await response.json();
            alert(error.detail || '保存失败');
        }
    } catch (error) {
        console.error('保存商品失败:', error);
        alert('保存失败，请稍后重试');
    }
}

// 删除商品
async function deleteProduct(productId, productTitle) {
    if (!confirm(`确定要删除商品"${productTitle}"吗？此操作不可恢复。`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('商品删除成功');
            loadProducts(currentPage);
        } else {
            alert('删除失败');
        }
    } catch (error) {
        console.error('删除商品失败:', error);
        alert('删除失败，请稍后重试');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_username');
    window.location.href = 'login.html';
}

// 点击模态框外部关闭
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});