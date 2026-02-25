document.addEventListener('DOMContentLoaded', () => {
    // --- DONNÉES ---
    let money = 10000;
    let xp = 0;
    let currentLevel =  1;
    let buyPrice = 1;
    let incomePerSec = 0;
    const MAX_SLOTS = 24;

    function saveGame() {
        const saveData = { money, xp, currentLevel, buyPrice, inventory };
        localStorage.setItem("mergeGameSave", JSON.stringify(saveData));
    }

    function loadGame() {
        const saveData = localStorage.getItem("mergeGameSave");
        if (!saveData) return;
        const data = JSON.parse(saveData);
        money = data.money ?? 0;
        xp = data.xp ?? 0;
        currentLevel = data.currentLevel ?? 1;
        buyPrice = data.buyPrice ?? 1;
        inventory = data.inventory ?? Array(Math.min(4 + currentLevel, MAX_SLOTS)).fill(null);
        inventory = inventory.slice(0, MAX_SLOTS);
    }

    const itemsData = [
        { id: 1, name: "Revolver", img: "https://t3.ftcdn.net/jpg/14/82/79/82/360_F_1482798267_4lYS93TYwatvqI8O1gkd9JbdBB7YzJLf.png", gain_sec: 1 },
        { id: 2, name: "Petit pistolet", img: "https://svgsilh.com/png-1024/906612.png", gain_sec: 2 },
        { id: 3, name: "Uzi", img: "https://www.onlygfx.com/wp-content/uploads/2021/08/uzi-rifle-0962.png", gain_sec: 5 },
        { id: 4, name: "Akimbo", img: "https://img.freepik.com/premium-vector/two-gun-hand-drawn-vector-illustrative_6689-769.jpg", gain_sec: 11 },
        { id: 5, name: "Mitraillette", img: "https://cdn-icons-png.flaticon.com/512/238/238506.png", gain_sec: 25 },
        { id: 6, name: "AR", img: "https://static.vecteezy.com/system/resources/thumbnails/048/783/153/small/an-ar-15-rifle-free-png.png", gain_sec: 60 },
        { id: 7, name: "Mammadou", img: "https://ipj.eu/wp-content/uploads/2020/01/mamadoundiaye-e1651850955259.jpg", gain_sec: 135},
        { id: 8, name: "Sniper", img: "https://www.pngall.com/wp-content/uploads/15/Sniper-PNG-Picture.png", gain_sec: 300 },
        { id: 9, name: "Rocket", img: "https://cdn3d.iconscout.com/3d/premium/thumb/lance-roquettes-3d-icon-png-download-4846082.png", gain_sec: 650},
        { id: 10, name: "Missile", img: "https://png.pngtree.com/png-clipart/20241125/original/pngtree-nuclear-missile-png-image_17292982.png", gain_sec: 1500 },
    ];

    let inventory = Array(Math.min(4 + currentLevel, MAX_SLOTS)).fill(null);

    // --- SÉLECTEURS ---
    const moneyDisplay = document.querySelector('.money-amount'); 
    const incomeDisplay = document.querySelector('.income-text');
    const buyPriceDisplay = document.querySelector('.price');
    const levelDisplay = document.querySelector('.level-circle');
    const expBar = document.querySelector('.exp-fill');
    const buyBtn = document.querySelector('.btn-buy');
    const grid = document.getElementById('grid');
    const title = document.querySelector('.game-logo');

    // --- FONCTIONS D'AFFICHAGE ---
    function updateUI() {
        if (moneyDisplay) moneyDisplay.innerHTML = `<span>$</span> ${Math.floor(money)}`;
        if (incomeDisplay) incomeDisplay.textContent = `${incomePerSec}/sec`;
        if (buyPriceDisplay) buyPriceDisplay.textContent = `$${Math.round(buyPrice)}`;
        if (levelDisplay) levelDisplay.textContent = currentLevel;
        if (expBar) expBar.style.width = `${Math.min(xp, 100 + currentLevel * 20)}%`;
        if (currentLevel >= 10 && currentLevel < 20) title.textContent = "Mammadou est chaud ! Merge !";
        renderGrid();
        saveGame();
    }

    function renderGrid() {
        if (!grid) return;
        grid.innerHTML = ''; 
        inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.dataset.index = index;

            if (item) {
                const img = document.createElement('img');
                img.src = item.img;
                img.style.width = "60%";
                img.style.height = "60%";
                img.style.maxWidth = "80px";
                img.style.maxHeight = "80px";
                img.style.objectFit = "contain";
                img.style.pointerEvents = "none";

                const gainTxt = document.createElement('div');
                gainTxt.textContent = `+${item.gain_sec}$/s`;
                gainTxt.style.color = '#f1c40f'; 
                gainTxt.style.fontSize = '0.9rem';
                gainTxt.style.fontWeight = 'bold';
                gainTxt.style.webkitTextStroke = '1px black'; 
                gainTxt.style.marginTop = '2px';
                gainTxt.style.pointerEvents = "none";

                slot.appendChild(img);
                slot.appendChild(gainTxt);
                slot.setAttribute('draggable', true);
                slot.style.cursor = "grab";
                slot.addEventListener('dragstart', handleDragStart);
            } else {
                slot.textContent = '+';
                slot.style.color = "rgba(255,255,255,0.2)";
                slot.style.cursor = "default";
            }

            slot.addEventListener('dragover', e => e.preventDefault());
            slot.addEventListener('drop', handleDrop);
            slot.addEventListener('touchstart', handleTouchStart);
            slot.addEventListener('touchmove', handleTouchMove);
            slot.addEventListener('touchend', handleTouchEnd);
            grid.appendChild(slot);
        });
    }

    // --- LOGIQUE MÉTIER ---
    function buyItem() {
        if (money >= buyPrice) {
            const emptyIndex = inventory.indexOf(null);
            if (emptyIndex !== -1) {
                money -= buyPrice;
                inventory[emptyIndex] = { ...itemsData[0] };
                buyPrice = Math.round(buyPrice * 2);
                calculateIncome();
                updateUI();
            }
        }
    }

    function calculateIncome() {
        incomePerSec = inventory.reduce((total, item) => total + (item ? item.gain_sec : 0), 0);
    }

    // --- SYSTÈME DE MERGE ---
    let draggedItemIndex = null;
    let touchTargetIndex = null;
    let dragGhost = null;

    function handleTouchStart(e) {
        const slotElement = e.target.closest('.slot');
        if (!slotElement) return;
        draggedItemIndex = parseInt(slotElement.dataset.index);
        const item = inventory[draggedItemIndex];
        if (!item) return;
        const touch = e.touches[0];
        dragGhost = document.createElement("img");
        dragGhost.src = item.img;
        dragGhost.style.position = "fixed";
        dragGhost.style.left = touch.clientX + "px";
        dragGhost.style.top = touch.clientY + "px";
        dragGhost.style.width = "60px";
        dragGhost.style.height = "60px";
        dragGhost.style.pointerEvents = "none";
        dragGhost.style.zIndex = "9999";
        dragGhost.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(dragGhost);
    }

    function handleTouchMove(e) {
        const touch = e.touches[0];
        if (dragGhost) {
            dragGhost.style.left = touch.clientX + "px";
            dragGhost.style.top = touch.clientY + "px";
        }
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const slotElement = element ? element.closest('.slot') : null;
        if (slotElement) touchTargetIndex = parseInt(slotElement.dataset.index);
    }

    function handleTouchEnd() {
        if (draggedItemIndex === null || touchTargetIndex === null) return;
        if (dragGhost) { dragGhost.remove(); dragGhost = null; }
        const sourceIndex = draggedItemIndex;
        const targetIndex = touchTargetIndex;
        if (sourceIndex === targetIndex) return;

        const sourceItem = inventory[sourceIndex];
        const targetItem = inventory[targetIndex];

        if (targetItem && sourceItem.id === targetItem.id) {
            const nextLevelIndex = sourceItem.id;
            if (itemsData[nextLevelIndex]) {
                inventory[targetIndex] = { ...itemsData[nextLevelIndex] };
                inventory[sourceIndex] = null;

                const gainedXP = sourceItem.id * 10;
                xp += gainedXP;
                const xpNeeded = 100 + currentLevel * 20;
                if (xp >= xpNeeded) {
                    xp -= xpNeeded;
                    currentLevel++;
                    if (inventory.length < MAX_SLOTS) inventory.push(null);
                }

                calculateIncome();
                updateUI();
            }
        } else if (!targetItem) {
            inventory[targetIndex] = sourceItem;
            inventory[sourceIndex] = null;
            updateUI();
        }

        draggedItemIndex = null;
        touchTargetIndex = null;
    }

    function handleDragStart(e) {
        draggedItemIndex = e.target.dataset.index;
        e.dataTransfer.setData('text/plain', draggedItemIndex);
    }

    function handleDrop(e) {
        e.preventDefault();
        const slotElement = e.target.closest('.slot');
        if (!slotElement || draggedItemIndex === null) return;

        const targetIndex = parseInt(slotElement.dataset.index);
        const sourceIndex = parseInt(draggedItemIndex);

        if (sourceIndex === targetIndex) return;

        const sourceItem = inventory[sourceIndex];
        const targetItem = inventory[targetIndex];

        if (targetItem && sourceItem.id === targetItem.id) {
            const nextLevelIndex = sourceItem.id; 
            if (itemsData[nextLevelIndex]) {
                inventory[targetIndex] = { ...itemsData[nextLevelIndex] };
                inventory[sourceIndex] = null;

                const gainedXP = sourceItem.id * 10;
                xp += gainedXP;
                const xpNeeded = 100 + currentLevel * 20;
                if (xp >= xpNeeded) {
                    xp -= xpNeeded;
                    currentLevel++;
                    if (inventory.length < MAX_SLOTS) inventory.push(null);
                }

                calculateIncome();
                updateUI();
            }
        } else if (!targetItem) {
            inventory[targetIndex] = sourceItem;
            inventory[sourceIndex] = null;
            updateUI();
        }

        draggedItemIndex = null;
    }

    // --- BOUCLE D'ARGENT ---
    let clickMultiplier = 1;
    setInterval(() => {
        money += incomePerSec * clickMultiplier;
        updateUI();
    }, 1000);

    // --- INITIALISATION ---
    if (buyBtn) buyBtn.addEventListener('click', buyItem);
    loadGame();
    calculateIncome();
    updateUI();
    setInterval(saveGame, 1000);

    // --- SPAM-CLICK BONUS X2 ---
    let clickCount = 0;
    let lastClickTime = Date.now();
    let bonusActive = false;
    let vignette = null;

    function resetClicks() {
        clickCount = 0;
        bonusActive = false;
        clickMultiplier = 1;
        if (vignette) { vignette.remove(); vignette = null; }
        moneyDisplay.style.color = '';
        incomeDisplay.style.color = '';
    }

    function createClickEffect(x, y) {
        const circle = document.createElement('div');
        circle.style.position = 'fixed';
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        circle.style.width = '40px';
        circle.style.height = '40px';
        circle.style.border = '2px solid gold';
        circle.style.borderRadius = '50%';
        circle.style.pointerEvents = 'none';
        circle.style.zIndex = '9999';
        circle.style.opacity = '0.8';
        circle.style.transform = 'translate(-50%, -50%) scale(1)';
        circle.style.transition = 'all 0.5s ease-out';
        document.body.appendChild(circle);
        requestAnimationFrame(() => {
            circle.style.transform = 'translate(-50%, -50%) scale(2)';
            circle.style.opacity = '0';
        });
        setTimeout(() => circle.remove(), 500);
    }

    function handleSpamClick(e) {
        if (e.target.closest('.btn-buy')) return;
        let x = 0, y = 0;
        if (e.type.startsWith('touch')) {
            if (e.touches && e.touches[0]) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
        } else { x = e.clientX; y = e.clientY; }

        const now = Date.now();
        if (now - lastClickTime > 1000) resetClicks();
        clickCount++;
        lastClickTime = now;

        if (clickCount === 1) {
            bonusActive = true;
            clickMultiplier = 2;
            createVignette();
            moneyDisplay.style.color = 'gold';
            incomeDisplay.style.color = 'gold';
        }

        if (bonusActive) createClickEffect(x, y);
    }

    function createVignette() {
        vignette = document.createElement('div');
        vignette.style.position = 'fixed';
        vignette.style.top = 0;
        vignette.style.left = 0;
        vignette.style.width = '100%';
        vignette.style.height = '100%';
        vignette.style.background = 'rgba(255,215,0,0.1)';
        vignette.style.pointerEvents = 'none';
        vignette.style.zIndex = '9998';
        document.body.appendChild(vignette);
    }

    document.addEventListener('click', handleSpamClick, { passive: true });
    document.addEventListener('touchstart', handleSpamClick, { passive: true });

    // Réinitialise bonus si pas de clic pendant plus d'1 sec
    setInterval(() => {
        if (Date.now() - lastClickTime > 1000) resetClicks();
    }, 200);
});