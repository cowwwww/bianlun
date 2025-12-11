const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json'); // You'll need to download this
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'tournamentweb-fedee'
});

const auth = admin.auth();
const db = admin.firestore();

async function deleteAllUsers() {
  try {
    console.log('Starting to delete all users...');
    
    // List all users
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;
    
    console.log(`Found ${users.length} users to delete`);
    
    // Delete users in batches
    const deletePromises = users.map(user => {
      console.log(`Deleting user: ${user.uid} (${user.email})`);
      return auth.deleteUser(user.uid);
    });
    
    await Promise.all(deletePromises);
    console.log('All users deleted from Authentication');
    
    // Also delete user documents from Firestore
    const usersCollection = db.collection('users');
    const userDocs = await usersCollection.get();
    
    const deleteDocPromises = userDocs.docs.map(doc => {
      console.log(`Deleting user document: ${doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(deleteDocPromises);
    console.log('All user documents deleted from Firestore');
    
    // Delete subscriptions
    const subscriptionsCollection = db.collection('subscriptions');
    const subscriptionDocs = await subscriptionsCollection.get();
    
    const deleteSubPromises = subscriptionDocs.docs.map(doc => {
      console.log(`Deleting subscription: ${doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(deleteSubPromises);
    console.log('All subscriptions deleted');
    
    console.log('✅ All users and related data deleted successfully!');
    
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllUsers(); 