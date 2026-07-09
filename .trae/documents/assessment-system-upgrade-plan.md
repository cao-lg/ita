# 测试系统评估改进实施计划

## 目标

解决当前测试系统无法真实反映学生水平的问题，实现：
1. 测试覆盖布鲁姆分类全部6个认知层次（记忆→创造）
2. 测试覆盖SOLO分类全部4个学习层次（单点→抽象拓展）
3. 学习效果分析升级为专业多维度诊断报告
4. 增加成果分享方式（导出、分享链接、学习证书）

## 当前状态分析

**测试题库现状（已统计）：**
- 小测(quiz)：29道，100%为单选题，全部集中在记忆/理解层次
- 单元测试(unitTests)：32道，含单选(23)/判断(7)/代码填空(2)，仍以低阶思维为主
- 无多选题、无案例分析题、无代码实现题、无设计题
- 无布鲁姆/SOLO分类标签
- 无法评估应用、分析、评价、创造等高阶能力

**学习效果分析现状：**
- 仅4维度简单柱状图（语法基础/数据处理/分析应用/可视化）
- 无认知层次分析、无SOLO层次分析、无学习趋势、无个性化诊断
- 无报告导出、无分享功能

**题型-认知层次映射缺失：**
- 单选题：仅适合B1(记忆)/B2(理解)
- 判断题：仅适合B2(理解)
- 代码填空：勉强达到B3(应用)
- 完全没有B4(分析)/B5(评价)/B6(创造)的评估手段

## 计划变更文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `js/questionBankExtended.js` | 新建 | 新增高阶题目（多选/案例/代码/设计），含bloom/solo/knowledgeTags标签 |
| `js/analysis/bloomRadar.js` | 新建 | 布鲁姆六维认知雷达图 |
| `js/analysis/soloDistribution.js` | 新建 | SOLO层次分布柱状+折线组合图 |
| `js/analysis/knowledgeHeatmap.js` | 新建 | 知识点×布鲁姆层次掌握热力图 |
| `js/analysis/learningTrend.js` | 新建 | 学习趋势双轴折线图 |
| `js/analysis/diagnosisReport.js` | 新建 | 能力诊断报告生成器 |
| `js/share/exportImage.js` | 新建 | html2canvas导出报告图片 |
| `js/share/exportPDF.js` | 新建 | html2canvas+jspdf导出PDF |
| `js/share/shareLink.js` | 新建 | LZ-String压缩生成分享链接 |
| `js/share/certificate.js` | 新建 | 学习证书生成与下载 |
| `js/data.js` | 修改 | 全部61道旧题补充bloom/solo/knowledgeTags标签 |
| `js/storage.js` | 修改 | 新增cognitiveProfile数据结构、数据版本迁移逻辑(V1→V2) |
| `js/app.js` | 修改 | 扩展renderQuizQuestion/renderExamQuestion支持新题型、重构renderDataCenterPage |
| `css/style.css` | 修改 | 新增图表容器、报告区、证书样式 |
| `index.html` | 修改 | 引入ECharts/html2canvas/jspdf/LZ-String CDN、扩展报告区DOM、证书模板 |

---

## Task 1: 题目双维度分类体系设计

**文件：新建 `js/questionBankExtended.js`，修改 `js/data.js`**

### 1.1 双维度标签规范

每道题目新增三个字段：

| 字段 | 取值 | 说明 |
|------|------|------|
| `bloom` | B1/B2/B3/B4/B5/B6 | 布鲁姆认知层次 |
| `solo` | S1/S2/S3/S4 | SOLO学习层次 |
| `knowledgeTags` | 字符串数组 | 知识点标签 |

布鲁姆层次定义：
- B1 记忆：回忆概念、语法、API名称
- B2 理解：解释概念含义、判断代码输出
- B3 应用：在标准场景中运用知识解决问题
- B4 分析：分解问题、比较方法优劣、分析错误原因
- B5 评价：评估方案合理性、选择最优策略
- B6 创造：设计完整方案、编写原创代码、构建可视化看板

SOLO层次定义：
- S1 单点结构：只需一个知识点回答
- S2 多点结构：需要多个独立知识点
- S3 关联结构：需要整合多个知识点形成关联
- S4 抽象拓展：需要抽象概括、迁移应用到新场景

### 1.2 旧题标签回填

对现有61道题统一标注：
- 单选纯概念题 → bloom:B1, solo:S1
- 判断题 → bloom:B2, solo:S1
- 代码填空题 → bloom:B3, solo:S1
- 单元测试中的概念题 → bloom:B2, solo:S1

### 1.3 新增题目类型

在 `questionBankExtended.js` 中新增四类题目：

**多选题（multi）**：
```javascript
{
    id: 'p3-t3-q4', type: 'multi',
    question: '以下哪些属于数据清洗的常用操作？',
    options: ['去除重复值', '缺失值填充', '数据类型转换', '异常值检测'],
    answer: [0, 1, 2, 3],  // 正确答案索引数组
    bloom: 'B2', solo: 'S2',
    knowledgeTags: ['Pandas', '数据清洗']
}
```

**案例分析题（case）**：
```javascript
{
    id: 'p4-t2-q5', type: 'case',
    question: '恒信制造2020年Q3营收环比下降15%，请分析可能原因...',
    caseText: '背景：恒信制造2020年Q3营收...',
    options: ['A. 先检查数据完整性', 'B. 直接归因于疫情', ...],
    answer: [0, 2, 3],
    bloom: 'B4', solo: 'S3',
    knowledgeTags: ['财务分析', '环比分析']
}
```

**代码实现题（code）**：
```javascript
{
    id: 'p5-t1-q4', type: 'code',
    question: '请编写代码：使用Pyecharts绘制恒信制造2020年上半年月度营收柱状图',
    starterCode: 'from pyecharts.charts import Bar\nbar = Bar()\n# 请补全代码',
    testCases: [
        { check: 'add_xaxis', desc: '设置了x轴' },
        { check: 'add_yaxis', desc: '设置了y轴' },
        { check: 'render', desc: '调用了render' }
    ],
    modelAnswer: '...',
    bloom: 'B6', solo: 'S4',
    knowledgeTags: ['Pyecharts', '可视化']
}
```

**设计题（design）**：
```javascript
{
    id: 'p6-t1-q5', type: 'design',
    question: '为董事会设计一份恒信制造经营数据可视化看板...',
    criteria: [
        { item: '核心指标完整性', weight: 30 },
        { item: '图表类型匹配度', weight: 30 },
        { item: '分析逻辑清晰度', weight: 25 },
        { item: '业务价值阐述', weight: 15 }
    ],
    modelAnswer: '...',
    bloom: 'B6', solo: 'S4',
    knowledgeTags: ['看板设计', '财务指标']
}
```

新增题目按布鲁姆分布目标：B1(15%)/B2(20%)/B3(25%)/B4(20%)/B5(12%)/B6(8%)
新增题目按SOLO分布目标：S1(20%)/S2(30%)/S3(35%)/S4(15%)

---

## Task 2: 存储层数据结构升级

**文件：修改 `js/storage.js`**

### 2.1 新增认知画像数据结构

```javascript
function getDefaultData() {
    return {
        dataVersion: 2,  // 数据版本号
        // ... 现有字段 ...
        cognitiveProfile: {
            bloomScores: { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0 },
            bloomTotals: { B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0 },
            soloScores:  { S1: 0, S2: 0, S3: 0, S4: 0 },
            soloTotals:  { S1: 0, S2: 0, S3: 0, S4: 0 },
            knowledgeScores: {},  // { tag: { correct, total } }
            lastUpdated: null
        }
    };
}
```

### 2.2 数据迁移逻辑（V1→V2）

```javascript
function migrateData(data) {
    const version = data.dataVersion || 1;
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
    return data;
}
```

### 2.3 答题记录更新认知画像

在 `recordQuiz()` 和 `recordUnitTest()` 中，答题后按题目 `bloom`/`solo`/`knowledgeTags` 更新计数。

---

## Task 3: 新题型前端渲染

**文件：修改 `js/app.js`**

扩展 `renderQuizQuestion()` 和 `renderExamQuestion()`：

- **多选题(multi)**：复选框替代单选按钮，提交时数组相等性判断
- **案例分析题(case)**：顶部渲染 `caseText` 边框高亮区域，下方接选项
- **代码实现题(code)**：textarea + 行号显示 + `starterCode` 预填充，提交时关键字匹配验证
- **设计题(design)**：大文本框输入，提交后进入自评模式，展示评分标准清单

---

## Task 4: 五大分析模块

**文件：新建 `js/analysis/` 目录下5个文件**

### 4.1 认知雷达图 `bloomRadar.js`
- 数据源：cognitiveProfile 中 bloomScores/bloomTotals
- 计算：每个B层次得分 = 答对题数/总答题数×100
- 可视化：ECharts radar图，6顶点对应B1-B6

### 4.2 SOLO层次分布图 `soloDistribution.js`
- 数据源：cognitiveProfile 中 soloScores/soloTotals
- 可视化：柱状图(各层次答题量) + 折线图(正确率)
- 洞察：标注当前主要SOLO层次，提示跃迁建议

### 4.3 知识掌握热力图 `knowledgeHeatmap.js`
- 数据源：knowledgeScores
- 可视化：ECharts热力图，X轴=知识点(Python基础/Pandas/清洗/分析/可视化/综合)，Y轴=布鲁姆层次
- 色深表示掌握度

### 4.4 学习趋势 `learningTrend.js`
- 数据源：timestamps + quizRecords + unitTestRecords
- 指标：日/周活跃度、平均得分趋势、错题收敛率
- 可视化：双Y轴折线图，左轴得分趋势，右轴错题数

### 4.5 能力诊断报告 `diagnosisReport.js`
- 诊断逻辑：
  1. 最低分布鲁姆维度 → 针对性训练建议
  2. SOLO层次瓶颈 → 推荐关联/抽象拓展类题目
  3. 薄弱知识点 → 推荐回顾任务
  4. 综合等级：初级/进阶/高级分析师
- 展示：结构化卡片 + 关键指标高亮 + 行动建议列表

---

## Task 5: 成果分享功能

**文件：新建 `js/share/` 目录下4个文件**

### 5.1 导出报告图片 `exportImage.js`
- 技术：html2canvas 将报告区DOM转Canvas导出PNG
- 规格：1200px宽，白色背景，平台水印

### 5.2 导出PDF `exportPDF.js`
- 技术：html2canvas + jspdf，报告区转图嵌入A4 PDF
- 规格：A4纵向，含标题/学员信息/生成日期/五大模块

### 5.3 分享链接 `shareLink.js`
- 技术：学习数据序列化→LZ-String压缩→Base64→URL参数 `?share=BASE64`
- 接收方解析渲染只读报告视图
- 安全：仅含分析摘要和分数，不含敏感信息

### 5.4 学习证书 `certificate.js`
- 触发：全部6项目单元测通过且均分≥80
- 内容：结业证书标题、姓名/班级/学号、完成日期、综合等级、电子签章
- 技术：html2canvas转图片下载
- 样式：金色边框、正式排版

---

## Task 6: HTML/CSS扩展

**文件：修改 `index.html` + `css/style.css`**

### 6.1 index.html 变更
- 引入CDN：`echarts@5.4.3`、`html2canvas@1.4.1`、`jspdf@2.5.1`、`lz-string@1.5.0`
- 扩展 `page-data-center`：新增报告区DOM、证书模板
- 新增分析模块挂载点：`#chart-bloom-radar`、`#chart-solo-distribution`、`#chart-knowledge-heatmap`、`#chart-learning-trend`、`#chart-diagnosis-report`

### 6.2 style.css 变更
- `.analysis-card`：分析模块卡片样式
- `.chart-container`：图表容器（最小高度300px）
- `.certificate-wrapper`：证书整体样式（金色边框、居中）
- `.diagnosis-card`：诊断报告卡片
- `.share-btn-group`：分享按钮组

---

## Task 7: 数据兼容与降级

### 7.1 旧题无标签时的降级
题目加载时，如缺少 `bloom`/`solo`，按类型推断默认值：
- `single` + 纯概念 → B1/S1
- `judge` → B2/S1
- `codefill` → B3/S1

### 7.2 CDN加载失败的降级
- ECharts失败 → 效果分析回退为纯文本诊断报告
- html2canvas/jspdf失败 → 隐藏导出按钮，保留分享链接（纯JS无依赖）

### 7.3 localStorage容量保护
- 分析数据仅存聚合结果（cognitiveProfile），不存原始答题明细
- 超限提示用户导出并清理

---

## 关键依赖

```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js"></script>
```

---

## 验证清单

- [x] 全部61道旧题补全 bloom/solo/knowledgeTags（通过 app.js 初始化自动推断补充）
- [x] 新增 multi/case/code/design 各至少3道示例（questionBankExtended.js 已覆盖6项目）
- [x] 小测和单元测渲染支持所有新题型（app.js renderQuizQuestion/renderExamQuestion 已扩展）
- [x] 布鲁姆雷达图正确展示B1-B6六维（bloomRadar.js + ECharts）
- [x] SOLO分布图展示S1-S4答题量与正确率（soloDistribution.js + ECharts）
- [x] 知识热力图展示至少6知识点×6布鲁姆层次（knowledgeHeatmap.js + ECharts）
- [x] 学习趋势图展示近30天得分与错题变化（learningTrend.js + ECharts）
- [x] 诊断报告根据数据自动生成文本建议（diagnosisReport.js）
- [x] 报告导出图片功能正常（含水印）（exportImage.js + html2canvas）
- [x] 报告导出PDF功能正常（A4格式）（exportPDF.js + html2canvas + jspdf）
- [x] 分享链接生成与解析正常（shareLink.js + LZ-String）
- [x] 学习证书在全部通过且均分≥80时解锁（certificate.js）
- [x] 旧数据V1自动迁移至V2无丢失（storage.js migrateData）
- [x] localStorage数据版本号正确升级为2（storage.js dataVersion: 2）
