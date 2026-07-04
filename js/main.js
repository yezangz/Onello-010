    (function () {
      'use strict';

      /* ===== 通用选择器工具 ===== */
      const $ = (sel, ctx) => (ctx || document).querySelector(sel);
      const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

      /* ===== 1. 导航平滑滚动 ===== */
      function initNav() {
        $$('.nav-btn, .nav-logo').forEach((btn) => {
          btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const target = document.getElementById(targetId);
            if (target) {
              // 如果当前在项目详情页，先关闭详情页
              closeAllProjectDetails();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });
      }

      /* ===== 2. 首页矢量花瓣飘落 ===== */
      function initPetalFall() {
        const graphic = $('#digitalGraphic');
        const layer = $('#petalLayer');
        if (!graphic || !layer) return;

        function createPetal() {
          const petal = document.createElement('img');
          petal.src = 'assets/images/screenshot_196_316.png';
          petal.alt = '飘落花瓣';
          petal.className = 'petal';
          petal.draggable = false;
          petal.style.objectFit = 'contain';

          // 随机尺寸 12~32px
          const size = 12 + Math.random() * 20;
          // 随机水平起点
          const startX = Math.random() * 1880 + 20;
          // 随机下落时长 5~12s
          const duration = 5 + Math.random() * 7;
          // 左右摇摆幅度 ±150px
          const swayA = (Math.random() - 0.5) * 300;
          const swayB = (Math.random() - 0.5) * 300;
          // 随机持续旋转 0~360°（正负方向）
          const rotate = Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1);

          petal.style.left = startX + 'px';
          petal.style.setProperty('--petal-size', size + 'px');
          petal.style.setProperty('--sway-a', swayA + 'px');
          petal.style.setProperty('--sway-b', swayB + 'px');
          petal.style.setProperty('--petal-rotate', rotate + 'deg');
          // 循环持续飘落，落地透明度逐步衰减至 0，不会瞬间消失
          petal.style.animation = 'petalFall ' + duration + 's linear infinite';

          layer.appendChild(petal);
        }

        // 点击数字图形触发回弹 + 35 片花瓣持续飘落
        graphic.addEventListener('click', () => {
          // 回弹动画：scale 1 -> 1.15 -> 1，0.4s ease-out
          if (!graphic.classList.contains('bouncing')) {
            graphic.classList.add('bouncing');
            graphic.addEventListener('animationend', () => {
              graphic.classList.remove('bouncing');
            }, { once: true });
          }

          for (let i = 0; i < 35; i++) {
            createPetal();
          }
        });

        // 页面加载后自动飘落少量花瓣作为氛围
        setTimeout(() => {
          for (let i = 0; i < 8; i++) {
            setTimeout(createPetal, i * 200);
          }
        }, 1200);
      }

      /* ===== 2.5 首页图标导航：点击平滑滚动到对应区块 ===== */
      function initHomeNavigation() {
        const targets = $$('[data-home-target]');
        if (!targets.length) return;

        const targetMap = {
          home: 'home',
          about: 'about',
          catalog: 'project',
          garden: 'garden',
          contact: 'contact'
        };

        targets.forEach((el) => {
          el.addEventListener('click', () => {
            // 触发回弹动画
            el.classList.remove('bouncing');
            void el.offsetWidth;
            el.classList.add('bouncing');
            setTimeout(() => el.classList.remove('bouncing'), 400);

            const target = el.dataset.homeTarget;
            const sectionId = targetMap[target];
            if (sectionId) {
              closeAllProjectDetails();
              const section = document.getElementById(sectionId);
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          });
        });
      }

      /* ===== 3. IntersectionObserver 滚动动画（Project 文件夹、Garden 入场） ===== */
      function initScrollAnimations() {
        const folders = $$('.folder');
        const garden = $('#garden');

        // Project 文件夹滚动监听
        const folderObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const idx = folders.indexOf(el);
            setTimeout(() => el.classList.add('in-view'), idx * 120);
            folderObserver.unobserve(el);
          });
        }, { threshold: 0.45, rootMargin: '0px 0px -80px 0px' });

        folders.forEach((f) => folderObserver.observe(f));

        // Garden 区块滚动监听：进入视口时一次性触发入场动画
        // 使用较小 threshold，确保在 1920px 画布内及各种预览窗口都能触发
        if (garden) {
          const gardenObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              garden.classList.add('in-view');
              generateGardenMosaic();
              gardenObserver.unobserve(garden);
            });
          }, { threshold: 0.05 });
          gardenObserver.observe(garden);
        }

        // 生成时间轴马赛克遮罩块（8x16 网格，按行从上至下延迟消失）
        function generateGardenMosaic() {
          const mosaic = $('#gardenTimelineMosaic');
          if (!mosaic || mosaic.children.length) return;
          const rows = 16;
          const cols = 8;
          const fragment = document.createDocumentFragment();
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const tile = document.createElement('div');
              tile.className = 'mosaic-tile';
              tile.style.setProperty('--row', r);
              fragment.appendChild(tile);
            }
          }
          mosaic.appendChild(fragment);
        }

        // 打开的目录区块滚动监听：进入视口时触发文件夹掉落与标题涂鸦动画
        const portfolioOpen = $('#portfolioOpen');
        if (portfolioOpen && typeof IntersectionObserver !== 'undefined') {
          const portfolioOpenObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              portfolioOpen.classList.add('in-view');
              portfolioOpenObserver.unobserve(portfolioOpen);
            });
          }, { threshold: 0.05 });
          portfolioOpenObserver.observe(portfolioOpen);
        }

        // Project 作品集区块滚动监听：进入视口时触发目录从底部向上滑入
        const project = $('#project');
        if (project && typeof IntersectionObserver !== 'undefined') {
          const projectObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              project.classList.add('in-view');
              projectObserver.unobserve(project);
            });
          }, { threshold: 0.15 });
          projectObserver.observe(project);
        }

      }

      /* ===== 3.5 About 纸条：可拖拽 + 点击回弹动画 ===== */
      function initAboutNotesDrag() {
        const section = $('.screen-about');
        if (!section) return;

        const notes = $$('.about-note', section);
        if (!notes.length) return;

        let maxZ = 10;
        const sectionW = 1920;
        const sectionH = 1080;

        notes.forEach((note) => {
          // 读取当前位移，首次为 0
          let currentTx = parseFloat(note.dataset.tx || 0);
          let currentTy = parseFloat(note.dataset.ty || 0);

          function onPointerDown(e) {
            e.preventDefault();

            // 点击/拖拽开始触发回弹动画
            note.classList.remove('bouncing');
            void note.offsetWidth; // 强制重排，确保动画可重复触发
            note.classList.add('bouncing');
            setTimeout(() => note.classList.remove('bouncing'), 400);

            // 当前元素置顶
            maxZ += 1;
            note.style.zIndex = maxZ;

            const startX = e.clientX;
            const startY = e.clientY;
            const startTx = currentTx;
            const startTy = currentTy;

            function onPointerMove(ev) {
              const dx = ev.clientX - startX;
              const dy = ev.clientY - startY;
              let tx = startTx + dx;
              let ty = startTy + dy;

              const baseLeft = parseFloat(note.style.left || 0);
              const baseTop = parseFloat(note.style.top || 0);
              const w = note.offsetWidth;
              const h = note.offsetHeight;

              // 限制在 1920×1080 画布内
              tx = Math.max(-baseLeft, Math.min(sectionW - baseLeft - w, tx));
              ty = Math.max(-baseTop, Math.min(sectionH - baseTop - h, ty));

              currentTx = tx;
              currentTy = ty;
              note.dataset.tx = tx.toFixed(2);
              note.dataset.ty = ty.toFixed(2);
              note.style.transform = `translate(${tx}px, ${ty}px)`;
            }

            function onPointerUp() {
              window.removeEventListener('pointermove', onPointerMove);
              window.removeEventListener('pointerup', onPointerUp);
            }

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
          }

          note.addEventListener('pointerdown', onPointerDown);
        });
      }

      /* ===== 4. Project 目录 → 打开的目录本 → 详情页 ===== */
      function initFolderFlip() {
        const catalog = $('#projectCatalog');
        const openBook = $('#projectOpenBook');
        if (!catalog || !openBook) return;

        let currentDetailId = null;
        let isFlipping = false;

        // 4 个目录选项：鼠标悬停镜头跟随，点击带书本左右翻页后跳转详情页
        $$('.catalog-option', catalog).forEach((option, index) => {
          // 鼠标移动时计算相对位置，产生镜头跟随倾斜与位移
          option.addEventListener('mousemove', (e) => {
            if (option.classList.contains('flipping-left') || option.classList.contains('flipping-right')) return;
            const rect = option.getBoundingClientRect();
            const mx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const my = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            option.style.transform = `translate(${mx * 12}px, ${my * 12}px) rotate(0deg) rotateX(${-my * 8}deg) rotateY(${mx * 8}deg) scale(1.04)`;
          });

          // 鼠标移出后复位
          option.addEventListener('mouseleave', () => {
            option.style.transform = '';
          });

          option.addEventListener('click', () => {
            const detailId = option.dataset.detail;
            // 01/02/03/04 跳转独立详情页
            const detailPages = {
              'project-game': 'pages/project-game.html',
              'project-cultural': 'pages/project-cultural.html',
              'project-brand': 'pages/project-brand.html',
              'project-book': 'pages/project-book.html'
            };
            if (detailPages[detailId]) {
              window.location.href = detailPages[detailId];
              return;
            }

            if (isFlipping) return;
            const detail = detailId ? document.getElementById(detailId) : null;
            if (!detail) return;

            isFlipping = true;
            currentDetailId = detailId;
            option.style.transform = '';

            // 奇数项向左翻，偶数项向右翻
            const flipClass = (index % 2 === 0) ? 'flipping-left' : 'flipping-right';
            option.classList.add(flipClass);

            // 翻页动画中途打开详情页（翻页弹出）
            setTimeout(() => {
              openProjectDetail(detail);
            }, 320);

            // 动画结束后清理
            setTimeout(() => {
              option.classList.remove(flipClass);
              isFlipping = false;
            }, 620);
          });
        });

        // 点击打开的目录本跳转对应详情页（若点击的是刚拖拽过的掉落图片则不跳转）
        openBook.addEventListener('click', (e) => {
          if (e.target.classList.contains('open-book-img') && e.target.dataset.dragged === 'true') {
            e.target.dataset.dragged = 'false';
            return;
          }
          const detail = currentDetailId ? document.getElementById(currentDetailId) : null;
          if (detail) openProjectDetail(detail);
        });

        // 掉落图片可拖拽
        initOpenBookDragImages();
      }

      // 打开的目录本内掉落图片拖拽
      function initOpenBookDragImages() {
        const container = $('#projectOpenBook');
        if (!container) return;
        const images = $$('.open-book-img', container);
        if (!images.length) return;

        let maxZ = 10;

        images.forEach((img) => {
          let currentTx = parseFloat(img.dataset.tx || 0);
          let currentTy = parseFloat(img.dataset.ty || 0);
          let isDragging = false;
          let hasMoved = false;
          const rotate = img.dataset.rotate || '0deg';

          function onPointerDown(e) {
            e.preventDefault();

            // 当前图片置顶
            maxZ += 1;
            img.style.zIndex = maxZ;

            isDragging = true;
            hasMoved = false;
            const startX = e.clientX;
            const startY = e.clientY;
            const startTx = currentTx;
            const startTy = currentTy;

            function onPointerMove(ev) {
              if (!isDragging) return;
              const dx = ev.clientX - startX;
              const dy = ev.clientY - startY;
              if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
              currentTx = startTx + dx;
              currentTy = startTy + dy;
              img.style.transform = 'translate(' + currentTx + 'px, ' + currentTy + 'px) rotate(' + rotate + ')';
              img.dataset.tx = currentTx;
              img.dataset.ty = currentTy;
            }

            function onPointerUp() {
              isDragging = false;
              window.removeEventListener('pointermove', onPointerMove);
              window.removeEventListener('pointerup', onPointerUp);
              if (hasMoved) img.dataset.dragged = 'true';
            }

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            img.setPointerCapture(e.pointerId);
          }

          img.addEventListener('pointerdown', onPointerDown);
        });
      }

      /* ===== 4.5 打开的目录：三个掉落元素可拖拽 ===== */
      function initPortfolioOpenDrag() {
        const section = $('#portfolioOpen');
        if (!section) return;
        const items = $$('.folder-item', section);
        if (!items.length) return;

        let maxZ = 10;
        const sectionW = 1920;
        const sectionH = 1080;

        items.forEach((item) => {
          let currentTx = parseFloat(item.dataset.tx || 0);
          let currentTy = parseFloat(item.dataset.ty || 0);

          function onPointerDown(e) {
            e.preventDefault();

            // 当前元素置顶
            maxZ += 1;
            item.style.zIndex = maxZ;

            const startX = e.clientX;
            const startY = e.clientY;
            const startTx = currentTx;
            const startTy = currentTy;

            const rotate = item.style.getPropertyValue('--folder-rotate') || '0deg';
            const baseLeft = parseFloat(getComputedStyle(item).left || 0);
            const baseTop = parseFloat(getComputedStyle(item).top || 0);
            const w = item.offsetWidth;
            const h = item.offsetHeight;

            function onPointerMove(ev) {
              const dx = ev.clientX - startX;
              const dy = ev.clientY - startY;
              let tx = startTx + dx;
              let ty = startTy + dy;

              // 限制在 1920×1080 画布内
              tx = Math.max(-baseLeft, Math.min(sectionW - baseLeft - w, tx));
              ty = Math.max(-baseTop, Math.min(sectionH - baseTop - h, ty));

              currentTx = tx;
              currentTy = ty;
              item.dataset.tx = tx.toFixed(2);
              item.dataset.ty = ty.toFixed(2);
              item.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotate})`;
            }

            function onPointerUp() {
              window.removeEventListener('pointermove', onPointerMove);
              window.removeEventListener('pointerup', onPointerUp);
            }

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            item.setPointerCapture(e.pointerId);
          }

          item.addEventListener('pointerdown', onPointerDown);
        });
      }

      /* ===== 4.6 打开的目录：打字机文字效果 ===== */
      function initPortfolioTypewriter() {
        const section = $('#portfolioOpen');
        if (!section) return;
        const textEl = section.querySelector('.typewriter-text');
        const cursorEl = section.querySelector('.typewriter-cursor');
        if (!textEl) return;

        const fullText = '本作品收录个人全链路设计实践作品，涵盖品牌视觉、界面设计、插画创作与概念企划。\n从前期灵感构思、方案推演到落地视觉呈现，完整记录每一次创作思考与审美取舍。\n以设计为媒介，平衡创意表达与实际落地，持续探索视觉更多可能性。';

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer.disconnect();
              typeWriterText(textEl, cursorEl, fullText, 42);
            }
          });
        }, { threshold: 0.05 });

        observer.observe(section);
      }

      function typeWriterText(el, cursor, text, speed) {
        let i = 0;
        el.textContent = '';
        if (cursor) cursor.style.animation = 'none';

        function typeChar() {
          if (i < text.length) {
            el.textContent += text.charAt(i);
            i += 1;
            setTimeout(typeChar, speed);
          } else if (cursor) {
            cursor.style.animation = '';
          }
        }

        typeChar();
      }

      function openProjectDetail(detail) {
        // 关闭其他详情页
        $$('.project-detail').forEach((d) => {
          d.classList.remove('active', 'flip-pop');
          d.style.transition = '';
        });
        // 临时禁用 transition，避免与翻页弹出关键帧冲突
        detail.style.transition = 'none';
        detail.classList.add('active', 'flip-pop');
        // 翻页弹出动画结束后清理动画类，恢复 transition 以便关闭时过渡
        setTimeout(() => {
          detail.classList.remove('flip-pop');
          detail.style.transition = '';
        }, 660);
        // 滚动到页面顶部，模拟全屏独立页面
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // 隐藏全局导航栏与留言按钮，避免与详情页顶部栏重叠
        const nav = $('#navBar');
        const msgWrap = document.querySelector('.message-btn-wrap');
        if (nav) {
          nav.style.transition = 'opacity 0.3s ease';
          nav.style.opacity = '0';
          nav.style.pointerEvents = 'none';
        }
        if (msgWrap) {
          msgWrap.style.transition = 'opacity 0.3s ease';
          msgWrap.style.opacity = '0';
          msgWrap.style.pointerEvents = 'none';
        }
      }

      function closeAllProjectDetails() {
        $$('.project-detail').forEach((d) => d.classList.remove('active', 'flip-pop'));
        const grid = $('#folderGrid');
        if (grid) grid.classList.remove('has-open');
        $$('.folder').forEach((f) => f.classList.remove('open'));
        // 返回作品集时重置为目录首帧
        const catalog = $('#projectCatalog');
        const openBook = $('#projectOpenBook');
        if (catalog) catalog.classList.remove('hidden');
        if (openBook) openBook.classList.remove('active');
        // 清除目录选项翻页状态，确保返回后可见
        $$('.catalog-option').forEach((opt) => opt.classList.remove('flipping-left', 'flipping-right'));
        // 重置掉落图片位置与拖拽状态
        $$('.open-book-img').forEach((img) => {
          img.dataset.tx = '0';
          img.dataset.ty = '0';
          img.dataset.dragged = 'false';
          img.style.transform = '';
          img.style.zIndex = '';
        });
        // 恢复全局导航栏与留言按钮
        const nav = $('#navBar');
        const msgWrap = document.querySelector('.message-btn-wrap');
        if (nav) {
          nav.style.opacity = '1';
          nav.style.pointerEvents = 'auto';
        }
        if (msgWrap) {
          msgWrap.style.opacity = '1';
          msgWrap.style.pointerEvents = 'auto';
        }
      }

      // 详情页返回按钮
      function initDetailBack() {
        $$('[data-back]').forEach((btn) => {
          btn.addEventListener('click', () => {
            closeAllProjectDetails();
            const project = $('#project');
            if (project) project.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      }

      /* ===== 4.5 Garden 灵感库：添加按钮 + 弹窗 + 新增卡片 ===== */
      function initGarden() {
        const addBtn = $('#gardenAddBtn');
        const overlay = $('#gardenModalOverlay');
        const submitBtn = $('#gardenSubmitBtn');
        const fileInput = $('#gardenFileInput');
        const preview = $('#gardenPreview');
        const previewImg = $('#gardenPreviewImg');
        const placeholder = preview ? preview.querySelector('.preview-placeholder') : null;
        const textInput = $('#gardenNoteText');
        const dateInput = $('#gardenNoteDate');
        const waterfall = $('.garden-waterfall');

        if (!addBtn || !overlay) return;

        let isCollapsed = false;
        let uploadedImageData = '';

        // 展开 / 收起标签
        function toggleCollapse(e) {
          if (e) e.stopPropagation();
          isCollapsed = !isCollapsed;
          addBtn.classList.toggle('collapsed', isCollapsed);
        }

        // 打开弹窗
        function openModal() {
          overlay.classList.add('active');
          addBtn.classList.add('modal-open');
          document.body.style.overflow = 'hidden';
          if (dateInput) {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            dateInput.value = `${y}/${m}/${d}`;
          }
        }

        // 关闭弹窗并清空
        function closeModal() {
          overlay.classList.remove('active');
          addBtn.classList.remove('modal-open');
          document.body.style.overflow = '';
          if (textInput) textInput.value = '';
          if (dateInput) dateInput.value = '';
          if (fileInput) fileInput.value = '';
          uploadedImageData = '';
          if (previewImg) previewImg.style.display = 'none';
          if (previewImg) previewImg.src = '';
          if (placeholder) placeholder.style.display = 'block';
        }

        // 小箭头点击：仅收起 / 展开
        const toggle = addBtn.querySelector('.btn-toggle');
        if (toggle) {
          toggle.addEventListener('click', toggleCollapse);
        }

        // 点击按钮主体打开弹窗
        addBtn.addEventListener('click', (e) => {
          if (e.target.closest('.btn-toggle')) return;
          openModal();
        });

        // 仅在 Garden 区块进入视口时显示添加按钮，离开则隐藏
        const gardenSection = $('#garden');
        function syncAddBtnVisibility() {
          if (!gardenSection) return;
          const rect = gardenSection.getBoundingClientRect();
          const visible = rect.top < window.innerHeight && rect.bottom > 0;
          addBtn.classList.toggle('hidden', !visible);
        }
        if (gardenSection && typeof IntersectionObserver !== 'undefined') {
          const btnObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              addBtn.classList.toggle('hidden', !entry.isIntersecting);
            });
          }, { threshold: 0.05 });
          btnObserver.observe(gardenSection);
        }
        // 兼容/兜底：滚动时同步一次状态
        window.addEventListener('scroll', syncAddBtnVisibility, { passive: true });
        syncAddBtnVisibility();

        // 修复：body 带 perspective 时 fixed 元素会相对于 body 定位，
        // 导致按钮沉到页面底部、弹窗无法居中；通过 CSS 变量实时补偿 scrollY
        function syncGardenFixedPosition() {
          const bodyStyle = window.getComputedStyle(document.body);
          const hasPerspective = bodyStyle.perspective && bodyStyle.perspective !== 'none';
          if (hasPerspective) {
            document.body.style.setProperty('--garden-scroll-y', window.scrollY + 'px');
            addBtn.classList.add('perspective-fix');
            overlay.classList.add('perspective-fix');
            addBtn.style.setProperty('--garden-btn-height', addBtn.offsetHeight + 'px');
          } else {
            document.body.style.removeProperty('--garden-scroll-y');
            addBtn.classList.remove('perspective-fix');
            overlay.classList.remove('perspective-fix');
            addBtn.style.removeProperty('--garden-btn-height');
          }
        }
        window.addEventListener('scroll', syncGardenFixedPosition, { passive: true });
        window.addEventListener('resize', syncGardenFixedPosition, { passive: true });
        syncGardenFixedPosition();

        // 关闭弹窗
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
          }
        });

        // 图片上传预览
        if (fileInput && preview && previewImg) {
          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              uploadedImageData = ev.target.result;
              previewImg.src = uploadedImageData;
              previewImg.style.display = 'block';
              if (placeholder) placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
          });
        }

        // 提交添加：将新卡片插入最短的瀑布流列
        submitBtn && submitBtn.addEventListener('click', () => {
          if (!waterfall) return;
          const liveText = document.getElementById('gardenNoteText');
          const liveDate = document.getElementById('gardenNoteDate');
          const text = liveText ? liveText.value.trim() : '';
          const date = liveDate ? liveDate.value.trim() : '';
          const imgSrc = uploadedImageData || 'assets/images/mr2g07ji-biexg6b.png';

          if (!text && !uploadedImageData) {
            closeModal();
            return;
          }

          const card = document.createElement('div');
          card.className = 'note-card';
          card.style.setProperty('--delay', '0s');
          card.innerHTML = `
            <div class="note-thumb"><img src="${imgSrc}" alt=""/></div>
            <div class="note-text">${escapeHtml(text || '我为什么要记录这个灵感，是不是觉得这个好看，我有什么原因，在什么地方记录的这个灵感，可以做出什么样子')}</div>
            <div class="note-meta">${escapeHtml(date || '2027/02/02')}</div>
          `;
          appendCardToColumn(card, getShortestColumn());

          // 强制立即触发动画（仅在尚未循环时）
          requestAnimationFrame(() => {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = '';
          });

          closeModal();
        });

        // 找到当前卡片最少的列（已循环时只统计原始半份）
        function getShortestColumn() {
          const cols = $$('.garden-waterfall-col', waterfall);
          let shortest = cols[0];
          let shortestCount = Infinity;
          cols.forEach((col) => {
            const track = col.querySelector('.garden-waterfall-scroll');
            const count = track ? Math.floor(track.children.length / 2) : col.children.length;
            if (count < shortestCount) {
              shortest = col;
              shortestCount = count;
            }
          });
          return shortest;
        }

        // 把新卡片加入列：未循环直接追加；已循环则同时补入两份轨道，保持无缝
        function appendCardToColumn(card, col) {
          if (!col) return;
          const track = col.querySelector('.garden-waterfall-scroll');
          if (!track) {
            col.appendChild(card);
            return;
          }
          const half = Math.floor(track.children.length / 2);
          const clone = card.cloneNode(true);
          track.insertBefore(card, track.children[half]);
          track.appendChild(clone);

          const originalHeight = track.scrollHeight / 2;
          const duration = Math.max(originalHeight / 45, 12);
          track.style.setProperty('--scroll-duration', duration + 's');
        }

        // 瀑布流自动循环：等 Garden 入场动画结束后，复制每列内容并纵向滚动
        function startWaterfallCycle() {
          const cols = $$('.garden-waterfall-col', waterfall);
          if (!cols.length || cols[0].querySelector('.garden-waterfall-scroll')) return;

          cols.forEach((col) => {
            const track = document.createElement('div');
            track.className = 'garden-waterfall-scroll';
            track.innerHTML = col.innerHTML + col.innerHTML;
            col.innerHTML = '';
            col.appendChild(track);

            const originalHeight = track.scrollHeight / 2;
            const duration = Math.max(originalHeight / 45, 12);
            track.style.setProperty('--scroll-duration', duration + 's');
          });
        }

        if (gardenSection) {
          if (gardenSection.classList.contains('in-view')) {
            setTimeout(startWaterfallCycle, 1200);
          } else {
            const cycleObserver = new MutationObserver((mutations) => {
              mutations.forEach((m) => {
                if (
                  m.type === 'attributes' &&
                  m.attributeName === 'class' &&
                  gardenSection.classList.contains('in-view')
                ) {
                  cycleObserver.disconnect();
                  setTimeout(startWaterfallCycle, 1200);
                }
              });
            });
            cycleObserver.observe(gardenSection, { attributes: true });
          }
        }
      }

      function escapeHtml(str) {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      /* ===== 5. Contact 三纸条轮播 ===== */
      function initContactCarousel() {
        const carousel = $('#contactCarousel');
        const dots = $$('#contactDots .contact-dot');
        if (!carousel) return;

        const cards = $$('.contact-card', carousel);
        if (cards.length < 2) return;

        let activeIndex = 0;

        function updateCarousel(newIndex) {
          const n = cards.length;
          activeIndex = ((newIndex % n) + n) % n;

          cards.forEach((card, i) => {
            card.classList.remove('active', 'left', 'right');
            if (i === activeIndex) {
              card.classList.add('active');
            } else if (i === (activeIndex - 1 + n) % n) {
              card.classList.add('left');
            } else if (i === (activeIndex + 1) % n) {
              card.classList.add('right');
            }
          });

          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIndex);
          });
        }

        cards.forEach((card, i) => {
          card.addEventListener('click', () => {
            if (i !== activeIndex) updateCarousel(i);
          });
        });

        dots.forEach((dot, i) => {
          dot.addEventListener('click', () => updateCarousel(i));
        });

        updateCarousel(activeIndex);
      }

      /* ===== 5.5 Contact 纸条点击回弹 ===== */
      function initContactNotes() {
        $$('.contact-note-item').forEach((note) => {
          note.addEventListener('click', () => {
            note.classList.remove('bouncing');
            void note.offsetWidth;
            note.classList.add('bouncing');
            setTimeout(() => note.classList.remove('bouncing'), 400);
          });
        });
      }

      /* ===== 5.6 Contact 便利贴文字编辑与本地存储 ===== */
      function initContactNoteEdit() {
        const noteText = $('#contactNoteText');
        if (!noteText) return;

        const STORAGE_KEY = 'portfolio_contact_note';

        // 加载已保存的留言
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          noteText.textContent = saved;
        }

        // 阻止点击 editable 区域触发轮播切换
        noteText.addEventListener('click', (e) => e.stopPropagation());
        noteText.addEventListener('mousedown', (e) => e.stopPropagation());

        // Enter 保存，禁止换行
        noteText.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const text = noteText.textContent.trim();
            localStorage.setItem(STORAGE_KEY, text);
            noteText.blur();
          }
        });

        // 失焦时同样保存
        noteText.addEventListener('blur', () => {
          const text = noteText.textContent.trim();
          localStorage.setItem(STORAGE_KEY, text);
        });
      }

      /* ===== 6. 留言弹窗逻辑 ===== */
      function initMessagePopup() {
        const btn = $('#messageBtn');
        const overlay = $('#popupOverlay');
        const close = $('#popupClose');
        if (!btn || !overlay) return;

        function openPopup() {
          // 修正 body perspective 导致的 fixed 定位偏移，使弹窗居中于当前视口
          overlay.style.setProperty('--popup-scroll-y', window.scrollY + 'px');
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden'; // 防止背景滚动
        }

        function closePopup() {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }

        btn.addEventListener('click', openPopup);
        close && close.addEventListener('click', closePopup);

        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closePopup();
        });

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closePopup();
          }
        });
      }

      /* ===== 6.5 Ending 结尾：星光自然飘落 ===== */
      function initEndingStars() {
        const container = $('#endingStars');
        if (!container) return;

        const STAR_COUNT = 48;
        const SECTION_H = 1080;
        const TOP_WIDTH = 1600; // 倒三角形顶部宽度
        const BOTTOM_WIDTH = 120; // 倒三角形底部宽度

        function triangleX(y) {
          // y 从 -100 到 SECTION_H+100，计算该高度处倒三角形的半宽
          const progress = (y + 100) / (SECTION_H + 200);
          const halfW = (TOP_WIDTH * (1 - progress) + BOTTOM_WIDTH * progress) / 2;
          return halfW;
        }

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < STAR_COUNT; i += 1) {
          const star = document.createElement('div');
          star.className = 'ending-star';

          const size = Math.floor(Math.random() * 30) + 1; // 1~30px
          const startY = -80 + Math.random() * 60; // 初始分布在顶部 -80~-20px，形成连续掉落
          const halfW = triangleX(startY);
          const startX = (Math.random() * 2 - 1) * halfW;
          const endX = startX * (0.15 + Math.random() * 0.25); // 向中心收敛
          const duration = 4 + Math.random() * 5; // 4~9s
          const delay = Math.random() * 6;
          const rotate = Math.floor(Math.random() * 360);

          star.style.setProperty('--size', size + 'px');
          star.style.setProperty('--start-x', startX.toFixed(2) + 'px');
          star.style.setProperty('--start-y', startY.toFixed(2) + 'px');
          star.style.setProperty('--end-x', endX.toFixed(2) + 'px');
          star.style.setProperty('--duration', duration.toFixed(2) + 's');
          star.style.setProperty('--delay', delay.toFixed(2) + 's');
          star.style.setProperty('--rotate', rotate + 'deg');

          const img = document.createElement('img');
          img.src = 'assets/images/screenshot_272_472.png';
          img.alt = '星光';
          img.draggable = false;
          star.appendChild(img);

          fragment.appendChild(star);
        }

        container.appendChild(fragment);
      }

      /* ===== 7. 初始化 ===== */
      document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initPetalFall();
        initHomeNavigation();
        initScrollAnimations();
        initAboutNotesDrag();
        initFolderFlip();
        initPortfolioOpenDrag();
        initPortfolioTypewriter();
        initDetailBack();
        initGarden();
        initContactCarousel();
        initContactNotes();
        initContactNoteEdit();
        initMessagePopup();
        initEndingStars();
      });
    })();
