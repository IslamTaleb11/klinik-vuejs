<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue-sonner';
import { useBackendUrl } from '../stores/backendUrl';

const backend = useBackendUrl()
const route = useRoute()

const name = route.meta.requiresName
const email = route.meta.requiresEmail
const photo = ref('')
photo.value = route.meta.requiresPhoto
const website = route.meta.requiresWebsite
const facebook = route.meta.requiresFacebook
const instagram = route.meta.requiresInstagram
const twitter = route.meta.requiresTwitter
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const newName = ref('')
const newEmail = ref('')
const newWebsite = ref('')
const newInstagram = ref('')
const newTwitter = ref('')
const newFacebook = ref('')
const admin = route.meta.requiresIsAdmin
const nurse = route.meta.requiresIsNurse
const doctor = route.meta.requiresIsDoctor
const laboratorist = route.meta.requiresIsLaboratorist
const pharmacist = route.meta.requiresIsPharmacist

onMounted(() => {
    newName.value = name
    newEmail.value = email
    newWebsite.value = website
    newInstagram.value = instagram
    newTwitter.value = twitter
    newFacebook.value = facebook
})





const updatePassword = async () => {
    try {
        await axios.post('/update-password', {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
            confirmPassword: confirmPassword.value,
        }).then((response) => {
            toast.success(response.data.message);
            
        }).catch((error) => {
            console.log('Error response:', error.response);
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        });
    } catch (error) {
        toast.error('An error occurred. Please try again later.');
    }
}

const updateName = async () => {
    try {
        await axios.post('/update-name', {
            name: newName.value
        }).then((response) => {
            toast.success(response.data.message);
            localStorage.removeItem('userProfile')
        }).catch((error) => {
            console.log('Error response:', error.response);
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        });
    } catch (error) {
        toast.error('An error occurred. Please try again later.');
    }
}


const updateEmail = async () => {
    try {
        await axios.post('/update-email', {
            email: newEmail.value
        }).then((response) => {
            toast.success(response.data.message);
            localStorage.removeItem('userProfile')
        }).catch((error) => {
            console.log('Error response:', error.response);
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        });
    } catch (error) {
        toast.error('An error occurred. Please try again later.');
    }
}


const updateSocialLinks = async () => {
    try {
        await axios.post('/update-social-links', {
            website: newWebsite.value,
            instagram: newInstagram.value,
            twitter: newTwitter.value,
            facebook: newFacebook.value,
        }).then((response) => {
            toast.success(response.data.message);
            localStorage.removeItem('userProfile')
        }).catch((error) => {
            console.log('Error response:', error.response);
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred. Please try again later.');
            }
        });
    } catch (error) {
        toast.error('An error occurred. Please try again later.');
    }
}

const selectedFile = ref(null);
const uploadedImagePath = ref('');

const imageSelected = ref(false)
const onFileChange = (event) => {
    selectedFile.value = event.target.files[0];
    imageSelected.value = true
};

const uploadImage = async () => {
  if (!selectedFile.value) {
    toast.error('Please select an image file!');
    return;
  }
  imageSelected.value = false;
  const formData = new FormData();
  formData.append('image', selectedFile.value);

  try {
    const response = await axios.post('/update-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    uploadedImagePath.value = response.data.path;
    toast.success(response.data.success);

    const photoResponse = await axios.get('/get-user-photo');
    photo.value = photoResponse.data.photo_url;

    localStorage.removeItem('userProfile')
    localStorage.removeItem('photo')

  } catch (error) {
    console.error('An error occurred:', error);
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(error.response.data.error);
    } else if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred. Please try again later.');
    }
  }
};


</script>

<template>
    <Header />
    <div class="flex justify-center dark:bg-darkmodebg p-4 sm:p-8 md:p-12 lg:p-16">
        <div class="w-[60%] max-[1024px]:w-[80%] max-[1536px]:w-[90%]">
            <div
                class="w-full h-fit mt-8 bg-white dark:bg-darkmodebg rounded-lg mx-auto flex flex-col md:flex-row overflow-hidden rounded-b-none">
                <div class="w-full md:w-1/3 bg-gray-100 dark:bg-darkmodebg shadow-lg p-8 flex items-center flex-col">
                    <!-- <h2 class="font-medium text-md text-gray-700 mb-4 tracking-wide dark:text-white">Profile Info</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Update your basic profile information such as Email Address, Name, and Image.</p>
                     -->
                    <div class="rounded-full w-28 h-28 border border-white">
                        <img v-if="!photo" src="/src/assets/images/unkown-profile-pic.png"
                            class="w-28 h-28 rounded-full" alt="">
                        <img v-else :src="backend.backendUrl + photo" class="w-28 h-28 rounded-full" alt="">
                    </div>
                    <div class="text-center mt-5 font-recursive">
                        <h2 v-if="newName" class="dark:text-white">{{ newName }}</h2>
                        <h2 v-else class="dark:text-white">{{ name }}</h2>
                        <div>
                            <h3 v-if="admin" class="dark:text-gray-300">Admin</h3>
                            <h3 v-else-if="nurse" class="dark:text-gray-300">Nurse</h3>
                            <h3 v-else-if="doctor" class="dark:text-gray-300">Doctor</h3>
                            <h3 v-else-if="pharmacist" class="dark:text-gray-300">Pharmacist</h3>
                            <h3 v-else-if="laboratorist" class="dark:text-gray-300">Laboratorist</h3>
                            <h3 v-else class="dark:text-gray-300">Patient</h3>
                        </div>
                        
                    </div>
                    <hr>
                    <!-- <div class="self-start mt-10 font-recursive ">
                        <span class="flex items-center mb-2 gap-3">
                            <img src="/src/assets/images/calendar-icon.png" class="h-8 w-8" alt="">My Appointments
                        </span>
                        <span class="flex items-center mb-2 gap-3">
                            <img src="/src/assets/images/delete-profile-icon.png" class="h-8 w-8" alt="">Delete Profile
                        </span>
                        <span class="flex items-center gap-3">
                            <img src="/src/assets/images/logout-icon.png" class="h-8 w-8" alt="">Logout
                        </span>
                    </div> -->


                </div>
                <div class="w-full md:w-2/3 flex flex-col">
                    <div class="py-8 px-4 sm:px-8 md:px-16">
                        <h1 class="font-recursive text-2xl dark:text-white">Update Your Name</h1>
                        <p v-if="newName" class="dark:text-white font-recursive text-sm mb-3">Your current name is {{
                            newName }}</p>
                        <p v-else class="dark:text-white font-recursive text-sm mb-3">Your current name is {{ name }}
                        </p>

                        <label for="name" class="text-sm text-gray-600 dark:text-gray-300">Your new name</label>
                        <input
                            class="mt-2 border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                            type="text" name="name" v-model="newName">
                        <button @click="updateName" class="mt-4 px-4 py-2 bg-primarycolor text-white rounded-lg">Update
                            Name</button>
                    </div>
                    <hr class="border-gray-200">
                    <div class="py-8 px-4 sm:px-8 md:px-16">
                        <h1 class="font-recursive text-2xl dark:text-white">Update Your Email Address</h1>
                        <p v-if="newEmail" class="dark:text-white font-recursive text-sm mb-3">Your current email is {{
                            newEmail }}
                        </p>
                        <p v-else class="dark:text-white font-recursive text-sm mb-3">Your current email is {{ email
                            }}
                        </p>
                        <label for="email" class="text-sm text-gray-600 dark:text-gray-300">Your new email
                            address</label>
                        <input v-model="newEmail"
                            class="mt-2 border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                            type="email" name="email" value="">
                        <button @click="updateEmail" class="mt-4 px-4 py-2 bg-primarycolor text-white rounded-lg">Update
                            Email
                            Address</button>
                    </div>
                    <hr class="border-gray-200">
                    <div class="py-8 px-4 sm:px-8 md:px-16">
                        <label for="photo" class="text-sm text-gray-600 w-full block dark:text-gray-300">Photo</label>
                        <img v-if="!photo" class="rounded-full w-16 h-16 border-4 mt-2 border-gray-200" id="photo"
                            src="/src/assets/images/unkown-profile-pic.png" alt="photo">

                        <!-- change the app url to your application url -->
                        <img v-else :src="'http://localhost:8000' + photo" alt=""
                            class="rounded-full w-16 h-16 border-4 mt-2 border-gray-200" id="photo">
                        <p v-if="imageSelected" class="text-green-600">You have selected a file.</p>
                        <div
                            class="bg-gray-200 text-gray-500 text-xs mt-5 ml-3 font-bold px-4 py-2 rounded-lg hover:bg-gray-300 hover:text-gray-600 relative overflow-hidden cursor-pointer inline-block">
                            <input type="file" name="photo" @change="onFileChange"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"> Change Photo
                        </div><br>
                        <button @click="uploadImage" class="mt-4 px-4 py-2 bg-primarycolor text-white rounded-lg">Update
                            Photo</button>

                    </div>
                    <hr class="border-gray-200">
                    <div class="py-8 px-4 sm:px-8 md:px-16">
                        <h1 class="font-recursive text-2xl dark:text-white">Update Password</h1>
                        <label for="current-password" class="text-sm text-gray-600 dark:text-gray-300">Current
                            password</label>
                        <input v-model="currentPassword"
                            class="mt-2 border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                            type="password" placeholder="Current password">
                        <label for="new-password" class="text-sm text-gray-600 dark:text-gray-300 mt-4">New
                            password</label>
                        <input v-model="newPassword"
                            class="mt-2 border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                            type="password" placeholder="New password">
                        <label for="confirm-password" class="text-sm text-gray-600 dark:text-gray-300 mt-4">Confirm new
                            password</label>
                        <input v-model="confirmPassword"
                            class="mt-2 border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                            type="password" placeholder="Confirm new password">
                        <button @click="updatePassword"
                            class="mt-4 px-4 py-2 bg-primarycolor text-white rounded-lg">Update Password</button>
                    </div>
                    <hr class="border-gray-200">
                    <div class="py-8 px-4 sm:px-8 md:px-16">
                        <h1 class="font-recursive text-2xl dark:text-white">Add Social Links</h1>
                        <label for="website" class="text-sm text-gray-600 dark:text-gray-300">Website</label>
                        <div class="flex items-center mt-2">
                            <i class="fas fa-globe text-gray-600 mr-2"></i>
                            <input id="website" v-model="newWebsite"
                                class="border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                                type="url" placeholder="eg, https://example.com">
                        </div>
                        <label for="facebook" class="text-sm text-gray-600 dark:text-gray-300 mt-4">Facebook</label>
                        <div class="flex items-center mt-2">
                            <i class="fab fa-facebook text-blue-600 mr-2"></i>
                            <input id="facebook" v-model="newFacebook"
                                class="border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                                type="url" placeholder="eg, https://facebook.com/username">
                        </div>
                        <label for="twitter" class="text-sm text-gray-600 dark:text-gray-300 mt-4">Twitter</label>
                        <div class="flex items-center mt-2">
                            <i class="fab fa-twitter text-blue-400 mr-2"></i>
                            <input id="twitter" v-model="newTwitter"
                                class="border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                                type="url" placeholder="eg, https://twitter.com/username">
                        </div>
                        <label for="instagram" class="text-sm text-gray-600 dark:text-gray-300 mt-4">Instagram</label>
                        <div class="flex items-center mt-2">
                            <i class="fab fa-instagram text-pink-500 mr-2"></i>
                            <input id="instagram" v-model="newInstagram"
                                class="border-2 dark:bg-slate-600 dark:text-gray-300 border-none border-gray-200 px-3 py-2 block w-full rounded-lg text-base text-gray-900 focus:outline-none focus:border-primarycolor"
                                type="url" placeholder="eg, https://instagram.com/username">
                        </div>
                        <button @click="updateSocialLinks"
                            class="mt-4 px-4 py-2 bg-primarycolor text-white rounded-lg">Update Social
                            Links</button>
                    </div>
                    
                </div>
                
            </div>
            
        </div>
    </div>
    <Footer />
</template>
