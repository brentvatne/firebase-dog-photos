import React, { useEffect, useState } from "react";
import * as firebase from "firebase";
import "firebase/firestore";
import uniqBy from "lodash/uniqBy";

if (!firebase.apps.length) {
  firebase.initializeApp({
    // this is not a private key — all safe to be public
    apiKey: "AIzaSyDnyogHUy4vdLY1vk9HHXjwKcVsd3rQDHU",
    authDomain: "corgi-photo.firebaseapp.com",
    databaseURL: "https://corgi-photo.firebaseio.com",
    projectId: "corgi-photo",
    storageBucket: "corgi-photo.appspot.com",
    messagingSenderId: "116095273122",
    appId: "1:116095273122:web:2a20db9099e5458ecfaffb",
    measurementId: "G-T3S6Z63LS9",
  });
}

const auth = firebase.auth();
const db = firebase.firestore();
const corgisCol = db.collection("corgis");

export function signIn() {
  auth.signInAnonymously();
}

export function signOut() {
  auth.signOut();
}

export async function addCorgi() {
  const user = auth.currentUser;

  try {
    await corgisCol.add({
      url: corgiUrl,
      uid: user.uid,
      createdAt: new Date(),
    });
  } catch (e) {
    alert(e.message);
  }
}

export function useCurrentUser() {
  const [user, setUser] = React.useState(null);
  useEffect(() => {
    return auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
    });
  }, []);

  return user;
}

export function useCorgis() {
  const [corgis, setCorgis] = React.useState(null);
  useEffect(() => {
    return corgisCol
      .orderBy("createdAt", "desc")
      .limit(10)
      .onSnapshot((snapshot) => {
        const allCorgis = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredCorgis = allCorgis.filter(
          (corgi) =>
            corgi.url && corgi.url.startsWith("https://images.unsplash.com")
        );
        const dedupedCorgis = uniqBy(filteredCorgis, "url");
        const mostRecentCorgis = dedupedCorgis.slice(0, 20);
        setCorgis(mostRecentCorgis);
      });
  }, []);

  return corgis;
}
