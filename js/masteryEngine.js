/**
 * 掌握学习引擎
 * 核心职责：变式题推荐、掌握判定、矫正轮次管理
 */
const MasteryEngine = {
    CONFIG: {
        MASTERY_THRESHOLD: 80,
        MAX_ROUNDS: 3,
        FALLBACK_BLOOM_RANGE: 1,
        MIN_SAMPLE_FOR_MASTERY: 3
    },

    _indexCache: null,

    // ===== 构建全题库索引 =====
    _buildQuestionIndex() {
        if (this._indexCache) return this._indexCache;
        const index = {};
        const allQuestions = this._getAllQuestions();
        allQuestions.forEach(q => {
            const tags = q.knowledgeTags || [];
            const bloom = q.bloom || 'B1';
            tags.forEach(tag => {
                const key = `${tag}__${bloom}`;
                if (!index[key]) index[key] = [];
                index[key].push(q);
            });
        });
        this._indexCache = index;
        return index;
    },

    _getAllQuestions() {
        const questions = [];
        const projects = window.COURSE_DATA?.projects || [];
        projects.forEach(p => {
            p.tasks.forEach(t => {
                if (t.quiz) questions.push(...t.quiz);
            });
        });
        const uts = window.COURSE_DATA?.unitTests || {};
        Object.keys(uts).forEach(pid => {
            if (uts[pid].questions) questions.push(...uts[pid].questions);
        });
        if (typeof EXTENDED_QUESTIONS !== 'undefined') {
            Object.keys(EXTENDED_QUESTIONS).forEach(pid => {
                const ext = EXTENDED_QUESTIONS[pid];
                if (ext.quiz) questions.push(...ext.quiz);
                if (ext.unitTest) questions.push(...ext.unitTest);
            });
        }
        if (typeof VARIANT_QUESTIONS !== 'undefined') {
            Object.keys(VARIANT_QUESTIONS).forEach(pid => {
                VARIANT_QUESTIONS[pid].forEach(v => questions.push(v));
            });
        }
        return questions;
    },

    _makeKey(tag, bloom) {
        return `${tag}__${bloom}`;
    },

    _getUsedVariantIds(questionId) {
        const data = Storage.getData();
        const state = data.masteryState || {};
        const usedIds = new Set();
        Object.values(state).forEach(s => {
            if (s.usedVariantIds) s.usedVariantIds.forEach(id => usedIds.add(id));
        });
        usedIds.add(questionId);
        return usedIds;
    },

    // ===== 三级推荐算法 =====
    recommendVariants(wrongItems) {
        const result = { recommendations: [], unmatched: [] };
        const index = this._buildQuestionIndex();

        wrongItems.forEach(wItem => {
            const qid = wItem.questionId;
            const bloom = wItem.bloom || 'B1';
            const tags = wItem.knowledgeTags || ['综合'];
            const usedIds = this._getUsedVariantIds(qid);
            let found = false;

            // 第1级：精确变式匹配
            if (typeof VARIANT_QUESTIONS !== 'undefined' && VARIANT_QUESTIONS[qid]) {
                const variants = VARIANT_QUESTIONS[qid];
                const available = variants.find(v => !usedIds.has(v.id));
                if (available) {
                    result.recommendations.push({ wrongId: qid, variant: available, matchLevel: 'exact' });
                    found = true;
                }
            }

            // 第2级：知识点+层级匹配
            if (!found) {
                for (const tag of tags) {
                    const poolKey = this._makeKey(tag, bloom);
                    const candidates = index[poolKey] || [];
                    const match = candidates.find(q => !usedIds.has(q.id));
                    if (match) {
                        result.recommendations.push({ wrongId: qid, variant: match, matchLevel: 'knowledge' });
                        found = true;
                        break;
                    }
                }
            }

            // 第3级：降级匹配
            if (!found) {
                const bloomNum = parseInt(bloom[1]);
                for (const tag of tags) {
                    let matched = false;
                    for (const offset of [-1, 1]) {
                        const adj = bloomNum + offset;
                        if (adj >= 1 && adj <= 6) {
                            const adjBloom = 'B' + adj;
                            const poolKey = this._makeKey(tag, adjBloom);
                            const candidates = index[poolKey] || [];
                            const match = candidates.find(q => !usedIds.has(q.id));
                            if (match) {
                                result.recommendations.push({ wrongId: qid, variant: match, matchLevel: 'fallback' });
                                found = true;
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (matched) break;
                }
            }

            if (!found) {
                result.unmatched.push(qid);
            }
        });

        return result;
    },

    getVariantForQuestion(questionId) {
        const wq = Storage.getData().wrongQuestions.find(w => w.questionId === questionId);
        if (!wq) return null;
        const results = this.recommendVariants([wq]);
        return results.recommendations.length > 0 ? results.recommendations[0] : null;
    },

    // ===== 掌握判定 =====
    getMasteryStatus(tag, bloom) {
        const key = this._makeKey(tag, bloom);
        const state = Storage.getData().masteryState || {};
        const ms = state[key];
        if (!ms || ms.totalAttempts === 0) {
            return { totalAttempts: 0, correctCount: 0, accuracy: 0, mastered: false, rounds: [] };
        }
        return { ...ms };
    },

    getUnmasteredTopics() {
        const state = Storage.getData().masteryState || {};
        return Object.entries(state)
            .filter(([key, ms]) => !ms.mastered && ms.totalAttempts > 0)
            .map(([key, ms]) => {
                const [tag, bloom] = key.split('__');
                return { key, tag, bloom, ...ms };
            });
    },

    getMasteryOverview(customData) {
        const data = customData || Storage.getData();
        const state = data.masteryState || {};
        const entries = Object.values(state).filter(ms => ms.totalAttempts > 0);
        const mastered = entries.filter(ms => ms.mastered).length;
        const inProgress = entries.filter(ms => !ms.mastered && ms.rounds.length > 0).length;
        const notStarted = Math.max(0, entries.length - mastered - inProgress);
        const overallRate = entries.length > 0 ? Math.round((mastered / entries.length) * 100) : 0;
        return { total: entries.length, mastered, inProgress, notStarted, overallRate };
    },

    submitCorrectionRound(wrongId, variantId, correct) {
        // 查找原题获取标签
        const wq = Storage.getData().wrongQuestions.find(w => w.questionId === wrongId);
        const tags = wq ? (wq.knowledgeTags || ['综合']) : ['综合'];
        const bloom = wq ? (wq.bloom || 'B1') : 'B1';

        const key = this._makeKey(tags[0], bloom);
        Storage.updateMasteryStatus(key, {
            totalCount: 1,
            correctCount: correct ? 1 : 0,
            questionIds: [variantId],
            variantIds: [variantId]
        });

        Storage.updateWrongQuestionCorrection(wrongId, {
            round: (wq?.correctionHistory?.length || 0) + 1,
            variantId: variantId,
            correct: correct,
            timestamp: new Date().toISOString()
        });

        // 更新认知画像（矫正练习权重0.8）
        if (correct) {
            const cp = Storage.getData().cognitiveProfile;
            cp.bloomTotals[bloom] = (cp.bloomTotals[bloom] || 0) + 1;
            cp.bloomScores[bloom] = (cp.bloomScores[bloom] || 0) + 1;
            tags.forEach(tag => {
                if (!cp.knowledgeScores[tag]) cp.knowledgeScores[tag] = { correct: 0, total: 0 };
                cp.knowledgeScores[tag].total++;
                cp.knowledgeScores[tag].correct++;
            });
        } else {
            const cp = Storage.getData().cognitiveProfile;
            cp.bloomTotals[bloom] = (cp.bloomTotals[bloom] || 0) + 1;
            tags.forEach(tag => {
                if (!cp.knowledgeScores[tag]) cp.knowledgeScores[tag] = { correct: 0, total: 0 };
                cp.knowledgeScores[tag].total++;
            });
        }
        Storage.persist();
    },

    canContinueCorrection(questionId) {
        const wq = Storage.getData().wrongQuestions.find(w => w.questionId === questionId);
        if (!wq) return false;
        if (wq.mastered) return false;
        if ((wq.correctionHistory || []).length >= this.CONFIG.MAX_ROUNDS) return false;
        return true;
    }
};

window.MasteryEngine = MasteryEngine;