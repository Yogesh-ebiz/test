import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
const serviceAccount = require('./accessed-talent-c0bc1-firebase-adminsdk-c72qz-84583ded4e.json');


const app = initializeApp({
  apiKey: "AIzaSyCs4fNNpj-0Nyv2rn3cPLOmTwN2IaPchVk",
  authDomain: "accessed-talent-c0bc1.firebaseapp.com",
  databaseURL: "https://accessed-talent-c0bc1-default-rtdb.firebaseio.com",
  projectId: "accessed-talent-c0bc1",
  storageBucket: "accessed-talent-c0bc1.appspot.com",
  messagingSenderId: "1056751241792",
  appId: "1:1056751241792:web:13788a5cde4e6dcab2eda5",
  measurementId: "G-ZSXDMM2RV5"
});
const functions = getFunctions(app);





export { functions };
