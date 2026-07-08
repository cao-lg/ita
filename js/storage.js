/**
 * 本地存储管理模块
 * 所有学习数据保存在 localStorage 中
 */

const STORAGE_KEY = 'embd_learning_data';

// 默认数据结构
function getDefaultData() {
    return {
        userInfo: { name: '', className: '', studentId: '' },
        progress: {},
        quizRecords: {},      // { taskId: { score, bestScore, attempts, answers: [] } }
        unitTestRecords: {},  // { projectId: { bestScore, attempts: [], records: [] } }
        wrongQuestions: [],   // { questionId, question, yourAnswer, correctAnswer, type, taskId/projectId }
        totalLearnTime: 0,    // 分钟
        lastActiveTime: null,
        taskQuizStatus: {},   // { taskId: boolean } 是否完成小测
        taskLearned: {},      // { taskId: boolean } 是否标记已学
        timestamps: {}        // { taskId: finishTime }
    };
}

// 读取数据
function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // 合并默认结构，防止版本升级后缺少字段
            return { ...getDefaultData(), ...parsed };
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
    return getDefaultData();
}

// 保存数据
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('保存数据失败:', e);
        alert('本地存储空间不足，请导出数据后重置学习进度');
    }
}

// 获取当前数据（引用）
let _data = loadData();

function getData() { return _data; }

function persist() { saveData(_data); }

// 初始化用户
function initUser(name, className, studentId) {
    _data.userInfo = { name, className, studentId };
    persist();
}

// 记录学习时长
function addLearnTime(minutes) {
    _data.totalLearnTime += minutes;
    _data.lastActiveTime = new Date().toISOString();
    persist();
}

// 标记任务已学
function markTaskLearned(taskId) {
    _data.taskLearned[taskId] = true;
    _data.timestamps[taskId] = new Date().toISOString();
    persist();
}

// 记录小测成绩
function recordQuiz(taskId, score, total, answers, wrongList) {
    const existing = _data.quizRecords[taskId] || { bestScore: 0, attempts: 0, answers: [] };
    const percentage = Math.round((score / total) * 100);
    existing.bestScore = Math.max(existing.bestScore, percentage);
    existing.attempts = (existing.attempts || 0) + 1;
    existing.lastScore = percentage;
    existing.answers = answers;
    _data.quizRecords[taskId] = existing;

    // 标记完成
    _data.taskQuizStatus[taskId] = true;

    // 记录错题
    wrongList.forEach(w => {
        // 去重：同题不重复记录
        const idx = _data.wrongQuestions.findIndex(q => q.questionId === w.questionId && q.taskId === taskId);
        if (idx === -1) {
            _data.wrongQuestions.push({ ...w, taskId, timestamp: new Date().toISOString() });
        }
    });

    persist();
    return percentage;
}

// 记录单元测试
function recordUnitTest(projectId, score, total, answers, wrongList, durationSeconds) {
    const percentage = Math.round((score / total) * 100);
    const existing = _data.unitTestRecords[projectId] || { bestScore: 0, attempts: [], records: [] };
    existing.bestScore = Math.max(existing.bestScore, percentage);
    existing.attempts.push({
        score: percentage,
        date: new Date().toISOString(),
        duration: durationSeconds,
        correctCount: score,
        totalCount: total
    });
    existing.records.push(answers);
    _data.unitTestRecords[projectId] = existing;

    // 记录错题
    wrongList.forEach(w => {
        const idx = _data.wrongQuestions.findIndex(q => q.questionId === w.questionId && q.projectId === projectId);
        if (idx === -1) {
            _data.wrongQuestions.push({ ...w, projectId, timestamp: new Date().toISOString() });
        }
    });

    // 如果及格，标记项目完成
    if (percentage >= 60) {
        _data.progress[projectId] = { completed: true, completedAt: new Date().toISOString() };
    }

    persist();
    return percentage;
}

// 判断是否解锁项目
function isProjectUnlocked(projectId) {
    const projects = window.COURSE_DATA?.projects || [];
    const index = projects.findIndex(p => p.id === projectId);
    if (index <= 0) return true; // 第一个项目默认解锁

    // 检查前一个项目是否完成
    const prevProject = projects[index - 1];
    const prevRecord = _data.unitTestRecords[prevProject.id];
    return prevRecord && prevRecord.bestScore >= 60;
}

// 检查任务是否可学（所在项目已解锁）
function isTaskAccessible(taskId) {
    const projects = window.COURSE_DATA?.projects || [];
    for (const p of projects) {
        for (const t of p.tasks) {
            if (t.id === taskId) {
                return isProjectUnlocked(p.id);
            }
        }
    }
    return false;
}

// 计算项目进度
function getProjectProgress(projectId) {
    const projects = window.COURSE_DATA?.projects || [];
    const project = projects.find(p => p.id === projectId);
    if (!project) return { learned: 0, total: 0, percent: 0 };

    const total = project.tasks.length;
    let learned = 0;
    let quizDone = 0;
    project.tasks.forEach(t => {
        if (_data.taskLearned[t.id]) learned++;
        if (_data.taskQuizStatus[t.id]) quizDone++;
    });

    // 进度 = (已学任务 + 已完成小测) / (总任务 * 2)
    const percent = total > 0 ? Math.round(((learned + quizDone) / (total * 2)) * 100) : 0;
    return { learned, total, quizDone, percent };
}

// 导出 JSON
function exportToJSON() {
    const dataStr = JSON.stringify(_data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = _data.userInfo.name || '学员';
    a.download = `${name}_经济管理大数据分析学习档案.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 导出 Excel
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    const name = _data.userInfo.name || '学员';

    // Sheet 1: 基本信息
    const basicInfo = [[
        '姓名', '班级', '学号', '学习总时长(分钟)', '最后活跃时间'
    ], [
        _data.userInfo.name,
        _data.userInfo.className,
        _data.userInfo.studentId,
        _data.totalLearnTime,
        _data.lastActiveTime || '-'
    ]];
    const ws1 = XLSX.utils.aoa_to_sheet(basicInfo);
    XLSX.utils.book_append_sheet(wb, ws1, '基本信息');

    // Sheet 2: 项目进度
    const projects = window.COURSE_DATA?.projects || [];
    const progressData = [['项目名称', '完成状态', '完成时间', '单元测试最高分']];
    projects.forEach(p => {
        const prog = _data.progress[p.id];
        const test = _data.unitTestRecords[p.id];
        progressData.push([
            p.title,
            prog?.completed ? '已完成' : '进行中',
            prog?.completedAt || '-',
            test?.bestScore !== undefined ? test.bestScore : '-'
        ]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(progressData);
    XLSX.utils.book_append_sheet(wb, ws2, '项目进度');

    // Sheet 3: 知识点小测
    const quizData = [['所属任务', '任务名称', '答题次数', '最高分', '最近得分']];
    projects.forEach(p => {
        p.tasks.forEach(t => {
            const r = _data.quizRecords[t.id];
            if (r) {
                quizData.push([
                    t.id,
                    t.title,
                    r.attempts,
                    r.bestScore,
                    r.lastScore
                ]);
            }
        });
    });
    const ws3 = XLSX.utils.aoa_to_sheet(quizData);
    XLSX.utils.book_append_sheet(wb, ws3, '知识点小测');

    // Sheet 4: 单元测试记录
    const testData = [['项目名称', '考试次数', '最高分', '历次成绩']];
    projects.forEach(p => {
        const r = _data.unitTestRecords[p.id];
        if (r) {
            testData.push([
                p.title,
                r.attempts.length,
                r.bestScore,
                r.attempts.map(a => a.score).join(', ')
            ]);
        }
    });
    const ws4 = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb, ws4, '单元测试');

    // Sheet 5: 错题集
    const wrongData = [['题目', '你的答案', '正确答案', '所属知识点', '时间']];
    _data.wrongQuestions.forEach(w => {
        wrongData.push([
            w.question,
            w.yourAnswer,
            w.correctAnswer,
            w.knowledgePoint || '-',
            w.timestamp
        ]);
    });
    const ws5 = XLSX.utils.aoa_to_sheet(wrongData);
    XLSX.utils.book_append_sheet(wb, ws5, '错题集');

    XLSX.writeFile(wb, `${name}_经济管理大数据分析学习档案.xlsx`);
}

// 导入 JSON
function importFromJSON(jsonStr) {
    try {
        const data = JSON.parse(jsonStr);
        // 简单校验
        if (!data.userInfo || !data.progress) {
            return { success: false, message: '文件格式不正确' };
        }
        _data = { ...getDefaultData(), ...data };
        persist();
        return { success: true, message: '导入成功' };
    } catch (e) {
        return { success: false, message: '文件解析失败: ' + e.message };
    }
}

// 重置
function resetAll() {
    _data = getDefaultData();
    persist();
}

// 获取统计数据
function getStats() {
    const projects = window.COURSE_DATA?.projects || [];
    let totalTasks = 0;
    let learnedTasks = 0;
    let quizTotal = 0;
    let quizDone = 0;
    let testTotal = 0;
    let testPassed = 0;
    let totalBestScore = 0;
    let testCount = 0;

    projects.forEach(p => {
        p.tasks.forEach(t => {
            totalTasks++;
            if (_data.taskLearned[t.id]) learnedTasks++;
            if (t.quiz && t.quiz.length > 0) {
                quizTotal++;
                if (_data.taskQuizStatus[t.id]) quizDone++;
            }
        });
        testTotal++;
        const tr = _data.unitTestRecords[p.id];
        if (tr && tr.bestScore >= 60) testPassed++;
        if (tr) {
            totalBestScore += tr.bestScore;
            testCount++;
        }
    });

    return {
        totalTasks,
        learnedTasks,
        quizTotal,
        quizDone,
        testTotal,
        testPassed,
        avgScore: testCount > 0 ? Math.round(totalBestScore / testCount) : 0,
        overallProgress: totalTasks > 0 ? Math.round((learnedTasks / totalTasks) * 100) : 0,
        learnTime: _data.totalLearnTime,
        wrongCount: _data.wrongQuestions.length
    };
}

window.Storage = {
    loadData,
    saveData,
    getData,
    persist,
    initUser,
    addLearnTime,
    markTaskLearned,
    recordQuiz,
    recordUnitTest,
    isProjectUnlocked,
    isTaskAccessible,
    getProjectProgress,
    exportToJSON,
    exportToExcel,
    importFromJSON,
    resetAll,
    getStats
};
