(function() {
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化UI事件
        initAllEventListeners();
        
        // 检查是否为首次使用
        if (Storage.isFirstUse()) {
            // 显示欢迎页
            showScreen('welcome');
            document.getElementById('love-date').value = new Date().toISOString().split('T')[0];
            
            // 开始按钮事件
            document.getElementById('start-btn').onclick = handleStart;
        } else {
            initMainScreen();
        }
    });

    // 初始化主界面
    function initMainScreen() {
        showScreen('home');
        
        const profile = Storage.getUserProfile();
        
        // 更新界面元素
        updateUserInfo(profile);
        
        // 初始化计时器
        if (profile.startDate) {
            Timer.init(profile.startDate, updateTimer);
        }
        
        // 刷新首页内容
        refreshHomeContent();
    }

    // 更新用户信息显示
    function updateUserInfo(profile) {
        const userNameEl = document.getElementById('user-name');
        const partnerNameEl = document.getElementById('partner-name-display');
        const headerTitle = document.querySelector('#main-screen .header-title');
        
        if (userNameEl) userNameEl.textContent = profile.myName || '我';
        if (partnerNameEl) partnerNameEl.textContent = (profile.partnerName || 'TA') + ' ❤️';
        if (headerTitle) headerTitle.textContent = (profile.myName || '我') + ' & ' + (profile.partnerName || 'TA');
    }

    // 更新计时器显示
    function updateTimer(time) {
        const elements = {
            years: document.getElementById('years'),
            months: document.getElementById('months'),
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            totalDays: document.getElementById('total-days')
        };
        
        if (elements.years) elements.years.textContent = time.years;
        if (elements.months) elements.months.textContent = time.months;
        if (elements.days) elements.days.textContent = time.days;
        if (elements.hours) elements.hours.textContent = String(time.hours).padStart(2, '0');
        if (elements.minutes) elements.minutes.textContent = String(time.minutes).padStart(2, '0');
        if (elements.seconds) elements.seconds.textContent = String(time.seconds).padStart(2, '0');
        if (elements.totalDays) elements.totalDays.textContent = time.totalDays;
    }

    // 刷新首页内容
    function refreshHomeContent() {
        renderAnniversaryList();
        renderMomentsList();
    }

    // 渲染首页纪念日列表
    function renderAnniversaryList() {
        const container = document.getElementById('anniversary-list');
        if (!container) return;
        
        const anniversaries = Storage.getAnniversaries();
        
        if (anniversaries.length === 0) {
            container.innerHTML = '<div class="empty-state-page" style="min-height:100px;"><p style="text-align:center;color:var(--text-secondary);">还没有纪念日</p></div>';
            return;
        }
        
        container.innerHTML = anniversaries.slice(0, 3).map(a => {
            const info = Timer.getNextAnniversary(a.date);
            return `
                <div class="anniversary-item">
                    <div class="anniversary-icon"><i class="ri-calendar-event-line"></i></div>
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

    // 渲染首页动态列表
    function renderMomentsList() {
        const container = document.getElementById('moments-list');
        if (!container) return;
        
        const moments = Storage.getMoments();
        
        if (moments.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">还没有动态</div>';
            return;
        }
        
        container.innerHTML = moments.slice(0, 3).map(m => {
            const date = new Date(m.createdAt);
            const timeAgo = getTimeAgo(date);
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

    // 首次使用开始按钮处理
    function handleStart() {
        const myName = document.getElementById('your-name').value.trim();
        const partnerName = document.getElementById('partner-name').value.trim();
        const loveDate = document.getElementById('love-date').value;
        
        if (!myName) { showToast('请输入你的名字'); return; }
        if (!partnerName) { showToast('请输入TA的名字'); return; }
        if (!loveDate) { showToast('请选择在一起的日期'); return; }
        
        Storage.saveUserProfile({ myName, partnerName, startDate: loveDate });
        Storage.addAnniversary({ name: '在一起纪念日', date: loveDate, type: 'anniversary' });
        
        showToast('欢迎回来！');
        initMainScreen();
    }

    // 初始化所有事件监听
    function initAllEventListeners() {
        // 快捷操作按钮
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                switch(action) {
                    case 'diary': openModal('diary-modal'); break;
                    case 'moment': openModal('moment-modal'); break;
                    case 'capsule': 
                        document.getElementById('capsule-content').value = '';
                        document.getElementById('capsule-open-date').value = '';
                        switchCapsuleTab('create');
                        openModal('capsule-modal'); 
                        break;
                    case 'lock': 
                        document.getElementById('main-screen').classList.remove('active');
                        document.getElementById('lock-screen').classList.add('active');
                        break;
                }
            });
        });

        // 锁屏解锁
        document.getElementById('lock-screen').addEventListener('click', function() {
            this.classList.remove('active');
            document.getElementById('main-screen').classList.add('active');
        });

        // 侧边栏导航
        document.getElementById('menu-btn').addEventListener('click', function() {
            document.getElementById('drawer').classList.add('active');
        });

        document.getElementById('drawer-overlay').addEventListener('click', function() {
            document.getElementById('drawer').classList.remove('active');
        });

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                navigateToPage(page);
                document.getElementById('drawer').classList.remove('active');
                
                // 更新选中状态
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // 返回按钮
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                navigateToPage('home');
            });
        });

        // 关闭模态框
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        document.getElementById('modal-container').addEventListener('click', function(e) {
            if (e.target === this) closeAllModals();
        });

        // ========== 日记功能 ==========
        // 心情选择
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // 日记字数统计
        document.getElementById('diary-content').addEventListener('input', function() {
            document.getElementById('word-count').textContent = this.value.length;
        });

        // 保存日记
        document.getElementById('publish-diary').addEventListener('click', function() {
            const content = document.getElementById('diary-content').value;
            const preview = document.getElementById('photo-preview');
            const images = preview.querySelectorAll('img');
            const mood = document.querySelector('.mood-btn.active')?.dataset.mood || 'happy';
            
            if (!content.trim()) { showToast('请输入日记内容'); return; }
            
            const result = Diary.create(content, mood, Array.from(images).map(img => img.src));
            if (result.success) {
                showToast('日记已保存');
                closeAllModals();
                document.getElementById('diary-content').value = '';
                document.getElementById('photo-preview').innerHTML = '';
                document.getElementById('word-count').textContent = '0';
                renderMomentsList();
            }
        });

        // 发布动态
        document.getElementById('publish-moment').addEventListener('click', function() {
            const content = document.getElementById('moment-content').value;
            if (!content.trim()) { showToast('请输入动态内容'); return; }
            
            const result = Moments.publish(content);
            if (result.success) {
                showToast('动态已发布');
                closeAllModals();
                document.getElementById('moment-content').value = '';
                renderMomentsList();
            }
        });

        // 快捷消息
        document.querySelectorAll('.quick-msg-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('moment-content').value = this.dataset.msg;
            });
        });

        // ========== 纪念日功能 ==========
        // 首页添加纪念日
        document.getElementById('add-anniversary-btn').addEventListener('click', function() {
            openAnniversaryModal();
        });

        // 页面添加纪念日
        document.getElementById('anniversary-page-add')?.addEventListener('click', function() {
            openAnniversaryModal();
        });

        // 保存纪念日
        document.getElementById('save-anniversary-btn').addEventListener('click', function() {
            const name = document.getElementById('anniversary-name').value.trim();
            const date = document.getElementById('anniversary-date').value;
            const type = document.getElementById('anniversary-type').value;
            
            if (!name || !date) { showToast('请填写完整信息'); return; }
            
            Storage.addAnniversary({ name, date, type });
            showToast('纪念日已添加');
            closeAllModals();
            renderAnniversaryList();
            renderFullAnniversaryList();
        });

        // 删除纪念日
        document.getElementById('delete-anniversary-btn').addEventListener('click', function() {
            if (confirm('确定要删除这个纪念日吗？')) {
                const id = this.dataset.id;
                if (id) {
                    Storage.deleteAnniversary(id);
                    showToast('纪念日已删除');
                    closeAllModals();
                    renderAnniversaryList();
                    renderFullAnniversaryList();
                }
            }
        });

        // ========== 时光胶囊功能 ==========
        document.getElementById('capsule-page-add')?.addEventListener('click', function() {
            document.getElementById('capsule-content').value = '';
            document.getElementById('capsule-open-date').value = '';
            switchCapsuleTab('create');
            openModal('capsule-modal');
        });

        // 胶囊Tab切换
        document.querySelectorAll('#capsule-modal .tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchCapsuleTab(this.dataset.tab);
            });
        });

        // 创建胶囊
        document.getElementById('create-capsule-btn').addEventListener('click', function() {
            const content = document.getElementById('capsule-content').value.trim();
            const openDate = document.getElementById('capsule-open-date').value;
            
            if (!content) { showToast('请输入胶囊内容'); return; }
            if (!openDate) { showToast('请选择开启日期'); return; }
            if (new Date(openDate) <= new Date()) { showToast('开启日期必须大于今天'); return; }
            
            const result = Capsule.create(content, openDate);
            if (result.success) {
                showToast('胶囊已封存');
                closeAllModals();
            }
        });

        // ========== 页面筛选 ==========
        // 日记筛选
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                renderDiaryList(this.dataset.filter);
            });
        });

        // 胶囊列表筛选
        document.querySelectorAll('.capsule-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.capsule-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                renderFullCapsuleList(this.dataset.capsuleTab);
            });
        });

        // ========== 日记页面添加按钮 ==========
        document.getElementById('diary-page-add')?.addEventListener('click', function() {
            document.getElementById('diary-content').value = '';
            document.getElementById('photo-preview').innerHTML = '';
            document.getElementById('word-count').textContent = '0';
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.mood-btn[data-mood="happy"]')?.classList.add('active');
            openModal('diary-modal');
        });

        // ========== 相册功能 ==========
        document.getElementById('photo-page-upload')?.addEventListener('click', function() {
            document.getElementById('photos-page-upload').click();
        });

        document.getElementById('photos-page-upload')?.addEventListener('change', function(e) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    Storage.addPhoto({ data: evt.target.result });
                    renderFullPhotoGrid();
                    showToast('照片已上传');
                };
                reader.readAsDataURL(file);
            });
        });

        // ========== 备份功能 ==========
        document.getElementById('backup-export-btn')?.addEventListener('click', function() {
            Storage.exportData();
            showToast('正在导出备份...');
        });

        document.getElementById('backup-import-btn')?.addEventListener('click', function() {
            document.getElementById('backup-import-input').click();
        });

        document.getElementById('backup-import-input')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        const data = JSON.parse(evt.target.result);
                        if (confirm('确定要导入数据吗？这将覆盖现有数据！')) {
                            localStorage.setItem('dadawang_pipixia_data', JSON.stringify(data));
                            showToast('导入成功！');
                            setTimeout(() => location.reload(), 1000);
                        }
                    } catch (err) {
                        showToast('导入失败，文件格式错误');
                    }
                };
                reader.readAsText(file);
            }
        });

        document.getElementById('backup-reset-btn')?.addEventListener('click', function() {
            Storage.resetData();
        });

        // ========== 设置功能 ==========
        document.getElementById('settings-btn').addEventListener('click', function() {
            const profile = Storage.getUserProfile();
            document.getElementById('setting-my-name').value = profile.myName || '';
            document.getElementById('setting-partner-name').value = profile.partnerName || '';
            document.getElementById('setting-love-date').value = profile.startDate || '';
            openModal('settings-modal');
        });

        document.getElementById('save-settings-btn').addEventListener('click', function() {
            Storage.saveUserProfile({
                myName: document.getElementById('setting-my-name').value,
                partnerName: document.getElementById('setting-partner-name').value,
                startDate: document.getElementById('setting-love-date').value
            });
            showToast('设置已保存');
            closeAllModals();
            setTimeout(() => location.reload(), 500);
        });

        document.getElementById('modal-export-btn')?.addEventListener('click', function() {
            Storage.exportData();
            showToast('正在导出...');
        });

        document.getElementById('modal-reset-btn')?.addEventListener('click', function() {
            Storage.resetData();
        });

        // ========== 动态全部按钮 ==========
        document.getElementById('all-moments-btn')?.addEventListener('click', function() {
            const moments = Storage.getMoments();
            let html = '<div class="moments-full-list" style="max-height:60vh;overflow-y:auto;">';
            moments.forEach(m => {
                html += Moments.renderCard(m);
            });
            html += '</div>';
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.maxWidth = '500px';
            modal.innerHTML = `
                <div class="modal-header">
                    <h3>全部动态</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">${html}</div>
            `;
            document.getElementById('modal-container').classList.add('active');
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('active'), 10);
        });
    }

    // 打开纪念日模态框
    function openAnniversaryModal(anniversary) {
        document.getElementById('anniversary-modal-title').textContent = anniversary ? '编辑纪念日' : '添加纪念日';
        document.getElementById('anniversary-name').value = anniversary ? anniversary.name : '';
        document.getElementById('anniversary-date').value = anniversary ? anniversary.date : '';
        document.getElementById('anniversary-type').value = anniversary ? anniversary.type : 'custom';
        
        const deleteBtn = document.getElementById('delete-anniversary-btn');
        if (anniversary) {
            deleteBtn.style.display = 'block';
            deleteBtn.dataset.id = anniversary.id;
        } else {
            deleteBtn.style.display = 'none';
        }
        
        openModal('anniversary-modal');
    }

    // 切换胶囊模态框Tab
    function switchCapsuleTab(tab) {
        document.querySelectorAll('#capsule-modal .tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        document.getElementById('create-capsule-panel').classList.toggle('hidden', tab !== 'create');
        document.getElementById('capsule-list-panel').classList.toggle('hidden', tab !== 'list');
        
        if (tab === 'list') {
            const capsules = Storage.getCapsules();
            const list = document.getElementById('capsule-list-panel');
            if (capsules.length === 0) {
                list.innerHTML = '<div class="empty-state-page"><div class="empty-icon">⏳</div><p>还没有时光胶囊</p></div>';
            } else {
                list.innerHTML = capsules.map(c => {
                    const canOpen = Capsule.canOpen(c);
                    let statusClass, statusText;
                    if (c.isOpened) {
                        statusClass = 'opened';
                        statusText = '已开启';
                    } else if (canOpen) {
                        statusClass = 'ready';
                        statusText = '可开启';
                    } else {
                        statusClass = 'waiting';
                        statusText = '待开启';
                    }
                    
                    return `
                        <div class="capsule-card-full ${c.isOpened ? 'opened' : ''}">
                            <div class="capsule-card-full-header">
                                <span class="capsule-card-full-date">开启日期: ${c.openDate}</span>
                                <span class="capsule-card-full-status ${statusClass}">${statusText}</span>
                            </div>
                            <div class="capsule-card-full-content">${c.isOpened ? Capsule.escapeHtml(c.content) : '内容已加密，开启后可见'}</div>
                            ${canOpen && !c.isOpened ? 
                                `<button class="capsule-card-full-btn" onclick="handleOpenCapsule('${c.id}')">开启胶囊</button>` : ''}
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // 开启胶囊
    window.handleOpenCapsule = function(id) {
        const capsule = Storage.getCapsules().find(c => c.id === id);
        if (capsule) {
            Storage.openCapsule(id);
            showToast('胶囊已开启');
            switchCapsuleTab('list');
        }
    };

    // 打开模态框
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            document.getElementById('modal-container').classList.add('active');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    }

    // 关闭所有模态框
    function closeAllModals() {
        document.getElementById('modal-container').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    // 页面导航
    function navigateToPage(pageName) {
        // 隐藏所有页面
        document.getElementById('main-screen')?.classList.remove('active');
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // 显示目标页面
        if (pageName === 'home') {
            document.getElementById('main-screen')?.classList.add('active');
            refreshHomeContent();
        } else {
            const page = document.getElementById('page-' + pageName);
            if (page) {
                page.classList.add('active');
                // 刷新对应页面内容
                switch(pageName) {
                    case 'diary': renderDiaryList('all'); break;
                    case 'anniversaries': renderFullAnniversaryList(); break;
                    case 'capsule': renderFullCapsuleList('unopened'); break;
                    case 'photos': renderFullPhotoGrid(); break;
                }
            }
        }
    }

    // 渲染日记列表
    function renderDiaryList(filter) {
        const container = document.getElementById('diary-list-page');
        if (!container) return;
        
        let diaries = Storage.getDiaries();
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
            container.innerHTML = `
                <div class="empty-state-page">
                    <div class="empty-icon">📔</div>
                    <p>还没有日记</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = diaries.map(diary => {
            const date = new Date(diary.createdAt);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            const moodEmoji = Diary.MOOD_ICONS[diary.mood] || '😊';
            
            let imagesHtml = '';
            if (diary.images && diary.images.length > 0) {
                imagesHtml = '<div class="diary-card-full-images">' + 
                    diary.images.map(img => `<img src="${img}" onclick="viewPhoto('${img}')">`).join('') +
                    '</div>';
            }
            
            return `
                <div class="diary-card-full">
                    <div class="diary-card-full-header">
                        <span class="diary-card-full-date">${dateStr}</span>
                        <span class="diary-card-full-mood">${moodEmoji}</span>
                    </div>
                    <div class="diary-card-full-content">${Diary.escapeHtml(diary.content)}</div>
                    ${imagesHtml}
                    <div class="diary-card-full-actions">
                        <button class="btn-danger" style="padding:6px 12px;font-size:12px;" onclick="deleteDiary('${diary.id}')">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 渲染完整纪念日列表
    function renderFullAnniversaryList() {
        const container = document.getElementById('anniversary-full-list');
        if (!container) return;
        
        const anniversaries = Storage.getAnniversaries();
        
        if (anniversaries.length === 0) {
            container.innerHTML = `
                <div class="empty-state-page">
                    <div class="empty-icon">📅</div>
                    <p>还没有纪念日</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = anniversaries.map(a => {
            const info = Timer.getNextAnniversary(a.date);
            const icons = { anniversary: '💕', birthday: '🎂', custom: '📌' };
            
            return `
                <div class="anniversary-card-full" onclick="openAnniversaryModal({id:'${a.id}',name:'${escapeHtml(a.name)}',date:'${a.date}',type:'${a.type}'})">
                    <div class="anniversary-card-full-icon">${icons[a.type] || '📌'}</div>
                    <div class="anniversary-card-full-info">
                        <div class="anniversary-card-full-name">${escapeHtml(a.name)}</div>
                        <div class="anniversary-card-full-date">${a.date}</div>
                    </div>
                    <div class="anniversary-card-full-countdown">
                        <div class="anniversary-card-full-countdown-days">${info.daysUntil === 0 ? '今天' : info.daysUntil}</div>
                        <div class="anniversary-card-full-countdown-label">${info.daysUntil === 0 ? '' : '天后'}</div>
                    </div>
                    <button class="anniversary-card-full-delete" onclick="event.stopPropagation(); deleteAnniversary('${a.id}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    // 渲染完整胶囊列表
    function renderFullCapsuleList(status) {
        const container = document.getElementById('capsule-full-list');
        if (!container) return;
        
        let capsules = Storage.getCapsules();
        
        if (status === 'unopened') {
            capsules = capsules.filter(c => !c.isOpened);
        } else {
            capsules = capsules.filter(c => c.isOpened);
        }
        
        if (capsules.length === 0) {
            container.innerHTML = `
                <div class="empty-state-page">
                    <div class="empty-icon">⏳</div>
                    <p>${status === 'unopened' ? '还没有时光胶囊' : '还没有开启的胶囊'}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = capsules.map(c => {
            const canOpen = Capsule.canOpen(c);
            let statusClass, statusText;
            if (c.isOpened) {
                statusClass = 'opened';
                statusText = '已开启';
            } else if (canOpen) {
                statusClass = 'ready';
                statusText = '可开启';
            } else {
                statusClass = 'waiting';
                statusText = '待开启';
            }
            
            return `
                <div class="capsule-card-full ${c.isOpened ? 'opened' : ''}">
                    <div class="capsule-card-full-header">
                        <span class="capsule-card-full-date">开启日期: ${c.openDate}</span>
                        <span class="capsule-card-full-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="capsule-card-full-content">${c.isOpened ? Capsule.escapeHtml(c.content) : '内容已加密，开启后可见'}</div>
                    ${canOpen && !c.isOpened ? 
                        `<button class="capsule-card-full-btn" onclick="handleOpenCapsule('${c.id}')">开启胶囊</button>` : ''}
                </div>
            `;
        }).join('');
    }

    // 渲染完整相册网格
    function renderFullPhotoGrid() {
        const container = document.getElementById('photo-full-grid');
        if (!container) return;
        
        const photos = Storage.getPhotos();
        
        if (photos.length === 0) {
            container.innerHTML = `
                <div class="empty-state-page" style="grid-column:1/-1;">
                    <div class="empty-icon">🖼️</div>
                    <p>还没有照片</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = photos.map(p => 
            `<img src="${p.data}" onclick="viewPhoto('${p.data}')">`
        ).join('');
    }

    // 显示Toast
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.querySelector('.toast-message').textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }
    }

    // 显示屏幕
    function showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenName + '-screen');
        if (screen) screen.classList.add('active');
    }

    // 工具函数
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
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }

    // 全局函数
    window.deleteDiary = function(id) {
        if (confirm('确定要删除这篇日记吗？')) {
            Storage.deleteDiary(id);
            showToast('日记已删除');
            renderDiaryList(document.querySelector('.filter-tab.active')?.dataset.filter || 'all');
        }
    };

    window.deleteAnniversary = function(id) {
        if (confirm('确定要删除这个纪念日吗？')) {
            Storage.deleteAnniversary(id);
            showToast('纪念日已删除');
            renderAnniversaryList();
            renderFullAnniversaryList();
        }
    };

    window.openAnniversaryModal = openAnniversaryModal;
    
    window.viewPhoto = function(src) {
        const viewer = document.getElementById('photo-viewer');
        const img = document.getElementById('photo-viewer-img');
        img.src = src;
        viewer.classList.add('active');
    };

    document.getElementById('photo-viewer-close')?.addEventListener('click', function() {
        document.getElementById('photo-viewer').classList.remove('active');
    });

    document.getElementById('photo-viewer')?.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });

    // 导出函数供外部使用
    window.App = {
        refreshHomeContent,
        renderDiaryList,
        renderFullAnniversaryList,
        renderFullCapsuleList,
        renderFullPhotoGrid,
        showToast,
        navigateToPage
    };
})();
