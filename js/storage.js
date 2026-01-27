/**
 * 数据存储模块
 * 负责本地数据的管理，包括读取、写入、导出和备份
 */

const Storage = (function() {
    // 存储键名常量
    const STORAGE_KEYS = {
        APP_DATA: 'dadawang_pipixia_data',
        USER_PROFILE: 'dadawang_pipixia_user',
        SETTINGS: 'dadawang_pipixia_settings'
    };

    // 默认数据模板
    const DEFAULT_DATA = {
        // 用户信息
        userProfile: {
            id: generateUUID(),
            myName: '',
            partnerName: '',
            startDate: null,
            createdAt: new Date().toISOString()
        },
        
        // 设置
        settings: {
            theme: 'warm',
            language: 'zh-CN',
            notifications: true
        },
        
        // 日记
        diaries: [],
        
        // 纪念日
        anniversaries: [],
        
        // 动态
        moments: [],
        
        // 时光胶囊
        timeCapsules: [],
        
        // 照片
        photos: []
    };

    /**
     * 生成唯一UUID
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 获取完整数据
     */
    function getData() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.APP_DATA);
            if (data) {
                return JSON.parse(data);
            }
            return JSON.parse(JSON.stringify(DEFAULT_DATA));
        } catch (error) {
            console.error('获取数据失败:', error);
            return JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    /**
     * 保存完整数据
     */
    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    /**
     * 获取单个数据项
     */
    function getItem(key) {
        const data = getData();
        return data[key] || null;
    }

    /**
     * 设置单个数据项
     */
    function setItem(key, value) {
        const data = getData();
        data[key] = value;
        return saveData(data);
    }

    /**
     * 获取用户配置
     */
    function getUserProfile() {
        const data = getData();
        return data.userProfile;
    }

    /**
     * 保存用户配置
     */
    function saveUserProfile(profile) {
        const data = getData();
        data.userProfile = { ...data.userProfile, ...profile };
        return saveData(data);
    }

    /**
     * 检查是否首次使用
     */
    function isFirstUse() {
        const data = getData();
        return !data.userProfile.startDate;
    }

    /**
     * 添加日记
     */
    function addDiary(diary) {
        const data = getData();
        const newDiary = {
            id: generateUUID(),
            ...diary,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.diaries.unshift(newDiary);
        saveData(data);
        return newDiary;
    }

    /**
     * 获取所有日记
     */
    function getDiaries() {
        const data = getData();
        return data.diaries;
    }

    /**
     * 删除日记
     */
    function deleteDiary(id) {
        const data = getData();
        data.diaries = data.diaries.filter(d => d.id !== id);
        saveData(data);
    }

    /**
     * 添加纪念日
     */
    function addAnniversary(anniversary) {
        const data = getData();
        const newAnniversary = {
            id: generateUUID(),
            ...anniversary,
            createdAt: new Date().toISOString()
        };
        data.anniversaries.push(newAnniversary);
        saveData(data);
        return newAnniversary;
    }

    /**
     * 获取纪念日列表
     */
    function getAnniversaries() {
        const data = getData();
        return data.anniversaries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * 删除纪念日
     */
    function deleteAnniversary(id) {
        const data = getData();
        data.anniversaries = data.anniversaries.filter(a => a.id !== id);
        saveData(data);
    }

    /**
     * 发布动态
     */
    function addMoment(moment) {
        const data = getData();
        const newMoment = {
            id: generateUUID(),
            ...moment,
            createdAt: new Date().toISOString(),
            isRead: false
        };
        data.moments.unshift(newMoment);
        saveData(data);
        return newMoment;
    }

    /**
     * 获取动态列表
     */
    function getMoments() {
        const data = getData();
        return data.moments;
    }

    /**
     * 标记动态已读
     */
    function markMomentRead(id) {
        const data = getData();
        const moment = data.moments.find(m => m.id === id);
        if (moment) {
            moment.isRead = true;
            saveData(data);
        }
    }

    /**
     * 添加时光胶囊
     */
    function addTimeCapsule(capsule) {
        const data = getData();
        const newCapsule = {
            id: generateUUID(),
            ...capsule,
            createdAt: new Date().toISOString(),
            isOpened: false
        };
        data.timeCapsules.push(newCapsule);
        saveData(data);
        return newCapsule;
    }

    /**
     * 获取时光胶囊
     */
    function getTimeCapsules() {
        const data = getData();
        return data.timeCapsules;
    }

    /**
     * 打开时光胶囊
     */
    function openTimeCapsule(id) {
        const data = getData();
        const capsule = data.timeCapsules.find(c => c.id === id);
        if (capsule && new Date(capsule.openDate) <= new Date()) {
            capsule.isOpened = true;
            saveData(data);
            return capsule;
        }
        return null;
    }

    /**
     * 保存照片（存储为Base64）
     */
    function savePhoto(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = getData();
                    const photo = {
                        id: generateUUID(),
                        data: e.target.result,
                        createdAt: new Date().toISOString()
                    };
                    data.photos.push(photo);
                    saveData(data);
                    resolve(photo);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 获取照片
     */
    function getPhotos() {
        const data = getData();
        return data.photos;
    }

    /**
     * 导出数据为JSON文件
     */
    function exportData() {
        const data = getData();
        const exportObj = {
            ...data,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `大大王皮皮虾_备份_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 从JSON文件导入数据
     */
    function importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // 合并数据
                    const currentData = getData();
                    const mergedData = {
                        ...currentData,
                        userProfile: importedData.userProfile || currentData.userProfile,
                        settings: { ...currentData.settings, ...importedData.settings },
                        diaries: [...(importedData.diaries || []), ...currentData.diaries],
                        anniversaries: [...(importedData.anniversaries || []), ...currentData.anniversaries],
                        moments: [...(importedData.moments || []), ...currentData.moments],
                        timeCapsules: [...(importedData.timeCapsules || []), ...currentData.timeCapsules],
                        photos: [...(importedData.photos || []), ...currentData.photos]
                    };
                    
                    saveData(mergedData);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * 重置所有数据
     */
    function resetData() {
        localStorage.removeItem(STORAGE_KEYS.APP_DATA);
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }

    /**
     * 初始化应用
     */
    function init() {
        if (isFirstUse()) {
            return false;
        }
        return true;
    }

    // 暴露公开API
    return {
        // 核心方法
        getData,
        saveData,
        getItem,
        setItem,
        
        // 用户配置
        getUserProfile,
        saveUserProfile,
        isFirstUse,
        
        // 日记
        addDiary,
        getDiaries,
        deleteDiary,
        
        // 纪念日
        addAnniversary,
        getAnniversaries,
        deleteAnniversary,
        
        // 动态
        addMoment,
        getMoments,
        markMomentRead,
        
        // 时光胶囊
        addTimeCapsule,
        getTimeCapsules,
        openTimeCapsule,
        
        // 照片
        savePhoto,
        getPhotos,
        
        // 数据管理
        exportData,
        importData,
        resetData,
        init,
        
        // 常量
        KEYS: STORAGE_KEYS
    };
})();

// 导出到全局
window.Storage = Storage;
