import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "../../../hooks/useTranslation";
import blogService from "../../../services/blogService";

const { width } = Dimensions.get("window");

export default function BlogDetailScreen() {
  const route = useRoute();
  const initialBlog = route.params?.blog;
  const [blog, setBlog] = useState(initialBlog);
  const [loading, setLoading] = useState(!initialBlog?.content);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!initialBlog?.id || initialBlog?.content) return;
      try {
        setLoading(true);
        const response = await blogService.getBlogById(initialBlog.id);
        setBlog(response?.data);
      } catch (error) {
        console.error("Failed to fetch blog detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [initialBlog]);

  if (loading && !blog?.content) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.container}>
        <Text>{t("common.noData")}</Text>
      </View>
    );
  }

  const imageUrl = blog?.images?.[0] || blog?.imageUrl || "";
  const content =
    blog?.content || blog?.shortDescription || blog?.summary || "";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{blog.title}</Text>
        {!!imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
        <Text style={styles.content}>{content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ED2A46",
    marginBottom: 12,
  },
  image: {
    width: width - 32,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
