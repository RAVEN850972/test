/**
 * Анимации для сайта SmAIth Token
 * Содержит функции для различных анимаций и эффектов интерфейса
 */

// Анимация появления элементов при скролле
function animateOnScroll() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Создаем наблюдатель за пересечением элементов с областью видимости
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Если нужно анимировать элемент только один раз, можно отключить наблюдение
                // observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1, // Элемент считается видимым, когда видно 10% его высоты
        rootMargin: '0px 0px -50px 0px' // Смещение порога срабатывания
    });
    
    // Добавляем все элементы в наблюдатель
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// Изменение стиля навигационной панели при скролле
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    // Обработчик события скролла
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Сразу проверяем позицию скролла при загрузке страницы
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }
}

// Плавный скролл при клике на ссылки навигации
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Настройка мобильного меню
function setupMobileMenu() {
    // Создаем кнопку мобильного меню, если её еще нет
    if (!document.querySelector('.mobile-menu-toggle')) {
        const mobileMenuToggle = document.createElement('div');
        mobileMenuToggle.className = 'mobile-menu-toggle';
        mobileMenuToggle.innerHTML = '<span>☰</span>';
        
        const navContainer = document.querySelector('.nav-container');
        const navLinks = document.querySelector('.nav-links');
        const themeToggle = document.querySelector('.theme-toggle');
        
        // Вставляем кнопку перед навигационными ссылками
        navContainer.insertBefore(mobileMenuToggle, themeToggle);
        
        // Обработчик клика по кнопке меню
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Закрываем меню при нажатии на ссылку
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
        
        // Закрываем меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) && 
                navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
}

// Экспорт функций
window.animationManager = {
    animateOnScroll,
    handleNavbarScroll,
    smoothScroll,
    setupMobileMenu
};