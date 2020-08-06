import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import uniqBy from "lodash/uniqBy";
import * as firebase from "firebase";
import "firebase/firestore";

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

export default function App() {
  const [user, setUser] = React.useState(null);
  useEffect(() => {
    return auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
    });
  }, []);

  const [corgis, setCorgis] = React.useState(null);
  useEffect(() => {
    corgisCol.onSnapshot((snapshot) => {
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
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ fontSize: 25 }}>corgislist</Text>
          <Button
            title={user ? "Sign out" : "Sign in anonymously"}
            onPress={() => {
              try {
                if (!user) {
                  auth.signInAnonymously();
                } else {
                  auth.signOut();
                }
              } catch (e) {
                alert(e.message);
              }
            }}
          />
        </View>
        {corgis ? <CorgiList corgis={corgis} /> : <Text>No corgis 😧</Text>}
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

function CorgiList({ corgis }) {
  const dimensions = useWindowDimensions();

  return (
    <View style={{ flexDirection: "row", flex: 1, flexWrap: "wrap" }}>
      {corgis.map((corgi) => (
        <Image
          key={corgi.url}
          source={{ uri: corgi.url }}
          style={{
            width: dimensions.width / 3,
            height: dimensions.width / 3,
            resizeMode: "cover",
          }}
          accessibilityLabel="Corgi"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
});
