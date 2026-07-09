/**
 * 扩展题库 — 高阶思维题目
 * 覆盖布鲁姆 B4-B6（分析/评价/创造）和 SOLO S2-S4（多点/关联/抽象拓展）
 */

const EXTENDED_QUESTIONS = {
    // ========== 项目一：Python 基础扩展题 ==========
    p1: {
        quiz: [
            // 任务二 数据类型 — 多选（B2/S2）
            {
                id: 'p1-t2-q5', type: 'multi',
                question: '以下哪些数据类型适合用于财务场景？（多选）',
                options: ['float（存储金额，存在精度风险）', 'Decimal（精确小数，适合财务计算）', 'int（存储以分为单位金额）', 'str（存储格式化后的报表金额）'],
                answer: [0, 1, 2, 3],
                explain: 'float存在浮点精度问题，Decimal可精确计算，int以最小单位存储无精度问题，str适合展示。四种方式各有适用场景。',
                bloom: 'B2', solo: 'S2',
                knowledgeTags: ['Python数据类型', '财务精度']
            }
        ],
        unitTest: [
            // B4 分析 — 代码错误分析
            {
                id: 'p1-ex11', type: 'case',
                question: '以下代码在计算折旧时可能产生什么问题？请选择所有正确的分析。',
                caseText: '代码：book_value = 100000\nlife = 5\nfor year in range(1, life+1):\n    dep = book_value * (2/life)\n    book_value -= dep\n    print(f"第{year}年折旧：{dep:.2f}")',
                options: ['未考虑残值保护，可能导致账面净值为负', '折旧率固定为40%，未逐年递减', '应使用while循环而非for循环', '未引入Decimal，大额资产可能出现浮点误差'],
                answer: [0, 1, 3],
                explain: '双倍余额递减法应保护残值（如book_value - depreciation < salvage_value时调整），且折旧基数应为当前账面净值而非原始值，大额计算建议用Decimal。',
                bloom: 'B4', solo: 'S3',
                knowledgeTags: ['Python循环', '折旧计算', '浮点精度']
            },
            // B5 评价 — 方案选择
            {
                id: 'p1-ex12', type: 'single',
                question: '在财务系统中存储金额，以下哪种方案最合理？',
                options: ['直接使用float，计算方便', '使用Decimal精确计算，输出时格式化为str', '全部用int存储"分"为单位，计算后转float展示', '根据场景选择：计算用Decimal，展示用str，存储用int'],
                answer: 3,
                explain: '不同场景有不同最优方案：计算环节用Decimal保证精度，数据库存储可用int（分），展示环节用格式化str。方案D体现了评价和选择最优策略的能力。',
                bloom: 'B5', solo: 'S3',
                knowledgeTags: ['财务精度', '数据类型选择']
            }
        ]
    },

    // ========== 项目二：数据获取扩展题 ==========
    p2: {
        quiz: [],
        unitTest: [
            // B4 分析 — 爬虫合规案例分析
            {
                id: 'p2-ex6', type: 'case',
                question: '某同学编写爬虫每分钟请求某财经网站1000次获取实时股价，请选择对该行为的正确评价。',
                caseText: '背景：该同学未查看robots.txt，未设置User-Agent，请求频率极高，且将获取数据用于商业App。',
                options: ['违反了爬虫礼仪，可能对目标服务器造成DDoS效应', '未遵守robots.txt的爬取频率限制', '将数据用于商业用途可能涉及版权和法律风险', '高频率请求是技术能力的体现，无可厚非'],
                answer: [0, 1, 2],
                explain: '爬虫应遵守robots.txt、控制频率、设置User-Agent、尊重数据版权。高频率请求可能被视为攻击行为。',
                bloom: 'B4', solo: 'S3',
                knowledgeTags: ['爬虫合规', '网络伦理', '法律风险']
            },
            // B6 创造 — 代码实现
            {
                id: 'p2-ex7', type: 'code',
                question: '请编写一个完整的爬虫函数，从指定URL获取恒信制造的财务报告HTML，保存到本地，并处理超时和404异常。',
                starterCode: 'import requests\n\ndef fetch_report(url, save_path):\n    """获取财务报告并保存"""\n    # 请补全代码\n    pass',
                testCases: [
                    { check: 'requests.get', desc: '使用requests发送请求' },
                    { check: 'timeout', desc: '设置了超时参数' },
                    { check: 'raise_for_status', desc: '检查HTTP状态码' },
                    { check: 'open', desc: '打开文件保存' },
                    { check: 'except', desc: '处理了异常' }
                ],
                modelAnswer: 'import requests\n\ndef fetch_report(url, save_path):\n    try:\n        r = requests.get(url, timeout=10, headers={"User-Agent":"Mozilla/5.0"})\n        r.raise_for_status()\n        with open(save_path, "w", encoding="utf-8") as f:\n            f.write(r.text)\n        return True\n    except requests.exceptions.Timeout:\n        print("请求超时")\n        return False\n    except requests.exceptions.HTTPError:\n        print(f"HTTP错误: {r.status_code}")\n        return False',
                explain: '完整的爬虫应包含超时设置、状态码检查、异常处理、文件保存。',
                bloom: 'B6', solo: 'S4',
                knowledgeTags: ['requests', '异常处理', '文件操作']
            }
        ]
    },

    // ========== 项目三：数据预处理扩展题 ==========
    p3: {
        quiz: [
            // B2/S2 多选
            {
                id: 'p3-t2-q3', type: 'multi',
                question: '以下哪些操作属于数据筛选（Filtering）而非数据清洗（Cleaning）？（多选）',
                options: ['按日期范围筛选2020年数据', '删除金额为负数的异常记录', '选择"营业收入"大于100万的行', '去除科目名称为空的行'],
                answer: [0, 2],
                explain: '筛选是按条件选择子集（不改变数据本身），清洗是修正或删除有问题的数据。A和C是筛选，B和D是清洗。',
                bloom: 'B2', solo: 'S2',
                knowledgeTags: ['数据筛选', '数据清洗', 'Pandas']
            },
            // B4 分析
            {
                id: 'p3-t3-q4', type: 'case',
                question: '恒信制造ERP导出数据中，"金额"列混有"￥1,234.56"、"1234.56"、"1 234,56"（法文格式）等多种格式。请选择正确的处理策略。',
                caseText: '数据样本：\n凭证1: ￥1,234.56\n凭证2: 1234.56\n凭证3: 1 234,56\n凭证4: (空值)\n凭证5: 未知',
                options: ['先用正则统一去除￥和逗号，再处理空值', '对不同格式分别处理：含￥的去除符号，法文格式替换空格和逗号', '直接pd.to_numeric(errors="coerce")，让无法转换的变为NaN', '建立映射表，按数据源系统分类处理'],
                answer: [0, 1, 2],
                explain: '多格式混合数据需要分步处理：识别格式类型→分别清洗→统一转换→处理异常。直接to_numeric会丢失原始信息，不利于追溯。',
                bloom: 'B4', solo: 'S3',
                knowledgeTags: ['数据清洗', '字符串处理', '异常处理']
            }
        ],
        unitTest: [
            // B5 评价
            {
                id: 'p3-ex6', type: 'single',
                question: '对于一份包含5%缺失值的数据集，以下哪种处理策略最合理？',
                options: ['直接删除所有含缺失值的行', '全部填充为0', '根据数据特征选择：数值型用均值/中位数，分类型用众数，时间序列用前后插值', '用机器学习模型预测缺失值'],
                answer: 2,
                explain: '数据清洗策略应基于数据特征和业务场景选择。简单删除可能丢失信息，全部填0会引入偏差，机器学习预测过于复杂且可能过拟合。',
                bloom: 'B5', solo: 'S3',
                knowledgeTags: ['缺失值处理', '数据策略']
            },
            // B6 创造 — 综合清洗函数
            {
                id: 'p3-ex7', type: 'code',
                question: '请编写一个综合数据清洗函数clean_finance_data(df)，实现：1)去除完全重复行；2)去除金额和日期同时为空的行；3)清洗金额列（去除￥和逗号）；4)转换日期格式；5)去除摘要列前后空格。',
                starterCode: 'import pandas as pd\n\ndef clean_finance_data(df):\n    """财务数据综合清洗函数"""\n    # 请补全代码\n    pass',
                testCases: [
                    { check: 'drop_duplicates', desc: '去除重复行' },
                    { check: 'dropna', desc: '删除缺失值' },
                    { check: 'replace', desc: '替换字符' },
                    { check: 'to_datetime', desc: '转换日期' },
                    { check: 'strip', desc: '去除空格' }
                ],
                modelAnswer: 'def clean_finance_data(df):\n    df = df.drop_duplicates()\n    df = df.dropna(subset=["金额", "日期"], how="all")\n    df["金额"] = df["金额"].astype(str).str.replace("[￥,]", "", regex=True)\n    df["金额"] = pd.to_numeric(df["金额"], errors="coerce")\n    df["日期"] = pd.to_datetime(df["日期"], errors="coerce")\n    df["摘要"] = df["摘要"].astype(str).str.strip()\n    return df',
                explain: '综合清洗函数需要串联多个操作：去重→条件删缺失→字符清洗→类型转换→格式化。',
                bloom: 'B6', solo: 'S4',
                knowledgeTags: ['Pandas', '数据清洗', '函数设计']
            }
        ]
    },

    // ========== 项目四：数据分析扩展题 ==========
    p4: {
        quiz: [
            // B4 分析 — 财务指标分析
            {
                id: 'p4-t1-q3', type: 'case',
                question: '恒信制造2020年ROE为12.5%，但同行业平均为15%。以下哪些分析步骤有助于找出差距原因？',
                caseText: '已知数据：恒信制造2020年净利润158万，净资产1264万，总资产2130万，营业收入1986万。',
                options: ['用杜邦分析法分解ROE为净利率×资产周转率×权益乘数', '对比同行业的净利率、资产周转率、权益乘数三项指标', '分析费用结构，查看管理费用是否过高', '直接认定是企业盈利能力不足'],
                answer: [0, 1, 2],
                explain: 'ROE差距需通过杜邦分解定位具体环节（盈利能力/营运效率/财务杠杆），而非简单归因。',
                bloom: 'B4', solo: 'S3',
                knowledgeTags: ['ROE', '杜邦分析', '财务对比']
            }
        ],
        unitTest: [
            // B5 评价 — 方案选择
            {
                id: 'p4-ex5', type: 'single',
                question: '在分析恒信制造季度营收趋势时，发现Q2营收异常波动。以下哪种分析路径最合理？',
                options: ['直接排除Q2数据，认为是异常值', '先检查数据采集是否有误，再分析业务原因', '用均值填充Q2数据后继续分析', '仅关注Q2数据，忽略其他季度'],
                answer: 1,
                explain: '数据分析应遵循"先验证数据质量，再分析业务原因"的原则。直接排除或填充可能丢失关键信息。',
                bloom: 'B5', solo: 'S3',
                knowledgeTags: ['数据分析流程', '异常值处理']
            },
            // B6 创造 — 完整分析代码
            {
                id: 'p4-ex6', type: 'code',
                question: '请编写代码：基于恒信制造2019-2020年利润表数据，计算并输出两年的净利率、毛利率、ROE三大指标，并用条件判断给出经营评价（优秀/良好/一般/需改善）。',
                starterCode: '# 已知数据（万元）\nrevenue_2019, revenue_2020 = 1682, 1986\nprofit_2019, profit_2020 = 98, 158\ncost_2019, cost_2020 = 1090, 1282\nasset_2019, asset_2020 = 2130, 2130\nequity_2019, equity_2020 = 1175, 1264\n\n# 请补全代码\n',
                testCases: [
                    { check: 'net_margin', desc: '计算了净利率' },
                    { check: 'gross_margin', desc: '计算了毛利率' },
                    { check: 'ROE', desc: '计算了ROE' },
                    { check: 'if', desc: '使用了条件判断' },
                    { check: 'print', desc: '输出了结果' }
                ],
                modelAnswer: 'gross_margin_2019 = (revenue_2019 - cost_2019) / revenue_2019\ngross_margin_2020 = (revenue_2020 - cost_2020) / revenue_2020\nnet_margin_2019 = profit_2019 / revenue_2019\nnet_margin_2020 = profit_2020 / revenue_2020\nroe_2019 = profit_2019 / equity_2019\nroe_2020 = profit_2020 / equity_2020\n\nfor year, gm, nm, roe in [(2019, gross_margin_2019, net_margin_2019, roe_2019),\n                          (2020, gross_margin_2020, net_margin_2020, roe_2020)]:\n    score = gm + nm + roe\n    if score > 0.5:\n        level = "优秀"\n    elif score > 0.4:\n        level = "良好"\n    elif score > 0.3:\n        level = "一般"\n    else:\n        level = "需改善"\n    print(f"{year}年: 毛利率{gm:.1%}, 净利率{nm:.1%}, ROE{roe:.1%} → {level}")',
                explain: '综合运用指标计算、条件判断、循环输出，实现完整的经营评价。',
                bloom: 'B6', solo: 'S4',
                knowledgeTags: ['财务指标', '条件判断', '循环']
            }
        ]
    },

    // ========== 项目五：可视化扩展题 ==========
    p5: {
        quiz: [
            // B5 评价 — 图表选择
            {
                id: 'p5-t1-q3', type: 'single',
                question: '要同时展示恒信制造6个费用项目2020年的金额和占比，以下哪种图表组合最佳？',
                options: ['6个独立的饼图', '一个柱状图+一个饼图', '一个雷达图', '一个散点图'],
                answer: 1,
                explain: '柱状图适合比较各项目金额大小，饼图适合展示占比关系。两者组合可以完整表达数据。',
                bloom: 'B5', solo: 'S3',
                knowledgeTags: ['图表选择', '可视化设计']
            }
        ],
        unitTest: [
            // B6 创造 — 看板设计
            {
                id: 'p5-ex5', type: 'design',
                question: '为恒信制造财务总监设计一个月度经营数据可视化看板，请描述需要包含的核心指标、图表类型和布局思路。',
                criteria: [
                    { item: '核心指标完整性（营收/成本/利润/ROE等）', weight: 30 },
                    { item: '图表类型与数据特征匹配度', weight: 25 },
                    { item: '布局逻辑与信息层级', weight: 25 },
                    { item: '异常预警机制设计', weight: 20 }
                ],
                modelAnswer: '核心指标：月度营收（同比环比）、毛利率趋势、费用结构占比、ROE、现金流。图表：折线图展示趋势，柱状图对比，饼图展示结构，KPI卡片展示关键数字。布局：顶部KPI卡片→中部趋势图→底部结构分析。预警：设置阈值自动标红异常指标。',
                explain: '看板设计需要综合考虑信息完整性、可视化效果和业务价值。',
                bloom: 'B6', solo: 'S4',
                knowledgeTags: ['看板设计', '可视化', '财务指标']
            },
            // B6 创造 — 代码实现
            {
                id: 'p5-ex6', type: 'code',
                question: '请编写代码：使用Matplotlib绘制恒信制造2020年月度营收和成本的双轴对比图（左轴营收柱状图，右轴成本折线图）。',
                starterCode: 'import matplotlib.pyplot as plt\nimport numpy as np\n\nmonths = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]\nrevenue = [82.0,75.6,91.0,94.5,102.0,108.0,118.5,125.0,132.0,145.0,152.0,160.0]\ncost = [51.2,48.0,57.8,60.2,64.5,68.0,74.5,78.0,82.5,90.0,94.5,100.0]\n\n# 请补全代码\n',
                testCases: [
                    { check: 'subplots', desc: '创建了画布' },
                    { check: 'bar', desc: '绘制了柱状图' },
                    { check: 'twinx', desc: '创建了双轴' },
                    { check: 'plot', desc: '绘制了折线图' },
                    { check: 'show', desc: '显示图表' }
                ],
                modelAnswer: 'fig, ax1 = plt.subplots()\nax1.bar(months, revenue, color="steelblue", label="营收")\nax1.set_ylabel("营收(万元)", color="steelblue")\nax1.tick_params(axis="y", labelcolor="steelblue")\n\nax2 = ax1.twinx()\nax2.plot(months, cost, color="orangered", marker="o", label="成本")\nax2.set_ylabel("成本(万元)", color="orangered")\nax2.tick_params(axis="y", labelcolor="orangered")\n\nplt.title("恒信制造2020年月度营收与成本对比")\nfig.tight_layout()\nplt.show()',
                explain: '双轴图通过twinx()实现，左轴柱状图展示营收，右轴折线图展示成本，便于对比分析。',
                bloom: 'B6', solo: 'S4',
                knowledgeTags: ['Matplotlib', '双轴图', '可视化']
            }
        ]
    },

    // ========== 项目六：综合分析扩展题 ==========
    p6: {
        quiz: [],
        unitTest: [
            // B4 分析 — 报告质量评价
            {
                id: 'p6-ex5', type: 'case',
                question: '以下是一份"恒信制造年度分析报告"的片段，请评价其存在的问题。',
                caseText: '报告片段：\n"2020年公司营收1986万元，比去年增加304万元。净利率7.95%。资产负债率59.18%。建议公司减少负债。"',
                options: ['缺少与同行业对比，无法判断指标优劣', '"建议减少负债"过于笼统，未分析负债结构', '缺少对营收增长原因的具体分析', '报告格式规范，没有问题'],
                answer: [0, 1, 2],
                explain: '高质量分析报告需要：横向对比（同行业）、纵向追溯（原因分析）、具体建议（而非笼统结论）。',
                bloom: 'B4', solo: 'S3',
                knowledgeTags: ['报告撰写', '财务分析']
            },
            // B6 创造 — 综合设计
            {
                id: 'p6-ex6', type: 'design',
                question: '作为恒信制造的数据分析师，请设计一套完整的"月度经营健康度评价体系"，包含：1)核心评价指标（至少5个）；2)各指标的计算方法和数据来源；3)健康度分级标准（如绿/黄/红三级）；4)异常时的行动建议模板。',
                criteria: [
                    { item: '指标体系完整性和科学性', weight: 30 },
                    { item: '计算方法清晰可落地', weight: 25 },
                    { item: '分级标准合理（有阈值依据）', weight: 25 },
                    { item: '行动建议具体可操作', weight: 20 }
                ],
                modelAnswer: '指标：1)营收增长率（目标>10%）2)毛利率（目标>35%）3)净利率（目标>8%）4)资产负债率（警戒<70%）5)现金流比率（目标>1）。分级：绿色（全部达标）、黄色（1-2项预警）、红色（3项以上预警）。行动：黄色→专项分析；红色→管理层会议+整改计划。',
                explain: '评价体系需要从指标设计、计算方法、分级标准到行动建议形成闭环。',
                bloom: 'B6', solo: 'S4',
                knowledgeTags: ['指标体系', '评价体系', '综合分析']
            }
        ]
    }
};

// 合并到全局
window.EXTENDED_QUESTIONS = EXTENDED_QUESTIONS;
