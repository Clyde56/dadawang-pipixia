const Storage = (function() {
    const STORAGE_KEY = 'dadawang_pipixia_data';

    const DEFAULT_DATA = {
        userProfile: { id: generateUUID(), myName: '', partnerName: '', startDate: null },
        settings: { theme: 'warm' },
        diaries: [],
        anniversaries: [],
        moments: [],
        capsules: [],
        photos: []
    };

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : JSON.parse(JSON.stringify(DEFAULT_DATA));
        } catch (e) {
            console.error('获取数据失败:', e);
            return JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('保存数据失败:', e);
            return false;
        }
    }

    function getUserProfile() { return getData().userProfile; }
    function saveUserProfile(profile) {
        const data = getData();
        data.userProfile = { ...data.userProfile, ...profile };
        return saveData(data);
    }
    function isFirstUse() { return !getData().userProfile.startDate; }
    
    function getDiaries() { return getData().diaries; }
    function addDiary(diary) {
        const data = getData();
        const newDiary = { id: generateUUID(), ...diary, createdAt: new Date().toISOString() };
        data.diaries.unshift(newDiary);
        saveData(data);
        return newDiary;
    }
    function deleteDiary(id) {
        const data = getData();
        data.diaries = data.diaries.filter(d => d.id !== id);
        saveData(data);
    }

    function getAnniversaries() {
        return getData().anniversaries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    function addAnniversary(anniversary) {
        const data = getData();
        const newAnniversary = { id: generateUUID(), ...anniversary };
        data.anniversaries.push(newAnniversary);
        saveData(data);
        return newAnniversary;
    }
    function deleteAnniversary(id) {
        const data = getData();
        data.anniversaries = data.anniversaries.filter(a => a.id !== id);
        saveData(data);
    }

    function getMoments() { return getData().moments; }
    function addMoment(moment) {
        const data = getData();
        const newMoment = { id: generateUUID(), ...moment, createdAt: new Date().toISOString() };
        data.moments.unshift(newMoment);
        saveData(data);
        return newMoment;
    }

    function getCapsules() { return getData().capsules; }
    function addCapsule(capsule) {
        const data = getData();
        const newCapsule = { id: generateUUID(), ...capsule, createdAt: new Date().toISOString(), isOpened: false };
        data.capsules.push(newCapsule);
        saveData(data);
        return newCapsule;
    }
    function openCapsule(id) {
        const data = getData();
        const capsule = data.capsules.find(c => c.id === id);
        if (capsule) { capsule.isOpened = true; saveData(data); }
        return capsule;
    }

    function getPhotos() { return getData().photos; }
    function addPhoto(photoData) {
        const data = getData();
        data.photos.push({ id: generateUUID(), ...photoData, createdAt: new Date().toISOString() });
        saveData(data);
    }

    function exportData() {
        const data = getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `大大王皮皮虾_备份_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function resetData() {
        if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    }

    return {
        getUserProfile, saveUserProfile, isFirstUse,
        getDiaries, addDiary, deleteDiary,
        getAnniversaries, addAnniversary, deleteAnniversary,
        getMoments, addMoment,
        getCapsules, addCapsule, openCapsule,
        getPhotos, addPhoto,
        exportData, resetData, getData, saveData
    };
})();
