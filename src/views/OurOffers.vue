<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { useFetchOurOffers } from '../stores/fetchOurOffers';
import { computed, ref } from 'vue';
import axios from 'axios';
import { Toaster, toast } from 'vue-sonner';

const allOurOffers = useFetchOurOffers();
const offers = computed(() => allOurOffers.data);
const checked = ref(false);

const newOfferPrice = ref(null);
const newOfferDiscountValue = ref(null);
const newOfferTotalWithTax = ref(null);

const toggleOrder = () => {
    newOfferPrice.value = null;
    newOfferDiscountValue.value = null;
    newOfferTotalWithTax.value = null;
    checked.value = !checked.value;
};

function formatPrice(value) {
    return value.toFixed(2);
}

const selectedOffer = ref(null);
const showModal = ref(true);

const showModalFun = (offer) => {
    selectedOffer.value = offer;
    if (checked.value) {
        newOfferPrice.value = selectedOffer.value.total_before_discount * 2;
        newOfferDiscountValue.value = selectedOffer.value.discount_value * 2;
        newOfferTotalWithTax.value = selectedOffer.value.total_with_tax * 2;
    }
    const modal = document.getElementById('my_modal_2');
    modal.showModal();
};

const fullName = ref(null);
const gender = ref(null);
const nationalCardID = ref(null);
const purchase = async () => {
    const button = document.getElementById('purchase-btn');
    button.innerHTML = '<span class="loading loading-spinner loading-md"></span>';
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
        await axios.post('/order-checkout', {
            offerId: selectedOffer.value.id,
            quantity: checked.value ? 2 : 1,
            fullName: fullName.value,
            gender: gender.value,
            nationalCardID: nationalCardID.value,
        }).then((res) => {
            goToStripeCheckout(res.data.checkout_url)
        }).catch(async (err) => {
            toast.error(err.response.data.message);
            console.error('Error placing order:', err);
            showModal.value = false
            await new Promise(resolve => setTimeout(resolve, 500));
            showModal.value = true;
        });
    } catch (error) {
        toast.error(error);
        console.error('Unexpected error:', error);
    }
    button.innerHTML = 'Purchase'
};

const goToStripeCheckout = (checkoutUrl) => {
    window.location.href = checkoutUrl
}
</script>


<template>
    <div class="overflow-x-hidden">
        <Toaster richColors position="top-right" />
        <div class="bg-bgcolor h-fit dark:bg-darkmodebg">
            <Header />
        </div>

        <section class="py-24 px-5 bg-bgcolor h-fit dark:bg-darkmodebg flex justify-center">
            <div
                class="mx-auto mb-28 max-w-7xl px-4 sm:px-6 lg:px-8 w-[60%] max-[1024px]:w-full max-[1536px]:w-[90%] max-[1280px]:w-[90%]">
                <div class="mb-12">
                    <h2 class="text-5xl font-recursive text-center font-bold text-gray-900 mb-4 dark:text-gray-300">Our
                        Offers</h2>
                    <p class="text-gray-500 text-center leading-6 mb-9">Limited-time offer! Explore our services with no
                        obligations.</p>
                    <!--Switch-->
                    <div class="flex justify-center items-center">
                        <label class="min-w-[3.5rem] text-xl relative mr-4 font-medium"
                            :class="!checked ? 'text-gray-900 dark:text-gray-400' : 'text-gray-500 dark:text-gray-600'">Order
                            One</label>
                        <input type="checkbox" id="basic-with-description" @change="toggleOrder"
                            class="relative shrink-0 w-11 h-6 p-0.5 bg-indigo-100 checked:bg-none checked:bg-blue-100 rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:border-blue-600 appearance-none before:inline-block before:w-5 before:h-5 before:bg-primarycolor checked:before:bg-primarycolor before:translate-x-0 checked:before:translate-x-full before:shadow before:rounded-full before:transform before:transition before:ease-in-out before:duration-200" />
                        <label class="relative min-w-[3.5rem] font-medium text-xl text-gray-500 ml-4"
                            :class="checked ? 'text-gray-900 dark:text-gray-400' : 'text-gray-500 dark:text-gray-600'">
                            Order Two + 1 Free
                        </label>
                    </div>
                    <!--Switch End-->
                </div>

                <!--Grid-->
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch md:grid-cols-3 md:gap-8">
                    <!-- Pricing Card -->
                    <div v-for="offer in offers" :key="offer.id"
                        class="divide-y divide-gray-200 rounded-2xl bg-white dark:bg-slate-800 border dark:border-none border-gray-200 shadow-sm">
                        <div class="p-6 sm:px-8">
                            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-300">
                                {{ offer.name }}
                                <span class="sr-only">Plan</span>
                            </h2>

                            <p class="mt-2 text-gray-700 dark:text-gray-400">Lorem ipsum dolor sit amet consectetur
                                adipisicing elit.</p>

                            <p class="mt-2 sm:mt-4">
                                <strong class="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-gray-100">
                                    ${{ checked ? formatPrice(offer.total_with_tax * 2) : offer.total_with_tax }}
                                </strong>
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-400">
                                    / {{ checked ? 'two times + 1 free' : 'one time' }}
                                </span>
                            </p>

                            <button type="button" @click="showModalFun(offer)"
                                class="mt-4 block rounded border bg-primarycolor dark:hover:bg-slate-300 dark:bg-slate-500 dark:border-none dark:text-black px-12 py-3 text-center text-sm font-medium text-white hover:bg-transparent hover:text-primarycolor focus:outline-none focus:ring active:text-indigo-500 sm:mt-6">
                                Purchase Plan
                            </button>
                        </div>

                        <div class="p-6 sm:px-8">
                            <p class="text-lg font-medium text-gray-900 sm:text-xl dark:text-gray-300">What's included:
                            </p>

                            <ul class="mt-2 space-y-2 sm:mt-4">
                                <li v-for="service in offer.service_offer" :key="service.id"
                                    class="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="size-5 text-primarycolor">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span class="text-gray-700 dark:text-gray-400">{{ service.title }}</span>
                                </li>
                            </ul>

                            <div v-if="offer.discount_value > 0" class="flex items-center mt-2 text-sm text-red-500">
                                <span class="line-through text-gray-500 mr-2">
                                    ${{ checked ? formatPrice(offer.total_before_discount * 2) :
                                        offer.total_before_discount }}
                                </span>
                                <span>Discount: ${{ checked ? formatPrice(offer.discount_value * 2) :
                                    offer.discount_value }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--Grid End-->


                <div v-if="!offers" class="w-full flex justify-center">
                    <!-- component -->
                    <section class="w-full">
                        <div class="container px-6 py-10 mx-auto animate-pulse">
                            <div
                                class=" flex grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
                                <div class="w-full ">
                                    <div class="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600"></div>

                                    <h1 class="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></h1>
                                    <p class="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                                </div>

                                <div class="w-full ">
                                    <div class="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600"></div>

                                    <h1 class="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></h1>
                                    <p class="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                                </div>

                                <div class="w-full ">
                                    <div class="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600"></div>

                                    <h1 class="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></h1>
                                    <p class="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                                </div>


                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <dialog v-if="showModal" id="my_modal_2" class="modal">
                <div v-if="selectedOffer" class="modal-box bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Offer Details</h3>
                    </div>
                    <div class="modal-content px-6 py-4">
                        <div class="mb-4">
                            <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">Offer</h4>
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedOffer.name }}</p>
                                <p class="text-sm text-gray-800 dark:text-gray-200">${{ newOfferPrice ? newOfferPrice : selectedOffer.total_before_discount }}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">Services</h4>
                            <div v-if="selectedOffer" v-for="service in selectedOffer.service_offer" class="flex justify-between items-center mb-2">
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ service.title }}</p>
                                <p class="text-sm text-gray-800 dark:text-gray-200">${{ service.price }}{{ checked ? ' x 2' : '' }}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">Discount</h4>
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Discount Amount</p>
                                <p class="text-sm text-gray-800 dark:text-gray-200">${{ newOfferDiscountValue ? newOfferDiscountValue : selectedOffer.discount_value }}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">Taxes</h4>
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Tax Value</p>
                                <p class="text-sm text-gray-800 dark:text-gray-200">%{{ selectedOffer.tax_rate }}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">Total</h4>
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Total Price</p>
                                <p class="text-sm text-gray-800 dark:text-gray-200">${{ newOfferTotalWithTax ? newOfferTotalWithTax : selectedOffer.total_with_tax }}</p>
                            </div>
                        </div>
                        <div class="mb-4">
                            <h4 class="text-md font-bold text-gray-800 dark:text-gray-200 mb-2">Your Information</h4>
                            <div class="mb-2">
                                <label for="full-name" class="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                                <input type="text" id="full-name" v-model="fullName"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-gray-200"
                                    placeholder="Enter your full name" required>
                            </div>
                            <div class="mb-2">
                                <label for="gender" class="text-sm text-gray-600 dark:text-gray-400 mb-1">Gender</label>
                                <select id="gender" v-model="gender"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-gray-200"
                                    required>
                                    <option value="" class="dark:text-gray-200">Select gender</option>
                                    <option value="male" class="dark:text-gray-200">Male</option>
                                    <option value="female" class="dark:text-gray-200">Female</option>
                                    <option value="other" class="dark:text-gray-200">Other</option>
                                </select>
                            </div>
                            <div class="mb-2">
                                <label for="national-id" class="text-sm text-gray-600 dark:text-gray-400 mb-1">National ID</label>
                                <input type="text" id="national-id" v-model="nationalCardID"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:border-blue-500 dark:bg-slate-700 dark:text-gray-200"
                                    placeholder="Enter your national ID" required>
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button @click="purchase" id="purchase-btn"
                                class="bg-blue-500 text-white px-4 h-12 w-32 py-2 rounded-md hover:bg-blue-600">
                                <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                </svg>
                                Purchase
                            </button>
                        </div>
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button class="close-modal">close</button>
                </form>
</dialog>

        </section>

        <Footer />
    </div>
</template>
