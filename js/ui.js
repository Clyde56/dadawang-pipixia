/**
 * UI模块
 * 负责界面渲染、事件处理和交互逻辑
 */

const UI = (function() {
    // DOM元素缓存
    const elements = {};
    
    // 当前选中的心情
    let selectedMood = 'happy';

    /**
     * 初始化UI模块
     */
    function init() {
        cacheElements();
        bindEvents();
        renderAnniversaries();
        renderMoments();
    }

    /**
     * 缓存DOM元素
     */
    function cacheElements() {
        elements.app = document.getElementById('app');
        elements.welcomeScreen = document.getElementById('welcome-screen');
        elements.mainScreen = document.getElementById('main-screen');
        elements.menuBtn = document.getElementById('menu-btn');
        elements.settingsBtn = document.getElementById('settings-btn');
        elements.drawer = document.getElementById('drawer');
        elements.drawerOverlay = elements.drawer.querySelector('.drawer-overlay');
        elements.modalContainer = document.getElementById('modal-container');
        elements.toast = document.getElementById('toast');
        elements.loading = document.getElementById('loading');
        
        // 计时器元素
        elements.years = document.getElementById('years');
        elements.months = document.getElementById('months');
        elements.days = document.getElementById('days');
        elements.hours = document.getElementById('hours');
        elements.minutes = document.getElementById('minutes');
        elements.seconds = document.getElementById('seconds');
        elements.daysCount = document.getElementById('days-count');
        
        // 列表容器
        elements.anniversaryList = document.getElementById('anniversary-list');
        elements.momentsList = document.getElementById('moments-list');
        elements.todayMemories = document.getElementById('today-memories');
        
        // 模态框
        elements.diaryModal = document.getElementById('diary-modal');
        elements.momentModal = document.getElementById('moment-modal');
        elements.settingsModal = document.getElementById('settings-modal');
    }

    /**
     * 绑定事件
     */
    function bindEvents() {
        // 欢迎页按钮
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', handleStart);
        }
        
        // 菜单按钮
        if (elements.menuBtn) {
            elements.menuBtn.addEventListener('click', toggleDrawer);
        }
        
        // 设置按钮
        if (elements.settingsBtn) {
            elements.settingsBtn.addEventListener('click', openSettings);
        }
        
        // 抽屉遮罩
        if (elements.drawerOverlay) {
            elements.drawerOverlay.addEventListener('click', closeDrawer);
        }
        
        // 关闭模态框按钮
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // 模态框外部点击关闭
        if (elements.modalContainer) {
            elements.modalContainer.addEventListener('click', (e) => {
                if (e.target === elements.modalContainer) {
                    closeAllModals();
                }
            });
        }
        
        // 心情选择
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => selectMood(btn.dataset.mood));
        });
        
        // 快捷操作按钮
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', handleQuickAction);
        });
        
        // 底部导航
        document.querySelectorAll('.bottom-nav .nav-link').forEach(link => {
            link.addEventListener('click', handleBottomNav);
        });
        
        // 侧边栏导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', handleDrawerNav);
        });
        
        // 发布日记按钮
        const publishDiaryBtn = document.getElementById('publish-diary');
        if (publishDiaryBtn) {
            publishDiaryBtn.addEventListener('click', handlePublishDiary);
        }
        
        // 发布动态按钮
        const publishMomentBtn = document.getElementById('publish-moment');
        if (publishMomentBtn) {
            publishMomentBtn.addEventListener('click', handlePublishMoment);
        }
        
        // 快捷消息按钮
        document.querySelectorAll('.quick-msg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('moment-content');
                if (input) {
                    input.value = btn.dataset.msg;
                }
            });
        });
        
        // 照片上传
        const uploadBtns = document.querySelectorAll('.upload-btn');
        uploadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input[type="file"]');
                if (input) input.click();
            });
        });
        
        // 保存设置
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', handleSaveSettings);
        }
    }

    /**
     * 处理开始按钮点击
     */
    function handleStart() {
        const myName = document.getElementById('your-name').value.trim();
        const partnerName = document.getElementById('partner-name').value.trim();
        const loveDate = document.getElementById('love-date').value;
        
        if (!myName) {
            showToast('请输入你的名字');
            return;
        }
        
        if (!partnerName) {
            showToast('请输入TA的名字');
            return;
        }
        
        if (!loveDate) {
            showToast('请选择在一起的日期');
            return;
        }
        
        // 保存用户配置
        Storage.saveUserProfile({
            myName,
            partnerName,
            startDate: loveDate
        });
        
        // 添加默认纪念日
        Storage.addAnniversary({
            name: '在一起纪念日',
            date: loveDate,
            type: 'anniversary'
        });
        
        // 初始化计时器
        const userProfile = Storage.getUserProfile();
        Timer.init(userProfile.startDate, updateTimerDisplay);
        
        // 切换到主界面
        elements.welcomeScreen.classList.add('hidden');
        elements.mainScreen.classList.remove('hidden');
        
        // 更新用户名称显示
        document.getElementById('user-name').textContent = userProfile.myName;
        document.getElementById('partner-name-display').textContent = `${userProfile.partnerName} ❤️`;
        
        showToast('欢迎回来！');
    }

    /**
     * 更新计时器显示
     */
    function updateTimerDisplay(timeData) {
        if (elements.years) {
            elements.years.textContent = timeData.years;
        }
        if (elements.months) {
            elements.months.textContent = timeData.months;
        }
        if (elements.days) {
            elements.days.textContent = timeData.days;
        }
        if (elements.hours) {
            elements.hours.textContent = timeData.hours.toString().padStart(2, '0');
        }
        if (elements.minutes) {
            elements.minutes.textContent = timeData.minutes.toString().padStart(2, '0');
        }
        if (elements.seconds) {
            elements.seconds.textContent = timeData.seconds.toString().padStart(2, '0');
        }
        if (elements.daysCount) {
            elements.daysCount.querySelector('.highlight').textContent = timeData.totalDays;
        }
    }

    /**
     * 渲染纪念日列表
     */
    function renderAnniversaries() {
        if (!elements.anniversaryList) return;
        
        const anniversaries = Storage.getAnniversaries();
        const now = new Date();
        
        // 过滤出即将到来的纪念日
        const upcoming = anniversaries
            .map(a => {
                const nextAnniversary = Timer.getNextAnniversary(a.date);
                return nextAnniversary ? { ...a, ...nextAnniversary } : null;
            })
            .filter(a => a && a.daysUntil >= 0)
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 3);
        
        if (upcoming.length === 0) {
            elements.anniversaryList.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <p class="empty-state-description">添加第一个纪念日吧</p>
                </div>
            `;
            return;
        }
        
        elements.anniversaryList.innerHTML = upcoming.map(a => `
            <div class="anniversary-item">
                <div class="anniversary-icon">
                    <i class="ri-calendar-event-line"></i>
                </div>
                <div class="anniversary-info">
                    <div class="anniversary-name">${escapeHtml(a.name)}</div>
                    <div class="anniversary-date">${formatDateShort(new Date(a.date))}</div>
                </div>
                <div class="anniversary-countdown">
                    <div class="countdown-days">${a.daysUntil === 0 ? '今天' : a.daysUntil}</div>
                    <div class="countdown-label">${a.daysUntil === 0 ? '是纪念日' : '天后'}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 渲染动态列表
     */
    function renderMoments() {
        if (!elements.momentsList) return;
        
        const moments = Moments.getList(5);
        Moments.renderList(moments, elements.momentsList);
    }

    /**
     * 切换抽屉
     */
    function toggleDrawer() {
        elements.drawer.classList.toggle('active');
    }

    /**
     * 关闭抽屉
     */
    function closeDrawer() {
        elements.drawer.classList.remove('active');
    }

    /**
     * 打开设置
     */
    function openSettings() {
        const userProfile = Storage.getUserProfile();
        
        document.getElementById('setting-my-name').value = userProfile.myName || '';
        document.getElementById('setting-partner-name').value = userProfile.partnerName || '';
        document.getElementById('setting-love-date').value = userProfile.startDate || '';
        document.getElementById('setting-theme').value = Storage.getItem('settings')?.theme || 'warm';
        
        openModal(elements.settingsModal);
    }

    /**
     * 打开模态框
     */
    function openModal(modal) {
        if (!modal) return;
        
        // 关闭其他模态框
        closeAllModals();
        
        elements.modalContainer.classList.add('active');
        modal.style.display = 'block';
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    /**
     * 关闭所有模态框
     */
    function closeAllModals() {
        elements.modalContainer.classList.remove('active');
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }

    /**
     * 选择心情
     */
    function selectMood(mood) {
        selectedMood = mood;
        
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === mood);
        });
    }

    /**
     * 处理快捷操作
     */
    function handleQuickAction(e) {
        const action = e.currentTarget.dataset.action;
        
        switch (action) {
            case 'diary':
                openModal(elements.diaryModal);
                break;
            case 'moment':
                openModal(elements.momentModal);
                break;
            case 'photo':
                // 触发照片上传
                const photoInput = document.createElement('input');
                photoInput.type = 'file';
                photoInput.accept = 'image/*';
                photoInput.multiple = true;
                photoInput.click();
                break;
            case 'capsule':
                // TODO: 时光胶囊功能
                showToast('时光胶囊功能即将上线');
                break;
        }
    }

    /**
     * 处理底部导航点击
     */
    function handleBottomNav(e) {
        e.preventDefault();
        
        const page = e.currentTarget.dataset.page;
        
        document.querySelectorAll('.bottom-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // 根据页面切换内容
        switch (page) {
            case 'diary':
                showToast('日记功能');
                break;
            case 'moments':
                showToast('动态');
                break;
            case 'profile':
                showToast('个人中心');
                break;
        }
    }

    /**
     * 处理侧边栏导航点击
     */
    function handleDrawerNav(e) {
        e.preventDefault();
        
        const page = e.currentTarget.dataset.page;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        closeDrawer();
        
        switch (page) {
            case 'home':
                // 主页
                break;
            case 'diary':
                openModal(elements.diaryModal);
                break;
            case 'anniversaries':
                showToast('纪念日管理');
                break;
            case 'backup':
                Storage.exportData();
                showToast('正在导出数据...');
                break;
        }
    }

    /**
     * 发布日记
     */
    async function handlePublishDiary() {
        const content = document.getElementById('diary-content').value.trim();
        
        if (!content) {
            showToast('请输入日记内容');
            return;
        }
        
        // 获取照片
        const photoPreviews = document.querySelectorAll('#photo-preview img');
        const images = Array.from(photoPreviews).map(img => img.src);
        
        const result = Diary.create({
            content,
            mood: selectedMood,
            images
        });
        
        if (result.success) {
            showToast('日记已保存');
            closeAllModals();
            
            // 清空表单
            document.getElementById('diary-content').value = '';
            document.getElementById('photo-preview').innerHTML = '';
            selectMood('happy');
        } else {
            showToast(result.message);
        }
    }

    /**
     * 发布动态
     */
    function handlePublishMoment() {
        const content = document.getElementById('moment-content').value.trim();
        
        if (!content) {
            showToast('请输入动态内容');
            return;
        }
        
        const result = Moments.publish({
            type: Moments.MOMENT_TYPES.MESSAGE,
            content
        });
        
        if (result.success) {
            showToast('动态已发布');
            closeAllModals();
            document.getElementById('moment-content').value = '';
            renderMoments();
        } else {
            showToast(result.message);
        }
    }

    /**
     * 保存设置
     */
    function handleSaveSettings() {
        const myName = document.getElementById('setting-my-name').value.trim();
        const partnerName = document.getElementById('setting-partner-name').value.trim();
        const loveDate = document.getElementById('setting-love-date').value;
        const theme = document.getElementById('setting-theme').value;
        
        if (!myName || !partnerName || !loveDate) {
            showToast('请填写完整信息');
            return;
        }
        
        Storage.saveUserProfile({
            myName,
            partnerName,
            startDate: loveDate
        });
        
        // 保存主题设置
        const settings = Storage.getItem('settings') || {};
        settings.theme = theme;
        Storage.setItem('settings', settings);
        
        closeAllModals();
        
        // 重新初始化计时器
        const userProfile = Storage.getUserProfile();
        Timer.setStartDate(userProfile.startDate);
        
        // 更新界面显示
        document.getElementById('user-name').textContent = userProfile.myName;
        document.getElementById('partner-name-display').textContent = `${userProfile.partnerName} ❤️`;
        
        showToast('设置已保存');
    }

    /**
     * 显示Toast提示
     */
    function showToast(message) {
        if (!elements.toast) return;
        
        elements.toast.querySelector('.toast-message').textContent = message;
        elements.toast.classList.add('show');
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 2500);
    }

    /**
     * 显示Loading
     */
    function showLoading() {
        if (elements.loading) {
            elements.loading.classList.add('show');
        }
    }

    /**
     * 隐藏Loading
     */
    function hideLoading() {
        if (elements.loading) {
            elements.loading.classList.remove('show');
        }
    }

    /**
     * HTML转义
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 格式化日期简写
     */
    function formatDateShort(date) {
        const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return `${date.getFullYear()}.${months[date.getMonth()]}.${date.getDate()}`;
    }

    // 暴露公开API
    return {
        init,
        updateTimerDisplay,
        renderAnniversaries,
        renderMoments,
        showToast,
        showLoading,
        hideLoading,
        openModal,
        closeAllModals,
        toggleDrawer,
        closeDrawer
    };
})();

// 导出到全局
window.UI = UI;
