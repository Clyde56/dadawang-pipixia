(function() {
    // 页面加载完成初始化
    document.addEventListener('DOMContentLoaded', function() {
        UI.init();
        
        if (Storage.isFirstUse()) {
            // 显示欢迎页
            document.getElementById('welcome-screen').classList.remove('hidden');
            document.getElementById('main-screen').classList.add('hidden');
            
            // 设置默认日期为今天
            document.getElementById('love-date').value = new Date().toISOString().split('T')[0];
            
            // 开始按钮
            document.getElementById('start-btn').addEventListener('click', function() {
                const myName = document.getElementById('your-name').value.trim();
                const partnerName = document.getElementById('partner-name').value.trim();
                const loveDate = document.getElementById('love-date').value;
                
                if (!myName) { UI.showToast('请输入你的名字'); return; }
                if (!partnerName) { UI.showToast('请输入TA的名字'); return; }
                if (!loveDate) { UI.showToast('请选择在一起的日期'); return; }
                
                Storage.saveUserProfile({ myName, partnerName, startDate: loveDate });
                Storage.addAnniversary({ name: '在一起纪念日', date: loveDate, type: 'anniversary' });
                
                initMainScreen();
                UI.showToast('欢迎回来！');
            });
        } else {
            initMainScreen();
        }
    });

    function initMainScreen() {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('lock-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        
        const profile = Storage.getUserProfile();
        
        // 更新界面
        document.getElementById('user-name').textContent = profile.myName || '我';
        document.getElementById('partner-name-display').textContent = (profile.partnerName || 'TA') + ' ❤️';
        
        // 初始化计时器
        if (profile.startDate) {
            Timer.init(profile.startDate, UI.updateTimerDisplay);
        }
        
        // 刷新内容
        UI.refreshAnniversaries();
        UI.refreshMoments();
        UI.refreshPhotos();
    }
})();
