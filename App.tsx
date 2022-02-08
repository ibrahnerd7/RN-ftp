import React from "react";
import { ActivityIndicator, Button, Image, SafeAreaView, StyleSheet, Text } from 'react-native';
import { launchCamera } from "react-native-image-picker";
import FTP from 'react-native-ftp';

export default function App() {
  const [picture, setPicture] = React.useState<string | undefined>(undefined);
  const [uploading, setUploading] = React.useState(false);

  async function handleTakePicture() {
    const result = await launchCamera({
      mediaType: "photo",
      includeBase64: true,
    });

    if (result.assets) {
      const base64 = result.assets[0].base64;
      setPicture(base64);

      const uri = result?.assets[0]?.uri
      const formatUri = uri?.substring(7)

      if (formatUri) {
        await uploadToFTP(formatUri);
      }
    }
  }

  async function uploadToFTP(uri:string) {
    setUploading(true);
    
    FTP.setup("192.168.1.1", 21)
    FTP.login("username", "password").then((result) => {
      FTP
        .uploadFile(uri, '/files')
        .then((res) => console.log("res", res))
        .catch((err) => console.log("err", err))
    }).catch((err) => {
      console.log("Auth error", err)
    }).finally(() => {
      setUploading(false);
    });

  }


  return (
    <SafeAreaView style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 32
    }}>
      {
        picture &&
        <Image
          source={{ uri: `data:image/jpg;base64,${picture}` }}
          resizeMode="cover"
          style={Styles.picture}
        />
      }
      {
        !uploading &&
        <Button
          title="Take picture"
          onPress={handleTakePicture}
        />
      }
      {uploading &&
        <>
          <ActivityIndicator
            size="small"
          />
          <Text>Uploading image</Text>
        </>
      }
    </SafeAreaView>
  )
}

const Styles = StyleSheet.create({
  picture: {
    width: 200,
    height: 200,
    marginBottom: 32,
    borderRadius: 16,
  }
})