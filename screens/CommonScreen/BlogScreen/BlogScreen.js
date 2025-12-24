// BlogScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LoadingIndicator from "../../../components/LoadingIndicator";
import blogService from "../../../services/blogService";

export default function BlogScreen() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await blogService.getBlogs();
        // API shape: { status, message, data: [...] }
        setBlogs(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const renderBlogItem = ({ item }) => {
    const imageUrl = item?.images?.[0] || item?.imageUrl || "";
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("BlogDetailScreen", { blog: item })}
        style={styles.card}
      >
        {!!imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
        <Text style={styles.title}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <LoadingIndicator variant="page" />
      ) : (
        <FlatList
          data={filteredBlogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    margin: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ED2A46",
  },
});
