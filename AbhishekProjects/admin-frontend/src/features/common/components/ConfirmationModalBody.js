import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ConfirmationModalBody({ extraObject, closeModal }) {
  const { message, type, _id, item } = extraObject;
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { link } = useParams();

  const proceedWithYes = async (e) => {
    e.preventDefault();

    if (!item.link) {
      NotificationManager.error("Error", "Item couldn't be selected");
      return;
    }

    const password = window.prompt("Please enter your password to confirm:");
    if (!password) {
      NotificationManager.error("Error", "Password is required to delete");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/admin/speciality-delete/${item.link}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            password: password,
          },
        }
      );
      closeModal();
      NotificationManager.success("Success", "Deleted Successfully");
      window.location.reload(); // Reload the page after successful deletion
    } catch (error) {
      closeModal();

      NotificationManager.error(
        "Error",
        "Failed to delete the Specialty",
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
      <p className="text-xl mt-8 text-center">
        {message}
        {extraObject.item && item.title}?
      </p>

      <div className="modal-action mt-12">
        <button className="btn btn-outline" onClick={() => closeModal()}>
          Cancel
        </button>

        <button
          className={"btn btn-primary w-36" + (loading ? " loading" : "")}
          onClick={proceedWithYes}
        >
          Yes
        </button>
      </div>
    </>
  );
}

export default ConfirmationModalBody;
