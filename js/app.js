/**
 * 应用主入口
 * 负责初始化整个应用
 */

(function() {
    'use strict';

    /**
     * 应用初始化
     */
    function init() {
        // 检查是否首次使用
        if (Storage.isFirstUse()) {
            // 显示欢迎页
            showWelcomeScreen();
        } else {
            // 初始化主界面
            initMainScreen();
        }
        
        // 初始化UI模块
        UI.init();
        
        console.log('大大王&皮皮虾 已启动 ❤️');
    }

    /**
     * 显示欢迎页
     */
    function showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainScreen = document.getElementById('main-screen');
        
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
        if (mainScreen) {
            mainScreen.classList.add('hidden');
        }
        
        // 设置默认日期为今天
        const dateInput = document.getElementById('love-date');
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            dateInput.value = formattedDate;
        }
    }

    /**
     * 初始化主界面
     */
    function initMainScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainScreen = document.getElementById('main-screen');
        
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        if (mainScreen) {
            mainScreen.classList.remove('hidden');
        }
        
        // 获取用户配置
        const userProfile = Storage.getUserProfile();
        
        if (userProfile.startDate) {
            // 初始化计时器
            Timer.init(userProfile.startDate, UI.updateTimerDisplay);
        }
        
        // 更新界面显示
        const userNameEl = document.getElementById('user-name');
        const partnerNameDisplay = document.getElementById('partner-name-display');
        
        if (userNameEl) {
            userNameEl.textContent = userProfile.myName || '我';
        }
        if (partnerNameDisplay) {
            partnerNameDisplay.textContent = `${userProfile.partnerName || 'TA'} ❤️`;
        }
        
        // 渲染纪念日和动态
        UI.renderAnniversaries();
        UI.renderMoments();
    }

    /**
     * 全局错误处理
     */
    window.addEventListener('error', function(event) {
        console.error('应用错误:', event.error);
        UI.showToast('发生了错误，请刷新页面重试');
    });

    /**
     * 处理未处理的Promise拒绝
     */
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的Promise错误:', event.reason);
        event.preventDefault();
    });

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
