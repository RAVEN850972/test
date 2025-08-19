// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Настройка темы
tg.ready();
tg.expand();

// API базовый URL
const API_BASE_URL = 'https://5b4d9f904337f5398594f3dd46387b76.serveo.net';

// Глобальные переменные
let currentUser = null;
let availableCases = [];
let selectedAmount = 0;
let selectedPaymentMethod = 'telegram_stars';
let userInventory = [];
let gameHistory = [];
let selectedItem = null;
let paymentCheckInterval = null;

function showMainScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('depositScreen').style.display = 'none';
    document.getElementById('caseOpeningScreen').style.display = 'none';
    document.getElementById('profileScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
}

function showDepositScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('caseOpeningScreen').style.display = 'none';
    document.getElementById('profileScreen').style.display = 'none';
    document.getElementById('depositScreen').style.display = 'block';
    
    // Обновляем текущий баланс на экране пополнения
    if (currentUser) {
        document.getElementById('currentBalanceDeposit').textContent = currentUser.balance.toFixed(2) + ' ⭐';
    }
}

function showProfileScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('depositScreen').style.display = 'none';
    document.getElementById('caseOpeningScreen').style.display = 'none';
    document.getElementById('profileScreen').style.display = 'block';
    
    // Обновляем данные профиля
    if (currentUser) {
        updateProfileData();
        loadUserInventory();
        loadGameHistory();
    }
}

function updateMainScreenData(userData) {
    currentUser = userData;
    
    // Обновляем аватар (первая буква имени)
    document.getElementById('userAvatarMain').textContent = userData.first_name.charAt(0).toUpperCase();
    
    // Обновляем имя и username
    document.getElementById('userNameMain').textContent = userData.first_name + (userData.last_name ? ' ' + userData.last_name : '');
    document.getElementById('userUsernameMain').textContent = userData.username ? '@' + userData.username : 'ID: ' + userData.telegram_id;
    
    // Обновляем баланс
    document.getElementById('userBalanceMain').textContent = userData.balance.toFixed(2) + ' ⭐';
    
    // Обновляем статистику
    document.getElementById('userCasesMain').textContent = userData.cases_opened;
    
    // Загружаем количество предметов в инвентаре
    loadInventoryCount(userData.user_id);
}

async function loadInventoryCount(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/inventory/${userId}`);
        if (response.ok) {
            const inventory = await response.json();
            document.getElementById('userItemsMain').textContent = inventory.length;
        }
    } catch (error) {
        console.error('Ошибка загрузки инвентаря:', error);
        document.getElementById('userItemsMain').textContent = '0';
    }
}

async function loadCases() {
    try {
        const response = await fetch(`${API_BASE_URL}/game/cases`);
        if (response.ok) {
            availableCases = await response.json();
            renderCases();
        } else {
            throw new Error('Ошибка загрузки кейсов');
        }
    } catch (error) {
        console.error('Ошибка загрузки кейсов:', error);
        showError('Не удалось загрузить кейсы');
    }
}

function renderCases() {
    const casesGrid = document.getElementById('casesGrid');
    casesGrid.innerHTML = '';

    availableCases.forEach(caseItem => {
        const caseCard = document.createElement('div');
        caseCard.className = `case-card case-${caseItem.type}`;
        caseCard.onclick = () => openCase(caseItem);
        
        caseCard.innerHTML = `
            <div class="case-image">📦</div>
            <div class="case-name">${caseItem.name}</div>
            <div class="case-price">${caseItem.price} ⭐</div>
        `;
        
        casesGrid.appendChild(caseCard);
    });
}

function openCase(caseItem) {
    if (!currentUser) {
        showError('Ошибка авторизации');
        return;
    }

    if (currentUser.balance < caseItem.price) {
        showError('Недостаточно средств для открытия кейса');
        return;
    }

    // Показываем экран открытия кейса
    showCaseOpeningScreen(caseItem);
}

function showCaseOpeningScreen(caseItem) {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('depositScreen').style.display = 'none';
    document.getElementById('caseOpeningScreen').style.display = 'block';
    
    // Обновляем информацию о кейсе
    document.getElementById('openingCaseName').textContent = caseItem.name;
    document.getElementById('openingCasePrice').textContent = caseItem.price + ' ⭐';
    document.getElementById('openingCaseImage').className = `opening-case-image case-${caseItem.type}`;
    
    // Обновляем кнопку открытия
    const spinButton = document.getElementById('spinCaseButton');
    spinButton.innerHTML = `Открыть за ${caseItem.price} ⭐`;
    spinButton.disabled = false;
    
    // Скрываем результат и анимацию
    document.getElementById('caseSpinAnimation').style.display = 'none';
    document.getElementById('caseResult').style.display = 'none';
    
    // Сохраняем текущий кейс
    window.currentCase = caseItem;
    
    // Загружаем содержимое кейса
    loadCaseContents(caseItem.id);
}

async function loadCaseContents(caseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/game/cases/${caseId}/contents`);
        if (response.ok) {
            const contents = await response.json();
            renderCaseContents(contents);
        } else {
            throw new Error('Ошибка загрузки содержимого кейса');
        }
    } catch (error) {
        console.error('Ошибка загрузки содержимого кейса:', error);
        showError('Не удалось загрузить содержимое кейса');
    }
}

function renderCaseContents(contents) {
    const contentsGrid = document.getElementById('caseContentsGrid');
    contentsGrid.innerHTML = '';
    
    contents.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = `case-content-item rarity-${item.rarity}`;
        
        itemCard.innerHTML = `
            <div class="content-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                <div class="content-item-emoji">${getItemEmoji(item.rarity)}</div>
            </div>
            <div class="content-item-name">${item.name}</div>
            <div class="content-item-price">${item.price} ⭐</div>
            <div class="content-item-chance">${(item.win_chance * 100).toFixed(1)}%</div>
        `;
        
        contentsGrid.appendChild(itemCard);
    });
}

function getItemEmoji(rarity) {
    const emojis = {
        'common': '📦',
        'rare': '💎',
        'epic': '🏆',
        'legendary': '👑'
    };
    return emojis[rarity] || '📦';
}

async function spinCase() {
    if (!currentUser || !window.currentCase) {
        showError('Ошибка: не выбран кейс');
        return;
    }
    
    const spinButton = document.getElementById('spinCaseButton');
    spinButton.disabled = true;
    spinButton.textContent = 'Открываем...';
    
    // Показываем анимацию
    document.getElementById('caseSpinAnimation').style.display = 'block';
    
    try {
        const spinData = {
            user_id: currentUser.user_id,
            case_id: window.currentCase.id,
            bet_amount: window.currentCase.price
        };
        
        const response = await fetch(`${API_BASE_URL}/game/spin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(spinData)
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат открытия кейса:', result);
        
        // Обновляем баланс пользователя
        currentUser.balance = result.new_balance;
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        // Показываем результат через 2 секунды (имитация анимации)
        setTimeout(() => {
            showCaseResult(result);
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка открытия кейса:', error);
        showError(`Ошибка открытия кейса: ${error.message}`);
        
        spinButton.disabled = false;
        spinButton.textContent = `Открыть за ${window.currentCase.price} ⭐`;
        document.getElementById('caseSpinAnimation').style.display = 'none';
    }
}

function showCaseResult(result) {
    document.getElementById('caseSpinAnimation').style.display = 'none';
    document.getElementById('caseResult').style.display = 'block';
    
    // Заполняем информацию о выигранном предмете
    document.getElementById('wonItemName').textContent = result.gift_name;
    document.getElementById('wonItemRarity').textContent = result.gift_rarity;
    document.getElementById('wonItemRarity').className = `won-item-rarity rarity-${result.gift_rarity}`;
    
    const wonItemImage = document.getElementById('wonItemImage');
    wonItemImage.innerHTML = `
        <img src="${result.gift_icon}" alt="${result.gift_name}" onerror="this.style.display='none'">
        <div class="won-item-emoji">${getItemEmoji(result.gift_rarity)}</div>
    `;
    
    // Обновляем баланс на экране
    document.getElementById('newBalanceAmount').textContent = result.new_balance.toFixed(2) + ' ⭐';
}

function closeCaseOpening() {
    document.getElementById('caseOpeningScreen').style.display = 'none';
    
    // Обновляем данные на главном экране
    if (currentUser) {
        updateMainScreenData(currentUser);
    }
    
    showMainScreen();
}

function updateProfileData() {
    if (!currentUser) return;
    
    // Обновляем аватар и имя
    document.getElementById('profileAvatarLarge').textContent = currentUser.first_name.charAt(0).toUpperCase();
    document.getElementById('profileNameLarge').textContent = currentUser.first_name + (currentUser.last_name ? ' ' + currentUser.last_name : '');
    document.getElementById('profileUsernameLarge').textContent = currentUser.username ? '@' + currentUser.username : 'Без username';
    document.getElementById('profileTelegramId').textContent = currentUser.telegram_id;
    
    // Обновляем статистику
    document.getElementById('profileBalance').textContent = currentUser.balance.toFixed(2) + ' ⭐';
    document.getElementById('profileCasesOpened').textContent = currentUser.cases_opened;
}

async function loadUserInventory() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/inventory/${currentUser.user_id}`);
        if (response.ok) {
            userInventory = await response.json();
            renderInventory();
            updateInventoryStats();
        } else {
            throw new Error('Ошибка загрузки инвентаря');
        }
    } catch (error) {
        console.error('Ошибка загрузки инвентаря:', error);
        showError('Не удалось загрузить инвентарь');
    }
}

function renderInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    const emptyInventory = document.getElementById('emptyInventory');
    
    if (userInventory.length === 0) {
        inventoryGrid.style.display = 'none';
        emptyInventory.style.display = 'block';
        return;
    }
    
    inventoryGrid.style.display = 'grid';
    emptyInventory.style.display = 'none';
    inventoryGrid.innerHTML = '';
    
    const filteredItems = filterInventoryItems();
    
    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = `inventory-item rarity-${item.rarity}`;
        itemCard.onclick = () => showItemModal(item);
        
        itemCard.innerHTML = `
            <div class="inventory-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                <div class="inventory-item-emoji">${getItemEmoji(item.rarity)}</div>
            </div>
            <div class="inventory-item-name">${item.name}</div>
            <div class="inventory-item-price">${item.price} ⭐</div>
        `;
        
        inventoryGrid.appendChild(itemCard);
    });
}

function filterInventoryItems() {
    const rarityFilter = document.getElementById('rarityFilter').value;
    
    if (rarityFilter === 'all') {
        return userInventory;
    }
    
    return userInventory.filter(item => item.rarity === rarityFilter);
}

function filterInventory() {
    renderInventory();
}

function updateInventoryStats() {
    // Обновляем количество предметов
    document.getElementById('profileItemsCount').textContent = userInventory.length;
    document.getElementById('userItemsMain').textContent = userInventory.length;
    
    // Вычисляем общую стоимость
    const totalValue = userInventory.reduce((sum, item) => {
        return sum + parseFloat(item.price.replace(',', '.') || 0);
    }, 0);
    
    document.getElementById('profileTotalValue').textContent = totalValue.toFixed(0) + ' ⭐';
}

async function loadGameHistory() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/game/history/${currentUser.user_id}`);
        if (response.ok) {
            gameHistory = await response.json();
            renderGameHistory();
        } else {
            throw new Error('Ошибка загрузки истории');
        }
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
        // Не показываем ошибку, просто оставляем историю пустой
    }
}

function renderGameHistory() {
    const historyList = document.getElementById('historyList');
    const emptyHistory = document.getElementById('emptyHistory');
    
    if (gameHistory.length === 0) {
        historyList.style.display = 'none';
        emptyHistory.style.display = 'block';
        return;
    }
    
    historyList.style.display = 'block';
    emptyHistory.style.display = 'none';
    historyList.innerHTML = '';
    
    gameHistory.slice(0, 20).forEach(game => { // Показываем последние 20 игр
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const result = game.result || {};
        const date = new Date(game.created_at).toLocaleDateString('ru-RU');
        
        historyItem.innerHTML = `
            <div class="history-item-image">
                ${getItemEmoji(result.rarity || 'common')}
            </div>
            <div class="history-item-info">
                <div class="history-item-name">${result.name || 'Неизвестный предмет'}</div>
                <div class="history-item-details">${date} • Ставка: ${game.bet_amount} ⭐</div>
            </div>
            <div class="history-item-amount">+${result.price || '0'} ⭐</div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function switchTab(tabName) {
    // Убираем активный класс со всех кнопок и табов
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Активируем нужную кнопку и таб
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

function showItemModal(item) {
    selectedItem = item;
    
    // Заполняем модальное окно
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalItemRarity').textContent = item.rarity;
    document.getElementById('modalItemRarity').className = `modal-item-rarity rarity-${item.rarity}`;
    document.getElementById('modalItemPrice').textContent = item.price + ' ⭐';
    
    const modalImage = document.getElementById('modalItemImage');
    modalImage.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
        <div class="modal-item-emoji">${getItemEmoji(item.rarity)}</div>
    `;
    
    // Обновляем кнопку продажи
    const sellPrice = item.sell_price || (parseFloat(item.price.replace(',', '.')) * 0.8);
    document.getElementById('sellPrice').textContent = sellPrice.toFixed(0);
    
    // Показываем модальное окно
    document.getElementById('itemModal').style.display = 'flex';
}

function closeItemModal() {
    document.getElementById('itemModal').style.display = 'none';
    selectedItem = null;
}

async function sellItem() {
    if (!selectedItem || !currentUser) {
        showError('Ошибка: предмет не выбран');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/inventory/${currentUser.user_id}/sell/${selectedItem.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат продажи:', result);
        
        // Обновляем баланс пользователя
        currentUser.balance = result.new_balance;
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        // Обновляем отображение баланса
        updateProfileData();
        document.getElementById('userBalanceMain').textContent = currentUser.balance.toFixed(2) + ' ⭐';
        
        // Обновляем инвентарь
        await loadUserInventory();
        
        showSuccess(`Предмет продан за ${result.sell_price} ⭐`);
        closeItemModal();
        
    } catch (error) {
        console.error('Ошибка продажи предмета:', error);
        showError(`Ошибка продажи: ${error.message}`);
    }
}

async function withdrawItem() {
    if (!selectedItem || !currentUser) {
        showError('Ошибка: предмет не выбран');
        return;
    }
    
    if (!confirm(`Вы уверены, что хотите вывести "${selectedItem.name}"? Предмет будет удален из инвентаря.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/inventory/${currentUser.user_id}/withdraw/${selectedItem.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат вывода:', result);
        
        // Обновляем инвентарь
        await loadUserInventory();
        
        showSuccess(`Предмет "${result.item_name}" успешно выведен`);
        closeItemModal();
        
    } catch (error) {
        console.error('Ошибка вывода предмета:', error);
        showError(`Ошибка вывода: ${error.message}`);
    }
}

function selectAmount(amount) {
    selectedAmount = amount;
    
    // Убираем выделение со всех карточек
    document.querySelectorAll('.amount-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Выделяем выбранную карточку
    event.target.closest('.amount-card').classList.add('selected');
    
    // Очищаем поле ввода
    document.getElementById('customAmountInput').value = '';
    
    updateDepositSummary();
}

function selectCustomAmount() {
    const customInput = document.getElementById('customAmountInput');
    const customAmount = parseFloat(customInput.value) || 0;
    
    if (customAmount > 0) {
        selectedAmount = customAmount;
        
        // Убираем выделение со всех карточек
        document.querySelectorAll('.amount-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        updateDepositSummary();
    } else {
        selectedAmount = 0;
        updateDepositSummary();
    }
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Убираем выделение со всех методов оплаты
    document.querySelectorAll('.payment-method').forEach(paymentMethod => {
        paymentMethod.classList.remove('selected');
    });
    
    // Выделяем выбранный метод
    event.target.closest('.payment-method').classList.add('selected');
    
    updateDepositSummary();
}

function updateDepositSummary() {
    const fee = calculateFee(selectedAmount, selectedPaymentMethod);
    const total = selectedAmount + fee;
    
    document.getElementById('summaryAmount').textContent = selectedAmount + ' ⭐';
    document.getElementById('summaryFee').textContent = fee + ' ⭐';
    document.getElementById('summaryTotal').textContent = total + ' ⭐';
    
    // Активируем/деактивируем кнопку подтверждения
    const confirmButton = document.getElementById('confirmDepositButton');
    if (selectedAmount > 0) {
        confirmButton.disabled = false;
        confirmButton.textContent = `Пополнить на ${selectedAmount} ⭐`;
    } else {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Выберите сумму';
    }
}

function calculateFee(amount, paymentMethod) {
    // Комиссия зависит от способа оплаты
    if (paymentMethod === 'telegram_stars') {
        return 0; // Без комиссии для Telegram Stars
    } else if (paymentMethod === 'ton') {
        return Math.ceil(amount * 0.02); // 2% комиссия для TON
    }
    return 0;
}

// ОБНОВЛЕННАЯ ФУНКЦИЯ с Bot API интеграцией
async function confirmDeposit() {
    if (!currentUser || selectedAmount <= 0) {
        showError('Выберите сумму для пополнения');
        return;
    }

    try {
        showLoading();
        
        const depositData = {
            user_id: currentUser.user_id,
            amount: selectedAmount,
            payment_method: selectedPaymentMethod
        };

        const response = await fetch(`${API_BASE_URL}/payments/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(depositData)
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const result = await response.json();
        console.log('Результат создания платежа:', result);

        hideLoading();
        
        if (result.success) {
            showSuccess('Инвойс отправлен в чат Telegram! Проверьте сообщения от бота.');
            
            // Показываем инструкции
            showPaymentInstructions(selectedAmount);
            
            // Запускаем проверку статуса платежа каждые 3 секунды
            startPaymentStatusCheck();
        } else {
            showError('Не удалось создать платеж');
        }

    } catch (error) {
        console.error('Ошибка создания платежа:', error);
        hideLoading();
        showError(`Ошибка создания платежа: ${error.message}`);
    }
}

function showPaymentInstructions(amount) {
    const instructionsHtml = `
        <div class="payment-instructions">
            <h3>💳 Инструкции по оплате</h3>
            <p>1. Инвойс отправлен в чат с ботом</p>
            <p>2. Перейдите в Telegram и найдите сообщение от бота</p>
            <p>3. Нажмите "Оплатить" в инвойсе</p>
            <p>4. Подтвердите оплату через Telegram Stars</p>
            <p><strong>Сумма к оплате: ${amount} ⭐</strong></p>
            <div class="payment-status">
                <div class="spinner"></div>
                <span>Ожидаем оплату...</span>
            </div>
        </div>
    `;
    
    // Добавляем инструкции на страницу пополнения
    const depositScreen = document.getElementById('depositScreen');
    const existingInstructions = depositScreen.querySelector('.payment-instructions');
    if (existingInstructions) {
        existingInstructions.remove();
    }
    
    const instructionsDiv = document.createElement('div');
    instructionsDiv.innerHTML = instructionsHtml;
    depositScreen.appendChild(instructionsDiv);
}

function startPaymentStatusCheck() {
    if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
    }
    
    paymentCheckInterval = setInterval(async () => {
        await checkPaymentStatus();
    }, 3000); // Проверяем каждые 3 секунды
    
    // Останавливаем проверку через 5 минут
    setTimeout(() => {
        if (paymentCheckInterval) {
            clearInterval(paymentCheckInterval);
            paymentCheckInterval = null;
            showError('Время ожидания платежа истекло. Попробуйте еще раз.');
        }
    }, 300000); // 5 минут
}

async function checkPaymentStatus() {
    if (!currentUser) return;
    
    try {
        // Получаем свежие данные пользователя с сервера
        const response = await fetch(`${API_BASE_URL}/user/profile/${currentUser.user_id}`);
        if (response.ok) {
            const userData = await response.json();
            
            if (userData.balance > currentUser.balance) {
                // Баланс изменился - платеж прошел
                const difference = userData.balance - currentUser.balance;
                handleSuccessfulPayment(difference);
                
                // Останавливаем проверку
                if (paymentCheckInterval) {
                    clearInterval(paymentCheckInterval);
                    paymentCheckInterval = null;
                }
            }
        }
    } catch (error) {
        console.error('Ошибка проверки статуса платежа:', error);
    }
}

function handleSuccessfulPayment(amount) {
    // Обновляем баланс пользователя
    currentUser.balance += amount;
    localStorage.setItem('userData', JSON.stringify(currentUser));
    
    // Обновляем отображение баланса
    document.getElementById('userBalanceMain').textContent = currentUser.balance.toFixed(2) + ' ⭐';
    document.getElementById('currentBalanceDeposit').textContent = currentUser.balance.toFixed(2) + ' ⭐';
    
    // Убираем инструкции по оплате
    const existingInstructions = document.querySelector('.payment-instructions');
    if (existingInstructions) {
        existingInstructions.remove();
    }
    
    showSuccess(`Платеж успешно обработан! Баланс пополнен на ${amount} ⭐`);
    
    // Сбрасываем форму
    selectedAmount = 0;
    document.querySelectorAll('.amount-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('customAmountInput').value = '';
    updateDepositSummary();
    
    // Возвращаемся на главный экран через 3 секунды
    setTimeout(() => {
        showMainScreen();
    }, 3000);
}

function updateAuthStatus(message) {
    document.getElementById('authStatus').textContent = message;
}

function showLoading() {
    updateAuthStatus('Авторизация...');
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('error').style.display = 'none';
    document.getElementById('success').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccess(message) {
    const successDiv = document.getElementById('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

function showUserInfo(userData) {
    document.getElementById('userName').textContent = userData.first_name + (userData.last_name ? ' ' + userData.last_name : '');
    document.getElementById('userUsername').textContent = userData.username || 'Не указан';
    document.getElementById('userId').textContent = userData.telegram_id;
    document.getElementById('userBalance').textContent = userData.balance.toFixed(2);
    document.getElementById('userCases').textContent = userData.cases_opened;
    document.getElementById('userInfo').style.display = 'block';
}

async function authenticateUser() {
    showLoading();

    try {
        // Получаем данные пользователя из Telegram WebApp
        const user = tg.initDataUnsafe?.user;
        
        if (!user) {
            // Fallback для тестирования вне Telegram
            console.warn('Данные пользователя из Telegram недоступны, используем тестовые данные');
            const testUser = {
                id: Math.floor(Math.random() * 1000000000), // Случайный ID для создания нового пользователя
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                language_code: 'en'
            };
            
            console.log('Тестовый пользователь с ID:', testUser.id);
            
            // Подготавливаем данные для отправки на бекенд
            const authData = {
                id: testUser.id,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                username: testUser.username,
                language_code: testUser.language_code
            };

            console.log('Отправляем тестовые данные авторизации:', authData);
            await sendAuthRequest(authData);
            return;
        }

        // Подготавливаем данные для отправки на бекенд
        const authData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || null,
            username: user.username || null,
            language_code: user.language_code || 'en'
        };

        console.log('Отправляем данные авторизации:', authData);
        await sendAuthRequest(authData);

    } catch (error) {
        console.error('Ошибка авторизации:', error);
        hideLoading();
        updateAuthStatus('Ошибка авторизации');
        showError(`Ошибка авторизации: ${error.message}`);
    }
}

async function sendAuthRequest(authData) {
    try {
        // Отправляем запрос на бекенд
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authData)
        });

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const userData = await response.json();
        console.log('Получен ответ от сервера:', userData);

        // Добавляем детальную информацию о пользователе
        console.log('Детали пользователя:');
        console.log('- User ID в БД:', userData.user_id);
        console.log('- Telegram ID:', userData.telegram_id);
        console.log('- Новый пользователь?', userData.is_new_user);
        console.log('- Баланс:', userData.balance);
        console.log('- Кейсов открыто:', userData.cases_opened);

        hideLoading();
        
        updateAuthStatus('Добро пожаловать!');
        if (userData.is_new_user) {
            showSuccess('Добро пожаловать! Ваш аккаунт создан.');
        } else {
            showSuccess('С возвращением!');
        }

        showUserInfo(userData);
        
        // Переходим на главный экран через 2 секунды
        setTimeout(() => {
            updateMainScreenData(userData);
            loadCases();
            showMainScreen();
        }, 2000);

        // Сохраняем данные пользователя в localStorage для дальнейшего использования
        localStorage.setItem('userData', JSON.stringify(userData));

    } catch (error) {
        console.error('Ошибка отправки запроса авторизации:', error);
        hideLoading();
        updateAuthStatus('Ошибка авторизации');
        showError(`Ошибка авторизации: ${error.message}`);
    }
}

// Автоматическая авторизация при загрузке страницы
window.addEventListener('load', () => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
        try {
            const userData = JSON.parse(savedUserData);
            showUserInfo(userData);
            updateAuthStatus('Авторизован');
            showSuccess('Вы уже авторизованы');
            
            // Сразу переходим на главный экран
            setTimeout(() => {
                updateMainScreenData(userData);
                loadCases();
                showMainScreen();
            }, 1000);
        } catch (error) {
            console.error('Ошибка при загрузке сохраненных данных:', error);
            localStorage.removeItem('userData');
            // Запускаем авторизацию
            authenticateUser();
        }
    } else {
        // Запускаем авторизацию автоматически
        authenticateUser();
    }
});

// Обработка ошибок сети
window.addEventListener('online', () => {
    console.log('Соединение восстановлено');
});

window.addEventListener('offline', () => {
    showError('Нет соединения с интернетом');
});
