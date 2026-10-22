// ============================================
// 个人博客交互脚本
// 兼容首页（轮播）与文章页（进度条/灯箱），
// 所有模块均带存在性守卫，缺失元素时自动跳过
// ============================================
document.addEventListener('DOMContentLoaded', function() {

    /* ---------- 主题切换（浅色 / 深色） ---------- */
    var themeToggle = document.getElementById('themeToggle');
    var themeColorMeta = document.getElementById('themeColorMeta');

    function resolveTheme() {
        var attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'dark' || attr === 'light') return attr;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (e) { /* file:// 等场景下忽略 */ }
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', theme === 'dark' ? '#000000' : '#fbfbfd');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            applyTheme(resolveTheme() === 'dark' ? 'light' : 'dark');
        });
    }

    // 跟随系统偏好（用户未手动选择过时）
    var systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemDarkQuery.addEventListener('change', function(e) {
        var saved = null;
        try {
            saved = localStorage.getItem('theme');
        } catch (err) { /* 忽略 */ }
        if (!saved) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    /* ---------- 导航栏：滚动隐藏 / 背景加深 ---------- */
    var navbar = document.querySelector('.navbar');
    var backToTop = document.getElementById('backToTop');
    var readingProgress = document.getElementById('readingProgress');
    var lastScrollTop = 0;

    function updateReadingProgress() {
        if (!readingProgress) return;
        var doc = document.documentElement;
        var scrollable = doc.scrollHeight - window.innerHeight;
        var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        readingProgress.style.width = Math.min(pct, 100) + '%';
    }

    function onScroll() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (navbar) {
            // 向下滚动隐藏，向上滚动显示
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.classList.add('nav-hidden');
            } else {
                navbar.classList.remove('nav-hidden');
            }
            // 离开顶部后加深背景
            navbar.classList.toggle('scrolled', scrollTop > 50);
        }

        if (backToTop) {
            backToTop.classList.toggle('show', scrollTop > 600);
        }

        updateReadingProgress();
        lastScrollTop = scrollTop;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 返回顶部 ---------- */
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Scrollspy：导航高亮当前栏目（仅首页） ---------- */
    var navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    var spySections = document.querySelectorAll('section[id]');

    if (navLinks.length > 0 && spySections.length > 0 && 'IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = '#' + entry.target.id;
                    navLinks.forEach(function(link) {
                        link.classList.toggle('active', link.getAttribute('href') === id);
                    });
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

        spySections.forEach(function(section) {
            spy.observe(section);
        });
    }

    /* ---------- 平滑滚动到锚点 ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ---------- Hero 轮播（仅首页，带存在性守卫） ---------- */
    var sliderTrack = document.querySelector('.slider-track');
    var slides = document.querySelectorAll('.slide');
    var dots = document.querySelectorAll('.dot');
    var sliderContainer = document.querySelector('.hero-slider');
    var heroSection = document.querySelector('.hero');
    var sliderImages = document.querySelectorAll('.slide img');

    if (sliderTrack && slides.length > 0) {
        var currentSlide = 0;
        var totalSlides = slides.length;
        var autoplayTimer = null;

        function goToSlide(index) {
            currentSlide = index;
            sliderTrack.style.transform = 'translateX(-' + (index * 100) + '%)';

            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            goToSlide((currentSlide + 1) % totalSlides);
        }

        function prevSlide() {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        }

        function restartAutoplay() {
            clearInterval(autoplayTimer);
            autoplayTimer = setInterval(nextSlide, 5000);
        }

        goToSlide(0);
        restartAutoplay();

        // 点击圆点切换
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
                restartAutoplay();
            });
        });

        // 鼠标悬停暂停，移开恢复
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', function() {
                clearInterval(autoplayTimer);
            });
            sliderContainer.addEventListener('mouseleave', restartAutoplay);

            // 移动端触摸滑动切换
            var touchStartX = 0;
            sliderContainer.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            sliderContainer.addEventListener('touchend', function(e) {
                var distance = e.changedTouches[0].screenX - touchStartX;
                if (distance < -50) {
                    nextSlide();
                } else if (distance > 50) {
                    prevSlide();
                }
                restartAutoplay();
            }, { passive: true });
        }

        // 键盘左右方向键切换（仅首屏可见时响应）
        document.addEventListener('keydown', function(e) {
            if (window.scrollY > window.innerHeight * 0.6) return;
            if (e.key === 'ArrowRight') {
                nextSlide();
                restartAutoplay();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
                restartAutoplay();
            }
        });

        // 切换到其他标签页时暂停，回来恢复
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(autoplayTimer);
            } else {
                restartAutoplay();
            }
        });

        // 鼠标视差（作用于图片，不影响轮播轨道位移）
        if (heroSection && sliderImages.length > 0) {
            heroSection.addEventListener('mousemove', function(e) {
                var xAxis = (window.innerWidth / 2 - e.pageX) / 80;
                var yAxis = (window.innerHeight / 2 - e.pageY) / 80;
                sliderImages.forEach(function(img) {
                    img.style.transform = 'translate(' + xAxis + 'px, ' + yAxis + 'px) scale(1.05)';
                });
            });
            heroSection.addEventListener('mouseleave', function() {
                sliderImages.forEach(function(img) {
                    img.style.transform = 'translate(0, 0) scale(1)';
                });
            });
        }
    }

    /* ---------- 文章配图灯箱 ---------- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var lightboxClose = document.getElementById('lightboxClose');

    if (lightbox && lightboxImg) {
        function openLightbox(img, caption) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || '';
            if (lightboxCaption) {
                lightboxCaption.textContent = caption || img.alt || '';
            }
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        document.querySelectorAll('.article-img, .photo-card img').forEach(function(img) {
            img.addEventListener('click', function() {
                var caption = img.alt || '';
                var figure = img.closest('figure');
                if (figure) {
                    var cap = figure.querySelector('figcaption');
                    if (cap) caption = cap.textContent.trim();
                }
                openLightbox(img, caption);
            });
        });

        lightbox.addEventListener('click', closeLightbox);
        if (lightboxClose) {
            lightboxClose.addEventListener('click', function(e) {
                e.stopPropagation();
                closeLightbox();
            });
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    /* ---------- 移动端菜单 ---------- */
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    function closeMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', '打开菜单');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            var open = navMenu.classList.toggle('open');
            navToggle.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
        });

        navMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') closeMenu();
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 860) closeMenu();
        });
    }

    /* ---------- 轻提示 ---------- */
    var toastEl = null;
    var toastTimer = null;

    function showToast(message) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast';
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = message;
        requestAnimationFrame(function() {
            toastEl.classList.add('show');
        });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            toastEl.classList.remove('show');
        }, 2200);
    }

    /* ---------- 博客分类筛选与搜索 ---------- */
    var chips = document.querySelectorAll('.filter-chip');
    var searchInput = document.getElementById('blogSearch');
    var blogCards = document.querySelectorAll('.blog-card');
    var blogEmpty = document.getElementById('blogEmpty');
    var activeFilter = 'all';

    function applyBlogFilter() {
        if (!blogCards.length) return;
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;

        blogCards.forEach(function(card) {
            var categoryOk = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
            var keywordOk = !keyword || card.textContent.toLowerCase().indexOf(keyword) !== -1;
            var show = categoryOk && keywordOk;
            card.classList.toggle('is-hidden', !show);
            if (show) visible++;
        });

        if (blogEmpty) blogEmpty.classList.toggle('show', visible === 0);
    }

    if (chips.length > 0) {
        chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                chips.forEach(function(c) { c.classList.remove('active'); });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter');
                applyBlogFilter();
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyBlogFilter);
    }

    /* ---------- 分享 ---------- */
    var shareUrl = window.location.href;
    var shareTitle = document.title;

    var weiboLink = document.getElementById('shareWeibo');
    if (weiboLink) {
        weiboLink.href = 'https://service.weibo.com/share/share.php?url=' +
            encodeURIComponent(shareUrl) + '&title=' + encodeURIComponent(shareTitle);
    }

    var nativeShare = document.getElementById('shareNative');
    if (nativeShare && navigator.share) {
        nativeShare.hidden = false;
        nativeShare.addEventListener('click', function() {
            navigator.share({ title: shareTitle, url: shareUrl }).catch(function() {});
        });
    }

    function legacyCopy(text) {
        var area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy');
        } catch (e) { /* 忽略 */ }
        document.body.removeChild(area);
    }

    document.querySelectorAll('[data-share="copy"]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(function() {
                    showToast('链接已复制');
                }).catch(function() {
                    legacyCopy(shareUrl);
                    showToast('链接已复制');
                });
            } else {
                legacyCopy(shareUrl);
                showToast('链接已复制');
            }
        });
    });

    /* ---------- PWA：Service Worker ---------- */
    var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || isLocal)) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('sw.js').catch(function() {});
        });
    }

    /* ---------- 滚动进入视口动画 ---------- */
    if ('IntersectionObserver' in window) {
        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // 博客卡片
        document.querySelectorAll('.blog-card').forEach(function(card, index) {
            card.classList.add('scroll-animate');
            card.style.transitionDelay = (index * 0.1) + 's';
            observer.observe(card);
        });

        // 个人介绍区域
        var aboutContent = document.querySelector('.about-content');
        if (aboutContent) {
            aboutContent.classList.add('scroll-animate');
            observer.observe(aboutContent);
        }
        var aboutImage = document.querySelector('.about-image');
        if (aboutImage) {
            aboutImage.classList.add('scroll-animate');
            observer.observe(aboutImage);
        }

        // 联系链接
        document.querySelectorAll('.contact-link').forEach(function(link, index) {
            link.classList.add('scroll-animate');
            link.style.transitionDelay = (index * 0.1) + 's';
            observer.observe(link);
        });
    }

    /* ---------- 页面加载淡入（不依赖图片下载完成） ---------- */
    document.body.style.opacity = '0';
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            document.body.style.transition = 'opacity 0.5s ease, background-color 0.4s ease, color 0.4s ease';
            document.body.style.opacity = '1';
        });
    });
});

// 导出标记供其他脚本使用
window.blogApp = {
    scrollAnimation: true,
    smoothScroll: true
};
