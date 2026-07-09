/**
 * 演示模式模块
 * 提供预设的演示数据，绕过解锁机制，可直接浏览所有内容
 * 切换回正常模式后恢复真实学习数据
 */

const DEMO_MODE_KEY = 'embd_demo_mode';

const DemoMode = {
    /** 当前是否处于演示模式 */
    isActive() {
        return localStorage.getItem(DEMO_MODE_KEY) === 'true';
    },

    /** 开启演示模式 */
    activate() {
        localStorage.setItem(DEMO_MODE_KEY, 'true');
        this._demoData = null; // 清缓存，下次访问时重新生成
    },

    /** 关闭演示模式 */
    deactivate() {
        localStorage.setItem(DEMO_MODE_KEY, 'false');
    },

    /** 切换演示模式 */
    toggle() {
        if (this.isActive()) {
            this.deactivate();
            return false;
        } else {
            this.activate();
            return true;
        }
    },

    /**
     * 演示模式下覆盖 Storage 的判断逻辑：
     * - 所有项目视为已解锁
     * - 所有任务视为可访问
     * - 模拟部分学习进度和成绩数据
     */
    // 演示用虚拟数据（不写入真实 Storage）
    _demoData: null,

    getDemoData() {
        if (!this._demoData) {
            this._demoData = this._generateDemoData();
        }
        return this._demoData;
    },

    _generateDemoData() {
        const projects = window.COURSE_DATA?.projects || [];
        const demo = {
            userInfo: { name: '演示学员', className: '会计2001', studentId: 'DEMO001' },
            progress: {},
            quizRecords: {},
            unitTestRecords: {},
            wrongQuestions: [],
            totalLearnTime: 1260,   // 21小时
            lastActiveTime: new Date().toISOString(),
            taskQuizStatus: {},
            taskLearned: {},
            timestamps: {},
            dataVersion: 2,
            cognitiveProfile: {
                bloomScores: { B1: 8, B2: 10, B3: 7, B4: 5, B5: 3, B6: 2 },
                bloomTotals: { B1: 10, B2: 12, B3: 10, B4: 8, B5: 5, B6: 3 },
                soloScores:  { S1: 12, S2: 10, S3: 6, S4: 2 },
                soloTotals:  { S1: 15, S2: 13, S3: 9, S4: 4 },
                knowledgeScores: {
                    'Python基础': { correct: 9, total: 11 },
                    '数据获取': { correct: 7, total: 9 },
                    'Pandas': { correct: 8, total: 10 },
                    '数据清洗': { correct: 7, total: 9 },
                    '数据分析': { correct: 6, total: 9 },
                    '财务指标': { correct: 5, total: 8 },
                    '可视化': { correct: 6, total: 8 },
                    'Matplotlib': { correct: 5, total: 7 },
                    'Pyecharts': { correct: 4, total: 6 },
                    '综合应用': { correct: 4, total: 6 }
                },
                lastUpdated: new Date().toISOString()
            },
            masteryState: {
                masteredTopics: ['Python基础', '数据获取', 'Pandas'],
                correctingTopics: ['数据清洗', '数据分析'],
                unmasteredTopics: ['财务指标', '可视化', 'Matplotlib', 'Pyecharts', '综合应用'],
                topicStats: {
                    'Python基础': { correct: 9, total: 11, accuracy: 82, threshold: 80, status: 'mastered' },
                    '数据获取': { correct: 7, total: 9, accuracy: 78, threshold: 75, status: 'mastered' },
                    'Pandas': { correct: 8, total: 10, accuracy: 80, threshold: 80, status: 'mastered' },
                    '数据清洗': { correct: 7, total: 9, accuracy: 78, threshold: 80, status: 'correcting' },
                    '数据分析': { correct: 6, total: 9, accuracy: 67, threshold: 80, status: 'correcting' },
                    '财务指标': { correct: 5, total: 8, accuracy: 63, threshold: 80, status: 'unmastered' },
                    '可视化': { correct: 6, total: 8, accuracy: 75, threshold: 80, status: 'unmastered' },
                    'Matplotlib': { correct: 5, total: 7, accuracy: 71, threshold: 80, status: 'unmastered' },
                    'Pyecharts': { correct: 4, total: 6, accuracy: 67, threshold: 80, status: 'unmastered' },
                    '综合应用': { correct: 4, total: 6, accuracy: 67, threshold: 80, status: 'unmastered' }
                }
            }
        };

        // 为每个项目和任务生成演示进度
        // 模拟场景：已完成前4个项目，第5个项目进行中
        const completionPattern = [100, 100, 85, 70, 40, 0]; // 各项目完成百分比

        projects.forEach((proj, pIdx) => {
            const completionRate = completionPattern[pIdx] || 0;
            const tasks = proj.tasks;

            tasks.forEach((task, tIdx) => {
                const taskThreshold = (tIdx + 1) / tasks.length * 100;

                if (completionRate >= taskThreshold) {
                    // 标记已学
                    demo.taskLearned[task.id] = true;
                    const daysAgo = Math.floor(Math.random() * 30) + 1;
                    demo.timestamps[task.id] = new Date(Date.now() - daysAgo * 86400000).toISOString();

                    // 有测验的任务：模拟成绩
                    if (task.quiz && task.quiz.length > 0) {
                        const score = Math.floor(Math.random() * 30) + 70; // 70-100分
                        demo.taskQuizStatus[task.id] = true;
                        demo.quizRecords[task.id] = {
                            bestScore: score,
                            lastScore: score,
                            attempts: Math.floor(Math.random() * 2) + 1
                        };

                        // 随机生成1-2道错题
                        if (Math.random() > 0.5) {
                            const wrongQ = task.quiz[Math.floor(Math.random() * task.quiz.length)];
                            if (wrongQ) {
                                const masteryStatus = Math.random() > 0.5 ? 'mastered' : (Math.random() > 0.5 ? 'correcting' : 'unmastered');
                                demo.wrongQuestions.push({
                                    questionId: wrongQ.id,
                                    question: wrongQ.question,
                                    yourAnswer: wrongQ.options ? wrongQ.options[(wrongQ.answer + 1) % wrongQ.options.length] : '错误答案',
                                    correctAnswer: wrongQ.options ? wrongQ.options[wrongQ.answer] : wrongQ.answer,
                                    knowledgePoint: task.title,
                                    taskId: task.id,
                                    timestamp: new Date(Date.now() - daysAgo * 86400000).toISOString(),
                                    mastery: masteryStatus
                                });
                            }
                        }
                    }
                }
            });

            // 项目级：如果完成度>=60%，模拟单元测试通过
            if (completionRate >= 60) {
                const unitTest = COURSE_DATA.unitTests?.[proj.id];
                if (unitTest) {
                    const testScore = completionRate >= 100 ? 
                        Math.floor(Math.random() * 15) + 80 : // 80-95
                        Math.floor(Math.random() * 10) + 68;  // 68-78
                    demo.unitTestRecords[proj.id] = {
                        bestScore: testScore,
                        attempts: [{
                            score: testScore,
                            date: new Date(Date.now() - Math.floor(Math.random() * 20) * 86400000).toISOString(),
                            duration: Math.floor(Math.random() * 600) + 600,
                            correctCount: Math.round(unitTest.questions.length * testScore / 100),
                            totalCount: unitTest.questions.length
                        }],
                        records: []
                    };
                    demo.progress[proj.id] = {
                        completed: testScore >= 60,
                        completedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 86400000).toISOString()
                    };
                }
            }
        });

        return demo;
    },

    /**
     * 演示模式下获取统计数据
     */
    getDemoStats() {
        const demo = this.getDemoData();
        const projects = window.COURSE_DATA?.projects || [];
        let totalTasks = 0, learnedTasks = 0, quizTotal = 0, quizDone = 0;
        let testTotal = 0, testPassed = 0, totalBestScore = 0, testCount = 0;

        projects.forEach(p => {
            p.tasks.forEach(t => {
                totalTasks++;
                if (demo.taskLearned[t.id]) learnedTasks++;
                if (t.quiz && t.quiz.length > 0) {
                    quizTotal++;
                    if (demo.taskQuizStatus[t.id]) quizDone++;
                }
            });
            testTotal++;
            const tr = demo.unitTestRecords[p.id];
            if (tr && tr.bestScore >= 60) testPassed++;
            if (tr) { totalBestScore += tr.bestScore; testCount++; }
        });

        return {
            totalTasks, learnedTasks, quizTotal, quizDone,
            testTotal, testPassed,
            avgScore: testCount > 0 ? Math.round(totalBestScore / testCount) : 0,
            overallProgress: totalTasks > 0 ? Math.round((learnedTasks / totalTasks) * 100) : 0,
            learnTime: demo.totalLearnTime,
            wrongCount: demo.wrongQuestions.length
        };
    },

    /**
     * 获取演示模式下的项目进度
     */
    getDemoProjectProgress(projectId) {
        const demo = this.getDemoData();
        const projects = window.COURSE_DATA?.projects || [];
        const project = projects.find(p => p.id === projectId);
        if (!project) return { learned: 0, total: 0, quizDone: 0, percent: 0 };

        const total = project.tasks.length;
        let learned = 0, quizDone = 0;
        project.tasks.forEach(t => {
            if (demo.taskLearned[t.id]) learned++;
            if (demo.taskQuizStatus[t.id]) quizDone++;
        });
        const percent = total > 0 ? Math.round(((learned + quizDone) / (total * 2)) * 100) : 0;
        return { learned, total, quizDone, percent };
    }
};

window.DemoMode = DemoMode;
