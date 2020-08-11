import React, { useCallback, useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useDimensions } from "react-native-web-hooks";
import {
  signIn,
  signOut,
  useCurrentUser,
  useCorgis,
  addCorgi,
  uploadImageAsync,
} from "./db";

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
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    handleImagePicked(pickerResult);
  };

  const handleImagePicked = async (pickerResult) => {
    try {
      setIsUploading(true);

      if (!pickerResult.cancelled) {
        let uploadUrl = await uploadImageAsync(pickerResult.uri);
        console.log(uploadUrl);

        await addCorgi(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="dog-side"
              size={25}
              color="black"
              style={{ marginRight: 5 }}
            />
            <Text style={{ fontSize: 25 }}>corgislist</Text>
          </View>
          {user ? (
            <Button title="Upload Corgi" onPress={pickImage} />
          ) : (
            <Button title="Sign in anonymously" onPress={signIn} />
          )}
        </View>
        {user ? <NewCorgiForm /> : null}
        <CorgiList corgis={corgis} />
        <StatusBar style="auto" />
      </ScrollView>
    </SafeAreaView>
  );
}

function NewCorgiForm() {
  const [corgiUrl, setCorgiUrl] = useState("");
  const handleAddCorgi = useCallback(async () => {
    addCorgi(url);
    setCorgiUrl("");
  }, [corgiUrl]);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
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
      <Button title="Import Corgi" onPress={handleAddCorgi} />
    </View>
  );
}

function CorgiList({ corgis }) {
  const {
    window: { width, height },
  } = useDimensions();
  const [selectedCorgi, setSelectedCorgi] = useState(null);

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
        <TouchableOpacity
          onPress={() => setSelectedCorgi(corgi)}
          key={corgi.url}
        >
          <Image
            source={{ uri: corgi.url }}
            style={{
              backgroundColor: "#eee",
              width: width / 3,
              height: width / 3,
              resizeMode: "cover",
            }}
            accessibilityLabel="Corgi"
          />
        </TouchableOpacity>
      ))}

      <Modal transparent={true} visible={!!selectedCorgi}>
        {selectedCorgi ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
              // React Native's Modal component does not yet work on web,
              // so we can get around that by using fixed position on web
              ...Platform.select({
                web: {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              }),
            }}
          >
            <TouchableOpacity onPress={() => setSelectedCorgi(null)}>
              <Image
                source={{ uri: selectedCorgi.url }}
                style={{
                  width: width > height ? height : width,
                  height: width > height ? height : width,
                  resizeMode: "contain",
                  backgroundColor: "#000",
                }}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
  },
});
