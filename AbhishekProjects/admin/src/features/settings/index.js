import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import InputText from "../../components/Input/InputText";
import TextAreaInput from "../../components/Input/TextAreaInput";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import axios from "axios";
import ErrorText from "../../components/Typography/ErrorText";

function ProfileSettings() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    about: "",
    oldpassword: "",
    newpassword: "",
    confirmPassword: "",
  });

  const fetchData = async () => {
    try {
      if (token) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/admin/get-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { name, about, email } = response.data.admin;
        setFormData((prevFormData) => ({
          ...prevFormData,
          name,
          about,
          email,
        }));
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        return navigate(`/`);
      }
      NotificationManager.error(
        "Failed to fetch profile",
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

  const updateProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.oldpassword) {
      setErrorMessage("Please enter email and password");
      NotificationManager.error("Error", "Email and password are required.");
      return;
    }

    if (formData.newpassword !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      NotificationManager.error("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      console.log(formData);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/admin/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      NotificationManager.success("Success", "Profile Updated Successfully");
      setFormData({
        email: "",
        name: "",
        about: "",
        oldpassword: "",
        newpassword: "",
        confirmPassword: "",
      });
      fetchData();
    } catch (error) {
      setErrorMessage(error.response.data.error);
      NotificationManager.error(
        "Error",
        "Failed to update profile",
        5000,
        () => {
          alert(error.response.data.error);
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [updateType]: value,
    }));
  };

  useEffect(() => {
    console.log(formData);
  }, formData);
  return (
    <>
      <NotificationContainer />
      <TitleCard title="Profile Settings" topMargin="mt-2">
        <form onSubmit={updateProfile}>
          <div className="flex flex-col w-full md:w-1/2">
            {formData.name && (
              <InputText
                labelTitle="Name"
                updateType="name"
                defaultValue={formData.name}
                updateFormValue={updateFormValue}
              />
            )}

            <InputText
              labelTitle="Email Id"
              updateType="email"
              type="email"
              containerStyle="mt-4"
              defaultValue={formData.email}
              updateFormValue={updateFormValue}
            />
            <InputText
              labelTitle="Old Password"
              updateType="oldpassword"
              type="password"
              containerStyle="mt-4"
              defaultValue={formData.oldpassword}
              updateFormValue={updateFormValue}
            />
            <InputText
              labelTitle="New Password"
              updateType="newpassword"
              type="password"
              containerStyle="mt-4"
              defaultValue={formData.newpassword}
              updateFormValue={updateFormValue}
            />
            <InputText
              labelTitle="Confirm Password"
              updateType="confirmPassword"
              type="password"
              containerStyle="mt-4"
              defaultValue={formData.confirmPassword}
              updateFormValue={updateFormValue}
            />
            {formData.about && (
              <TextAreaInput
                labelTitle="About"
                updateType="about"
                containerStyle="mt-4"
                defaultValue={formData.about}
                updateFormValue={updateFormValue}
              />
            )}
          </div>
          <div className="divider"></div>
          <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>

          <div className="mt-16">
            <button
              type="submit"
              className={
                "btn mt-2 w-full btn-primary float-right" +
                (loading ? " loading" : "")
              }
            >
              Update
            </button>
          </div>
        </form>
      </TitleCard>
    </>
  );
}

export default ProfileSettings;
