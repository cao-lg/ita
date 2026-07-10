/**
 * 本地存储管理模块
 * 所有学习数据保存在 localStorage 中
 */

const STORAGE_KEY = 'embd_learning_data';

// 默认数据结构
function getDefaultData() {
    return {
        dataVersion: 3,
        userInfo: { name: '', className: '', studentId: '' },
        progress: {},
        quizRecords: {},      // { taskId: { score, bestScore, attempts, answers: [] } }
        unitTestRecords: {},  // { projectId: { bestScore, attempts: [], records: [] } }
        wrongQuestions: [],   // { questionId, question, yourAnswer, correctAnswer, type, taskId/projectId, bloom, solo, knowledgeTags, variantGroupId, correctionHistory, mastered, masteredAt }
        totalLearnTime: 0,    // 分钟
        lastActiveTime: null,
        taskQuizStatus: {},   // { taskId: boolean } 是否完成小测
        taskLearned: {},      // { taskId: boolean } 是否标记已学
        timestamps: {},       // { taskId: finishTime }
        cognitiveProfile: {
            bloomScores: { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0 },
            bloomTotals: { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0 },
            soloScores:  { S1: 0, S2: 0, S3: 0, S4: 0 },
            soloTotals:  { S1: 0, S2: 0, S3: 0, S4: 0 },
            knowledgeScores: {},  // { tag: { correct, total } }
            lastUpdated: null
        },
        masteryState: {}      // { "knowledgeTag__bloom": { totalAttempts, correctCount, accuracy, mastered, masteredAt, rounds, usedVariantIds, sourceWrongIds } }
    };
}

// 数据迁移 V1 -> V2 -> V3
function migrateData(data) {
    const version = data.dataVersion || 1;

    // V1 -> V2: 添加 cognitiveProfile
    if (version < 2) {
        data.cognitiveProfile = {
            bloomScores: { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0 },
            bloomTotals: { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0 },
            soloScores:  { S1: 0, S2: 0, S3: 0, S4: 0 },
            soloTotals:  { S1: 0, S2: 0, S3: 0, S4: 0 },
            knowledgeScores: {},
            lastUpdated: null
        };
        data.legacyRecordWarning = true;
        data.dataVersion = 2;
    }

    // V2 -> V3: 添加 masteryState，扩展 wrongQuestions 结构
    if (data.dataVersion < 3) {
        data.masteryState = data.masteryState || {};

        // 为历史错题补充标签和矫正字段
        data.wrongQuestions.forEach(w => {
            if (!w.bloom || !w.knowledgeTags) {
                const tags = inferQuestionTags(w);
                w.bloom = w.bloom || tags.bloom;
                w.solo = w.solo || tags.solo;
                w.knowledgeTags = w.knowledgeTags || (tags.knowledgeTags.length > 0 ? tags.knowledgeTags : ['综合']);
            }
            if (!w.variantGroupId) w.variantGroupId = 'vg-' + w.questionId;
            if (!w.correctionHistory) w.correctionHistory = [];
            if (w.mastered === undefined) w.mastered = false;
        });

        // 基于已有认知画像初始化 masteryState 骨架
        const cp = data.cognitiveProfile;
        if (cp && cp.knowledgeScores) {
            Object.keys(cp.knowledgeScores).forEach(tag => {
                ['B1','B2','B3','B4','B5','B6'].forEach(bloom => {
                    const key = `${tag}__${bloom}`;
                    if (!data.masteryState[key]) {
                        data.masteryState[key] = {
                            totalAttempts: 0, correctCount: 0, accuracy: 0,
                            mastered: false, masteredAt: null,
                            consecutiveCorrect: 0, consecutiveWrong: 0,
                            needsFallback: false, fallbackReason: null,
                            masteryTrack: null,
                            rounds: [], usedVariantIds: [], sourceWrongIds: []
                        };
                    }
                });
            });
        }

        data.dataVersion = 3;
    }

    return data;
}

// 读取数据
function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // 合并默认结构，防止版本升级后缺少字段
            const merged = { ...getDefaultData(), ...parsed };
            return migrateData(merged);
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

// 题目标签推断（旧题无标签时降级）
function inferQuestionTags(question) {
    const type = question.type || 'single';
    let bloom = question.bloom;
    let solo = question.solo;
    let tags = question.knowledgeTags || [];

    if (!bloom || !solo) {
        if (type === 'judge') {
            bloom = bloom || 'B2';
            solo = solo || 'S1';
        } else if (type === 'codefill') {
            bloom = bloom || 'B3';
            solo = solo || 'S1';
        } else if (type === 'multi') {
            bloom = bloom || 'B2';
            solo = solo || 'S2';
        } else if (type === 'case') {
            bloom = bloom || 'B4';
            solo = solo || 'S3';
        } else if (type === 'code') {
            bloom = bloom || 'B6';
            solo = solo || 'S4';
        } else if (type === 'design') {
            bloom = bloom || 'B6';
            solo = solo || 'S4';
        } else {
            // single 纯概念题
            bloom = bloom || 'B1';
            solo = solo || 'S1';
        }
    }
    return { bloom, solo, knowledgeTags: tags };
}

// 更新认知画像
function updateCognitiveProfile(questionList, answers, score, total) {
    const cp = _data.cognitiveProfile;
    questionList.forEach((q, idx) => {
        const tags = inferQuestionTags(q);
        const isCorrect = Array.isArray(q.answer)
            ? JSON.stringify(q.answer.sort()) === JSON.stringify((answers[idx] || []).sort())
            : q.answer === answers[idx];

        // 更新布鲁姆维度
        cp.bloomTotals[tags.bloom] = (cp.bloomTotals[tags.bloom] || 0) + 1;
        if (isCorrect) cp.bloomScores[tags.bloom] = (cp.bloomScores[tags.bloom] || 0) + 1;

        // 更新SOLO维度
        cp.soloTotals[tags.solo] = (cp.soloTotals[tags.solo] || 0) + 1;
        if (isCorrect) cp.soloScores[tags.solo] = (cp.soloScores[tags.solo] || 0) + 1;

        // 更新知识点维度
        tags.knowledgeTags.forEach(tag => {
            if (!cp.knowledgeScores[tag]) cp.knowledgeScores[tag] = { correct: 0, total: 0 };
            cp.knowledgeScores[tag].total++;
            if (isCorrect) cp.knowledgeScores[tag].correct++;
        });
    });
    cp.lastUpdated = new Date().toISOString();
}

// 获取认知画像
function getCognitiveProfile() {
    return _data.cognitiveProfile;
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

    // 记录错题（含掌握学习标签）
    wrongList.forEach(w => {
        const idx = _data.wrongQuestions.findIndex(q => q.questionId === w.questionId && q.taskId === taskId);
        if (idx === -1) {
            const tags = w.bloom ? { bloom: w.bloom, solo: w.solo || 'S1', knowledgeTags: w.knowledgeTags || [] }
                                 : inferQuestionTags(w);
            _data.wrongQuestions.push({
                ...w,
                taskId,
                timestamp: new Date().toISOString(),
                bloom: tags.bloom,
                solo: tags.solo,
                knowledgeTags: tags.knowledgeTags.length > 0 ? tags.knowledgeTags : ['综合'],
                variantGroupId: 'vg-' + w.questionId,
                correctionHistory: [],
                mastered: false
            });
        }
    });

    // 更新认知画像
    const projects = window.COURSE_DATA?.projects || [];
    for (const p of projects) {
        for (const t of p.tasks) {
            if (t.id === taskId && t.quiz) {
                updateCognitiveProfile(t.quiz, answers, score, total);
                break;
            }
        }
    }

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

    // 记录错题（含掌握学习标签）
    wrongList.forEach(w => {
        const idx = _data.wrongQuestions.findIndex(q => q.questionId === w.questionId && q.projectId === projectId);
        if (idx === -1) {
            const tags = w.bloom ? { bloom: w.bloom, solo: w.solo || 'S1', knowledgeTags: w.knowledgeTags || [] }
                                 : inferQuestionTags(w);
            _data.wrongQuestions.push({
                ...w,
                projectId,
                timestamp: new Date().toISOString(),
                bloom: tags.bloom,
                solo: tags.solo,
                knowledgeTags: tags.knowledgeTags.length > 0 ? tags.knowledgeTags : ['综合'],
                variantGroupId: 'vg-' + w.questionId,
                correctionHistory: [],
                mastered: false
            });
        }
    });

    // 如果及格，标记项目完成
    if (percentage >= 60) {
        _data.progress[projectId] = { completed: true, completedAt: new Date().toISOString() };
    }

    // 更新认知画像
    const unitTest = window.COURSE_DATA?.unitTests?.[projectId];
    if (unitTest && unitTest.questions) {
        updateCognitiveProfile(unitTest.questions, answers, score, total);
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

    // Sheet 5: 错题集（含掌握学习完整字段）
    const wrongData = [['题目ID', '题目', '题型', '布鲁姆层级', 'SOLO层级', '知识标签',
        '你的答案', '正确答案', '错题时间',
        '矫正轮次', '掌握状态', '判定轨道', '掌握时间']];
    _data.wrongQuestions.forEach(w => {
        const tags = (w.knowledgeTags || []).join('/');
        const ch = w.correctionHistory || [];
        const chLen = ch.length;
        const chCorrect = ch.filter(c => c.correct).length;
        // 从 masteryState 获取回退/轨道信息
        const wTag = (w.knowledgeTags || ['综合'])[0];
        const wBloom = w.bloom || 'B1';
        const msKey = wTag + '__' + wBloom;
        const wMs = (_data.masteryState || {})[msKey];
        const wNeedsFallback = !!(wMs && wMs.needsFallback);
        const wTrack = wMs ? wMs.masteryTrack : null;
        wrongData.push([
            w.questionId || '-',
            w.question,
            w.type || 'single',
            w.bloom || '-',
            w.solo || '-',
            tags || w.knowledgePoint || '-',
            w.yourAnswer,
            w.correctAnswer,
            w.timestamp,
            `${chLen}轮(答对${chCorrect})`,
            w.mastered ? '已掌握' : wNeedsFallback ? '需回退学习' : (chLen > 0 ? '矫正中' : '待矫正'),
            wTrack ? ('轨道' + wTrack) : '-',
            w.masteredAt || '-'
        ]);
    });
    const ws5 = XLSX.utils.aoa_to_sheet(wrongData);
    XLSX.utils.book_append_sheet(wb, ws5, '错题集');

    // Sheet 6: 认知画像
    const cp = _data.cognitiveProfile || {};
    const bloomNames = { B1: '记忆', B2: '理解', B3: '应用', B4: '分析', B5: '评价', B6: '创造' };
    const soloNames = { S1: '单点结构', S2: '多点结构', S3: '关联结构', S4: '抽象拓展' };
    const cpBloomData = [['布鲁姆层级', '答对数', '总题数', '正确率(%)']];
    ['B1','B2','B3','B4','B5','B6'].forEach(b => {
        const t = (cp.bloomTotals || {})[b] || 0;
        const s = (cp.bloomScores || {})[b] || 0;
        cpBloomData.push([bloomNames[b] + '(' + b + ')', s, t, t > 0 ? Math.round(s / t * 100) : 0]);
    });
    const ws6 = XLSX.utils.aoa_to_sheet(cpBloomData);
    XLSX.utils.book_append_sheet(wb, ws6, '布鲁姆认知画像');

    const cpSoloData = [['SOLO层级', '答对数', '总题数', '正确率(%)']];
    ['S1','S2','S3','S4'].forEach(s => {
        const t = (cp.soloTotals || {})[s] || 0;
        const sc = (cp.soloScores || {})[s] || 0;
        cpSoloData.push([soloNames[s] + '(' + s + ')', sc, t, t > 0 ? Math.round(sc / t * 100) : 0]);
    });
    const ws7 = XLSX.utils.aoa_to_sheet(cpSoloData);
    XLSX.utils.book_append_sheet(wb, ws7, 'SOLO学习层次');

    const cpKnowData = [['知识点', '答对数', '总题数', '正确率(%)']];
    Object.entries(cp.knowledgeScores || {}).forEach(([tag, ks]) => {
        cpKnowData.push([tag, ks.correct, ks.total, ks.total > 0 ? Math.round(ks.correct / ks.total * 100) : 0]);
    });
    const ws8 = XLSX.utils.aoa_to_sheet(cpKnowData);
    XLSX.utils.book_append_sheet(wb, ws8, '知识点掌握');

    // Sheet 9: 掌握状态
    const msData = [['知识点', '布鲁姆层级', '总尝试', '正确数', '正确率(%)',
        '连续正确', '连续错误', '掌握状态', '判定轨道', '需回退学习', '回退原因', '掌握时间']];
    Object.entries(_data.masteryState || {}).forEach(([key, ms]) => {
        if (ms.totalAttempts === 0) return;
        const [tag, bloom] = key.split('__');
        msData.push([
            tag, bloom, ms.totalAttempts, ms.correctCount, ms.accuracy,
            ms.consecutiveCorrect || 0, ms.consecutiveWrong || 0,
            ms.mastered ? '已掌握' : '未掌握',
            ms.masteryTrack ? ('轨道' + ms.masteryTrack) : '-',
            ms.needsFallback ? '是' : '否',
            ms.fallbackReason || '',
            ms.masteredAt || ''
        ]);
    });
    const ws9 = XLSX.utils.aoa_to_sheet(msData);
    XLSX.utils.book_append_sheet(wb, ws9, '掌握学习状态');

    // Sheet 10: 行为事件日志
    if (typeof BehaviorTracker !== 'undefined') {
        const events = BehaviorTracker.getEvents();
        const evtHeader = [['时间', '事件类型', '目标', 'SRL阶段', '详情(摘要)', '会话ID']];
        const evtData = [...evtHeader];
        events.slice(-500).forEach(e => {
            const detailStr = Object.entries(e.detail || {}).map(([k,v]) => k + ':' + v).join(', ');
            evtData.push([
                new Date(e.timestamp).toLocaleString(),
                e.type,
                e.target || '-',
                e.srlPhase || '-',
                detailStr.substring(0, 200),
                e.sessionId || '-'
            ]);
        });
        const ws10 = XLSX.utils.aoa_to_sheet(evtData);
        XLSX.utils.book_append_sheet(wb, ws10, '行为事件日志');
    }

    // Sheet 11: 行为画像
    if (typeof BehaviorTracker !== 'undefined') {
        const bp = BehaviorTracker.computeBehaviorProfile();
        const s = bp.sessionSummary || {};
        const ic = bp.impulseCareful || {};
        const cs = bp.completeSkip || {};
        const rr = bp.reflectiveRepetitive || {};
        const id = bp.independentDependent || {};
        const pg = bp.persistentGiveup || {};
        const bpData = [
            ['行为画像维度', '指标', '值', '分类标签'],
            ['学习节奏', '总学习会话数', s.totalSessions || 0, ''],
            ['学习节奏', '平均会话时长(分钟)', s.avgDurationMin || 0, ''],
            ['学习节奏', '总行为事件数', s.totalEvents || 0, ''],
            ['学习节奏', '偏好学习时段', bp.preferredTimeSlot || '-', ''],
            ['冲动/审慎', '平均作答时间(秒)', ic.avgResponseTimeSec || 0, ic.label || '数据不足'],
            ['冲动/审慎', '答案变更率(%)', ic.answerChangeRate || 0, ''],
            ['冲动/审慎', '变更后正确率(%)', ic.correctChangeRate || 0, ''],
            ['冲动/审慎', '快速猜测率(<3秒,%)', ic.fastGuessRate || 0, ''],
            ['完整/跳过', '小测完成率(%)', cs.quizCompletionRate || 0, cs.label || '数据不足'],
            ['完整/跳过', '平均任务停留(秒)', cs.avgTaskDurationSec || 0, ''],
            ['完整/跳过', '平均材料滚动深度(%)', cs.avgMaterialScrollPercent || 0, ''],
            ['反思/重复', '平均反馈查看时长(秒)', rr.avgFeedbackDurationSec || 0, rr.label || '数据不足'],
            ['反思/重复', '反馈查看率(%)', rr.feedbackViewRate || 0, ''],
            ['反思/重复', '任务重访率(%)', rr.taskRevisitRate || 0, ''],
            ['反思/重复', '错题回顾次数', rr.wrongReviewCount || 0, ''],
            ['反思/重复', '错题重做次数', rr.wrongRetryCount || 0, ''],
            ['独立/依赖', '提示查看次数', id.hintViewCount || 0, id.label || '数据不足'],
            ['独立/依赖', '有效求助率(%)', id.effectiveHelpRate || 0, ''],
            ['独立/依赖', '求助后正确率(%)', id.helpCorrectRate || 0, ''],
            ['坚持/放弃', '回退触发次数', pg.fallbackTriggerCount || 0, pg.label || '数据不足'],
            ['坚持/放弃', '矫正掌握率(%)', pg.correctionMasteryRate || 0, ''],
            ['坚持/放弃', '重做小测数', pg.retriedQuizCount || 0, ''],
            ['坚持/放弃', '中途放弃率(%)', pg.abandonmentRate || 0, ''],
            ['综合', '首次作答正确率(%)', bp.firstAttemptAccuracy || 0, ''],
            ['综合', '画像计算时间', bp.lastComputed || '-', '']
        ];
        const ws11 = XLSX.utils.aoa_to_sheet(bpData);
        XLSX.utils.book_append_sheet(wb, ws11, '行为画像');
    }

    XLSX.writeFile(wb, `${name}_经济管理大数据分析学习档案.xlsx`);
}

// 导入 JSON
function importFromJSON(jsonStr) {
    try {
        const data = JSON.parse(jsonStr);
        // 基础校验
        if (!data.userInfo || !data.progress) {
            return { success: false, message: '文件格式不正确' };
        }
        _data = { ...getDefaultData(), ...data };
        // 执行迁移确保新字段完整（如导入V1/V2旧数据）
        _data = migrateData(_data);
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

// ===== 掌握学习状态操作 =====

function getMasteryState() {
    return _data.masteryState || {};
}

function updateMasteryStatus(key, roundData) {
    if (!_data.masteryState) _data.masteryState = {};
    if (!_data.masteryState[key]) {
        _data.masteryState[key] = {
            totalAttempts: 0, correctCount: 0, accuracy: 0,
            mastered: false, masteredAt: null,
            consecutiveCorrect: 0, consecutiveWrong: 0,
            needsFallback: false, fallbackReason: null,
            masteryTrack: null,
            rounds: [], usedVariantIds: [], sourceWrongIds: []
        };
    }
    const state = _data.masteryState[key];
    const isCorrect = roundData.correctCount > 0;

    state.totalAttempts += roundData.totalCount;
    state.correctCount += roundData.correctCount;
    state.accuracy = state.totalAttempts > 0
        ? Math.round((state.correctCount / state.totalAttempts) * 100) : 0;

    // 连续正确/错误计数（排除运气成分的核心机制）
    if (isCorrect) {
        state.consecutiveCorrect++;
        state.consecutiveWrong = 0;
    } else {
        state.consecutiveWrong++;
        state.consecutiveCorrect = 0;
    }

    // ===== 双轨掌握判定 =====
    // 轨道A：修正版累计正确率（动态阈值，避免小样本退化）
    //   题目池≥5时要求80%；3-4题时要求67%（允许错1道）
    //   理论依据：Bloom(1968), Guskey(2007) + 整数离散性修正
    const trackA = state.totalAttempts >= 5
        ? state.accuracy >= 80
        : (state.totalAttempts >= 3 && state.accuracy >= 67);

    // 轨道B：连续2题正确（行为分析习得标准）
    //   理论依据：PMC(2021) 连续正确响应标准，排除"错错对"的运气成分
    //   单选4选项连续2题纯猜概率仅6.25%，判断题25%，可接受
    const trackB = state.consecutiveCorrect >= 2;

    // 最低样本量：不足3次不判定（信度不足，Spearman-Brown α<0.50）
    state.mastered = (trackA || trackB) && state.totalAttempts >= 3;
    state.masteryTrack = state.mastered ? (trackB ? 'B' : 'A') : null;

    if (state.mastered && !state.masteredAt) {
        state.masteredAt = new Date().toISOString();
    }

    // ===== 回退学习触发器 =====
    // 条件1：连续3题错误 → 当前教学方式未奏效，需换方式
    //   理论依据：Guskey(2007) 矫正必须"qualitatively different"
    // 条件2：3次以上尝试正确率<50% → 理解存在根本性缺陷
    if (!state.mastered && !state.needsFallback) {
        if (state.consecutiveWrong >= 3) {
            state.needsFallback = true;
            state.fallbackReason = '连续3题错误，平行题矫正未奏效，建议回退到学习材料重新学习';
        } else if (state.totalAttempts >= 3 && state.accuracy < 50) {
            state.needsFallback = true;
            state.fallbackReason = `${state.totalAttempts}次尝试正确率仅${state.accuracy}%，理解存在根本性缺陷，建议回退学习`;
        }
    }

    state.rounds.push({
        round: state.rounds.length + 1,
        date: new Date().toISOString(),
        questionIds: roundData.questionIds || [],
        correctCount: roundData.correctCount,
        totalCount: roundData.totalCount,
        correct: isCorrect
    });
    if (roundData.variantIds) {
        state.usedVariantIds.push(...roundData.variantIds);
    }
    persist();
    return state;
}

function updateWrongQuestionCorrection(questionId, correctionRecord) {
    const wq = _data.wrongQuestions.find(w => w.questionId === questionId);
    if (!wq) return;
    if (!wq.correctionHistory) wq.correctionHistory = [];
    wq.correctionHistory.push(correctionRecord);
    // 如果本轮正确，检查是否达到掌握
    if (correctionRecord.correct) {
        const tag = (wq.knowledgeTags || ['综合'])[0];
        const bloom = wq.bloom || 'B1';
        const key = `${tag}__${bloom}`;
        const state = _data.masteryState[key];
        if (state && state.mastered) {
            wq.mastered = true;
            wq.masteredAt = state.masteredAt;
        }
    }
    persist();
}

function findQuestionById(questionId) {
    const projects = window.COURSE_DATA?.projects || [];
    for (const p of projects) {
        for (const t of p.tasks) {
            if (t.quiz) {
                const found = t.quiz.find(q => q.id === questionId);
                if (found) return found;
            }
        }
    }
    // 检查单元测试
    const uts = window.COURSE_DATA?.unitTests || {};
    for (const pid of Object.keys(uts)) {
        const q = (uts[pid].questions || []).find(q => q.id === questionId);
        if (q) return q;
    }
    // 检查扩展题库
    if (typeof EXTENDED_QUESTIONS !== 'undefined') {
        for (const pid of Object.keys(EXTENDED_QUESTIONS)) {
            const ext = EXTENDED_QUESTIONS[pid];
            const found = [...(ext.quiz || []), ...(ext.unitTest || [])].find(q => q.id === questionId);
            if (found) return found;
        }
    }
    return null;
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
    getStats,
    getCognitiveProfile,
    inferQuestionTags,
    getMasteryState,
    updateMasteryStatus,
    updateWrongQuestionCorrection,
    findQuestionById
};
