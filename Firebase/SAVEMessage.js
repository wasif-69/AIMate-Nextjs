import { collection,addDoc,serverTimestamp } from "firebase/firestore";
import {db} from './firebaseConfig';




export const savemessage=async (uid,modelid,sender,text)=>{

    try{
        const message_reference=collection(db,"Student",uid,"models",modelid,'Chat')

        await addDoc(message_reference,{
            sender:sender,
            message:text,
            time:serverTimestamp()
        })

    }
    catch{
        console.log("Error in creting model collection to save messages")
    }

}


