// API 配置
const API_BASE_URL = 'https://duiniang.onrender.com';// 替换为你的 Render 后端地址

// 检查登录状态
const token = localStorage.getItem('seller_token');
if (!token) {
    window.location.href = 'login.html';
}

// 显示用户名
document.getElementById('nav-user').textContent = `欢迎，${localStorage.getItem('seller_username') || '管理员'}`;

// 订单状态映射
const ORDER_STATUS_MAP = {
    0: { text: '待处理', class: 'status-0' },
    1: { text: '处理中', class: 'status-1' },
    2: { text: '已完成', class: 'status-2' },
    3: { text: '已取消', class: 'status-3' }
};

// 分页状态
let currentPage = 1;
const pageSize = 10;
let totalOrders = 0;
let currentFilter = '';

// DOM 元素
const loading = document.getElementById('loading');
const orderTable = document.getElementById('order-table');
const orderList = document.getElementById('order-list');
const empty = document.getElementById('empty');
const pagination = document.getElementById('pagination');
const modal = document.getElementById('order-modal');

// 页面加载时获取订单列表
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

// 加载订单列表
async function loadOrders(page = 1, status = '') {
    try {
        loading.style.display = 'block';
        orderTable.style.display = 'none';
        empty.style.display = 'none';
        pagination.style.display = 'none';

        let url = `${API_BASE_URL}/api/orders?page=${page}&page_size=${pageSize}`;
        if (status !== '') {
            url += `&status=${status}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const data = await response.json();
        totalOrders = data.total;
        currentPage = page;

        if (data.items && data.items.length > 0) {
            renderOrders(data.items);
            orderTable.style.display = 'block';
            renderPagination();
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

        return `
            <tr>
                <td>
                    <span class="order-no">${order.order_no}</span>
                </td>
                <td>${order.product_title || '-'}</td>
                <td>
                    <div>${order.buyer_name}</div>
                    <div style="font-size:12px;color:#999;">${order.buyer_phone}</div>
                </td>
                <td>
                    <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                </td>
                <td>${formatTime(order.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-process" onclick="viewOrder(${order.id})">查看</button>
                        ${order.status === 0 ? `<button class="btn-process" onclick="updateStatus(${order.id}, 1)">处理</button>` : ''}
                        ${order.status === 1 ? `<button class="btn-complete" onclick="updateStatus(${order.id}, 2)">完成</button>` : ''}
                        ${order.status < 2 ? `<button class="btn-cancel" onclick="updateStatus(${order.id}, 3)">取消</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 渲染分页
function renderPagination() {
    const totalPages = Math.ceil(totalOrders / pageSize);
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    let html = '';

    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="loadOrders(${currentPage - 1}, '${currentFilter}')">上一页</button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadOrders(${i}, '${currentFilter}')">${i}</button>`;
    }

    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="loadOrders(${currentPage + 1}, '${currentFilter}')">下一页</button>`;

    pagination.innerHTML = html;
}

// 筛选订单
function filterOrders(btn, status) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = status;
    loadOrders(1, status);
}

// 查看订单详情
async function viewOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const order = await response.json();
            renderOrderDetail(order);
            modal.classList.add('show');
        }
    } catch (error) {
        console.error('获取订单详情失败:', error);
        alert('获取订单详情失败');
    }
}

// 渲染订单详情
function renderOrderDetail(order) {
    const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP[0];

    document.getElementById('order-detail').innerHTML = `
        <div class="detail-item">
            <label>订单号</label>
            <p>${order.order_no}</p>
        </div>
        <div class="detail-item">
            <label>订单状态</label>
            <p><span class="status-badge ${statusInfo.class}">${statusInfo.text}</span></p>
        </div>
        <div class="detail-item">
            <label>商品名称</label>
            <p>${order.product_title || '-'}</p>
        </div>
        <div class="detail-item">
            <label>买家姓名</label>
            <p>${order.buyer_name}</p>
        </div>
        <div class="detail-item">
            <label>买家手机号</label>
            <p>${order.buyer_phone}</p>
        </div>
        <div class="detail-item">
            <label>收货地址</label>
            <p>${order.buyer_address}</p>
        </div>
        ${order.custom_remark ? `
        <div class="detail-item">
            <label>备注</label>
            <p>${order.custom_remark}</p>
        </div>
        ` : ''}
        <div class="detail-item">
            <label>下单时间</label>
            <p>${formatTime(order.created_at)}</p>
        </div>
    `;
}

// 关闭模态框
function closeModal() {
    modal.classList.remove('show');
}

// 更新订单状态
async function updateStatus(orderId, newStatus) {
    const statusText = ORDER_STATUS_MAP[newStatus].text;
    if (!confirm(`确定要将订单状态更改为"${statusText}"吗？`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('状态更新成功');
            loadOrders(currentPage, currentFilter);
        } else {
            alert('状态更新失败');
        }
    } catch (error) {
        console.error('更新订单状态失败:', error);
        alert('更新失败，请稍后重试');
    }
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