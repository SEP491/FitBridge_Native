import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import CarouselNative from "../../../components/Carousel/Carousel";

const { width } = Dimensions.get("window");
const widthCarousel = width - 30;

export default function CarouselBannerSection() {
  const images = [
    {
      url: "https://img.freepik.com/free-psd/gym-fitness-facebook-cover-banner-template_106176-3896.jpg?semt=ais_hybrid&w=740",
    },
    {
      url: "https://img.freepik.com/premium-psd/fitness-gym-red-banner-template_1073294-95.jpg",
    },
    {
      url: "https://img.freepik.com/premium-psd/red-horizontal-workout-gym-poster-banner_179813-347.jpg",
    },
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
