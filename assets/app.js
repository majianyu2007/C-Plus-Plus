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
    userProgress: {},     // { questionId: 'mastered' | 'review' | 'wrong' }
    chapters: [],
    allKnowledgePoints: [],
    kpLectureMap: {}, // { "知识点": "讲义章节hint" }
    favoritesOnly: false,
    quizMode: 'list',     // 'list' (列表) 或 'focus' (单题焦点)
    focusIndex: 0         // 焦点模式下的当前题目索引
  };

  // ============================================================
  // 本地设置 / 收藏 / 记录 / SRS
  // ============================================================
  const SETTINGS_KEY = 'oop_settings';
  const FAVORITES_KEY = 'oop_favorites';
  const ATTEMPTS_KEY = 'oop_attempts';
  const STATS_KEY = 'oop_question_stats';

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
    aiMode: localStorage.getItem('oop_ai_mode') || 'clipboard',
    saveApiKey: localStorage.getItem('oop_save_api_key') !== '0',
    redoMode: localStorage.getItem('oop_redo_mode') === '1',
    shuffle: true,
    seed: Math.floor(Math.random() * 1000000) + 1
  };

  state.settings = Object.assign(
    defaultSettings,
    loadJsonFromStorage(SETTINGS_KEY, {})
  );

  state.favorites = loadJsonFromStorage(FAVORITES_KEY, {}); // { "q_1": true }
  state.attempts = loadJsonFromStorage(ATTEMPTS_KEY, []); // [{id,ts,result}]
  state.questionStats = loadJsonFromStorage(STATS_KEY, {}); // { "q_1": {streak,nextReviewTs,wrongCount,lastTs} }

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
    if (state.settings.shuffle) {
      if (!state.settings.seed) {
        state.settings.seed = Math.floor(Math.random() * 1000000) + 1;
        saveJsonToStorage(SETTINGS_KEY, state.settings);
      }
      state.allItems = seededShuffle(state.originalAllItems, state.settings.seed);
    } else {
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
  async function loadJSON(filename) {
    const paths = [`data/${filename}`, `../data/${filename}`, `site/data/${filename}`];
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) return await res.json();
      } catch (e) { /* try next */ }
    }
    console.warn(`无法加载 ${filename}，使用内嵌数据`);
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

      // 为程序题添加 type 字段
      state.programming.forEach(p => { p.type = 'programming'; });

      // 合并所有题目
      state.originalAllItems = [...state.questions, ...state.programming];

      // 应用乱序逻辑
      applyShuffle();

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

      // 提取章节列表
      const chapterSet = new Set();
      state.allItems.forEach(q => { if (q.chapter) chapterSet.add(q.chapter); });
      state.chapters = Array.from(chapterSet);

      // 加载用户进度
      loadProgress();

      // 初始化界面
      initUI();
      initTheme();
      initApiSettings();
      initImportProgress();
      renderStats();
      renderDashboard();
      filterAndRender();
      renderKnowledge();
      renderProgress();
      // initBackToTop removed: event binding consolidated in initUI
      renderFooterMeta();
      updateTodayReviewButton();

      hideLoadingCover();
    } catch (err) {
      console.error('数据加载失败:', err);
      hideLoadingCover();
      document.getElementById('question-list').innerHTML =
        '<div class="empty-state"><div class="icon">⚠️</div><p>数据加载失败，请确认 <code>data/</code> 目录下有 JSON 数据文件，并通过 HTTP 方式访问站点（不要用 file:/// 直接打开）。</p></div>';
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

  function setQuestionStatus(id, status, options = {}) {
    const key = String(id);
    const shouldToggle = options.toggle !== false;
    if (shouldToggle && state.userProgress[key] === status) {
      delete state.userProgress[key]; // 手动再次点击同一状态时取消标记
    } else {
      state.userProgress[key] = status;
    }
    saveProgress();
    renderStats();
    renderDashboard();
    renderProgress();
    updateCardActions(id);
    updateTodayReviewButton();
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

  window.resetProgress = function () {
    if (confirm('确定要重置所有学习进度吗？\n\n将同时清空：已掌握/待复习/错题标记、作答记录、复习统计。\n不会清空收藏。此操作不可撤销。')) {
      state.userProgress = {};
      saveProgress();
      state.attempts = [];
      saveJsonToStorage(ATTEMPTS_KEY, state.attempts);
      state.questionStats = {};
      saveJsonToStorage(STATS_KEY, state.questionStats);
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
      'inter': "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
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
      const resolvedLight = mode === 'light' || (mode === 'system' && media && media.matches);
      document.body.classList.toggle('light-theme', !!resolvedLight);
      document.body.classList.toggle('dark-theme', !resolvedLight);
      if (btn) {
        const labels = { system: '系统', light: '浅色', dark: '深色' };
        btn.textContent = `🌓 ${labels[mode] || labels.system}`;
        btn.title = `当前：${labels[mode] || labels.system}。点击切换主题。`;
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
  function initApiSettings() {
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
        const newSeed = Math.floor(Math.random() * 1000000) + 1;
        inputSeed.value = newSeed;
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        state.settings.redoMode = inputRedoMode ? !!inputRedoMode.checked : false;
        localStorage.setItem('oop_redo_mode', state.settings.redoMode ? '1' : '0');

        const shuffleChecked = inputShuffleMode ? !!inputShuffleMode.checked : false;
        const enteredSeed = inputSeed ? parseInt(inputSeed.value, 10) : 0;
        const shuffleChanged = (state.settings.shuffle !== shuffleChecked) || (state.settings.seed !== enteredSeed);

        state.settings.shuffle = shuffleChecked;
        if (shuffleChecked) {
          state.settings.seed = enteredSeed || Math.floor(Math.random() * 1000000) + 1;
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
  // C++ Tokenizer & Markdown 渲染引擎 (Block-Based Parser)
  // ============================================================
  window.copyToClipboard = function (btn) {
    const pre = btn.nextElementSibling;
    const codeText = pre.textContent;
    navigator.clipboard.writeText(codeText).then(() => {
      btn.textContent = '已复制！';
      btn.style.color = 'var(--accent-success)';
      setTimeout(() => {
        btn.textContent = '复制';
        btn.style.color = '';
      }, 2000);
    }).catch(() => {
      btn.textContent = '复制失败';
    });
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

    // 1. 规范化换行符，处理 Windows \r\n 平台差异
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. 保护代码块，提取出来免受其他块的格式化污染
    const codeBlocks = [];
    normalized = normalized.replace(/```([a-zA-Z0-9+#-]*)[ \t]*\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const id = `__CODE_BLOCK_PH_${codeBlocks.length}__`;
      codeBlocks.push({ lang: lang || 'cpp', code: code });
      return `\n\n${id}\n\n`;
    });

    // 行内基本元素转义与格式化
    function formatInline(txt) {
      if (!txt) return '';
      let t = escapeHtml(txt);
      // 粗体 **text**
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // 行内代码 `code`
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      // 链接 [text](url)
      t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
      return t;
    }

    const lines = normalized.split('\n');
    const blocks = [];
    let activeBlock = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 处理空行
      if (trimmed === '') {
        if (activeBlock) {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        continue;
      }

      // 处理代码块占位符
      if (trimmed.startsWith('__CODE_BLOCK_PH_') && trimmed.endsWith('__')) {
        if (activeBlock) {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        blocks.push({ type: 'code_placeholder', content: trimmed });
        continue;
      }

      // 处理水平分割线
      if (trimmed === '---' || trimmed === '***') {
        if (activeBlock) {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        blocks.push({ type: 'hr' });
        continue;
      }

      // 处理标题
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        if (activeBlock) {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        blocks.push({ type: 'header', level: headerMatch[1].length, content: headerMatch[2] });
        continue;
      }

      // 处理引用
      if (line.startsWith('>') || trimmed.startsWith('>')) {
        if (activeBlock && activeBlock.type !== 'blockquote') {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        if (!activeBlock) {
          activeBlock = { type: 'blockquote', lines: [] };
        }
        activeBlock.lines.push(line.replace(/^\s*>\s?/, ''));
        continue;
      }

      // 处理表格
      if (trimmed.startsWith('|')) {
        if (activeBlock && activeBlock.type !== 'table') {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        if (!activeBlock) {
          activeBlock = { type: 'table', lines: [] };
        }
        activeBlock.lines.push(trimmed);
        continue;
      }

      // 处理无序列表
      const ulMatch = line.match(/^(\s*)([-\*\+])\s+(.*)$/);
      if (ulMatch) {
        if (activeBlock && activeBlock.type !== 'ul') {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        if (!activeBlock) {
          activeBlock = { type: 'ul', items: [] };
        }
        activeBlock.items.push({ indent: ulMatch[1].length, content: ulMatch[3] });
        continue;
      }

      // 处理有序列表
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (olMatch) {
        if (activeBlock && activeBlock.type !== 'ol') {
          blocks.push(activeBlock);
          activeBlock = null;
        }
        if (!activeBlock) {
          activeBlock = { type: 'ol', items: [] };
        }
        activeBlock.items.push({ indent: olMatch[1].length, content: olMatch[3] });
        continue;
      }

      // 默认：段落
      if (activeBlock && activeBlock.type !== 'p') {
        blocks.push(activeBlock);
        activeBlock = null;
      }
      if (!activeBlock) {
        activeBlock = { type: 'p', lines: [] };
      }
      activeBlock.lines.push(line);
    }

    if (activeBlock) {
      blocks.push(activeBlock);
    }

    const formattedBlocks = [];

    blocks.forEach(block => {
      if (block.type === 'code_placeholder') {
        formattedBlocks.push(block.content);
      } else if (block.type === 'hr') {
        formattedBlocks.push('<hr>');
      } else if (block.type === 'header') {
        const tag = `h${block.level}`;
        formattedBlocks.push(`<${tag}>${formatInline(block.content)}</${tag}>`);
      } else if (block.type === 'blockquote') {
        const content = block.lines.map(l => formatInline(l)).join('<br>');
        formattedBlocks.push(`<blockquote>${content}</blockquote>`);
      } else if (block.type === 'table') {
        let tableHtml = '<table>';
        let hasHeader = false;
        let bodyOpen = false;

        block.lines.forEach(line => {
          const cells = line.split('|').slice(1, -1).map(c => c.trim());
          if (cells.every(c => /^:-*|-*:|:-*:|-+$/.test(c))) {
            return;
          }
          if (!hasHeader) {
            tableHtml += '<thead><tr>' + cells.map(c => `<th>${formatInline(c)}</th>`).join('') + '</tr></thead>';
            hasHeader = true;
          } else {
            if (!bodyOpen) {
              tableHtml += '<tbody>';
              bodyOpen = true;
            }
            tableHtml += '<tr>' + cells.map(c => `<td>${formatInline(c)}</td>`).join('') + '</tr>';
          }
        });
        if (bodyOpen) tableHtml += '</tbody>';
        tableHtml += '</table>';
        formattedBlocks.push(tableHtml);
      } else if (block.type === 'ul' || block.type === 'ol') {
        const tag = block.type === 'ul' ? 'ul' : 'ol';
        let listHtml = '';
        let currentIndent = 0;
        const listStack = [];

        block.items.forEach((item, idx) => {
          if (idx === 0) {
            listHtml += `<${tag}>`;
            listStack.push(tag);
          } else {
            if (item.indent > currentIndent) {
              listHtml += `<${tag}>`;
              listStack.push(tag);
            } else if (item.indent < currentIndent) {
              while (listStack.length > 1 && item.indent < currentIndent) {
                const top = listStack.pop();
                listHtml += `</${top}>`;
                currentIndent -= 2;
              }
            }
          }
          listHtml += `<li>${formatInline(item.content)}</li>`;
          currentIndent = item.indent;
        });

        while (listStack.length > 0) {
          const top = listStack.pop();
          listHtml += `</${top}>`;
        }
        formattedBlocks.push(listHtml);
      } else if (block.type === 'p') {
        const content = block.lines.map(l => formatInline(l)).join('<br>');
        formattedBlocks.push(`<p>${content}</p>`);
      }
    });

    let finalHtml = formattedBlocks.join('\n');

    // 4. 还原受保护的代码块并进行语法高亮
    codeBlocks.forEach((codeBlock, idx) => {
      const codeHtml = (codeBlock.lang === 'cpp' || codeBlock.lang === 'c++')
        ? highlightCpp(codeBlock.code)
        : escapeHtml(codeBlock.code);
      const replacement = `
        <div class="code-block-wrapper">
          <button class="copy-code-btn" onclick="window.copyToClipboard(this)">复制</button>
          <pre><code class="language-${codeBlock.lang}">${codeHtml}</code></pre>
        </div>
      `;
      finalHtml = finalHtml.replace(`__CODE_BLOCK_PH_${idx}__`, replacement);
    });

    return finalHtml;
  }

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



      updateBackToTopVisibility();
    }

    window._goToPage = setActivePage;

    // 导航切换
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => setActivePage(tab.dataset.page));
    });

    // 类型筛选
    document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#type-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentType = btn.dataset.type;
        filterAndRender();
      });
    });

    // 刷题模式筛选 (列表/焦点)
    document.querySelectorAll('#mode-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#mode-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.quizMode = btn.dataset.mode;
        state.focusIndex = 0;
        renderQuestionList();
        updateBackToTopVisibility();
      });
    });

    // 状态筛选
    document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
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
      state.currentChapter = chapterSelect.value;
      filterAndRender();
    });

    // 知识点筛选
    const knowledgeSelect = document.getElementById('knowledge-filter');
    if (knowledgeSelect) {
      renderKnowledgeFilterOptions();
      knowledgeSelect.addEventListener('change', () => {
        state.selectedKnowledgePoint = knowledgeSelect.value;
        filterAndRender();
      });
    }

    const todayReviewBtn = document.getElementById('today-review');
    if (todayReviewBtn) {
      todayReviewBtn.addEventListener('click', () => window.startTodayReview());
    }

    // 搜索
    let searchTimer;
    document.getElementById('search-input').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        filterAndRender();
      }, 300);
    });

    // 知识点搜索（带 debounce）
    let knowledgeSearchTimer;
    document.getElementById('knowledge-search').addEventListener('input', (e) => {
      clearTimeout(knowledgeSearchTimer);
      knowledgeSearchTimer = setTimeout(() => {
        const query = e.target.value.trim().toLowerCase();
        renderKnowledge(query);
      }, 300);
    });

    // AI 导师键盘与发送绑定
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage();
        }
      });
    }

    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', sendChatMessage);
    }

    // 监听全局键盘事件用于焦点模式左右按键刷题
    document.addEventListener('keydown', (e) => {
      if (state.quizMode === 'focus') {
        const activeEl = document.activeElement;
        // 如果用户正在搜索输入框或AI聊天框中输入，不触发切换快捷键
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        if (!isInput) {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            window._prevFocusQuestion();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            window._nextFocusQuestion();
          }
        }
      }
    });

    // 回到顶部按钮
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
  }

  // updateBackToTopVisibility: single definition below (around line 2063)

  // ============================================================
  // 筛选与渲染
  // ============================================================
  function filterAndRender() {
    let items = state.allItems;

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
      items = items.filter(q => {
        const text = (q.stem || '') + (q.title || '') + (q.requirement || '') +
          (q.options ? q.options.join(' ') : '') + (q.chapter || '') +
          ' ' + getKnowledgePointsForItem(q).join(' ');
        return text.toLowerCase().includes(state.searchQuery);
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
    state.focusIndex = 0; // 筛选改变时重置焦点到第一题
    listPageCount = 1; // 重置分页
    renderQuestionList();
    updateBackToTopVisibility();
  }

  const PAGE_SIZE = 30;
  let listPageCount = 1;

  function renderQuestionList() {
    const container = document.getElementById('question-list');
    const navContainer = document.getElementById('focus-navigation');

    if (state.filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>没有匹配的题目</p></div>';
      navContainer.style.display = 'none';
      return;
    }

    if (state.quizMode === 'list') {
      navContainer.style.display = 'none';
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
      container.innerHTML = renderQuestionCard(q, state.focusIndex + 1);

      // 渲染底部分页控制
      navContainer.innerHTML = `
        <button class="filter-btn" onclick="window._prevFocusQuestion()">← 上一题</button>
        <span class="focus-index-info">第 ${state.focusIndex + 1} / ${state.filtered.length} 题<br><span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">← → 箭头键切换</span></span>
        <button class="filter-btn" onclick="window._nextFocusQuestion()">下一题 →</button>
      `;

      // 切换焦点模式时滚动到题目区域
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateBackToTopVisibility();
  }

  window._loadMoreQuestions = function () {
    listPageCount++;
    renderQuestionList();
  };

  function renderQuestionCard(q, displayIndex) {
    const isProgramming = q.type === 'programming';
    const typeLabel = { choice: '选择题', truefalse: '判断题', fillin: '填空题', programming: '程序题' };
    const typeBadge = { choice: 'badge-choice', truefalse: 'badge-truefalse', fillin: 'badge-fillin', programming: 'badge-programming' };
    const status = getQuestionStatus(getProgressKeyForItem(q));
    const uniqueId = isProgramming ? `prog-${q.id}` : `q-${q.id}`;
    const safeUniqueId = escapeAttr(uniqueId);

    let html = `<div class="question-card" data-type="${q.type}" data-id="${safeUniqueId}">`;

    // 头部
    html += `<div class="question-header">`;
    html += `<div class="question-meta">`;
    const displayNum = displayIndex != null ? displayIndex : q.id;
    html += `<span class="question-number" title="原始题号: ${escapeHtml(q.id)}">${isProgramming ? '程序' : ''}第 ${escapeHtml(String(displayNum))} 题</span>`;
    html += `<span class="badge ${typeBadge[q.type]}">${escapeHtml(typeLabel[q.type] || q.type)}</span>`;
    if (q.chapter) html += `<span class="badge badge-chapter">${escapeHtml(q.chapter)}</span>`;
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
    if (isProgramming) {
      html += `<div class="question-stem" style="font-weight:600;">${escapeHtml(q.title || '')}</div>`;
      html += `<div class="question-stem" style="font-size:0.88rem;color:var(--text-secondary);">${escapeHtml(q.requirement || '').replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}</div>`;
      html += `
        <div class="programming-input-wrapper">
          <textarea class="programming-input" id="prog-input-${safeUniqueId}" placeholder="粘贴你的 C++ 实现，用提示词检查思路与边界..."></textarea>
          <button class="show-answer-btn grade-btn" style="margin-top: 8px; border-color: var(--accent-warning); color: var(--accent-warning);" onclick="window._gradeProgrammingAnswer('${safeUniqueId}')">检查代码</button>
        </div>
        <div class="programming-grading-result" id="grading-${safeUniqueId}" style="display: none;"></div>
      `;
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
    const kps = getKnowledgePointsForItem(q);
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
    html += `<div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">`;
    html += `<button class="show-answer-btn" id="toggle-answer-btn-${safeUniqueId}" onclick="window._toggleAnswer('${safeUniqueId}')">`;
    html += `📖 ${isProgramming ? '查看参考代码' : '显示答案'}</button>`;
    html += `<button class="show-answer-btn" id="ai-toggle-btn-${safeUniqueId}" style="border-color: var(--accent-primary); color: var(--accent-primary); background: var(--accent-primary-glow);" onclick="window._runAiAnalysis('${safeUniqueId}')">`;
    html += `🧾 获取讲解提示词</button>`;
    html += `</div>`;

    // 选择/判断题：就地反馈（与填空题风格一致）
    if (!isProgramming && (q.type === 'choice' || q.type === 'truefalse')) {
      html += `<div class="fillin-feedback" id="feedback-${safeUniqueId}" style="display: none;"></div>`;
    }

    // AI 对话渲染区
    html += `<div class="ai-analysis-wrapper" id="ai-analysis-${safeUniqueId}" data-loaded="0" style="display: none; width: 100%;"></div>`;

    // 答案区域
    html += `<div class="answer-section" id="answer-${safeUniqueId}">`;
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
      html += `<div class="answer-text">${escapeHtml(q.answer || '待核对')}</div>`;
      if (q.explanation) {
        html += `<div class="explanation">${parseMarkdown(q.explanation)}</div>`;
      }
    }

    html += `</div></div></div>`;
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
    renderQuestionList();
  };

  window._nextFocusQuestion = function () {
    if (state.filtered.length === 0) return;
    state.focusIndex = (state.focusIndex + 1) % state.filtered.length;
    renderQuestionList();
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

  window._toggleAnswer = function (id) {
    const el = document.getElementById('answer-' + id);
    if (el) el.classList.toggle('visible');
    const btn = document.getElementById('toggle-answer-btn-' + id);
    if (btn) {
      const isVisible = el && el.classList.contains('visible');
      const isProg = String(id).startsWith('prog-');
      btn.textContent = isVisible ? `🙈 ${isProg ? '隐藏参考代码' : '隐藏答案'}` : `📖 ${isProg ? '查看参考代码' : '显示答案'}`;
    }
  };

  window._showAnswer = function (id) {
    const el = document.getElementById('answer-' + id);
    if (el) el.classList.add('visible');
  };

  function normalizeChoiceAnswer(answer) {
    const match = String(answer || '').toUpperCase().match(/[A-D]/);
    return match ? match[0] : String(answer || '').trim().toUpperCase();
  }

  function normalizeTrueFalseAnswer(answer) {
    const raw = String(answer || '').trim().toLowerCase();
    if (['true', 't', 'yes', 'y', '正确', '对', '√', '✓'].includes(raw)) return '对';
    if (['false', 'f', 'no', 'n', '错误', '错', '×', '✗'].includes(raw)) return '错';
    return String(answer || '').trim();
  }

  window._selectOption = function (uniqueId, selectedLetter, element) {
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    if (uniqueId.startsWith('prog-')) return;

    // 防止重复作答
    const card = findQuestionCard(uniqueId);
    if (card && card.querySelector('.option-item.correct, .option-item.incorrect')) return;

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

    if (isCorrect) {
      if (!state.settings.redoMode) element.classList.add('correct');
      window._setStatus(uniqueId, 'mastered', { toggle: false });
      recordAttempt(`q_${realId}`, 'correct');
      updateSrs(`q_${realId}`, true);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback correct';
        feedbackEl.innerHTML = '🎉 恭喜你，回答正确！';
      }
    } else {
      if (!state.settings.redoMode) element.classList.add('incorrect');
      window._setStatus(uniqueId, 'wrong', { toggle: false });
      recordAttempt(`q_${realId}`, 'wrong');
      updateSrs(`q_${realId}`, false);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback incorrect';
        feedbackEl.innerHTML = '❌ 回答错误！';
      }
    }

    if (!state.settings.redoMode) {
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
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    if (uniqueId.startsWith('prog-')) return;

    // 防止重复作答
    const card = findQuestionCard(uniqueId);
    if (card && card.querySelector('.option-item.correct, .option-item.incorrect')) return;

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

    if (isCorrect) {
      if (!state.settings.redoMode) element.classList.add('correct');
      window._setStatus(uniqueId, 'mastered', { toggle: false });
      recordAttempt(`q_${realId}`, 'correct');
      updateSrs(`q_${realId}`, true);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback correct';
        feedbackEl.innerHTML = '🎉 恭喜你，回答正确！';
      }
    } else {
      if (!state.settings.redoMode) element.classList.add('incorrect');
      window._setStatus(uniqueId, 'wrong', { toggle: false });
      recordAttempt(`q_${realId}`, 'wrong');
      updateSrs(`q_${realId}`, false);
      if (feedbackEl) {
        feedbackEl.style.display = 'inline-block';
        feedbackEl.className = 'fillin-feedback incorrect';
        feedbackEl.innerHTML = '❌ 回答错误！';
      }
    }

    if (!state.settings.redoMode) {
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
    setQuestionStatus(key, status, options);
  };

  window._checkFillinAnswer = function (uniqueId, inputEl) {
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const q = state.questions.find(item => String(item.id) === realId);
    if (!q) return;

    const userAns = inputEl.value.trim().toLowerCase();
    const correctAnsStr = (q.answer || '').trim().toLowerCase();
    const feedbackEl = document.getElementById('feedback-' + uniqueId);

    if (!userAns) {
      feedbackEl.style.display = 'inline-block';
      feedbackEl.className = 'fillin-feedback incorrect';
      feedbackEl.innerHTML = '⚠️ 请先输入您的答案！';
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
      feedbackEl.className = 'fillin-feedback correct';
      feedbackEl.innerHTML = '🎉 恭喜你，回答正确！';
      window._setStatus(uniqueId, 'mastered', { toggle: false });
      recordAttempt(`q_${realId}`, 'correct');
      updateSrs(`q_${realId}`, true);
    } else {
      feedbackEl.className = 'fillin-feedback incorrect';
      feedbackEl.innerHTML = `❌ 回答错误！您的答案与参考答案不匹配。建议点击“显示答案”比对。`;
      window._setStatus(uniqueId, 'wrong', { toggle: false });
      recordAttempt(`q_${realId}`, 'wrong');
      updateSrs(`q_${realId}`, false);
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
    if (state.favorites[idKey]) delete state.favorites[idKey];
    else state.favorites[idKey] = true;
    saveJsonToStorage(FAVORITES_KEY, state.favorites);
    renderQuestionList();
    showToast(state.favorites[idKey] ? '已收藏' : '已取消收藏', 'info');
  };

  window._gradeProgrammingAnswer = async function (uniqueId) {
    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const q = state.programming.find(item => String(item.id) === realId);
    if (!q) return;

    const textarea = document.getElementById('prog-input-' + uniqueId);
    const userCode = textarea.value.trim();
    const gradingEl = document.getElementById('grading-' + uniqueId);

    if (!userCode) {
      alert('请先贴入您的 C++ 代码！');
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

    const promptToCopy = `${systemPrompt}\n\n${userPrompt}`;
    await copyPromptAndNotify(promptToCopy);
    gradingEl.style.display = 'block';
    gradingEl.innerHTML = `
      <div style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.7;">
        🧾 判题/审查提示词已复制到剪贴板。<br>
        请粘贴到你偏好的网页版大模型进行“评审打分”。
      </div>
    `;
  };

  window._runAiAnalysis = async function (uniqueId) {
    const container = document.getElementById(`ai-analysis-${uniqueId}`);
    if (!container) return;

    const btn = document.getElementById(`ai-toggle-btn-${uniqueId}`);
    const isVisible = container.style.display !== 'none';

    if (isVisible) {
      container.style.display = 'none';
      if (btn) btn.textContent = '🧾 获取讲解提示词';
      return;
    }

    container.style.display = 'block';
    if (btn) btn.textContent = '收起提示词';

    const realId = uniqueId.replace(/^(q-|prog-)/, '');
    const isProg = uniqueId.startsWith('prog-');
    let promptContent = '';

    if (isProg) {
      const q = state.programming.find(item => String(item.id) === realId);
      promptContent = `请分析下面这道 C++ 程序设计复习题：\n题目：${q.title}\n功能要求：${q.requirement}\n参考代码实现：\n\`\`\`cpp\n${q.answerCode}\n\`\`\`\n核心知识点：${q.keyPoints.join(', ')}`;
    } else {
      const q = state.questions.find(item => String(item.id) === realId);
      promptContent = `请分析下面这道 C++ 客观题：\n题型：${q.type === 'choice' ? '选择题' : q.type === 'truefalse' ? '判断题' : '填空题'}\n题目章节：${q.chapter}\n题干：${q.stem}\n${q.options ? '选项：\n' + q.options.join('\n') : ''}\n正确答案：${q.answer}\n原版答案解析：${q.explanation || '无'}`;
    }

    const systemPrompt = "你是一位精通 C++ 面向对象程序设计（OOP）的老师。请为学生提供深入浅出的解题步骤思路、该题关联的 C++ 核心机制解析（例如为什么不能写成某种错误的语法）、以及相关的核心代码小范例（如果有）。请使用 Markdown 语法排版，逻辑清晰，中文作答，保证 self-contained 完备性。";

    const promptToCopy = `${systemPrompt}\n\n${promptContent}`;
    await copyPromptAndNotify(promptToCopy);

    container.innerHTML = `
      <div class="ai-analysis-container">
        <div class="ai-analysis-header">
          <span id="ai-title-${uniqueId}">🧾 讲解提示词已复制到剪贴板</span>
        </div>
        <div class="ai-analysis-box" id="ai-box-${uniqueId}">
          <div style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.7;">
            讲解提示词已复制到剪贴板。<br>
            如果你想获取其他大模型的解释，可以打开网页端 AI 并直接粘贴发送。
          </div>
        </div>
      </div>
    `;

    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  async function copyPromptAndNotify(text) {
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
      showToast('提示词已复制到剪贴板', 'success');
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
    const items = (state.attempts || []).slice(0, 20);
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

    state.currentType = 'all';
    state.currentChapter = 'all';
    state.currentStatus = null;
    state.searchQuery = '';
    state.selectedKnowledgePoint = 'all';
    state.favoritesOnly = false;
    state.quizMode = 'focus';

    document.querySelectorAll('#type-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));
    document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#mode-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'focus'));
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

  window.clearChat = function() {
    if (confirm('确定要清空问答历史记录吗？')) {
      state.chatHistory = [
        { role: 'assistant', content: '对话已重置。你好，这里可以帮你整理 C++ OOP 概念、题目思路和代码问题。' }
      ];
      const container = document.getElementById('chat-messages');
      container.innerHTML = `
        <div class="message ai">
          <div class="avatar">🤖</div>
          <div class="message-content">
            对话已重置。你好，这里可以帮你整理 C++ OOP 概念、题目思路和代码问题。
          </div>
        </div>
      `;
    }
  };

  // ============================================================
  // 统计
  // ============================================================
  function renderStats() {
    const counts = { choice: 0, truefalse: 0, fillin: 0, programming: 0 };
    state.allItems.forEach(q => { if (counts[q.type] !== undefined) counts[q.type]++; });

    document.getElementById('stat-choice').textContent = counts.choice;
    document.getElementById('stat-truefalse').textContent = counts.truefalse;
    document.getElementById('stat-fillin').textContent = counts.fillin;
    document.getElementById('stat-programming').textContent = counts.programming;

    // 进度统计
    const progress = { mastered: 0, review: 0, wrong: 0 };
    Object.values(state.userProgress).forEach(s => { if (progress[s] !== undefined) progress[s]++; });

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
      const attempts = (state.attempts || []).slice(0, 20);
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
      container.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>知识点数据加载中…</p></div>';
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
    const progress = { mastered: 0, review: 0, wrong: 0 };
    Object.values(state.userProgress).forEach(s => { if (progress[s] !== undefined) progress[s]++; });

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
        ? `优先完成 ${dueCount} 道到期复习题，防止遗忘曲线回落。`
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

    chapterContainer.innerHTML = Object.entries(chapterStats).map(([ch, s]) => {
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
      settings: Object.assign({}, state.settings || {}, { apiKey: undefined })
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
        if (data.settings && typeof data.settings === 'object') {
          // 不导入 apiKey
          const s = Object.assign({}, data.settings);
          delete s.apiKey;
          state.settings = Object.assign(state.settings, s);
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
    const due = [];
    Object.entries(state.questionStats || {}).forEach(([k, s]) => {
      if (s && typeof s.nextReviewTs === 'number' && s.nextReviewTs <= now) due.push(k);
    });
    // 兜底：错题 / 待复习
    Object.entries(state.userProgress || {}).forEach(([k, v]) => {
      if ((v === 'wrong' || v === 'review') && !due.includes(k)) due.push(k);
    });
    return due.slice(0, 80);
  }

  function updateTodayReviewButton() {
    const btn = document.getElementById('today-review');
    if (!btn) return;
    const dueCount = getTodayReviewKeys().length;
    btn.disabled = dueCount === 0;
    btn.textContent = dueCount === 0 ? '🗓️ 待复习（0）' : `🗓️ 待复习（${dueCount}）`;
  }

  window.startTodayReview = function () {
    const keys = getTodayReviewKeys();
    if (!keys.length) {
      showToast('当前暂无需要复习的题目', 'info');
      updateTodayReviewButton();
      return;
    }
    const set = new Set(keys);
    state.filtered = state.allItems.filter(q => {
      const key = q.type === 'programming' ? `prog_${q.id}` : `q_${q.id}`;
      return set.has(key);
    });
    state.quizMode = 'focus';
    state.focusIndex = 0;
    document.querySelectorAll('#mode-filters .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'focus'));
    window._goToPage('quiz');
    renderQuestionList();
    showToast(`待复习：${state.filtered.length} 题`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
