# 掌握学习(Mastery Learning)错题矫正闭环 — 实施计划

## 摘要

基于布鲁姆掌握学习理论，实现"答错 → 平行变式题推荐 → 矫正练习 → 掌握判定(80%) → 认知画像更新"的完整闭环。以 (knowledgeTag + bloom) 为最小判定单元，通过三级匹配策略（精确变式 → 同知识点同层级 → 降级匹配）推荐平行题，最多3轮矫正。

## 当前状态分析

- 平台有约103道题（data.js 86题 + questionBankExtended.js 17题），无平行变式题
- 错题记录(`wrongQuestions`)为扁平数组，无矫正历史
- 测验流程为顺序单次：逐题 → 提交 → 评分 → 结束，无二次练习
- 认知画像已有Bloom/SOLO/知识点三维聚合，但与错题矫正未联动
- 题目已有双维度标签（原生或通过`inferQuestionTags()`推断）

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `js/variantBank.js` | 新建 | 平行变式题库，按原题ID索引，约70-85道变式题 |
| `js/masteryEngine.js` | 新建 | 推荐引擎：三级匹配、掌握判定、矫正轮次管理 |
| `js/storage.js` | 修改 | dataVersion=3、masteryState字段、V2→V3迁移、mastery操作函数、错题结构扩展 |
| `js/app.js` | 修改 | 提取共用渲染/判题函数、finishQuiz增加矫正入口、矫正练习流程、数据中心掌握度可视化 |
| `js/demoMode.js` | 修改 | 演示数据增加masteryState和矫正历史 |
| `css/style.css` | 修改 | 掌握度概览、矫正模式、掌握报告、错题状态标签等样式 |
| `index.html` | 修改 | 引入variantBank.js和masteryEngine.js、新增掌握度DOM容器 |

---

## 阶段1：数据层改造（storage.js）

### 1.1 扩展 getDefaultData()
- `dataVersion: 3`
- 新增 `masteryState: {}`，键格式为 `"{knowledgeTag}__{bloom}"`，值含 `totalAttempts/correctCount/accuracy/mastered/rounds/usedVariantIds/sourceWrongIds`

### 1.2 扩展 wrongQuestions 结构
每条错题新增：`bloom`、`solo`、`knowledgeTags`、`variantGroupId`、`correctionHistory[]`、`mastered`、`masteredAt`

### 1.3 V2→V3 迁移
- 为历史错题回填标签（通过`inferQuestionTags()`或从题库查找）
- 初始化空 `masteryState`

### 1.4 修改 recordQuiz / recordUnitTest
记录错题时同步写入 `bloom/solo/knowledgeTags/variantGroupId/correctionHistory/mastered` 字段

### 1.5 新增操作函数
- `getMasteryState()` — 返回掌握状态
- `updateMasteryStatus(key, roundData)` — 更新知识点-层级组合的掌握状态，正确率≥80%标记mastered
- `updateWrongQuestionCorrection(questionId, correctionRecord)` — 更新错题矫正历史

---

## 阶段2：变式题库（variantBank.js）

### 2.1 数据结构
```javascript
const VARIANT_QUESTIONS = {
    'p1-t1-q1': [
        { id: 'v-p1-t1-q1-a', variantOf: 'p1-t1-q1', type, question, options, answer, explain, bloom, solo, knowledgeTags },
        // ...
    ],
    // 每道原题1-2道变式，覆盖6个项目
};
```

### 2.2 变式题生成原则
- `type/bloom/solo/knowledgeTags` 与原题完全一致
- 题干措辞不同、选项顺序重排、干扰项替换、具体数值/场景改变
- 判断题：等价表述（正命题↔逆否命题）
- 代码填空：更换场景但保持相同语法考点
- 案例分析：更换企业背景但保持相同分析维度
- 代码/设计题：更换业务场景，testCases/criteria结构一致

### 2.3 题目分布
| 项目 | 建议变式题数 | 覆盖知识点 |
|------|-------------|-----------|
| p1 Python基础 | 15-20 | Python基础, 环境搭建, 数据类型 |
| p2 数据获取 | 10-12 | 爬虫, Excel, requests |
| p3 数据预处理 | 12-15 | Pandas, 数据清洗, 缺失值 |
| p4 数据分析 | 10-12 | 财务指标, ROE, 杜邦分析 |
| p5 可视化 | 8-10 | Matplotlib, Pyecharts, 图表选择 |
| p6 综合应用 | 6-8 | 报告撰写, 指标体系 |

---

## 阶段3：推荐引擎（masteryEngine.js）

### 3.1 配置常量
- `MASTERY_THRESHOLD: 80` — 掌握阈值
- `MAX_ROUNDS: 3` — 最大矫正轮次
- `FALLBACK_BLOOM_RANGE: 1` — 降级匹配允许的Bloom层级差

### 3.2 三级推荐算法
1. **精确匹配**：`VARIANT_QUESTIONS[questionId]` 中找未使用变式
2. **知识点匹配**：全题库中找同 `knowledgeTag` + 同 `bloom` 的其他题
3. **降级匹配**：同 `knowledgeTag` + `bloom` 差距 ≤ 1 的题

### 3.3 掌握判定
- 最小判定单元：`(knowledgeTag, bloom)` 组合
- 正确率 = 原题 + 变式题全部答题的综合正确率
- 最低样本量：`totalAttempts < 3` 时不判定为"已掌握"
- `accuracy >= 80%` → `mastered = true`

### 3.4 核心函数
- `recommendVariants(wrongItems)` — 批量推荐
- `getVariantForQuestion(questionId)` — 单题推荐
- `getMasteryStatus(tag, bloom)` — 单组合掌握状态
- `getMasteryOverview()` — 全局统计 `{mastered, inProgress, notStarted, overallRate}`
- `startCorrectionRound(wrongIds)` / `submitCorrectionRound(roundId, results)` — 矫正流程
- `canContinueCorrection()` — 是否可继续下一轮

---

## 阶段4：测验流程改造（app.js）

### 4.1 提取共用函数（减少代码重复）
- `renderQuestionContent(q)` — 题目内容渲染
- `bindQuestionInteraction(q)` — 选项交互绑定
- `judgeAnswer(q)` — 判题逻辑，返回 `{correct, answer, yourAnswerText, correctAnswerText}`
- `showAnswerResult(q, result)` — 答案结果展示

### 4.2 修改 finishQuiz()
有错题时增加"矫正练习"入口按钮，显示错题数量和掌握学习说明

### 4.3 新增矫正练习流程
- `startMasteryCorrection(task, wrongItems)` — 调用引擎推荐变式，初始化矫正会话
- `renderMasteryQuestion()` — 复用quiz-modal样式，增加矫正进度和匹配方式标签
- `submitMasteryAnswer(q)` — 判题并记录结果
- `finishMasteryRound()` — 提交本轮结果、更新掌握状态、渲染掌握报告（各知识点掌握度+80%阈值线）
- `startSingleQuestionCorrection(wq)` — 单题矫正入口

### 4.4 复用策略
复用现有 `#quiz-modal`，通过 `.mastery-mode` CSS class 切换样式，不新增独立弹窗

---

## 阶段5：数据中心可视化

### 5.1 新增掌握度概览卡片
4个统计指标（已掌握/矫正中/未触及/掌握率）+ 总体掌握进度条（含80%阈值标线）

### 5.2 错题回顾增强
每条错题显示：知识点标签、Bloom层级、掌握状态徽章（已掌握/矫正中/待矫正）、矫正轮次、"矫正练习"按钮

### 5.3 新增待掌握知识点卡片
列出所有未掌握的知识点-层级组合，支持一键矫正

---

## 阶段6：演示模式（demoMode.js）

- `_generateDemoData()` 中新增 `masteryState` 演示数据（部分mastered、部分矫正中）
- 错题记录补充 `bloom/solo/knowledgeTags/correctionHistory/mastered` 字段

---

## 阶段7：样式与集成

### 7.1 CSS新增
- `.mastery-stats-grid` — 掌握度统计网格
- `.mastery-overall-bar` / `.mastery-threshold-marker` — 进度条+80%阈值线
- `.mastery-mode .mastery-header` — 矫正模式题头（徽章+进度）
- `.mastery-report` / `.mastery-topic-item` — 掌握报告
- `.wrong-q-item.mastered` / `.mastery-badge-small` — 错题状态标签
- `.btn-warning` — 警告按钮（矫正练习）
- `.q-tag.knowledge` — 知识点标签样式

### 7.2 HTML脚本引入
```
js/questionBankExtended.js → js/variantBank.js → js/data.js → js/storage.js → js/masteryEngine.js → ...
```

---

## 实施顺序

```
阶段1 数据层(storage.js) ← 无UI依赖，先行
阶段2 变式题库(variantBank.js) ← 依赖阶段1数据结构
阶段3 推荐引擎(masteryEngine.js) ← 依赖阶段1+2
阶段4 测验流程(app.js) ← 依赖阶段1+2+3，提取共用函数
阶段5 数据中心(app.js) ← 依赖阶段1+3
阶段6 演示模式(demoMode.js) ← 依赖阶段1+3
阶段7 样式集成(CSS+HTML) ← 贯穿全程
```

---

## 验证清单

- [ ] dataVersion 正确升级到3，V2数据自动迁移无丢失
- [ ] 错题记录包含完整 bloom/solo/knowledgeTags 标签
- [ ] variantBank.js 覆盖6个项目的主要原题，每题1-2道变式
- [ ] 精确匹配、知识点匹配、降级匹配三级策略均正常工作
- [ ] 小测/单元测答错后出现"矫正练习"按钮
- [ ] 矫正练习弹窗正确渲染变式题，判题逻辑与原测验一致
- [ ] 矫正结果正确更新 masteryState 和 wrongQuestions.correctionHistory
- [ ] 掌握判定：正确率≥80%标记mastered，<3次答题不判定
- [ ] 掌握报告正确显示各知识点掌握度和80%阈值线
- [ ] 最多3轮矫正，达到掌握后停止
- [ ] 数据中心掌握度概览卡片正确显示统计
- [ ] 错题回顾每条显示掌握状态和矫正按钮
- [ ] 演示模式掌握度数据完整可展示
- [ ] 旧用户V2数据迁移后错题标签完整回填