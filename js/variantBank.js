/**
 * 平行变式题库
 * 基于掌握学习理论，每道变式题与原题保持相同的知识点和布鲁姆认知层级
 * 通过 variantOf 字段关联到原题ID
 */
const VARIANT_QUESTIONS = {

    // ===== 项目一：Python基础 =====
    'p1-t1-q1': [
        {
            id: 'v-p1-t1-q1-a', variantOf: 'p1-t1-q1', type: 'single',
            question: '在企业财务数据分析场景中，Python最核心的优势是？',
            options: ['原生支持所有数据库格式', '拥有Pandas/NumPy等专业数据分析生态', '不需要安装任何第三方库', '只能处理结构化数据'],
            answer: 1,
            explain: 'Python的核心优势在于Pandas、NumPy、Matplotlib等完善的数据分析生态系统。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础']
        },
        {
            id: 'v-p1-t1-q1-b', variantOf: 'p1-t1-q1', type: 'single',
            question: '以下关于Python在数据分析领域的描述，哪项不准确？',
            options: ['拥有丰富的第三方数据处理库', '语法简洁，学习曲线平缓', '可以直接运行Excel VBA宏代码', '支持交互式数据探索与分析'],
            answer: 2,
            explain: 'Python不能直接运行VBA宏代码，两者是不同的编程语言。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础']
        }
    ],
    'p1-t1-q2': [
        {
            id: 'v-p1-t1-q2-a', variantOf: 'p1-t1-q2', type: 'single',
            question: '安装Python后，在命令行输入 python --version 提示"不是内部命令"，最可能的原因是？',
            options: ['Python版本过旧', '安装时未勾选"Add Python to PATH"', '计算机需要重启', '缺少管理员权限'],
            answer: 1,
            explain: '未将Python添加到系统PATH环境变量，命令行无法找到python可执行文件。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['环境搭建']
        }
    ],
    'p1-t1-q3': [
        {
            id: 'v-p1-t1-q3-a', variantOf: 'p1-t1-q3', type: 'single',
            question: '以下哪个不是Python合法的变量名？',
            options: ['total_revenue', '_profit', '2024sales', 'costOfGoods'],
            answer: 2,
            explain: '变量名不能以数字开头，2024sales不合法。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础']
        }
    ],
    'p1-t2-q1': [
        {
            id: 'v-p1-t2-q1-a', variantOf: 'p1-t2-q1', type: 'single',
            question: '在Python中，以下哪个是不可变数据类型？',
            options: ['list', 'dict', 'set', 'tuple'],
            answer: 3,
            explain: 'tuple(元组)是不可变类型，创建后不能修改元素。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础', '数据类型']
        }
    ],
    'p1-t2-q2': [
        {
            id: 'v-p1-t2-q2-a', variantOf: 'p1-t2-q2', type: 'single',
            question: 'Python中执行 0.1 + 0.2 == 0.3 的结果是？',
            options: ['True', 'False', '报错', 'None'],
            answer: 1,
            explain: '浮点数精度问题，0.1+0.2实际为0.30000000000000004，不等于0.3。财务场景应使用Decimal。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Python基础', '数据类型']
        }
    ],
    'p1-t2-q3': [
        {
            id: 'v-p1-t2-q3-a', variantOf: 'p1-t2-q3', type: 'single',
            question: '财务分析中，以下哪种数据类型最适合存储精确到分的金额？',
            options: ['float', 'int', 'Decimal', 'str'],
            answer: 2,
            explain: 'Decimal类型可以精确表示十进制小数，不会产生浮点精度误差，适合财务金额计算。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['Python基础', '数据类型']
        }
    ],
    'p1-t3-q1': [
        {
            id: 'v-p1-t3-q1-a', variantOf: 'p1-t3-q1', type: 'single',
            question: '以下代码的输出结果是？\nfor i in range(1, 4):\n    print(i)',
            options: ['1 2 3 4', '0 1 2 3', '1 2 3', '0 1 2'],
            answer: 2,
            explain: 'range(1, 4)生成1,2,3，不包含4。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Python基础']
        }
    ],
    'p1-t3-q2': [
        {
            id: 'v-p1-t3-q2-a', variantOf: 'p1-t3-q2', type: 'single',
            question: 'Python中定义一个计算毛利率的函数，正确的语法是？',
            options: [
                'def 毛利率(收入, 成本):',
                'function gross_margin(revenue, cost):',
                'def gross_margin(revenue, cost):',
                'func gross_margin(revenue, cost):'
            ],
            answer: 2,
            explain: 'Python使用def关键字定义函数，函数名用英文标识符。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础']
        }
    ],
    'p1-t4-q1': [
        {
            id: 'v-p1-t4-q1-a', variantOf: 'p1-t4-q1', type: 'single',
            question: '读取CSV文件时，以下哪个Pandas函数最常用？',
            options: ['pd.read_excel()', 'pd.read_csv()', 'pd.read_json()', 'pd.read_table()'],
            answer: 1,
            explain: 'pd.read_csv()是读取CSV格式文件的标准函数。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Pandas']
        }
    ],
    'p1-t4-q2': [
        {
            id: 'v-p1-t4-q2-a', variantOf: 'p1-t4-q2', type: 'single',
            question: '以下哪种方式可以正确获取DataFrame的前5行？',
            options: ['df.first(5)', 'df.head(5)', 'df.top(5)', 'df.begin(5)'],
            answer: 1,
            explain: 'df.head(n)返回前n行数据，是Pandas最常用的预览方法。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas']
        }
    ],

    // ===== 项目二：数据获取 =====
    'p2-t1-q1': [
        {
            id: 'v-p2-t1-q1-a', variantOf: 'p2-t1-q1', type: 'single',
            question: '使用requests库发送HTTP GET请求的函数是？',
            options: ['requests.send()', 'requests.get()', 'requests.fetch()', 'requests.download()'],
            answer: 1,
            explain: 'requests.get(url)用于发送GET请求并获取响应。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['数据获取']
        }
    ],
    'p2-t1-q2': [
        {
            id: 'v-p2-t1-q2-a', variantOf: 'p2-t1-q2', type: 'single',
            question: 'HTTP状态码403表示什么含义？',
            options: ['页面未找到', '服务器内部错误', '禁止访问', '请求超时'],
            answer: 2,
            explain: '403 Forbidden表示服务器理解请求但拒绝授权访问。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['数据获取']
        }
    ],
    'p2-t2-q1': [
        {
            id: 'v-p2-t2-q1-a', variantOf: 'p2-t2-q1', type: 'single',
            question: '使用openpyxl读取Excel文件，正确的语句是？',
            options: [
                'wb = openpyxl.open("data.xlsx")',
                'wb = openpyxl.load_workbook("data.xlsx")',
                'wb = openpyxl.read("data.xlsx")',
                'wb = openpyxl.import("data.xlsx")'
            ],
            answer: 1,
            explain: 'load_workbook()是openpyxl读取Excel文件的标准方法。',
            bloom: 'B3', solo: 'S1', knowledgeTags: ['数据获取', 'Excel']
        }
    ],
    'p2-t2-q2': [
        {
            id: 'v-p2-t2-q2-a', variantOf: 'p2-t2-q2', type: 'single',
            question: 'Pandas读取Excel文件时，指定工作表的参数是？',
            options: ['sheet', 'sheet_name', 'worksheet', 'tab'],
            answer: 1,
            explain: 'pd.read_excel(file, sheet_name="Sheet1")中的sheet_name参数用于指定工作表。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['数据获取', 'Excel']
        }
    ],
    'p2-t2-q3': [
        {
            id: 'v-p2-t2-q3-a', variantOf: 'p2-t2-q3', type: 'single',
            question: '网络爬虫获取网页内容后，通常使用哪个库解析HTML？',
            options: ['json', 're', 'BeautifulSoup', 'csv'],
            answer: 2,
            explain: 'BeautifulSoup是最常用的HTML/XML解析库，可以方便地提取网页中的数据。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['数据获取']
        }
    ],

    // ===== 项目三：数据预处理 =====
    'p3-t1-q1': [
        {
            id: 'v-p3-t1-q1-a', variantOf: 'p3-t1-q1', type: 'single',
            question: 'Pandas中查看DataFrame缺失值数量的方法是？',
            options: ['df.isna().count()', 'df.isnull().sum()', 'df.null().total()', 'df.missing().count()'],
            answer: 1,
            explain: 'df.isnull().sum()先判断每个值是否为空，再按列求和得到缺失值数量。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas']
        }
    ],
    'p3-t1-q2': [
        {
            id: 'v-p3-t1-q2-a', variantOf: 'p3-t1-q2', type: 'single',
            question: '以下哪个Pandas方法可以填充缺失值？',
            options: ['df.dropna()', 'df.fillna()', 'df.replace()', 'df.interpolate()'],
            answer: 1,
            explain: 'fillna()用于用指定值或方法填充缺失值。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas', '数据清洗']
        }
    ],
    'p3-t2-q1': [
        {
            id: 'v-p3-t2-q1-a', variantOf: 'p3-t2-q1', type: 'single',
            question: '删除DataFrame中含缺失值的行，正确的方法是？',
            options: ['df.remove_null()', 'df.dropna()', 'df.delete_na()', 'df.clean_null()'],
            answer: 1,
            explain: 'dropna()是Pandas删除缺失值的标准方法，默认删除含缺失值的行。',
            bloom: 'B3', solo: 'S1', knowledgeTags: ['Pandas', '数据清洗']
        }
    ],
    'p3-t2-q2': [
        {
            id: 'v-p3-t2-q2-a', variantOf: 'p3-t2-q2', type: 'single',
            question: 'Pandas中去除DataFrame重复行的方法是？',
            options: ['df.unique()', 'df.drop_duplicates()', 'df.remove_dup()', 'df.distinct()'],
            answer: 1,
            explain: 'drop_duplicates()可以识别并删除重复的行。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas', '数据清洗']
        }
    ],
    'p3-t3-q1': [
        {
            id: 'v-p3-t3-q1-a', variantOf: 'p3-t3-q1', type: 'single',
            question: '将字符串列"12,345.67"转换为数值类型，正确的方法是？',
            options: [
                'pd.to_numeric("12,345.67")',
                'pd.to_numeric("12,345.67".replace(",", ""))',
                'int("12,345.67")',
                'float("12,345.67")'
            ],
            answer: 1,
            explain: '需要先去除千分位逗号，再用pd.to_numeric()转换为数值类型。',
            bloom: 'B3', solo: 'S1', knowledgeTags: ['数据清洗']
        }
    ],
    'p3-t3-q2': [
        {
            id: 'v-p3-t3-q2-a', variantOf: 'p3-t3-q2', type: 'single',
            question: 'Pandas中按列筛选数据的正确写法是？',
            options: ['df.select("列名")', 'df["列名"]', 'df.column("列名")', 'df.get("列名")'],
            answer: 1,
            explain: 'df["列名"]是Pandas中选取单列的标准方式，返回Series对象。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas']
        }
    ],

    // ===== 项目四：数据分析 =====
    'p4-t1-q1': [
        {
            id: 'v-p4-t1-q1-a', variantOf: 'p4-t1-q1', type: 'single',
            question: '毛利率的计算公式是？',
            options: ['(收入 - 成本) / 收入', '成本 / 收入', '(收入 - 成本) / 成本', '收入 / 成本'],
            answer: 0,
            explain: '毛利率 = (营业收入 - 营业成本) / 营业收入 × 100%。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['财务指标']
        }
    ],
    'p4-t1-q2': [
        {
            id: 'v-p4-t1-q2-a', variantOf: 'p4-t1-q2', type: 'single',
            question: 'ROE（净资产收益率）的分子是？',
            options: ['总资产', '净利润', '营业收入', '所有者权益'],
            answer: 1,
            explain: 'ROE = 净利润 / 平均净资产 × 100%，分子为净利润。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['财务指标']
        }
    ],
    'p4-t2-q1': [
        {
            id: 'v-p4-t2-q1-a', variantOf: 'p4-t2-q1', type: 'single',
            question: 'Pandas中按某列分组聚合的函数是？',
            options: ['df.sort_values()', 'df.groupby()', 'df.merge()', 'df.pivot()'],
            answer: 1,
            explain: 'groupby()用于按指定列分组，然后可以应用聚合函数如sum/mean/count。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas', '数据分析']
        }
    ],
    'p4-t2-q2': [
        {
            id: 'v-p4-t2-q2-a', variantOf: 'p4-t2-q2', type: 'single',
            question: '以下哪个Pandas方法可以计算相关系数矩阵？',
            options: ['df.corr()', 'df.cov()', 'df.describe()', 'df.var()'],
            answer: 0,
            explain: 'df.corr()计算各列之间的皮尔逊相关系数矩阵。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['数据分析', '统计']
        }
    ],

    // ===== 项目五：可视化 =====
    'p5-t1-q1': [
        {
            id: 'v-p5-t1-q1-a', variantOf: 'p5-t1-q1', type: 'single',
            question: 'Matplotlib中绘制折线图的主要函数是？',
            options: ['plt.bar()', 'plt.plot()', 'plt.scatter()', 'plt.pie()'],
            answer: 1,
            explain: 'plt.plot(x, y)用于绘制折线图，是最基础的可视化函数。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Matplotlib']
        }
    ],
    'p5-t1-q2': [
        {
            id: 'v-p5-t1-q2-a', variantOf: 'p5-t1-q2', type: 'single',
            question: '展示各产品线收入占比，最合适的图表类型是？',
            options: ['折线图', '柱状图', '饼图', '散点图'],
            answer: 2,
            explain: '饼图最适合展示各部分占整体的比例关系。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['可视化']
        }
    ],
    'p5-t2-q1': [
        {
            id: 'v-p5-t2-q1-a', variantOf: 'p5-t2-q1', type: 'single',
            question: 'Pyecharts中创建柱状图的类是？',
            options: ['Line', 'Bar', 'Pie', 'Scatter'],
            answer: 1,
            explain: 'from pyecharts.charts import Bar 创建柱状图对象。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Pyecharts']
        }
    ],

    // ===== 项目六：综合应用 =====
    'p6-t1-q1': [
        {
            id: 'v-p6-t1-q1-a', variantOf: 'p6-t1-q1', type: 'single',
            question: '编写数据分析报告时，以下哪项不是必要组成部分？',
            options: ['分析目的与背景', '数据来源说明', '程序员个人简介', '分析结论与建议'],
            answer: 2,
            explain: '数据分析报告的核心是数据和分析，不需要程序员个人简介。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['综合应用', '报告撰写']
        }
    ],

    // ===== 单元测试核心题目的变式 =====
    'p1-ex1': [
        {
            id: 'v-p1-ex1-a', variantOf: 'p1-ex1', type: 'single',
            question: 'Python中哪个关键字用于定义函数？',
            options: ['function', 'def', 'func', 'define'],
            answer: 1, explain: 'Python使用def关键字定义函数。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础']
        }
    ],
    'p1-ex2': [
        {
            id: 'v-p1-ex2-a', variantOf: 'p1-ex2', type: 'single',
            question: '以下哪个是Python的内置数据类型？',
            options: ['array', 'ArrayList', 'dict', 'HashMap'],
            answer: 2, explain: 'dict是Python内置的字典类型。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Python基础', '数据类型']
        }
    ],
    'p1-ex3': [
        {
            id: 'v-p1-ex3-a', variantOf: 'p1-ex3', type: 'judge',
            question: 'Python中的列表(list)是有序且可变的。',
            options: ['正确', '错误'],
            answer: 0, explain: 'list是有序序列，支持增删改操作。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Python基础', '数据类型']
        }
    ],
    'p2-ex1': [
        {
            id: 'v-p2-ex1-a', variantOf: 'p2-ex1', type: 'single',
            question: 'requests.get()返回的响应对象中，获取文本内容的属性是？',
            options: ['.text', '.content', '.body', '.data'],
            answer: 0, explain: 'response.text返回响应体的文本内容。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['数据获取']
        }
    ],
    'p2-ex2': [
        {
            id: 'v-p2-ex2-a', variantOf: 'p2-ex2', type: 'single',
            question: 'HTTP状态码200表示？',
            options: ['重定向', '请求成功', '页面未找到', '服务器错误'],
            answer: 1, explain: '200 OK表示服务器成功处理了请求。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['数据获取']
        }
    ],
    'p3-ex1': [
        {
            id: 'v-p3-ex1-a', variantOf: 'p3-ex1', type: 'single',
            question: 'Pandas中DataFrame的shape属性返回什么？',
            options: ['列名列表', '(行数, 列数)元组', '数据类型', '索引对象'],
            answer: 1, explain: 'df.shape返回一个元组(行数, 列数)，表示DataFrame的维度。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['Pandas']
        }
    ],
    'p3-ex2': [
        {
            id: 'v-p3-ex2-a', variantOf: 'p3-ex2', type: 'single',
            question: '以下哪个方法可以统计各分组的平均值？',
            options: ['df.groupby().sum()', 'df.groupby().mean()', 'df.groupby().count()', 'df.groupby().max()'],
            answer: 1, explain: 'groupby().mean()计算每个分组的平均值。',
            bloom: 'B3', solo: 'S2', knowledgeTags: ['Pandas', '数据分析']
        }
    ],
    'p4-ex1': [
        {
            id: 'v-p4-ex1-a', variantOf: 'p4-ex1', type: 'single',
            question: '资产负债率等于？',
            options: ['负债/资产', '资产/负债', '(资产-负债)/资产', '负债/(资产+负债)'],
            answer: 0, explain: '资产负债率 = 总负债 / 总资产 × 100%，反映企业偿债能力。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['财务指标']
        }
    ],
    'p4-ex2': [
        {
            id: 'v-p4-ex2-a', variantOf: 'p4-ex2', type: 'single',
            question: '杜邦分析法将ROE分解为三个因素的乘积，不包括？',
            options: ['销售净利率', '总资产周转率', '库存周转率', '权益乘数'],
            answer: 2, explain: '杜邦三因素：销售净利率×总资产周转率×权益乘数，不含库存周转率。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['财务指标', '杜邦分析']
        }
    ],
    'p5-ex1': [
        {
            id: 'v-p5-ex1-a', variantOf: 'p5-ex1', type: 'single',
            question: 'Matplotlib中设置图表标题的函数是？',
            options: ['plt.label()', 'plt.title()', 'plt.heading()', 'plt.caption()'],
            answer: 1, explain: 'plt.title("标题")设置当前图表的标题。',
            bloom: 'B1', solo: 'S1', knowledgeTags: ['Matplotlib']
        }
    ],
    'p5-ex2': [
        {
            id: 'v-p5-ex2-a', variantOf: 'p5-ex2', type: 'single',
            question: '展示时间序列数据的趋势变化，最合适的图表是？',
            options: ['柱状图', '饼图', '折线图', '散点图'],
            answer: 2, explain: '折线图最适合展示数据随时间的变化趋势。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['可视化']
        }
    ],
    'p6-ex1': [
        {
            id: 'v-p6-ex1-a', variantOf: 'p6-ex1', type: 'single',
            question: '数据看板设计时，以下哪项是最重要的原则？',
            options: ['使用尽可能多的颜色', '突出核心指标', '每屏显示所有数据', '使用3D效果增强视觉'],
            answer: 1, explain: '看板应突出核心指标，避免信息过载，保持简洁清晰。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['综合应用', '数据看板']
        }
    ],
    'p6-ex2': [
        {
            id: 'v-p6-ex2-a', variantOf: 'p6-ex2', type: 'single',
            question: '以下哪种不属于常见的数据可视化图表类型？',
            options: ['桑基图', '雷达图', '螺旋图', '热力图'],
            answer: 2, explain: '螺旋图不是常见的数据可视化类型，其余均为常用的专业图表。',
            bloom: 'B2', solo: 'S1', knowledgeTags: ['可视化']
        }
    ],

    // ===== 扩展题库（questionBankExtended.js）的变式 =====
    'p3-t3-q4': [
        {
            id: 'v-p3-t3-q4-a', variantOf: 'p3-t3-q4', type: 'multi',
            question: '以下哪些操作属于数据清洗的常见步骤？（多选）',
            options: ['去除完全重复的行', '将缺失值填充为0', '转换日期字符串为datetime类型', '删除所有含有空格的记录'],
            answer: [0, 1, 2],
            explain: '去除重复行、填充缺失值、转换数据类型都是常见清洗步骤。删除含空格记录过于激进。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['Pandas', '数据清洗']
        }
    ],
    'p4-t1-q3': [
        {
            id: 'v-p4-t1-q3-a', variantOf: 'p4-t1-q3', type: 'case',
            question: '恒信制造2020年Q3营业成本环比增长20%，但营业收入仅增长5%，请分析可能的影响：',
            caseText: '背景：恒信制造2020年Q3财务数据显示，营业收入800万元（环比+5%），营业成本600万元（环比+20%）。上季度收入762万，成本500万。',
            options: ['毛利率将下降', '净利润可能下滑', '需要检查成本结构变化', '企业一定亏损'],
            answer: [0, 1, 2],
            explain: '成本增速远超收入增速，毛利率必然下降，净利润大概率下滑。应分析成本结构。但"一定亏损"过于绝对。',
            bloom: 'B4', solo: 'S3', knowledgeTags: ['财务分析', '环比分析']
        }
    ],
    'p5-t1-q3': [
        {
            id: 'v-p5-t1-q3-a', variantOf: 'p5-t1-q3', type: 'multi',
            question: '以下哪些是Matplotlib中常用的图表类型？（多选）',
            options: ['柱状图(bar)', '折线图(plot)', '关系图(network)', '散点图(scatter)'],
            answer: [0, 1, 3],
            explain: 'bar、plot、scatter都是Matplotlib基础图表类型。network需要networkx库。',
            bloom: 'B2', solo: 'S2', knowledgeTags: ['Matplotlib', '可视化']
        }
    ]
};

window.VARIANT_QUESTIONS = VARIANT_QUESTIONS;