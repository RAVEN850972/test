/**
 * Анимация матричного дождя для фона сайта SmAIth
 * Создает эффект падающих символов в стиле "Матрицы"
 */

// Основная функция создания матричного фона
function createMatrixBackground() {
    const matrixBg = document.getElementById('matrix-bg');
    if (!matrixBg) return; // Выходим, если элемент не найден
    
    // Очищаем содержимое для перерисовки (если функция вызывается повторно)
    matrixBg.innerHTML = '';
    
    // Расчет параметров на основе размера окна
    const width = window.innerWidth;
    const height = window.innerHeight;
    const columns = Math.floor(width / 14); // Расстояние между символами
    const drops = [];
    
    // Заполнение массива начальными позициями капель
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * height);
    }
    
    // Символы для матричного дождя
    const symbols = '01SMTH|/\\-_[]{}=:|<>';
    
    // Функция для рисования и анимации символов
    function draw() {
        matrixBg.innerHTML = '';
        
        for (let i = 0; i < columns; i++) {
            // Создаем элемент для символа
            const text = document.createElement('div');
            text.style.position = 'absolute';
            text.style.left = i * 14 + 'px';
            text.style.top = drops[i] + 'px';
            
            // Выбираем случайный символ из набора
            text.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            
            // Добавляем элемент в DOM
            matrixBg.appendChild(text);
            
            // Перемещение капли вниз или возврат наверх при достижении низа
            if (drops[i] * 14 > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            drops[i]++;
        }
        
        // Перерисовка с интервалом
        setTimeout(draw, 100);
    }
    
    // Запускаем анимацию
    draw();
}

// Функция для пересоздания матрицы при изменении размера окна
function handleMatrixResize() {
    window.addEventListener('resize', () => {
        // Добавляем небольшую задержку для избежания слишком частых вызовов
        clearTimeout(window.matrixResizeTimeout);
        window.matrixResizeTimeout = setTimeout(() => {
            createMatrixBackground();
        }, 200);
    });
}

// Экспорт функций
window.matrixBackground = {
    create: createMatrixBackground,
    handleResize: handleMatrixResize
};