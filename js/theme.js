/**
 * Управление темой сайта SmAIth Token
 * Реализует переключение между светлой и темной темой
 */

// Функция для инициализации управления темой
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.querySelector('.theme-toggle-icon').textContent = '🌙';
    }
    
    // Обработчик нажатия на переключатель темы
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.querySelector('.theme-toggle-icon').textContent = '🌙';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.querySelector('.theme-toggle-icon').textContent = '☀️';
        }
    });
}

// Функция для проверки системных предпочтений пользователя
function checkUserPreferences() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    // Если тема не установлена пользователем, используем системную
    if (savedTheme === null && prefersDarkScheme.matches) {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').querySelector('.theme-toggle-icon').textContent = '🌙';
    }
    
    // Следим за изменением системных предпочтений
    prefersDarkScheme.addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
                document.getElementById('theme-toggle').querySelector('.theme-toggle-icon').textContent = '🌙';
            } else {
                document.body.classList.remove('dark-theme');
                document.getElementById('theme-toggle').querySelector('.theme-toggle-icon').textContent = '☀️';
            }
        }
    });
}

// Экспорт функций
window.themeManager = {
    setupThemeToggle,
    checkUserPreferences
};