# 恒信制造情境式教学与数据实操增强计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为6个项目添加恒信制造有限公司情境式教学背景，虚拟构造完整的财务数据集，让每个任务的代码示例直接使用真实企业数据，学生可复制代码即时运行，同时支持数据表格展示和CSV/Excel下载。

**Architecture:** 在现有纯前端架构（HTML/CSS/JS + localStorage）基础上，新增三个核心模块：(1) hengxinData.js 存储完整财务数据集；(2) dataDisplay.js 负责数据表格渲染和文件下载；(3) contentEnhancer.js 负责在渲染时将占位符替换为真实数据和情境故事。data.js 改用占位符标记而非硬编码数据，app.js 在渲染流程中接入增强器。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, SheetJS (xlsx.js, 已引入), localStorage

---

## Current State Analysis

现有平台包含6个项目、16个任务，已具备：登录认证、课程目录导航、知识点小测、单元综合测试（计时+自动判分）、学习进度追踪、localStorage数据持久化、JSON/Excel导出功能。但所有代码示例使用零散虚构数据（如 `revenue = 1000000`），缺乏统一的企业背景故事，学生无法感知真实业务场景，也难以将学到的技能迁移到实际财务分析工作中。

现有文件清单：
- `/workspace/index.html` — 主页面框架
- `/workspace/css/style.css` — 样式系统
- `/workspace/js/data.js` — 课程数据与题库（内容硬编码）
- `/workspace/js/storage.js` — 本地存储管理
- `/workspace/js/app.js` — 主应用逻辑

---

## Proposed Changes

### Task 1: 创建 `/workspace/js/hengxinData.js`（完整财务数据集）

**What:** 虚拟构造恒信制造有限公司2019-2020年度全套财务数据，以JavaScript对象形式导出。

**Why:** 所有后续任务的代码示例和数据展示都依赖此数据集，必须先定义统一的数据规范。

**How:**
- 定义 `HENGXIN_DATA` 全局对象，包含以下数据集：
  - `companyInfo`: 企业名称、行业、成立时间、员工数、总部、拟IPO状态
  - `balanceSheet2019` / `balanceSheet2020`: 资产负债表（约25项，含流动资产、非流动资产、流动负债、非流动负债、所有者权益）
  - `incomeStatement2019` / `incomeStatement2020`: 利润表（营业收入、成本、毛利、三费、营业利润、净利润等）
  - `cashFlow2019` / `cashFlow2020`: 现金流量表（经营活动、投资活动、筹资活动）
  - `monthlyRevenue`: 24个月月度营收（2019: 82,75.6,91,94.5,102,108,115,112,125,118,132,145; 2020: 138,125,142,156,168,172,165,158,175,182,195,210 — 单位：万元）
  - `monthlyCost`: 对应月度成本
  - `expenseDetail2020`: 费用明细（人工420、材料1380、管理280、销售195、财务45 — 单位：万元）
  - `subjectBalances`: 科目余额表（含科目编码、名称、期初借/贷、本期发生额、期末余额）
  - `vouchersDirty`: 脏数据版本（用于项目三清洗练习，含空格、￥符号、逗号、重复行、缺失值、日期格式混乱）
  - `vouchersClean`: 清洗后版本
  - `crawlerHtmlSample`: 模拟巨潮资讯网HTML片段（用于项目二爬虫练习）
- 每项数据提供 `toCSV()` 和 `toJSON()` 方法
- 文件末尾执行 `window.HENGXIN_DATA = HENGXIN_DATA`

---

### Task 2: 创建 `/workspace/js/dataDisplay.js`（数据表格渲染与下载）

**What:** 提供数据表格渲染、CSV下载、Excel下载三个核心功能。

**Why:** 学生需要在网页上直观看到数据，并能下载到本地用Python实操。

**How:**
- `DataDisplay.renderTable(dataArray, columnsConfig, title)`:
  - `dataArray`: 数据行数组
  - `columnsConfig`: `[{key:'科目', label:'会计科目', width:'200px'}, ...]`
  - 生成带表头固定、横向/纵向滚动的HTML表格
  - 表格上方显示标题 + "下载CSV" / "下载Excel" 按钮
- `DataDisplay.downloadCSV(datasetKey, filename)`:
  - 从 `HENGXIN_DATA` 读取数据
  - 生成CSV字符串，前缀 `\ufeff` 防止中文乱码
  - 创建Blob并触发浏览器下载
- `DataDisplay.downloadExcel(datasetKey, filename)`:
  - 复用已引入的 SheetJS (`XLSX`)
  - `XLSX.utils.json_to_sheet()` + `XLSX.writeFile()`
- `DataDisplay.renderDataBlock(datasetKey, displayConfig)`:
  - 组合调用 renderTable + 下载按钮，生成完整数据展示区块
- 文件末尾执行 `window.DataDisplay = DataDisplay`

---

### Task 3: 创建 `/workspace/js/contentEnhancer.js`（内容增强器）

**What:** 在课程content渲染阶段，将占位符替换为真实数据、情境故事、数据表格。

**Why:** 避免在 data.js 中直接写死大量数据，保持数据与内容解耦，便于后续调整企业数据或替换为其他案例。

**How:**
- `ContentEnhancer.injectStory(html, projectId)`:
  - 在 content 最前面插入情境故事框 HTML
  - 每个项目有独立的故事文本（见下方故事设计）
  - 故事框样式类名：`story-box`
- `ContentEnhancer.renderDataTables(html)`:
  - 扫描 content 中的 `<!--TABLE:datasetKey:configKey-->` 占位符
  - 调用 `DataDisplay.renderDataBlock()` 替换为完整数据区块
- `ContentEnhancer.injectCodeData(html, taskId)`:
  - 扫描 content 中的 `<!--CODE_DATA:datasetKey-->` 占位符
  - 将占位符替换为可直接嵌入Python代码的JSON/列表字面量
  - 例如 `<!--CODE_DATA:monthlyRevenue-->` → `[82, 75.6, 91, ...]`
- 文件末尾执行 `window.ContentEnhancer = ContentEnhancer`

---

### Task 4: 修改 `/workspace/index.html`（引入新JS文件）

**What:** 在现有script标签前引入3个新文件。

**How:** 在 `<script src="js/data.js"></script>` 之前添加：
```html
<script src="js/hengxinData.js"></script>
<script src="js/dataDisplay.js"></script>
<script src="js/contentEnhancer.js"></script>
```

---

### Task 5: 修改 `/workspace/js/data.js`（添加占位符和情境标记）

**What:** 将现有任务的 content 中的零散示例数据替换为占位符，并添加情境故事标记。

**How:**
- 每个项目的 desc 字段更新为恒信制造背景描述
- 每个任务的 content 开头添加 `<!--STORY-->` 标记（增强器会自动替换为对应项目的故事框）
- 将原有硬编码的示例数据替换为占位符：
  - `revenue = 1000000` → `revenue = <!--CODE_DATA:annualRevenue2020-->`
  - 需要展示数据表格的位置插入 `<!--TABLE:balanceSheet2020:default-->`
  - 代码块中需要真实数据的位置插入 `<!--CODE_DATA:monthlyRevenue-->`
- 确保原有quiz题目中涉及数据的部分也使用占位符
- 各项目故事设计：

**项目一故事：** 你作为恒信制造财务部新入职的数据分析实习生，第一天报到。财务总监李总要求你一周内搭建好Python环境，并开发一个"会计分录自动打印"小工具。

**项目二故事：** 李总需要你收集同行业可比公司数据，用于撰写IPO招股书行业对比章节。你需要通过Tushare获取3家上市公司数据，并编写爬虫从巨潮资讯网下载年报PDF。

**项目三故事：** 从ERP导出的原始数据质量堪忧：金额混有￥和逗号、日期格式不统一、存在重复凭证。你需要清洗这些数据，输出标准化数据集。

**项目四故事：** 清洗后的数据已就绪。李总要求你完成2019-2020年度描述性统计分析，重点分析营收趋势、成本结构、四大财务能力指标。

**项目五故事：** 数据分析结果需要向董事会汇报。李总要求你制作一套专业财务可视化看板，包含趋势图、饼图、对比图，最终输出HTML看板。

**项目六故事：** 年终董事会即将召开，李总要求你整合前五个项目成果，编制《恒信制造2019-2020年度经营数据分析报告》，包含数据获取说明、清洗记录、统计结论、可视化图表、经营诊断与改进建议。

---

### Task 6: 修改 `/workspace/js/app.js`（集成增强器到渲染流程）

**What:** 在 `loadTask` 和 `renderContent` 中接入 `ContentEnhancer`。

**How:**
- 在 `renderContent(html)` 函数中，在代码块包装之后、返回之前，依次调用：
  ```javascript
  function renderContent(html) {
      // 1. 包装代码块（已有功能）
      html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, ...);
      
      // 2. 注入情境故事
      html = ContentEnhancer.injectStory(html, currentProjectId);
      
      // 3. 渲染数据表格
      html = ContentEnhancer.renderDataTables(html);
      
      // 4. 嵌入代码数据
      html = ContentEnhancer.injectCodeData(html, currentTask);
      
      return html;
  }
  ```
- 在 `loadTask(taskId)` 中确保 `currentProjectId` 被正确赋值（在查找 task 时记录所属 project.id）

---

### Task 7: 修改 `/workspace/css/style.css`（新增样式）

**What:** 为情境故事框和数据表格区块添加样式。

**How:**
- 添加 `.story-box` 样式：渐变背景（#1e3a5f → #2563eb）、白色文字、圆角、内边距、底部margin
- 添加 `.data-table-section` 样式：边框、圆角、阴影
- 添加 `.data-table-header` 样式：flex布局、标题左、按钮右、背景色
- 添加 `.data-table-actions` 样式：按钮间距
- 添加 `.table-scroll` 样式：overflow auto、最大高度400px

---

### Task 8: 验证清单

**功能验证：**
- [ ] 每个项目页面顶部显示恒信制造情境故事框
- [ ] 数据表格正确渲染，列名与数据对齐
- [ ] CSV下载正常，Excel打开中文无乱码（验证BOM头）
- [ ] Excel下载正常，SheetJS生成文件可正常打开
- [ ] 代码示例中的占位符被替换为学生可直接运行的真实数据
- [ ] 代码复制功能正常（复制后的代码包含真实数据，可直接粘贴到Python运行）
- [ ] 原有测验系统不受影响（题目、判分、记录均正常）
- [ ] 学习进度存储正常（localStorage无异常）
- [ ] 项目解锁逻辑正常（前一项目单元测试≥60分解锁下一项目）

**数据验证：**
- [ ] 资产负债表借贷平衡（资产 = 负债 + 所有者权益）
- [ ] 利润表净利润计算正确（营业收入 - 成本 - 费用 - 所得税）
- [ ] 月度营收合计 = 年度营业收入
- [ ] 脏数据包含足够的异常类型（空格、￥、逗号、重复、缺失、日期混乱）

---

## Assumptions & Decisions

1. **数据虚拟构造**：恒信制造有限公司为虚构企业，所有财务数据由开发者根据制造业平均水平合理构造，不要求与任何真实企业对应。
2. **数据规模控制**：资产负债表约25项、利润表约15项、现金流量表约12项、月度数据24个月、费用明细约10项、科目余额约30项。总数据量控制在100KB以内，确保前端加载无压力。
3. **代码可复制直接运行**：所有代码示例中的数据替换后，学生可直接复制粘贴到本地Python环境运行，无需额外修改。
4. **脏数据仅用于项目三**：脏数据版本（vouchersDirty）专门用于项目三的清洗练习，其他项目使用清洗后的数据。
5. **不改动storage.js**：学习进度、测验记录等存储逻辑保持不变，本次计划只影响内容展示层。
6. **Excel下载复用SheetJS**：index.html 已引入 `xlsx.full.min.js`，无需额外依赖。
7. **CSV编码**：生成CSV时在开头添加 UTF-8 BOM（`\ufeff`），确保Excel打开中文不乱码。
8. **不改动项目结构数量**：保持现有6个项目、16个任务的框架不变，只增强内容和数据。

---

## Verification Steps

1. 打开浏览器访问部署后的网站
2. 登录后进入项目一，验证页面顶部出现蓝色渐变的故事框
3. 进入任务二（数据类型），检查代码示例中是否使用恒信制造的科目编码和金额
4. 进入任务三（流程控制），检查折旧计算示例是否使用恒信制造的固定资产数据
5. 进入项目二任务二（爬虫），检查是否出现模拟的巨潮资讯网HTML片段
6. 进入项目三任务三（数据清洗），检查脏数据表格是否正确渲染，点击下载CSV和Excel按钮验证文件内容
7. 进入项目四任务一（特征分析），检查月度营收数据表格和代码示例
8. 进入项目五任务一（可视化），检查费用结构数据是否正确嵌入饼图代码
9. 进入项目六，检查是否整合了前五个项目的全部数据
10. 运行全部小测和单元测试，确保评分和记录功能正常
