const UI = (function() {
    let selectedMood = 'happy';

    function init() {
        // 心情选择
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                selectedMood = this.dataset.mood;
            });
        });

        // 快捷操作
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                if (action === 'diary') openDiaryModal();
                if (action === 'moment') openMomentModal();
                if (action === 'capsule') openCapsuleModal();
                if (action === 'lock') lockScreen();
            });
        });

        // 关闭模态框
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        document.getElementById('modal-container').addEventListener('click', function(e) {
            if (e.target === this) closeAllModals();
        });

        // 发布日记
        document.getElementById('publish-diary').addEventListener('click', function() {
            const content = document.getElementById('diary-content').value;
            const preview = document.getElementById('photo-preview');
            const images = preview.querySelectorAll('img');
            const result = Diary.create(content, selectedMood, Array.from(images).map(img => img.src));
            if (result.success) {
                showToast('日记已保存');
                closeAllModals();
                document.getElementById('diary-content').value = '';
                preview.innerHTML = '';
            } else {
                showToast(result.message);
            }
        });

        // 发布动态
        document.getElementById('publish-moment').addEventListener('click', function() {
            const content = document.getElementById('moment-content').value;
            const result = Moments.publish(content);
            if (result.success) {
                showToast('动态已发布');
                closeAllModals();
                document.getElementById('moment-content').value = '';
                refreshMoments();
            } else {
                showToast(result.message);
            }
        });

        // 快捷消息
        document.querySelectorAll('.quick-msg-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('moment-content').value = this.dataset.msg;
            });
        });

        // 纪念日按钮
        document.getElementById('add-anniversary-btn').addEventListener('click', function() {
            document.getElementById('anniversary-modal-title').textContent = '添加纪念日';
            document.getElementById('anniversary-name').value = '';
            document.getElementById('anniversary-date').value = '';
            document.getElementById('delete-anniversary-btn').style.display = 'none';
            openModal('anniversary-modal');
        });

        document.getElementById('save-anniversary-btn').addEventListener('click', function() {
            const name = document.getElementById('anniversary-name').value;
            const date = document.getElementById('anniversary-date').value;
            const type = document.getElementById('anniversary-type').value;
            if (name && date) {
                Storage.addAnniversary({ name, date, type });
                showToast('纪念日已添加');
                closeAllModals();
                refreshAnniversaries();
            } else {
                showToast('请填写完整信息');
            }
        });

        // 设置按钮
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
            location.reload();
        });

        // 导出数据
        document.getElementById('export-data-btn').addEventListener('click', function() {
            Storage.exportData();
            showToast('正在导出...');
        });

        // 重置数据
        document.getElementById('reset-data-btn').addEventListener('click', function() {
            Storage.resetData();
        });

        // 侧边栏
        document.getElementById('menu-btn').addEventListener('click', function() {
            document.getElementById('drawer').classList.add('active');
        });
        document.querySelector('.drawer-overlay').addEventListener('click', function() {
            document.getElementById('drawer').classList.remove('active');
        });

        // 胶囊Tab切换
        document.querySelectorAll('#capsule-modal .tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('#capsule-modal .tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('create-capsule-panel').classList.toggle('hidden', this.dataset.tab !== 'create');
                document.getElementById('capsule-list-panel').classList.toggle('hidden', this.dataset.tab !== 'list');
                if (this.dataset.tab === 'list') {
                    Capsule.renderList(Capsule.getList(), document.getElementById('capsule-list-panel'));
                }
            });
        });

        // 创建胶囊
        document.getElementById('create-capsule-btn').addEventListener('click', function() {
            const content = document.getElementById('capsule-content').value;
            const openDate = document.getElementById('capsule-open-date').value;
            const result = Capsule.create(content, openDate);
            if (result.success) {
                showToast('胶囊已封存');
                closeAllModals();
                document.getElementById('capsule-content').value = '';
            } else {
                showToast(result.message);
            }
        });

        // 相册
        document.getElementById('all-moments-btn').addEventListener('click', function() {
            showAllMoments();
        });

        // 照片上传
        document.getElementById('photo-upload-input').addEventListener('change', function(e) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    Storage.addPhoto({ data: evt.target.result });
                    refreshPhotos();
                    showToast('照片已上传');
                };
                reader.readAsDataURL(file);
            });
        });

        document.getElementById('diary-photos').addEventListener('change', function(e) {
            const preview = document.getElementById('photo-preview');
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = document.createElement('img');
                    img.src = evt.target.result;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    function openDiaryModal() {
        document.getElementById('diary-content').value = '';
        document.getElementById('photo-preview').innerHTML = '';
        openModal('diary-modal');
    }

    function openMomentModal() {
        document.getElementById('moment-content').value = '';
        openModal('moment-modal');
    }

    function openCapsuleModal() {
        document.getElementById('capsule-content').value = '';
        document.getElementById('capsule-open-date').value = '';
        openModal('capsule-modal');
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            document.getElementById('modal-container').classList.add('active');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('active'), 10);
        }
    }

    function closeAllModals() {
        document.getElementById('modal-container').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    function lockScreen() {
        document.getElementById('main-screen').classList.add('hidden');
        document.getElementById('lock-screen').classList.remove('hidden');
    }

    function unlockScreen() {
        document.getElementById('lock-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
    }

    function updateTimerDisplay(time) {
        document.getElementById('years').textContent = time.years;
        document.getElementById('months').textContent = time.months;
        document.getElementById('days').textContent = time.days;
        document.getElementById('hours').textContent = String(time.hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(time.minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(time.seconds).padStart(2, '0');
        document.getElementById('total-days').textContent = time.totalDays;
    }

    function refreshAnniversaries() {
        const container = document.getElementById('anniversary-list');
        const anniversaries = Storage.getAnniversaries();
        if (anniversaries.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>还没有纪念日</p></div>';
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

    function refreshMoments() {
        Moments.renderList(Moments.getList(5), document.getElementById('moments-list'));
    }

    function refreshPhotos() {
        const photos = Storage.getPhotos();
        const grid = document.getElementById('photo-grid');
        if (photos.length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>还没有照片</p></div>';
            return;
        }
        grid.innerHTML = photos.map(p => `<img src="${p.data}" class="photo-item">`).join('');
    }

    function showAllMoments() {
        const moments = Storage.getMoments();
        let html = '<div class="moments-full-list">';
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
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 锁屏点击解锁
    document.getElementById('lock-screen').addEventListener('click', unlockScreen);

    return {
        init, updateTimerDisplay, refreshAnniversaries, refreshMoments, refreshPhotos,
        openDiaryModal, openMomentModal, openCapsuleModal, showToast
    };
})();
