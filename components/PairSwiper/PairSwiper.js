import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Swiper from "react-native-swiper";

const PairedSwiper = ({
  data = [],
  renderItem,
  itemsPerSlide = 2,
  containerStyle = {},
  slideStyle = {},
  itemContainerStyle = {},
  autoplay = false,
  autoplayTimeout = 3,
  loop = true,
  height,
  dotStyle = {},
  activeDotStyle = {},
  showsButtons = false,
  showsPagination = false,
}) => {
  // Group items into arrays of itemsPerSlide
  const getItemGroups = () => {
    const groups = [];
    for (let i = 0; i < data.length; i += itemsPerSlide) {
      groups.push(data.slice(i, i + itemsPerSlide));
    }
    return groups;
  };

  const itemGroups = getItemGroups();

  const { width } = Dimensions.get("window");
  const itemWidth = (width - 40 - (itemsPerSlide - 1) * 10) / itemsPerSlide;

  return (
    <View style={[styles.container, containerStyle]}>
      <Swiper
        showsButtons={showsButtons}
        showsPagination={showsPagination}
        dotStyle={[styles.dot, dotStyle]}
        activeDotStyle={[styles.activeDot, activeDotStyle]}
        paginationStyle={styles.pagination}
        loop={loop}
        autoplay={autoplay}
        autoplayTimeout={autoplayTimeout}
        height={height}
      >
        {itemGroups.map((group, index) => (
          <View key={index} style={[styles.slide, slideStyle]}>
            {group.map((item, idx) => (
              <View
                key={item.id || idx}
                style={[
                  styles.itemContainer,
                  { width: itemWidth },
                  itemContainerStyle,
                ]}
              >
                {renderItem(item)}
              </View>
            ))}
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  itemContainer: {},
  dot: {
    backgroundColor: "#D9D9D9",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#ED2A46",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  pagination: {
    bottom: 0,
  },
});

export default PairedSwiper;
