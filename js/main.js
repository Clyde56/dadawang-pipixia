// 本地存储键名
const STORAGE_KEY = 'dadawang_pipixia_data';
let currentMood = 'happy';
let timerInterval = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    const data = loadData();
    
    if (!data.userProfile.startDate) {
        document.getElementById('welcome-screen').classList.add('active');
        document.getElementById('love-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('start-btn').onclick = handleStart;
    } else {
        initMainScreen();
    }
    
    // 初始化侧边栏
    initDrawer();
    
    // 初始化日记字数统计
    document.getElementById('diary-content').addEventListener('input', function() {
        document.getElementById('word-count').textContent = this.value.length;
    });
});

// 加载数据
function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {
            userProfile: { myName: '', partnerName: '', startDate: null },
            diaries: [], anniversaries: [], moments: [], capsules: [], photos: []
        };
    } catch (e) {
        return {
            userProfile: { myName: '', partnerName: '', startDate: null },
            diaries: [], anniversaries: [], moments: [], capsules: [], photos: []
        };
    }
}

// 保存数据
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 首次开始
function handleStart() {
    const myName = document.getElementById('your-name').value.trim();
    const partnerName = document.getElementById('partner-name').value.trim();
    const loveDate = document.getElementById('love-date').value;
    
    if (!myName) { showToast('请输入你的名字'); return; }
    if (!partnerName) { showToast('请输入TA的名字'); return; }
    if (!loveDate) { showToast('请选择在一起的日期'); return; }
    
    const data = loadData();
    data.userProfile = { myName, partnerName, startDate: loveDate };
    data.anniversaries.push({ id: generateId(), name: '在一起纪念日', date: loveDate, type: 'anniversary' });
    saveData(data);
    
    showToast('欢迎回来！');
    initMainScreen();
}

// 初始化主界面
function initMainScreen() {
    document.getElementById('welcome-screen').classList.remove('active');
    document.getElementById('lock-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    
    const data = loadData();
    const p = data.userProfile;
    
    document.getElementById('user-name').textContent = p.myName || '我';
    document.getElementById('partner-name-display').textContent = (p.partnerName || 'TA') + ' ❤️';
    document.getElementById('header-title').textContent = (p.myName || '我') + ' & ' + (p.partnerName || 'TA');
    
    if (p.startDate) {
        startTimer(p.startDate);
    }
    
    refreshHome();
}

// 计时器
function startTimer(dateStr) {
    const startDate = new Date(dateStr);
    
    function update() {
        const now = new Date();
        const diff = now - startDate;
        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const totalSeconds = Math.floor(diff / 1000);
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600) % 24;
        
        // 修改：按实际天数计算年份，365天为一年
        const years = Math.floor(totalDays / 365);
        // 剩余天数
        const remainingDays = totalDays % 365;
        // 计算月数（按30天为一个月）
        const months = Math.floor(remainingDays / 30);
        const days = remainingDays % 30;
        
        document.getElementById('years').textContent = years;
        document.getElementById('months').textContent = months;
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        document.getElementById('total-days').textContent = totalDays;
    }
    
    update();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(update, 1000);
}


// 刷新首页
function refreshHome() {
    renderAnniversaryList();
    renderMomentsList();
}

// 渲染纪念日列表（首页）
function renderAnniversaryList() {
    const container = document.getElementById('anniversary-list');
    const anniversaries = loadData().anniversaries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (anniversaries.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>还没有纪念日</p></div>';
        return;
    }
    
    container.innerHTML = anniversaries.slice(0, 3).map(a => {
        const info = getNextAnniversary(a.date);
        return `
            <div class="anniversary-item">
                <div class="anniversary-icon">📅</div>
                <div class="anniversary-info">
                    <div class="anniversary-name">${escapeHtml(a.name)}</div>
                    <div class="anniversary-date">${a.date}</div>
                </div>
                <div class="anniversary-countdown">
                    <div class="countdown-days">${info.daysUntil === 0 ? '今天' : info.daysUntil}</div>
                    <div class="countdown-label">${info.daysUntil === 0 ? '' : '天后'}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染动态列表（首页）
function renderMomentsList() {
    const container = document.getElementById('moments-list');
    const moments = loadData().moments;
    
    if (moments.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">💬</div><p>还没有动态</p></div>';
        return;
    }
    
    container.innerHTML = moments.slice(0, 3).map(m => {
        const timeAgo = getTimeAgo(new Date(m.createdAt));
        return `
            <div class="moment-item">
                <div class="moment-header">
                    <span class="moment-author">${escapeHtml(m.fromUser)}</span>
                    <span class="moment-time">${timeAgo}</span>
                </div>
                <div class="moment-content">${escapeHtml(m.content)}</div>
            </div>
        `;
    }).join('');
}

// 侧边栏初始化
function initDrawer() {
    document.getElementById('menu-btn').onclick = function() {
        document.getElementById('drawer').classList.add('active');
    };
    
    document.getElementById('drawer-overlay').onclick = function() {
        document.getElementById('drawer').classList.remove('active');
    };
}

// 页面导航
function navigateTo(page, element) {
    if (element) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        element.classList.add('active');
    }
    
    document.getElementById('drawer').classList.remove('active');
    document.getElementById('main-screen').classList.remove('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    if (page === 'home') {
        document.getElementById('main-screen').classList.add('active');
        refreshHome();
    } else {
        const pageEl = document.getElementById('page-' + page);
        if (pageEl) {
            pageEl.classList.add('active');
            switch(page) {
                case 'diary': renderDiaryList('all'); break;
                case 'anniversaries': renderFullAnniversaryList(); break;
                case 'capsule': renderCapsuleList('unopened'); break;
                case 'photos': renderPhotoGrid(); break;
            }
        }
    }
}

// 渲染日记列表
function renderDiaryList(filter) {
    const container = document.getElementById('diary-list-page');
    let diaries = loadData().diaries;
    const now = new Date();
    
    switch(filter) {
        case 'today':
            diaries = diaries.filter(d => d.createdAt.startsWith(now.toISOString().split('T')[0]));
            break;
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            diaries = diaries.filter(d => new Date(d.createdAt) >= weekStart);
            break;
        case 'month':
            diaries = diaries.filter(d => d.createdAt.startsWith(now.toISOString().slice(0, 7)));
            break;
    }
    
    if (diaries.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📔</div><p>还没有日记</p></div>';
        return;
    }
    
    const moodIcons = { happy: '😊', loved: '😍', grateful: '🙏', peaceful: '😌', excited: '🤩' };
    
    container.innerHTML = diaries.map(d => {
        const date = new Date(d.createdAt);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
        return `
            <div class="diary-card">
                <div class="diary-card-header">
                    <span class="diary-card-date">${dateStr}</span>
                    <span class="diary-card-mood">${moodIcons[d.mood] || '😊'}</span>
                </div>
                <div class="diary-card-content">${escapeHtml(d.content)}</div>
                <div class="diary-card-actions">
                    <button class="delete-btn" onclick="deleteDiary('${d.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 删除日记
function deleteDiary(id) {
    if (confirm('确定要删除这篇日记吗？')) {
        const data = loadData();
        data.diaries = data.diaries.filter(d => d.id !== id);
        saveData(data);
        showToast('日记已删除');
        renderDiaryList(document.querySelector('.filter-tab.active')?.textContent === '全部' ? 'all' : 
            document.querySelector('.filter-tab.active')?.textContent === '今天' ? 'today' :
            document.querySelector('.filter-tab.active')?.textContent === '本周' ? 'week' : 'month');
    }
}

// 筛选日记
function filterDiary(filter, btn) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderDiaryList(filter);
}

// 渲染完整纪念日列表
function renderFullAnniversaryList() {
    const container = document.getElementById('anniversary-full-list');
    const anniversaries = loadData().anniversaries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (anniversaries.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>还没有纪念日</p></div>';
        return;
    }
    
    const icons = { anniversary: '💕', birthday: '🎂', custom: '📌' };
    
    container.innerHTML = anniversaries.map(a => {
        const info = getNextAnniversary(a.date);
        return `
            <div class="anniversary-card">
                <div class="anniversary-card-icon">${icons[a.type] || '📌'}</div>
                <div class="anniversary-card-info">
                    <div class="anniversary-card-name">${escapeHtml(a.name)}</div>
                    <div class="anniversary-card-date">${a.date}</div>
                </div>
                <div class="anniversary-card-countdown">
                    <div class="anniversary-card-days">${info.daysUntil === 0 ? '今天' : info.daysUntil}</div>
                    <div class="anniversary-card-label">${info.daysUntil === 0 ? '' : '天后'}</div>
                </div>
                <button class="anniversary-card-delete" onclick="deleteAnniversary('${a.id}')">🗑️</button>
            </div>
        `;
    }).join('');
}

// 删除纪念日
function deleteAnniversary(id) {
    if (confirm('确定要删除这个纪念日吗？')) {
        const data = loadData();
        data.anniversaries = data.anniversaries.filter(a => a.id !== id);
        saveData(data);
        showToast('纪念日已删除');
        renderFullAnniversaryList();
        refreshHome();
    }
}

// 渲染胶囊列表
function renderCapsuleList(status) {
    const container = document.getElementById('capsule-full-list');
    let capsules = loadData().capsules;
    
    if (status === 'unopened') {
        capsules = capsules.filter(c => !c.isOpened);
    } else {
        capsules = capsules.filter(c => c.isOpened);
    }
    
    if (capsules.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">⏳</div><p>${status === 'unopened' ? '还没有时光胶囊' : '还没有开启的胶囊'}</p></div>`;
        return;
    }
    
    container.innerHTML = capsules.map(c => {
        const canOpen = new Date(c.openDate) <= new Date();
        let statusClass, statusText;
        if (c.isOpened) { statusClass = 'opened'; statusText = '已开启'; }
        else if (canOpen) { statusClass = 'ready'; statusText = '可开启'; }
        else { statusClass = 'waiting'; statusText = '待开启'; }
        
        return `
            <div class="capsule-card ${c.isOpened ? 'opened' : ''}">
                <div class="capsule-card-header">
                    <span class="capsule-card-date">开启日期: ${c.openDate}</span>
                    <span class="capsule-card-status ${statusClass}">${statusText}</span>
                </div>
                <div class="capsule-card-content">${c.isOpened ? escapeHtml(c.content) : '内容已加密，开启后可见'}</div>
                ${canOpen && !c.isOpened ? `<button class="capsule-card-btn" onclick="openCapsule('${c.id}')">开启胶囊</button>` : ''}
            </div>
        `;
    }).join('');
}

// 筛选胶囊
function filterCapsule(status, btn) {
    document.querySelectorAll('.capsule-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderCapsuleList(status);
}

// 开启胶囊
function openCapsule(id) {
    const data = loadData();
    const capsule = data.capsules.find(c => c.id === id);
    if (capsule) {
        capsule.isOpened = true;
        saveData(data);
        showToast('胶囊已开启');
        renderCapsuleList('unopened');
    }
}

// 渲染相册
function renderPhotoGrid() {
    const container = document.getElementById('photo-grid-page');
    const photos = loadData().photos;
    
    if (photos.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🖼️</div><p>还没有照片</p></div>';
        return;
    }
    
    container.innerHTML = photos.map(p => `<img src="${p.data}" onclick="viewPhoto('${p.data}')">`).join('');
}

// 上传照片
function uploadPhotos(input) {
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = loadData();
            data.photos.push({ id: generateId(), data: e.target.result, createdAt: new Date().toISOString() });
            saveData(data);
            showToast('照片已上传');
            renderPhotoGrid();
        };
        reader.readAsDataURL(file);
    });
    input.value = '';
}

// 查看照片
function viewPhoto(src) {
    document.getElementById('photo-viewer-img').src = src;
    document.getElementById('photo-viewer').classList.add('active');
}

// 关闭照片查看器
function closePhotoViewer() {
    document.getElementById('photo-viewer').classList.remove('active');
}

// 锁屏
function lockScreen() {
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('lock-screen').classList.add('active');
}

// 解锁
document.getElementById('lock-screen').addEventListener('click', function() {
    this.classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
});

// ========== 模态框 ==========
function openModal(id) {
    document.getElementById('modal-container').classList.add('active');
    document.getElementById(id).classList.add('active');
}

function closeModal() {
    document.getElementById('modal-container').classList.remove('active');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

document.getElementById('modal-container').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

function openDiaryModal() {
    document.getElementById('diary-content').value = '';
    document.getElementById('word-count').textContent = '0';
    selectMood(document.querySelector('.mood-btn'));
    openModal('diary-modal');
}

function openMomentModal() {
    document.getElementById('moment-content').value = '';
    openModal('moment-modal');
}

function openAnniversaryModal() {
    document.getElementById('anniversary-name').value = '';
    document.getElementById('anniversary-date').value = '';
    document.getElementById('anniversary-type').value = 'custom';
    openModal('anniversary-modal');
}

function openCapsuleModal() {
    document.getElementById('capsule-content').value = '';
    document.getElementById('capsule-open-date').value = '';
    switchCapsuleTab('create', document.querySelector('#capsule-modal .tab'));
    openModal('capsule-modal');
}

function selectMood(btn) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMood = btn.dataset.mood;
}

function quickMsg(msg) {
    document.getElementById('moment-content').value = msg;
}

function switchCapsuleTab(tab, btn) {
    document.querySelectorAll('#capsule-modal .tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('capsule-create-panel').classList.toggle('active', tab === 'create');
    document.getElementById('capsule-list-panel').classList.toggle('active', tab === 'list');
    
    if (tab === 'list') {
        renderCapsuleListInModal();
    }
}

function renderCapsuleListInModal() {
    const container = document.getElementById('capsule-list-panel');
    const capsules = loadData().capsules;
    
    if (capsules.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><p>还没有时光胶囊</p></div>';
        return;
    }
    
    container.innerHTML = capsules.map(c => {
        const canOpen = new Date(c.openDate) <= new Date();
        let statusClass, statusText;
        if (c.isOpened) { statusClass = 'opened'; statusText = '已开启'; }
        else if (canOpen) { statusClass = 'ready'; statusText = '可开启'; }
        else { statusClass = 'waiting'; statusText = '待开启'; }
        
        return `
            <div class="capsule-card ${c.isOpened ? 'opened' : ''}">
                <div class="capsule-card-header">
                    <span class="capsule-card-date">${c.openDate}</span>
                    <span class="capsule-card-status ${statusClass}">${statusText}</span>
                </div>
                <div class="capsule-card-content">${c.isOpened ? escapeHtml(c.content) : '...'}</div>
                ${canOpen && !c.isOpened ? `<button class="capsule-card-btn" onclick="openCapsule('${c.id}'); switchCapsuleTab('list', document.querySelectorAll('#capsule-modal .tab')[1])">开启</button>` : ''}
            </div>
        `;
    }).join('');
}

// ========== 保存数据 ==========
function saveDiary() {
    const content = document.getElementById('diary-content').value.trim();
    if (!content) { showToast('请输入内容'); return; }
    
    const data = loadData();
    data.diaries.unshift({
        id: generateId(),
        content,
        mood: currentMood,
        createdAt: new Date().toISOString()
    });
    saveData(data);
    
    showToast('日记已保存');
    closeModal();
    refreshHome();
}

function saveMoment() {
    const content = document.getElementById('moment-content').value.trim();
    if (!content) { showToast('请输入内容'); return; }
    
    const data = loadData();
    data.moments.unshift({
        id: generateId(),
        content,
        fromUser: data.userProfile.myName || '我',
        createdAt: new Date().toISOString()
    });
    saveData(data);
    
    showToast('动态已发布');
    closeModal();
    refreshHome();
}

function saveAnniversary() {
    const name = document.getElementById('anniversary-name').value.trim();
    const date = document.getElementById('anniversary-date').value;
    const type = document.getElementById('anniversary-type').value;
    
    if (!name || !date) { showToast('请填写完整信息'); return; }
    
    const data = loadData();
    data.anniversaries.push({ id: generateId(), name, date, type });
    saveData(data);
    
    showToast('纪念日已添加');
    closeModal();
    refreshHome();
    renderFullAnniversaryList();
}

function createCapsule() {
    const content = document.getElementById('capsule-content').value.trim();
    const openDate = document.getElementById('capsule-open-date').value;
    
    if (!content) { showToast('请输入胶囊内容'); return; }
    if (!openDate) { showToast('请选择开启日期'); return; }
    if (new Date(openDate) <= new Date()) { showToast('开启日期必须大于今天'); return; }
    
    const data = loadData();
    data.capsules.push({
        id: generateId(),
        content,
        openDate,
        isOpened: false,
        createdAt: new Date().toISOString()
    });
    saveData(data);
    
    showToast('胶囊已封存');
    closeModal();
}

// 设置
document.getElementById('settings-btn').onclick = function() {
    const p = loadData().userProfile;
    document.getElementById('setting-my-name').value = p.myName || '';
    document.getElementById('setting-partner-name').value = p.partnerName || '';
    document.getElementById('setting-love-date').value = p.startDate || '';
    openModal('settings-modal');
};

function saveSettings() {
    const data = loadData();
    data.userProfile.myName = document.getElementById('setting-my-name').value;
    data.userProfile.partnerName = document.getElementById('setting-partner-name').value;
    const newDate = document.getElementById('setting-love-date').value;
    
    if (newDate && newDate !== data.userProfile.startDate) {
        data.userProfile.startDate = newDate;
        startTimer(newDate);
    }
    
    saveData(data);
    showToast('设置已保存');
    closeModal();
    
    document.getElementById('user-name').textContent = data.userProfile.myName || '我';
    document.getElementById('partner-name-display').textContent = (data.userProfile.partnerName || 'TA') + ' ❤️';
    document.getElementById('header-title').textContent = (data.userProfile.myName || '我') + ' & ' + (data.userProfile.partnerName || 'TA');
}

// ========== 备份 ==========
function exportData() {
    const data = loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `大大王皮皮虾_备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('正在导出...');
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            JSON.parse(e.target.result);
            if (confirm('确定要导入数据吗？这将覆盖现有数据！')) {
                localStorage.setItem(STORAGE_KEY, e.target.result);
                showToast('导入成功！');
                setTimeout(() => location.reload(), 1000);
            }
        } catch (err) {
            showToast('导入失败，文件格式错误');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function resetAllData() {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

// ========== 显示全部动态 ==========
function showAllMoments() {
    const moments = loadData().moments;
    let html = '<div style="max-height:60vh;overflow-y:auto;">';
    moments.forEach(m => {
        const timeAgo = getTimeAgo(new Date(m.createdAt));
        html += `
            <div class="moment-item" style="margin-bottom:12px;">
                <div class="moment-header">
                    <span class="moment-author">${escapeHtml(m.fromUser)}</span>
                    <span class="moment-time">${timeAgo}</span>
                </div>
                <div class="moment-content">${escapeHtml(m.content)}</div>
            </div>
        `;
    });
    html += '</div>';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.maxWidth = '450px';
    modal.innerHTML = `
        <div class="modal-header">
            <h3>全部动态</h3>
            <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">${html}</div>
    `;
    document.getElementById('modal-container').classList.add('active');
    document.body.appendChild(modal);
}

// ========== 工具函数 ==========
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return days + '天前';
    if (hours > 0) return hours + '小时前';
    if (minutes > 0) return minutes + '分钟前';
    return '刚刚';
}

function getNextAnniversary(dateStr) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const anniversary = new Date(dateStr);
    const year = anniversary < today ? today.getFullYear() + 1 : today.getFullYear();
    const nextDate = new Date(year, anniversary.getMonth(), anniversary.getDate());
    return { daysUntil: Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)) };
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
