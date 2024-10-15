// const admin = require('firebase-admin');
const firebase = require('@firebase/app');
const serviceAccount = require('./accessed-talent-c0bc1-firebase-adminsdk-c72qz-84583ded4e.json');
// const firebaseConfig = require('./firebaseConfig.json');
// import 'firebase/firestore';
const { getFunctions, httpsCallable } = require('@firebase/functions');

// const functions = getFunctions();

class FirebaseApp {
  constructor() {
    if (this.instance) return this.instance; // This is the key idea of implementing singleton. Return the same instance (i.e. the one that has already been created before)

    // We only proceedd to the following lines only if no instance has been created from this class
    FirebaseApp.instance = this;

    const admin = require("firebase-admin"); // To access Firestore API
    // require('@firebase/functions');

    // Since the functions and firestore run on the same server,
    //  we can simply use default credential.
    // However, if your app run different location, you need to create a JSON Firebase credentials

    admin.initializeApp(serviceAccount);
    firebase.initializeApp({
      apiKey: "AIzaSyCs4fNNpj-0Nyv2rn3cPLOmTwN2IaPchVk",
      authDomain: "accessed-talent-c0bc1.firebaseapp.com",
      databaseURL: "https://accessed-talent-c0bc1-default-rtdb.firebaseio.com",
      projectId: "accessed-talent-c0bc1",
      storageBucket: "accessed-talent-c0bc1.appspot.com",
      messagingSenderId: "1056751241792",
      appId: "1:1056751241792:web:13788a5cde4e6dcab2eda5",
      measurementId: "G-ZSXDMM2RV5"
    });


    this.firestore = admin.firestore();
    this.functions = getFunctions();
  }

}

module.exports = new FirebaseApp();


