import { collection, doc, setDoc} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // fixed import alias

export const addfavorate=async (useId,uni,ranking,acceptance_rt,deadline,scholarship,loc,web)=>{
    try{
        const ref=collection(db,"Student",useId,"Favourite");

        const model=uuidv4();

        await setDoc(doc(ref,model),
    {
        university:uni,
        Qs_ranking:ranking,
        acceptance_rate:acceptance_rt,
        deadline:deadline,
        scholarship:scholarship,
        location:loc,
        website:web
    })
    }
    catch (e){
        console.log(e)
    }
}