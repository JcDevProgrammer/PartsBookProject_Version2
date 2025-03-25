import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-y7cHfAcxRTukfl_1QNud7xHLpu4XU-U",
  authDomain: "fir-domanapp-719a0.firebaseapp.com",
  projectId: "fir-domanapp-719a0",
  storageBucket: "fir-domanapp-719a0.appspot.com",
  messagingSenderId: "445522928682",
  appId: "1:445522928682:web:feacbbcb3e6dd606714f53",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export { app };
