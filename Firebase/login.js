import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";


const login=async (email,password)=>{

    const cridentials=await signInWithEmailAndPassword(auth,email,password);
    return cridentials.user;
}