import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useDimensions } from "react-native-web-hooks";
import { signIn, signOut, useCurrentUser, useCorgis, addCorgi } from "./db";

export default function AppContainer() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

function App() {
  const user = useCurrentUser();
  const corgis = useCorgis();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag">
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
                if (user) {
                  signOut();
                } else {
                  signIn();
                }
              } catch (e) {
                alert(e.message);
              }
            }}
          />
        </View>
        {user ? <NewCorgiForm /> : null}
        <CorgiList corgis={corgis} />
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

function NewCorgiForm() {
  const [corgiUrl, setCorgiUrl] = useState(null);
  const handleAddCorgi = useCallback(async () => {
    addCorgi(url);
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
  const {
    window: { width },
  } = useDimensions();

  if (!corgis) {
    if (corgis === null) {
      return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
    } else {
      return <Text>No corgis 😧</Text>;
    }
  }

  return (
    <View style={{ flexDirection: "row", flex: 1, flexWrap: "wrap" }}>
      {corgis.map((corgi) => (
        <Image
          key={corgi.url}
          source={{ uri: corgi.url }}
          style={{
            width: width / 3,
            height: width / 3,
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
