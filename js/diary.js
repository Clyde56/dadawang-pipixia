/**
 * 日记模块
 * 负责日记的创建、读取、显示
 */

const Diary = (function() {
    // 心情图标映射
    const MOOD_ICONS = {
        happy: '😊',
        loved: '😍',
        grateful: '🙏',
        peaceful: '😌',
        excited: '🤩'
    };

    const MOOD_LABELS = {
        happy: '开心',
        loved: '被爱',
        grateful: '感恩',
        peaceful: '平静',
        excited: '激动'
    };

    /**
     * 创建新日记
     * @param {Object} diaryData - 日记数据
     */
    function create(diaryData) {
        const { content, mood, weather, images } = diaryData;
        
        // 验证数据
        if (!content || content.trim().length === 0) {
            return { success: false, message: '请输入日记内容' };
        }
        
        if (content.length > 2000) {
            return { success: false, message: '日记内容不能超过2000字' };
        }
        
        // 保存日记
        const diary = Storage.addDiary({
            content: content.trim(),
            mood: mood || 'happy',
            weather: weather || null,
            images: images || []
        });
        
        return { success: true, diary };
    }

    /**
     * 获取今日日记
     */
    function getTodayDiaries() {
        const diaries = Storage.getDiaries();
        const today = new Date().toISOString().split('T')[0];
        
        return diaries.filter(diary => 
            diary.createdAt.split('T')[0] === today
        );
    }

    /**
     * 获取某一天的日记
     * @param {string} dateStr - 日期字符串 YYYY-MM-DD
     */
    function getDiariesByDate(dateStr) {
        const diaries = Storage.getDiaries();
        
        return diaries.filter(diary => 
            diary.createdAt.split('T')[0] === dateStr
        );
    }

    /**
     * 获取日记列表（分页）
     * @param {number} page - 页码
     * @param {number} limit - 每页数量
     */
    function getList(page = 1, limit = 10) {
        const diaries = Storage.getDiaries();
        const start = (page - 1) * limit;
        const end = start + limit;
        
        return {
            total: diaries.length,
            page,
            limit,
            data: diaries.slice(start, end)
        };
    }

    /**
     * 获取日记详情
     * @param {string} id - 日记ID
     */
    function getDetail(id) {
        const diaries = Storage.getDiaries();
        return diaries.find(d => d.id === id);
    }

    /**
     * 删除日记
     * @param {string} id - 日记ID
     */
    function remove(id) {
        Storage.deleteDiary(id);
        return { success: true };
    }

    /**
     * 更新日记
     * @param {string} id - 日记ID
     * @param {Object} updates - 更新内容
     */
    function update(id, updates) {
        const diaries = Storage.getDiaries();
        const index = diaries.findIndex(d => d.id === id);
        
        if (index === -1) {
            return { success: false, message: '日记不存在' };
        }
        
        diaries[index] = {
            ...diaries[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        Storage.setItem('diaries', diaries);
        return { success: true, diary: diaries[index] };
    }

    /**
     * 渲染日记卡片
     * @param {Object} diary - 日记数据
     */
    function renderCard(diary) {
        const date = new Date(diary.createdAt);
        const dateStr = formatDate(date);
        const timeStr = formatTime(date);
        const moodIcon = MOOD_ICONS[diary.mood] || MOOD_ICONS.happy;
        
        let imagesHtml = '';
        if (diary.images && diary.images.length > 0) {
            imagesHtml = `
                <div class="diary-card-images">
                    ${diary.images.map(img => `<img src="${img}" alt="日记照片" loading="lazy">`).join('')}
                </div>
            `;
        }
        
        return `
            <div class="diary-card" data-id="${diary.id}">
                <div class="diary-card-header">
                    <span class="diary-card-date">${dateStr} ${timeStr}</span>
                    <span class="diary-card-mood" title="${MOOD_LABELS[diary.mood]}">${moodIcon}</span>
                </div>
                <div class="diary-card-content">
                    ${escapeHtml(diary.content)}
                </div>
                ${imagesHtml}
            </div>
        `;
    }

    /**
     * 渲染日记列表
     * @param {Array} diaries - 日记数组
     * @param {HTMLElement} container - 容器元素
     */
    function renderList(diaries, container) {
        if (!container) return;
        
        if (diaries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="ri-book-open-line"></i>
                    </div>
                    <p class="empty-state-title">还没有日记</p>
                    <p class="empty-state-description">记录你们的第一篇日记吧</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = diaries.map(diary => renderCard(diary)).join('');
    }

    /**
     * 格式化日期
     */
    function formatDate(date) {
        const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        return `${months[date.getMonth()]}${date.getDate()}日`;
    }

    /**
     * 格式化时间
     */
    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
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
     * 获取心情列表
     */
    function getMoodList() {
        return Object.entries(MOOD_ICONS).map(([key, icon]) => ({
            value: key,
            icon,
            label: MOOD_LABELS[key]
        }));
    }

    // 暴露公开API
    return {
        create,
        getTodayDiaries,
        getDiariesByDate,
        getList,
        getDetail,
        remove,
        update,
        renderCard,
        renderList,
        getMoodList
    };
})();

// 导出到全局
window.Diary = Diary;
