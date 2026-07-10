/**
 * 学习行为追踪模块 (Behavior Tracker)
 * 理论基础：
 *   - Winne & Hadwin (1998) SRL 四阶段模型（任务理解→目标设定→策略实施→适应性调节）
 *   - Zimmerman (2002) 三阶段循环（前瞻→执行→自我反思）
 *
 * 事件日志存储在独立的 localStorage key (embd_behavior_events)，
 * 避免影响主数据加载性能。
 * 行为画像通过 computeBehaviorProfile() 按需计算。
 */

const BEHAVIOR_EVENTS_KEY = 'embd_behavior_events';
const MAX_EVENTS = 3000;            // 最大事件数，FIFO 淘汰
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 分钟无操作视为新会话

const BehaviorTracker = (() => {
    let _events = [];
    let _sessionId = null;
    let _sessionStart = null;
    let _lastActivity = null;
    let _timers = {};   // { timerId: { start, type, target, context } }
    let _initialized = false;

    // ======================== 事件日志读写 ========================

    function _loadEvents() {
        try {
            const raw = localStorage.getItem(BEHAVIOR_EVENTS_KEY);
            if (raw) _events = JSON.parse(raw);
        } catch (e) {
            console.error('加载行为日志失败:', e);
            _events = [];
        }
    }

    function _saveEvents() {
        try {
            if (_events.length > MAX_EVENTS) {
                _events = _events.slice(_events.length - MAX_EVENTS);
            }
            localStorage.setItem(BEHAVIOR_EVENTS_KEY, JSON.stringify(_events));
        } catch (e) {
            // localStorage 满时，强制裁剪到一半
            _events = _events.slice(Math.floor(MAX_EVENTS / 2));
            try { localStorage.setItem(BEHAVIOR_EVENTS_KEY, JSON.stringify(_events)); } catch (e2) { /* 静默 */ }
        }
    }

    // ======================== 会话管理 ========================

    function _ensureSession() {
        const now = Date.now();
        if (!_sessionId || !_lastActivity || (now - _lastActivity > SESSION_TIMEOUT)) {
            _endSession();
            _sessionId = 'sess_' + now + '_' + Math.random().toString(36).substr(2, 6);
            _sessionStart = now;
            _track('session_start', null, { referrer: document.referrer || 'direct' });
        }
        _lastActivity = now;
    }

    function _endSession() {
        if (_sessionId && _sessionStart) {
            _track('session_end', null, { duration: Date.now() - _sessionStart });
            _sessionId = null;
            _sessionStart = null;
        }
    }

    // ======================== 计时器 ========================

    /** 开始计时 */
    function startTimer(timerId, type, target, context = {}) {
        _ensureSession();
        _timers[timerId] = { start: Date.now(), type, target, context: { ...context } };
    }

    /** 结束计时并返回 { start, type, target, context, duration } */
    function endTimer(timerId, extra = {}) {
        const timer = _timers[timerId];
        if (!timer) return null;
        const duration = Date.now() - timer.start;
        delete _timers[timerId];
        return { ...timer, duration, ...extra };
    }

    // ======================== SRL 阶段映射 ========================

    function _mapSrlPhase(eventType) {
        const map = {
            task_view: 'task_understanding', material_scroll: 'task_understanding',
            quiz_start: 'goal_setting', unit_test_start: 'goal_setting',
            question_view: 'enactment', answer_select: 'enactment',
            answer_change: 'adaptation', answer_submit: 'enactment',
            answer_feedback_view: 'self_reflection',
            quiz_finish: 'self_reflection',
            correction_start: 'adaptation', correction_answer: 'adaptation',
            correction_finish: 'self_reflection', fallback_trigger: 'adaptation',
            unit_test_finish: 'self_reflection', wrong_review: 'self_reflection',
            page_switch: 'enactment', nav_click: 'enactment', hint_view: 'adaptation'
        };
        return map[eventType] || 'enactment';
    }

    // ======================== 核心：记录事件 ========================

    function _track(type, target, detail = {}, context = {}) {
        const evt = {
            id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type,
            target: target || null,
            sessionId: _sessionId,
            srlPhase: _mapSrlPhase(type),
            timestamp: Date.now(),
            detail,
            context
        };
        _events.push(evt);
        _saveEvents();
        return evt;
    }

    // ======================== 便捷追踪方法 ========================

    /* ---------- 任务学习 ---------- */

    /** 开始查看学习任务 */
    function trackTaskView(taskId, projectId) {
        startTimer('task_' + taskId, 'task_view', taskId, { projectId });
        return _track('task_view', taskId, {}, { taskId, projectId });
    }

    /** 离开学习任务（自动记录停留时长） */
    function trackTaskLeave(taskId) {
        const timer = endTimer('task_' + taskId);
        if (timer && timer.duration > 1000) {
            _track('task_leave', taskId, { duration: timer.duration }, timer.context);
        }
    }

    /** 学习材料滚动深度 (scrollPercent: 0-100) */
    function trackMaterialScroll(taskId, scrollPercent) {
        _track('material_scroll', taskId, { scrollPercent: Math.round(scrollPercent) }, { taskId });
    }

    /* ---------- 知识点小测 ---------- */

    /** 开始小测 */
    function trackQuizStart(taskId, projectId, questionCount) {
        startTimer('quiz_' + taskId, 'quiz', taskId, { taskId, projectId });
        return _track('quiz_start', taskId, { questionCount }, { taskId, projectId });
    }

    /** 查看题目（开始计时作答时间） */
    function trackQuestionView(taskId, questionId, questionIndex, questionType, bloom, solo, knowledgeTags) {
        startTimer('q_' + questionId, 'question', questionId,
            { taskId, questionId, questionType, bloom, knowledgeTags: knowledgeTags || [] });
        return _track('question_view', questionId, { questionIndex, questionType },
            { taskId, bloom: bloom || '', solo: solo || '', knowledgeTags: knowledgeTags || [] });
    }

    /** 选择答案（可能多次选择，用于检测答案变更） */
    function trackAnswerSelect(taskId, questionId, selectedAnswer) {
        return _track('answer_select', questionId,
            { selectedAnswer: _safeStr(selectedAnswer) }, { taskId });
    }

    /** 修改答案（从旧答案改为新答案） */
    function trackAnswerChange(taskId, questionId, oldAnswer, newAnswer) {
        return _track('answer_change', questionId,
            { oldAnswer: _safeStr(oldAnswer), newAnswer: _safeStr(newAnswer) }, { taskId });
    }

    /** 提交答案（responseTime 可选，不传则从内置计时器自动取） */
    function trackAnswerSubmit(taskId, questionId, answer, isCorrect, responseTime) {
        const timer = endTimer('q_' + questionId);
        const rt = responseTime || (timer ? timer.duration : 0);
        return _track('answer_submit', questionId,
            { answer: _safeStr(answer), isCorrect: !!isCorrect, responseTime: rt },
            { taskId });
    }

    /** 查看答案反馈/解析 */
    function trackFeedbackView(taskId, questionId, feedbackDuration) {
        return _track('answer_feedback_view', questionId,
            { feedbackDuration: feedbackDuration || 0 }, { taskId });
    }

    /** 完成小测 */
    function trackQuizFinish(taskId, score, total, wrongCount) {
        const timer = endTimer('quiz_' + taskId);
        return _track('quiz_finish', taskId,
            { score, total, wrongCount, duration: timer ? timer.duration : 0 },
            { taskId });
    }

    /* ---------- 掌握学习矫正 ---------- */

    /** 开始矫正轮次 */
    function trackCorrectionStart(taskId, wrongCount, round) {
        startTimer('correction_' + taskId + '_r' + round, 'correction', taskId, { taskId, round });
        return _track('correction_start', taskId, { wrongCount, round }, { taskId });
    }

    /** 矫正答题 */
    function trackCorrectionAnswer(taskId, questionId, isCorrect, isVariant, round) {
        return _track('correction_answer', questionId,
            { isCorrect: !!isCorrect, isVariant: !!isVariant, round }, { taskId });
    }

    /** 完成矫正轮次 */
    function trackCorrectionFinish(taskId, round, mastered, track, needsFallback, fallbackReason) {
        const timer = endTimer('correction_' + taskId + '_r' + round);
        return _track('correction_finish', taskId, {
            round, mastered: !!mastered, track: track || null,
            needsFallback: !!needsFallback, fallbackReason: fallbackReason || null,
            duration: timer ? timer.duration : 0
        }, { taskId });
    }

    /** 触发回退学习 */
    function trackFallbackTrigger(taskId, knowledgeTag, bloom, reason) {
        return _track('fallback_trigger', knowledgeTag + '__' + bloom,
            { reason, bloom }, { taskId, knowledgeTag });
    }

    /* ---------- 单元测试 ---------- */

    /** 开始单元测试 */
    function trackUnitTestStart(projectId, questionCount) {
        startTimer('unittest_' + projectId, 'unit_test', projectId, { projectId });
        return _track('unit_test_start', projectId, { questionCount }, { projectId });
    }

    /** 完成单元测试 */
    function trackUnitTestFinish(projectId, score, total, duration) {
        endTimer('unittest_' + projectId);
        return _track('unit_test_finish', projectId, { score, total, duration }, { projectId });
    }

    /* ---------- 错题回顾 ---------- */

    /** 查看或重做错题 (action: 'view' | 'retry') */
    function trackWrongReview(questionId, action) {
        return _track('wrong_review', questionId, { action: action || 'view' });
    }

    /* ---------- 页面/导航 ---------- */

    /** 页面切换 */
    function trackPageSwitch(fromPage, toPage) {
        return _track('page_switch', toPage, { fromPage });
    }

    /** 导航点击 */
    function trackNavClick(target) {
        return _track('nav_click', target, {});
    }

    /* ---------- 帮助/提示 ---------- */

    /** 查看提示 */
    function trackHintView(taskId, questionId, hintType) {
        return _track('hint_view', questionId, { hintType: hintType || 'general' }, { taskId });
    }

    // ======================== 行为画像计算 ========================

    /**
     * 基于全部事件日志计算行为画像
     * 六维度：冲动/审慎、完整/跳过、反思/重复、独立/依赖、坚持/放弃、学习节奏
     */
    function computeBehaviorProfile() {
        if (_events.length === 0) return getDefaultProfile();

        const profile = getDefaultProfile();

        // ---- 1. 会话统计 & 学习节奏 ----
        const sessions = {};
        _events.forEach(e => {
            if (!sessions[e.sessionId]) {
                sessions[e.sessionId] = { start: e.timestamp, end: e.timestamp, events: 0 };
            }
            sessions[e.sessionId].end = Math.max(sessions[e.sessionId].end, e.timestamp);
            sessions[e.sessionId].events++;
        });
        const sessionList = Object.values(sessions);
        const sessionDurations = sessionList.map(s => s.end - s.start).filter(d => d > 5000);
        const avgSessionMin = sessionDurations.length > 0
            ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length / 60000 : 0;

        const hourDist = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        sessionList.forEach(s => {
            const h = new Date(s.start).getHours();
            if (h >= 6 && h < 12) hourDist.morning++;
            else if (h >= 12 && h < 18) hourDist.afternoon++;
            else if (h >= 18 && h < 22) hourDist.evening++;
            else hourDist.night++;
        });

        profile.sessionSummary = {
            totalSessions: sessionList.length,
            avgDurationMin: Math.round(avgSessionMin),
            totalEvents: _events.length,
            hourDistribution: hourDist
        };

        // ---- 2. 冲动 vs 审慎 ----
        const submits = _events.filter(e => e.type === 'answer_submit');
        const answerChanges = _events.filter(e => e.type === 'answer_change');
        const responseTimes = submits.map(e => e.detail.responseTime).filter(t => t > 0);
        const avgRT = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000 : 0;
        const changeRate = submits.length > 0 ? answerChanges.length / submits.length : 0;
        const correctChanges = answerChanges.filter(e => {
            const ns = _events.find(s => s.type === 'answer_submit' && s.target === e.target && s.timestamp > e.timestamp);
            return ns && ns.detail.isCorrect;
        }).length;
        const correctChangeRate = answerChanges.length > 0 ? correctChanges / answerChanges.length : 0;
        const fastGuessCount = responseTimes.filter(t => t < 3000).length;
        const fastGuessRate = responseTimes.length > 0 ? fastGuessCount / responseTimes.length : 0;

        profile.impulseCareful = {
            avgResponseTimeSec: _r1(avgRT),
            answerChangeRate: _pct(changeRate),
            correctChangeRate: _pct(correctChangeRate),
            fastGuessRate: _pct(fastGuessRate),
            label: _classifyImpulse(avgRT, changeRate, fastGuessRate)
        };

        // ---- 3. 完整 vs 跳过 ----
        const quizStarts = _events.filter(e => e.type === 'quiz_start');
        const quizFinishes = _events.filter(e => e.type === 'quiz_finish');
        const taskLeaves = _events.filter(e => e.type === 'task_leave');
        const scrollEvts = _events.filter(e => e.type === 'material_scroll');

        const qCompRate = quizStarts.length > 0 ? quizFinishes.length / quizStarts.length : 0;
        const avgTaskDur = taskLeaves.length > 0
            ? taskLeaves.map(e => e.detail.duration).reduce((a, b) => a + b, 0) / taskLeaves.length / 1000 : 0;
        const avgScroll = scrollEvts.length > 0
            ? scrollEvts.map(e => e.detail.scrollPercent).reduce((a, b) => a + b, 0) / scrollEvts.length : 0;

        profile.completeSkip = {
            quizCompletionRate: _pct(qCompRate),
            avgTaskDurationSec: Math.round(avgTaskDur),
            avgMaterialScrollPercent: Math.round(avgScroll),
            label: _classifyComplete(qCompRate, avgScroll)
        };

        // ---- 4. 反思 vs 重复 ----
        const feedbackViews = _events.filter(e => e.type === 'answer_feedback_view');
        const fbdWithDur = feedbackViews.filter(e => e.detail.feedbackDuration > 0);
        const avgFbdDur = fbdWithDur.length > 0
            ? fbdWithDur.map(e => e.detail.feedbackDuration).reduce((a, b) => a + b, 0) / fbdWithDur.length / 1000 : 0;
        const fbdRate = submits.length > 0 ? feedbackViews.length / submits.length : 0;

        const taskViews = _events.filter(e => e.type === 'task_view');
        const tvCounts = {};
        taskViews.forEach(e => { tvCounts[e.target] = (tvCounts[e.target] || 0) + 1; });
        const tvKeys = Object.keys(tvCounts);
        const revisited = tvKeys.filter(k => tvCounts[k] > 1).length;
        const revisitRate = tvKeys.length > 0 ? revisited / tvKeys.length : 0;

        const wrongReviews = _events.filter(e => e.type === 'wrong_review');
        const wrongRetries = wrongReviews.filter(e => e.detail.action === 'retry').length;

        profile.reflectiveRepetitive = {
            avgFeedbackDurationSec: _r1(avgFbdDur),
            feedbackViewRate: _pct(fbdRate),
            taskRevisitRate: _pct(revisitRate),
            wrongReviewCount: wrongReviews.length,
            wrongRetryCount: wrongRetries,
            label: _classifyReflective(fbdRate, revisitRate, wrongRetries)
        };

        // ---- 5. 独立 vs 依赖 ----
        const hintViews = _events.filter(e => e.type === 'hint_view');
        const hintWithPrior = hintViews.filter(h => {
            return _events.some(s =>
                (s.type === 'answer_select' || s.type === 'answer_submit') &&
                s.target === h.target && s.timestamp < h.timestamp
            );
        }).length;
        const effHelpRate = hintViews.length > 0 ? hintWithPrior / hintViews.length : 0;

        let helpOkAfter = 0, helpTotal = 0;
        hintViews.forEach(h => {
            const after = _events.filter(s =>
                s.type === 'answer_submit' && s.target === h.target && s.timestamp > h.timestamp
            );
            if (after.length > 0) { helpTotal++; if (after[0].detail.isCorrect) helpOkAfter++; }
        });

        profile.independentDependent = {
            hintViewCount: hintViews.length,
            effectiveHelpRate: _pct(effHelpRate),
            helpCorrectRate: _pct(helpTotal > 0 ? helpOkAfter / helpTotal : 0),
            label: _classifyIndependent(hintViews.length, effHelpRate, submits.length)
        };

        // ---- 6. 坚持 vs 放弃 ----
        const fallbacks = _events.filter(e => e.type === 'fallback_trigger');
        const corrFinishes = _events.filter(e => e.type === 'correction_finish');
        const corrMastered = corrFinishes.filter(e => e.detail.mastered).length;
        const unfinished = quizStarts.length - quizFinishes.length;
        const abandonRate = quizStarts.length > 0 ? unfinished / quizStarts.length : 0;

        const quizAttempts = {};
        quizFinishes.forEach(e => { quizAttempts[e.target] = (quizAttempts[e.target] || 0) + 1; });
        const retried = Object.values(quizAttempts).filter(c => c > 1).length;

        profile.persistentGiveup = {
            fallbackTriggerCount: fallbacks.length,
            correctionMasteryRate: corrFinishes.length > 0 ? _pct(corrMastered / corrFinishes.length) : 0,
            retriedQuizCount: retried,
            abandonmentRate: _pct(abandonRate),
            label: _classifyPersistent(abandonRate, corrMastered, corrFinishes.length, retried)
        };

        // ---- 7. 首次作答正确率 ----
        const firstAttempts = {};
        submits.forEach(e => { if (!(e.target in firstAttempts)) firstAttempts[e.target] = e.detail.isCorrect; });
        const faValues = Object.values(firstAttempts);
        profile.firstAttemptAccuracy = faValues.length > 0
            ? _pct(faValues.filter(v => v).length / faValues.length) : 0;

        // ---- 8. 偏好时间段 ----
        const slotNames = { morning: '上午', afternoon: '下午', evening: '晚间', night: '深夜' };
        profile.preferredTimeSlot = slotNames[
            Object.entries(hourDist).sort((a, b) => b[1] - a[1])[0][0]
        ] || '-';

        profile.lastComputed = new Date().toISOString();
        return profile;
    }

    // ======================== 画像分类 ========================

    function _classifyImpulse(avgSec, changeRate, fastRate) {
        if (avgSec >= 15 && changeRate >= 0.15) return '审慎型';
        if (avgSec < 5 || fastRate >= 0.3) return '冲动型';
        return '均衡型';
    }
    function _classifyComplete(compRate, scroll) {
        if (compRate >= 0.9 && scroll >= 70) return '完整型';
        if (compRate < 0.6 || scroll < 30) return '跳过型';
        return '中间型';
    }
    function _classifyReflective(fbdRate, revisitRate, retryCount) {
        if (fbdRate >= 0.6 && retryCount >= 2) return '深度反思型';
        if (fbdRate < 0.2 && revisitRate < 0.1) return '浅层型';
        return '适度反思型';
    }
    function _classifyIndependent(hintCount, effRate, totalSubs) {
        if (hintCount === 0 && totalSubs > 0) return '独立型';
        if (effRate >= 0.7) return '有效求助型';
        if (hintCount > 5 && effRate < 0.4) return '过度依赖型';
        return '适度求助型';
    }
    function _classifyPersistent(abandRate, mastered, total, retried) {
        if (abandRate <= 0.1 && retried >= 1) return '坚持型';
        if (abandRate >= 0.4) return '易放弃型';
        if (total > 0 && mastered / total >= 0.5) return '高矫正型';
        return '中间型';
    }

    // ======================== 工具函数 ========================

    function _safeStr(val) {
        if (val === undefined || val === null) return '';
        return typeof val === 'string' ? val : JSON.stringify(val);
    }
    function _r1(n) { return Math.round(n * 10) / 10; }
    function _pct(n) { return Math.round(n * 100); }

    function getDefaultProfile() {
        return {
            sessionSummary: {
                totalSessions: 0, avgDurationMin: 0, totalEvents: 0,
                hourDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 }
            },
            impulseCareful: {
                avgResponseTimeSec: 0, answerChangeRate: 0, correctChangeRate: 0,
                fastGuessRate: 0, label: '数据不足'
            },
            completeSkip: {
                quizCompletionRate: 0, avgTaskDurationSec: 0,
                avgMaterialScrollPercent: 0, label: '数据不足'
            },
            reflectiveRepetitive: {
                avgFeedbackDurationSec: 0, feedbackViewRate: 0, taskRevisitRate: 0,
                wrongReviewCount: 0, wrongRetryCount: 0, label: '数据不足'
            },
            independentDependent: {
                hintViewCount: 0, effectiveHelpRate: 0, helpCorrectRate: 0, label: '数据不足'
            },
            persistentGiveup: {
                fallbackTriggerCount: 0, correctionMasteryRate: 0,
                retriedQuizCount: 0, abandonmentRate: 0, label: '数据不足'
            },
            firstAttemptAccuracy: 0,
            preferredTimeSlot: '-',
            lastComputed: null
        };
    }

    // ======================== 初始化 ========================

    function init() {
        if (_initialized) return;
        _loadEvents();
        _ensureSession();

        // 页面关闭 / 切换标签时结束会话并持久化
        window.addEventListener('beforeunload', () => { _endSession(); _saveEvents(); });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { _endSession(); _saveEvents(); }
            else { _ensureSession(); }
        });

        _initialized = true;
    }

    // ======================== 公开 API ========================

    return {
        init,
        // 任务
        trackTaskView, trackTaskLeave, trackMaterialScroll,
        // 小测
        trackQuizStart, trackQuestionView, trackAnswerSelect,
        trackAnswerChange, trackAnswerSubmit, trackFeedbackView, trackQuizFinish,
        // 掌握学习
        trackCorrectionStart, trackCorrectionAnswer, trackCorrectionFinish, trackFallbackTrigger,
        // 单元测试
        trackUnitTestStart, trackUnitTestFinish,
        // 错题
        trackWrongReview,
        // 导航
        trackPageSwitch, trackNavClick,
        // 帮助
        trackHintView,
        // 通用
        startTimer, endTimer,
        // 画像
        computeBehaviorProfile, getDefaultProfile,
        // 数据
        getEvents: () => _events,
        getEventCount: () => _events.length,
        reset: () => { _events = []; localStorage.removeItem(BEHAVIOR_EVENTS_KEY); _sessionId = null; },
        // 测试用
        _ensureSession
    };
})();