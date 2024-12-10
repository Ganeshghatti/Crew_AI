import { useEffect, useState, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import InputText from "../../components/Input/InputText";
import ErrorText from "../../components/Typography/ErrorText";
import axios from "axios";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import SpecialityRichText from "../../components/RichText/SpecialityRichText";

function SpecialityDetail() {
  const navigate = useNavigate();
  const { link } = useParams();
  const token = localStorage.getItem("token");

  const [initialImages, setInitialImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    icon: null,
    iconPreview: "",
    wallpaperimg: null,
    wallpaperimgPreview: "",
  });

  const extractImageUrls = (content) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const images = tempDiv.getElementsByTagName("img");
    const imageUrls = [];
    for (let img of images) {
      imageUrls.push(img.src);
    }
    return imageUrls;
  };

  const fetchData = async () => {
    try {
      if (token && link) {
        setLoading(true);
        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/admin/get-speciality-details/${link}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const speciality = response.data.speciality;
        console.log(response.data.speciality);
        setFormData((prevFormData) => ({
          ...prevFormData,
          title: speciality.title,
          desc: speciality.desc,
          content: speciality.content,
          iconPreview: speciality.icon,
          wallpaperimgPreview: speciality.wallpaperimg,
        }));
        const initialImages = extractImageUrls(speciality.content);
        setInitialImages(initialImages);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        return navigate(`/`);
      }
      NotificationManager.error(
        "Failed to fetch Specialities",
        "Error",
        5000,
        () => {
          alert(error.response.data.error);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleFormData = ({ updateType, value }) => {
    setFormData({ ...formData, [updateType]: value });
  };

  const handleIconChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      icon: file,
      iconPreview: URL.createObjectURL(file),
    }));
  };

  const handleWallPaperImgChange = (event) => {
    const file = event.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      wallpaperimg: file,
      wallpaperimgPreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.title ||
      !formData.desc ||
      !formData.iconPreview ||
      !formData.wallpaperimgPreview
    ) {
      setErrorMessage("All fields are required.");
      NotificationManager.error("Error", "All fields are required.");
      return;
    }
    const currentImages = extractImageUrls(formData.content);
    const imagesToDelete = initialImages.filter(
      (url) => !currentImages.includes(url)
    );

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("desc", formData.desc);
    formDataToSend.append("content", formData.content);

    if (formData.icon) {
      formDataToSend.append("icon", formData.icon);
    }

    if (formData.wallpaperimg) {
      formDataToSend.append("wallpaperimg", formData.wallpaperimg);
    }
    if (imagesToDelete) {
      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }
    try {
      setLoading(true);

      const response = await axios.put(
        `${
          import.meta.env.VITE_SERVER_URL
        }/admin/update-speciality-details/${link}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      NotificationManager.success("Success", "Speciality Updated Successfully");
      fetchData();
    } catch (error) {
      setErrorMessage(error.response.data.error);
      NotificationManager.error(
        "Error",
        "Failed to update Speciality",
        5000,
        () => {
          alert(error.response.data.error);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationContainer />
      {formData && formData.title && (
        <div className="w-full flex flex-col gap-8">
          <InputText
            type="text"
            defaultValue={formData.title}
            updateType="title"
            containerStyle="mt-4"
            labelTitle="Enter Speciality Title"
            updateFormValue={handleFormData}
          />

          <InputText
            type="text"
            defaultValue={formData.desc}
            updateType="desc"
            labelTitle="Enter Description"
            updateFormValue={handleFormData}
          />

          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Upload Icon</span>
            </label>{" "}
            <input
              type="file"
              accept="image/*,image/svg+xml"
              onChange={handleIconChange}
              className="input input-bordered w-full"
            />{" "}
            {formData.iconPreview && (
              <div>
                <img
                  src={formData.iconPreview}
                  alt="Icon Preview"
                  className="w-1/5 h-auto mt-4"
                />
              </div>
            )}
          </div>
          <div className="form-control flex flex-col gap-2">
            <label className="label">
              <span className="label-text">Upload Wall Paper Image</span>
            </label>{" "}
            <input
              type="file"
              accept="image/*,image/svg+xml"
              onChange={handleWallPaperImgChange}
              className="input input-bordered w-full"
            />{" "}
            {formData.wallpaperimgPreview && (
              <div>
                <img
                  src={formData.wallpaperimgPreview}
                  alt="WallPaper Preview"
                  className="w-1/5 h-auto mt-4"
                />
              </div>
            )}
          </div>

          <SpecialityRichText
            id="description"
            name="description"
            label="Description"
            value={formData.content}
            setValue={(content) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                content: content,
              }))
            }
          />

          <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
          <button
            type="submit"
            onClick={handleSubmit}
            className={
              "btn mt-2 w-full btn-primary" + (loading ? " loading" : "")
            }
          >
            Update
          </button>
        </div>
      )}
    </>
  );
}

export default SpecialityDetail;
