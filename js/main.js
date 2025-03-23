/**
 * Основной JavaScript файл для сайта SmAIth Token
 * Координирует инициализацию всех компонентов
 */

// Инициализация всех функций при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Загрузка составляющих сайта по порядку
    initTheme();
    initMatrix();
    initAnimations();
    initTokenomics();
    
    // Слушатели для жизненного цикла страницы
    window.addEventListener('load', onFullLoad);
    window.addEventListener('beforeunload', onBeforeUnload);
    
    console.log('SMTH Token site initialized successfully');
});

// Инициализация темы и предпочтений
function initTheme() {
    if (window.themeManager) {
        window.themeManager.setupThemeToggle();
        window.themeManager.checkUserPreferences();
    } else {
        console.error('Theme manager not found');
    }
}

// Инициализация матричного фона
function initMatrix() {
    if (window.matrixBackground) {
        window.matrixBackground.create();
        window.matrixBackground.handleResize();
    } else {
        console.error('Matrix background manager not found');
    }
}

// Инициализация анимаций и UI взаимодействий
function initAnimations() {
    if (window.animationManager) {
        window.animationManager.animateOnScroll();
        window.animationManager.handleNavbarScroll();
        window.animationManager.smoothScroll();
        window.animationManager.setupMobileMenu();
    } else {
        console.error('Animation manager not found');
    }
}

// Инициализация специфических скриптов для секции токеномики
function initTokenomics() {
    // Задержка для анимации прогресс-баров, чтобы они появлялись после загрузки страницы
    setTimeout(() => {
        const distributionItems = document.querySelectorAll('.distribution-bar');
        distributionItems.forEach(item => {
            item.classList.add('animate');
        });
    }, 1000);
}

// Обработчик полной загрузки страницы (включая все ресурсы)
function onFullLoad() {
    // Прекэширование ресурсов и оптимизация
    document.body.classList.add('loaded');
    
    // Устанавливаем одноразовый таймер для проверки скорости загрузки
    setTimeout(() => {
        // Проверяем, насколько быстро пользователь прокрутил страницу
        const scrollPercentage = (window.scrollY / 
            (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
        // Собираем минимальную аналитику о пользовательском опыте
        if (scrollPercentage > 30) {
            console.log('User is engaged, scrolled over 30% in the first 5 seconds');
        }
    }, 5000);
}

// Обработчик выгрузки страницы
function onBeforeUnload() {
    // Сохранение любых пользовательских настроек или состояний
    // Очистка ресурсов, если необходимо
}