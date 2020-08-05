import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as firebase from "firebase";

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

export default function App() {
  const [user, setUser] = React.useState(null);
  useEffect(() => {
    return auth.onAuthStateChanged((newUser) => {
      console.log("auth state change");
      console.log(newUser);
      setUser(newUser);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(user)}</Text>
      <Button
        title={user ? "Sign out" : "Sign in anonymously"}
        onPress={() => {
          if (!user) {
            auth.signInAnonymously();
          } else {
            auth.signOut();
          }
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
