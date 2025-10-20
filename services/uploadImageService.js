import { request } from "./request";

const uploadImageService = {

  uploadImage: (imageData) =>
    request("POST", "v1/uploads", imageData, {
      "Content-Type": "multipart/form-data",
    }),
};

export default uploadImageService;
