import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const add_community = async (uid, data, link) => {
  const reference = collection(db, "Community");

  await addDoc(reference, {
    UserID: uid,
    data: data,
    Link: link || "",   // 🔑 ensures empty string instead of undefined
  });
};
