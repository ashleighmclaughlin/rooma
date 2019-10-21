let screens = $('.screen'),
    nightScreen = $('#nights'),
    guestScreen = $('#guests'),
    accomScreen = $("#accomOptions"),
    rightnightsArrow = $('.nights-arrow'),
    leftNightsArrow = $(".nights-arrow-left"),
    accomArrow = $(".accom-arrow"),
    guestsArrow = $('.guests-arrow'),
    categoryListEl = $(".category-list"),
    container = $('.macy-container'),
    guestInputEl = $("#guestInput"),
    nightInputEl = $("#nightInput");

let accomData,
    categoryData,
    categoryAll,
    filteredAccommodation,
    accomOption,
    noOfNightsEl,
    noOfGuestsEl;


function init() {
    //Get Accommodation 
    $.getJSON('json/accommodation.json', function (accommodation) {
        accomData = accommodation;
        displayAccom(accomData.accommodation);
    });

    //Get categories
    $.getJSON('json/categories.json', function (categories) {
        categoryData = categories;
        displayCategories(categoryData.categories);
    });

    //Change Screens
    rightnightsArrow.on('click', function () {
        displayNightChoice();
        noOfNightsEl = $("#noOfNights");
        noOfGuestsEl = $(".chosen-guest-btn")
    })
    accomArrow.on('click', function () {
        //Changes Screen
        displayFilteredAccommodation();
        //Displays inputs in nav
        displayAccommodationChoices();
        //Displays filtered accommodation based on inputs
        filterAccommodation();

    })
    guestsArrow.on('click', function () {
        displayGuestChoice();
    })
    leftNightsArrow.on('click', function () {
        displayNightChoice();
    })
}


function displayAccom(accommodation) {
    let htmlString = '';
    $.each(accommodation, function (i, accomOption) {
        //WORKAROUND
        //I wanted to input this html content through a function, however this did not display
        //the images as it took out the slashes, so I found that this way resolved the issue.
        htmlString += `<div class="child-element inline" data-id="${accomOption.id}">` +
            `<img class="modal-image" src="${accomOption.mainImg}">` +
            `<h3>${accomOption.title}</h3>` +
            `<p>$${accomOption.price} per night</p>` +
            '</div>'
    });
    container.html(htmlString);

    //Set childEl after htmlString has been put in 
    let childEl = $(".child-element");

    //Macy Plug In 
    //https://github.com/bigbitecreative/macy.js
    Macy({
        container: '.macy-container',
        trueOrder: false,
        waitForImages: false,
        margin: 27,
        columns: 4,
        breakAt: {
            1200: 5,
            940: 3,
            520: 1,
            400: 1
        }
    });

    childEl.on('click', function () {
        let id = $(this).data("id");
        accomOption = accomData.accommodation[id];
    })

    //Modaal Plug In 
    //https://github.com/humaan/Modaal
    $('.inline').modaal({
        content_source: '#inline',
        before_open: function () {
            let modalContent = $(".modal-content");
            //Set display to nothing as it is slow to load and would show the previous acommodation which is not ideal.
            modalContent.hide()
        },
        after_open: function () {
            setTimeout(function () {
                //Set modal elements here as it can not pick it up before the modal has loaded
                let mainImg = $(".main-img"),
                    secondaryImg = $(".secondary-img"),
                    title = $(".title"),
                    description = $(".description"),
                    modalBtn = $(".modal-btn"),
                    pricePerNight = $(".price-per-night"),
                    rating = $(".rating"),
                    deal = $(".deal");
                if (accomOption) {
                    mainImg.attr('src', accomOption.mainImg);
                    secondaryImg.attr('src', accomOption.secondaryImg);
                    title.html(accomOption.title);
                    description.html(accomOption.description);
                    modalBtn.attr('href', accomOption.sourceLink);
                    pricePerNight.html(accomOption.price);
                    rating.html(accomOption.rating);
                    deal.html(accomOption.deal)
                }
                let modalContent = $(".modal-content");
                //Displays content again once everything is in
                modalContent.show()
            }, 10)
        }
    });

    //Adds active class to buttons on guest input screen
    let guestBtn = $(".guest-btn");
    guestBtn.on('click', function () {
        if (guestBtn.hasClass("chosen-guest-btn")) {
            guestBtn.removeClass("chosen-guest-btn");
        }
        $(this).addClass("chosen-guest-btn");
    })
}


//Display list of categories
function displayCategories(categories) {
    let htmlString = '';

    //Creates an 'All' category option
    htmlString = htmlString + `<li class="category-all">All</li>`;
    $.each(categories, function (i, category) {
        htmlString = htmlString + getCategoryItemHTML(category);
    });
    categoryListEl.html(htmlString);
    categoryAll = $(".category-all");
    categoryAll.on('click', function () {
        displayAccom(filteredAccommodation);
    });

    //Filter accommodation by category
    let categoryItems = $(".category-item");
    categoryItems.on('click', function () {
        let categoryid = $(this).data('categoryid');
        let filteredAccomByCategory = filterByCategory(filteredAccommodation, categoryid);
        displayAccom(filteredAccomByCategory);
    });
}


//Sets HTML for category options
function getCategoryItemHTML(category) {
    return `<li data-categoryid="${category.id}" class="category-item">
                ${category.title}
            </li>`;
}


//Displays guest and night input in the nav bar
function displayAccommodationChoices() {
    let guestInput = noOfGuestsEl.text();
    let nightInput = noOfNightsEl.val();
    guestInputEl.html(guestInput);
    nightInputEl.html(nightInput);
}


//Filter accommmodation by category
function filterByCategory(accommodation, categoryId) {
    return accommodation.filter(function (accomOption) {
        return accomOption.categoryId == categoryId;
    });
}

//Filter accommodation by guests
//Only displays if guest input is less than or equal to the max guests value
function filterByGuests(accommodation, guests) {
    return filteredAccommodation = accommodation.filter(function (accomOption) {
        return accomOption.guests >= guests;
    })
}

//Filter accommodation by nights
//Only displays if nights input is greater than or equal to min nights, and less than or equal to max nights
function filterByNights(accommodation, nights) {
    return filteredAccommodation = accommodation.filter(function (accomOption) {
        return accomOption.minNights <= nights && accomOption.maxNights >= nights;
    })
}

//Filters accommodation by guests and nights
function filterAccommodation() {
    let guests = noOfGuestsEl.text();
    let nights = noOfNightsEl.val();
    let filteredAccommodation = filterByGuests(accomData.accommodation, guests);
    filteredAccommodation = filterByNights(filteredAccommodation, nights);
    displayAccom(filteredAccommodation);
}


//Change Screens
//Guests to Nights 
function displayNightChoice() {
    screens.removeClass('active');
    nightScreen.addClass('active');
}
//Nights to Guests
function displayGuestChoice() {
    screens.removeClass('active');
    guestScreen.addClass('active');
}
//Nights to Accommodation
function displayFilteredAccommodation() {
    screens.removeClass('active');
    accomScreen.addClass('active');
}


init();


//Sean Bellows Vue Number Input sourced from Codepen
//https://codepen.io/sebellows/details/jLQpZe
//Creates interactive nights input on second screen
Vue.component('number-control', {
    template: `<div class="control number">
        <button class="decrement-button" :disabled="decrementDisabled" @click="decrement">−</button>
        <button class="increment-button" :disabled="incrementDisabled" @click="increment">+</button>
        <input
            type="number"
            id="noOfNights"
            readonly
            :disabled="inputDisabled"
            :min="min"
            :max="max"
            :step="step"
            v-model.number="currentValue"
            @blur="currentValue = value"
            @keydown.esc="currentValue = value"
            @keydown.enter="currentValue = value"
            @keydown.up.prevent="increment"
            @keydown.down.prevent="decrement"
        />
    </div>`,

    props: {
        disabled: Boolean,
        max: {
            type: Number,
            default: Infinity
        },
        min: {
            type: Number,
            default: -Infinity
        },
        value: {
            required: true
        },
        step: {
            type: Number,
            default: 1
        }
    },

    data() {
        return {
            currentValue: this.value,
            decrementDisabled: false,
            incrementDisabled: false,
            inputDisabled: false,
        }
    },

    watch: {
        value(val) {
            this.currentValue = val
        }
    },

    methods: {
        increment() {
            if (this.disabled || this.incrementDisabled) {
                return
            }

            let newVal = this.currentValue + 1 * this.step
            this.decrementDisabled = false

            this._updateValue(newVal)
        },
        decrement() {
            if (this.disabled || this.decrementDisabled) {
                return
            }

            let newVal = this.currentValue + -1 * this.step
            this.incrementDisabled = false

            this._updateValue(newVal)
        },
        _updateValue(newVal) {
            const oldVal = this.currentValue

            if (oldVal === newVal || typeof this.value !== 'number') {
                return
            }
            if (newVal <= this.min) {
                newVal = this.min
                this.decrementDisabled = true
            }
            if (newVal >= this.max) {
                newVal = this.max
                this.incrementDisabled = true
            }
            this.currentValue = newVal
            this.$emit('input', this.currentValue)
        }
    },

    mounted() {
        if (this.value == this.min) {
            this.decrementDisabled = true
        }
    }
})

const app = new Vue({
    el: '#app',
    data() {
        return {
            sheepCount: 1
        }
    }
})