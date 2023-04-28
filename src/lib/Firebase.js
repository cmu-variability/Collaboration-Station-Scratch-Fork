// // Import the functions you need from the SDKs you need
import { getStorage, ref, getDownloadURL} from "firebase/storage";
const { initializeApp, applicationDefault, cert } = require('firebase/app');
const { getFirestore, Timestamp, FieldValue, doc, setDoc } = require('firebase/firestore');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Add in config from Collaboration Station Repository
const firebaseConfig = {

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore();

const storage = getStorage(app);


export default function Load(callback, path)
{
    const pathReference = ref(storage, path);
    getDownloadURL(pathReference)
  .then((url) => {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = (event) => {
      const blob = xhr.response;
      callback(blob);
    };
    xhr.open('GET', url);
    xhr.send();
    
  })
  .catch((error) => {
    // Handle any errors
  });



      
}

  
  