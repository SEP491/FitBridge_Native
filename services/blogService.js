import { request } from "./request";

const blogService = {
  getBlogs: () => request("GET", "/v1/blogs"),
  getBlogById: (id) => request("GET", `/v1/blogs/${id}`),
};

export default blogService;
