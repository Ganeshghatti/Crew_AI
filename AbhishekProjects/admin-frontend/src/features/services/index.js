import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { NotificationManager } from "react-notifications";
import axios from "axios";

const ServicesModal = ({ isOpen, onClose, onSave, service }) => {
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (service) {
      setIconPreview(service.icon || "");
      setTitle(service.title || "");
      setDesc(service.desc || "");
    } else {
      setIconPreview("");
      setTitle("");
      setDesc("");
    }
  }, [service]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("icon", icon);
    formData.append("title", title);
    formData.append("desc", desc);

    onSave(formData);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-[#1D232A] p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          {service ? "Update Service" : "Create New Service"}
        </h2>
        <form encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Service Icon
            </label>
            <input
              type="file"
              onChange={handleIconChange}
              className="input input-bordered w-full"
            />
            {iconPreview && (
              <img
                src={iconPreview}
                alt="Service Icon"
                className="mt-2 h-20 w-20"
              />
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Service Title"
            className="input input-bordered w-full mb-4"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Service Description"
            className="textarea textarea-bordered w-full mb-4"
          ></textarea>
          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-secondary mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TopSideButtons = ({ onCreate }) => {
  return (
    <div className="inline-block float-right">
      <button
        className="btn px-6 btn-sm normal-case btn-primary"
        onClick={onCreate}
      >
        Add New
      </button>
    </div>
  );
};

function Services() {
  const token = localStorage.getItem("token");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/admin/get-all-services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(response.data.services);
    } catch (error) {
      console.error(error);
      NotificationManager.error(
        "Failed to fetch services",
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

  const createService = async (formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/admin/service-new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      NotificationManager.success("Service created successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      NotificationManager.error("Failed to create service", "Error", 5000);
    }
  };

  const updateService = async (formData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/admin/update-service-detail/${
          selectedService.id
        }`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      NotificationManager.success("Service updated successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      NotificationManager.error("Failed to update service", "Error", 5000);
    }
  };

  const deleteService = async (service) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/admin/service-delete/${service.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setServices(services.filter((s) => s.id !== service.id));
      NotificationManager.success("Service deleted successfully");
    } catch (error) {
      console.error(error);
      NotificationManager.error("Failed to delete service", "Error", 5000);
    }
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleSaveService = (formData) => {
    if (selectedService) {
      updateService(formData);
    } else {
      createService(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <TitleCard
        title="Services"
        topMargin="mt-2"
        TopSideButtons={<TopSideButtons onCreate={handleCreateService} />}
      >
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Description</th>
                <th>Last Update</th>
                <th>Created At</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services &&
                services.length > 0 &&
                services.map((item, k) => (
                  <tr key={k}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={item.icon} alt="Service Icon" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{item.title}</td>
                    <td style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                      {item.desc}
                    </td>
                    <td>{item.lastUpdate}</td>
                    <td>{item.createdAt}</td>
                    <td>
                      <button
                        className="btn btn-square btn-ghost p-4"
                        onClick={() => {
                          setSelectedService(item);
                          setIsModalOpen(true);
                        }}
                      >
                        <p className="flex items-center gap-1">
                          Edit <PencilIcon className="w-5" />
                        </p>
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-square btn-ghost"
                        onClick={() => deleteService(item)}
                      >
                        <TrashIcon className="w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </TitleCard>

      {/* Modal for Creating/Updating Service */}
      <ServicesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        service={selectedService}
      />
    </>
  );
}

export default Services;
