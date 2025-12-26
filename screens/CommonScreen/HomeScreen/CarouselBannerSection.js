import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import CarouselNative from "../../../components/Carousel/Carousel";

const { width } = Dimensions.get("window");
const widthCarousel = width - 30;

export default function CarouselBannerSection() {
  const images = [
    {
      url: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/9c68070d-9977-44d1-ab93-29a5d84e0c3b/view?project=68ed0fdd0037253031b8",
    },
    {
      url: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/0337c5e6-7740-484e-b085-67dca49f3a51/view?project=68ed0fdd0037253031b8",
    },
    {
      url: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/dff424fc-ec08-4211-84b6-c8b1f90adfc7/view?project=68ed0fdd0037253031b8",
    },
    {
      url:"https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/7a941b8f-64b3-43e3-a4a8-7539a56cc225/view?project=68ed0fdd0037253031b8",
    },
    {
      url:"https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/fb91df32-2bdb-43da-8786-e5f6f4aecacb/view?project=68ed0fdd0037253031b8",
    },
  ];

  return (
    <View style={styles.carouselContainer}>
      <CarouselNative
        width={widthCarousel}
        height={180}
        autoPlay={true}
        scrollAnimationDuration={1000}
        style={styles.carousel}
        data={images}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  carousel: {
    borderRadius: 10,
    marginTop: 10,
    paddingBottom: 10,
  },
});
