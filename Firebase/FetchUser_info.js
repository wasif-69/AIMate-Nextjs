import { doc,getDoc } from "firebase/firestore";
import {db} from "./firebaseConfig";


export const getINFO=async (uid)=>{

    const data=getDoc(doc(db,uid,'Student',));
    return data.exists()? data.data():null;
}