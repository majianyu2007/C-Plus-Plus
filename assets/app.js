/* ============================================================
   OOP 期末复习刷题系统 - 主应用逻辑 (智能重构与焦点模式版)
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // 状态管理
  // ============================================================
  const state = {
    questions: [],
    programming: [],
    knowledge: [],
    allItems: [],         // questions + programming merged
    filtered: [],
    currentType: 'all',
    currentChapter: 'all',
    currentStatus: null,
    searchQuery: '',
    selectedKnowledgePoint: 'all',
    reviewQueueActive: false,
    reviewQueueKeys: [],
    reviewQueuePreviousMode: null,
    reviewQueuePreviousFocusIndex: 0,
    reviewQueuePreviousFocusKey: null,
    pendingFocusRestore: null,
    userProgress: {},     // { questionId: 'mastered' | 'review' | 'wrong' }
    chapters: [],
    allKnowledgePoints: [],
    kpLectureMap: {}, // { "知识点": "讲义章节hint" }
    favoritesOnly: false,
    quizMode: 'list',     // 'list' (列表) 或 'focus' (单题焦点)
    focusIndex: 0,         // 焦点模式下的当前题目索引
    galgameMode: false,
    galgameAudioReady: false,
    galgameCurrentScene: null,
    galgameVariant: 'romance',
    galgameStreak: { correct: 0, wrong: 0 },
    galgameEventHistory: {},
    galgameAffection: 12,
    galgameAffectionEvents: {},
    galgameScenarioMap: {},
    isReadyForScrollSave: false
  };

  // ============================================================
  // 本地设置 / 收藏 / 记录 / SRS
  // ============================================================
  const SETTINGS_KEY = 'oop_settings';
  const FAVORITES_KEY = 'oop_favorites';
  const ATTEMPTS_KEY = 'oop_attempts';
  const STATS_KEY = 'oop_question_stats';
  const GALGAME_AFFECTION_KEY = 'oop_galgame_affection';

  function loadJsonFromStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function saveJsonToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`无法保存 ${key}`);
    }
  }

  const defaultSettings = {
    redoMode: localStorage.getItem('oop_redo_mode') === '1',
    shuffle: true,
    seed: null,
    galgameAudio: true,
    galgameBgmVolume: 35,
    galgameSeVolume: 55
  };

  const GALGAME_ASSETS = {
    backgrounds: {
      duskRoom: 'assets/galgame/backgrounds/sister-room-dusk.png',
      dayRoom: 'assets/galgame/backgrounds/sister-room-day.png',
      nightRoom: 'assets/galgame/backgrounds/sister-room-night.png',
      exterior: 'assets/galgame/backgrounds/summer-exterior-day.png',
      entrance: 'assets/galgame/backgrounds/entrance-day.png',
      kitchen: 'assets/galgame/backgrounds/kitchen-day.png'
    },
    characters: {
      smile: 'assets/galgame/characters/mio/smile.png',
      happy: 'assets/galgame/characters/mio/happy.png',
      shy: 'assets/galgame/characters/mio/shy.png',
      serious: 'assets/galgame/characters/mio/serious.png',
      surprised: 'assets/galgame/characters/mio/surprised.png',
      sad: 'assets/galgame/characters/mio/sad.png'
    },
    audio: {
      bgm: {
        summer: 'assets/galgame/audio/bgm/summer.ogg',
        afterSchool: 'assets/galgame/audio/bgm/after-school.ogg',
        sunlight: 'assets/galgame/audio/bgm/sunlight.ogg'
      },
      bgs: 'assets/galgame/audio/bgs/summer-cicadas.ogg',
      se: {
        decision: 'assets/galgame/audio/se/decision.ogg',
        cursor: 'assets/galgame/audio/se/cursor.ogg',
        cancel: 'assets/galgame/audio/se/cancel.ogg',
        success: 'assets/galgame/audio/se/success.ogg',
        wrong: 'assets/galgame/audio/se/wrong.ogg'
      }
    }
  };

  const storedSettings = loadJsonFromStorage(SETTINGS_KEY, {});
  let cleanedStoredSettings = false;
  ['galgameMode', 'galgameVariant'].forEach(key => {
    if (storedSettings && Object.prototype.hasOwnProperty.call(storedSettings, key)) {
      delete storedSettings[key];
      cleanedStoredSettings = true;
    }
  });
  if (cleanedStoredSettings) saveJsonToStorage(SETTINGS_KEY, storedSettings);

  state.settings = Object.assign(
    {},
    defaultSettings,
    storedSettings
  );

  function clampGalgameVolume(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : fallback;
  }

  function generateSeed() {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  function normalizeSettings() {
    state.settings.shuffle = state.settings.shuffle !== false;
    state.settings.redoMode = !!state.settings.redoMode;
    state.settings.galgameAudio = state.settings.galgameAudio !== false;
    state.galgameVariant = 'romance';
    state.settings.galgameBgmVolume = clampGalgameVolume(state.settings.galgameBgmVolume, 35);
    state.settings.galgameSeVolume = clampGalgameVolume(state.settings.galgameSeVolume, 55);
    const parsedSeed = Number.parseInt(state.settings.seed, 10);
    state.settings.seed = Number.isFinite(parsedSeed) && parsedSeed > 0 ? parsedSeed : null;
  }

  normalizeSettings();

  state.favorites = loadJsonFromStorage(FAVORITES_KEY, {}); // { "q_1": true }
  state.attempts = loadJsonFromStorage(ATTEMPTS_KEY, []); // [{id,ts,result}]
  state.questionStats = loadJsonFromStorage(STATS_KEY, {}); // { "q_1": {streak,nextReviewTs,wrongCount,lastTs} }
  loadGalgameAffectionState();

  const GALGAME_AFFECTION_RANKS = [
    { min: 0, key: 'first', label: '初遇' },
    { min: 18, key: 'warm', label: '熟悉' },
    { min: 36, key: 'trust', label: '信赖' },
    { min: 58, key: 'close', label: '心动' },
    { min: 78, key: 'promise', label: '约定' },
    { min: 96, key: 'true', label: 'True End' }
  ];

  function clampGalgameAffection(value) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 12;
  }

  function loadGalgameAffectionState() {
    const saved = loadJsonFromStorage(GALGAME_AFFECTION_KEY, null);
    if (typeof saved === 'number') {
      state.galgameAffection = clampGalgameAffection(saved);
      state.galgameAffectionEvents = {};
      return;
    }
    if (saved && typeof saved === 'object') {
      state.galgameAffection = clampGalgameAffection(saved.score);
      state.galgameAffectionEvents = saved.events && typeof saved.events === 'object' ? saved.events : {};
    }
  }

  function saveGalgameAffectionState() {
    saveJsonToStorage(GALGAME_AFFECTION_KEY, {
      score: state.galgameAffection,
      events: state.galgameAffectionEvents || {}
    });
  }

  function getGalgameAffectionRank(value = state.galgameAffection) {
    const score = clampGalgameAffection(value);
    let rank = GALGAME_AFFECTION_RANKS[0];
    GALGAME_AFFECTION_RANKS.forEach(item => {
      if (score >= item.min) rank = item;
    });
    return rank;
  }

  function updateGalgameAffectionDisplay() {
    const score = clampGalgameAffection(state.galgameAffection);
    const rank = getGalgameAffectionRank(score);
    state.galgameAffection = score;
    const el = document.getElementById('galgame-affection');
    if (el) {
      el.textContent = `好感 ${score} · ${rank.label}`;
      el.title = `澪的好感度：${score}/100`;
    }
    if (state.galgameMode) {
      document.body.dataset.galgameAffection = rank.key;
    } else {
      delete document.body.dataset.galgameAffection;
    }
  }

  function triggerGalgameAffectionMilestone(previousScore, nextScore) {
    if (!state.galgameMode || nextScore <= previousScore) return false;
    const currentRank = getGalgameAffectionRank(nextScore);
    if (currentRank.min <= 0 || previousScore >= currentRank.min) return false;
    const eventKey = `affection:${currentRank.key}`;
    if (state.galgameAffectionEvents[eventKey]) return false;
    state.galgameAffectionEvents[eventKey] = true;
    saveGalgameAffectionState();
    showGalgameEffect('affection', `好感 ${nextScore} · ${currentRank.label}`);
    setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'affectionMilestone', { rank: currentRank.label }), currentRank.min >= 58 ? 'shy' : 'happy');
    setGalgameStory(getCurrentFocusItem(), 'affectionMilestone');
    return true;
  }

  function triggerGalgameAffectionDrop(previousScore, nextScore) {
    if (!state.galgameMode || nextScore >= previousScore) return false;
    const previousRank = getGalgameAffectionRank(previousScore);
    const currentRank = getGalgameAffectionRank(nextScore);
    if (previousRank.key === currentRank.key) return false;
    showGalgameEffect('warning', `好感 ${nextScore} · ${currentRank.label}`);
    setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'affectionDown', { rank: currentRank.label }), 'sad');
    setGalgameStory(getCurrentFocusItem(), 'affectionDown');
    return true;
  }

  function adjustGalgameAffection(delta, reason = 'event', options = {}) {
    if (!state.galgameMode || !Number.isFinite(delta) || delta === 0) return 0;
    const previousScore = clampGalgameAffection(state.galgameAffection);
    const nextScore = clampGalgameAffection(previousScore + delta);
    const actualDelta = nextScore - previousScore;
    if (!actualDelta) return 0;
    state.galgameAffection = nextScore;
    saveGalgameAffectionState();
    updateGalgameAffectionDisplay();
    const milestoneTriggered = actualDelta > 0 && triggerGalgameAffectionMilestone(previousScore, nextScore);
    const dropTriggered = actualDelta < 0 && triggerGalgameAffectionDrop(previousScore, nextScore);
    if (options.effect !== false && actualDelta > 0 && !milestoneTriggered) {
      showGalgameEffect('affection', `+${actualDelta} · ${getGalgameAffectionRank(nextScore).label}`);
    }
    if (options.effect !== false && actualDelta < 0 && !dropTriggered) {
      showGalgameEffect('warning', `${actualDelta} · ${getGalgameAffectionRank(nextScore).label}`);
    }
    return actualDelta;
  }

  function adjustGalgameAffectionOnce(eventKey, delta, reason = 'event', options = {}) {
    if (!state.galgameMode || !eventKey) return 0;
    const key = `once:${eventKey}`;
    if (state.galgameAffectionEvents[key]) return 0;
    state.galgameAffectionEvents[key] = true;
    return adjustGalgameAffection(delta, reason, options);
  }

  function createSeededRandom(seed) {
    let currentSeed = seed;
    return function () {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };
  }

  function seededShuffle(array, seed) {
    const rng = createSeededRandom(seed);
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }

  function applyShuffle() {
    normalizeSettings();
    if (state.settings.shuffle) {
      if (!state.settings.seed) {
        state.settings.seed = generateSeed();
      }
      saveJsonToStorage(SETTINGS_KEY, state.settings);
      state.allItems = seededShuffle(state.originalAllItems, state.settings.seed);
    } else {
      saveJsonToStorage(SETTINGS_KEY, state.settings);
      state.allItems = [...state.originalAllItems];
    }
  }



  function showToast(message, kind = 'info') {
    const el = document.getElementById('toast');
    if (!el) return alert(message);
    el.className = `toast visible ${kind}`;
    el.textContent = message;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.className = 'toast';
    }, 2600);
  }

  // ============================================================
  // 数据加载
  // ============================================================
  async function loadJSON(filename, options = {}) {
    const v = '1.8.1';
    const paths = [`data/${filename}?v=${v}`, `../data/${filename}?v=${v}`, `site/data/${filename}?v=${v}`];
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) return await res.json();
      } catch (e) { /* try next */ }
    }
    if (!options.optional) console.warn(`无法加载 ${filename}，使用内嵌数据`);
    return null;
  }

  async function loadAllData() {
    try {
      // 优先从 JSON 文件读取（更“干净”的数据源管理）；失败再使用内嵌 data.js 兜底
      const [questions, programming, knowledge] = await Promise.all([
        loadJSON('questions.json'),
        loadJSON('programming.json'),
        loadJSON('knowledge.json')
      ]);

      if (questions && Array.isArray(questions) && questions.length) {
        state.questions = questions;
        state.programming = (programming && Array.isArray(programming)) ? programming : [];
        state.knowledge = (knowledge && Array.isArray(knowledge)) ? knowledge : getFallbackKnowledge();
      } else {
        state.questions = getFallbackQuestions();
        state.programming = [];
        state.knowledge = getFallbackKnowledge();
      }

      // 为程序设计题添加 type 字段
      state.programming.forEach(p => { p.type = 'programming'; });

      // 合并所有题目
      state.originalAllItems = [...state.questions, ...state.programming];

      // 应用乱序逻辑
      applyShuffle();

      // 可选：读取本地脚本批量生成的 Galgame 剧情包。
      const scenarios = await loadJSON('galgame_scenarios.json', { optional: true });
      state.galgameScenarioMap = normalizeGalgameScenarios(scenarios);

      // 读取标准化知识点词表（若存在），用于“知识点→讲义章节”精准跳转
      try {
        const vocab = await loadJSON('kp_vocab.json');
        if (vocab && Array.isArray(vocab.points)) {
          const map = {};
          vocab.points.forEach(p => {
            if (!p || !p.name) return;
            const hint = (p.lectureChapterHint || '').trim();
            if (hint) map[String(p.name)] = hint;
          });
          state.kpLectureMap = map;
        }
      } catch (e) {
        state.kpLectureMap = {};
      }

      // 提取全站知识点标签（来自题库）
      const kpData = extractAllKnowledgePoints();
      state.allKnowledgePoints = kpData.points;
      state.knowledgePointCounts = kpData.counts;

      // 提取章节列表（按课程大纲顺序排列，而非乱序后的出现顺序，
      // 否则章节下拉框与进度页每次随机种子都会乱序，不利于复习）
      const CHAPTER_ORDER = [
        '绪论', 'C++对C的扩充', '类与对象', '构造函数与析构函数',
        'this/const/static成员', '友元', '运算符重载', '继承与派生',
        '多态与虚函数', '多继承与虚基类', '模板', 'STL', '文件IO'
      ];
      const chapterSet = new Set();
      state.allItems.forEach(q => { if (q.chapter) chapterSet.add(q.chapter); });
      state.chapters = Array.from(chapterSet).sort((a, b) => {
        const ia = CHAPTER_ORDER.indexOf(a);
        const ib = CHAPTER_ORDER.indexOf(b);
        if (ia === -1 && ib === -1) return String(a).localeCompare(String(b), 'zh');
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });

      // 加载用户进度
      loadProgress();
      
      // 加载视图状态
      loadViewState();

      // 初始化界面
      initUI();
      initTheme();
      initSettingsPanel();
      initImportProgress();
      initGalgameEntrances();
      applyGalgameModeClass();
      applyGalgameAudioVolumes();
      renderStats();
      renderDashboard();
      
      // 同步界面激活状态
      syncUIWithState();
      
      // 首次数据渲染并恢复进度
      filterAndRender(true);
      
      renderKnowledge();
      renderProgress();
      renderFooterMeta();
      updateTodayReviewButton();

      // 导航回上次所在的页面，这会自动触发滚动位置与焦点恢复
      const savedPage = localStorage.getItem('oop_active_page') || 'quiz';
      window._goToPage(savedPage);

      hideLoadingCover();
      setTimeout(() => initOnboarding(), 520);
    } catch (err) {
      console.error('数据加载失败:', err);
      hideLoadingCover();
      document.getElementById('question-list').innerHTML =
        '<div class="empty-state"><div class="icon">!</div><p>数据加载失败，请确认 <code>data/</code> 目录下有 JSON 数据文件，并通过 HTTP 方式访问站点（不要用 file:/// 直接打开）。</p></div>';
    }
  }

  // ============================================================
  // 用户进度 (localStorage)
  // ============================================================
  const STORAGE_KEY = 'oop_review_progress';

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) state.userProgress = JSON.parse(saved);
    } catch (e) { state.userProgress = {}; }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userProgress));
    } catch (e) { console.warn('无法保存进度'); }
  }

  function applyGalgameModeClass() {
    document.body.classList.toggle('galgame-mode', !!state.galgameMode);
    document.body.classList.toggle('galgame-variant-romance', !!state.galgameMode);
    if (state.galgameMode) {
      state.quizMode = 'focus';
    } else {
      document.body.classList.remove('galgame-variant-romance');
      delete document.body.dataset.galgameAffection;
    }
    updateGalgameAffectionDisplay();
    updateGalgameStageVisibility();
  }

  function shouldUseGalgameStage() {
    const quizPage = document.getElementById('page-quiz');
    return !!state.galgameMode && state.quizMode === 'focus' && (!quizPage || quizPage.classList.contains('active'));
  }

  function getCurrentFocusItem() {
    if (state.quizMode !== 'focus' || !state.filtered.length) return null;
    if (state.focusIndex >= state.filtered.length) state.focusIndex = 0;
    if (state.focusIndex < 0) state.focusIndex = state.filtered.length - 1;
    return state.filtered[state.focusIndex] || null;
  }

  function getGalgameSceneForQuestion(q) {
    const sceneByType = {
      choice: { bg: 'exterior', bgm: 'summer', location: '夏日町外', expression: 'smile' },
      truefalse: { bg: 'entrance', bgm: 'sunlight', location: '玄关回廊', expression: 'serious' },
      fillin: { bg: 'duskRoom', bgm: 'afterSchool', location: '黄昏复习室', expression: 'shy' },
      coding: { bg: 'nightRoom', bgm: 'afterSchool', location: '夜间推演', expression: 'serious' },
      programming: { bg: 'kitchen', bgm: 'sunlight', location: '实践工坊', expression: 'happy' }
    };
    return sceneByType[q?.type] || sceneByType.choice;
  }

  function pickFrom(list, seedText = '') {
    if (!Array.isArray(list) || !list.length) return '';
    let hash = 0;
    const raw = String(seedText || Date.now());
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return list[Math.abs(hash) % list.length];
  }

  function getGalgameStudyHint(q) {
    if (!q) return '先把筛选条件调舒服一点，再继续推进这条路线。';
    const hints = {
      choice: [
        '选择题先判断题干问的是“概念”“语法”还是“执行结果”，再去排除干扰项。',
        '看到相似选项时，先找最绝对、最偷换概念的那一个。',
        '把每个选项当成分支路线，能被反例击穿的路线就先划掉。'
      ],
      truefalse: [
        '判断题要小心“总是”“一定”“只能”这类词，很多陷阱都藏在语气里。',
        '先想一个反例，想不出反例再判断它是否成立。',
        '别被熟悉的名词催着点按钮，判断题考的是边界。'
      ],
      fillin: [
        '填空题更像补完关键台词，先回忆定义，再看语境需要哪种写法。',
        '如果答案是关键字或函数名，注意大小写、作用域和参数形式。',
        '先写核心词，再对照题干补完整表达。'
      ],
      coding: [
        '程序分析题按语句执行顺序走一遍，尤其盯住构造、析构、虚函数和作用域。',
        '先别急着看输出，画一下对象什么时候创建、什么时候销毁。',
        '遇到多态题，先确认指针/引用的静态类型和对象的动态类型。'
      ],
      programming: [
        '程序设计题先定接口和边界，再写实现，最后补测试样例。',
        '把类的职责分清楚，主函数就会自然干净很多。',
        '如果题目要求继承或多态，先写基类契约，再考虑派生类差异。'
      ]
    };
    return pickFrom(hints[q.type] || hints.choice, `${q.type}:${q.id}:${state.focusIndex}`);
  }

  function getGalgameRouteTitle(q) {
    const scenarioTitle = getGalgameScenario(q)?.routeTitle;
    if (typeof scenarioTitle === 'string' && scenarioTitle.trim()) return scenarioTitle.trim();
    if (!q) return '空白路线';
    const typeTitle = {
      choice: '选择分支',
      truefalse: '真假分岔',
      fillin: '关键词补完',
      coding: '代码推演',
      programming: '实践事件'
    };
    return `${typeTitle[q.type] || '复习事件'} · ${q.chapter || '综合章节'}`;
  }

  function getGalgameKnowledgeSummary(q) {
    const scenarioSummary = getGalgameScenario(q)?.summary;
    if (typeof scenarioSummary === 'string' && scenarioSummary.trim()) return scenarioSummary.trim();
    const points = getKnowledgePointsForItem(q).slice(0, 3);
    if (!points.length) return '本幕没有显式考点标签，先按题干线索推进。';
    if (points.length === 1) return `本幕主线是「${points[0]}」，先把这个点吃透。`;
    return `本幕主线围绕「${points.join('」「')}」，注意它们之间的边界。`;
  }

  function getGalgameKnowledgePlan(q) {
    const points = getKnowledgePointsForItem(q);
    const primary = points[0] || '题干线索';
    const related = points.slice(1, 6);
    const lectureHint = state.kpLectureMap && state.kpLectureMap[primary] ? state.kpLectureMap[primary] : '';
    const count = state.knowledgePointCounts && state.knowledgePointCounts[primary] ? state.knowledgePointCounts[primary] : 0;
    const scenario = getGalgameScenario(q);
    const scenarioPlan = scenario && typeof scenario.plan === 'object' ? scenario.plan : {};
    return {
      primary: typeof scenarioPlan.primary === 'string' && scenarioPlan.primary.trim() ? scenarioPlan.primary.trim() : primary,
      related: Array.isArray(scenarioPlan.related) && scenarioPlan.related.length ? scenarioPlan.related.filter(Boolean).map(String) : related,
      lectureHint: typeof scenarioPlan.lectureHint === 'string' && scenarioPlan.lectureHint.trim() ? scenarioPlan.lectureHint.trim() : lectureHint,
      count,
      summary: typeof scenarioPlan.summary === 'string' && scenarioPlan.summary.trim()
        ? scenarioPlan.summary.trim()
        : points.length
        ? `先锁定「${primary}」，再用关联点校验边界。`
        : '先读题干条件，再从选项或代码里反推考点。'
    };
  }

  function normalizeGalgameScenarios(raw) {
    if (!raw) return {};
    const source = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw.items) ? raw.items : Object.entries(raw).map(([key, value]) => Object.assign({ key }, value)));
    const map = {};
    source.forEach(item => {
      if (!item || typeof item !== 'object') return;
      const key = String(item.key || item.id || '').trim();
      if (!key) return;
      map[key] = item;
    });
    return map;
  }

  function getGalgameScenario(q) {
    if (!q || !state.galgameScenarioMap) return null;
    const key = getProgressKeyForItem(q);
    return state.galgameScenarioMap[key] || state.galgameScenarioMap[String(q.id)] || null;
  }

  function pickScenarioField(scenario, event, field) {
    if (!scenario || !event) return '';
    const direct = scenario[event];
    if (direct && typeof direct === 'object' && typeof direct[field] === 'string') return direct[field].trim();
    const events = scenario.events || {};
    if (events[event] && typeof events[event][field] === 'string') return events[event][field].trim();
    return '';
  }

  function getGalgameStoryBeat(q, event = 'intro') {
    const scenarioStory = pickScenarioField(getGalgameScenario(q), event, 'story');
    if (scenarioStory) return scenarioStory;
    const routeTitle = getGalgameRouteTitle(q);
    const scene = getGalgameSceneForQuestion(q);
    const rank = getGalgameAffectionRank();
    const beats = {
      intro: [
        `澪把练习册推到你面前，窗外的光落在「${q?.chapter || '综合复习'}」这一页。她靠得比平时近一些，只点了点题干最关键的地方。`,
        `新的事件在${scene.location}展开。澪把选项当成几条分支路线排开，等你先判断哪一条最稳。好感阶段：${rank.label}。`,
        `复习线推进到 ${routeTitle}。这一幕不急着抢答案，先把题干里的限制条件读清楚，她会在旁边盯着你的理由。`
      ],
      answer: [
        '解析幕已经打开。澪把正确路线和干扰路线并排放好，让你先看结论，再回到题干核对证据。',
        '答案不是终点，而是本幕的回想片段。把错因和关键条件对上，她才会满意地点头。',
        '澪把讲义翻到对应页，示意你慢慢看：这一段会解释为什么别的分支走不通，也会决定这次好感能不能继续升温。'
      ],
      next: [
        `你把这一页轻轻合上，路线图翻到下一格。${scene.location}的光线换了角度，新的限制条件也跟着浮现。`,
        `下一幕接上来了。澪先把「${q?.chapter || '综合复习'}」的标题圈住，像是在提醒：剧情转场，考点也会换。`,
        `翻页声落下，${routeTitle} 开始。她没有把答案递过来，只把题干往你这边推近了一点。`
      ],
      prev: [
        '你回到上一幕。澪把书签重新夹回刚才的位置，等你补上那条没有走完的推理线。',
        `路线倒回 ${routeTitle}。这一次不用急着选，先看清楚上次错过的条件。`,
        `回看事件触发。${scene.location}安静下来，题干里容易漏掉的词反而更明显了。`
      ],
      correct: [
        '你选中正确分支时，澪靠近了一点，声音压得很轻：这次判断很漂亮。好感度也跟着亮了一格。',
        '选择落定，剧情顺利推进。澪提醒你把刚才那个判断点留在短时记忆里。',
        '这次路线判断成功。题库进度向前亮了一格，下一幕可以稍微大胆一点，她似乎也更期待你的回答。'
      ],
      wrong: [
        '分支暂时走偏了。澪没有责怪，只是把解析推近一些，低声说：别躲，先把错因抓住。好感度也会因为犹豫稍微降温。',
        '错误路线触发了回看事件。先别急着下一题，这里藏着一个容易混淆的边界。',
        '本幕进入慢读。澪把题干里的关键词圈出来，提醒你从条件而不是直觉开始。'
      ],
      selected: [
        '你按下选项的瞬间，路线图短暂亮起。澪没有急着判定，只让你先记住刚才做判断的理由。',
        `分支选择完成。${scene.location}里像是安静了一秒，等解析幕把伏笔逐条翻出来。`,
        '你刚选完，她就把指尖停在题干旁边，轻声提醒：别只看结果，等会儿要说出理由。'
      ],
      streak: [
        `连续 ${state.galgameStreak.correct} 次选择正确，夏日复习线的节奏明显变亮了。澪看你的眼神也更柔和。`,
        `连胜 ${state.galgameStreak.correct}。澪把一张新的回想便签贴到书页边缘，好感度悄悄上升。`
      ],
      slump: [
        `连续 ${state.galgameStreak.wrong} 次卡住，澪切到慢读模式：先暂停推进，把相似概念分开。她没有离开，只是把语速放慢。`,
        `错误分支连续出现。她把菜单里的复习路线打开，等你把这一段补稳。空气稍微降温，但路线还没断。`
      ],
      affectionDown: [
        `好感度降到「${rank.label}」阶段。澪轻轻敲了敲题干：先别撒娇，把理由补完整再继续。`,
        `路线气氛稍微降温。${scene.location}安静下来，她把解析推近，等你把这次失误补回来。`
      ],
      mastered: [
        '这一题被盖上掌握印章。路线图上多了一段稳定的亮色，好感节点也被记录下来。',
        '澪把这题移出危险区，提醒你过一会儿再用复习队列回看。她说完又补了一句：做得不错。'
      ],
      review: [
        '这题被放进复习队列。它会在稍后的剧情里重新出现。',
        '澪在页角写下“待回看”，像给后面的你留下一个伏笔。'
      ],
      notebook: [
        '路线手账摊开在桌面上，主考点、错题伏笔和复习进度都被整理成了能继续推进的线索。',
        '澪把书签移到当前考点旁边：先看路线，再处理题干，这样不会被细节带偏。'
      ],
      complete: [
        '题库路线抵达终章节点。新的 CG 片段被点亮，所有曾经卡住的地方都成了路线的一部分。',
        '终章事件解锁。澪合上练习册，认真地说：这条路线，你真的走完了。'
      ],
      favorite: [
        '这题被加入回想收藏。以后可以直接回到这一幕重看，像把两个人都记得的场景收进相册。',
        '澪把这一页夹上书签：这类题值得在考前再看一次。她似乎很满意你愿意留下线索。'
      ],
      unfavorite: [
        '你把这一幕从回想里撤下。澪没有多说，只是把书签收回去，气氛短暂安静了一点。',
        '收藏被取消，这段回想暂时合上。她提醒你：重要场景别太轻易错过。'
      ],
      markedWrong: [
        '这一幕被标成错题伏笔。澪把它放进路线手账的醒目位置，等你下一轮回收。',
        '错题标记落下，不是坏结局，只是提醒你这里还有一条没走稳的支线。'
      ],
      affectionMilestone: [
        `好感度进入「${rank.label}」阶段。澪把书页往你这边推近，声音也比刚才更轻：这条路线，我们继续走。`,
        `新的好感节点点亮。${scene.location}的光像被调暖了一点，澪认真看着你，等你把下一题也说清楚。`
      ]
    };
    const list = beats[event] || beats.intro;
    return pickFrom(list, `story:${event}:${q?.id}:${state.focusIndex}:${state.galgameAffection}:${state.galgameStreak.correct}:${state.galgameStreak.wrong}`);
  }

  function getGalgameLine(q, event = 'intro', meta = {}) {
    const scenarioLine = pickScenarioField(getGalgameScenario(q), event, 'line');
    if (scenarioLine) return scenarioLine;
    const chapter = q?.chapter ? `「${q.chapter}」` : '这一节';
    const rank = getGalgameAffectionRank();
    const introLines = [
      `${chapter}的剧情线开始。靠近一点读题，我会陪你把题干拆开。${getGalgameStudyHint(q)}`,
      `这一幕轮到${chapter}。先别急着选，你的理由我要听清楚。${getGalgameStudyHint(q)}`,
      `翻到新的题页了。好感阶段是「${rank.label}」，这次也别让我失望哦。${getGalgameStudyHint(q)}`
    ];
    const answerLines = [
      '解析已经解锁。现在不是跳过剧情的时候，我们把关键条件一条条对上。',
      '答案出现了。先看结论，再回到题干确认它为什么只能这样。',
      '这段解析就是本幕的真相线索，读完再推进会更稳。'
    ];
    const nextLines = [
      `下一幕开始。${getGalgameStudyHint(q)}`,
      `路线推进到${chapter}。先读题干，再决定这次该走哪条分支。`,
      `翻页了。澪把练习册往你这边推近一点：这幕别走神。${getGalgameStudyHint(q)}`
    ];
    const prevLines = [
      `回到${chapter}。把刚才没读透的地方补上，路线就会顺很多。`,
      '回看上一幕不是倒退，是把伏笔收回来。',
      '你回头看这一题时，她没有催你，只是安静等你把思路接上。'
    ];
    const correctLines = [
      '答对了。你的路线判断很稳，好感度也悄悄上升。',
      '嗯，这个选择漂亮。下一题之前，把刚才那个判断点记住。',
      '答对了。靠得更近一点说，这题你真的处理得很好。'
    ];
    const wrongLines = [
      '这条路线暂时走偏了。没关系，错题会变成下一次的伏笔。',
      '先停一下。我们不急着翻页，把错因抓出来才算真正推进。',
      '答错也不用躲，我在这里。把解析看完，我们再把场子找回来。'
    ];
    const lines = {
      intro: pickFrom(introLines, `intro:${q?.id}:${state.focusIndex}:${state.galgameAffection}`),
      answer: pickFrom(answerLines, `answer:${q?.id}:${state.focusIndex}`),
      next: pickFrom(nextLines, `next:${q?.id}:${state.focusIndex}:${state.galgameAffection}`),
      prev: pickFrom(prevLines, `prev:${q?.id}:${state.focusIndex}:${state.galgameAffection}`),
      correct: pickFrom(correctLines, `correct:${q?.id}:${state.galgameStreak.correct}`),
      wrong: pickFrom(wrongLines, `wrong:${q?.id}:${state.galgameStreak.wrong}`),
      selected: meta.choice ? `你选择了 ${meta.choice} 分支。先别急着翻页，我们马上核对这条路线的证据。` : '分支已经选定。接下来要看它和题干证据是否对得上。',
      review: '我先把它放进复习路线。晚点回来重读，剧情就会接上。',
      mastered: '这题盖章通过。已经掌握的章节，会一点点把结局和好感都推亮。',
      favorite: '已收藏。这类关键场景，之后值得一起回看。',
      unfavorite: '回想书签收回去了。下次如果又想起这一幕，我们再把它夹回来。',
      markedWrong: '我把它记成错题伏笔。下一次再遇到这类边界，就从这里接着往下走。',
      empty: '当前条件下没有题目。换个筛选条件，也许会打开新的路线。',
      streak: `连胜 ${state.galgameStreak.correct} 次。节奏很好，今天的复习线和好感度都在变亮。`,
      slump: `连续 ${state.galgameStreak.wrong} 次卡住了。先别硬冲，我把节奏放慢陪你读。`,
      affectionDown: `好感降到「${meta.rank || rank.label}」。别慌，把这一题补回来，气氛还能升温。`,
      affectionMilestone: `好感进入「${meta.rank || rank.label}」。别移开视线，下一题也把理由说给我听。`,
      complete: '题库路线已经推进到一个重要节点。辛苦了，新的回想片段已解锁。'
    };
    return lines[event] || lines.intro;
  }

  function setGalgameStory(q, event = 'intro') {
    const panel = document.getElementById('galgame-story-panel');
    const kicker = document.getElementById('galgame-story-kicker');
    const title = document.getElementById('galgame-story-title');
    const text = document.getElementById('galgame-story-text');
    if (!panel || !title || !text) return;
    const kickerMap = {
      answer: 'Review Scene',
      correct: 'Branch Result',
      wrong: 'Branch Result',
      selected: 'Branch Select',
      next: 'Scene Shift',
      prev: 'Replay Scene',
      streak: 'Memory Unlock',
      slump: 'Slow Read',
      notebook: 'Route Notebook',
      markedWrong: 'Bad End Flag',
      affectionDown: 'Affection Down',
      affectionMilestone: 'Affection Scene',
      complete: 'Finale'
    };
    if (kicker) kicker.textContent = kickerMap[event] || 'Route Log';
    title.textContent = getGalgameRouteTitle(q);
    text.textContent = getGalgameStoryBeat(q, event);
    panel.classList.remove('pulse');
    requestAnimationFrame(() => panel.classList.add('pulse'));
  }

  function updateGalgameNotebook(q, scene) {
    const notebook = document.getElementById('galgame-route-notebook');
    const popover = document.getElementById('galgame-notebook-popover');
    if (!notebook && !popover) return;
    const title = document.getElementById('galgame-notebook-title');
    const summary = document.getElementById('galgame-notebook-summary');
    const stats = document.getElementById('galgame-notebook-stats');
    const tags = document.getElementById('galgame-notebook-tags');
    const popoverTitle = document.getElementById('galgame-notebook-popover-title');
    const popoverSummary = document.getElementById('galgame-notebook-popover-summary');
    const popoverStats = document.getElementById('galgame-notebook-popover-stats');
    const popoverTags = document.getElementById('galgame-notebook-popover-tags');
    const counts = getProgressCounts();
    const ratio = Math.round(getGalgameProgressRatio() * 100);
    const affectionRank = getGalgameAffectionRank();
    const currentKey = q ? getProgressKeyForItem(q) : '';
    const status = currentKey ? getQuestionStatus(currentKey) : '';
    const plan = q ? getGalgameKnowledgePlan(q) : null;
    const statusLabel = status === 'mastered' ? '已掌握' : status === 'review' ? '待复习' : status === 'wrong' ? '错题伏笔' : '未标记';
    const titleText = plan ? plan.primary : '攻略手账';
    const summaryText = plan
      ? `${plan.summary}${scene?.location ? ` · ${scene.location}` : ''}`
      : '当前路线的考点与进度会记录在这里。';
    const statsHtml = `
      <span><b>${escapeHtml(String(ratio))}%</b> 掌握</span>
      <span><b>${escapeHtml(String(counts.review || 0))}</b> 待复习</span>
      <span><b>${escapeHtml(String(counts.wrong || 0))}</b> 错题</span>
      <span><b>${escapeHtml(statusLabel)}</b> 本幕</span>
      <span><b>${escapeHtml(String(state.galgameAffection))}</b> 好感</span>
      <span><b>${escapeHtml(affectionRank.label)}</b> 关系</span>
    `;
    const related = plan ? [plan.primary, ...plan.related].filter(Boolean) : [];
    const tagsHtml = related.length
      ? related.slice(0, 6).map(kp => `<span>${escapeHtml(kp)}</span>`).join('')
      : '<span>题干线索</span>';
    [title, popoverTitle].forEach(el => {
      if (el) el.textContent = titleText;
    });
    [summary, popoverSummary].forEach(el => {
      if (el) el.textContent = summaryText;
    });
    [stats, popoverStats].forEach(el => {
      if (el) el.innerHTML = statsHtml;
    });
    [tags, popoverTags].forEach(el => {
      if (el) el.innerHTML = tagsHtml;
    });
  }

  function closeGalgameNotebook() {
    const popover = document.getElementById('galgame-notebook-popover');
    if (popover) popover.hidden = true;
  }

  function openGalgameNotebook() {
    const notebook = document.getElementById('galgame-route-notebook');
    const popover = document.getElementById('galgame-notebook-popover');
    if (!shouldUseGalgameStage()) return;
    const q = getCurrentFocusItem();
    updateGalgameNotebook(q, getGalgameSceneForQuestion(q));
    if (notebook) {
      notebook.classList.remove('spotlight');
      requestAnimationFrame(() => notebook.classList.add('spotlight'));
    }
    if (popover) {
      popover.hidden = false;
      popover.classList.remove('spotlight');
      requestAnimationFrame(() => popover.classList.add('spotlight'));
    }
    setGalgameStory(q, 'notebook');
    setGalgameDialogue('路线手账已打开。先把主考点、错题伏笔和掌握度对齐，再继续推进这一幕。', 'serious');
  }

  function spotlightGalgameNotebook() {
    openGalgameNotebook();
  }

  function setGalgameDialogue(line, expression) {
    const textEl = document.getElementById('galgame-dialogue-text');
    const characterEl = document.getElementById('galgame-character');
    if (textEl && line) textEl.textContent = line;
    if (characterEl && expression && GALGAME_ASSETS.characters[expression]) {
      characterEl.src = GALGAME_ASSETS.characters[expression];
    }
  }

  function showGalgameEffect(kind, message) {
    if (!state.galgameMode) return;
    const layer = document.getElementById('galgame-effect-layer');
    if (!layer) return;
    const effectKind = kind || 'info';
    const effectTitle = {
      success: '路线推进',
      warning: '慢读事件',
      complete: 'CG 解锁',
      affection: '好感变化',
      info: '路线提示'
    }[effectKind] || '路线提示';
    const effectKicker = {
      success: 'Memory Fragment',
      warning: 'Bad End Avoided',
      complete: 'Finale Cut-in',
      affection: 'Affection Route',
      info: 'Route Notice'
    }[effectKind] || 'Route Notice';
    layer.innerHTML = `
      <div class="galgame-effect-card ${effectKind}">
        <span>${escapeHtml(effectKicker)}</span>
        <strong>${escapeHtml(effectTitle)}</strong>
        <em>${escapeHtml(message || '')}</em>
      </div>
    `;
    layer.classList.remove('visible');
    requestAnimationFrame(() => layer.classList.add('visible'));
    clearTimeout(layer._effectTimer);
    layer._effectTimer = setTimeout(() => layer.classList.remove('visible'), effectKind === 'complete' ? 3200 : 2300);
  }

  function getGalgameProgressRatio() {
    const total = getCurrentProgressKeys().size || state.allItems.length || 0;
    if (!total) return 0;
    const mastered = getProgressCounts().mastered || 0;
    return mastered / total;
  }

  function triggerGalgameMilestones() {
    if (!state.galgameMode) return false;
    let triggered = false;
    const ratio = getGalgameProgressRatio();
    const milestones = [
      { key: 'p25', value: 0.25, label: '回想片段 25%' },
      { key: 'p50', value: 0.5, label: '回想片段 50%' },
      { key: 'p75', value: 0.75, label: '回想片段 75%' },
      { key: 'p100', value: 1, label: '终章 CG' }
    ];
    milestones.forEach(ms => {
      if (ratio >= ms.value && !state.galgameEventHistory[ms.key]) {
        state.galgameEventHistory[ms.key] = true;
        triggered = true;
        showGalgameEffect(ms.value >= 1 ? 'complete' : 'success', ms.label);
        setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), ms.value >= 1 ? 'complete' : 'mastered'), 'happy');
        setGalgameStory(getCurrentFocusItem(), ms.value >= 1 ? 'complete' : 'mastered');
      }
    });
    return triggered;
  }

  function handleGalgameAttemptResult(isCorrect) {
    if (!state.galgameMode) return;
    const q = getCurrentFocusItem();
    const key = getProgressKeyForItem(q);
    if (isCorrect) {
      const wasAdded = adjustGalgameAffectionOnce(`${key}:correct`, 3, 'correct');
      if (wasAdded) {
        state.galgameStreak.correct += 1;
        state.galgameStreak.wrong = 0;
        if (state.galgameStreak.correct > 1 && state.galgameStreak.correct % 3 === 0) {
          adjustGalgameAffection(2, 'streak');
          setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'streak'), 'happy');
          setGalgameStory(getCurrentFocusItem(), 'streak');
          showGalgameEffect('success', `连胜 ${state.galgameStreak.correct}`);
        }
      }
    } else {
      const wasWrongAdded = adjustGalgameAffectionOnce(`${key}:wrong`, -2, 'wrong');
      if (wasWrongAdded) {
        state.galgameStreak.wrong += 1;
        state.galgameStreak.correct = 0;
        if (state.galgameStreak.wrong > 1 && state.galgameStreak.wrong % 3 === 0) {
          adjustGalgameAffection(-3, 'slump');
          setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'slump'), 'sad');
          setGalgameStory(getCurrentFocusItem(), 'slump');
          showGalgameEffect('warning', '慢读模式');
        }
      }
    }
    triggerGalgameMilestones();
  }

  function getGalgameAudioElements() {
    return {
      bgm: document.getElementById('galgame-bgm'),
      bgs: document.getElementById('galgame-bgs'),
      se: document.getElementById('galgame-se')
    };
  }

  function applyGalgameAudioVolumes() {
    const { bgm, bgs, se } = getGalgameAudioElements();
    const bgmVolume = (state.settings.galgameBgmVolume || 35) / 100;
    const seVolume = (state.settings.galgameSeVolume || 55) / 100;
    if (bgm) bgm.volume = bgmVolume;
    if (bgs) bgs.volume = Math.min(0.35, bgmVolume * 0.7);
    if (se) se.volume = seVolume;
  }

  function playGalgameSe(name) {
    if (!state.galgameMode || !state.settings.galgameAudio) return;
    const src = GALGAME_ASSETS.audio.se[name];
    const se = document.getElementById('galgame-se');
    if (!src || !se) return;
    se.src = src;
    applyGalgameAudioVolumes();
    se.currentTime = 0;
    se.play().catch(() => {});
  }

  function startGalgameAmbient(scene) {
    const { bgm, bgs } = getGalgameAudioElements();
    if (!state.galgameMode || !state.settings.galgameAudio || !state.galgameAudioReady) {
      if (bgm) bgm.pause();
      if (bgs) bgs.pause();
      return;
    }
    applyGalgameAudioVolumes();
    const bgmSrc = GALGAME_ASSETS.audio.bgm[scene.bgm] || GALGAME_ASSETS.audio.bgm.summer;
    if (bgm && !bgm.src.endsWith(bgmSrc)) {
      bgm.src = bgmSrc;
    }
    if (bgs && !bgs.src.endsWith(GALGAME_ASSETS.audio.bgs)) {
      bgs.src = GALGAME_ASSETS.audio.bgs;
    }
    if (bgm) bgm.play().catch(() => {});
    if (bgs) bgs.play().catch(() => {});
  }

  function syncGalgameMenuSliders() {
    const bgmInput = document.getElementById('galgame-bgm-volume');
    const seInput = document.getElementById('galgame-se-volume');
    if (bgmInput) bgmInput.value = state.settings.galgameBgmVolume || 35;
    if (seInput) seInput.value = state.settings.galgameSeVolume || 55;
    updateGalgameVolumeLabels();
  }

  function updateGalgameVolumeLabels() {
    const labelPairs = [
      ['galgame-entry-bgm-volume', 'galgame-entry-bgm-value'],
      ['galgame-entry-se-volume', 'galgame-entry-se-value'],
      ['galgame-bgm-volume', 'galgame-bgm-volume-value'],
      ['galgame-se-volume', 'galgame-se-volume-value']
    ];
    labelPairs.forEach(([inputId, labelId]) => {
      const input = document.getElementById(inputId);
      const label = document.getElementById(labelId);
      if (!input || !label) return;
      label.textContent = `${clampGalgameVolume(input.value, 0)}%`;
    });
  }

  function syncGalgameEntrySettings(variant = 'romance', syncSliders = true) {
    const modal = document.getElementById('galgame-choice-modal');
    const note = document.getElementById('galgame-rating-note');
    const bgmInput = document.getElementById('galgame-entry-bgm-volume');
    const seInput = document.getElementById('galgame-entry-se-volume');
    const audioInput = document.getElementById('galgame-entry-audio');
    if (modal) modal.dataset.variant = 'romance';
    if (note) note.textContent = '恋爱喜剧氛围：对白更贴近 Galgame 的陪伴感与距离感，但题干、解析和刷题节奏优先。';
    if (syncSliders) {
      if (bgmInput) bgmInput.value = state.settings.galgameBgmVolume || 35;
      if (seInput) seInput.value = state.settings.galgameSeVolume || 55;
      if (audioInput) audioInput.checked = state.settings.galgameAudio !== false;
    }
    if (bgmInput) bgmInput.disabled = audioInput && !audioInput.checked;
    if (seInput) seInput.disabled = audioInput && !audioInput.checked;
    updateGalgameVolumeLabels();
  }

  function getGalgameEntryVariant() {
    return 'romance';
  }

  function saveGalgameEntrySettings() {
    const bgmInput = document.getElementById('galgame-entry-bgm-volume');
    const seInput = document.getElementById('galgame-entry-se-volume');
    const audioInput = document.getElementById('galgame-entry-audio');
    state.settings.galgameAudio = audioInput ? !!audioInput.checked : state.settings.galgameAudio !== false;
    state.settings.galgameBgmVolume = clampGalgameVolume(bgmInput?.value, state.settings.galgameBgmVolume || 35);
    state.settings.galgameSeVolume = clampGalgameVolume(seInput?.value, state.settings.galgameSeVolume || 55);
    state.galgameVariant = getGalgameEntryVariant();
    applyGalgameAudioVolumes();
    syncGalgameMenuSliders();
  }

  function stopGalgameAmbient() {
    const { bgm, bgs } = getGalgameAudioElements();
    if (bgm) bgm.pause();
    if (bgs) bgs.pause();
  }

  function enableGalgameAudioFromUserGesture() {
    if (!state.galgameMode) return;
    state.galgameAudioReady = true;
    if (!shouldUseGalgameStage()) {
      stopGalgameAmbient();
      return;
    }
    startGalgameAmbient(getGalgameSceneForQuestion(getCurrentFocusItem()));
  }

  function updateGalgameStageVisibility() {
    const stage = document.getElementById('galgame-stage');
    const list = document.getElementById('question-list');
    const nav = document.getElementById('focus-navigation');
    const host = document.getElementById('galgame-question-host');
    const shouldShow = shouldUseGalgameStage();
    document.body.classList.toggle('galgame-immersive-active', shouldShow);
    if (stage) stage.hidden = !shouldShow;
    if (list) list.classList.toggle('galgame-source-list', shouldShow);
    if (nav) nav.classList.toggle('galgame-nav', shouldShow);
    if (!shouldShow) {
      document.body.classList.remove('galgame-answer-open');
      if (host) host.innerHTML = '';
      closeGalgameNotebook();
      stopGalgameAmbient();
    } else {
      resetGalgameStageScroll();
    }
  }

  function resetGalgameStageScroll() {
    if (!shouldUseGalgameStage()) return;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      ['galgame-stage', 'galgame-question-shell', 'galgame-question-host'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollTop = 0;
        el.scrollLeft = 0;
      });
    });
  }

  function updateGalgameStage(event = 'intro') {
    updateGalgameStageVisibility();
    if (!shouldUseGalgameStage()) return;
    const q = getCurrentFocusItem();
    const stage = document.getElementById('galgame-stage');
    const bg = document.getElementById('galgame-bg');
    const character = document.getElementById('galgame-character');
    const host = document.getElementById('galgame-question-host');
    const progress = document.getElementById('galgame-progress');
    const routeProgress = document.getElementById('galgame-route-progress');
    const location = document.getElementById('galgame-location');
    const sourceCard = document.querySelector('#question-list > .question-card') || host.querySelector('.question-card');
    const emptyState = document.querySelector('#question-list > .empty-state');
    if (!stage || !host) return;
    if (!q && emptyState) {
      host.innerHTML = '';
      host.appendChild(emptyState);
      setGalgameDialogue(getGalgameLine(null, 'empty'), 'sad');
      return;
    }
    if (!q || !sourceCard) return;
    const scene = getGalgameSceneForQuestion(q);
    const bgPath = GALGAME_ASSETS.backgrounds[scene.bg] || GALGAME_ASSETS.backgrounds.duskRoom;
    if (bg) bg.style.backgroundImage = `url("${bgPath}")`;
    if (character && character.getAttribute('src') !== GALGAME_ASSETS.characters[scene.expression]) {
      character.src = GALGAME_ASSETS.characters[scene.expression];
    }
    if (progress) progress.textContent = `第 ${state.focusIndex + 1} / ${state.filtered.length} 题`;
    if (routeProgress) {
      const ratio = Math.round(getGalgameProgressRatio() * 100);
      const counts = getProgressCounts();
      routeProgress.textContent = `掌握 ${ratio}% · 错题 ${counts.wrong}`;
    }
    updateGalgameAffectionDisplay();
    if (location) location.textContent = scene.location;
    if (!host.contains(sourceCard)) {
      host.innerHTML = '';
      host.appendChild(sourceCard);
    }
    const key = `${scene.bg}:${scene.bgm}:${q.type}:${q.id}`;
    if (state.galgameCurrentScene !== key) {
      state.galgameCurrentScene = key;
      sourceCard.classList.add('galgame-card-enter');
      setTimeout(() => sourceCard.classList.remove('galgame-card-enter'), 420);
    }
    setGalgameDialogue(getGalgameLine(q, event), scene.expression);
    setGalgameStory(q, event);
    updateGalgameNotebook(q, scene);
    startGalgameAmbient(scene);
  }

  function openGalgameChoiceModal(triggerLabel = '隐藏路线') {
    const modal = document.getElementById('galgame-choice-modal');
    if (!modal) return;
    syncGalgameEntrySettings('romance', true);
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    showToast(`${triggerLabel}已触发`, 'success');
  }

  function closeGalgameChoiceModal() {
    const modal = document.getElementById('galgame-choice-modal');
    if (!modal) return;
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }

  function enterGalgameMode() {
    closeGalgameChoiceModal();
    state.galgameMode = true;
    state.galgameVariant = 'romance';
    state.quizMode = 'focus';
    state.galgameAudioReady = state.settings.galgameAudio !== false;
    normalizeSettings();
    saveJsonToStorage(SETTINGS_KEY, state.settings);
    saveViewState();
    window._goToPage('quiz');
    applyGalgameModeClass();
    syncUIWithState();
    renderQuestionList();
    updateGalgameStage('intro');
    showGalgameEffect('affection', `${getGalgameAffectionRank().label} · 好感 ${state.galgameAffection}`);
  }

  function exitGalgameMode() {
    state.galgameMode = false;
    saveJsonToStorage(SETTINGS_KEY, state.settings);
    document.body.classList.remove('galgame-mode', 'galgame-immersive-active', 'galgame-variant-romance');
    delete document.body.dataset.galgameAffection;
    state.quizMode = 'list';
    saveViewState();
    closeGalgameMenu();
    closeGalgameNotebook();
    stopGalgameAmbient();
    syncUIWithState();
    renderQuestionList();
    updateBackToTopVisibility();
  }

  function openGalgameMenu() {
    const menu = document.getElementById('galgame-menu');
    if (!menu) return;
    menu.hidden = false;
    syncGalgameMenuSliders();
    applyGalgameAudioVolumes();
  }

  function closeGalgameMenu() {
    const menu = document.getElementById('galgame-menu');
    if (!menu) return;
    menu.hidden = true;
  }

  function initGalgameEntrances() {
    const logo = document.querySelector('.logo');
    let logoClicks = 0;
    let logoTimer = null;
    if (logo) {
      logo.addEventListener('click', (e) => {
        logoClicks += 1;
        clearTimeout(logoTimer);
        logoTimer = setTimeout(() => { logoClicks = 0; }, 1200);
        if (logoClicks >= 6) {
          e.preventDefault();
          logoClicks = 0;
          openGalgameChoiceModal('Logo 彩蛋');
        }
      });
    }

    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a','b','a'];
    let konamiIndex = 0;
    document.addEventListener('keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === konami[konamiIndex]) {
        konamiIndex += 1;
        if (konamiIndex === konami.length) {
          konamiIndex = 0;
          openGalgameChoiceModal('神秘键位');
        }
      } else {
        konamiIndex = key === konami[0] ? 1 : 0;
      }
    });

    const confirmBtn = document.getElementById('galgame-enter-confirm');
    const cancelBtn = document.getElementById('galgame-enter-cancel');
    const entryAudio = document.getElementById('galgame-entry-audio');
    const entryBgm = document.getElementById('galgame-entry-bgm-volume');
    const entrySe = document.getElementById('galgame-entry-se-volume');
    if (entryAudio) {
      entryAudio.addEventListener('change', () => {
        const enabled = !!entryAudio.checked;
        if (entryBgm) entryBgm.disabled = !enabled;
        if (entrySe) entrySe.disabled = !enabled;
      });
    }
    [entryBgm, entrySe].forEach(input => {
      if (input) input.addEventListener('input', updateGalgameVolumeLabels);
    });
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        saveGalgameEntrySettings();
        enterGalgameMode();
      });
    }
    if (cancelBtn) cancelBtn.addEventListener('click', closeGalgameChoiceModal);
    syncGalgameEntrySettings('romance', true);

    const menuOpen = document.getElementById('galgame-menu-open');
    if (menuOpen) menuOpen.addEventListener('click', openGalgameMenu);
    const resume = document.getElementById('galgame-menu-resume');
    if (resume) resume.addEventListener('click', closeGalgameMenu);
    const notebook = document.getElementById('galgame-menu-notebook');
    if (notebook) notebook.addEventListener('click', () => {
      closeGalgameMenu();
      spotlightGalgameNotebook();
    });
    const review = document.getElementById('galgame-menu-review');
    if (review) review.addEventListener('click', () => {
      closeGalgameMenu();
      window.startTodayReview();
    });
    const progress = document.getElementById('galgame-menu-progress');
    if (progress) progress.addEventListener('click', () => {
      closeGalgameMenu();
      window._goToPage('progress');
    });
    const exit = document.getElementById('galgame-menu-exit');
    if (exit) exit.addEventListener('click', exitGalgameMode);
    const notebookClose = document.getElementById('galgame-notebook-close');
    if (notebookClose) notebookClose.addEventListener('click', closeGalgameNotebook);
    const notebookPopover = document.getElementById('galgame-notebook-popover');
    if (notebookPopover) {
      notebookPopover.addEventListener('click', (e) => {
        if (e.target === notebookPopover) closeGalgameNotebook();
      });
    }
  }

  // ============================================================
  // 视图状态保存与恢复 (刷新持久化)
  // ============================================================
  function saveViewState() {
    const viewState = {
      quizMode: state.quizMode,
      currentType: state.currentType,
      currentChapter: state.currentChapter,
      currentStatus: state.currentStatus,
      selectedKnowledgePoint: state.selectedKnowledgePoint,
      favoritesOnly: state.favoritesOnly,
      listPageCount: listPageCount
    };
    saveJsonToStorage('oop_view_state', viewState);
  }

  function loadViewState() {
    const saved = loadJsonFromStorage('oop_view_state', null);
    if (saved) {
      if (saved.quizMode) state.quizMode = saved.quizMode;
      if (saved.currentType) state.currentType = saved.currentType;
      if (saved.currentChapter) state.currentChapter = saved.currentChapter;
      if (saved.currentStatus) state.currentStatus = saved.currentStatus;
      if (saved.selectedKnowledgePoint) state.selectedKnowledgePoint = saved.selectedKnowledgePoint;
      if (saved.favoritesOnly) state.favoritesOnly = saved.favoritesOnly;
      if (saved.listPageCount) listPageCount = saved.listPageCount;
    }
  }

  function syncUIWithState() {
    // 同步题型筛选激活状态
    document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === state.currentType);
    });

    // 同步状态/收藏筛选激活状态
    document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
      if (btn.id === 'favorites-only') {
        btn.classList.toggle('active', !!state.favoritesOnly);
      } else {
        btn.classList.toggle('active', btn.dataset.status === state.currentStatus);
      }
    });

    // 同步章节筛选下拉框值
    const chapterSelect = document.getElementById('chapter-filter');
    if (chapterSelect) {
      chapterSelect.value = state.currentChapter || 'all';
    }

    // 同步知识点筛选下拉框值
    const knowledgeSelect = document.getElementById('knowledge-filter');
    if (knowledgeSelect) {
      knowledgeSelect.value = state.selectedKnowledgePoint || 'all';
    }

    // 同步刷题模式按钮状态
    document.querySelectorAll('#mode-filters .filter-btn').forEach(btn => {
      const isModeActive = btn.dataset.mode === state.quizMode && !state.reviewQueueActive;
      btn.classList.toggle('active', btn.id === 'today-review' ? state.reviewQueueActive : isModeActive);
    });

    const galgameAudioToggle = document.getElementById('galgame-audio-toggle');
    if (galgameAudioToggle) {
      galgameAudioToggle.classList.toggle('muted', state.settings.galgameAudio === false);
      galgameAudioToggle.setAttribute('aria-pressed', state.settings.galgameAudio === false ? 'false' : 'true');
    }

    updateTodayReviewButton();
  }

  function exitReviewQueue(options = {}) {
    if (!state.reviewQueueActive) return false;
    const restoreFocus = options.keepFocus !== true && state.reviewQueuePreviousMode === 'focus';
    state.reviewQueueActive = false;
    state.reviewQueueKeys = [];
    if (options.keepMode !== true && state.reviewQueuePreviousMode) {
      state.quizMode = state.reviewQueuePreviousMode;
    }
    if (restoreFocus) {
      state.pendingFocusRestore = {
        key: state.reviewQueuePreviousFocusKey,
        index: state.reviewQueuePreviousFocusIndex || 0
      };
    }
    state.reviewQueuePreviousMode = null;
    state.reviewQueuePreviousFocusIndex = 0;
    state.reviewQueuePreviousFocusKey = null;
    if (options.keepFocus !== true && !restoreFocus) {
      state.focusIndex = 0;
    }
    syncUIWithState();
    return true;
  }

  function restorePendingFocusIndex() {
    const pending = state.pendingFocusRestore;
    if (!pending || state.quizMode !== 'focus') return false;

    let nextIndex = -1;
    if (pending.key) {
      nextIndex = state.filtered.findIndex(q => getProgressKeyForItem(q) === pending.key);
    }
    if (nextIndex === -1 && Number.isInteger(pending.index)) {
      nextIndex = Math.min(Math.max(pending.index, 0), Math.max(state.filtered.length - 1, 0));
    }
    state.pendingFocusRestore = null;

    if (state.filtered.length > 0 && nextIndex >= 0) {
      state.focusIndex = nextIndex;
      return true;
    }
    return false;
  }

  function scheduleFilteredRefreshAfterMutation(key, delay = 0) {
    if (state.quizMode === 'focus') {
      state.pendingFocusRestore = {
        key: key || (state.filtered[state.focusIndex] ? getProgressKeyForItem(state.filtered[state.focusIndex]) : null),
        index: state.focusIndex || 0
      };
    }
    setTimeout(() => filterAndRender(), delay);
  }

  function restoreScrollOrFocusIndex() {
    if (onboardingStarted) {
      state.isReadyForScrollSave = false;
      return;
    }
    const activePage = localStorage.getItem('oop_active_page') || 'quiz';
    
    if (activePage === 'quiz') {
      if (state.quizMode === 'focus') {
        // focusIndex 已在 filterAndRender(true) 中处理恢复
        state.isReadyForScrollSave = true;
      } else {
        const savedScrollY = localStorage.getItem('oop_scroll_y');
        if (savedScrollY) {
          const targetScrollY = parseInt(savedScrollY, 10);
          if (targetScrollY > 0) {
            let attempts = 0;
            const tryScroll = () => {
              window.scrollTo(0, targetScrollY);
              attempts++;
              // 检查实际滚动高度是否接近目标，如果页面未加载完高度不够则重试
              if (Math.abs(window.scrollY - targetScrollY) > 4 && attempts < 15) {
                setTimeout(tryScroll, 60);
              } else {
                state.isReadyForScrollSave = true;
              }
            };
            setTimeout(tryScroll, 100);
          } else {
            state.isReadyForScrollSave = true;
          }
        } else {
          state.isReadyForScrollSave = true;
        }
      }
    } else if (activePage === 'knowledge') {
      const savedScrollY = localStorage.getItem('oop_knowledge_scroll_y');
      if (savedScrollY) {
        const targetScrollY = parseInt(savedScrollY, 10);
        if (targetScrollY > 0) {
          let attempts = 0;
          const tryScroll = () => {
            window.scrollTo(0, targetScrollY);
            attempts++;
            if (Math.abs(window.scrollY - targetScrollY) > 4 && attempts < 15) {
              setTimeout(tryScroll, 60);
            } else {
              state.isReadyForScrollSave = true;
            }
          };
          setTimeout(tryScroll, 100);
        } else {
          state.isReadyForScrollSave = true;
        }
      } else {
        state.isReadyForScrollSave = true;
      }
    } else {
      state.isReadyForScrollSave = true;
    }
  }

  function setQuestionStatus(id, status, options = {}) {
    const key = String(id);
    const shouldToggle = options.toggle !== false;
    const previousStatus = state.userProgress[key] || null;
    if (shouldToggle && state.userProgress[key] === status) {
      delete state.userProgress[key]; // 手动再次点击同一状态时取消标记
    } else {
      state.userProgress[key] = status;
    }
    const nextStatus = state.userProgress[key] || null;
    const changed = previousStatus !== nextStatus;
    saveProgress();
    renderStats();
    renderDashboard();
    renderProgress();
    updateCardActions(id);
    updateTodayReviewButton();
    if (!state.reviewQueueActive && state.currentStatus && changed) {
      scheduleFilteredRefreshAfterMutation(key, options.toggle === false ? 900 : 0);
    }
    return { previousStatus, nextStatus, changed };
  }

  // 更新题目卡片上的状态按钮样式
  function updateCardActions(progressKey) {
    const status = getQuestionStatus(progressKey);
    // progressKey 格式: "q_123" 或 "prog_123"
    const dataId = progressKey.replace(/^q_/, 'q-').replace(/^prog_/, 'prog-');
    const card = document.querySelector(`.question-card[data-id="${dataId}"]`);
    if (!card) return;
    card.querySelectorAll('.status-btn').forEach(btn => {
      const btnStatus = btn.getAttribute('data-status');
      btn.classList.toggle('mastered', btnStatus === 'mastered' && status === 'mastered');
      btn.classList.toggle('review', btnStatus === 'review' && status === 'review');
      btn.classList.toggle('wrong', btnStatus === 'wrong' && status === 'wrong');
    });
  }

  function getQuestionStatus(id) {
    return state.userProgress[String(id)] || null;
  }

  function getProgressKeyForItem(item) {
    if (!item) return '';
    const isProg = item.type === 'programming';
    return isProg ? `prog_${item.id}` : `q_${item.id}`;
  }

  function getCurrentProgressKeys() {
    return new Set(state.allItems.map(getProgressKeyForItem).filter(Boolean));
  }

  function getProgressCounts() {
    const validKeys = getCurrentProgressKeys();
    const progress = { mastered: 0, review: 0, wrong: 0 };
    Object.entries(state.userProgress || {}).forEach(([key, status]) => {
      if (validKeys.has(key) && progress[status] !== undefined) {
        progress[status]++;
      }
    });
    return progress;
  }

  function getRecentCurrentAttempts(limit = 20) {
    const validKeys = getCurrentProgressKeys();
    return (state.attempts || [])
      .filter(item => item && validKeys.has(String(item.id || '')))
      .slice(0, limit);
  }

  window.resetProgress = function () {
    if (confirm('确定要重置所有学习进度吗？\n\n将同时清空：已掌握/待复习/错题标记、作答记录、复习统计。\n不会清空收藏。此操作不可撤销。')) {
      exitReviewQueue({ keepFocus: true });
      state.userProgress = {};
      saveProgress();
      state.attempts = [];
      saveJsonToStorage(ATTEMPTS_KEY, state.attempts);
      state.questionStats = {};
      saveJsonToStorage(STATS_KEY, state.questionStats);
      localStorage.removeItem('oop_onboarding_completed');
      localStorage.removeItem('oop_view_state');
      localStorage.removeItem('oop_last_question_id');
      localStorage.removeItem('oop_scroll_y');
      localStorage.removeItem('oop_knowledge_scroll_y');
      localStorage.removeItem('oop_active_page');
      renderStats();
      renderDashboard();
      renderProgress();
      filterAndRender();
      updateTodayReviewButton();
    }
  };

  function hideLoadingCover() {
    const loader = document.getElementById('app-loading-cover');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 400);
    }
  }

  function applyFontAndSize(font, size) {
    const fontMap = {
      'inter': "'StyreneB', 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
      'system': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      'serif': "Georgia, 'Times New Roman', 'Noto Serif SC', serif",
      'mono': "'JetBrains Mono', 'Fira Code', Consolas, monospace"
    };
    const displayFontMap = {
      'inter': "Copernicus, 'Tiempos Headline', 'Cormorant Garamond', Georgia, 'Times New Roman', serif",
      'system': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      'serif': "Georgia, 'Times New Roman', 'Noto Serif SC', serif",
      'mono': "'JetBrains Mono', 'Fira Code', Consolas, monospace"
    };
    const sizeMap = {
      'small': '14px',
      'normal': '16px',
      'large': '18px',
      'xlarge': '20px'
    };
    if (fontMap[font]) {
      document.documentElement.style.setProperty('--font-sans', fontMap[font]);
    }
    if (displayFontMap[font]) {
      document.documentElement.style.setProperty('--font-display', displayFontMap[font]);
    }
    if (sizeMap[size]) {
      document.documentElement.style.fontSize = sizeMap[size];
    }
  }

  // 兜底应用初始字体字号
  applyFontAndSize(
    localStorage.getItem('oop_font_family') || 'inter',
    localStorage.getItem('oop_font_size') || 'normal'
  );

  // ============================================================
  // 主题管理 (Theme Manager)
  // ============================================================
  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

    function getThemeMode() {
      return localStorage.getItem('oop_theme') || 'system';
    }

    function applyTheme(mode = getThemeMode()) {
      const currentMode = ['system', 'light', 'dark'].includes(mode) ? mode : 'system';
      const resolvedLight = currentMode === 'light' || (currentMode === 'system' && (!media || media.matches));
      document.documentElement.dataset.themeMode = currentMode;
      document.body.classList.toggle('light-theme', !!resolvedLight);
      document.body.classList.toggle('dark-theme', !resolvedLight);
      if (btn) {
        const labels = { system: '跟随系统', light: '浅色', dark: '深色' };
        const label = labels[currentMode] || labels.system;
        const labelEl = btn.querySelector('.header-btn-label');
        if (labelEl) labelEl.textContent = label;
        else btn.textContent = label;
        btn.title = `当前：${label}。点击切换主题。`;
        btn.setAttribute('aria-label', `切换主题，当前：${label}`);
      }
    }

    applyTheme();

    if (media) {
      const onSystemThemeChange = () => {
        if (getThemeMode() === 'system') applyTheme('system');
      };
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onSystemThemeChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(onSystemThemeChange);
      }
    }

    if (btn) {
      btn.addEventListener('click', () => {
        const order = ['system', 'light', 'dark'];
        const current = getThemeMode();
        const next = order[(order.indexOf(current) + 1) % order.length] || 'system';
        localStorage.setItem('oop_theme', next);
        applyTheme(next);
      });
    }
  }

  // ============================================================
  // 设置面板管理
  // ============================================================
  function initSettingsPanel() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('settings-open');
    const closeBtn = document.getElementById('settings-close');
    const saveBtn = document.getElementById('settings-save');

    const inputRedoMode = document.getElementById('redo-mode');
    const inputShuffleMode = document.getElementById('shuffle-mode');
    const inputSeed = document.getElementById('setting-seed');
    const seedGroup = document.getElementById('seed-group');
    const regenBtn = document.getElementById('regenerate-seed');
    const inputFontFamily = document.getElementById('setting-font-family');
    const inputFontSize = document.getElementById('setting-font-size');
    const reopenOnboardingBtn = document.getElementById('settings-reopen-onboarding');

    window.openSettings = function() {
      if (inputRedoMode) inputRedoMode.checked = !!state.settings.redoMode;
      if (inputFontFamily) inputFontFamily.value = localStorage.getItem('oop_font_family') || 'inter';
      if (inputFontSize) inputFontSize.value = localStorage.getItem('oop_font_size') || 'normal';
      if (inputShuffleMode) {
        inputShuffleMode.checked = !!state.settings.shuffle;
        if (seedGroup) {
          seedGroup.style.display = state.settings.shuffle ? 'block' : 'none';
        }
      }
      if (inputSeed) {
        inputSeed.value = state.settings.seed || '';
      }
      modal.classList.add('visible');
    };

    openBtn.addEventListener('click', window.openSettings);
    closeBtn.addEventListener('click', () => { modal.classList.remove('visible'); });
    if (reopenOnboardingBtn) {
      reopenOnboardingBtn.addEventListener('click', () => {
        modal.classList.remove('visible');
        startOnboarding({ manual: true });
      });
    }

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('visible');
    });

    if (inputShuffleMode) {
      inputShuffleMode.addEventListener('change', () => {
        if (seedGroup) {
          seedGroup.style.display = inputShuffleMode.checked ? 'block' : 'none';
        }
      });
    }

    if (regenBtn && inputSeed) {
      regenBtn.addEventListener('click', () => {
        const newSeed = generateSeed();
        inputSeed.value = newSeed;
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        state.settings.redoMode = inputRedoMode ? !!inputRedoMode.checked : false;
        localStorage.setItem('oop_redo_mode', state.settings.redoMode ? '1' : '0');
        normalizeSettings();

        const shuffleChecked = inputShuffleMode ? !!inputShuffleMode.checked : false;
        const enteredSeed = inputSeed ? Number.parseInt(inputSeed.value, 10) : 0;
        const nextSeed = shuffleChecked && enteredSeed > 0 ? enteredSeed : (shuffleChecked ? generateSeed() : state.settings.seed);
        const shuffleChanged = (state.settings.shuffle !== shuffleChecked) || (state.settings.seed !== nextSeed);

        state.settings.shuffle = shuffleChecked;
        if (shuffleChecked) {
          state.settings.seed = nextSeed;
          if (inputSeed) inputSeed.value = state.settings.seed;
        }

        saveJsonToStorage(SETTINGS_KEY, state.settings);

        const fontVal = inputFontFamily ? inputFontFamily.value : 'inter';
        const sizeVal = inputFontSize ? inputFontSize.value : 'normal';
        localStorage.setItem('oop_font_family', fontVal);
        localStorage.setItem('oop_font_size', sizeVal);

        applyFontAndSize(fontVal, sizeVal);

        if (shuffleChanged) {
          applyShuffle();
          filterAndRender();
          renderProgress();
        }

        showToast('设置已保存', 'success');
        modal.classList.remove('visible');
      });
    }
  }

  // ============================================================
  // C++ Tokenizer & Markdown 渲染引擎 (markdown-it + DOMPurify)
  // ============================================================
  window.copyToClipboard = function (btn) {
    const pre = btn.nextElementSibling;
    const codeText = pre.textContent;
    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = codeText;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    };
    const done = () => {
      btn.textContent = '已复制！';
      btn.style.color = 'var(--accent-success)';
      setTimeout(() => {
        btn.textContent = '复制';
        btn.style.color = '';
      }, 2000);
    };
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codeText).then(done).catch(() => {
          fallbackCopy();
          done();
        });
      } else {
        fallbackCopy();
        done();
      }
    } catch (e) {
      fallbackCopy();
      done();
    }
  };

  function highlightCpp(code) {
    const rawCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    const tokenRegex = new RegExp(
      '(//.*)|' +                                                       // 1: line comment
      '(/\\*[\\s\\S]*?\\*/)|' +                                         // 2: block comment
      '("(?:\\\\.|[^\\\\"])*")|' +                                      // 3: string literal
      '(\'(?:\\\\.|[^\\\\\'])\')|' +                                    // 4: char literal
      '(#include|#define|#ifndef|#endif|#pragma|#ifdef|#else)\\b|' +    // 5: preprocessor
      '\\b(class|struct|public|private|protected|virtual|override|final|template|typename|const|static|inline|explicit|noexcept|friend|using|namespace|return|if|else|for|while|do|switch|case|default|new|delete|try|catch|throw|this|typedef|decltype|sizeof)\\b|' + // 6: keyword
      '\\b(int|double|float|char|bool|void|long|short|unsigned|signed|std::string|std::vector|std::list|std::map|std::deque|std::stack|std::queue|std::shared_ptr|std::unique_ptr|std::weak_ptr|std::ostream|std::istream|std::ofstream|std::ifstream|std::fstream|std::stringstream|std::ostringstream|std::istringstream|size_t)\\b|' + // 7: type
      '\\b(\\d+(?:\\.\\d+)?)\\b|' +                                     // 8: number
      '(<<|>>|\\x26\\x26|\\|\\||::|\\+\\+|--|[-+*/%=!<>]=?)|' +          // 9: operator
      '([\\{\\}\\(\\);,\\[\\]])|' +                                     // 10: punctuation
      '([a-zA-Z_][a-zA-Z0-9_]*)|' +                                     // 11: identifier
      '(\\s+)|' +                                                       // 12: whitespace
      '(.)',                                                            // 13: other character
      'g'
    );

    let resultHtml = '';
    let match;
    tokenRegex.lastIndex = 0;

    while ((match = tokenRegex.exec(rawCode)) !== null) {
      if (tokenRegex.lastIndex === match.index) {
        tokenRegex.lastIndex++;
      }

      const [
        full,
        lineComment,
        blockComment,
        strLiteral,
        charLiteral,
        preproc,
        keyword,
        type,
        num,
        op,
        punc,
        ident,
        space,
        other
      ] = match;

      if (lineComment || blockComment) {
        resultHtml += `<span class="token comment">${escapeHtml(full)}</span>`;
      } else if (strLiteral || charLiteral) {
        resultHtml += `<span class="token string">${escapeHtml(full)}</span>`;
      } else if (preproc) {
        resultHtml += `<span class="token preprocessor">${escapeHtml(full)}</span>`;
      } else if (keyword) {
        resultHtml += `<span class="token keyword">${escapeHtml(full)}</span>`;
      } else if (type) {
        resultHtml += `<span class="token type">${escapeHtml(full)}</span>`;
      } else if (num) {
        resultHtml += `<span class="token number">${escapeHtml(full)}</span>`;
      } else if (op) {
        resultHtml += `<span class="token operator">${escapeHtml(full)}</span>`;
      } else if (punc) {
        resultHtml += `<span class="token punctuation">${escapeHtml(full)}</span>`;
      } else {
        resultHtml += escapeHtml(full);
      }
    }
    return resultHtml;
  }

  function parseMarkdown(text) {
    if (!text) return '';

    const normalized = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const renderer = getMarkdownRenderer();
    const rendered = renderer ? renderer.render(normalized) : renderMarkdownFallback(normalized);
    const cleaned = sanitizeMarkdownHtml(rendered);
    return enhanceMarkdownHtml(cleaned);
  }

  function getMarkdownRenderer() {
    if (getMarkdownRenderer._renderer !== undefined) return getMarkdownRenderer._renderer;
    if (typeof window.markdownit !== 'function') {
      console.warn('markdown-it 未加载，使用简化 Markdown 渲染兜底。');
      getMarkdownRenderer._renderer = null;
      return null;
    }

    const renderer = window.markdownit({
      html: false,
      linkify: true,
      typographer: false,
      breaks: false,
      highlight: (code, lang) => {
        const normalizedLang = String(lang || 'cpp').toLowerCase();
        const highlighted = (normalizedLang === 'cpp' || normalizedLang === 'c++' || normalizedLang === 'cxx' || normalizedLang === 'cc')
          ? highlightCpp(code)
          : escapeHtml(code);
        return `<pre><code class="language-${escapeAttr(normalizedLang || 'text')}">${highlighted}</code></pre>`;
      }
    });

    const defaultLinkOpen = renderer.renderer.rules.link_open || function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
    renderer.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const href = token.attrGet('href') || '';
      if (/^(https?:|mailto:|#|\/)/i.test(href)) {
        token.attrSet('target', '_blank');
        token.attrSet('rel', 'noopener noreferrer');
      } else {
        token.attrSet('href', '#');
      }
      return defaultLinkOpen(tokens, idx, options, env, self);
    };

    getMarkdownRenderer._renderer = renderer;
    return renderer;
  }

  function renderMarkdownFallback(text) {
    let html = escapeHtml(text);
    html = html.replace(/```([a-zA-Z0-9+#-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const normalizedLang = lang || 'text';
      const highlighted = (normalizedLang === 'cpp' || normalizedLang === 'c++')
        ? highlightCpp(code)
        : escapeHtml(code);
      return `<pre><code class="language-${escapeAttr(normalizedLang)}">${highlighted}</code></pre>`;
    });
    html = html.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
      .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
      .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
      .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
      .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
      .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    return html.split(/\n{2,}/).map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h\d|pre|ul|ol|blockquote|table|hr)/i.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  }

  function sanitizeMarkdownHtml(html) {
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel', 'class', 'style', 'scope'],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
      });
    }
    console.warn('DOMPurify 未加载，使用浏览器模板兜底清理。');
    return sanitizeHtmlFallback(html);
  }

  function sanitizeHtmlFallback(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script, iframe, object, embed, form, input, button, textarea, select, style').forEach(el => el.remove());
    template.content.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value || '';
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }
        if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }

  function enhanceMarkdownHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('table').forEach(table => {
      table.classList.add('markdown-table');
      if (table.parentElement && table.parentElement.classList.contains('markdown-table-wrap')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'markdown-table-wrap';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    template.content.querySelectorAll('pre > code').forEach(code => {
      const pre = code.parentElement;
      if (!pre || pre.parentElement?.classList.contains('code-block-wrapper')) return;
      const language = Array.from(code.classList).find(cls => cls.startsWith('language-'))?.replace('language-', '') || 'text';
      if (language === 'cpp' || language === 'c++' || language === 'cxx' || language === 'cc') {
        code.innerHTML = highlightCpp(code.textContent || '');
      }
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.type = 'button';
      copyBtn.textContent = '复制';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(copyBtn);
      wrapper.appendChild(pre);
    });

    template.content.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (/^(https?:|mailto:|#|\/)/i.test(href)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      } else {
        link.removeAttribute('href');
      }
    });

    return template.innerHTML;
  }

  // ============================================================
  // 新手引导：默认每次加载都展示，支持跳过与试操作
  // ============================================================
  let onboardingStarted = false;
  let onboardingIndex = 0;
  let onboardingActionDone = false;
  let onboardingActionCleanup = null;

  const onboardingSteps = [
    {
      title: '欢迎，新手从这里开始',
      text: '这个工具把 C++ OOP 期末复习常用的题库训练、知识讲义、错题复习和进度统计放在同一个页面里。接下来会逐个讲清楚，也会让你动手试一下。',
      selector: '.quiz-hero',
      before: () => {
        window._goToPage('quiz');
        if (typeof window.clearAllFilters === 'function') {
          window.clearAllFilters();
        }
        state.quizMode = 'list';
        saveViewState();
        filterAndRender();
      },
      button: '开始引导'
    },
    {
      title: '主导航：三块学习区域',
      text: '顶部导航可以在“题库训练”、“知识讲义”与“进度概览”之间切换：刷题、查概念、看复习状态都从这里进入。',
      selector: '.nav-tabs',
      before: () => window._goToPage('quiz')
    },
    {
      title: '题库训练：搜索与题号跳转',
      text: '搜索框可以按题干、章节或知识点进行过滤；旁边新增的题号跳转框支持直接输入数据库题号（如 42, P1）或乱序序号（如 #21）快速定位题目；下方各类筛选还可以帮你进一步缩小范围。',
      selector: '.toolbar[aria-label="题库筛选工具栏"]',
      before: () => window._goToPage('quiz')
    },
    {
      title: '试一试：切换到单题模式',
      text: '列表模式适合快速浏览；单题模式适合正式自测。请点击高亮区域里的“单题”，体验一次模式切换。',
      selector: '#mode-filters',
      task: '请点击“单题”按钮，完成后会自动进入下一步。',
      actionSelector: '#mode-filters [data-mode="focus"]',
      actionEvent: 'click',
      requireAction: true,
      before: () => {
        window._goToPage('quiz');
        state.quizMode = 'list';
        saveViewState();
        filterAndRender();
      }
    },
    {
      title: '题目卡片：答题、看解析、做标记',
      text: '每张题卡右上角可以收藏、标记已掌握、待复习或错题；题目下方可以显示答案，也能复制讲解提示词，方便继续追问。',
      selector: '#question-list .question-card',
      before: () => window._goToPage('quiz')
    },
    {
      title: '试一试：显示一次答案',
      text: '遇到不会的题，可以先思考再展开答案。请点击当前题卡里的“显示答案 / 查看参考代码”按钮。',
      selector: '#question-list .question-card [id^="toggle-answer-btn-"]',
      task: '请点击“显示答案”或“查看参考代码”，看看解析区域如何展开。',
      actionSelector: '#question-list .question-card [id^="toggle-answer-btn-"]',
      actionEvent: 'click',
      requireAction: true,
      before: () => {
        window._goToPage('quiz');
        state.quizMode = 'focus';
        saveViewState();
        filterAndRender();
        // 如果当前题目的答案已展开，先隐藏，以便让用户点击“显示答案”来触发引导
        const activeCard = document.querySelector('#question-list .question-card');
        if (activeCard) {
          const id = activeCard.dataset.id.replace(/^(q-|prog-)/, '');
          const el = document.getElementById('answer-' + id);
          if (el) el.classList.remove('visible');
          const btn = document.getElementById('toggle-answer-btn-' + id);
          if (btn) {
            const isProg = activeCard.dataset.id.startsWith('prog-');
            btn.textContent = isProg ? '查看参考代码' : '显示答案';
          }
        }
      }
    },
    {
      title: '知识讲义：概念不清就查这里',
      text: '讲义页支持搜索标题、概念和代码关键字；题目里的知识点标签也可以跳到相关讲义。',
      selector: '#page-knowledge .toolbar',
      before: () => window._goToPage('knowledge')
    },
    {
      title: '进度概览：掌握率与数据统计',
      text: '顶部的环形图和数据卡片汇总了总题数、已掌握、待复习和错题数量，方便你一眼判断整体复习状态。',
      selector: '#page-progress .progress-container-grid',
      before: () => window._goToPage('progress')
    },
    {
      title: '分章进度与复习建议',
      text: '页面下方会根据你的答题记录自动生成复习建议与错题负荷提示，并按章节展示你的掌握进度条，助你查漏补缺。',
      selector: '#page-progress #review-insights',
      before: () => window._goToPage('progress')
    },
    {
      title: '设置：调整你的刷题方式',
      text: '右上角设置里可以开启重做模式、随机题序，调整字体字号；如果以后想重看引导，也可以在设置里点击“重新查看新手引导”。',
      selector: '#settings-open',
      before: () => window._goToPage('quiz'),
      button: '完成'
    }
  ];

  function initOnboarding() {
    const overlay = document.getElementById('onboarding');
    if (!overlay || onboardingStarted) return;
    if (localStorage.getItem('oop_onboarding_completed') === 'true') return;
    startOnboarding();
  }

  function startOnboarding() {
    const overlay = document.getElementById('onboarding');
    if (!overlay) return;
    onboardingStarted = true;
    onboardingIndex = 0;
    onboardingActionDone = false;

    const skipBtn = document.getElementById('onboarding-skip');
    const prevBtn = document.getElementById('onboarding-prev');
    const nextBtn = document.getElementById('onboarding-next');

    if (skipBtn && !skipBtn.dataset.bound) {
      skipBtn.dataset.bound = '1';
      skipBtn.addEventListener('click', finishOnboarding);
    }
    if (prevBtn && !prevBtn.dataset.bound) {
      prevBtn.dataset.bound = '1';
      prevBtn.addEventListener('click', () => showOnboardingStep(onboardingIndex - 1));
    }
    if (nextBtn && !nextBtn.dataset.bound) {
      nextBtn.dataset.bound = '1';
      nextBtn.addEventListener('click', () => {
        const step = onboardingSteps[onboardingIndex];
        if (step && step.requireAction && !onboardingActionDone) return;
        if (onboardingIndex >= onboardingSteps.length - 1) {
          finishOnboarding();
        } else {
          showOnboardingStep(onboardingIndex + 1);
        }
      });
    }

    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    
    const card = document.getElementById('onboarding-card');
    if (card) {
      card.classList.add('visible');
      card.setAttribute('aria-hidden', 'false');
    }

    document.addEventListener('keydown', handleOnboardingKeydown);
    showOnboardingStep(0);
  }

  function handleOnboardingKeydown(e) {
    if (!onboardingStarted) return;
    if (e.key === 'Escape') finishOnboarding();
    if (e.key === 'ArrowRight') {
      const step = onboardingSteps[onboardingIndex];
      if (!step.requireAction || onboardingActionDone) showOnboardingStep(onboardingIndex + 1);
    }
    if (e.key === 'ArrowLeft') showOnboardingStep(onboardingIndex - 1);
  }

  function finishOnboarding() {
    localStorage.setItem('oop_onboarding_completed', 'true');
    const overlay = document.getElementById('onboarding');
    cleanupOnboardingStep();
    onboardingStarted = false;
    if (overlay) {
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
    }
    const card = document.getElementById('onboarding-card');
    if (card) {
      card.classList.remove('visible');
      card.setAttribute('aria-hidden', 'true');
    }
    document.removeEventListener('keydown', handleOnboardingKeydown);
  }

  function cleanupOnboardingStep() {
    document.querySelectorAll('.onboarding-target-active').forEach(el => el.classList.remove('onboarding-target-active'));
    if (typeof onboardingActionCleanup === 'function') onboardingActionCleanup();
    onboardingActionCleanup = null;
    const spotlight = document.getElementById('onboarding-spotlight');
    if (spotlight) spotlight.classList.remove('visible');
  }

  function showOnboardingStep(nextIndex) {
    if (nextIndex < 0 || nextIndex >= onboardingSteps.length) return;
    cleanupOnboardingStep();
    onboardingIndex = nextIndex;
    onboardingActionDone = false;

    const step = onboardingSteps[onboardingIndex];
    if (typeof step.before === 'function') step.before();

    const progress = document.getElementById('onboarding-progress');
    const title = document.getElementById('onboarding-title');
    const text = document.getElementById('onboarding-text');
    const task = document.getElementById('onboarding-task');
    const prevBtn = document.getElementById('onboarding-prev');
    const nextBtn = document.getElementById('onboarding-next');

    if (progress) progress.textContent = `新手引导 ${onboardingIndex + 1} / ${onboardingSteps.length}`;
    if (title) title.textContent = step.title;
    if (text) text.textContent = step.text;
    if (task) {
      task.hidden = !step.task;
      task.textContent = step.task || '';
      task.classList.remove('done');
    }
    if (prevBtn) prevBtn.disabled = onboardingIndex === 0;
    if (nextBtn) {
      nextBtn.disabled = !!step.requireAction;
      nextBtn.textContent = step.requireAction ? '等待你操作…' : (step.button || (onboardingIndex === onboardingSteps.length - 1 ? '完成' : '下一步'));
    }

    setTimeout(() => {
      const target = document.querySelector(step.selector);
      const isMobile = window.innerWidth <= 700;
      
      if (target) {
        if (isMobile) {
          const header = document.querySelector('.app-header');
          const headerHeight = header ? header.offsetHeight : 64;
          const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: targetTop - headerHeight - 20,
            behavior: 'smooth'
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
        setTimeout(() => positionOnboarding(target), 260);
        target.classList.add('onboarding-target-active');
        if (step.requireAction) bindOnboardingAction(step);
      } else {
        // No target found, place the card in the center of the screen and hide the spotlight
        const spotlight = document.getElementById('onboarding-spotlight');
        if (spotlight) spotlight.classList.remove('visible');
        
        const card = document.getElementById('onboarding-card');
        if (card) {
          card.style.left = '50%';
          card.style.top = '50%';
          card.style.transform = 'translate(-50%, -50%)';
          card.style.bottom = 'auto';
          card.style.right = 'auto';
          card.style.width = '';
          card.classList.add('visible');
        }
      }
    }, 80);
  }

  function bindOnboardingAction(step) {
    const actionEl = document.querySelector(step.actionSelector || step.selector);
    if (!actionEl) return;
    const handler = () => {
      onboardingActionDone = true;
      const task = document.getElementById('onboarding-task');
      const nextBtn = document.getElementById('onboarding-next');
      if (task) {
        task.textContent = '已完成操作，可以继续下一步。';
        task.classList.add('done');
      }
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = '下一步';
      }
      setTimeout(() => {
        if (onboardingStarted && onboardingActionDone) showOnboardingStep(onboardingIndex + 1);
      }, 650);
    };
    actionEl.addEventListener(step.actionEvent || 'click', handler, { once: true });
    onboardingActionCleanup = () => actionEl.removeEventListener(step.actionEvent || 'click', handler);
  }

  function positionOnboarding(target) {
    const card = document.getElementById('onboarding-card');
    const spotlight = document.getElementById('onboarding-spotlight');
    if (!card || !spotlight || !target) return;

    const rect = target.getBoundingClientRect();
    const padding = 10;
    const top = rect.top - padding;
    const left = rect.left - padding;
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;

    spotlight.style.left = `${left}px`;
    spotlight.style.top = `${top}px`;
    spotlight.style.width = `${width}px`;
    spotlight.style.height = `${height}px`;
    
    // Dynamically copy border-radius to align perfectly with rounded / capsule elements
    const targetStyle = window.getComputedStyle(target);
    spotlight.style.borderRadius = targetStyle.borderRadius;
    
    spotlight.classList.add('visible');

    const cardRect = card.getBoundingClientRect();
    const isMobile = window.innerWidth <= 700;
    const gap = isMobile ? 12 : 16;
    const margin = 16;

    if (isMobile) {
      card.style.left = `${margin}px`;
      card.style.right = `${margin}px`;
      card.style.width = 'auto';
      card.style.transform = ''; // Reset centering transform
    } else {
      card.style.right = '';
      card.style.width = '';
      card.style.transform = ''; // Reset centering transform
      
      let cardLeft = left;
      if (cardLeft + cardRect.width > window.innerWidth - margin) {
        cardLeft = window.innerWidth - cardRect.width - margin;
      }
      if (cardLeft < margin) cardLeft = margin;
      card.style.left = `${cardLeft}px`;
    }

    // Unified vertical positioning logic relative to spotlight bounds (above or below)
    let cardTop = top + height + gap;
    if (cardTop + cardRect.height > window.innerHeight - margin) {
      cardTop = top - cardRect.height - gap;
    }
    
    // If it still goes off screen, select the area with more space
    if (cardTop < margin) {
      const spaceBelow = window.innerHeight - (top + height);
      const spaceAbove = top;
      if (spaceBelow > spaceAbove) {
        cardTop = top + height + gap;
      } else {
        cardTop = top - cardRect.height - gap;
      }
    }
    
    // Boundary clamp to keep card in view
    if (cardTop < margin) cardTop = margin;
    if (cardTop + cardRect.height > window.innerHeight - margin) {
      cardTop = window.innerHeight - cardRect.height - margin;
    }

    card.style.top = `${cardTop}px`;
    card.style.bottom = 'auto'; // Clear bottom as we use top positioning

    card.classList.add('visible');
  }

  const handleReposition = () => {
    if (!onboardingStarted) return;
    const step = onboardingSteps[onboardingIndex];
    const target = step && document.querySelector(step.selector);
    if (target) positionOnboarding(target);
  };

  window.addEventListener('resize', handleReposition);
  window.addEventListener('scroll', handleReposition, { passive: true });

  // 记录滚动位置以支持刷新后恢复
  let scrollSaveTimer;
  window.addEventListener('scroll', () => {
    if (!state.isReadyForScrollSave || onboardingStarted) return;

    const activePage = document.querySelector('.nav-tab.active')?.dataset.page;
    if (activePage === 'quiz' && state.quizMode === 'list') {
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        localStorage.setItem('oop_scroll_y', window.scrollY);
      }, 150);
    } else if (activePage === 'knowledge') {
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => {
        localStorage.setItem('oop_knowledge_scroll_y', window.scrollY);
      }, 150);
    }
  }, { passive: true });

  // ============================================================
  // UI 初始化
  // ============================================================
  function initUI() {
    function setActivePage(page) {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      const tab = document.querySelector(`.nav-tab[data-page="${page}"]`);
      if (tab) tab.classList.add('active');

      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      const pageEl = document.getElementById('page-' + page);
      if (pageEl) pageEl.classList.add('active');

      localStorage.setItem('oop_active_page', page);
      updateGalgameStageVisibility();
      updateGalgameStage();
      updateBackToTopVisibility();

      // 切换页面时，先暂停滚动位置保存，然后恢复该页面的滚动位置
      state.isReadyForScrollSave = false;
      restoreScrollOrFocusIndex();
    }

    window._goToPage = setActivePage;

    // 导航切换
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => setActivePage(tab.dataset.page));
    });

    // 类型筛选
    document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        exitReviewQueue({ keepFocus: true });
        document.querySelectorAll('#type-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentType = btn.dataset.type;
        filterAndRender();
      });
    });

    // 刷题模式筛选 (列表/焦点)
    document.querySelectorAll('#mode-filters .filter-btn[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.dataset.mode;
        const leftReviewQueue = exitReviewQueue({
          keepMode: true,
          keepFocus: nextMode !== 'focus'
        });
        document.querySelectorAll('#mode-filters .filter-btn[data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.quizMode = nextMode;
        if (!(leftReviewQueue && state.quizMode === 'focus')) {
          state.focusIndex = 0;
        }
        saveViewState();
        if (leftReviewQueue) {
          filterAndRender();
        } else {
          renderQuestionList();
        }
        if (state.galgameMode && nextMode === 'focus') {
          enableGalgameAudioFromUserGesture();
        }
        updateBackToTopVisibility();
      });
    });

    // 状态筛选
    document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        exitReviewQueue({ keepFocus: true });
        if (btn.id === 'favorites-only') {
          state.favoritesOnly = !state.favoritesOnly;
          btn.classList.toggle('active', state.favoritesOnly);
          filterAndRender();
          return;
        }
        if (btn.classList.contains('active')) {
          btn.classList.remove('active');
          state.currentStatus = null;
        } else {
          document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.currentStatus = btn.dataset.status;
        }
        filterAndRender();
      });
    });

    // 章节筛选
    const chapterSelect = document.getElementById('chapter-filter');
    state.chapters.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = ch;
      chapterSelect.appendChild(opt);
    });
    chapterSelect.addEventListener('change', () => {
      exitReviewQueue({ keepFocus: true });
      state.currentChapter = chapterSelect.value;
      filterAndRender();
    });

    // 知识点筛选
    const knowledgeSelect = document.getElementById('knowledge-filter');
    if (knowledgeSelect) {
      renderKnowledgeFilterOptions();
      knowledgeSelect.addEventListener('change', () => {
        exitReviewQueue({ keepFocus: true });
        state.selectedKnowledgePoint = knowledgeSelect.value;
        filterAndRender();
      });
    }

    const todayReviewBtn = document.getElementById('today-review');
    if (todayReviewBtn) {
      todayReviewBtn.addEventListener('click', () => window.startTodayReview());
    }

    document.addEventListener('click', (e) => {
      // If backdrop is clicked when answer modal is open, close it
      if (document.body.classList.contains('galgame-answer-open')) {
        const modal = document.querySelector('.answer-section.visible');
        if (modal && !modal.contains(e.target) && !e.target.closest('[data-answer-toggle]')) {
          const id = modal.id.replace('answer-', '');
          setAnswerVisibility(id, false);
          return;
        }
      }

      const toggle = e.target.closest('[data-answer-toggle]');
      if (!toggle) return;
      const id = toggle.getAttribute('data-answer-toggle');
      if (!id) return;
      e.preventDefault();
      const el = document.getElementById('answer-' + id);
      if (!el) return;
      setAnswerVisibility(id, !el.classList.contains('visible'));
    });

    // 搜索
    let searchTimer;
    document.getElementById('search-input').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        exitReviewQueue({ keepFocus: true });
        filterAndRender();
      }, 300);
    });

    // 题号跳转
    const jumpInput = document.getElementById('jump-input');
    if (jumpInput) {
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          window._jumpToQuestionInput();
        }
      });
    }

    // 知识点搜索（带 debounce）
    let knowledgeSearchTimer;
    document.getElementById('knowledge-search').addEventListener('input', (e) => {
      clearTimeout(knowledgeSearchTimer);
      knowledgeSearchTimer = setTimeout(() => {
        const query = e.target.value.trim().toLowerCase();
        renderKnowledge(query);
      }, 300);
    });

    // 监听全局键盘事件用于焦点模式左右按键刷题
    document.addEventListener('keydown', (e) => {
      if (state.quizMode === 'focus') {
        const activeEl = document.activeElement;
        // 如果用户正在搜索输入框或AI聊天框中输入，不触发切换快捷键
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        if (!isInput) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            playGalgameSe('cursor');
            window._prevFocusQuestion();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            playGalgameSe('cursor');
            window._nextFocusQuestion();
          } else if (state.galgameMode && (e.key === ' ' || e.key === 'Enter')) {
            const item = getCurrentFocusItem();
            if (!item) return;
            e.preventDefault();
            enableGalgameAudioFromUserGesture();
            const uniqueId = item.type === 'programming' ? `prog-${item.id}` : `q-${item.id}`;
            const answerEl = document.getElementById('answer-' + uniqueId);
            if (answerEl && !answerEl.classList.contains('visible')) {
              window._showAnswer(uniqueId);
            } else {
              window._nextFocusQuestion();
            }
          } else if (state.galgameMode && e.key === 'Escape') {
            const item = getCurrentFocusItem();
            if (!item) return;
            e.preventDefault();
            const uniqueId = item.type === 'programming' ? `prog-${item.id}` : `q-${item.id}`;
            setAnswerVisibility(uniqueId, false);
            playGalgameSe('cancel');
          }
        }
      }
    });

    const galgameAudioToggle = document.getElementById('galgame-audio-toggle');
    if (galgameAudioToggle) {
      galgameAudioToggle.addEventListener('click', () => {
        state.settings.galgameAudio = !state.settings.galgameAudio;
        saveJsonToStorage(SETTINGS_KEY, state.settings);
        galgameAudioToggle.classList.toggle('muted', !state.settings.galgameAudio);
        if (state.settings.galgameAudio) {
          enableGalgameAudioFromUserGesture();
          playGalgameSe('decision');
        } else {
          stopGalgameAmbient();
        }
      });
    }

    document.addEventListener('pointerdown', enableGalgameAudioFromUserGesture, { passive: true });

    // 回到顶部按钮
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest ? e.target.closest('.copy-code-btn') : null;
      if (!btn || btn.hasAttribute('onclick')) return;
      window.copyToClipboard(btn);
    });

    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
  }

  // updateBackToTopVisibility: single definition below (around line 2063)

  // ============================================================
  // 筛选与渲染
  // ============================================================
  function filterAndRender(isInitialLoad = false) {
    let items = state.allItems;

    if (state.reviewQueueActive) {
      const set = new Set(state.reviewQueueKeys || []);
      items = items.filter(q => set.has(getProgressKeyForItem(q)));
      state.filtered = items;
      if (isInitialLoad) {
        if (state.quizMode === 'focus') {
          const savedId = localStorage.getItem('oop_last_question_id');
          if (savedId) {
            const idx = state.filtered.findIndex(q => getProgressKeyForItem(q) === savedId);
            if (idx !== -1) state.focusIndex = idx;
          }
        }
      } else {
        state.focusIndex = 0;
        listPageCount = 1;
        localStorage.setItem('oop_scroll_y', '0');
      }
      syncUIWithState();
      renderQuestionList({ noScroll: isInitialLoad });
      updateBackToTopVisibility();
      return;
    }

    // 类型筛选
    if (state.currentType !== 'all') {
      items = items.filter(q => q.type === state.currentType);
    }

    // 章节筛选
    if (state.currentChapter !== 'all') {
      items = items.filter(q => q.chapter === state.currentChapter);
    }

    // 状态筛选
    if (state.currentStatus) {
      if (state.currentStatus === 'unmarked') {
        items = items.filter(q => !getQuestionStatus(getProgressKeyForItem(q)));
      } else {
        items = items.filter(q => getQuestionStatus(getProgressKeyForItem(q)) === state.currentStatus);
      }
    }

    // 搜索
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter(q => {
        const idStr = String(q.id).toLowerCase();
        const isProg = q.type === 'programming';
        const label = isProg ? `程序${idStr}` : `第${idStr}题`;
        const text = idStr + ' ' + label + ' ' +
          (q.stem || '') + (q.title || '') + (q.requirement || '') +
          (q.options ? q.options.join(' ') : '') + (q.chapter || '') +
          ' ' + getKnowledgePointsForItem(q).join(' ');
        return text.toLowerCase().includes(query);
      });
    }

    // 知识点筛选（来自题库 tags）
    if (state.selectedKnowledgePoint && state.selectedKnowledgePoint !== 'all') {
      const kp = state.selectedKnowledgePoint;
      items = items.filter(q => getKnowledgePointsForItem(q).includes(kp));
    }

    // 收藏筛选
    if (state.favoritesOnly) {
      items = items.filter(q => {
        const key = q.type === 'programming' ? `prog_${q.id}` : `q_${q.id}`;
        return !!state.favorites[key];
      });
    }

    state.filtered = items;
    if (isInitialLoad) {
      if (state.quizMode === 'focus') {
        const savedId = localStorage.getItem('oop_last_question_id');
        if (savedId) {
          const idx = state.filtered.findIndex(q => {
            const key = q.type === 'programming' ? `prog_${q.id}` : `q_${q.id}`;
            return key === savedId;
          });
          if (idx !== -1) {
            state.focusIndex = idx;
          }
        }
      }
    } else {
      state.focusIndex = 0; // 筛选改变时重置焦点到第一题
      listPageCount = 1; // 重置分页
      localStorage.setItem('oop_scroll_y', '0');
      saveViewState();
    }
    restorePendingFocusIndex();
    renderQuestionList({ noScroll: isInitialLoad });
    updateBackToTopVisibility();
  }

  const PAGE_SIZE = 30;
  let listPageCount = 1;

  function renderQuestionList(options = {}) {
    if (window._galgameTransitionTimer) {
      clearTimeout(window._galgameTransitionTimer);
      window._galgameTransitionTimer = null;
    }
    const noScroll = options.noScroll || false;
    const stageEvent = options.stageEvent || 'intro';
    const container = document.getElementById('question-list');
    const navContainer = document.getElementById('focus-navigation');

    if (state.filtered.length === 0) {
      const activeFilters = [];
      if (state.reviewQueueActive) activeFilters.push('复习队列');
      if (state.currentType && state.currentType !== 'all') activeFilters.push(`题型: ${state.currentType}`);
      if (state.currentChapter && state.currentChapter !== 'all') activeFilters.push(`章节: ${state.currentChapter}`);
      if (state.currentStatus) activeFilters.push(`状态: ${state.currentStatus}`);
      if (state.searchQuery) activeFilters.push(`搜索: "${state.searchQuery}"`);
      if (state.selectedKnowledgePoint && state.selectedKnowledgePoint !== 'all') activeFilters.push(`知识点: ${state.selectedKnowledgePoint}`);
      if (state.favoritesOnly) activeFilters.push('仅收藏');
      
      const filterText = activeFilters.length > 0 ? ` (当前已启用筛选 - ${activeFilters.join(', ')})` : '';
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">-</div>
          <p>没有匹配的题目${filterText}</p>
          ${state.reviewQueueActive ? '<button class="show-answer-btn" onclick="window.exitTodayReview()" style="margin-top: 12px; border-color: var(--accent-primary); color: var(--accent-primary);">退出复习队列</button>' : ''}
          ${activeFilters.length > 0 ? '<button class="show-answer-btn" onclick="window.clearAllFilters()" style="margin-top: 12px; border-color: var(--accent-primary); color: var(--accent-primary);">清除所有筛选条件</button>' : ''}
        </div>
      `;
      navContainer.style.display = 'none';
      updateGalgameStage();
      return;
    }

    if (state.quizMode === 'list') {
      navContainer.style.display = 'none';
      updateGalgameStageVisibility();
      const visibleCount = PAGE_SIZE * listPageCount;
      const visible = state.filtered.slice(0, visibleCount);
      let html = visible.map((q, idx) => renderQuestionCard(q, idx + 1)).join('');
      if (visibleCount < state.filtered.length) {
        html += `<div style="text-align:center;padding:20px;"><button class="show-answer-btn" style="border-color:var(--accent-primary);color:var(--accent-primary);" onclick="window._loadMoreQuestions()">加载更多（还有 ${state.filtered.length - visibleCount} 题）</button></div>`;
      }
      container.innerHTML = html;
    } else {
      // 焦点刷题模式 (一页一题)
      navContainer.style.display = 'flex';

      // 边界越界校验
      if (state.focusIndex >= state.filtered.length) state.focusIndex = 0;
      if (state.focusIndex < 0) state.focusIndex = state.filtered.length - 1;

      const q = state.filtered[state.focusIndex];
      if (q) {
        const key = q.type === 'programming' ? `prog_${q.id}` : `q_${q.id}`;
        localStorage.setItem('oop_last_question_id', key);
      }
      container.innerHTML = renderQuestionCard(q, state.focusIndex + 1);
      document.body.classList.remove('galgame-answer-open');

      // 渲染底部分页控制
      const useGalgameNav = !!state.galgameMode;
      navContainer.innerHTML = useGalgameNav
        ? `
          <button class="filter-btn galgame-scene-btn" onclick="window._prevFocusQuestion()">← 上一幕</button>
          <span class="focus-index-info galgame-scene-index">Scene ${state.focusIndex + 1} / ${state.filtered.length}<br><span>← → 推进路线</span></span>
          <button class="filter-btn galgame-scene-btn" onclick="window._nextFocusQuestion()">下一幕 →</button>
        `
        : `
          <button class="filter-btn" onclick="window._prevFocusQuestion()">← 上一题</button>
          <span class="focus-index-info">第 ${state.focusIndex + 1} / ${state.filtered.length} 题<br><span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">← → 箭头键切换</span></span>
          <button class="filter-btn" onclick="window._nextFocusQuestion()">下一题 →</button>
        `;

      // 切换焦点模式时滚动到题目区域
      if (!noScroll) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    updateGalgameStage(stageEvent);
    updateBackToTopVisibility();
  }

  window.exitTodayReview = function () {
    const leftReviewQueue = exitReviewQueue();
    if (!leftReviewQueue) return;
    syncUIWithState();
    saveViewState();
    filterAndRender();
    showToast('已退出复习队列', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window._loadMoreQuestions = function () {
    listPageCount++;
    saveViewState();
    renderQuestionList();
  };

  function renderQuestionCard(q, displayIndex) {
    const isProgramming = q.type === 'programming';
    const typeLabel = { choice: '选择题', truefalse: '判断题', fillin: '填空题', coding: '程序分析题', programming: '程序设计题' };
    const typeBadge = { choice: 'badge-choice', truefalse: 'badge-truefalse', fillin: 'badge-fillin', coding: 'badge-coding', programming: 'badge-programming' };
    const status = getQuestionStatus(getProgressKeyForItem(q));
    const uniqueId = isProgramming ? `prog-${q.id}` : `q-${q.id}`;
    const safeUniqueId = escapeAttr(uniqueId);
    const isGalgameCard = !!state.galgameMode && state.quizMode === 'focus';
    const openingKps = getKnowledgePointsForItem(q);
    const galgamePlan = getGalgameKnowledgePlan(q);
    const label = isProgramming ? `程序 ${q.id}` : `第 ${q.id} 题`;
    const galStatusText = status === 'mastered' ? '已掌握' : status === 'review' ? '待复习' : status === 'wrong' ? '错题' : '未标记';
    const questionTitle = isProgramming ? (q.title || label) : (q.stem || '').split(/\n|\\n/)[0] || label;

    let html = `<div class="question-card ${isGalgameCard ? 'galgame-task-card' : ''}" data-type="${q.type}" data-id="${safeUniqueId}"${displayIndex != null ? ` data-index="${displayIndex}"` : ''}>`;

    // 头部
    html += `<div class="question-header">`;
    html += `<div class="question-meta">`;
    html += `<span class="question-number">${escapeHtml(label)}</span>`;
    html += `<span class="badge ${typeBadge[q.type]}">${escapeHtml(typeLabel[q.type] || q.type)}</span>`;
    if (q.chapter) html += `<span class="badge badge-chapter">${escapeHtml(q.chapter)}</span>`;
    if (displayIndex != null) html += `<span class="badge badge-index" title="当前列表序号">#${displayIndex}</span>`;
    html += `</div>`;

    // 操作按钮
    html += `<div class="question-actions">`;
    const favKey = q.type === 'programming' ? `prog_${q.id}` : `q_${q.id}`;
    const isFav = !!state.favorites[favKey];
    html += `<button class="action-btn fav ${isFav ? 'active' : ''}" title="${isFav ? '已收藏' : '收藏'}" onclick="window._toggleFavorite('${escapeAttr(favKey)}')">★</button>`;
    html += `<button class="action-btn status-btn ${status === 'mastered' ? 'mastered' : ''}" data-status="mastered" title="已掌握" onclick="window._setStatus('${safeUniqueId}','mastered')">✓</button>`;
    html += `<button class="action-btn status-btn ${status === 'review' ? 'review' : ''}" data-status="review" title="待复习" onclick="window._setStatus('${safeUniqueId}','review')">↻</button>`;
    html += `<button class="action-btn status-btn ${status === 'wrong' ? 'wrong' : ''}" data-status="wrong" title="错题" onclick="window._setStatus('${safeUniqueId}','wrong')">✗</button>`;
    html += `</div></div>`;

    // 题目内容
    if (isGalgameCard) {
      html += `<div class="galgame-task-overview">`;
      html += `<div class="galgame-task-copy">`;
      html += `<span class="galgame-task-label">${escapeHtml(getGalgameRouteTitle(q))}</span>`;
      html += `<strong>${escapeHtml(questionTitle)}</strong>`;
      html += `<p>${escapeHtml(getGalgameKnowledgeSummary(q))}</p>`;
      html += `</div>`;
      html += `<div class="galgame-task-state">`;
      html += `<span>${escapeHtml(galStatusText)}</span>`;
      html += `<small>${escapeHtml(getGalgameStudyHint(q))}</small>`;
      html += `</div>`;
      html += `</div>`;
    }

    if (openingKps.length) {
      if (isGalgameCard) {
        html += `<div class="galgame-study-ribbon galgame-route-board" aria-label="本题考点">`;
        html += `<div class="galgame-route-main">`;
        html += `<span>攻略路线</span>`;
        html += `<strong>${escapeHtml(galgamePlan.primary)}</strong>`;
        html += `<p>${escapeHtml(galgamePlan.summary)}</p>`;
        html += `</div>`;
        html += `<div class="galgame-route-side">`;
        html += `<small>${escapeHtml(galgamePlan.lectureHint || '讲义索引将在知识点页定位')}</small>`;
        if (galgamePlan.count) html += `<em>${galgamePlan.count} 题相关</em>`;
        html += `</div>`;
        if (galgamePlan.related.length) {
          html += `<div class="galgame-study-chips">`;
          galgamePlan.related.forEach(kp => {
            html += `<span>${escapeHtml(kp)}</span>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      } else {
        html += `<div class="galgame-study-ribbon" aria-label="本题考点">`;
        html += `<strong>本幕考点</strong>`;
        html += `<div class="galgame-study-chips">`;
        openingKps.slice(0, 4).forEach(kp => {
          html += `<span>${escapeHtml(kp)}</span>`;
        });
        html += `</div></div>`;
      }
    }

    html += `<div class="galgame-reading-panel">`;

    if (isProgramming) {
      html += `<div class="question-stem galgame-task-title">${escapeHtml(q.title || '')}</div>`;
      html += `<div class="question-stem galgame-requirement">${formatStem(q.requirement || '')}</div>`;
      const programmingDraft = `
          <div class="programming-input-wrapper">
            <textarea class="programming-input" id="prog-input-${safeUniqueId}" placeholder="粘贴你的 C++ 实现，用提示词检查思路与边界..."></textarea>
            <button class="show-answer-btn grade-btn" style="margin-top: 8px; border-color: var(--accent-warning); color: var(--accent-warning);" onclick="window._gradeProgrammingAnswer('${safeUniqueId}', this)">检查代码</button>
          </div>
        `;
      if (isGalgameCard) {
        html += `
          <details class="galgame-code-draft">
            <summary>打开代码草稿与检查</summary>
            ${programmingDraft}
          </details>
        `;
      } else {
        html += programmingDraft;
      }
    } else {
      html += `<div class="question-stem">${formatStem(q.stem || '')}</div>`;
      if (q.type === 'fillin') {
        html += `
          <div class="fillin-input-wrapper">
            <input type="text" class="fillin-input" placeholder="输入您的答案以进行比对..." onkeydown="if(event.key==='Enter') window._checkFillinAnswer('${safeUniqueId}', this)">
            <button class="show-answer-btn check-btn" onclick="window._checkFillinAnswer('${safeUniqueId}', this.previousElementSibling)">检查答案</button>
          </div>
          <div class="fillin-feedback" id="feedback-${safeUniqueId}" style="display: none;"></div>
        `;
      }
    }
    html += `</div>`;

    // 选项 (选择题)
    if (q.type === 'choice' && q.options && q.options.length) {
      html += `<div class="options-list">`;
      q.options.forEach(opt => {
        const letterMatch = opt.trim().match(/^([A-D])[.、\s]/i);
        const letter = letterMatch ? letterMatch[1].toUpperCase() : '';
        html += `<div class="option-item" data-letter="${letter}" onclick="window._selectOption('${safeUniqueId}', '${escapeAttr(letter)}', this)">${formatOptionText(opt)}</div>`;
      });
      html += `</div>`;
    } else if (q.type === 'truefalse') {
      html += `<div class="options-list">`;
      html += `<div class="option-item" data-val="对" onclick="window._selectOptionTF('${safeUniqueId}', '对', this)">对</div>`;
      html += `<div class="option-item" data-val="错" onclick="window._selectOptionTF('${safeUniqueId}', '错', this)">错</div>`;
      html += `</div>`;
    }

    // 知识点标签（可按知识点筛题 / 跳转知识点页）
    const kps = openingKps;
    if (kps.length) {
      html += `<div class="kp-tags">`;
      kps.forEach(kp => {
        const safeKp = escapeHtml(kp);
        const encKp = encodeURIComponent(kp);
        const safeEncKp = escapeAttr(encKp);
        html += `
          <div class="kp-chip" title="点击打开讲义；右侧图标按该知识点筛题" onclick="window._jumpToKnowledgePointEncoded('${safeEncKp}')">
            ${safeKp}
            <span class="kp-action" title="按该知识点筛题" onclick="event.stopPropagation(); window._filterByKnowledgePointEncoded('${safeEncKp}');">练题</span>
          </div>
        `;
      });
      html += `</div>`;
    }

    // 操作按钮条
    html += `<div class="galgame-card-actions">`;
    html += `<button class="show-answer-btn" id="toggle-answer-btn-${safeUniqueId}" data-answer-toggle="${safeUniqueId}">`;
    html += `${isGalgameCard ? (isProgramming ? '打开参考幕' : '打开解析幕') : (isProgramming ? '查看参考代码' : '显示答案')}</button>`;
    if (!isGalgameCard) {
      html += `<button class="show-answer-btn" id="ai-toggle-btn-${safeUniqueId}" style="border-color: var(--accent-primary); color: var(--accent-primary); background: var(--accent-primary-glow);" onclick="window._runAiAnalysis('${safeUniqueId}', this)">`;
      html += `获取讲解提示词</button>`;
    }
    html += `</div>`;

    // 选择/判断题：就地反馈（与填空题风格一致）
    if (!isProgramming && (q.type === 'choice' || q.type === 'truefalse')) {
      html += `<div class="fillin-feedback" id="feedback-${safeUniqueId}" style="display: none;"></div>`;
    }

    // 答案区域
    html += `<div class="answer-section" id="answer-${safeUniqueId}">`;
    html += `
      <div class="answer-nav" aria-label="答案导航">
        <span class="answer-nav-title">${isGalgameCard ? '回想解析' : escapeHtml(label + ' · 解析')}</span>
        <div class="answer-nav-actions">
          <button class="answer-nav-btn" type="button" onclick="window._scrollToQuestion('${safeUniqueId}')">返回题目</button>
          <button class="answer-nav-btn" type="button" data-answer-toggle="${safeUniqueId}">收起</button>
        </div>
      </div>
    `;
    html += `<div class="answer-box">`;
    html += `<div class="answer-label">答案</div>`;

    if (isProgramming) {
      // 语法高亮 C++ 代码
      const highlighted = highlightCpp(q.answerCode || '暂无参考代码');
      html += `<div class="code-block-wrapper">`;
      html += `<button class="copy-code-btn" onclick="window.copyToClipboard(this)">复制</button>`;
      html += `<pre><code class="language-cpp">${highlighted}</code></pre>`;
      html += `</div>`;

      if (q.keyPoints && q.keyPoints.length) {
        html += `<div class="explanation" style="margin-bottom: 12px;"><strong>关键要点：</strong><ul>`;
        q.keyPoints.forEach(kp => { html += `<li>${escapeHtml(kp)}</li>`; });
        html += `</ul></div>`;
      }
      if (q.explanation) {
        html += `<div class="explanation" style="border-left: 3px solid var(--accent-info); padding-left: 12px; background: var(--bg-secondary); border-radius: var(--radius-sm); margin-top: 10px;">${parseMarkdown(q.explanation)}</div>`;
      }
    } else {
      let displayAns = q.answer;
      if (q.type === 'truefalse') {
        displayAns = normalizeTrueFalseAnswer(q.answer);
      }
      if (displayAns === false) displayAns = '错';
      if (displayAns === true) displayAns = '对';
      html += `<div class="answer-text">${escapeHtml(displayAns || '待核对')}</div>`;
      if (q.explanation) {
        html += `<div class="explanation">${parseMarkdown(q.explanation)}</div>`;
      }
    }

    html += `</div>`;
    html += `
      <div class="answer-footer-actions">
        <button class="show-answer-btn answer-return-btn" type="button" onclick="window._scrollToQuestion('${safeUniqueId}')">返回题目</button>
      </div>
    `;
    html += `</div></div>`;
    return html;
  }

  function formatStem(text) {
    let result = escapeHtml(text);
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    result = result.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    return result;
  }

  function formatOptionText(text) {
    let result = escapeHtml(text);
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    result = result.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    return result;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/'/g, '&#39;').replace(/`/g, '&#96;');
  }

  function getKnowledgePointsForItem(item) {
    const kps = [];
    // 优先使用标准化知识点（若已生成）
    if (item && Array.isArray(item.knowledgePointsNormalized) && item.knowledgePointsNormalized.length) {
      item.knowledgePointsNormalized.forEach(kp => {
        if (kp && typeof kp === 'string') kps.push(kp.trim());
      });
      return Array.from(new Set(kps.filter(Boolean)));
    }
    if (item && Array.isArray(item.knowledgePoints)) {
      item.knowledgePoints.forEach(kp => { if (kp && typeof kp === 'string') kps.push(kp.trim()); });
    }
    if (item && item.type === 'programming' && Array.isArray(item.keyPoints)) {
      item.keyPoints.forEach(kp => { if (kp && typeof kp === 'string') kps.push(kp.trim()); });
    }
    return Array.from(new Set(kps.filter(Boolean)));
  }

  function extractAllKnowledgePoints() {
    const set = new Set();
    const counts = {};
    state.allItems.forEach(item => {
      getKnowledgePointsForItem(item).forEach(kp => {
        set.add(kp);
        counts[kp] = (counts[kp] || 0) + 1;
      });
    });
    const points = Array.from(set).sort((a, b) => {
      const ca = counts[a] || 0;
      const cb = counts[b] || 0;
      if (cb !== ca) return cb - ca;
      return a.localeCompare(b, 'zh-Hans-CN');
    });
    return { points, counts };
  }

  function renderKnowledgeFilterOptions() {
    const knowledgeSelect = document.getElementById('knowledge-filter');
    if (!knowledgeSelect) return;

    const current = knowledgeSelect.value || 'all';
    knowledgeSelect.innerHTML = '<option value="all">全部知识点</option>';
    state.allKnowledgePoints.forEach(kp => {
      const opt = document.createElement('option');
      opt.value = kp;
      const c = state.knowledgePointCounts[kp] || 0;
      opt.textContent = c ? `${kp} (${c})` : kp;
      knowledgeSelect.appendChild(opt);
    });
    knowledgeSelect.value = current;
  }

  window._filterByKnowledgePoint = function (kp) {
    exitReviewQueue({ keepFocus: true });
    const knowledgeSelect = document.getElementById('knowledge-filter');
    state.selectedKnowledgePoint = kp || 'all';
    if (knowledgeSelect) knowledgeSelect.value = state.selectedKnowledgePoint;
    window._goToPage('quiz');
    filterAndRender();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function normalizeSearchText(text) {
    return String(text || '').toLowerCase().replace(/[\s《》“”"'`·:：,，.。()（）\[\]【】_-]+/g, '');
  }

  window._filterByKnowledgePointEncoded = function (encKp) {
    const kp = decodeURIComponent(String(encKp || ''));
    window._filterByKnowledgePoint(kp);
  };

  window._jumpToKnowledgePoint = function (kp) {
    const input = document.getElementById('knowledge-search');
    const lectureHint = (state.kpLectureMap && state.kpLectureMap[kp]) ? state.kpLectureMap[kp] : '';
    const queries = [lectureHint, kp].filter(Boolean);

    window._goToPage('knowledge');
    if (input) input.value = '';
    renderKnowledge('');

    setTimeout(() => {
      const chapters = Array.from(document.querySelectorAll('#knowledge-list .knowledge-chapter'));
      const normalizedQueries = queries.map(normalizeSearchText).filter(Boolean);
      let target = null;

      for (const ch of chapters) {
        const title = ch.querySelector('.chapter-title');
        const body = ch.querySelector('.chapter-body');
        const haystack = normalizeSearchText(`${title ? title.textContent : ''} ${body ? body.textContent : ''}`);
        if (normalizedQueries.some(q => haystack.includes(q))) {
          target = ch;
          break;
        }
      }

      if (!target && lectureHint) {
        const hintHead = normalizeSearchText(String(lectureHint).split(/[：:·-]/)[0]);
        target = chapters.find(ch => normalizeSearchText(ch.textContent).includes(hintHead));
      }

      if (target) {
        chapters.forEach(ch => ch.classList.remove('jump-highlight'));
        target.classList.add('open', 'jump-highlight');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => target.classList.remove('jump-highlight'), 1800);
      } else {
        if (input) input.value = kp || '';
        renderKnowledge(String(kp || '').toLowerCase());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  window._jumpToKnowledgePointEncoded = function (encKp) {
    const kp = decodeURIComponent(String(encKp || ''));
    window._jumpToKnowledgePoint(kp);
  };

  window._prevFocusQuestion = function () {
    if (state.filtered.length === 0) return;
    state.focusIndex = (state.focusIndex - 1 + state.filtered.length) % state.filtered.length;
    renderQuestionList({ stageEvent: 'prev' });
  };

  window._nextFocusQuestion = function () {
    if (state.filtered.length === 0) return;
    state.focusIndex = (state.focusIndex + 1) % state.filtered.length;
    renderQuestionList({ stageEvent: 'next' });
  };

  window._jumpToQuestionInput = function () {
    const jumpInput = document.getElementById('jump-input');
    if (!jumpInput) return;
    const rawVal = jumpInput.value.trim();
    if (!rawVal) return;

    const input = rawVal.toLowerCase();
    let targetItem = null;
    let targetIndexInFiltered = -1;
    let isDisplayIndexSearch = false;

    if (input.startsWith('#')) {
      isDisplayIndexSearch = true;
      const num = parseInt(input.slice(1), 10);
      if (!isNaN(num) && num > 0 && num <= state.filtered.length) {
        targetIndexInFiltered = num - 1;
        targetItem = state.filtered[targetIndexInFiltered];
      } else {
        showToast(`当前列表中没有序号为 #${num} 的题目。当前共 ${state.filtered.length} 题`, 'warning');
        jumpInput.select();
        return;
      }
    } else {
      // 1. Check if it matches a programming question ID (e.g. p12, prog12, p-12, prog-12)
      const progMatch = input.match(/^(?:p|prog|prog-)\s*(\d+)$/i) || input.match(/^p(\d+)$/i);
      if (progMatch) {
        const num = progMatch[1];
        const dbId = `P${num}`;
        targetItem = state.allItems.find(q => q.type === 'programming' && String(q.id).toUpperCase() === dbId);
      } else {
        // 2. Check if it matches a standard question ID specifically (e.g. q12, q-12)
        const stdMatch = input.match(/^(?:q|q-)\s*(\d+)$/i);
        if (stdMatch) {
          const num = parseInt(stdMatch[1], 10);
          targetItem = state.allItems.find(q => q.type !== 'programming' && Number(q.id) === num);
        } else {
          // 3. It's a plain number. Try database ID of standard question first, then programming, then display index
          const num = parseInt(input, 10);
          if (!isNaN(num)) {
            // Try standard question DB ID
            targetItem = state.allItems.find(q => q.type !== 'programming' && Number(q.id) === num);
            if (!targetItem) {
              // Try programming question DB ID (e.g. P12)
              const dbId = `P${num}`;
              targetItem = state.allItems.find(q => q.type === 'programming' && String(q.id).toUpperCase() === dbId);
            }
            if (!targetItem) {
              // Try display index in current filtered list
              if (num > 0 && num <= state.filtered.length) {
                targetIndexInFiltered = num - 1;
                targetItem = state.filtered[targetIndexInFiltered];
                isDisplayIndexSearch = true;
              }
            }
          }
        }
      }
    }

    if (!targetItem) {
      showToast(`未找到题号为 "${rawVal}" 的题目`, 'warning');
      jumpInput.select();
      return;
    }

    const leftReviewQueue = !isDisplayIndexSearch && exitReviewQueue({ keepFocus: true });
    if (leftReviewQueue) {
      filterAndRender();
    }

    // Check if the targetItem is in state.filtered
    if (!isDisplayIndexSearch) {
      targetIndexInFiltered = state.filtered.findIndex(q => q === targetItem);
      if (targetIndexInFiltered === -1) {
        // Not in current filtered list. Reset filters to make it visible.
        state.currentType = 'all';
        state.currentChapter = 'all';
        state.currentStatus = null;
        state.selectedKnowledgePoint = 'all';
        state.favoritesOnly = false;
        state.searchQuery = '';
        
        // Sync UI filter elements
        syncUIWithState();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        // Re-filter and render
        filterAndRender();

        // Re-find the target item index in the newly populated state.filtered
        targetIndexInFiltered = state.filtered.findIndex(q => q === targetItem);
        showToast('已自动重置筛选条件以定位目标题目', 'info');
      }
    }

    if (targetIndexInFiltered === -1) {
      showToast('无法在题库中定位该题目', 'warning');
      jumpInput.select();
      return;
    }

    // Go to the quiz page
    window._goToPage('quiz');

    // Perform the navigation
    if (state.quizMode === 'focus') {
      state.focusIndex = targetIndexInFiltered;
      saveViewState();
      renderQuestionList();
    } else {
      // List mode
      // Calculate how many pages are required to show the item
      const requiredPageCount = Math.ceil((targetIndexInFiltered + 1) / PAGE_SIZE);
      if (listPageCount < requiredPageCount) {
        listPageCount = requiredPageCount;
        saveViewState();
        renderQuestionList();
      }

      // Find the card element and scroll to it
      const uniqueId = targetItem.type === 'programming' ? `prog-${targetItem.id}` : `q-${targetItem.id}`;
      // Wait a moment for DOM rendering
      setTimeout(() => {
        const card = findQuestionCard(uniqueId);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('jump-highlight');
          setTimeout(() => card.classList.remove('jump-highlight'), 2000);
        } else {
          showToast('无法在列表中找到题目卡片', 'warning');
        }
      }, 60);
    }
    jumpInput.select();
  };

  // ============================================================
  // 全局答题方法
  // ============================================================

  function findQuestionCard(uniqueId) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return document.querySelector(`[data-id="${window.CSS.escape(uniqueId)}"]`);
    }
    return Array.from(document.querySelectorAll('[data-id]')).find(card => card.getAttribute('data-id') === String(uniqueId));
  }

  function setAnswerVisibility(id, visible) {
    const el = document.getElementById('answer-' + id);
    if (!el) return false;
    el.classList.toggle('visible', !!visible);
    const card = findQuestionCard(id);
    const isGalgameCard = !!card?.classList.contains('galgame-task-card');
    if (card) card.classList.toggle('answer-open', !!visible);
    document.body.classList.toggle('galgame-answer-open', !!visible && isGalgameCard && shouldUseGalgameStage());

    const btn = document.getElementById('toggle-answer-btn-' + id);
    if (btn) {
      const isProg = String(id).startsWith('prog-');
      if (isGalgameCard) {
        btn.textContent = visible ? '收起解析幕' : (isProg ? '打开参考幕' : '打开解析幕');
      } else {
        btn.textContent = visible ? `${isProg ? '隐藏参考代码' : '隐藏答案'}` : `${isProg ? '查看参考代码' : '显示答案'}`;
      }
    }
    if (visible) {
      playGalgameSe('decision');
      const q = getCurrentFocusItem();
      setGalgameDialogue(getGalgameLine(q, 'answer'), 'serious');
      setGalgameStory(q, 'answer');
    } else {
      playGalgameSe('cancel');
      updateGalgameStage('intro');
    }
    resetGalgameStageScroll();
    return true;
  }

  window._scrollToQuestion = function (id) {
    const card = findQuestionCard(id);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    card.classList.add('jump-highlight');
    clearTimeout(card._answerReturnTimer);
    card._answerReturnTimer = setTimeout(() => card.classList.remove('jump-highlight'), 1400);
  };

  window._toggleAnswer = function (id) {
    const el = document.getElementById('answer-' + id);
    if (!el) return;
    setAnswerVisibility(id, !el.classList.contains('visible'));
  };

  window._showAnswer = function (id) {
    setAnswerVisibility(id, true);
  };

  function normalizeChoiceAnswer(answer) {
    const match = String(answer || '').toUpperCase().match(/[A-D]/);
    return match ? match[0] : String(answer || '').trim().toUpperCase();
  }

  function normalizeTrueFalseAnswer(answer) {
    if (answer === true) return '对';
    if (answer === false) return '错';
    const raw = String(answer || '').trim().toLowerCase();
    if (['true', 't', 'yes', 'y', '正确', '对', '√', '✓'].includes(raw)) return '对';
    if (['false', 'f', 'no', 'n', '错误', '错', '×', '✗'].includes(raw)) return '错';
    return String(answer || '').trim();
  }

  window._selectOption = function (uniqueId, selectedLetter, element) {
    enableGalgameAudioFromUserGesture();
    playGalgameSe('decision');
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    if (uniqueId.startsWith('prog-')) return;

    // 防止重复作答
    const card = findQuestionCard(uniqueId);
    if (card) {
      if (card.classList.contains('answered-correct')) return;
      if (card.querySelector('.option-item.correct, .option-item.incorrect')) return;
    }

    const q = state.questions.find(item => String(item.id) === realId);
    if (!q) return;

    const answerStr = normalizeChoiceAnswer(q.answer);
    const isCorrect = selectedLetter === answerStr;
    const feedbackEl = document.getElementById('feedback-' + uniqueId);

    if (card) {
      card.querySelectorAll('.option-item').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });
    }
    element.classList.add('selected');
    setGalgameDialogue(getGalgameLine(q, 'selected', { choice: selectedLetter }), 'serious');
    setGalgameStory(q, 'selected');

    if (isCorrect) {
      if (card) card.classList.add('answered-correct');
      playGalgameSe('success');
      if (!state.settings.redoMode) element.classList.add('correct');
      window._setStatus(uniqueId, 'mastered', { toggle: false, fromAttempt: true });
      recordAttempt(`q_${realId}`, 'correct');
      updateSrs(`q_${realId}`, true);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback correct';
        feedbackEl.innerHTML = '回答正确。';
      }
      setGalgameDialogue(getGalgameLine(q, 'correct'), 'happy');
      setGalgameStory(q, 'correct');
      handleGalgameAttemptResult(true);
    } else {
      playGalgameSe('wrong');
      if (!state.settings.redoMode) element.classList.add('incorrect');
      window._setStatus(uniqueId, 'wrong', { toggle: false, fromAttempt: true });
      recordAttempt(`q_${realId}`, 'wrong');
      updateSrs(`q_${realId}`, false);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback incorrect';
        feedbackEl.innerHTML = '回答错误。';
      }
      setGalgameDialogue(getGalgameLine(q, 'wrong'), 'sad');
      setGalgameStory(q, 'wrong');
      handleGalgameAttemptResult(false);
    }

    if (state.galgameMode && isCorrect) {
      if (window._galgameTransitionTimer) clearTimeout(window._galgameTransitionTimer);
      window._galgameTransitionTimer = setTimeout(() => {
        window._nextFocusQuestion();
      }, 1800);
    } else if (!state.settings.redoMode) {
      if (card) {
        card.querySelectorAll('.option-item').forEach(opt => {
          if (opt.getAttribute('data-letter') === answerStr) {
            opt.classList.add('correct');
          }
        });
      }
      window._showAnswer(uniqueId);
    }
  };

  window._selectOptionTF = function (uniqueId, selectedValue, element) {
    enableGalgameAudioFromUserGesture();
    playGalgameSe('decision');
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    if (uniqueId.startsWith('prog-')) return;

    // 防止重复作答
    const card = findQuestionCard(uniqueId);
    if (card) {
      if (card.classList.contains('answered-correct')) return;
      if (card.querySelector('.option-item.correct, .option-item.incorrect')) return;
    }

    const q = state.questions.find(item => String(item.id) === realId);
    if (!q) return;

    const answerStr = normalizeTrueFalseAnswer(q.answer);
    const isCorrect = selectedValue === answerStr;
    const feedbackEl = document.getElementById('feedback-' + uniqueId);

    if (card) {
      card.querySelectorAll('.option-item').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
      });
    }
    element.classList.add('selected');
    setGalgameDialogue(getGalgameLine(q, 'selected', { choice: selectedValue }), 'serious');
    setGalgameStory(q, 'selected');

    if (isCorrect) {
      if (card) card.classList.add('answered-correct');
      playGalgameSe('success');
      if (!state.settings.redoMode) element.classList.add('correct');
      window._setStatus(uniqueId, 'mastered', { toggle: false, fromAttempt: true });
      recordAttempt(`q_${realId}`, 'correct');
      updateSrs(`q_${realId}`, true);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback correct';
        feedbackEl.innerHTML = '回答正确。';
      }
      setGalgameDialogue(getGalgameLine(q, 'correct'), 'happy');
      setGalgameStory(q, 'correct');
      handleGalgameAttemptResult(true);
    } else {
      playGalgameSe('wrong');
      if (!state.settings.redoMode) element.classList.add('incorrect');
      window._setStatus(uniqueId, 'wrong', { toggle: false, fromAttempt: true });
      recordAttempt(`q_${realId}`, 'wrong');
      updateSrs(`q_${realId}`, false);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback incorrect';
        feedbackEl.innerHTML = '回答错误。';
      }
      setGalgameDialogue(getGalgameLine(q, 'wrong'), 'sad');
      setGalgameStory(q, 'wrong');
      handleGalgameAttemptResult(false);
    }

    if (state.galgameMode && isCorrect) {
      if (window._galgameTransitionTimer) clearTimeout(window._galgameTransitionTimer);
      window._galgameTransitionTimer = setTimeout(() => {
        window._nextFocusQuestion();
      }, 1800);
    } else if (!state.settings.redoMode) {
      if (card) {
        card.querySelectorAll('.option-item').forEach(opt => {
          if (opt.getAttribute('data-val') === answerStr) {
            opt.classList.add('correct');
          }
        });
      }
      window._showAnswer(uniqueId);
    }
  };

  window._setStatus = function (uniqueId, status, options = {}) {
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const isProg = uniqueId.startsWith('prog-');
    const key = isProg ? `prog_${realId}` : `q_${realId}`;
    const result = setQuestionStatus(key, status, options);
    if (!result.changed) return;
    if (options.fromAttempt) return;
    const activeStatus = result.nextStatus;
    if (activeStatus === 'mastered') {
      adjustGalgameAffectionOnce(`${key}:mastered`, 4, 'mastered');
      setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'mastered'), 'happy');
      setGalgameStory(getCurrentFocusItem(), 'mastered');
      triggerGalgameMilestones();
    } else if (activeStatus === 'review') {
      adjustGalgameAffectionOnce(`${key}:review`, 1, 'review');
      setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'review'), 'serious');
      setGalgameStory(getCurrentFocusItem(), 'review');
    } else if (activeStatus === 'wrong') {
      adjustGalgameAffectionOnce(`${key}:markedWrong`, -1, 'markedWrong');
      setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'markedWrong'), 'sad');
      setGalgameStory(getCurrentFocusItem(), 'markedWrong');
    } else if (result.previousStatus === 'mastered') {
      adjustGalgameAffection(-2, 'unmastered');
      setGalgameDialogue('掌握印章先撤回。澪把笔帽合上，提醒你：这题要重新证明给她看。', 'serious');
      setGalgameStory(getCurrentFocusItem(), 'review');
    } else if (result.previousStatus === 'wrong') {
      adjustGalgameAffection(1, 'unmarkedWrong');
      setGalgameDialogue('错题伏笔先收起。只要你能把理由补上，这条路线还能升温。', 'smile');
      setGalgameStory(getCurrentFocusItem(), 'review');
    } else if (result.previousStatus === 'review') {
      adjustGalgameAffection(-1, 'unreview');
      setGalgameDialogue('待复习书签被撤下了。澪看了你一眼：确定不用再回看吗？', 'serious');
      setGalgameStory(getCurrentFocusItem(), 'review');
    }
  };

  window._checkFillinAnswer = function (uniqueId, inputEl) {
    enableGalgameAudioFromUserGesture();
    const card = findQuestionCard(uniqueId);
    if (card && card.classList.contains('answered-correct')) return;
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const q = state.questions.find(item => String(item.id) === realId);
    if (!q) return;

    const userAns = inputEl.value.trim().toLowerCase();
    const correctAnsStr = (q.answer || '').trim().toLowerCase();
    const feedbackEl = document.getElementById('feedback-' + uniqueId);

    if (!userAns) {
      playGalgameSe('wrong');
      feedbackEl.style.display = 'inline-block';
      feedbackEl.className = 'fillin-feedback incorrect';
      feedbackEl.innerHTML = '请先输入您的答案。';
      return;
    }

    feedbackEl.style.display = 'inline-block';

    // 统计题干中的填空数量
    const blankCount = ((q.stem || '').match(/_{2,}/g) || []).length;

    function normalize(str) {
      return str
        .replace(/\s+/g, '') // 移除所有空格以允许变宽空白的匹配
        .replace(/；/g, ';') // 统一中英文分号
        .replace(/，/g, ',') // 统一中英文逗号
        .replace(/（/g, '(').replace(/）/g, ')') // 统一中英文括号
        .replace(/；$/, '') // 移除尾部中文分号
        .replace(/;$/, '') // 移除尾部英文分号
        .replace(/iostream\.h/g, 'iostream')
        .replace(/std::/g, ''); // 忽略 std:: 命名空间前缀
    }

    // 用于拆分一个空的多种可接受写法（不按空格拆分）
    function splitAlternatives(raw) {
      if (!raw) return [];
      return String(raw)
        .trim()
        .split(/或|\//)
        .map(s => s.trim())
        .filter(Boolean);
    }

    // 用于拆分多个空的答案（支持 、，,；; 作为多空分隔符）
    function splitBlanks(raw) {
      if (!raw) return [];
      return String(raw)
        .trim()
        .split(/、|，|,|；|;/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    // 智能拆分用户输入：先尝试结构化分隔符，不够再用空格
    function splitUserInput(raw, expectedCount) {
      if (!raw) return [];
      const byDelim = splitBlanks(raw);
      if (byDelim.length >= expectedCount) return byDelim;
      // 用户可能用空格分隔各空答案，回退到空格拆分
      const bySpace = String(raw).trim().split(/\s+/).map(s => s.trim()).filter(Boolean);
      if (bySpace.length >= expectedCount) return bySpace;
      // 都不够，返回分隔符拆分的结果
      return byDelim;
    }

    const normUserAll = normalize(userAns);

    let isCorrect = false;

    if (blankCount <= 1) {
      // 单空：答案可能有多种可接受的写法（用 或 / 分隔）
      const alternatives = splitAlternatives(correctAnsStr).map(p => normalize(p)).filter(Boolean);
      const candidates = alternatives.length ? alternatives : [normalize(correctAnsStr)];
      isCorrect = candidates.some(opt => opt && normUserAll === opt);
    } else {
      // 多空：用 、逗号 分号等分隔正确答案的各个空
      const correctParts = splitBlanks(correctAnsStr).map(p => normalize(p)).filter(Boolean);
      // 用户输入：智能拆分，支持空格分隔
      const userParts = splitUserInput(userAns, correctParts.length).map(p => normalize(p)).filter(Boolean);

      if (userParts.length === correctParts.length) {
        // 优先严格顺序匹配
        const orderOk = userParts.every((p, idx) => p === correctParts[idx]);
        if (orderOk) {
          isCorrect = true;
        } else {
          // 其次集合匹配（允许顺序不同）
          const a = [...userParts].sort().join('|');
          const b = [...correctParts].sort().join('|');
          if (a === b) isCorrect = true;
        }
      }
      // 兜底：用户把多项连写在一起
      if (!isCorrect) {
        const joined = correctParts.join('');
        if (joined && normUserAll === joined) isCorrect = true;
      }
    }

    if (isCorrect) {
      if (card) card.classList.add('answered-correct');
      playGalgameSe('success');
      feedbackEl.className = 'fillin-feedback correct';
      feedbackEl.innerHTML = '回答正确。';
      window._setStatus(uniqueId, 'mastered', { toggle: false, fromAttempt: true });
      recordAttempt(`q_${realId}`, 'correct');
      updateSrs(`q_${realId}`, true);
      setGalgameDialogue(getGalgameLine(q, 'correct'), 'happy');
      setGalgameStory(q, 'correct');
      handleGalgameAttemptResult(true);
    } else {
      playGalgameSe('wrong');
      feedbackEl.className = 'fillin-feedback incorrect';
      feedbackEl.innerHTML = `回答错误。您的答案与参考答案不匹配，建议点击“显示答案”比对。`;
      window._setStatus(uniqueId, 'wrong', { toggle: false, fromAttempt: true });
      recordAttempt(`q_${realId}`, 'wrong');
      updateSrs(`q_${realId}`, false);
      setGalgameDialogue(getGalgameLine(q, 'wrong'), 'sad');
      setGalgameStory(q, 'wrong');
      handleGalgameAttemptResult(false);
    }
  };

  function recordAttempt(idKey, result) {
    try {
      state.attempts.unshift({ id: idKey, ts: Date.now(), result });
      if (state.attempts.length > 200) state.attempts.length = 200;
      saveJsonToStorage(ATTEMPTS_KEY, state.attempts);
      renderRecentAttempts();
      updateTodayReviewButton();
    } catch {}
  }

  function updateSrs(idKey, isCorrect) {
    const now = Date.now();
    const s = state.questionStats[idKey] || { streak: 0, wrongCount: 0, lastTs: 0, nextReviewTs: 0 };
    s.lastTs = now;
    if (isCorrect) {
      s.streak = Math.min((s.streak || 0) + 1, 6);
    } else {
      s.streak = 0;
      s.wrongCount = (s.wrongCount || 0) + 1;
    }
    const days = [1, 3, 7, 14, 30, 60];
    const nextDays = days[Math.max(0, Math.min((s.streak || 1) - 1, days.length - 1))];
    s.nextReviewTs = now + nextDays * 24 * 60 * 60 * 1000;
    state.questionStats[idKey] = s;
    saveJsonToStorage(STATS_KEY, state.questionStats);
    updateTodayReviewButton();
  }

  window._toggleFavorite = function (idKey) {
    const wasFavorite = !!state.favorites[idKey];
    if (wasFavorite) delete state.favorites[idKey];
    else state.favorites[idKey] = true;
    saveJsonToStorage(FAVORITES_KEY, state.favorites);
    if (!state.reviewQueueActive && state.favoritesOnly) {
      scheduleFilteredRefreshAfterMutation(idKey);
    } else {
      renderQuestionList();
    }
    showToast(state.favorites[idKey] ? '已收藏' : '已取消收藏', 'info');
    if (state.galgameMode) {
      if (state.favorites[idKey]) {
        adjustGalgameAffection(2, 'favorite');
        setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'favorite'), 'happy');
        setGalgameStory(getCurrentFocusItem(), 'favorite');
      } else {
        adjustGalgameAffection(-2, 'unfavorite');
        setGalgameDialogue(getGalgameLine(getCurrentFocusItem(), 'unfavorite'), 'sad');
        setGalgameStory(getCurrentFocusItem(), 'unfavorite');
      }
    }
  };

  window._gradeProgrammingAnswer = async function (uniqueId, btnEl) {
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const q = state.programming.find(item => String(item.id) === realId);
    if (!q) return;

    const textarea = document.getElementById('prog-input-' + uniqueId);
    const userCode = (textarea ? textarea.value : '').trim();

    if (!userCode) {
      showToast('请先贴入你的 C++ 代码', 'error');
      if (textarea) textarea.focus();
      return;
    }

    const systemPrompt = "你是一位精通 C++ 面向对象程序设计的资深评测导师。请将学生的解答代码与标准答案进行仔细对比，检查是否实现了题目所有要求（核心 OOP 设计、构造与析构、内存管理等），指出代码中的逻辑错误、编译隐患、或者不符合 C++17 标准的问题。请给出 0 到 100 之间的评分（格式为：【得分：85分】），并提供详细的改进意见。请使用 Markdown 语法进行高质量排版，中文作答。";
    const userPrompt = `【题目名称】: ${q.title}
【题目要求】:
${q.requirement}

【标准参考答案代码】:
\`\`\`cpp
${q.answerCode}
\`\`\`

【学生解答代码】:
\`\`\`cpp
${userCode}
\`\`\`

请对上述学生解答代码进行评审打分并给出建议。`;

    const ok = await copyPromptAndNotify(`${systemPrompt}\n\n${userPrompt}`);
    flashCopied(btnEl, '检查代码', ok);
  };

  window._runAiAnalysis = async function (uniqueId, btnEl) {
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const isProg = uniqueId.startsWith('prog-');
    let promptContent = '';

    if (isProg) {
      const q = state.programming.find(item => String(item.id) === realId);
      if (!q) return;
      promptContent = `请分析下面这道 C++ 程序设计复习题：\n题目：${q.title}\n功能要求：${q.requirement}\n参考代码实现：\n\`\`\`cpp\n${q.answerCode}\n\`\`\`\n核心知识点：${(q.keyPoints || []).join(', ')}`;
    } else {
      const q = state.questions.find(item => String(item.id) === realId);
      if (!q) return;
      const typeName = { choice: '选择题', truefalse: '判断题', fillin: '填空题', coding: '程序分析题' }[q.type] || q.type;
      promptContent = `请分析下面这道 C++ 复习题：\n题型：${typeName}\n题目章节：${q.chapter}\n题干：${q.stem}\n${q.options ? '选项：\n' + q.options.join('\n') : ''}\n正确答案：${q.answer}\n原版答案解析：${q.explanation || '无'}`;
    }

    const systemPrompt = "你是一位精通 C++ 面向对象程序设计（OOP）的老师。请为学生提供深入浅出的解题步骤思路、该题关联的 C++ 核心机制解析（例如为什么不能写成某种错误的语法）、以及相关的核心代码小范例（如果有）。请使用 Markdown 语法排版，逻辑清晰，中文作答，保证 self-contained 完备性。";

    const ok = await copyPromptAndNotify(`${systemPrompt}\n\n${promptContent}`);
    flashCopied(btnEl || document.getElementById(`ai-toggle-btn-${uniqueId}`), '获取讲解提示词', ok);
  };

  // 复制类按钮的短暂“✓ 已复制”反馈：复制成功由 toast 告知即可，
  // 不再额外渲染一个只写着“已复制”的冗余结果框。
  function flashCopied(btn, label, ok) {
    if (!btn || !ok) return;
    btn.textContent = '✓ 已复制';
    btn.classList.add('btn-copied-flash');
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      btn.textContent = label;
      btn.classList.remove('btn-copied-flash');
    }, 1800);
  }

  async function copyPromptAndNotify(text, successMessage = '提示词已复制到剪贴板') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy failed');
      }
      showToast(successMessage, 'success');
      return true;
    } catch (e) {
      showToast('复制失败：请检查浏览器剪贴板权限', 'error');
      return false;
    }
  }



  // initBackToTop consolidated into initUI

  function updateBackToTopVisibility() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const active = document.querySelector('.page.active');
    const inQuiz = active && active.id === 'page-quiz';
    const visible = inQuiz && state.quizMode === 'list' && window.scrollY > 420;
    btn.classList.toggle('visible', !!visible);
  }

  function renderRecentAttempts() {
    const container = document.getElementById('recent-attempts');
    if (!container) return;
    const items = getRecentCurrentAttempts(20);
    if (!items.length) {
      container.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;">暂无作答记录</div>';
      return;
    }
    container.innerHTML = items.map(it => {
      const dt = new Date(it.ts);
      const t = `${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      const label = it.id.startsWith('prog_') ? `程序 ${it.id.replace('prog_', '')}` : `第 ${it.id.replace('q_', '')} 题`;
      const color = it.result === 'correct' ? 'var(--accent-success)' : it.result === 'wrong' ? 'var(--accent-danger)' : 'var(--accent-warning)';
      return `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 12px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-card);margin-bottom:8px;cursor:pointer;" onclick="window._jumpToQuestionByKey('${it.id}')">
        <span style="font-size:0.88rem;color:var(--text-primary);">${escapeHtml(label)}</span>
        <span style="font-size:0.8rem;color:${color};font-weight:600;">${it.result === 'correct' ? '正确' : it.result === 'wrong' ? '错误' : '复习'}</span>
        <span style="font-size:0.78rem;color:var(--text-muted);margin-left:auto;">${t}</span>
      </div>`;
    }).join('');
  }

  window._jumpToQuestionByKey = function (idKey) {
    const key = String(idKey || '');
    const isProg = key.startsWith('prog_');
    const realId = key.replace(/^(q_|prog_)/, '');
    const target = state.allItems.find(q => String(q.id) === String(realId) && (isProg ? q.type === 'programming' : q.type !== 'programming'));

    if (!target) {
      showToast('没有找到这道题，可能题库版本已变化。', 'warning');
      return;
    }

    exitReviewQueue({ keepFocus: true });
    state.currentType = 'all';
    state.currentChapter = 'all';
    state.currentStatus = null;
    state.searchQuery = '';
    state.selectedKnowledgePoint = 'all';
    state.favoritesOnly = false;
    state.quizMode = 'focus';

    syncUIWithState();
    const knowledgeSelect = document.getElementById('knowledge-filter');
    if (knowledgeSelect) knowledgeSelect.value = 'all';
    const chapterSelect = document.getElementById('chapter-filter');
    if (chapterSelect) chapterSelect.value = 'all';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    const favBtn = document.getElementById('favorites-only');
    if (favBtn) favBtn.classList.remove('active');

    filterAndRender();
    state.focusIndex = Math.max(0, state.filtered.indexOf(target));
    window._goToPage('quiz');
    renderQuestionList();
    setTimeout(() => {
      const uniqueId = target.type === 'programming' ? `prog-${target.id}` : `q-${target.id}`;
      const card = findQuestionCard(uniqueId);
      if (card) {
        card.classList.add('jump-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => card.classList.remove('jump-highlight'), 1600);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);
  };

  function renderFooterMeta() {
    const el = document.getElementById('meta-version');
    if (!el) return;
    loadJSON('metadata.json').then(meta => {
      if (!meta) return;
      const v = meta.version || meta.generatedAt || '';
      if (!v) return;
      el.textContent = `题库版本：${v}`;
    }).catch(() => {});
  }

  // ============================================================
  // 统计
  // ============================================================
  function renderStats() {
    const counts = { choice: 0, truefalse: 0, fillin: 0, coding: 0, programming: 0 };
    state.allItems.forEach(q => { if (counts[q.type] !== undefined) counts[q.type]++; });

    document.getElementById('stat-choice').textContent = counts.choice;
    document.getElementById('stat-truefalse').textContent = counts.truefalse;
    document.getElementById('stat-fillin').textContent = counts.fillin;
    const codingEl = document.getElementById('stat-coding');
    if (codingEl) codingEl.textContent = counts.coding;
    document.getElementById('stat-programming').textContent = counts.programming;

    // 进度统计
    const progress = getProgressCounts();

    document.getElementById('stat-mastered').textContent = progress.mastered;
    document.getElementById('stat-review').textContent = progress.review;
    document.getElementById('stat-wrong').textContent = progress.wrong;
  }

  function renderDashboard() {
    const totalEl = document.getElementById('hero-total');
    const kpEl = document.getElementById('hero-kp');
    const dueEl = document.getElementById('hero-due');
    const accuracyEl = document.getElementById('hero-accuracy');
    if (totalEl) totalEl.textContent = state.allItems.length;
    if (kpEl) kpEl.textContent = state.allKnowledgePoints.length;
    if (dueEl) dueEl.textContent = typeof getTodayReviewKeys === 'function' ? getTodayReviewKeys().length : 0;
    if (accuracyEl) {
      const attempts = getRecentCurrentAttempts(20);
      const correct = attempts.filter(a => a.result === 'correct').length;
      accuracyEl.textContent = attempts.length ? `${Math.round(correct / attempts.length * 100)}%` : '--';
    }
  }

  // ============================================================
  // 知识点页面
  // ============================================================
  function renderKnowledge(searchQuery = '') {
    const container = document.getElementById('knowledge-list');
    const indexContainer = document.getElementById('knowledge-point-index');
    let data = state.knowledge;

    if (!data || !data.length) {
      container.innerHTML = '<div class="empty-state"><div class="icon">-</div><p>知识点数据加载中…</p></div>';
      return;
    }

    // 知识点索引（来自题库 tags）
    if (indexContainer) {
      const chips = state.allKnowledgePoints.slice(0, 60).map(kp => {
        const encKp = encodeURIComponent(kp);
        const safeEncKp = escapeAttr(encKp);
        const c = state.knowledgePointCounts[kp] || 0;
        return `<div class="kp-chip" onclick="window._jumpToKnowledgePointEncoded('${safeEncKp}')" title="点击打开对应讲义">${escapeHtml(kp)}${c ? ` <span style="opacity:0.7;font-size:0.8em;">(${c})</span>` : ''} <span class="kp-action" onclick="event.stopPropagation(); window._filterByKnowledgePointEncoded('${safeEncKp}');" title="按该知识点筛题">练题</span></div>`;
      }).join('');

      indexContainer.innerHTML = `
        <div class="kp-index-card">
          <div class="kp-index-title">
            <h3>知识点索引</h3>
            <span style="font-size:0.8rem;color:var(--text-muted);">共 ${state.allKnowledgePoints.length} 个</span>
          </div>
          <div class="kp-chips">${chips || '<span style="color:var(--text-muted);font-size:0.85rem;">暂无知识点标签</span>'}</div>
          ${state.allKnowledgePoints.length > 60 ? '<div style="margin-top:10px;font-size:0.8rem;color:var(--text-muted);">仅展示出现次数最多的前 60 个；更多请用刷题页“知识点下拉”或本页搜索。</div>' : ''}
        </div>
      `;
    }

    if (searchQuery) {
      data = data.filter(ch =>
        ch.title.toLowerCase().includes(searchQuery) ||
        (ch.markdown && ch.markdown.toLowerCase().includes(searchQuery)) ||
        (ch.points && ch.points.some(p => p.toLowerCase().includes(searchQuery)))
      );
    }

    container.innerHTML = data.map((ch, i) => {
      const renderedBody = ch.markdown
        ? parseMarkdown(ch.markdown)
        : (ch.content ? ch.content.replace(/\n/g, '<br>') : '') +
          (ch.points ? '<ul>' + ch.points.map(p => `<li>${escapeHtml(p)}</li>`).join('') + '</ul>' : '');

      // 基于文本匹配的“相关题目”入口（弱关联，但能形成跳转闭环）
      const chapterText = ((ch.title || '') + ' ' + (ch.markdown || '') + ' ' + (ch.points ? ch.points.join(' ') : '')).toLowerCase();
      const matchedKps = state.allKnowledgePoints.filter(kp => chapterText.includes(kp.toLowerCase())).slice(0, 6);
      const relatedItems = [];
      matchedKps.forEach(kp => {
        state.allItems.forEach(item => {
          if (getKnowledgePointsForItem(item).includes(kp)) relatedItems.push({ kp, item });
        });
      });
      const relatedUniq = [];
      const seen = new Set();
      relatedItems.forEach(({ kp, item }) => {
        const id = `${item.type === 'programming' ? 'prog' : 'q'}-${item.id}`;
        const key = `${kp}::${id}`;
        if (seen.has(key)) return;
        seen.add(key);
        relatedUniq.push({ kp, item });
      });
      const relatedHtml = relatedUniq.slice(0, 10).map(({ kp, item }) => {
        const label = item.type === 'programming' ? `程序 ${item.id}` : `第 ${item.id} 题`;
        const idKey = item.type === 'programming' ? `prog_${item.id}` : `q_${item.id}`;
        return `<button class="rq-link" onclick="window._jumpToQuestionByKey('${escapeAttr(idKey)}')" title="打开这道题">${escapeHtml(label)} · ${escapeHtml(kp)}</button>`;
      }).join('');

      return `
        <div class="knowledge-chapter ${i === 0 ? 'open' : ''}" id="kch-${i}">
          <div class="chapter-header" onclick="window._toggleChapter(${i})">
            <div class="chapter-title">
              <span style="color:var(--accent-primary);font-size:0.85rem;font-weight:700;">${String(i + 1).padStart(2, '0')}</span>
              ${escapeHtml(ch.title || '')}
            </div>
            <span class="chapter-arrow">▼</span>
          </div>
          <div class="chapter-body">
            ${renderedBody}
            ${relatedHtml ? `<div class="related-questions"><div class="title">相关题目（按知识点匹配）</div><div class="items">${relatedHtml}</div></div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  window._toggleChapter = function (i) {
    const el = document.getElementById('kch-' + i);
    if (el) el.classList.toggle('open');
  };

  // ============================================================
  // 进度页面 (Animate Circular Progress)
  // ============================================================
  function renderProgress() {
    const total = state.allItems.length;
    const progress = getProgressCounts();

    const totalEl = document.getElementById('progress-total');
    const masteredEl = document.getElementById('progress-mastered');
    const reviewEl = document.getElementById('progress-review');
    const wrongEl = document.getElementById('progress-wrong');

    if (totalEl) totalEl.textContent = total;
    if (masteredEl) masteredEl.textContent = progress.mastered;
    if (reviewEl) reviewEl.textContent = progress.review;
    if (wrongEl) wrongEl.textContent = progress.wrong;

    const percent = total > 0 ? Math.round(progress.mastered / total * 100) : 0;

    // 更新环形进度 SVG 的 Dash Offset
    const ringCircle = document.getElementById('progress-ring-circle');
    if (ringCircle) {
      const circumference = 314.16;
      const offset = circumference - (circumference * percent) / 100;
      ringCircle.style.strokeDashoffset = offset;
    }

    const percentText = document.getElementById('progress-percent');
    if (percentText) percentText.textContent = percent + '%';

    const insights = document.getElementById('review-insights');
    if (insights) {
      const dueCount = getTodayReviewKeys().length;
      const marked = progress.mastered + progress.review + progress.wrong;
      const untouched = Math.max(total - marked, 0);
      const nextAction = dueCount > 0
        ? `优先完成复习队列中的 ${dueCount} 道题，防止遗忘曲线回落。`
        : untouched > 0
          ? `继续推进 ${untouched} 道未标记题，先用焦点模式做一轮诊断。`
          : '当前题库已全部纳入学习记录，可按错题与待复习标签做二轮巩固。';
      insights.innerHTML = `
        <div class="insight-card primary"><strong>下一步建议</strong><span>${escapeHtml(nextAction)}</span></div>
        <div class="insight-card"><strong>错题负荷</strong><span>${progress.wrong} 道错题，建议先看解析再重做。</span></div>
        <div class="insight-card"><strong>复习节奏</strong><span>${progress.review} 道待复习，${state.favorites ? Object.keys(state.favorites).length : 0} 道已收藏。</span></div>
      `;
    }

    renderDashboard();

    // 按章节进度
    const chapterContainer = document.getElementById('chapter-progress');
    if (!chapterContainer) return;

    const chapterStats = {};
    state.allItems.forEach(q => {
      const ch = q.chapter || '其他';
      if (!chapterStats[ch]) chapterStats[ch] = { total: 0, mastered: 0 };
      chapterStats[ch].total++;
      const isProg = q.type === 'programming';
      const key = isProg ? `prog_${q.id}` : `q_${q.id}`;
      if (state.userProgress[key] === 'mastered') chapterStats[ch].mastered++;
    });

    // 按课程大纲顺序（state.chapters 已排序）展示，未知章节追加在后
    const orderedChapters = state.chapters.filter(ch => chapterStats[ch]);
    Object.keys(chapterStats).forEach(ch => {
      if (!orderedChapters.includes(ch)) orderedChapters.push(ch);
    });

    chapterContainer.innerHTML = orderedChapters.map(ch => {
      const s = chapterStats[ch];
      const pct = s.total > 0 ? Math.round(s.mastered / s.total * 100) : 0;
      return `
        <div class="question-card" style="padding:14px 20px;margin-bottom:8px; display:flex; flex-direction:column; justify-content:center;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:0.88rem;font-weight:500;">${escapeHtml(ch)}</span>
            <span style="font-size:0.8rem;color:var(--text-secondary);">${s.mastered}/${s.total} (${pct}%)</span>
          </div>
          <div class="progress-bar-container" style="height: 6px; border-radius: 3px;">
            <div class="progress-bar-fill" style="width:${pct}%; border-radius: 3px;"></div>
          </div>
        </div>
      `;
    }).join('');

    renderRecentAttempts();
  }

  // ============================================================
  // 进度导入/导出 + 今日复习
  // ============================================================
  window.exportProgress = function () {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: state.userProgress || {},
      favorites: state.favorites || {},
      attempts: state.attempts || [],
      questionStats: state.questionStats || {},
      settings: state.settings || {}
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oop-progress-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('已导出进度文件', 'success');
  };

  function initImportProgress() {
    const input = document.getElementById('import-file');
    if (!input) return;
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || typeof data !== 'object' || !data.progress) {
          showToast('导入失败：文件格式不正确', 'error');
          return;
        }
        state.userProgress = data.progress || {};
        state.favorites = data.favorites || {};
        state.attempts = Array.isArray(data.attempts) ? data.attempts : [];
        exitReviewQueue({ keepFocus: true });
        if (data.settings && typeof data.settings === 'object') {
          state.settings = Object.assign(state.settings, data.settings);
          normalizeSettings();
          localStorage.setItem('oop_redo_mode', state.settings.redoMode ? '1' : '0');
          saveJsonToStorage(SETTINGS_KEY, state.settings);
        }

        if (data.questionStats && typeof data.questionStats === 'object') {
          state.questionStats = data.questionStats;
          saveJsonToStorage(STATS_KEY, state.questionStats);
        }

        saveProgress();
        saveJsonToStorage(FAVORITES_KEY, state.favorites);
        saveJsonToStorage(ATTEMPTS_KEY, state.attempts);

        applyShuffle();
        renderStats();
        filterAndRender();
        renderProgress();
        showToast('导入成功', 'success');
      } catch (e) {
        showToast('导入失败：解析 JSON 出错', 'error');
      }
    });
  }

  function getTodayReviewKeys() {
    const now = Date.now();
    const validKeys = getCurrentProgressKeys();
    const due = [];
    Object.entries(state.questionStats || {}).forEach(([k, s]) => {
      if (validKeys.has(k) && s && typeof s.nextReviewTs === 'number' && s.nextReviewTs <= now) due.push(k);
    });
    // 兜底：错题 / 待复习
    Object.entries(state.userProgress || {}).forEach(([k, v]) => {
      if (validKeys.has(k) && (v === 'wrong' || v === 'review') && !due.includes(k)) due.push(k);
    });
    return due.slice(0, 80);
  }

  function updateTodayReviewButton() {
    const btn = document.getElementById('today-review');
    if (!btn) return;
    const dueCount = getTodayReviewKeys().length;
    if (state.reviewQueueActive) {
      document.querySelectorAll('#mode-filters .filter-btn[data-mode]').forEach(modeBtn => {
        modeBtn.classList.remove('active');
      });
    }
    btn.disabled = dueCount === 0 && !state.reviewQueueActive;
    btn.classList.toggle('active', !!state.reviewQueueActive);
    btn.textContent = state.reviewQueueActive
      ? `退出复习队列（${state.filtered.length || state.reviewQueueKeys.length}）`
      : (dueCount === 0 ? '复习队列（0）' : `复习队列（${dueCount}）`);
  }

  window.startTodayReview = function () {
    if (state.reviewQueueActive) {
      window.exitTodayReview();
      return;
    }

    const keys = getTodayReviewKeys();
    if (!keys.length) {
      showToast('当前暂无需要复习的题目', 'info');
      updateTodayReviewButton();
      return;
    }

    state.reviewQueueActive = true;
    state.reviewQueueKeys = keys;
    state.reviewQueuePreviousMode = state.quizMode;
    state.reviewQueuePreviousFocusIndex = state.focusIndex || 0;
    const previousFocusItem = state.filtered[state.focusIndex];
    state.reviewQueuePreviousFocusKey = previousFocusItem ? getProgressKeyForItem(previousFocusItem) : null;
    state.quizMode = 'focus';
    state.focusIndex = 0;
    window._goToPage('quiz');
    filterAndRender();
    updateTodayReviewButton();
    showToast(`复习队列：${state.filtered.length} 题`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.clearAllFilters = function () {
    exitReviewQueue({ keepFocus: true });
    state.currentType = 'all';
    state.currentChapter = 'all';
    state.currentStatus = null;
    state.selectedKnowledgePoint = 'all';
    state.favoritesOnly = false;
    state.searchQuery = '';
    
    syncUIWithState();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    saveViewState();
    filterAndRender();
  };

  // ============================================================
  // 内嵌后备数据 (当 JSON 加载失败时)
  // ============================================================
  function getFallbackQuestions() {
    return [
      { id: 1, type: 'choice', chapter: '绪论', stem: '以下不属于面向对象程序设计特征的是（  ）。', options: ['A. 数据抽象', 'B. 封闭性', 'C. 继承性', 'D. 多态性'], answer: 'B', explanation: '面向对象四大特征是：抽象、封装、继承、多态。"封闭性"不是标准术语，应为"封装性"。', knowledgePoints: ['面向对象特征'], status: 'confirmed' },
      { id: 2, type: 'choice', chapter: 'C++对C的扩充', stem: '有名称空间定义如下，则可以正确调用到该名称空间中变量 Num 的语句是（  ）\nnamespace Student{ int Num; }', options: ['A. Student::Num;', 'B. using namespace Num;', 'C. Num;', 'D. Student.Num'], answer: 'A', explanation: '使用作用域解析符 :: 访问命名空间成员。', knowledgePoints: ['命名空间'], status: 'confirmed' },
      { id: 3, type: 'choice', chapter: '类与对象', stem: '下列关于 C++中结构体和类的说法错误的是（  ）。', options: ['A. 结构体的默认访问类型为 public', 'B. 类的默认访问类型为 private', 'C. 构造函数在对象被建立时被调用', 'D. 析构函数可以被重载'], answer: 'D', explanation: '析构函数不能被重载，每个类只有一个析构函数，无参数无返回值。', knowledgePoints: ['析构函数', '类与结构体'], status: 'confirmed' },
      { id: 4, type: 'truefalse', chapter: '运算符重载', stem: '所有 C++运算符都可以重载。', answer: '错', explanation: '不可重载的运算符有5个：. .* :: ?: sizeof', knowledgePoints: ['运算符重载规则'], status: 'confirmed' },
      { id: 5, type: 'fillin', chapter: '类与对象', stem: '在面向对象的程序设计中，________是现实世界在计算机中的反映，它将数据和对这些数据的操作封装在一起。', answer: '对象', explanation: '', knowledgePoints: ['对象概念'], status: 'confirmed' },
    ];
  }

  function getFallbackKnowledge() {
    return [
      { title: '绪论', content: '面向对象程序设计的四大特征：抽象、封装、继承、多态。', points: ['类是抽象模板，对象是类的具体实例', '高内聚低耦合是设计原则', 'OOP 起源：Simula 67 → Smalltalk → C++'] },
      { title: 'C++对C的扩充', content: '输入输出流、动态内存、引用、函数重载等。', points: ['new/delete vs malloc/free', '引用必须初始化，不能重新绑定', '函数重载通过参数类型和个数区分，不通过返回值'] },
    ];
  }

  // ============================================================
  // 启动
  // ============================================================
  document.addEventListener('DOMContentLoaded', loadAllData);

})();

