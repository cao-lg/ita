/**
 * 课程数据 - 6个项目单元完整内容
 */

const COURSE_DATA = {
    projects: [
        {
            id: 'p1',
            title: '项目一：经济管理大数据分析环境搭建',
            desc: '作为恒信制造财务部数据分析实习生，搭建 Python 环境并开发会计分录打印工具',
            tags: [],
            tasks: [
                {
                    id: 'p1-t1',
                    title: '任务一：搭建 Python 分析环境',
                    tags: [],
                    content: `
<!--STORY-->
<h3>知识点 1：Python 简介与在财务数据分析中的应用</h3>
<p>Python 是一种高级、解释型、通用的编程语言，由 Guido van Rossum 于 1991 年发布。它以简洁、易读的语法著称，非常适合数据分析和科学计算。</p>
<div class="highlight-box">
<strong>Python 在财务领域的典型应用：</strong>
<ul>
<li>财务报表自动化生成与分析</li>
<li>海量交易数据的清洗与统计</li>
<li>财务指标计算与可视化呈现</li>
<li>基于历史数据的预测与建模</li>
<li>审计数据抽样与异常检测</li>
</ul>
</div>

<h3>知识点 2：Python 安装与环境配置</h3>
<p>访问 <code>python.org</code> 下载最新版本的 Python 安装包。安装时请务必勾选 <strong>"Add Python to PATH"</strong> 选项，这将允许你在命令行中直接运行 Python。</p>
<p>安装完成后，打开命令提示符（CMD）或终端，输入以下命令验证安装：</p>
<pre><code>python --version
pip --version</code></pre>

<h3>知识点 3：Jupyter Notebook / 编辑器的使用</h3>
<p>Jupyter Notebook 是数据科学领域最常用的交互式开发环境。安装命令：</p>
<pre><code>pip install notebook
jupyter notebook</code></pre>
<p>启动后会在浏览器中打开一个交互式界面，支持代码分块执行、即时查看结果、插入 Markdown 说明文档等功能。</p>

<h3>知识点 4：第一个程序：打印会计分录</h3>
<p>会计分录是财务工作的基础。下面用 Python 打印一条简单的会计分录：</p>
<pre><code># 打印会计分录
print("借：原材料    10,000")
print("    应交税费——应交增值税（进项税额） 1,300")
print("贷：银行存款    11,300")
print("-" * 40)
print("摘要：采购原材料一批，款已付")</code></pre>
`,
                    quiz: [
                        { id: 'p1-t1-q1', question: 'Python 在财务数据分析中的主要优势不包括以下哪项？', type: 'single', options: ['语法简洁易学', '丰富的数据处理库', '原生支持中文财务报表格式', '强大的可视化能力'], answer: 2, explain: 'Python 需要通过配置或库来支持中文显示，并非原生支持特定报表格式。' },
                        { id: 'p1-t1-q2', question: '安装 Python 时必须勾选哪个选项才能在命令行中使用？', type: 'single', options: ['Install for all users', 'Add Python to PATH', 'Disable path length limit', 'Install pip'], answer: 1, explain: 'Add Python to PATH 将 Python 添加到系统环境变量，使命令行可以识别 python 命令。' },
                        { id: 'p1-t1-q3', question: 'Jupyter Notebook 最适合以下哪种工作场景？', type: 'single', options: ['开发大型 Web 应用', '编写需要频繁调试的数据分析代码', '编写系统底层驱动程序', '制作静态网页'], answer: 1, explain: 'Jupyter 的交互式特性非常适合数据探索、可视化和频繁调试的分析场景。' }
                    ]
                },
                {
                    id: 'p1-t2',
                    title: '任务二：Python 数据类型',
                    tags: ['difficulty'],
                    content: `
<!--STORY-->
<h3>知识点 1：变量命名规则、注释、输入输出</h3>
<p>Python 变量命名规则：以字母或下划线开头，区分大小写，不能使用关键字（如 <code>if</code>、<code>for</code>、<code>class</code> 等）。</p>
<pre><code># 这是一行注释
'''
这是多行注释
可以写多行说明
'''
name = input("请输入员工姓名：")
print("欢迎，", name)</code></pre>

<h3>知识点 2：数值类型</h3>
<p>Python 的数值类型包括整型 <code>int</code>、浮点型 <code>float</code>、布尔值 <code>bool</code>。财务金额通常使用浮点型存储。</p>
<pre><code>revenue = <!--CODE_DATA:annualRevenue2020-->          # 整型（恒信制造2020年营业收入：元）
profit_rate = <!--CODE_DATA:grossMargin2020-->        # 浮点型（2020年毛利率）
is_profitable = True       # 布尔值

# 财务金额计算：恒信制造某批次产品
price = 199.99
quantity = 1500
amount = price * quantity
print(f"销售金额：{amount:.2f}")</code></pre>

<h3>知识点 3：算术运算符与赋值运算符</h3>
<p>在财务场景中，运算符用于计算毛利、折旧等指标：</p>
<pre><code>revenue = <!--CODE_DATA:annualRevenue2020-->
cost = <!--CODE_DATA:annualCost2020-->

# 毛利计算（恒信制造2020年度）
gross_profit = revenue - cost
print(f"毛利：{gross_profit}")

# 毛利率
gross_margin = gross_profit / revenue
print(f"毛利率：{gross_margin:.2%}")

# 双倍余额递减法（恒信制造固定资产年折旧额 = 账面净值 × (2/使用年限)）
book_value = <!--CODE_DATA:fixedAssetValue-->
life = 5
depreciation = book_value * (2 / life)
print(f"第一年折旧额：{depreciation:.2f}")</code></pre>

<h3>知识点 4：比较运算符与逻辑运算符</h3>
<p>业绩达标判断场景：</p>
<pre><code>actual = <!--CODE_DATA:annualRevenue2020-->
target = <!--CODE_DATA:annualRevenue2019-->

# 业绩是否达标？（2020年对比2019年）
is_pass = actual >= target
print("业绩达标：", is_pass)

# 复合条件：业绩达标且净利率大于7%
profit = <!--CODE_DATA:netProfit2020-->
profit_rate = profit / actual
is_excellent = (actual >= target) and (profit_rate > 0.07)
print("优秀业绩：", is_excellent)</code></pre>

<h3>知识点 5：成员运算符、身份运算符与运算优先级</h3>
<pre><code>subjects = ["库存现金", "银行存款", "应收账款"]
print("银行存款" in subjects)   # True
print("固定资产" not in subjects)  # True</code></pre>

<h3>知识点 6-8：字符串操作与格式化</h3>
<p>字符串在财务中用于处理会计科目、格式化报表输出：</p>
<pre><code>subject = "  应交税费——应交增值税（进项税额）  "

# 去除空白
subject_clean = subject.strip()

# 切片：提取科目编码
code = "100201"
print(code[0:4])   # 1002 银行存款

# 格式化输出财务报表
name = "恒信制造有限公司"
revenue = 12500000.50
print(f"{'公司名称':<20}{name}")
print(f"{'营业收入':<20}{revenue:>15,.2f} 元")</code></pre>

<h3>知识点 9-11：列表、元组、字典、集合与类型转换</h3>
<pre><code># 列表：恒信制造2020年上半年月度营收（单位：万元）
monthly_sales = <!--CODE_DATA:monthlyRevenue2020List-->
print(f"上半年平均销售额：{sum(monthly_sales)/len(monthly_sales):.1f} 万元")

# 字典：存储主要科目期末余额（元）
balances = {
    "库存现金": 100000,
    "银行存款": 2960000,
    "应收账款": 5180000
}
print(balances.get("银行存款", 0))

# 类型转换：input 输入金额计算
price = float(input("请输入单价："))
qty = int(input("请输入数量："))
print(f"总金额：{price * qty:.2f}")</code></pre>
`,
                    quiz: [
                        { id: 'p1-t2-q1', question: '以下哪个变量名是合法的？', type: 'single', options: ['2revenue', '_profit_2020', 'class', 'gross-margin'], answer: 1, explain: '_profit_2020 以字母或下划线开头，不包含非法字符。' },
                        { id: 'p1-t2-q2', question: '表达式 15 // 4 的结果是？', type: 'single', options: ['3.75', '3', '4', '1'], answer: 1, explain: '// 是整除运算符，15 除以 4 取整为 3。' },
                        { id: 'p1-t2-q3', question: '字符串格式化 f"{revenue:.2%}" 中 .2% 表示什么？', type: 'single', options: ['保留2位小数的百分比格式', '保留2位小数的浮点数', '科学计数法', '整数格式'], answer: 0, explain: ':.2% 将数值格式化为百分比，保留2位小数。' },
                        { id: 'p1-t2-q4', question: '以下哪种数据结构适合存储"会计科目-余额"的键值对关系？', type: 'single', options: ['列表(list)', '元组(tuple)', '字典(dict)', '集合(set)'], answer: 2, explain: '字典(dict)以键值对形式存储数据，最适合科目-余额的映射关系。' }
                    ]
                },
                {
                    id: 'p1-t3',
                    title: '任务三：流程控制',
                    tags: ['key','difficulty','core'],
                    content: `
<!--STORY-->
<h3>知识点 1：流程控制分类与缩进规则</h3>
<p>Python 使用缩进（通常为4个空格）来表示代码块，这是 Python 语法的重要特征。</p>

<h3>知识点 2：if…else 单分支判断</h3>
<p>单一业绩达标判断：</p>
<pre><code>actual = 850000
target = 800000

if actual >= target:
    print("业绩达标，发放全额奖金")
else:
    print("业绩未达标，奖金按完成比例发放")</code></pre>

<h3>知识点 3：if…elif…else 多分支判断</h3>
<p>阶梯式奖金计算：</p>
<pre><code>completion_rate = 0.92  # 业绩完成率

if completion_rate >= 1.2:
    bonus_rate = 0.20
elif completion_rate >= 1.0:
    bonus_rate = 0.15
elif completion_rate >= 0.8:
    bonus_rate = 0.10
else:
    bonus_rate = 0

print(f"奖金比例：{bonus_rate:.0%}")</code></pre>

<h3>知识点 4：if 嵌套</h3>
<p>多维度绩效考核场景：</p>
<pre><code>revenue_pass = True
profit_pass = True
customer_pass = False

if revenue_pass:
    if profit_pass:
        if customer_pass:
            grade = "A"
        else:
            grade = "B"
    else:
        grade = "C"
else:
    grade = "D"

print(f"绩效等级：{grade}")</code></pre>

<h3>知识点 5：while 循环</h3>
<p>双倍余额递减法折旧计算：</p>
<pre><code>original_value = <!--CODE_DATA:fixedAssetValue-->
life = 5
year = 1
book_value = original_value

while year <= life:
    depreciation = book_value * (2 / life)
    if book_value - depreciation < 1000:
        depreciation = book_value - 1000  # 残值保护
    book_value -= depreciation
    print(f"第{year}年折旧：{depreciation:.2f}，账面净值：{book_value:.2f}")
    year += 1</code></pre>

<h3>知识点 6：for 循环与 range 函数</h3>
<p>遍历会计科目列表：</p>
<pre><code>subjects = ["库存现金", "银行存款", "应收账款", "存货", "固定资产"]

for subject in subjects:
    print(f"正在核对科目：{subject}")

# 使用 range 生成年份序列
for year in range(2019, 2021):
    print(f"审计年度：{year}")</code></pre>

<h3>知识点 7：列表推导式、zip 函数</h3>
<pre><code># 列表推导式：计算各月环比增长率
months = ["1月", "2月", "3月", "4月"]
sales = [120, 135, 128, 142]

# zip 配对遍历
for m, s in zip(months, sales):
    print(f"{m}销售额：{s}万元")</code></pre>

<h3>知识点 8：嵌套循环</h3>
<p>多月份多费用项目预算计算：</p>
<pre><code>months = ["Q1", "Q2", "Q3", "Q4"]
expenses = ["人工费", "材料费", "管理费"]

for m in months:
    for e in expenses:
        print(f"{m} - {e}预算编制中...")
    print("-" * 30)</code></pre>

<h3>知识点 9：break 与 continue</h3>
<pre><code># 查找第一个亏损月份
profits = [12, 15, -3, 8, -5, 10]
for i, p in enumerate(profits):
    if p < 0:
        print(f"第{i+1}个月出现亏损：{p}万元")
        break  # 找到第一个即停止

# 跳过已审计科目
for subject in subjects:
    if subject == "银行存款":
        continue  # 跳过本次循环
    print(f"审计：{subject}")</code></pre>

<div class="warn-box">
<strong>重点场景：</strong>结合 EVA 绩效考核、折旧计算等财务场景，理解不同流程控制结构的适用条件。
</div>
`,
                    quiz: [
                        { id: 'p1-t3-q1', question: '以下代码的输出是什么？\n<code>x = 15\nif x > 10:\n    print("A")\nelif x > 5:\n    print("B")\nelse:\n    print("C")</code>', type: 'single', options: ['A', 'B', 'C', 'A和B'], answer: 0, explain: '条件满足后即执行对应分支，不会继续判断 elif。' },
                        { id: 'p1-t3-q2', question: 'while 循环和 for 循环的主要区别是？', type: 'single', options: ['while 只能用于数值，for 只能用于序列', 'while 条件控制，for 遍历序列', 'while 更快，for 更慢', '没有区别'], answer: 1, explain: 'while 根据条件判断是否继续，for 用于遍历可迭代对象。' },
                        { id: 'p1-t3-q3', question: '以下哪个语句用于立即终止当前循环？', type: 'single', options: ['continue', 'break', 'pass', 'return'], answer: 1, explain: 'break 语句用于完全终止循环，continue 是跳过本次继续下一次。' },
                        { id: 'p1-t3-q4', question: '在双倍余额递减法中，账面净值随着折旧逐年（）。', type: 'single', options: ['递增', '递减', '不变', '先增后减'], answer: 1, explain: '双倍余额递减法每年按固定比例计提折旧，账面净值逐年递减。' }
                    ]
                },
                {
                    id: 'p1-t4',
                    title: '任务四：函数及变量',
                    tags: [],
                    content: `
<!--STORY-->
<h3>知识点 1：内置函数简介</h3>
<p>Python 提供了丰富的内置函数，如 <code>print()</code>、<code>len()</code>、<code>sum()</code>、<code>max()</code>、<code>min()</code>、<code>round()</code>、<code>abs()</code> 等。</p>

<h3>知识点 2：自定义函数 def 与 return</h3>
<p>将折旧计算封装为函数：</p>
<pre><code>def calculate_depreciation(cost, salvage, life, method="straight"):
    """
    计算折旧额
    method: straight(直线法) 或 double(双倍余额递减法)
    """
    if method == "straight":
        return (cost - salvage) / life
    elif method == "double":
        return cost * (2 / life)
    else:
        return 0

# 调用函数（恒信制造固定资产原值750万元，残值15万元，使用年限5年）
dep = calculate_depreciation(7500000, 150000, 5, "straight")
print(f"年折旧额：{dep:.2f}")</code></pre>

<h3>知识点 3：函数的形参与实参</h3>
<p>摊余成本计算函数：</p>
<pre><code>def amortized_cost(principal, rate, periods):
    """计算债券摊余成本"""
    balance = principal
    schedule = []
    for p in range(1, periods + 1):
        interest = balance * rate
        # 简化：只付息不还本
        schedule.append({
            "期数": p,
            "期初余额": round(balance, 2),
            "利息": round(interest, 2)
        })
    return schedule

result = amortized_cost(1000000, 0.05, 3)
for row in result:
    print(row)</code></pre>

<h3>知识点 4：匿名函数 lambda 与三元运算符</h3>
<pre><code># lambda 快速定义简单函数
tax = lambda amount: amount * 0.13 if amount > 50000 else amount * 0.06
print(tax(80000))

# 三元运算符
status = "盈利" if revenue > cost else "亏损"
</code></pre>

<h3>知识点 5：函数在财务批量计算中的优势</h3>
<p>将重复逻辑封装为函数，可大幅提高代码复用率和可维护性。在财务批量处理中，函数可以统一计算口径、减少人为错误。</p>
`,
                    quiz: [
                        { id: 'p1-t4-q1', question: '函数定义必须使用哪个关键字？', type: 'single', options: ['func', 'function', 'def', 'define'], answer: 2, explain: 'Python 使用 def 关键字定义函数。' },
                        { id: 'p1-t4-q2', question: 'lambda 函数的特点是什么？', type: 'single', options: ['只能有一个参数', '是匿名函数，用于简单表达式', '执行速度更快', '只能返回数值'], answer: 1, explain: 'lambda 是匿名函数，适合定义简单的单行函数。' }
                    ]
                }
            ]
        },
        {
            id: 'p2',
            title: '项目二：经济管理大数据获取',
            desc: '为撰写 IPO 招股书行业对比章节，通过 Tushare 和爬虫获取同行业可比公司数据',
            tags: [],
            tasks: [
                {
                    id: 'p2-t1',
                    title: '任务一：利用常规渠道获取',
                    tags: [],
                    content: `
<!--STORY-->
<h3>知识点 1：企业财务数据的常见来源</h3>
<ul>
<li><strong>官方渠道：</strong>上交所、深交所、巨潮资讯网</li>
<li><strong>财经数据平台：</strong>Tushare、AKShare、Baostock</li>
<li><strong>数据库：</strong>Wind、Choice、CSMAR</li>
<li><strong>企业官网：</strong>投资者关系栏目定期发布的财报</li>
</ul>

<h3>知识点 2-3：Tushare 财经数据接口</h3>
<p>Tushare 是一个免费、开源的 Python 财经数据接口包。使用步骤：</p>
<ol>
<li>访问 tushare.pro 注册账号，获取 Token</li>
<li>安装库：<code>pip install tushare</code></li>
<li>初始化并调用接口</li>
</ol>
<pre><code>import tushare as ts

# 初始化（需替换为你的 Token）
pro = ts.pro_api('your_token_here')

# 获取同行业可比公司日线行情（恒信制造所属行业：通用设备制造）
df = pro.daily(ts_code='000001.SZ', start_date='20200101', end_date='20201231')
print(df.head())</code></pre>

<h3>知识点 4：金融数据接口的使用场景与局限</h3>
<div class="warn-box">
<strong>使用场景：</strong>快速获取标准化行情数据、财务指标数据<br>
<strong>局限：</strong>需要网络连接；有调用频率限制；历史数据可能不完整；定制化需求难以满足
</div>
`,
                    quiz: [
                        { id: 'p2-t1-q1', question: '以下哪个不是常用的 Python 财经数据接口？', type: 'single', options: ['Tushare', 'AKShare', 'Pyecharts', 'Baostock'], answer: 2, explain: 'Pyecharts 是可视化库，不是数据接口。' },
                        { id: 'p2-t1-q2', question: '使用 Tushare Pro 接口前必须获取什么？', type: 'single', options: ['用户名和密码', 'API Token', 'VIP 会员', '实名认证'], answer: 1, explain: 'Tushare Pro 需要通过 Token 进行身份验证和权限管理。' }
                    ]
                },
                {
                    id: 'p2-t2',
                    title: '任务二：利用爬虫技术获取',
                    tags: ['key','difficulty','core'],
                    content: `
<!--STORY-->
<h3>知识点 1：爬虫概念与基本工作流程</h3>
<p>网络爬虫（Web Crawler）是自动抓取网页信息的程序。基本流程：</p>
<ol>
<li>确定目标 URL</li>
<li>发送 HTTP 请求获取网页内容</li>
<li>解析 HTML 提取所需数据</li>
<li>清洗、存储数据</li>
</ol>

<h3>知识点 2：HTTP 协议与 URL 结构</h3>
<p>URL 格式：<code>协议://域名:端口/路径?查询参数#锚点</code></p>
<p>常用 HTTP 方法：GET（获取资源）、POST（提交数据）</p>

<h3>知识点 3-4：Requests 库与 Response 对象</h3>
<pre><code>import requests

# 发送 GET 请求
url = "https://www.example.com/finance.html"
response = requests.get(url, timeout=10)

# Response 常用属性
print(response.status_code)   # HTTP 状态码 200 表示成功
print(response.encoding)      # 编码方式
print(response.text)          # 文本内容
print(response.content)       # 二进制内容</code></pre>

<h3>知识点 5：文件保存方法</h3>
<pre><code># 保存文本文件
with open("report.html", "w", encoding="utf-8") as f:
    f.write(response.text)

# 保存二进制文件（如 PDF 财报）
pdf_url = "https://example.com/report.pdf"
r = requests.get(pdf_url)
with open("report.pdf", "wb") as f:
    f.write(r.content)</code></pre>

<h3>知识点 6：try…except 异常处理</h3>
<pre><code>try:
    r = requests.get(url, timeout=10)
    r.raise_for_status()  # 如果状态码不是 200，抛出异常
except requests.exceptions.RequestException as e:
    print(f"请求失败：{e}")
except Exception as e:
    print(f"其他错误：{e}")
finally:
    print("请求处理完成")</code></pre>

<h3>知识点 7：自定义爬虫函数封装</h3>
<pre><code>import requests
import os

def download_report(url, filename, folder="reports"):
    """下载上市公司财报"""
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    try:
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        
        filepath = os.path.join(folder, filename)
        with open(filepath, "wb") as f:
            f.write(r.content)
        print(f"下载成功：{filepath}")
        return True
    except Exception as e:
        print(f"下载失败：{e}")
        return False

# 批量下载
urls = [
    ("https://example.com/2019_report.pdf", "2019年报.pdf"),
    ("https://example.com/2020_report.pdf", "2020年报.pdf"),
]
for url, name in urls:
    download_report(url, name)</code></pre>

<h3>知识点 8：爬虫合规与伦理注意事项</h3>
<div class="warn-box">
<strong>合规原则：</strong>
<ul>
<li>遵守网站的 robots.txt 协议</li>
<li>控制请求频率，避免对服务器造成压力</li>
<li>不抓取个人隐私数据</li>
<li>仅用于学习研究，不用于商业牟利</li>
<li>尊重数据版权，注明数据来源</li>
</ul>
</div>
`,
                    quiz: [
                        { id: 'p2-t2-q1', question: 'HTTP 状态码 200 表示什么？', type: 'single', options: ['服务器错误', '请求成功', '未授权', '重定向'], answer: 1, explain: '200 OK 表示请求已成功处理。' },
                        { id: 'p2-t2-q2', question: '保存二进制文件时应使用哪种模式？', type: 'single', options: ['"w"', '"wb"', '"r"', '"a"'], answer: 1, explain: '"wb" 表示以二进制写入模式打开文件。' },
                        { id: 'p2-t2-q3', question: '以下哪项不是爬虫合规要求？', type: 'single', options: ['遵守 robots.txt', '控制请求频率', '使用多线程无限并发', '尊重数据版权'], answer: 2, explain: '无限并发会对目标服务器造成过大压力，属于不道德行为。' },
                        { id: 'p2-t2-q4', question: 'requests.get() 的 timeout 参数作用是什么？', type: 'single', options: ['限制下载文件大小', '设置请求超时时间', '限制重试次数', '设置请求头'], answer: 1, explain: 'timeout 参数指定等待服务器响应的最长时间（秒）。' }
                    ]
                }
            ]
        },
        {
            id: 'p3',
            title: '项目三：经济管理大数据预处理',
            desc: '清洗从 ERP 导出的原始财务数据，处理缺失值、重复值和异常字符',
            tags: [],
            tasks: [
                {
                    id: 'p3-t1',
                    title: '任务一：认识 Pandas',
                    tags: ['key'],
                    content: `
<!--STORY-->
<h3>知识点 1：NumPy 数组基础</h3>
<pre><code>import numpy as np

arr = np.array([120, 135, 128, 142])
print(arr.mean())   # 平均数
print(arr.sum())    # 求和
print(arr.std())    # 标准差</code></pre>

<h3>知识点 2-4：Series 与 DataFrame</h3>
<pre><code>import pandas as pd

# Series 一维数据结构
s = pd.Series([100000, 2960000, 5180000], index=["库存现金", "银行存款", "应收账款"])

# DataFrame 二维数据结构（财务表格）
df = pd.DataFrame({
    "科目": ["库存现金", "银行存款", "应收账款"],
    "借方余额": [100000, 2960000, 5180000],
    "贷方余额": [0, 0, 0]
})
print(df.shape)   # (3, 3)
print(df.columns) # 列名
print(df.dtypes)  # 数据类型

# 资产负债率计算（恒信制造2020年末）
assets = <!--CODE_DATA:totalAssets2020-->
liabilities = <!--CODE_DATA:totalLiabilities2020-->
debt_ratio = liabilities / assets
print(f"资产负债率：{debt_ratio:.2%}")</code></pre>

<h3>知识点 5-6：文件读写</h3>
<pre><code># 读取 Excel
df = pd.read_excel("finance_data.xlsx", sheet_name="资产负债表")

# 读取 CSV
df = pd.read_csv("finance_data.csv", encoding="utf-8")

# 写入 Excel
with pd.ExcelWriter("output.xlsx") as writer:
    df1.to_excel(writer, sheet_name="Sheet1", index=False)
    df2.to_excel(writer, sheet_name="Sheet2", index=False)</code></pre>
`,
                    quiz: [
                        { id: 'p3-t1-q1', question: 'Pandas 中二维表格数据结构是？', type: 'single', options: ['Series', 'DataFrame', 'Array', 'List'], answer: 1, explain: 'DataFrame 是 Pandas 的二维表格数据结构，类似 Excel 表格。' },
                        { id: 'p3-t1-q2', question: '读取 Excel 多工作表应使用哪个类？', type: 'single', options: ['pd.read_excel', 'pd.ExcelWriter', 'pd.DataFrame', 'pd.concat'], answer: 1, explain: 'ExcelWriter 用于将多个 DataFrame 写入同一个 Excel 文件的不同工作表。' }
                    ]
                },
                {
                    id: 'p3-t2',
                    title: '任务二：数据筛选与查询',
                    tags: ['key'],
                    content: `
<!--STORY-->
<h3>知识点 1：直接筛选</h3>
<pre><code># 单列
df["科目名称"]

# 多列
df[["科目名称", "借方余额"]]

# 行切片
df[0:5]  # 前5行</code></pre>

<h3>知识点 2：条件筛选</h3>
<pre><code># 单条件：余额大于10万的科目
df[df["借方余额"] > 100000]

# 多条件：余额大于5万且小于20万
(df["借方余额"] > 50000) & (df["借方余额"] < 200000)

# 或条件
df[(df["科目类型"] == "资产") | (df["科目类型"] == "负债")]

# 非条件
df[~(df["借方余额"] == 0)]</code></pre>

<h3>知识点 3-4：loc 与 iloc 索引器</h3>
<pre><code># loc 按标签索引
df.loc[0:3, ["科目", "借方余额"]]
df.loc[df["借方余额"] > 100000, "科目"]

# iloc 按位置索引
df.iloc[0:5, 0:2]  # 前5行，前2列</code></pre>

<h3>知识点 5：map、apply、applymap</h3>
<pre><code># map：对 Series 逐元素映射
df["科目编码"] = df["科目"].map({"现金": "1001", "银行": "1002"})

# apply：对行或列应用函数
df["借方余额"].apply(lambda x: f"{x/10000:.1f}万")

# applymap：对 DataFrame 所有元素
# df.applymap(func)</code></pre>

<h3>知识点 6：财务场景应用</h3>
<pre><code># 净利率计算与业绩打标
df["净利率"] = df["净利润"] / df["营业收入"]
df["业绩等级"] = df["净利率"].apply(
    lambda x: "优秀" if x > 0.2 else "良好" if x > 0.1 else "一般"
)</code></pre>
`,
                    quiz: [
                        { id: 'p3-t2-q1', question: '同时满足多个条件筛选应使用哪个运算符？', type: 'single', options: ['|', '&', '~', '^'], answer: 1, explain: '& 表示逻辑与，| 表示逻辑或，~ 表示逻辑非。' },
                        { id: 'p3-t2-q2', question: 'loc 和 iloc 的主要区别是？', type: 'single', options: ['loc 按位置，iloc 按标签', 'loc 按标签，iloc 按位置', 'loc 只能取行，iloc 只能取列', '没有区别'], answer: 1, explain: 'loc 使用标签索引，iloc 使用整数位置索引。' }
                    ]
                },
                {
                    id: 'p3-t3',
                    title: '任务三：数据清洗与处理',
                    tags: ['key','difficulty','core'],
                    content: `
<!--STORY-->
<h3>知识点 1：数据清洗的内容与意义</h3>
<p>原始财务数据常存在<strong>缺失值、重复值、异常字符、格式不统一</strong>等问题，清洗是数据分析的必要前置步骤。</p>

<h3>知识点 2：重复值处理</h3>
<pre><code># 检测重复行
df.duplicated().sum()

# 删除重复行
df_clean = df.drop_duplicates()

# 按指定列去重
df.drop_duplicates(subset=["凭证号"], keep="first")</code></pre>

<h3>知识点 3-4：缺失值检测与处理</h3>
<pre><code># 检测缺失值
print(df.isna().sum())

# 删除含缺失值的行
df.dropna()

# 填充缺失值
df["金额"].fillna(0, inplace=True)           # 用0填充
df["金额"].fillna(df["金额"].mean(), inplace=True)  # 用均值填充

# 前向填充
df.fillna(method="ffill", inplace=True)</code></pre>

<h3>知识点 5：异常字符处理</h3>
<pre><code># 替换特殊符号
df["金额"] = df["金额"].str.replace(",", "")
df["金额"] = df["金额"].str.replace("￥", "")

# 去除空格
df["科目"] = df["科目"].str.strip()

# 大小写统一
df["科目"] = df["科目"].str.upper()</code></pre>

<h3>知识点 6：数据类型转换</h3>
<pre><code># 金额转为数值型
df["金额"] = df["金额"].astype(float)

# 日期转换
df["日期"] = pd.to_datetime(df["日期"])

# 类别型（节省内存）
df["科目类型"] = df["科目类型"].astype("category")</code></pre>

<h3>知识点 7：综合案例——恒信制造 ERP 数据清洗</h3>
<p>以下是从恒信制造 ERP 系统导出的原始凭证数据，包含多种常见的数据质量问题：</p>
<!--TABLE:vouchersDirty-->

<pre><code>def clean_finance_data(df):
    """财务数据清洗完整流程"""
    # 1. 去重
    df = df.drop_duplicates()
    
    # 2. 处理缺失值
    df = df.dropna(subset=["凭证号", "金额"])
    
    # 3. 清洗金额列
    df["金额"] = df["金额"].astype(str).str.replace(",", "").str.replace("￥", "")
    df["金额"] = pd.to_numeric(df["金额"], errors="coerce")
    df["金额"].fillna(0, inplace=True)
    
    # 4. 类型转换
    df["日期"] = pd.to_datetime(df["日期"], errors="coerce")
    
    # 5. 去除空格
    df["摘要"] = df["摘要"].astype(str).str.strip()
    
    return df</code></pre>

<p>清洗后的标准数据如下：</p>
<!--TABLE:vouchersClean-->
`,
                    quiz: [
                        { id: 'p3-t3-q1', question: '删除 DataFrame 中完全重复的行应使用？', type: 'single', options: ['df.dropna()', 'df.drop_duplicates()', 'df.unique()', 'df.remove()'], answer: 1, explain: 'drop_duplicates() 用于删除重复行，dropna() 用于删除缺失值。' },
                        { id: 'p3-t3-q2', question: '将字符串金额 "1,234.56" 转为数值，需要先？', type: 'single', options: ['直接 astype(float)', '先去除逗号再转换', '先乘以100', '无法转换'], answer: 1, explain: '字符串中的逗号会阻碍数值转换，需先去除。' },
                        { id: 'p3-t3-q3', question: 'pd.to_numeric(errors="coerce") 中 coerce 的作用？', type: 'single', options: ['四舍五入', '无法转换时设为 NaN', '忽略错误', '强制整数'], answer: 1, explain: 'coerce 将无效解析设为 NaN，便于后续统一处理。' }
                    ]
                }
            ]
        },
        {
            id: 'p4',
            title: '项目四：经济管理大数据分析',
            desc: '基于清洗后的恒信制造 2019-2020 年度财务数据，完成描述性统计与四大能力分析',
            tags: [],
            tasks: [
                {
                    id: 'p4-t1',
                    title: '任务一：经济管理数据特征分析',
                    tags: ['key'],
                    content: `
<!--STORY-->
<h3>知识点 1：常用统计函数</h3>
<pre><code>import pandas as pd

df = pd.DataFrame({
    "月份": ["2019-01", "2019-02", "2019-03", "2019-04", "2019-05", "2019-06"],
    "营收(万元)": [82.0, 75.6, 91.0, 94.5, 102.0, 108.0]
})

print(df["营收(万元)"].sum())      # 求和
print(df["营收(万元)"].mean())     # 平均数
print(df["营收(万元)"].min())      # 最小值
print(df["营收(万元)"].max())      # 最大值
print(df["营收(万元)"].median())   # 中位数
print(df["营收(万元)"].std())      # 标准差
print(df["营收(万元)"].var())      # 方差</code></pre>

<p>恒信制造 2019-2020 年 24 个月完整月度营收数据：</p>
<!--TABLE:monthlyRevenue-->

<h3>知识点 2：describe 描述性统计摘要</h3>
<pre><code># 一键生成统计摘要
print(df["营收"].describe())

# 结果包含：count, mean, std, min, 25%, 50%, 75%, max</code></pre>

<h3>知识点 3：pct_change 环比增长率</h3>
<pre><code>df["环比增长率"] = df["营收"].pct_change()
print(df)
# 结果：NaN, 0.125, -0.0518, 0.109, 0.0915, 0.0322</code></pre>

<h3>知识点 4：cumsum 累计发生额</h3>
<pre><code>df["累计营收"] = df["营收"].cumsum()
print(df)</code></pre>

<h3>知识点 5：数据排序</h3>
<pre><code># 按营收降序
df.sort_values("营收", ascending=False)

# 按索引排序
df.sort_index()</code></pre>

<h3>知识点 6：财务场景</h3>
<pre><code># 年度营收统计
annual = df.groupby("年份")["营收"].sum()

# 月度环比分析
df["环比"] = df["营收"].pct_change()
print(df[["月份", "营收", "环比"]])</code></pre>
`,
                    quiz: [
                        { id: 'p4-t1-q1', question: '计算序列环比增长率应使用哪个方法？', type: 'single', options: ['diff()', 'pct_change()', 'cumsum()', 'shift()'], answer: 1, explain: 'pct_change() 计算当前元素与前一元素的百分比变化，即环比增长率。' },
                        { id: 'p4-t1-q2', question: 'describe() 默认不包含以下哪个统计量？', type: 'single', options: ['均值', '方差', '中位数', '标准差'], answer: 1, explain: 'describe() 输出 count/mean/std/min/25%/50%/75%/max，不直接输出方差(var)。' }
                    ]
                },
                {
                    id: 'p4-t2',
                    title: '任务二：经济管理数据分类统计分析',
                    tags: ['key','difficulty','core'],
                    content: `
<!--STORY-->
<h3>知识点 1-2：groupby 与 agg</h3>
<pre><code># 按年度分组统计
import pandas as pd

df = pd.DataFrame({
    "年份": [2019, 2019, 2020, 2020],
    "季度": ["Q1", "Q2", "Q1", "Q2"],
    "营收(万元)": [500, 550, 600, 650],
    "成本(万元)": [300, 320, 350, 360]
})

# 基础分组统计
print(df.groupby("年份")["营收(万元)"].sum())

# 多聚合函数
print(df.groupby("年份").agg({
    "营收(万元)": ["sum", "mean", "max"],
    "成本(万元)": ["sum", "mean"]
}))</code></pre>

<p>恒信制造 2019-2020 年度利润表：</p>
<!--TABLE:incomeStatement-->

<h3>知识点 3：按年度、季度分类统计</h3>
<pre><code># 多级分组
result = df.groupby(["年份", "季度"])["营收"].sum()
print(result)

# 年度对比
yearly = df.groupby("年份").agg({
    "营收": "sum",
    "成本": "sum"
})
yearly["毛利率"] = (yearly["营收"] - yearly["成本"]) / yearly["营收"]
print(yearly)</code></pre>

<h3>知识点 4：多维度交叉分析</h3>
<pre><code># 透视表：行列交叉分析
pivot = pd.pivot_table(df, values="营收", index="年份", columns="季度", aggfunc="sum")
print(pivot)</code></pre>

<h3>知识点 5：财务指标体系构建</h3>
<pre><code>def calculate_financial_indicators(df):
    """计算四大能力核心指标"""
    indicators = {}
    
    # 盈利能力
    indicators["毛利率"] = (df["营收"] - df["成本"]) / df["营收"]
    indicators["净利率"] = df["净利润"] / df["营收"]
    indicators["ROE"] = df["净利润"] / df["净资产"]
    
    # 偿债能力
    indicators["资产负债率"] = df["负债"] / df["资产"]
    indicators["流动比率"] = df["流动资产"] / df["流动负债"]
    
    # 营运能力
    indicators["总资产周转率"] = df["营收"] / df["资产"]
    
    return pd.DataFrame(indicators)</code></pre>
`,
                    quiz: [
                        { id: 'p4-t2-q1', question: 'groupby 后接哪个方法可同时应用多个聚合函数？', type: 'single', options: ['sum()', 'agg()', 'apply()', 'transform()'], answer: 1, explain: 'agg() 允许传入字典，对不同的列应用不同的聚合函数。' },
                        { id: 'p4-t2-q2', question: '毛利率的计算公式是？', type: 'single', options: ['净利润/营收', '(营收-成本)/营收', '营收/成本', '净利润/成本'], answer: 1, explain: '毛利率 = (营业收入 - 营业成本) / 营业收入。' }
                    ]
                }
            ]
        },
        {
            id: 'p5',
            title: '项目五：经济管理大数据可视化',
            desc: '为董事会汇报制作恒信制造经营数据可视化图表集与交互式 HTML 看板',
            tags: [],
            tasks: [
                {
                    id: 'p5-t1',
                    title: '任务一：编制经济管理数据可视化图表',
                    tags: ['key','difficulty','core'],
                    content: `
<!--STORY-->
<h3>知识点 1-3：Matplotlib 基础</h3>
<pre><code>import matplotlib.pyplot as plt

# 中文显示设置
plt.rcParams["font.sans-serif"] = ["SimHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

# 画布与子图
fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# 折线图：恒信制造月度营收趋势
months = ["1月", "2月", "3月", "4月", "5月", "6月"]
revenue = <!--CODE_DATA:monthlyRevenue2020List-->
axes[0,0].plot(months, revenue, marker="o", color="#2563eb")
axes[0,0].set_title("恒信制造2020上半年月度营收趋势")
axes[0,0].set_ylabel("万元")

# 柱状图：多费用项目对比
expenses = <!--CODE_DATA:expenseCategories-->
amounts = <!--CODE_DATA:expenseAmounts-->
axes[0,1].bar(expenses[:4], amounts[:4], color=["#2563eb", "#16a34a", "#d97706", "#dc2626"])
axes[0,1].set_title("费用项目对比")

# 饼图：成本结构占比
axes[1,0].pie(amounts, labels=expenses, autopct="%1.1f%%")
axes[1,0].set_title("恒信制造2020年费用结构占比")

plt.tight_layout()
plt.show()</code></pre>

<h3>知识点 7：Pandas 内置 plot</h3>
<pre><code>df.plot(x="月份", y="营收", kind="line", title="营收趋势")
df.plot(y="营收", kind="bar", title="营收柱状图")</code></pre>

<h3>知识点 8-10：Pyecharts 简介与图表</h3>
<pre><code>from pyecharts.charts import Bar, Pie, Line
from pyecharts import options as opts

# Pyecharts 柱状图
bar = Bar()
bar.add_xaxis(["1月", "2月", "3月", "4月", "5月", "6月"])
bar.add_yaxis("营收(万元)", <!--CODE_DATA:monthlyRevenue2020List-->)
bar.set_global_opts(title_opts=opts.TitleOpts(title="恒信制造2020上半年月度营收"))
bar.render("bar_chart.html")

# 全局配置项：标题、图例、坐标轴、工具箱
bar.set_global_opts(
    title_opts=opts.TitleOpts(title="营收分析", subtitle="2020年"),
    legend_opts=opts.LegendOpts(pos_top="5%"),
    toolbox_opts=opts.ToolboxOpts(),
    xaxis_opts=opts.AxisOpts(name="月份"),
    yaxis_opts=opts.AxisOpts(name="金额（万元）")
)</code></pre>
`,
                    quiz: [
                        { id: 'p5-t1-q1', question: 'Matplotlib 中设置中文字体是为了解决什么问题？', type: 'single', options: ['提高分辨率', '防止中文标签显示为方框', '加快渲染速度', '减小文件体积'], answer: 1, explain: 'Matplotlib 默认字体不支持中文，需要手动设置中文字体。' },
                        { id: 'p5-t1-q2', question: '以下哪种图表最适合展示占比关系？', type: 'single', options: ['折线图', '柱状图', '饼图', '散点图'], answer: 2, explain: '饼图通过扇形面积直观展示各部分占总体的比例。' }
                    ]
                },
                {
                    id: 'p5-t2',
                    title: '任务二：优化经济管理数据可视化图表',
                    tags: [],
                    content: `
<!--STORY-->
<h3>知识点 1-2：Pyecharts 系列配置与主题</h3>
<pre><code>from pyecharts.globals import ThemeType

bar = Bar(init_opts=opts.InitOpts(theme=ThemeType.LIGHT))
bar.set_series_opts(
    label_opts=opts.LabelOpts(is_show=True, position="top"),
    itemstyle_opts=opts.ItemStyleOpts(color="#2563eb")
)</code></pre>

<h3>知识点 3：组合图形</h3>
<pre><code>from pyecharts.charts import Grid, Page, Tab

# Grid 并行多图
grid = Grid()
grid.add(bar, grid_opts=opts.GridOpts(pos_left="5%", pos_right="55%"))
grid.add(line, grid_opts=opts.GridOpts(pos_left="55%", pos_right="5%"))

# Page 顺序多图
page = Page()
page.add(bar, pie, line)

# Tab 选项卡
tab = Tab()
tab.add(bar, "营收")
tab.add(pie, "占比")</code></pre>

<h3>知识点 4：时间线轮播图</h3>
<pre><code>from pyecharts.charts import Timeline

timeline = Timeline()
for year in [2019, 2020]:
    bar = Bar()
    # ... 添加数据
    timeline.add(bar, str(year))
timeline.render("timeline.html")</code></pre>

<h3>知识点 5：财务看板设计原则</h3>
<div class="highlight-box">
<strong>看板设计原则：</strong>
<ul>
<li>核心指标置顶，一目了然</li>
<li>图表类型与数据特征匹配</li>
<li>颜色统一，避免花哨</li>
<li>保留交互功能（筛选、下钻）</li>
<li>响应式布局，适配不同屏幕</li>
</ul>
</div>
`,
                    quiz: [
                        { id: 'p5-t2-q1', question: 'Pyecharts 中用于在同一页面展示多个独立图表的类是？', type: 'single', options: ['Grid', 'Page', 'Tab', 'Timeline'], answer: 1, explain: 'Page 用于顺序排列多个独立图表在一个 HTML 页面中。' }
                    ]
                }
            ]
        },
        {
            id: 'p6',
            title: '项目六：经济管理大数据综合分析',
            desc: '整合前五个项目成果，编制《恒信制造 2019-2020 年度经营数据分析报告》',
            tags: ['key','difficulty','core'],
            tasks: [
                {
                    id: 'p6-t1',
                    title: '综合任务：全流程实战',
                    tags: ['key','difficulty','core'],
                    content: `
<!--STORY-->
<h3>综合任务 1：数据获取</h3>
<p>获取恒信制造有限公司 2019-2020 年财务原始数据，包括资产负债表、利润表、现金流量表。你可以直接从本页下载数据文件，然后在 Python 中读取分析。</p>

<p>资产负债表（2019-2020年末对比）：</p>
<!--TABLE:balanceSheet2019-->

<p>利润表（2019-2020年度）：</p>
<!--TABLE:incomeStatement-->

<p>现金流量表（2020年度）：</p>
<!--TABLE:cashFlow2020-->

<pre><code>import pandas as pd

# 读取本地财务数据（请先下载上方CSV/Excel文件）
bs = pd.read_excel("恒信制造_资产负债表.xlsx")
pl = pd.read_excel("恒信制造_利润表.xlsx")
cf = pd.read_excel("恒信制造_2020年现金流量表.xlsx")</code></pre>

<h3>综合任务 2：数据清洗</h3>
<pre><code>def clean_finance_table(df):
    """清洗财务报表"""
    # 去除空行
    df = df.dropna(how="all")
    # 去除合计行中的重复
    df = df.drop_duplicates(subset=["项目"])
    # 金额列转数值
    for col in df.columns:
        if "金额" in col or "元" in col:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df

bs2019 = clean_finance_table(bs2019)
bs2020 = clean_finance_table(bs2020)</code></pre>

<h3>综合任务 3：指标计算</h3>
<pre><code># 盈利能力指标（基于恒信制造2020年利润表）
net_profit = <!--CODE_DATA:netProfit2020-->
revenue = <!--CODE_DATA:annualRevenue2020-->
net_margin = net_profit / revenue
print(f"2020年净利率：{net_margin:.2%}")

# 偿债能力指标（基于2020年末资产负债表）
total_assets = <!--CODE_DATA:totalAssets2020-->
total_liabilities = <!--CODE_DATA:totalLiabilities2020-->
debt_ratio = total_liabilities / total_assets
print(f"2020年资产负债率：{debt_ratio:.2%}")

# 营运能力指标
total_asset_turnover = revenue / total_assets
print(f"总资产周转率：{total_asset_turnover:.2f}")

# 发展能力指标
roe = <!--CODE_DATA:roe2020-->
print(f"净资产收益率(ROE)：{roe:.2%}")</code></pre>

<h3>综合任务 4：统计分析</h3>
<pre><code># 年度对比
comparison = pd.DataFrame({
    "2019年": [bs2019_revenue, bs2019_profit],
    "2020年": [revenue, net_profit]
}, index=["营业收入", "净利润"])
comparison["同比增长"] = comparison["2020年"] / comparison["2019年"] - 1
print(comparison)</code></pre>

<h3>综合任务 5：可视化呈现</h3>
<pre><code>from pyecharts.charts import Bar, Line, Page
from pyecharts import options as opts

# 营收利润对比图
bar = Bar()
bar.add_xaxis(["2019年", "2020年"])
bar.add_yaxis("营业收入", [bs2019_revenue/10000, revenue/10000])
bar.add_yaxis("净利润", [bs2019_profit/10000, net_profit/10000])
bar.set_global_opts(title_opts=opts.TitleOpts(title="营收利润年度对比"))

# 指标雷达图（略）

page = Page()
page.add(bar)
page.render("hengxin_dashboard.html")</code></pre>

<h3>综合任务 6：分析结论</h3>
<div class="highlight-box">
<strong>报告撰写要点：</strong>
<ul>
<li><strong>经营评价：</strong>基于计算出的财务指标，评价企业整体经营状况</li>
<li><strong>趋势分析：</strong>对比两年数据，分析增长趋势与变化原因</li>
<li><strong>问题识别：</strong>找出异常指标，如资产负债率过高、周转率过低等</li>
<li><strong>改进建议：</strong>针对识别出的问题提出具体的经营改进措施</li>
</ul>
</div>
`,
                    quiz: [
                        { id: 'p6-t1-q1', question: '在综合分析项目中，数据清洗的第一步通常是？', type: 'single', options: ['数据可视化', '去除空行和重复数据', '指标计算', '撰写报告'], answer: 1, explain: '数据清洗是分析的基础，通常先去除空行和重复数据。' }
                    ]
                }
            ]
        }
    ],

    // 单元综合测试题库
    unitTests: {
        p1: {
            title: '项目一综合测试：Python 基础与环境搭建',
            duration: 20,
            questions: [
                { id: 'p1-ex1', type: 'single', question: 'Python 中，以下哪个不是合法的数据类型？', options: ['int', 'str', 'array', 'bool'], answer: 2 },
                { id: 'p1-ex2', type: 'single', question: '表达式 10 / 3 的结果是？', options: ['3', '3.33', '3.3333333333333335', '1'], answer: 2 },
                { id: 'p1-ex3', type: 'single', question: '以下哪个函数用于获取用户输入？', options: ['print()', 'input()', 'scanf()', 'read()'], answer: 1 },
                { id: 'p1-ex4', type: 'single', question: '列表推导式 [x*2 for x in range(3)] 的结果是？', options: ['[0,1,2]', '[0,2,4]', '[2,4,6]', '[1,2,3]'], answer: 1 },
                { id: 'p1-ex5', type: 'single', question: '函数定义中，return 语句的作用是？', options: ['终止程序', '返回函数执行结果', '输出到控制台', '定义变量'], answer: 1 },
                { id: 'p1-ex6', type: 'judge', question: 'Python 中列表（list）是不可变数据类型。', options: ['对', '错'], answer: 1 },
                { id: 'p1-ex7', type: 'judge', question: 'elif 是 else if 的简写，用于多分支判断。', options: ['对', '错'], answer: 0 },
                { id: 'p1-ex8', type: 'judge', question: 'lambda 函数可以有多个语句和复杂的逻辑。', options: ['对', '错'], answer: 1 },
                { id: 'p1-ex9', type: 'codefill', question: '补全代码：计算毛利率\nrevenue = 1000000\ncost = 600000\nmargin = (______ - ______) / ______\nprint(f"毛利率：{margin:.2%}")', answer: 'revenue,cost,revenue', fillCount: 3 },
                { id: 'p1-ex10', type: 'codefill', question: '补全代码：使用 for 循环计算累计折旧\ncost = 100000\nlife = 5\ntotal = 0\nfor year in range(1, ______):\n    dep = cost / life\n    total += dep\n    print(f"第{year}年折旧：{dep}")\nprint(f"累计折旧：{total}")', answer: 'life+1', fillCount: 1 }
            ]
        },
        p2: {
            title: '项目二综合测试：数据获取',
            duration: 20,
            questions: [
                { id: 'p2-ex1', type: 'single', question: 'HTTP 协议中，用于获取资源的请求方法是？', options: ['POST', 'GET', 'PUT', 'DELETE'], answer: 1 },
                { id: 'p2-ex2', type: 'single', question: 'requests.get() 返回的对象类型是？', options: ['str', 'dict', 'Response', 'list'], answer: 2 },
                { id: 'p2-ex3', type: 'single', question: '保存文件时，"wb" 模式表示？', options: ['写入文本', '写入二进制', '追加文本', '读取二进制'], answer: 1 },
                { id: 'p2-ex4', type: 'judge', question: '爬虫可以无限制地高频率访问任意网站。', options: ['对', '错'], answer: 1 },
                { id: 'p2-ex5', type: 'codefill', question: '补全爬虫代码：\nimport requests\nurl = "https://example.com/report.html"\ntry:\n    r = requests.get(url, ______=10)\n    r.raise_for_status()\n    with open("report.html", "w", encoding="utf-8") as f:\n        f.write(r.______)\nexcept Exception as e:\n    print(e)', answer: 'timeout,text', fillCount: 2 }
            ]
        },
        p3: {
            title: '项目三综合测试：数据预处理',
            duration: 25,
            questions: [
                { id: 'p3-ex1', type: 'single', question: 'DataFrame 中检测缺失值的函数是？', options: ['isnull()', 'isna()', 'dropna()', 'fillna()'], answer: 1 },
                { id: 'p3-ex2', type: 'single', question: '删除重复行的方法是？', options: ['drop_duplicates()', 'unique()', 'remove()', 'distinct()'], answer: 0 },
                { id: 'p3-ex3', type: 'single', question: 'loc 索引器是基于什么进行索引？', options: ['整数位置', '标签名称', '布尔数组', '随机索引'], answer: 1 },
                { id: 'p3-ex4', type: 'judge', question: 'astype() 可以将字符串直接转换为数值型，无需处理中间字符。', options: ['对', '错'], answer: 1 },
                { id: 'p3-ex5', type: 'codefill', question: '补全代码：读取并清洗数据\nimport pandas as pd\ndf = pd.read_excel("data.xlsx")\n# 删除重复行\ndf = df.______()\n# 填充缺失值为0\ndf["金额"] = df["金额"].______(0)', answer: 'drop_duplicates,fillna', fillCount: 2 }
            ]
        },
        p4: {
            title: '项目四综合测试：数据分析',
            duration: 25,
            questions: [
                { id: 'p4-ex1', type: 'single', question: '计算环比增长率的函数是？', options: ['diff()', 'pct_change()', 'shift()', 'cumsum()'], answer: 1 },
                { id: 'p4-ex2', type: 'single', question: 'groupby 后要对多列应用不同聚合，应使用？', options: ['sum()', 'agg()', 'apply()', 'transform()'], answer: 1 },
                { id: 'p4-ex3', type: 'single', question: 'ROE（净资产收益率）的计算公式是？', options: ['净利润/总资产', '净利润/净资产', '营收/总资产', '毛利/营收'], answer: 1 },
                { id: 'p4-ex4', type: 'codefill', question: '补全代码：按年分组计算平均毛利率\ndf["毛利率"] = (df["营收"] - df["成本"]) / df["营收"]\nresult = df.groupby(______)["毛利率"].______()', answer: '年份,mean', fillCount: 2 }
            ]
        },
        p5: {
            title: '项目五综合测试：数据可视化',
            duration: 20,
            questions: [
                { id: 'p5-ex1', type: 'single', question: 'Matplotlib 中创建子图应使用？', options: ['plt.plot()', 'plt.subplot()', 'plt.figure()', 'plt.show()'], answer: 1 },
                { id: 'p5-ex2', type: 'single', question: 'Pyecharts 中设置全局标题使用？', options: ['Title()', 'TitleOpts()', 'set_title()', 'title()'], answer: 1 },
                { id: 'p5-ex3', type: 'judge', question: '饼图最适合用于展示时间序列数据的趋势变化。', options: ['对', '错'], answer: 1 },
                { id: 'p5-ex4', type: 'codefill', question: '补全代码：绘制柱状图\nfrom pyecharts.charts import Bar\nbar = Bar()\nbar.add_xaxis(["Q1", "Q2", "Q3", "Q4"])\nbar.add_yaxis("营收", [120, 135, 128, 142])\nbar.set_global_opts(title_opts=opts.______(title="季度营收"))\nbar.render("chart.html")', answer: 'TitleOpts', fillCount: 1 }
            ]
        },
        p6: {
            title: '项目六综合测试：综合分析',
            duration: 30,
            questions: [
                { id: 'p6-ex1', type: 'single', question: '财务分析的第一步应该是？', options: ['数据可视化', '明确分析目标', '撰写报告', '模型预测'], answer: 1 },
                { id: 'p6-ex2', type: 'single', question: '资产负债率越高，说明企业？', options: ['盈利能力越强', '偿债压力越大', '营运效率越高', '成长性越好'], answer: 1 },
                { id: 'p6-ex3', type: 'judge', question: '在分析报告中，只需要呈现数据图表，不需要文字结论。', options: ['对', '错'], answer: 1 },
                { id: 'p6-ex4', type: 'codefill', question: '补全代码：计算并对比两年净利率\nnp2019 = pl2019.loc[pl2019["项目"]=="净利润", "本年累计"].values[0]\nnp2020 = pl2020.loc[pl2020["项目"]=="净利润", "本年累计"].values[0]\nrev2019 = pl2019.loc[pl2019["项目"]=="营业收入", "本年累计"].values[0]\nrev2020 = pl2020.loc[pl2020["项目"]=="营业收入", "本年累计"].values[0]\nprint(f"2019净利率：{np2019/rev2019:.2%}")\nprint(f"2020净利率：{np2020/rev2020:.2%}")', answer: '无需填空', fillCount: 0 }
            ]
        }
    }
};

window.COURSE_DATA = COURSE_DATA;
