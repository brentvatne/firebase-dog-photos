import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
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

export default function AppContainer() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  useEffect(() => {
    return auth.onAuthStateChanged((newUser) => {
      setUser(newUser);
    });
  }, []);

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="always">
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
        {user ? <NewCorgiForm /> : null}

        {corgis ? <CorgiList corgis={corgis} /> : <Text>No corgis 😧</Text>}
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

function NewCorgiForm() {
  const [corgiUrl, setCorgiUrl] = useState(null);
  const handleAddCorgi = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      await corgisCol.add({
        url: corgiUrl,
        uid: user.uid,
        createdAt: new Date(),
      });
    } catch (e) {
      alert(e.message);
    }
    setCorgiUrl(null);
  }, [corgiUrl]);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <TextInput
        placeholder="Add a Corgi with the Unsplash URL"
        value={corgiUrl}
        onChangeText={(text) => setCorgiUrl(text)}
        onSubmitEditing={handleAddCorgi}
        clearButtonMode="while-editing"
        style={{ flex: 1 }}
      />
      <Button title="Add Corgi" onPress={handleAddCorgi} />
    </View>
  );
}

function CorgiList({ corgis }) {
  return (
    <View style={{ flexDirection: "row", flex: 1, flexWrap: "wrap" }}>
      {corgis.map((corgi) => (
        <Image
          key={corgi.url}
          source={{ uri: corgi.url }}
          style={{
            width: Dimensions.get("window").width / 3,
            height: Dimensions.get("window").width / 3,
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
