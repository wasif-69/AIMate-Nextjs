import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // fixed import alias

export const addModelToData = async (uid, name, modelStyle,goals,type) => {
  try {
    // Reference to the "models" subcollection for the user
    const modelsRef = collection(db, "Student", uid, "models");

    // Generate random document ID
    const modelId = uuidv4();

    // Add the model document
    await setDoc(doc(modelsRef, modelId), {
      name_model: name,          // you can also just use 'name'
      dateCreated: serverTimestamp(),
      style: modelStyle,
      Goals:goals,
      type:type

    });

    console.log("Model added successfully!");
    return modelId;
  } catch (e) {
    console.error("Error adding model:", e);
  }
};

