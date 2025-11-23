import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// Start a chat
export const Start_Chat = async (currentuserId, otheruserID) => {
  const chat_ID = `chat_${otheruserID}`;

  const ref = doc(db, "Student", currentuserId, "Chats", chat_ID);

  await setDoc(
    ref,
    {
      with: otheruserID,
      created_at: serverTimestamp(),
    },
    { merge: true }
  );

  const otheref = doc(db, "Student", otheruserID, "Chats", `chat_${currentuserId}`);

  await setDoc(
    otheref,
    {
      with: currentuserId,
      created_at: serverTimestamp(),
    },
    { merge: true }
  );
};

// Send a message
export const Send_message = async (senderId, receiverId, text) => {
  const sender_ID = `chat_${receiverId}`;
  const receiver_ID = `chat_${senderId}`;

  const senderMsgRef = collection(
    db,
    "Student",
    senderId,
    "Chats",
    sender_ID,
    "messages"
  );
  const receiverMsgRef = collection(
    db,
    "Student",
    receiverId,
    "Chats",
    receiver_ID,
    "messages"
  );

  const message = {
    sender: senderId,
    receiver: receiverId,
    text,
    timestamp: serverTimestamp(), // ✅ consistent
  };

  await addDoc(senderMsgRef, message);
  await addDoc(receiverMsgRef, message);
};

// Listen to messages
export const listenMessage = (currentuserID, otheruserId, setmessage) => {
  const chat_ID = `chat_${otheruserId}`;

  const ref = collection(
    db,
    "Student",
    currentuserID,
    "Chats",
    chat_ID,
    "messages"
  ); // ✅ collection, not doc()

  const q = query(ref, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setmessage(msgs);
  });
};
