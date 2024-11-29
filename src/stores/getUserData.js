import { defineStore } from 'pinia';
import axios from 'axios';

export const useGetUserData = defineStore({
  id: 'getUserData',
  state: () => ({
    name: '',
    email: '',
    photo: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    isAdmin: false,
    isNurse: false,
    isDoctor: false,
    isPharmacist: false,
    isLaboratorist: false,
    isPatient: false,
    refreachComponent: false

  }),
  getters: {

  },
  actions: {

    async getPhoto() {
      const cachedPhoto = localStorage.getItem('photo');
      if (cachedPhoto) {
        this.photo = JSON.parse(cachedPhoto);
        
        return this.photo;
      }

      const photoResponse = await axios.get('/get-user-photo');
      const photoUrl = photoResponse.data.photo_url;
      localStorage.setItem('photo', JSON.stringify(photoUrl));

      this.photo = photoUrl;
      return this.photo;
    },


    async getData() {
      try {
        const [userResponse, photoResponse] = await Promise.all([
          axios.get('/get-user-data'),
          axios.get('/get-user-photo')
        ]);

        const userData = userResponse.data;
        const photoUrl = photoResponse.data.photo_url;

        this.name = userData.name;
        this.email = userData.email;
        this.website = userData.website;
        this.facebook = userData.facebook;
        this.instagram = userData.instagram;
        this.twitter = userData.twitter;
        this.photo = photoUrl;

        // Set user role
        if (userData.is_admin) {
          this.isAdmin = true;
        } else if (userData.is_doctor) {
          this.isDoctor = true;
        } else if (userData.is_nurse) {
          this.isNurse = true;
        } else if (userData.is_pharmacist) {
          this.isPharmacist = true;
        } else if (userData.is_laboratorist) {
          this.isLaboratorist = true;
        } else {
          this.isPatient = true;
        }

        const userProfile = {
          name: this.name,
          email: this.email,
          website: this.website,
          facebook: this.facebook,
          instagram: this.instagram,
          twitter: this.twitter,
          is_admin: this.isAdmin,
          is_nurse: this.isNurse,
          is_pharmacist: this.isPharmacist,
          is_doctor: this.isDoctor,
          is_laboratorist: this.isLaboratorist,
          photo_url: photoUrl
        };

        return userProfile;

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }


    // async getData() {
    //   try {
    //     const cachedUserProfile = localStorage.getItem('userProfile');
    //     if (cachedUserProfile) {
    //       const userProfile = JSON.parse(cachedUserProfile);
    //       this.name = userProfile.name;
    //       this.email = userProfile.email;
    //       this.website = userProfile.website;
    //       this.facebook = userProfile.facebook;
    //       this.instagram = userProfile.instagram;
    //       this.twitter = userProfile.twitter;
    //       this.photo = userProfile.photo_url;
    //       this.isAdmin = userProfile.is_admin
    //       this.isNurse = userProfile.is_nurse
    //       this.isDoctor = userProfile.is_doctor
    //       this.isPharmacist = userProfile.is_pharmacist
    //       this.isLaboratorist = userProfile.is_laboratorist

    //     } else {
    //       const response = await axios.get('/get-user-data');
    //       this.name = response.data.name;
    //       this.email = response.data.email;
    //       this.website = response.data.website;
    //       this.facebook = response.data.facebook;
    //       this.instagram = response.data.instagram;
    //       this.twitter = response.data.twitter;
    //       if (response.data.is_admin) {
    //         this.isAdmin = true
    //       }
    //       else if (response.data.is_doctor) {
    //         this.isDoctor = true
    //       }
    //       else if (response.data.is_nurse) {
    //         this.isNurse = true
    //       }
    //       else if (response.data.is_pharmacist) {
    //         this.isPharmacist = true
    //       }
    //       else if (response.data.is_laboratorist) {
    //         this.isLaboratorist = true
    //       }
    //       else {
    //         this.isPatient = true
    //       }

    //       const photoResponse = await axios.get('/get-user-photo');
    //       const photoUrl = photoResponse.data.photo_url;
    //       this.photo = photoResponse.data.photo_url

    //       const userProfile = {
    //         name: this.name,
    //         email: this.email,
    //         website: this.website,
    //         facebook: this.facebook,
    //         instagram: this.instagram,
    //         twitter: this.twitter,
    //         is_admin: this.isAdmin,
    //         is_nurse: this.isNurse,
    //         is_pharmacist: this.isPharmacist,
    //         is_doctor: this.isDoctor,
    //         is_laboratorist: this.isLaboratorist,
    //         photo_url: photoUrl
    //       };

    //       localStorage.setItem('userProfile', JSON.stringify(userProfile));
    //     }
    //   } catch (error) {
    //     console.error('Error fetching user data:', error);
    //   }
    // }
  }


})

