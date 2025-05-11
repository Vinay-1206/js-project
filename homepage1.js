import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, getDoc, doc, collection, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC3EhUGavODR6SdTozhA4YJqb1xqloDZlA",
    authDomain: "login-sign-f1555.firebaseapp.com",
    projectId: "login-sign-f1555",
    storageBucket: "login-sign-f1555.firebasestorage.app",
    messagingSenderId: "713788420417",
    appId: "1:713788420417:web:af5315675d3e2f4d3831c0"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        const loggedInUserId = user.uid;
        localStorage.setItem("loggedInUserId", loggedInUserId);
        
        document.getElementById("user-container").style.display = "block";
        document.getElementById("error-container").style.display = "none";

        // Get user data
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef).then((doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                document.getElementById("firstName").innerText = userData.firstName;
                document.getElementById("lastName").innerText = userData.lastName;
            }
        }).catch(error => {
            console.log("Error fetching user data", error);
        });
    } else {
        window.location.href = "./login.html";
    }
});

// Firestore operations
async function addExpenseToFirestore(expense) {
    if (!currentUser) throw new Error("User not authenticated");
    
    try {
        const docRef = await addDoc(collection(db, "users", currentUser.uid, "expenses"), expense);
        return docRef.id;
    } catch (error) {
        console.error("Error adding expense: ", error);
        throw error;
    }
}

async function updateExpenseInFirestore(expenseId, updatedData) {
    if (!currentUser) throw new Error("User not authenticated");
    
    try {
        await updateDoc(doc(db, "users", currentUser.uid, "expenses", expenseId), updatedData);
    } catch (error) {
        console.error("Error updating expense: ", error);
        throw error;
    }
}

async function deleteExpenseFromFirestore(expenseId) {
    if (!currentUser) throw new Error("User not authenticated");
    
    try {
        await deleteDoc(doc(db, "users", currentUser.uid, "expenses", expenseId));
    } catch (error) {
        console.error("Error deleting expense: ", error);
        throw error;
    }
}

async function clearAllExpensesFromFirestore() {
    if (!currentUser) throw new Error("User not authenticated");
    
    try {
        const querySnapshot = await getDocs(collection(db, "users", currentUser.uid, "expenses"));
        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error clearing all expenses: ", error);
        throw error;
    }
}

// Logout
const logoutbtn = document.getElementById("logout");
logoutbtn.addEventListener("click", () => {
    if (confirm("Do you want to really logout?")) {
        signOut(auth).then(() => {
            localStorage.removeItem("loggedInUserId");
            window.location.href = "./login.html";
        }).catch(error => {
            console.log("Error logging out", error);
        });
    }
});

// Setup real-time expense listener
function setupExpenseListener(callback) {
    const userId = localStorage.getItem("loggedInUserId");
    if (!userId) {
        console.error("No user ID found");
        return () => {};
    }

    const expensesRef = collection(db, "users", userId, "expenses");
    
    return onSnapshot(expensesRef, (snapshot) => {
        const expenses = [];
        snapshot.forEach((doc) => {
            expenses.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(expenses);
    });
}

// Export functions
window.firebaseHelpers = {
    addExpense: addExpenseToFirestore,
    updateExpense: updateExpenseInFirestore,
    deleteExpense: deleteExpenseFromFirestore,
    clearAllExpenses: clearAllExpensesFromFirestore
};

window.setupExpenseListener = setupExpenseListener;