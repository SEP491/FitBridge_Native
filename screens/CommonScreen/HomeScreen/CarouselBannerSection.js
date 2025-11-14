import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import CarouselNative from "../../../components/Carousel/Carousel";

const { width } = Dimensions.get("window");
const widthCarousel = width - 30;

export default function CarouselBannerSection() {
  const images = [
    {
      url: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/749c83f7-486e-43ed-aecc-b1d6e661e4ff/view?project=68ed0fdd0037253031b8",
    },
    {
      url: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/1934c6b0-b12d-493f-92c7-36fffe650f46/view?project=68ed0fdd0037253031b8",
    },
    {
      url: "https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/7c2be8ad-6391-4f75-8736-dd585b6bedb6/view?project=68ed0fdd0037253031b8",
    },
    {
      url:"https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/07789845-7d04-4ff6-adf5-1157a20400bc/view?project=68ed0fdd0037253031b8",
    },
    {
      url:"https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/badd2c8e-1195-4e73-a229-856900811119/view?project=68ed0fdd0037253031b8",
    },
    {
      url:"https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/be1189ca-1a9f-417b-8c2e-c1fc9a27ec1f/view?project=68ed0fdd0037253031b8",
    },
    {
      url:"https://cloud.appwrite.io/v1/storage/buckets/68ed0ff4001069f7a10f/files/124d7df7-b014-45f6-a28f-f883aca18154/view?project=68ed0fdd0037253031b8",
    }
  ];

  return (
    <View style={styles.carouselContainer}>
      <CarouselNative
        width={widthCarousel}
        height={160}
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
