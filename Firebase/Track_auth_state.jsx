import React from 'react'
import { onAuthStateChanged } from "firebase/auth";
import {auth} from "./firebaseConfig.js"
import { useState,useEffect } from "react";




export default function Track_auth_state() {

    const [user_state,Set_user_state]=useState(null);

    useEffect(()=>{
        const unsubscribe=onAuthStateChanged(auth,(currentuser) => {Set_user_state(currentuser)});

        return ()=> unsubscribe;

    },[])
  return (
    <div>
      {user_state ? <h1>Welcome</h1>:<h1>Please Login</h1>}
    </div>
  )
}
