import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import PairedSwiper from "../../../components/PairSwiper/PairSwiper";
import BlogCard from "../../../components/BlogCard/BlogCard";
import { useTranslation } from "../../../hooks/useTranslation";

export default function BlogSection() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const blogPosts = [
    {
      id: 1,
      title: "home.blogPost1Title",
      imageUrl:
        "https://i.pinimg.com/736x/0f/f6/69/0ff6690ae16b9358fb62ed4934d8e598.jpg",
      summary: "home.blogPost1Summary",
    },
    {
      id: 2,
      title: "home.blogPost2Title",
      imageUrl:
        "https://i.pinimg.com/736x/0e/fc/b5/0efcb577e982d3b47739b3d10d47ce42.jpg",
      summary: "home.blogPost2Summary",
    },
    {
      id: 3,
      title: "home.blogPost3Title",
      imageUrl:
        "https://i.pinimg.com/736x/63/69/ab/6369ab27dca3a6331a12c517441fabd2.jpg",
      summary: "home.blogPost3Summary",
    },
  ];

  const renderBlogCard = (item) => {
    return <BlogCard blog={item} />;
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.sectionTitle}>{t("home.blog")}</Text>
          <View style={styles.titleUnderline} />
        </View>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("BlogScreen")}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMoreText}>{t("home.viewMore")}</Text>
        </TouchableOpacity>
      </View>

      <PairedSwiper
        data={blogPosts}
        renderItem={renderBlogCard}
        showsPagination={true}
        itemsPerSlide={2}
        height={220}
        loop={true}
        dotStyle={styles.paginationDot}
        activeDotStyle={styles.activePaginationDot}
        containerStyle={styles.swiperContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 25,
    paddingHorizontal: 15,
    width: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  titleWithIcon: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ED2A46",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#ED2A46",
    marginTop: 4,
    borderRadius: 2,
  },
  viewMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5F6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ED2A46",
    shadowColor: "#ED2A46",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMoreText: {
    fontSize: 13,
    color: "#ED2A46",
    fontWeight: "600",
  },
  swiperContainer: {
    paddingBottom: 25,
  },
  paginationDot: {
    backgroundColor: "#E0E0E0",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 20,
  },
  activePaginationDot: {
    backgroundColor: "#ED2A46",
    width: 21,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    top: 20,
  },
});
