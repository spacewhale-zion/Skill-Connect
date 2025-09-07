import admin from 'firebase-admin';
import { createRequire } from 'module';


// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
const require = createRequire(import.meta.url);
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log(serviceAccount)

const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK Initialized.');
  } catch (error) {
    console.error(`🔥 Firebase Admin SDK Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

export default initializeFirebase;