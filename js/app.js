/**
 * 主应用逻辑
 */

(function() {
    'use strict';

    // ===== 状态 =====
    let currentPage = 'dashboard';
    let currentTask = null;
    let currentQuiz = null;
    let currentExam = null;
    let examTimer = null;
    let examStartTime = null;
    let examAnswers = {};

    // ===== DOM 引用 =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ===== 初始化 =====
    function init() {
        mergeExtendedQuestions();
        bindEvents();
        checkAuth();
        checkSharedReport();
        // 初始化行为追踪（Winne & Hadwin SRL 四阶段 + Zimmerman 三阶段循环）
        if (typeof BehaviorTracker !== 'undefined') BehaviorTracker.init();
    }

    // 合并扩展题库到课程数据，并为旧题补充标签
    function mergeExtendedQuestions() {
        if (typeof EXTENDED_QUESTIONS === 'undefined') return;
        Object.keys(EXTENDED_QUESTIONS).forEach(pid => {
            const ext = EXTENDED_QUESTIONS[pid];
            const project = COURSE_DATA.projects.find(p => p.id === pid);
            if (!project) return;
            // 合并小测
            ext.quiz.forEach(q => {
                const taskId = q.id.split('-').slice(0, 2).join('-');
                const task = project.tasks.find(t => t.id === taskId);
                if (task) {
                    if (!task.quiz) task.quiz = [];
                    task.quiz.push(q);
                }
            });
            // 合并单元测试
            ext.unitTest.forEach(q => {
                const ut = COURSE_DATA.unitTests[pid];
                if (ut && ut.questions) {
                    ut.questions.push(q);
                }
            });
        });

        // 为所有旧题补充 bloom/solo/knowledgeTags 标签
        const tagMap = {
            p1: ['Python基础', '环境搭建'],
            p2: ['数据获取', '爬虫', 'Excel'],
            p3: ['Pandas', '数据清洗', '预处理'],
            p4: ['数据分析', '财务指标', '统计'],
            p5: ['可视化', 'Matplotlib', 'Pyecharts'],
            p6: ['综合应用', '报告撰写', '数据看板']
        };
        COURSE_DATA.projects.forEach(p => {
            const defaultTags = tagMap[p.id] || ['综合'];
            p.tasks.forEach(t => {
                if (t.quiz) {
                    t.quiz.forEach(q => {
                        if (!q.bloom || !q.solo) {
                            const inferred = Storage.inferQuestionTags(q);
                            q.bloom = q.bloom || inferred.bloom;
                            q.solo = q.solo || inferred.solo;
                            q.knowledgeTags = q.knowledgeTags || (inferred.knowledgeTags.length > 0 ? inferred.knowledgeTags : [defaultTags[0]]);
                        }
                    });
                }
            });
            const ut = COURSE_DATA.unitTests[p.id];
            if (ut && ut.questions) {
                ut.questions.forEach(q => {
                    if (!q.bloom || !q.solo) {
                        const inferred = Storage.inferQuestionTags(q);
                        q.bloom = q.bloom || inferred.bloom;
                        q.solo = q.solo || inferred.solo;
                        q.knowledgeTags = q.knowledgeTags || (inferred.knowledgeTags.length > 0 ? inferred.knowledgeTags : [defaultTags[0]]);
                    }
                });
            }
        });
    }

    // 检查是否为分享链接访问
    function checkSharedReport() {
        if (typeof ShareLink !== 'undefined') {
            const shared = ShareLink.parseFromURL();
            if (shared) {
                // 显示只读分享报告（在登录页之后覆盖）
                setTimeout(() => {
                    const authPage = $('#auth-page');
                    if (authPage && !authPage.classList.contains('hidden')) {
                        authPage.innerHTML = `
                            <div style="max-width:800px;margin:40px auto;padding:32px;background:white;border-radius:16px;box-shadow:var(--shadow-lg)">
                                <div id="shared-report-container"></div>
                                <div style="text-align:center;margin-top:24px">
                                    <button class="btn-primary" onclick="location.href=location.pathname">进入学习平台</button>
                                </div>
                            </div>
                        `;
                        ShareLink.renderSharedReport(shared, 'shared-report-container');
                    }
                }, 100);
            }
        }
    }

    function checkAuth() {
        const data = Storage.getData();
        if (data.userInfo.name || DemoMode.isActive()) {
            showMainPage();
        } else {
            showAuthPage();
        }
    }

    // ===== 页面切换 =====
    function showAuthPage() {
        $('#auth-page').classList.remove('hidden');
        $('#main-page').classList.add('hidden');
    }

    function showMainPage() {
        const isDemo = DemoMode.isActive();
        const data = isDemo ? DemoMode.getDemoData() : Storage.getData();
        $('#auth-page').classList.add('hidden');
        $('#main-page').classList.remove('hidden');
        $('#header-user-name').textContent = `${data.userInfo.name} (${data.userInfo.studentId})`;

        // 演示模式横幅
        if (isDemo) {
            $('#demo-banner').classList.remove('hidden');
            document.body.classList.add('demo-active');
        } else {
            $('#demo-banner').classList.add('hidden');
            document.body.classList.remove('demo-active');
        }

        renderDashboard();
    }

    function switchPage(page) {
        if (typeof BehaviorTracker !== 'undefined' && currentPage) {
            BehaviorTracker.trackPageSwitch(currentPage, page);
        }
        currentPage = page;
        $$('.main-page').forEach(el => el.classList.add('hidden'));
        $(`#page-${page}`).classList.remove('hidden');
        $$('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.page === page));

        if (page === 'dashboard') renderDashboard();
        if (page === 'learning') renderLearningPage();
        if (page === 'assessment') renderAssessmentPage();
        if (page === 'data-center') renderDataCenterPage();
        if (page === 'settings') renderSettingsPage();
    }

    // ===== 事件绑定 =====
    function bindEvents() {
        // 登录表单
        $('#auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = $('#user-name').value.trim();
            const cls = $('#user-class').value.trim();
            const id = $('#user-id').value.trim();
            if (!name || !cls || !id) return toast('请填写完整信息');
            Storage.initUser(name, cls, id);
            showMainPage();
            toast('登录成功，开始学习！');
        });

        // 导航
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage(link.dataset.page);
            });
        });

        // 退出
        $('#logout-btn').addEventListener('click', () => {
            if (DemoMode.isActive()) {
                DemoMode.deactivate();
            }
            if (confirm('确定要退出吗？')) {
                showAuthPage();
            }
        });

        // 演示模式按钮（登录页）
        $('#demo-mode-btn')?.addEventListener('click', () => {
            DemoMode.activate();
            showMainPage();
            toast('已进入演示模式');
        });

        // 退出演示模式（横幅按钮）
        $('#exit-demo-btn')?.addEventListener('click', () => {
            DemoMode.deactivate();
            const data = Storage.getData();
            if (data.userInfo.name) {
                showMainPage();
                toast('已退出演示模式，恢复真实学习数据');
            } else {
                showAuthPage();
                toast('已退出演示模式');
            }
        });

        // 弹窗关闭
        $$('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', closeAllModals);
        });

        // 设置页
        $('#export-json-btn')?.addEventListener('click', () => {
            Storage.exportToJSON();
            toast('JSON 导出成功');
        });
        $('#export-excel-btn')?.addEventListener('click', () => {
            Storage.exportToExcel();
            toast('Excel 导出成功');
        });
        $('#import-btn')?.addEventListener('click', () => $('#import-file').click());
        $('#import-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = Storage.importFromJSON(ev.target.result);
                toast(result.message);
                if (result.success) {
                    renderDashboard();
                    renderSettingsPage();
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });
        $('#reset-btn')?.addEventListener('click', () => {
            if (confirm('确定要重置所有学习进度吗？此操作不可恢复！')) {
                Storage.resetAll();
                toast('学习进度已重置');
                renderDashboard();
            }
        });
    }

    function closeAllModals() {
        $$('.modal').forEach(m => m.classList.add('hidden'));
        if (examTimer) { clearInterval(examTimer); examTimer = null; }
    }

    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 2500);
    }

    // ===== 项目总览页 =====
    function renderDashboard() {
        const isDemo = DemoMode.isActive();
        const stats = isDemo ? DemoMode.getDemoStats() : Storage.getStats();
        $('#overall-progress').textContent = stats.overallProgress + '%';
        $('#completed-projects').textContent = `${stats.testPassed}/${stats.testTotal}`;
        $('#total-score').textContent = stats.avgScore;
        $('#learn-time').textContent = (stats.learnTime / 60).toFixed(1) + 'h';

        const grid = $('#projects-grid');
        grid.innerHTML = '';

        COURSE_DATA.projects.forEach((proj, idx) => {
            const unlocked = isDemo || Storage.isProjectUnlocked(proj.id);
            const progress = isDemo ? DemoMode.getDemoProjectProgress(proj.id) : Storage.getProjectProgress(proj.id);
            const demoData = isDemo ? DemoMode.getDemoData() : null;
            const testRecord = isDemo ? (demoData.unitTestRecords[proj.id] || null) : (Storage.getData().unitTestRecords[proj.id] || null);
            const bestScore = testRecord ? testRecord.bestScore : null;
            const completed = bestScore !== null && bestScore >= 60;

            const card = document.createElement('div');
            card.className = `project-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}`;

            const tagsHtml = proj.tags.map(t => {
                const map = { key: '重点', difficulty: '难点', core: '核心' };
                const cls = { key: 'key', difficulty: 'diff', core: 'core' };
                return `<span class="project-tag ${cls[t] || ''}">${map[t] || t}</span>`;
            }).join('');

            card.innerHTML = `
                <div class="project-header">
                    <div class="project-num">${idx + 1}</div>
                    <div class="project-title">${proj.title}</div>
                </div>
                <div class="project-desc">${proj.desc}</div>
                <div class="project-meta">${proj.tasks.length} 个任务</div>
                <div class="project-tags">${tagsHtml}</div>
                <div class="project-progress">
                    <div class="project-progress-bar"><div class="project-progress-fill" style="width:${progress.percent}%"></div></div>
                    <div class="project-progress-text">进度 ${progress.percent}%</div>
                </div>
                ${bestScore !== null ? `<div class="project-score">单元测试最高分：<strong>${bestScore}分</strong></div>` : ''}
                ${!unlocked ? '<div style="margin-top:8px;font-size:12px;color:#999">🔒 完成上一项目单元测试（≥60分）后解锁</div>' : ''}
            `;

            if (unlocked) {
                card.addEventListener('click', () => {
                    switchPage('learning');
                    expandProjectAndScrollToTask(proj.id);
                });
            }

            grid.appendChild(card);
        });
    }

    // ===== 课程学习页 =====
    function renderLearningPage() {
        renderSidebar();
        const isDemo = DemoMode.isActive();
        // 默认加载第一个可访问任务
        if (!currentTask) {
            for (const p of COURSE_DATA.projects) {
                if (isDemo || Storage.isProjectUnlocked(p.id)) {
                    for (const t of p.tasks) {
                        if (isDemo || Storage.isTaskAccessible(t.id)) {
                            loadTask(t.id);
                            return;
                        }
                    }
                }
            }
        } else {
            loadTask(currentTask);
        }
    }

    function renderSidebar() {
        const toc = $('#course-toc');
        toc.innerHTML = '';
        const isDemo = DemoMode.isActive();
        const data = isDemo ? DemoMode.getDemoData() : Storage.getData();

        COURSE_DATA.projects.forEach(proj => {
            const unlocked = isDemo || Storage.isProjectUnlocked(proj.id);
            const projEl = document.createElement('div');
            projEl.className = 'toc-project';

            const header = document.createElement('div');
            header.className = 'toc-project-header';
            header.innerHTML = `<span class="toc-arrow">▶</span><span>${proj.title}</span>`;
            header.addEventListener('click', () => {
                header.classList.toggle('expanded');
                taskList.classList.toggle('expanded');
            });

            const taskList = document.createElement('div');
            taskList.className = 'toc-tasks expanded';

            proj.tasks.forEach(task => {
                const taskEl = document.createElement('div');
                const accessible = unlocked; // 演示模式下全部可访问
                const learned = data.taskLearned[task.id];
                const quizDone = data.taskQuizStatus[task.id];
                taskEl.className = `toc-task ${currentTask === task.id ? 'active' : ''} ${learned ? 'done' : ''}`;
                taskEl.innerHTML = `
                    <span class="task-status"></span>
                    <span>${task.title}</span>
                    ${!accessible ? '<span class="task-lock">🔒</span>' : ''}
                    ${quizDone ? '<span style="margin-left:auto;font-size:11px;color:var(--success)">✓</span>' : ''}
                `;
                if (accessible) {
                    taskEl.addEventListener('click', () => loadTask(task.id));
                }
                taskList.appendChild(taskEl);
            });

            projEl.appendChild(header);
            projEl.appendChild(taskList);
            toc.appendChild(projEl);
        });
    }

    function expandProjectAndScrollToTask(projectId) {
        // 找到对应项目并展开
        const project = COURSE_DATA.projects.find(p => p.id === projectId);
        if (!project || !project.tasks.length) return;
        const firstTask = project.tasks[0];
        loadTask(firstTask.id);
        renderSidebar();
    }

    function loadTask(taskId) {
        currentTask = taskId;
        const isDemo = DemoMode.isActive();
        const data = isDemo ? DemoMode.getDemoData() : Storage.getData();

        // 查找任务
        let task = null, project = null;
        for (const p of COURSE_DATA.projects) {
            const t = p.tasks.find(x => x.id === taskId);
            if (t) { task = t; project = p; break; }
        }
        if (!task) return;

        currentProjectId = project.id;

        // 检查是否可访问（演示模式下全部可访问）
        if (!isDemo && !Storage.isTaskAccessible(taskId)) {
            toast('该任务尚未解锁');
            return;
        }

        // 更新侧边栏激活状态
        $$('.toc-task').forEach(el => el.classList.toggle('active', el.textContent.includes(task.title)));

        // 渲染内容
        const main = $('#learning-main');
        const tagsHtml = task.tags.map(t => {
            const map = { key: '■ 重点', difficulty: '▲ 难点', core: '★ 核心考核点' };
            return `<span class="tag tag-${t}">${map[t] || t}</span>`;
        }).join('');

        main.innerHTML = `
            <div class="content-header">
                <h2>${task.title} ${tagsHtml}</h2>
                <div class="content-breadcrumb">${project.title} / ${task.title}</div>
            </div>
            <div class="content-body">${renderContent(task.content)}</div>
            <div class="task-quiz-section">
                <h4>知识点小测</h4>
                <p style="font-size:13px;color:var(--gray-500);margin-bottom:12px">完成小测以检验知识点掌握情况</p>
                <button class="btn-primary" id="start-quiz-btn">开始小测 (${task.quiz?.length || 0}题)</button>
                ${data.taskQuizStatus[taskId] ? '<span style="margin-left:12px;color:var(--success);font-size:13px">✓ 已完成</span>' : ''}
            </div>
            <div class="content-nav">
                <button class="btn-secondary" id="prev-task-btn">← 上一节</button>
                <button class="btn-secondary" id="next-task-btn">下一节 →</button>
            </div>
        `;

        // 代码复制按钮绑定
        $$('.code-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.closest('.code-block-wrapper').querySelector('pre').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    btn.textContent = '已复制';
                    btn.classList.add('copied');
                    setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 1500);
                });
            });
        });

        // 开始小测
        $('#start-quiz-btn').addEventListener('click', () => openQuiz(task));

        // 上下节导航
        $('#prev-task-btn').addEventListener('click', () => navigateTask(-1));
        $('#next-task-btn').addEventListener('click', () => navigateTask(1));

        // 记录学习（演示模式下不写入真实 Storage）
        if (!isDemo) {
            Storage.markTaskLearned(taskId);
        }

        // 行为埋点：任务查看 + 滚动深度
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackTaskView(taskId, project.id);
            const mainEl = $('#learning-main');
            if (mainEl) {
                mainEl.addEventListener('scroll', function _scrollHandler() {
                    const el = this;
                    if (el.scrollHeight <= el.clientHeight) return;
                    const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
                    BehaviorTracker.trackMaterialScroll(taskId, pct);
                }, { passive: true });
            }
        }

        renderSidebar();
    }

    let currentProjectId = null;

    function renderContent(html) {
        // 1. 将代码块包装为可复制区域（必须在占位符替换之前执行，
        //    这样 CODE_DATA 替换后的代码块也能被正确包装）
        html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
            const lang = 'python';
            return `<div class="code-block-wrapper">
                <div class="code-header">
                    <span class="code-lang">${lang}</span>
                    <button class="code-copy-btn">复制</button>
                </div>
                <pre><code>${code}</code></pre>
            </div>`;
        });

        // 2. 注入情境故事
        if (currentProjectId && typeof ContentEnhancer !== 'undefined') {
            html = ContentEnhancer.injectStory(html, currentProjectId);
        }

        // 3. 渲染数据表格占位符
        if (typeof ContentEnhancer !== 'undefined') {
            html = ContentEnhancer.renderDataTables(html);
        }

        // 4. 嵌入代码数据占位符
        if (typeof ContentEnhancer !== 'undefined') {
            html = ContentEnhancer.injectCodeData(html, currentTask);
        }

        return html;
    }

    function navigateTask(dir) {
        const isDemo = DemoMode.isActive();
        const allTasks = [];
        COURSE_DATA.projects.forEach(p => {
            p.tasks.forEach(t => {
                if (isDemo || Storage.isTaskAccessible(t.id)) allTasks.push(t.id);
            });
        });
        const idx = allTasks.indexOf(currentTask);
        const newIdx = idx + dir;
        if (newIdx >= 0 && newIdx < allTasks.length) {
            loadTask(allTasks[newIdx]);
        }
    }

    // ===== 知识点小测 =====
    function openQuiz(task) {
        if (!task.quiz || task.quiz.length === 0) {
            toast('该任务暂无小测');
            return;
        }
        currentQuiz = { task, index: 0, score: 0, answers: [], wrong: [] };

        // 行为埋点：小测开始
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackQuizStart(task.id, currentProjectId, task.quiz.length);
        }

        $('#quiz-modal-title').textContent = `${task.title} - 知识点小测`;
        $('#quiz-modal').classList.remove('hidden');
        renderQuizQuestion();
    }

    function renderQuizQuestion() {
        const { task, index } = currentQuiz;
        const q = task.quiz[index];
        currentQuiz._lastAnswer = undefined; // 重置答案变更追踪

        // 行为埋点：题目查看（开始计时）
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackQuestionView(task.id, q.id, index, q.type, q.bloom, q.solo, q.knowledgeTags);
        }
        const body = $('#quiz-modal-body');
        const footer = $('#quiz-modal-footer');

        let optionsHtml = '';
        let inputArea = '';

        if (q.type === 'single' || q.type === 'judge') {
            optionsHtml = `<div class="quiz-options">${q.options.map((opt, i) => `
                <label class="quiz-option" data-idx="${i}">
                    <input type="radio" name="quiz-opt" value="${i}">
                    <span>${opt}</span>
                </label>
            `).join('')}</div>`;
        } else if (q.type === 'multi') {
            optionsHtml = `<div class="quiz-options">${q.options.map((opt, i) => `
                <label class="quiz-option" data-idx="${i}">
                    <input type="checkbox" name="quiz-opt" value="${i}">
                    <span>${opt}</span>
                </label>
            `).join('')}</div>`;
        } else if (q.type === 'case') {
            optionsHtml = `
                <div class="case-text">${q.caseText}</div>
                <div class="quiz-options">${q.options.map((opt, i) => `
                    <label class="quiz-option" data-idx="${i}">
                        <input type="checkbox" name="quiz-opt" value="${i}">
                        <span>${opt}</span>
                    </label>
                `).join('')}</div>
            `;
        } else if (q.type === 'code') {
            inputArea = `
                <div class="code-question-area">
                    <div class="starter-code"><pre><code>${q.starterCode}</code></pre></div>
                    <textarea class="exam-textarea" id="quiz-code-input" placeholder="请在此编写代码..."></textarea>
                    <div class="test-cases">
                        <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px">评分检查点：</p>
                        ${q.testCases.map(tc => `<div class="test-case-item">${tc.desc}</div>`).join('')}
                    </div>
                </div>
            `;
        } else if (q.type === 'design') {
            inputArea = `
                <div class="design-question-area">
                    <textarea class="exam-textarea" id="quiz-design-input" placeholder="请在此输入你的设计方案..."></textarea>
                    <div class="design-criteria">
                        <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px">评分标准（自评参考）：</p>
                        ${q.criteria.map(c => `<div class="criteria-item">${c.item}（${c.weight}%）</div>`).join('')}
                    </div>
                </div>
            `;
        }

        // 认知标签
        const tagHtml = (q.bloom || q.solo) ? `
            <div class="question-tags">
                ${q.bloom ? `<span class="q-tag bloom">${q.bloom}</span>` : ''}
                ${q.solo ? `<span class="q-tag solo">${q.solo}</span>` : ''}
            </div>
        ` : '';

        body.innerHTML = `
            <div class="quiz-question">
                <div class="quiz-question-text">${index + 1}. ${q.question}</div>
                ${tagHtml}
                ${optionsHtml}
                ${inputArea}
                <div id="quiz-result-area"></div>
            </div>
        `;

        footer.innerHTML = `
            <span style="font-size:13px;color:var(--gray-400)">${index + 1} / ${task.quiz.length}</span>
            <button class="btn-primary" id="quiz-submit-btn">提交答案</button>
        `;

        // 单选/判断选项点击
        if (q.type === 'single' || q.type === 'judge') {
            $$('.quiz-option').forEach(el => {
                el.addEventListener('click', () => {
                    // 行为埋点：答案变更检测
                    if (typeof BehaviorTracker !== 'undefined' && currentQuiz._lastAnswer !== undefined) {
                        const newIdx = parseInt(el.dataset.idx);
                        if (currentQuiz._lastAnswer !== newIdx) {
                            BehaviorTracker.trackAnswerChange(task.id, q.id, currentQuiz._lastAnswer, newIdx);
                        }
                    }
                    currentQuiz._lastAnswer = parseInt(el.dataset.idx);
                    $$('.quiz-option').forEach(o => o.classList.remove('selected'));
                    el.classList.add('selected');
                    el.querySelector('input').checked = true;
                    if (typeof BehaviorTracker !== 'undefined') {
                        BehaviorTracker.trackAnswerSelect(task.id, q.id, el.dataset.idx);
                    }
                });
            });
        }
        // 多选/案例选项点击（复选框可多选）
        else if (q.type === 'multi' || q.type === 'case') {
            $$('.quiz-option').forEach(el => {
                el.addEventListener('click', (e) => {
                    if (e.target.tagName === 'INPUT') return;
                    const cb = el.querySelector('input');
                    cb.checked = !cb.checked;
                    el.classList.toggle('selected', cb.checked);
                });
            });
        }

        $('#quiz-submit-btn').addEventListener('click', () => submitQuizAnswer(q));
    }

    function submitQuizAnswer(q) {
        let answer = null;
        let correct = false;
        let yourAnswerText = '';
        let correctAnswerText = '';

        if (q.type === 'single' || q.type === 'judge') {
            const selected = document.querySelector('input[name="quiz-opt"]:checked');
            if (!selected) { toast('请选择答案'); return; }
            answer = parseInt(selected.value);
            correct = answer === q.answer;
            yourAnswerText = q.options[answer];
            correctAnswerText = q.options[q.answer];
        } else if (q.type === 'multi' || q.type === 'case') {
            const checked = Array.from(document.querySelectorAll('input[name="quiz-opt"]:checked'));
            if (checked.length === 0) { toast('请至少选择一项'); return; }
            answer = checked.map(cb => parseInt(cb.value)).sort((a, b) => a - b);
            const expected = Array.isArray(q.answer) ? [...q.answer].sort((a, b) => a - b) : [q.answer];
            correct = JSON.stringify(answer) === JSON.stringify(expected);
            yourAnswerText = answer.map(i => q.options[i]).join(', ');
            correctAnswerText = expected.map(i => q.options[i]).join(', ');
        } else if (q.type === 'code') {
            const input = $('#quiz-code-input');
            answer = input ? input.value.trim() : '';
            if (!answer) { toast('请填写代码'); return; }
            // 关键字匹配评分
            let passed = 0;
            q.testCases.forEach(tc => {
                if (answer.includes(tc.check)) passed++;
            });
            correct = passed >= Math.ceil(q.testCases.length * 0.6); // 60%检查点通过即算对
            yourAnswerText = answer.substring(0, 100) + (answer.length > 100 ? '...' : '');
            correctAnswerText = '参考代码见解析';
        } else if (q.type === 'design') {
            const input = $('#quiz-design-input');
            answer = input ? input.value.trim() : '';
            if (!answer) { toast('请填写设计方案'); return; }
            correct = answer.length >= 50; // 字数达标即算通过
            yourAnswerText = answer.substring(0, 100) + (answer.length > 100 ? '...' : '');
            correctAnswerText = q.modelAnswer ? q.modelAnswer.substring(0, 100) + '...' : '参考方案见解析';
        }

        const resultArea = $('#quiz-result-area');

        // 显示对错样式（选择题）
        if (q.options) {
            $$('.quiz-option').forEach((el, i) => {
                el.classList.remove('selected');
                el.style.pointerEvents = 'none';
                const isCorrectOption = Array.isArray(q.answer) ? q.answer.includes(i) : i === q.answer;
                if (isCorrectOption) el.classList.add('correct');
                else {
                    const isSelected = Array.isArray(answer) ? answer.includes(i) : i === answer;
                    if (isSelected && !isCorrectOption) el.classList.add('wrong');
                }
            });
        }

        resultArea.innerHTML = `
            <div class="quiz-result ${correct ? 'correct' : 'wrong'}">
                <div class="quiz-result-title">${correct ? '回答正确！' : '回答错误'}</div>
                <div>${q.explain || ''}</div>
                ${q.modelAnswer ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--gray-300)"><strong>参考解答：</strong>${q.modelAnswer}</div>` : ''}
            </div>
        `;

        currentQuiz.answers.push({ questionId: q.id, correct, yourAnswer: answer });
        if (correct) currentQuiz.score++;
        else currentQuiz.wrong.push({ questionId: q.id, question: q.question, yourAnswer: yourAnswerText, correctAnswer: correctAnswerText, knowledgePoint: currentQuiz.task.title });

        // 行为埋点：答案提交
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackAnswerSubmit(currentQuiz.task.id, q.id, answer, correct);
        }

        // 更新按钮
        const footer = $('#quiz-modal-footer');
        const isLast = currentQuiz.index >= currentQuiz.task.quiz.length - 1;
        footer.innerHTML = `
            <span style="font-size:13px;color:var(--gray-400)">${currentQuiz.index + 1} / ${currentQuiz.task.quiz.length}</span>
            <button class="btn-primary" id="quiz-next-btn">${isLast ? '完成小测' : '下一题'}</button>
        `;
        $('#quiz-next-btn').addEventListener('click', () => {
            // 行为埋点：反馈查看时长
            if (typeof BehaviorTracker !== 'undefined') {
                BehaviorTracker.trackFeedbackView(currentQuiz.task.id, q.id);
            }
            if (isLast) finishQuiz();
            else { currentQuiz.index++; renderQuizQuestion(); }
        });
    }

    function finishQuiz() {
        const { task, score, answers, wrong } = currentQuiz;
        const total = task.quiz.length;
        const isDemo = DemoMode.isActive();
        const percentage = isDemo ? Math.round((score / total) * 100) : Storage.recordQuiz(task.id, score, total, answers, wrong);

        // 行为埋点：小测完成
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackQuizFinish(task.id, score, total, wrong.length);
        }

        const hasCorrectableWrong = wrong.length > 0 && !isDemo && typeof MasteryEngine !== 'undefined';

        $('#quiz-modal-body').innerHTML = `
            <div style="text-align:center;padding:20px">
                <div style="font-size:48px;margin-bottom:12px">${percentage >= 60 ? '🎉' : '📝'}</div>
                <h3 style="margin-bottom:8px">小测完成</h3>
                <p style="font-size:24px;font-weight:700;color:${percentage >= 60 ? 'var(--success)' : 'var(--warning)'}">${percentage}分</p>
                <p style="color:var(--gray-500)">答对 ${score} / ${total} 题</p>
                ${percentage < 60 ? '<p style="color:var(--danger);margin-top:8px">建议重新学习本任务内容</p>' : ''}
                ${hasCorrectableWrong ? `
                    <div class="correction-prompt">
                        <div style="font-weight:600;color:#92400e;margin-bottom:6px">错题矫正练习 (${wrong.length}题待矫正)</div>
                        <p style="font-size:13px;color:var(--gray-600)">系统将推荐同知识点同认知层级的平行变式题，帮助您达到掌握标准(80%正确率)</p>
                    </div>
                ` : ''}
            </div>
        `;
        $('#quiz-modal-footer').innerHTML = `
            <button class="btn-secondary" id="quiz-retry-btn">重新答题</button>
            ${hasCorrectableWrong ? '<button class="btn-warning" id="quiz-correct-btn">开始矫正练习</button>' : ''}
            <button class="btn-primary" id="quiz-close-btn">确定</button>
        `;

        $('#quiz-retry-btn').addEventListener('click', () => openQuiz(task));
        $('#quiz-correct-btn')?.addEventListener('click', () => startMasteryCorrection(task, wrong));
        $('#quiz-close-btn').addEventListener('click', () => {
            closeAllModals();
            loadTask(task.id);
        });

        renderSidebar();
    }

    // ===== 掌握度矫正练习 =====
    let currentMasterySession = null;

    function startMasteryCorrection(task, wrongItems, round) {
        if (typeof MasteryEngine === 'undefined') { toast('掌握学习引擎未加载'); return; }

        // 过滤掉需要回退学习的题目
        const correctable = wrongItems.filter(w =>
            !MasteryEngine.needsFallbackLearning(w.questionId));
        if (correctable.length === 0) {
            toast('所有错题已触发回退学习，请先返回学习材料重新学习');
            return;
        }

        const recommendations = MasteryEngine.recommendVariants(correctable);
        if (recommendations.recommendations.length === 0) {
            toast('暂无可用的变式题，请稍后再试');
            return;
        }

        const currentRound = round || 1;
        currentMasterySession = {
            task, originalWrong: wrongItems,
            recommendations: recommendations.recommendations,
            unmatched: recommendations.unmatched,
            currentRound,
            index: 0, score: 0, answers: []
        };

        // 行为埋点：矫正开始
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackCorrectionStart(task.id, correctable.length, currentRound);
        }

        const title = $('#quiz-modal-title');
        if (title) title.textContent = `掌握度矫正练习 (第${currentRound}轮)`;
        renderMasteryQuestion();
    }

    function renderMasteryQuestion() {
        const session = currentMasterySession;
        if (!session || session.index >= session.recommendations.length) {
            finishMasteryRound();
            return;
        }
        const rec = session.recommendations[session.index];
        const q = rec.variant;
        const body = $('#quiz-modal-body');
        const footer = $('#quiz-modal-footer');

        const matchLabels = { exact: '精确变式', knowledge: '同知识点同层级', fallback: '同知识点近似层级' };
        const tagHtml = (q.bloom || q.solo) ? `
            <div class="question-tags">
                ${q.bloom ? `<span class="q-tag bloom">${q.bloom}</span>` : ''}
                ${q.solo ? `<span class="q-tag solo">${q.solo}</span>` : ''}
                ${(q.knowledgeTags || []).map(t => `<span class="q-tag knowledge">${t}</span>`).join('')}
            </div>
            <div class="variant-source-info">匹配方式: ${matchLabels[rec.matchLevel]} · 矫正第${session.currentRound}轮</div>
        ` : '';

        let optionsHtml = '';
        if (q.type === 'single' || q.type === 'judge') {
            optionsHtml = `<div class="quiz-options">${q.options.map((opt, i) => `
                <label class="quiz-option" data-idx="${i}">
                    <input type="radio" name="mastery-opt" value="${i}">
                    <span>${opt}</span>
                </label>
            `).join('')}</div>`;
        } else if (q.type === 'multi' || q.type === 'case') {
            optionsHtml = `
                ${q.caseText ? `<div class="case-text">${q.caseText}</div>` : ''}
                <div class="quiz-options">${q.options.map((opt, i) => `
                    <label class="quiz-option" data-idx="${i}">
                        <input type="checkbox" name="mastery-opt" value="${i}">
                        <span>${opt}</span>
                    </label>
                `).join('')}</div>`;
        }

        body.innerHTML = `
            <div class="quiz-question mastery-mode">
                <div class="mastery-header">
                    <span class="mastery-badge">矫正练习</span>
                    <span class="mastery-progress">${session.index + 1} / ${session.recommendations.length}</span>
                </div>
                <div class="quiz-question-text">${session.index + 1}. ${q.question}</div>
                ${tagHtml}
                ${optionsHtml}
                <div id="quiz-result-area"></div>
            </div>
        `;

        footer.innerHTML = `
            <span style="font-size:13px;color:var(--gray-400)">矫正 ${session.index + 1} / ${session.recommendations.length}</span>
            <button class="btn-primary" id="mastery-submit-btn">提交答案</button>
        `;

        $$('.quiz-option').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                const input = el.querySelector('input');
                if (input.type === 'radio') {
                    $$('.quiz-option').forEach(o => o.classList.remove('selected'));
                    input.checked = true;
                    el.classList.add('selected');
                } else {
                    input.checked = !input.checked;
                    el.classList.toggle('selected', input.checked);
                }
            });
        });

        $('#mastery-submit-btn').addEventListener('click', () => submitMasteryAnswer(q, rec));
    }

    function submitMasteryAnswer(q, rec) {
        let answer = null, correct = false, yourText = '', correctText = '';

        if (q.type === 'single' || q.type === 'judge') {
            const sel = document.querySelector('input[name="mastery-opt"]:checked');
            if (!sel) { toast('请选择答案'); return; }
            answer = parseInt(sel.value);
            correct = answer === q.answer;
            yourText = q.options[answer];
            correctText = q.options[q.answer];
        } else if (q.type === 'multi' || q.type === 'case') {
            const checked = Array.from(document.querySelectorAll('input[name="mastery-opt"]:checked'));
            if (checked.length === 0) { toast('请至少选择一项'); return; }
            answer = checked.map(cb => parseInt(cb.value)).sort((a, b) => a - b);
            const expected = Array.isArray(q.answer) ? [...q.answer].sort((a, b) => a - b) : [q.answer];
            correct = JSON.stringify(answer) === JSON.stringify(expected);
            yourText = answer.map(i => q.options[i]).join(', ');
            correctText = expected.map(i => q.options[i]).join(', ');
        }

        // 显示对错
        if (q.options) {
            $$('.quiz-option').forEach((el, i) => {
                el.style.pointerEvents = 'none';
                const isCorrectOpt = Array.isArray(q.answer) ? q.answer.includes(i) : i === q.answer;
                if (isCorrectOpt) el.classList.add('correct');
                else {
                    const isSelected = Array.isArray(answer) ? answer.includes(i) : i === answer;
                    if (isSelected && !isCorrectOpt) el.classList.add('wrong');
                }
            });
        }

        const resultArea = $('#quiz-result-area');
        resultArea.innerHTML = `
            <div class="quiz-result ${correct ? 'correct' : 'wrong'}">
                <div class="quiz-result-title">${correct ? '回答正确！' : '回答错误'}</div>
                <div>${q.explain || ''}</div>
            </div>
        `;

        // 记录结果并提交到引擎
        MasteryEngine.submitCorrectionRound(rec.wrongId, q.id, correct);
        if (correct) currentMasterySession.score++;
        currentMasterySession.answers.push({ variantId: q.id, wrongId: rec.wrongId, correct, bloom: q.bloom, knowledgeTags: q.knowledgeTags });

        // 行为埋点：矫正答题
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackCorrectionAnswer(
                currentMasterySession.task.id, q.id, correct,
                !!rec.variant.variantOf, currentMasterySession.currentRound);
        }

        const isLast = currentMasterySession.index >= currentMasterySession.recommendations.length - 1;
        const footer = $('#quiz-modal-footer');
        footer.innerHTML = `
            <span style="font-size:13px;color:var(--gray-400)">${currentMasterySession.index + 1} / ${currentMasterySession.recommendations.length}</span>
            <button class="btn-primary" id="mastery-next-btn">${isLast ? '查看掌握报告' : '下一题'}</button>
        `;

        $('#mastery-next-btn').addEventListener('click', () => {
            if (isLast) finishMasteryRound();
            else { currentMasterySession.index++; renderMasteryQuestion(); }
        });
    }

    function finishMasteryRound() {
        const session = currentMasterySession;
        if (!session) return;

        // 汇总掌握状态
        const topicMap = new Map();
        session.answers.forEach(a => {
            const tag = (a.knowledgeTags || ['综合'])[0];
            const bloom = a.bloom || 'B1';
            const key = MasteryEngine._makeKey(tag, bloom);
            if (!topicMap.has(key)) topicMap.set(key, { tag, bloom, correct: 0, total: 0 });
            const entry = topicMap.get(key);
            entry.total++;
            if (a.correct) entry.correct++;
        });

        const topicResults = [];
        topicMap.forEach((v, k) => {
            const status = MasteryEngine.getMasteryStatus(v.tag, v.bloom);
            topicResults.push({ key: k, ...v, ...status });
        });

        const allMastered = topicResults.every(t => t.mastered);
        const hasFallback = topicResults.some(t => t.needsFallback);
        const totalQ = session.recommendations.length;
        const correctQ = session.score;

        // 行为埋点：矫正轮次完成
        if (typeof BehaviorTracker !== 'undefined') {
            const anyTrack = topicResults.find(t => t.masteryTrack);
            const anyFallback = topicResults.find(t => t.needsFallback);
            BehaviorTracker.trackCorrectionFinish(
                session.task.id, session.currentRound, allMastered,
                anyTrack?.masteryTrack || null,
                !!hasFallback, anyFallback?.fallbackReason || null);
            // 回退学习事件
            topicResults.filter(t => t.needsFallback).forEach(t => {
                BehaviorTracker.trackFallbackTrigger(session.task.id, t.tag, t.bloom, t.fallbackReason);
            });
        }

        // 判定轨道说明
        const trackLabels = {
            A: '累计正确率达标',
            B: '连续2题正确'
        };

        $('#quiz-modal-body').innerHTML = `
            <div class="mastery-report">
                <div class="mastery-report-header">
                    <div style="font-size:36px">${allMastered ? '🎯' : (hasFallback ? '🔄' : '📈')}</div>
                    <h3>${allMastered ? '全部掌握！' : (hasFallback ? '需要回退学习' : '矫正练习完成')}</h3>
                    <p>第${session.currentRound}轮 · 答对 ${correctQ} / ${totalQ}</p>
                </div>

                ${hasFallback ? `
                    <div class="mastery-fallback-alert">
                        <div class="mastery-fallback-title">⚠️ 回退学习建议</div>
                        <div class="mastery-fallback-desc">
                            部分知识点经过多轮矫正仍未掌握，继续做平行题效果有限。
                            建议返回学习材料，用不同方式重新学习后再来测试。
                        </div>
                        <div class="mastery-fallback-theory">
                            理论依据：Bloom掌握学习要求矫正活动必须与初次教学"qualitatively different"（Guskey, 2007）
                        </div>
                    </div>
                ` : ''}

                <div class="mastery-topic-list">
                    ${topicResults.map(t => {
                        const threshold = t.totalAttempts >= 5 ? 80 : 67;
                        const trackInfo = t.mastered ? `<span class="mastery-track-badge track-${t.masteryTrack}">${trackLabels[t.masteryTrack]}</span>` : '';
                        const fallbackInfo = t.needsFallback ? `<div class="mastery-fallback-reason">${t.fallbackReason}</div>` : '';
                        const consecInfo = t.consecutiveCorrect > 0
                            ? `<span class="mastery-consec-badge">连续${t.consecutiveCorrect}对</span>`
                            : (t.consecutiveWrong > 0 ? `<span class="mastery-consec-badge wrong">连续${t.consecutiveWrong}错</span>` : '');
                        return `
                        <div class="mastery-topic-item ${t.mastered ? 'mastered' : (t.needsFallback ? 'fallback' : 'unmastered')}">
                            <div class="mastery-topic-info">
                                <span class="mastery-topic-tag">${t.tag}</span>
                                <span class="q-tag bloom">${t.bloom}</span>
                                ${consecInfo}
                            </div>
                            <div class="mastery-topic-status">
                                <span class="mastery-accuracy">${t.accuracy}%</span>
                                ${trackInfo}
                                <span class="mastery-label ${t.mastered ? '' : (t.needsFallback ? 'fallback' : 'style="background:var(--warning);color:white"')}">${t.mastered ? '已掌握' : (t.needsFallback ? '需回退' : '未掌握')}</span>
                            </div>
                            <div class="mastery-progress-bar">
                                <div class="mastery-progress-fill" style="width:${t.accuracy}%;background:${t.mastered ? 'var(--success)' : (t.needsFallback ? 'var(--danger)' : 'var(--warning)')}"></div>
                                <div class="mastery-threshold-line" style="left:${threshold}%"></div>
                                <div class="mastery-threshold-label">${threshold}%</div>
                            </div>
                            ${fallbackInfo}
                        </div>
                        `;
                    }).join('')}
                </div>

                ${!allMastered && !hasFallback ? `
                    <div class="mastery-continue-hint">
                        💡 未全部掌握，可继续矫正练习（剩余轮次：${MasteryEngine.CONFIG.MAX_ROUNDS - session.currentRound}）
                    </div>
                ` : ''}
            </div>
        `;

        // 按钮区
        const footer = $('#quiz-modal-footer');
        if (hasFallback) {
            footer.innerHTML = `
                <button class="btn-secondary" id="mastery-done-btn">关闭</button>
                <button class="btn-primary" id="mastery-fallback-btn">返回学习材料</button>
            `;
            $('#mastery-fallback-btn').addEventListener('click', () => {
                const task = session.task;
                currentMasterySession = null;
                closeAllModals();
                if (task && task.id) {
                    loadTask(task.id);
                } else {
                    renderProjectPage();
                }
            });
        } else if (!allMastered && session.currentRound < MasteryEngine.CONFIG.MAX_ROUNDS) {
            footer.innerHTML = `
                <button class="btn-secondary" id="mastery-done-btn">稍后再练</button>
                <button class="btn-primary" id="mastery-continue-btn">继续矫正</button>
            `;
            $('#mastery-continue-btn').addEventListener('click', () => {
                // 检查哪些题目还能继续矫正
                const continueable = session.originalWrong.filter(w =>
                    MasteryEngine.canContinueCorrection(w.questionId));
                if (continueable.length === 0) {
                    toast('所有题目已达到矫正上限');
                    return;
                }
                const nextRound = session.currentRound + 1;
                currentMasterySession = null;
                startMasteryCorrection(session.task, continueable, nextRound);
            });
        } else {
            footer.innerHTML = `
                <button class="btn-primary" id="mastery-done-btn">完成</button>
            `;
        }

        $('#mastery-done-btn')?.addEventListener('click', () => {
            const task = session.task;
            currentMasterySession = null;
            closeAllModals();
            if (task && task.id) {
                loadTask(task.id);
            } else {
                renderProjectPage();
            }
        });

        // 恢复弹窗标题
        const title = $('#quiz-modal-title');
        if (title) title.textContent = '小测';
    }

    // ===== 测评考核页 =====
    function renderAssessmentPage() {
        const isDemo = DemoMode.isActive();
        const data = isDemo ? DemoMode.getDemoData() : Storage.getData();

        // 知识点小测列表
        const quizList = $('#quiz-list');
        quizList.innerHTML = '';
        COURSE_DATA.projects.forEach(proj => {
            if (!isDemo && !Storage.isProjectUnlocked(proj.id)) return;
            proj.tasks.forEach(task => {
                if (!task.quiz || task.quiz.length === 0) return;
                const record = data.quizRecords[task.id];
                const item = document.createElement('div');
                item.className = 'assessment-item';
                item.innerHTML = `
                    <div class="assessment-item-info">
                        <h4>${task.title}</h4>
                        <p>${proj.title} · ${task.quiz.length} 题</p>
                    </div>
                    <div class="assessment-item-score ${record ? '' : 'empty'}">${record ? record.bestScore + '分' : '未开始'}</div>
                `;
                item.addEventListener('click', () => {
                    switchPage('learning');
                    loadTask(task.id);
                });
                quizList.appendChild(item);
            });
        });

        // 单元测试列表
        const testList = $('#unit-test-list');
        testList.innerHTML = '';
        COURSE_DATA.projects.forEach(proj => {
            const test = COURSE_DATA.unitTests[proj.id];
            if (!test) return;
            const unlocked = isDemo || Storage.isProjectUnlocked(proj.id);
            const record = data.unitTestRecords[proj.id];
            const item = document.createElement('div');
            item.className = 'assessment-item';
            item.innerHTML = `
                <div class="assessment-item-info">
                    <h4>${test.title}</h4>
                    <p>${test.duration}分钟 · ${test.questions.length}题 · ${unlocked ? '已解锁' : '未解锁'}</p>
                </div>
                <div class="assessment-item-score ${record ? '' : 'empty'}">${record ? record.bestScore + '分' : (unlocked ? '开始考试' : '🔒')}</div>
            `;
            if (unlocked) {
                item.addEventListener('click', () => startUnitTest(proj.id));
            }
            testList.appendChild(item);
        });
    }

    // ===== 单元综合测试 =====
    function startUnitTest(projectId) {
        const test = COURSE_DATA.unitTests[projectId];
        if (!test) return;

        currentExam = { projectId, test, index: 0, score: 0, answers: {}, wrong: [] };
        examAnswers = {};
        examStartTime = Date.now();

        // 行为埋点：单元测试开始
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackUnitTestStart(projectId, test.questions.length);
        }

        $('#exam-modal-title').textContent = test.title;
        $('#exam-timer').textContent = `剩余时间: ${test.duration}:00`;
        $('#exam-timer').classList.remove('urgent');
        $('#exam-modal').classList.remove('hidden');

        // 启动计时器
        let remaining = test.duration * 60;
        examTimer = setInterval(() => {
            remaining--;
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            $('#exam-timer').textContent = `剩余时间: ${m}:${s.toString().padStart(2, '0')}`;
            if (remaining <= 120) $('#exam-timer').classList.add('urgent');
            if (remaining <= 0) {
                clearInterval(examTimer);
                submitExam();
            }
        }, 1000);

        renderExamQuestion();
    }

    function renderExamQuestion() {
        const { test, index } = currentExam;
        const q = test.questions[index];
        const body = $('#exam-modal-body');
        const footer = $('#exam-modal-footer');

        const typeMap = { single: '单选题', judge: '判断题', codefill: '代码填空', multi: '多选题', case: '案例分析', code: '代码实现', design: '设计题' };

        let content = '';
        if (q.type === 'single' || q.type === 'judge') {
            content = `<div class="exam-options">${q.options.map((opt, i) => `
                <label class="exam-option ${(examAnswers[q.id] === i) ? 'selected' : ''}" data-qid="${q.id}" data-idx="${i}">
                    <input type="radio" name="exam-${q.id}" value="${i}" ${(examAnswers[q.id] === i) ? 'checked' : ''}>
                    <span>${String.fromCharCode(65 + i)}. ${opt}</span>
                </label>
            `).join('')}</div>`;
        } else if (q.type === 'multi' || q.type === 'case') {
            const saved = Array.isArray(examAnswers[q.id]) ? examAnswers[q.id] : [];
            content = `
                ${q.caseText ? `<div class="case-text">${q.caseText}</div>` : ''}
                <div class="exam-options">${q.options.map((opt, i) => `
                    <label class="exam-option ${saved.includes(i) ? 'selected' : ''}" data-qid="${q.id}" data-idx="${i}">
                        <input type="checkbox" name="exam-${q.id}" value="${i}" ${saved.includes(i) ? 'checked' : ''}>
                        <span>${String.fromCharCode(65 + i)}. ${opt}</span>
                    </label>
                `).join('')}</div>
            `;
        } else if (q.type === 'codefill') {
            content = `<div style="margin-top:12px">
                <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px">请按顺序填写空格答案，用逗号分隔：</p>
                <input type="text" class="form-group input" id="exam-fill-${q.id}" placeholder="答案1, 答案2..." value="${examAnswers[q.id] || ''}" style="width:100%;padding:10px;border:1px solid var(--gray-300);border-radius:var(--radius)">
            </div>`;
        } else if (q.type === 'code') {
            content = `
                <div class="code-question-area">
                    <div class="starter-code"><pre><code>${q.starterCode}</code></pre></div>
                    <textarea class="exam-textarea" id="exam-code-${q.id}" placeholder="请在此编写代码...">${examAnswers[q.id] || ''}</textarea>
                    <div class="test-cases">
                        <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px">评分检查点：</p>
                        ${q.testCases.map(tc => `<div class="test-case-item">${tc.desc}</div>`).join('')}
                    </div>
                </div>
            `;
        } else if (q.type === 'design') {
            content = `
                <div class="design-question-area">
                    <textarea class="exam-textarea" id="exam-design-${q.id}" placeholder="请在此输入你的设计方案...">${examAnswers[q.id] || ''}</textarea>
                    <div class="design-criteria">
                        <p style="font-size:13px;color:var(--gray-500);margin-bottom:8px">评分标准（自评参考）：</p>
                        ${q.criteria.map(c => `<div class="criteria-item">${c.item}（${c.weight}%）</div>`).join('')}
                    </div>
                </div>
            `;
        }

        // 认知标签
        const tagHtml = (q.bloom || q.solo) ? `
            <div class="question-tags">
                ${q.bloom ? `<span class="q-tag bloom">${q.bloom}</span>` : ''}
                ${q.solo ? `<span class="q-tag solo">${q.solo}</span>` : ''}
            </div>
        ` : '';

        body.innerHTML = `
            <div class="exam-question">
                <div class="exam-q-header">
                    <div class="exam-q-num">${index + 1}</div>
                    <span class="exam-q-type">${typeMap[q.type] || q.type}</span>
                </div>
                <div class="exam-question-text">${q.question}</div>
                ${tagHtml}
                ${content}
            </div>
        `;

        // 单选/判断选项点击
        if (q.type === 'single' || q.type === 'judge') {
            $$('.exam-option').forEach(el => {
                el.addEventListener('click', () => {
                    const qid = el.dataset.qid;
                    const idx = parseInt(el.dataset.idx);
                    examAnswers[qid] = idx;
                    $$('.exam-option[data-qid="' + qid + '"]').forEach(o => o.classList.remove('selected'));
                    el.classList.add('selected');
                    el.querySelector('input').checked = true;
                });
            });
        }
        // 多选/案例选项点击
        else if (q.type === 'multi' || q.type === 'case') {
            $$('.exam-option').forEach(el => {
                el.addEventListener('click', (e) => {
                    if (e.target.tagName === 'INPUT') return;
                    const qid = el.dataset.qid;
                    const idx = parseInt(el.dataset.idx);
                    const cb = el.querySelector('input');
                    cb.checked = !cb.checked;
                    el.classList.toggle('selected', cb.checked);
                    let current = Array.isArray(examAnswers[qid]) ? examAnswers[qid] : [];
                    if (cb.checked) {
                        if (!current.includes(idx)) current = [...current, idx];
                    } else {
                        current = current.filter(i => i !== idx);
                    }
                    examAnswers[qid] = current.sort((a, b) => a - b);
                });
            });
        }

        // 填空输入
        const fillInput = $(`#exam-fill-${q.id}`);
        if (fillInput) {
            fillInput.addEventListener('input', (e) => {
                examAnswers[q.id] = e.target.value;
            });
        }

        // 代码输入
        const codeInput = $(`#exam-code-${q.id}`);
        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                examAnswers[q.id] = e.target.value;
            });
        }

        // 设计输入
        const designInput = $(`#exam-design-${q.id}`);
        if (designInput) {
            designInput.addEventListener('input', (e) => {
                examAnswers[q.id] = e.target.value;
            });
        }

        const isLast = index >= test.questions.length - 1;
        footer.innerHTML = `
            <div style="display:flex;gap:8px">
                ${index > 0 ? '<button class="btn-secondary" id="exam-prev-btn">上一题</button>' : ''}
            </div>
            <div style="display:flex;gap:8px;align-items:center">
                <span style="font-size:13px;color:var(--gray-400)">${index + 1} / ${test.questions.length}</span>
                <button class="btn-primary" id="exam-next-btn">${isLast ? '提交试卷' : '下一题'}</button>
            </div>
        `;

        $('#exam-prev-btn')?.addEventListener('click', () => { currentExam.index--; renderExamQuestion(); });
        $('#exam-next-btn').addEventListener('click', () => {
            if (isLast) submitExam();
            else { currentExam.index++; renderExamQuestion(); }
        });
    }

    function submitExam() {
        if (examTimer) { clearInterval(examTimer); examTimer = null; }

        const { projectId, test } = currentExam;
        let score = 0;
        const wrong = [];
        const answerList = [];

        test.questions.forEach(q => {
            const userAns = examAnswers[q.id];
            let isCorrect = false;
            let yourAnswerText = '';
            let correctAnswerText = '';

            if (q.type === 'single' || q.type === 'judge') {
                isCorrect = userAns === q.answer;
                yourAnswerText = userAns !== undefined ? q.options[userAns] : '未作答';
                correctAnswerText = q.options[q.answer];
            } else if (q.type === 'multi' || q.type === 'case') {
                const userArr = Array.isArray(userAns) ? [...userAns].sort((a, b) => a - b) : [];
                const expected = Array.isArray(q.answer) ? [...q.answer].sort((a, b) => a - b) : [q.answer];
                isCorrect = JSON.stringify(userArr) === JSON.stringify(expected);
                yourAnswerText = userArr.length > 0 ? userArr.map(i => q.options[i]).join(', ') : '未作答';
                correctAnswerText = expected.map(i => q.options[i]).join(', ');
            } else if (q.type === 'codefill') {
                const cleanUser = String(userAns || '').replace(/\s/g, '').toLowerCase();
                const cleanAns = String(q.answer || '').replace(/\s/g, '').toLowerCase();
                isCorrect = cleanUser === cleanAns;
                yourAnswerText = userAns || '未作答';
                correctAnswerText = q.answer;
            } else if (q.type === 'code') {
                const code = String(userAns || '');
                let passed = 0;
                q.testCases.forEach(tc => {
                    if (code.includes(tc.check)) passed++;
                });
                isCorrect = passed >= Math.ceil(q.testCases.length * 0.6);
                yourAnswerText = code.substring(0, 100) + (code.length > 100 ? '...' : '') || '未作答';
                correctAnswerText = '参考代码见解析';
            } else if (q.type === 'design') {
                const design = String(userAns || '');
                isCorrect = design.length >= 50;
                yourAnswerText = design.substring(0, 100) + (design.length > 100 ? '...' : '') || '未作答';
                correctAnswerText = q.modelAnswer ? q.modelAnswer.substring(0, 100) + '...' : '参考方案见解析';
            }

            answerList.push({ questionId: q.id, correct: isCorrect, yourAnswer: userAns });
            if (isCorrect) score++;
            else {
                wrong.push({
                    questionId: q.id,
                    question: q.question,
                    yourAnswer: yourAnswerText,
                    correctAnswer: correctAnswerText,
                    knowledgePoint: test.title
                });
            }
        });

        const duration = Math.round((Date.now() - examStartTime) / 1000);
        const isDemo = DemoMode.isActive();
        const percentage = isDemo ? Math.round((score / test.questions.length) * 100) : Storage.recordUnitTest(projectId, score, test.questions.length, answerList, wrong, duration);

        // 行为埋点：单元测试完成
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.trackUnitTestFinish(projectId, score, test.questions.length, duration * 1000);
        }

        // 显示结果
        const passed = percentage >= 60;
        $('#exam-modal-body').innerHTML = `
            <div class="exam-results">
                <div class="exam-score-circle ${passed ? 'pass' : 'fail'}">${percentage}</div>
                <h3>${passed ? '恭喜通过！' : '未通过'}</h3>
                <p style="color:var(--gray-500);margin-top:8px">答对 ${score} / ${test.questions.length} 题 · 用时 ${Math.floor(duration/60)}分${duration%60}秒</p>
                ${!passed ? '<p style="color:var(--danger);margin-top:12px">需要达到 60 分才能解锁下一项目</p>' : ''}
            </div>
        `;
        $('#exam-modal-footer').innerHTML = `
            <button class="btn-secondary" id="exam-review-btn">查看解析</button>
            <button class="btn-primary" id="exam-close-btn">确定</button>
        `;

        $('#exam-review-btn').addEventListener('click', () => showExamReview(test, answerList));
        $('#exam-close-btn').addEventListener('click', () => {
            closeAllModals();
            renderAssessmentPage();
            renderDashboard();
        });
    }

    function showExamReview(test, answerList) {
        let html = '';
        test.questions.forEach((q, i) => {
            const ans = answerList.find(a => a.questionId === q.id);
            const isCorrect = ans?.correct;
            html += `
                <div class="exam-question" style="border-left:4px solid ${isCorrect ? 'var(--success)' : 'var(--danger)'};padding-left:16px">
                    <div class="exam-q-header">
                        <div class="exam-q-num">${i+1}</div>
                        <span style="color:${isCorrect ? 'var(--success)' : 'var(--danger)'};font-weight:600">${isCorrect ? '正确' : '错误'}</span>
                    </div>
                    <div class="exam-question-text">${q.question}</div>
                    <p style="font-size:13px;color:var(--gray-500)">你的答案：${ans?.yourAnswer !== undefined ? (q.options ? q.options[ans.yourAnswer] : ans.yourAnswer) : '未作答'}</p>
                    <p style="font-size:13px;color:var(--success)">正确答案：${q.options ? q.options[q.answer] : q.answer}</p>
                </div>
            `;
        });
        $('#exam-modal-body').innerHTML = html;
        $('#exam-modal-footer').innerHTML = `<button class="btn-primary" id="exam-close-btn2">确定</button>`;
        $('#exam-close-btn2').addEventListener('click', () => {
            closeAllModals();
            renderAssessmentPage();
            renderDashboard();
        });
    }

    // ===== 学习数据中心 =====
    function renderDataCenterPage() {
        const isDemo = DemoMode.isActive();
        const data = isDemo ? DemoMode.getDemoData() : Storage.getData();
        const stats = isDemo ? DemoMode.getDemoStats() : Storage.getStats();

        // 学习进度
        const progressDetail = $('#progress-detail');
        let progressHtml = '';
        COURSE_DATA.projects.forEach(p => {
            const prog = isDemo ? DemoMode.getDemoProjectProgress(p.id) : Storage.getProjectProgress(p.id);
            const test = data.unitTestRecords[p.id];
            progressHtml += `
                <div class="progress-detail-item">
                    <span>${p.title}</span>
                    <span style="color:var(--gray-500)">任务 ${prog.learned}/${prog.total} · 小测 ${prog.quizDone}/${prog.total} · 单元测 ${test ? test.bestScore + '分' : '未考'}</span>
                </div>
            `;
        });
        progressDetail.innerHTML = progressHtml;

        // 成绩统计
        const scoreStats = $('#score-stats');
        let scoreHtml = '<table class="score-table"><tr><th>测评项目</th><th>最高分</th><th>次数</th></tr>';
        COURSE_DATA.projects.forEach(p => {
            p.tasks.forEach(t => {
                const r = data.quizRecords[t.id];
                if (r) {
                    scoreHtml += `<tr><td>${t.title}</td><td>${r.bestScore}</td><td>${r.attempts}</td></tr>`;
                }
            });
        });
        COURSE_DATA.projects.forEach(p => {
            const r = data.unitTestRecords[p.id];
            if (r) {
                scoreHtml += `<tr><td><strong>${COURSE_DATA.unitTests[p.id]?.title || p.title}</strong></td><td><strong>${r.bestScore}</strong></td><td><strong>${r.attempts.length}</strong></td></tr>`;
            }
        });
        scoreHtml += '</table>';
        scoreStats.innerHTML = scoreHtml;

        // 错题回顾（增强：掌握状态+矫正入口）
        const wrongContainer = $('#wrong-questions');
        if (data.wrongQuestions.length === 0) {
            wrongContainer.innerHTML = '<div class="empty-state"><div class="empty-state-title">暂无错题</div><div class="empty-state-desc">继续保持！</div></div>';
        } else {
            // 行为埋点：查看错题列表
            if (typeof BehaviorTracker !== 'undefined') {
                data.wrongQuestions.slice(0, 20).forEach(w => {
                    BehaviorTracker.trackWrongReview(w.questionId, 'view');
                });
            }
            wrongContainer.innerHTML = data.wrongQuestions.slice(0, 20).map((w, i) => {
                // 演示模式下 MasteryEngine 读取的是 Storage.getData()（空数据），
                // 所以直接从当前 data 上下文检查 masteryState
                const tags = w.knowledgeTags || ['综合'];
                const bloom = w.bloom || 'B1';
                const msKey = typeof MasteryEngine !== 'undefined' ? MasteryEngine._makeKey(tags[0], bloom) : (tags[0] + '__' + bloom);
                const msState = (data.masteryState || {})[msKey];
                const needsFallback = !!(msState && msState.needsFallback);
                const canCorrect = !w.mastered && !needsFallback && typeof MasteryEngine !== 'undefined'
                    && (w.correctionHistory || []).length < MasteryEngine.CONFIG.MAX_ROUNDS;
                const badge = w.mastered
                    ? '<span class="mastery-badge-small mastered">已掌握</span>'
                    : needsFallback
                        ? '<span class="mastery-badge-small unmastered">需回退学习</span>'
                        : (w.correctionHistory?.length > 0
                            ? '<span class="mastery-badge-small correcting">矫正中</span>'
                            : '<span class="mastery-badge-small unmastered">待矫正</span>');
                return `
                <div class="wrong-q-item ${w.mastered ? 'mastered' : ''} ${needsFallback ? 'fallback' : ''}">
                    <div class="wrong-q-title">
                        <span>${i+1}. ${w.question}</span>
                        ${badge}
                    </div>
                    <div class="wrong-q-answer">
                        <span class="wrong">你的答案：${w.yourAnswer}</span> ·
                        <span class="correct">正确答案：${w.correctAnswer}</span>
                    </div>
                    <div class="wrong-q-meta">
                        ${w.bloom ? `<span class="q-tag bloom">${w.bloom}</span>` : ''}
                        ${(w.knowledgeTags || []).slice(0, 2).map(t => `<span class="q-tag knowledge">${t}</span>`).join('')}
                        ${w.correctionHistory?.length > 0 ? `<span style="font-size:12px;color:var(--gray-400);margin-left:4px">已矫正${w.correctionHistory.length}轮</span>` : ''}
                        ${canCorrect ? '<button class="btn-sm btn-warning wrong-correct-btn" style="margin-left:auto">矫正练习</button>' : ''}
                        ${needsFallback ? '<button class="btn-sm btn-secondary wrong-learn-btn" style="margin-left:auto">回退学习</button>' : ''}
                    </div>
                </div>
                `;
            }).join('');

            // 绑定单题矫正按钮
            wrongContainer.querySelectorAll('.wrong-correct-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const item = e.target.closest('.wrong-q-item');
                    const idx = Array.from(wrongContainer.children).indexOf(item);
                    const wq = data.wrongQuestions[idx];
                    if (!wq) return;
                    // 行为埋点：错题重做
                    if (typeof BehaviorTracker !== 'undefined') {
                        BehaviorTracker.trackWrongReview(wq.questionId, 'retry');
                    }
                    const rec = MasteryEngine.getVariantForQuestion(wq.questionId);
                    if (!rec) { toast('该题暂无可用变式题'); return; }
                    currentMasterySession = {
                        task: COURSE_DATA.projects.flatMap(p => p.tasks).find(t => t.id === wq.taskId) || { id: '', quiz: [], title: '' },
                        originalWrong: [wq],
                        recommendations: [rec],
                        unmatched: [],
                        currentRound: 1, index: 0, score: 0, answers: []
                    };
                    openModal('quiz-modal');
                    const title = $('#quiz-modal-title');
                    if (title) title.textContent = '单题矫正练习';
                    renderMasteryQuestion();
                });
            });

            // 绑定回退学习按钮
            wrongContainer.querySelectorAll('.wrong-learn-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const item = e.target.closest('.wrong-q-item');
                    const idx = Array.from(wrongContainer.children).indexOf(item);
                    const wq = data.wrongQuestions[idx];
                    if (!wq) return;
                    const reason = MasteryEngine.getFallbackReason(wq.questionId);
                    // 行为埋点：回退学习
                    if (typeof BehaviorTracker !== 'undefined') {
                        BehaviorTracker.trackFallbackTrigger(wq.taskId, (wq.knowledgeTags || ['综合'])[0], wq.bloom || 'B1', reason);
                    }
                    const task = COURSE_DATA.projects.flatMap(p => p.tasks).find(t => t.id === wq.taskId);
                    if (task) {
                        toast(reason || '建议回退到学习材料重新学习');
                        loadTask(task.id);
                    } else {
                        toast('请返回对应项目的学习材料重新学习');
                    }
                });
            });
        }

        // 学习效果分析（专业报告区）
        const analysis = $('#learning-analysis');
        const hasData = stats.testCount > 0 || data.cognitiveProfile.lastUpdated;

        if (!hasData) {
            analysis.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-title">暂无分析数据</div>
                    <div class="empty-state-desc">完成小测和单元测试后，将生成多维度学习效果诊断报告</div>
                </div>
            `;
            return;
        }

        analysis.innerHTML = `
            <div id="report-container">
                <div class="report-header">
                    <div class="report-title">学习效果诊断报告</div>
                    <div class="report-meta">
                        ${data.userInfo.name || '学员'} · ${data.userInfo.className || '-'} · 生成于 ${new Date().toLocaleDateString('zh-CN')}
                    </div>
                </div>
                <div class="share-btn-group">
                    <button class="btn-sm btn-secondary" onclick="ReportExportImage.exportReport()">导出图片</button>
                    <button class="btn-sm btn-secondary" onclick="ReportExportPDF.exportReport()">导出PDF</button>
                    <button class="btn-sm btn-secondary" onclick="ShareLink.copyToClipboard()">复制分享链接</button>
                    <button class="btn-sm btn-primary" onclick="Certificate.show()">学习证书</button>
                </div>
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <h4>布鲁姆认知层次雷达</h4>
                        <div class="chart-container" id="chart-bloom-radar"></div>
                    </div>
                    <div class="analysis-card">
                        <h4>SOLO学习层次分布</h4>
                        <div class="chart-container" id="chart-solo-distribution"></div>
                    </div>
                    <div class="analysis-card full-width">
                        <h4>知识掌握热力图</h4>
                        <div class="chart-container" id="chart-knowledge-heatmap"></div>
                    </div>
                    <div class="analysis-card full-width">
                        <h4>学习趋势</h4>
                        <div class="chart-container" id="chart-learning-trend"></div>
                    </div>
                    <div class="analysis-card full-width">
                        <h4>能力诊断报告</h4>
                        <div id="chart-diagnosis-report"></div>
                    </div>
                </div>
            </div>
        `;

        // 渲染各分析图表（延迟确保DOM已插入）
        const demoCp = isDemo ? data.cognitiveProfile : null;
        setTimeout(() => {
            if (typeof BloomRadar !== 'undefined') BloomRadar.render('chart-bloom-radar', demoCp);
            if (typeof SoloDistribution !== 'undefined') SoloDistribution.render('chart-solo-distribution', demoCp);
            if (typeof KnowledgeHeatmap !== 'undefined') KnowledgeHeatmap.render('chart-knowledge-heatmap', demoCp);
            if (typeof LearningTrend !== 'undefined') LearningTrend.render('chart-learning-trend', isDemo ? data : null);
            if (typeof DiagnosisReport !== 'undefined') DiagnosisReport.render('chart-diagnosis-report', demoCp);
        }, 100);
    }

    // ===== 系统设置 =====
    function renderSettingsPage() {
        const data = Storage.getData();
        $('#settings-name').value = data.userInfo.name;
        $('#settings-class').value = data.userInfo.className;
        $('#settings-id').value = data.userInfo.studentId;
    }

    // 暴露给诊断报告等外部模块使用
    window.loadTask = loadTask;

    // 启动
    document.addEventListener('DOMContentLoaded', init);
})();
