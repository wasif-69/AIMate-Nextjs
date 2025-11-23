import { signOut } from "firebase/auth";
import {auth} from "./firebaseConfig"

const LogOUT=async ()=>{
    await signOut(auth);
};