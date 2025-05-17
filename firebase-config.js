// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
  
  apiKey: "AIzaSyAF7mFmoQthlnZEfwVsE0DZhfxrvySF8Ng",
  authDomain: "teste-qr-1.firebaseapp.com",
  projectId: "teste-qr-1",
  storageBucket: "teste-qr-1.firebasestorage.app",
  messagingSenderId: "384207732117",
  appId: "1:384207732117:web:68716df41bb085369f8a9c"
  };
  
  // Inicializa o Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();