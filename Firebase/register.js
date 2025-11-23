import React from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc,setDoc } from 'firebase/firestore'
import { auth,db } from './firebaseConfig'

const Register_New_User=async (email,password,date,Student_name,institute,model_info)=>{

  const user_credientials=await createUserWithEmailAndPassword(auth,email,password);
  const user=user_credientials.user;

  await setDoc(
    doc(db,"Student",user.uid),
    {
      userID:user.uid,
      email:user.email,
      date:date,
      Student:Student_name,
      ins:institute,
      model:model_info

    }

  );
}