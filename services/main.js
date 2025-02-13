document.addEventListener("DOMContentLoaded", function () {
    const menu = document.getElementById('menu');
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cartCounter = document.getElementById('cart-count');

    // Address info
    const streetAddress = document.getElementById('street-address');
    const numberAddress = document.getElementById('number-address');
    const districtAddress = document.getElementById('district-address');
    const complementAddress = document.getElementById('complement-address');

    // Warning
    const addressWarn = document.getElementById('address-warn');

    // Cart
    let cart = [];

    // Open Modal Cart
    cartBtn.addEventListener('click', function () {
        cartModal.style.display = 'flex';
        updateCartModal();
    });

    // Close Modal Cart
    cartModal.addEventListener('click', function (event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    closeModalBtn.addEventListener('click', function () {
        cartModal.style.display = 'none';
    });

    // Menu add
    menu.addEventListener('click', function (event) {
        let parentButton = event.target.closest('.add-to-cart-btn');

        if (parentButton) {
            const name = parentButton.getAttribute('data-name');
            const price = parseFloat(parentButton.getAttribute('data-price'));
            const category = parentButton.getAttribute('data-category');
            const image = parentButton.getAttribute('data-image');
            addToCart(name, price, category, image);
        }
    });

    // Add to cart function
    function addToCart(name, price, category, image) {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1, category, image });
        }

        updateCartModal();
    }

    // Update cart modal
    function updateCartModal() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('flex', 'justify-between', 'mb-4', 'flex-col', 'sm:flex-row');

            cartItemElement.innerHTML = `
            <div class="flex items-center justify-between w-full bg-gray-100 p-4 rounded-lg shadow-md mb-4">
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg shadow-sm mr-4">  <!-- Imagem com borda arredondada e sombra -->
                    <div>
                        <p class="font-bold text-lg text-gray-700">${item.name}</p> <!-- Nome do item com fonte maior e cor cinza -->
                        <p class="text-sm text-gray-500">Quantidade: ${item.quantity}</p> <!-- Quantidade com texto menor e cor cinza -->
                        <p class="text-md text-green-500 font-semibold mt-2">Preço: R$ ${item.price.toFixed(2)}</p> <!-- Preço com texto médio e cor verde -->
                    </div>
                </div>

                <div class="ml-auto"> <!-- Usando ml-auto para empurrar para a direita -->
                    <button class="remove-from-cart-btn bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-900 transition" data-name="${item.name}"> <!-- Botão de remoção com fundo vermelho, borda arredondada e sombra -->
                        <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            `;

            total += item.price * item.quantity;
            cartItemsContainer.appendChild(cartItemElement);
        });

        cartTotal.textContent = total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        cartCounter.innerHTML = cart.length;

        if (cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add("bg-gray-500", "cursor-not-allowed");
            checkoutBtn.classList.remove("bg-green-500", "hover:bg-green-600");
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove("bg-gray-500", "cursor-not-allowed");
            checkoutBtn.classList.add("bg-green-500", "hover:bg-green-600");
        }
    }

    // Remove item from cart
    cartItemsContainer.addEventListener('click', function (event) {
        let button = event.target.closest('.remove-from-cart-btn');

        if (button) {
            const name = button.getAttribute('data-name');
            removeItemCart(name);
        }
    });

    function removeItemCart(name) {
        const index = cart.findIndex(item => item.name === name);

        if (index !== -1) {
            const item = cart[index];

            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart.splice(index, 1);
            }

            updateCartModal();
        }
    }

    // Address check 
    const addressInputs = [streetAddress, numberAddress, districtAddress, complementAddress];

    addressInputs.forEach(input => {
        if (input) {
            input.addEventListener("input", function (event) {
                let inputValue = event.target.value;
                if (inputValue.trim() !== '') {
                    input.classList.remove("border", "border-red-500")
                    addressWarn.classList.add("hidden");
                }
            });
        } else {
            console.error('Um ou mais campos de endereço não foram encontrados!');
        }
    });

    // Checkout cart 
    checkoutBtn.addEventListener("click", function () {
        const isOpen = CheckRestaurantOpen();
        if (!isOpen) {
            Toastify({
                text: "Restaurante fechado no momento. Por favor, tente novamente mais tarde! Entre os horário 18h-22h",
                duration: 3000,
                close: true,
                gravity: "center",
                position: "center",
                stopOnFocus: true,
                style: {
                    background: "linear-gradient(to right, #ff0000, #ff6347)",
                },
            }).showToast();
                      
            return;
        }
    
        if (cart.length === 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add("bg-gray-500", "cursor-not-allowed");
        }
    
        let emptyFields = false;
    
        addressInputs.forEach(input => {
            if (input) {
                if (input.value.trim() === '') {
                    emptyFields = true;
                    input.classList.add("border", "border-red-500");
                } else {
                    input.classList.remove("border", "border-red-500");
                }
            }
        });
    
        if (emptyFields) {
            addressWarn.classList.remove("hidden");
            return;
        } else {
            addressWarn.classList.add("hidden");
        }
    
        const orderNumber = Math.floor(1000 + Math.random() * 9000);
    
        const cartItems = cart.map((item) => {
            const emoji = item.category === "drinks" ? "🥤" : "🍔";
            return (
                `${emoji} *${item.name}* \nQuantidade: ${item.quantity} \nPreço: R$${item.price.toFixed(2)}\n`
            );
        }).join("\n");
    
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    
        const message = `🟢 Número do pedido: ${orderNumber}\n\nOlá! Meu pedido é:\n\n${cartItems}\n💵 *Valor total:* ${total}\n🏠 *Endereço de entrega:*\n${streetAddress.value}, ${numberAddress.value} - ${districtAddress.value}\nComplemento: ${complementAddress.value}\n\n🛵 *Por favor, entregue o mais rápido possível!* 😊`;
        const phone = "8188859162";
        
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
    
        cart = [];
        updateCartModal();

        Toastify({
            text: "Pedido concluído com sucesso!",
            duration: 3000,
            close: true,
            gravity: "center",
            position: "center",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
            callback: function() {
                const modal = document.getElementById('modal-id');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
        }).showToast();
    });    

    // Check the schedule
    function CheckRestaurantOpen(){
        const data = new Date();
        const hora = data.getHours();
        return hora >= 18 && hora < 22;
    }

    // Span open or close
    const spanItem = document.getElementById('date-span');
    const isOpen = CheckRestaurantOpen();

    if(isOpen){
        spanItem.classList.remove("bg-red-500");
        spanItem.classList.add("bg-green-600");
    } else {
        spanItem.classList.remove("bg-green-600")
        spanItem.classList.add("bg-red-500");
    }
});
