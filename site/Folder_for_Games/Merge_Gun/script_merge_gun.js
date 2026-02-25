document.addEventListener('DOMContentLoaded', () => {
    // --- DONNÉES ---
    let money = 100000;
    let xp = 0;
    let currentLevel =10;
    let buyPrice = 1;
    let incomePerSec = 0;
    function saveGame() {
        const saveData = {
            money,
            xp,
            currentLevel,
            buyPrice,
            inventory
        };

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
        inventory = data.inventory ?? Array(4 + currentLevel).fill(null);
    }

    const itemsData = [
        { id: 1, name: "Revolver", img: "https://t3.ftcdn.net/jpg/14/82/79/82/360_F_1482798267_4lYS93TYwatvqI8O1gkd9JbdBB7YzJLf.png", gain_sec: 1 },
        { id: 2, name: "Petit pistolet", img: "https://svgsilh.com/png-1024/906612.png", gain_sec: 2 },
        { id: 3, name: "Uzi", img: "https://www.onlygfx.com/wp-content/uploads/2021/08/uzi-rifle-0962.png", gain_sec: 5 },
        { id: 4, name: "Akimbo", img: "https://img.freepik.com/premium-vector/two-gun-hand-drawn-vector-illustrative_6689-769.jpg", gain_sec: 11 },
        { id: 5, name: "Mitraillette", img: "https://cdn-icons-png.flaticon.com/512/238/238506.png", gain_sec: 25 },
        { id: 6, name: "AR", img: "https://static.vecteezy.com/system/resources/thumbnails/048/783/153/small/an-ar-15-rifle-free-png.png", gain_sec: 60 },
        { id: 7, name: "Mammadou", img: "https://ipj.eu/wp-content/uploads/2020/01/mamadoundiaye-e1651850955259.jpg", gain_sec: 135},
        { id: 8, name: "Sniper", img: "https://www.pngall.com/wp-content/uploads/15/Sniper-PNG-Picture.png", gain_sec: 250 },
        { id: 9, name: "Rocket", img: "https://cdn3d.iconscout.com/3d/premium/thumb/lance-roquettes-3d-icon-png-download-4846082.png", gain_sec: 600},
        { id: 10, name: "Missile", img: "https://png.pngtree.com/png-clipart/20241125/original/pngtree-nuclear-missile-png-image_17292982.png", gain_sec: 1300 },
    ];

    let inventory = Array(4 + currentLevel).fill(null);

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
        
        if (levelDisplay) {
                levelDisplay.textContent = currentLevel;
        }
        if (expBar) {
            // Si niveau MAX, la barre reste pleine
            expBar.style.width = `${Math.min(xp, 100)}%`;
        }
        if (currentLevel >= 10 && currentLevel < 20) {
            title.textContent = "Mammadou est chaud ! Merge !";
        }
        
        renderGrid();
    }

    function renderGrid() {
        if (!grid) return;
        grid.innerHTML = ''; 
        inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.style.position = 'relative'; 
            slot.style.flexDirection = 'column';
            slot.dataset.index = index;

            if (item) {
                const img = document.createElement('img');
                img.src = item.img;
                img.style.width = "70%";
                img.style.height = "70%";
                img.style.objectFit = "contain";
                img.style.pointerEvents = "none";
                
                const gainTxt = document.createElement('div');
                gainTxt.textContent = `+${item.gain_sec}$/s`;
                gainTxt.style.color = '#f1c40f'; 
                gainTxt.style.fontSize = '0.9rem';
                gainTxt.style.fontWeight = 'bold';
                gainTxt.style.webkitTextStroke = '1px black'; 
                gainTxt.style.marginTop = '2px';
                gainTxt.style.pointerEvents = 'none';

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

        if (slotElement) {
            touchTargetIndex = parseInt(slotElement.dataset.index);
        }
    }

    function handleTouchEnd() {
        if (draggedItemIndex === null || touchTargetIndex === null) return;
        if (dragGhost) {
            dragGhost.remove();
            dragGhost = null;
        }
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

                if (currentLevel < 20) {
                    xp += 20;
                    if (xp >= 100) {
                        xp = 0;
                        currentLevel++;
                        inventory.push(null);
                    }
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
                
                // Gain d'XP seulement si inférieur au niveau 20
                if (currentLevel < 20) {
                    xp += 20; 
                    if (xp >= 100) { 
                        xp = 0; 
                        currentLevel++; 
                        inventory.push(null);
                    }
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
    setInterval(() => {
        if (incomePerSec > 0) {
            money += incomePerSec;
            updateUI();
        }
    }, 1000);

    // --- INITIALISATION ---
    if (buyBtn) buyBtn.addEventListener('click', buyItem);
    loadGame();
    calculateIncome();
    updateUI();
});