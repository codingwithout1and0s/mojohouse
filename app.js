//variables
const cartBtn = document.querySelector('.cart-btn'),
    closeCartBtn = document.querySelector('.close-cart'),
    clearCartBtn = document.querySelector('.clear-cart'),
    cartDOM = document.querySelector('.cart'),
    cartOverlay = document.querySelector('.cart-overlay'),
    cartItems = document.querySelector('.cart-items'),
    cartTotal = document.querySelector('.cart-total'),
    cartContent = document.querySelector('.cart-content'),
    productsDOM = document.querySelector('.products-center'),
    navIcon = document.querySelector('.nav-icon'),
    hamburger = document.getElementById('hamburger');


//Hamburger
navIcon.addEventListener('click', () => {
    if (hamburger.style.display === "block") {
        hamburger.style.display = "none";
    } else {
        hamburger.style.display = "block";
    }
});

//Main cart
let cart = []

//Buttons
let buttonsDOM = []

//Getting Products
class Products {
    async getProducts(){
        try {
            let result = await fetch('products.json')
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const {title,price} = item.fields,
                    {id} = item.sys,
                    image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}

//Display Products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
                <article class="product">
                    <div class="img-container">
                        <img src=${product.image}
                        alt=${product.title}
                        class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>`;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
       const addToCart = [...document.querySelectorAll('.bag-btn')];
       buttonsDOM = addToCart;
       addToCart.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                //Get Product from Products
                let cartItem = {...Storage.getProduct(id), amount:1};

                //Add Product to the cart
                cart = [...cart, cartItem];

                //Save Cart in LocalStorage
                Storage.saveCart(cart);

                //Set Cart Values
                this.setCartValues(cart);

                //Display Cart Items
                this.addCartItem(cartItem);

                //Show the Cart
                this.showCart();
            });
       });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt=${item.title}>
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener ('click', this.hideCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
          this.clearCart();
        });
        
        cartContent.addEventListener("click", event => {
          if (event.target.classList.contains("remove-item")) {
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            cart = cart.filter(item => item.id !== id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            cartContent.removeChild(removeItem.parentElement.parentElement);
            const buttons = [...document.querySelectorAll(".bag-btn")];
            buttons.forEach(button => {
              if (parseInt(button.dataset.id) === id) {
                button.disabled = false;
                button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
              }
            });
          } else if (event.target.classList.contains("fa-chevron-up")) {
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1;
            Storage.saveCart(cart);
            this.setCartValues(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;
          } else if (event.target.classList.contains("fa-chevron-down")) {
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;
            if (tempItem.amount > 0) {
              Storage.saveCart(cart);
              this.setCartValues(cart);
              lowerAmount.previousElementSibling.innerText = tempItem.amount;
            } else {
              cart = cart.filter(item => item.id !== id);
              this.setCartValues(cart);
              Storage.saveCart(cart);
              cartContent.removeChild(lowerAmount.parentElement.parentElement);
              const buttons = [...document.querySelectorAll(".bag-btn")];
              buttons.forEach(button => {
                if (parseInt(button.dataset.id) === id) {
                  button.disabled = false;
                  button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
                }
              });
            }
          }
        });
      }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        console.log(cartItems);
        cartItems.forEach(id => this.removeItems(id));
        while(cartContent.children.length>0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItems(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to Cart`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener('DOMContentLoaded', () => {

    //Hamburger is invisible when site loads
    hamburger.style.display = "none";

    const ui = new UI();
    const products = new Products();

    //Setup APP
    ui.setupAPP();

    //Get ALL Products
    products.getProducts().then(products => {
        ui.displayProducts(products)

    //Storing cart in localStorage
    Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});