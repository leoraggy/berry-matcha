import { useCallback, useEffect, useRef, useState } from "react";
import DrinkRepository from "../data/drinkRepository";
import Loading from "../components/Loading";
import Error from "../components/Error";
import styles from "./Admin.module.css";
import SimpleBarChart from "../components/SimpleBarChart";
import AdminDrinkList from "./AdminDrinkList";
import EditModal from "./EditModal";

const drinkRepo = new DrinkRepository();
const emptyDrink = {
  name: "",
  price: "",
  category: "Matcha",
  description: "",
  allergens: "",
  imageLink: "",
  isAvailable: true,
};

function Admin() {
  const [drinks, setDrinks] = useState([]);
  const [drinkSales, setDrinkSales] = useState([]);
  const [formData, setFormData] = useState(emptyDrink);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [message, setMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const addDrinkButton = useRef(null);

  const clearSelectedImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview("");
  }, []);

  const fetchDrinks = useCallback(
    () => Promise.all([drinkRepo.getAllDrinks(), drinkRepo.getDrinkSales()]),
    [],
  );

  useEffect(() => {
    if (!imagePreview) {
      return undefined;
    }

    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const resetForm = useCallback(() => {
    setFormData(emptyDrink);
    clearSelectedImage();
    setEditingId(null);
    setModalOpen(false);
    setMessage("");
    requestAnimationFrame(() => addDrinkButton.current?.focus());
  }, [clearSelectedImage]);

  useEffect(() => {
    let active = true;

    fetchDrinks()
      .then(([drinkData, salesData]) => {
        if (active) {
          setDrinks(drinkData);
          setDrinkSales(salesData);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Unable to load drinks for admin:", error);
        if (active) {
          setLoadError("Unable to load drinks. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchDrinks]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const startAdding = () => {
    setFormData(emptyDrink);
    clearSelectedImage();
    setEditingId(null);
    setMessage("");
    setModalOpen(true);
  };

  const startEditing = (drink) => {
    clearSelectedImage();
    setEditingId(drink._id);
    setFormData({
      name: drink.name,
      price: String(drink.price),
      category: drink.category,
      description: drink.description ?? "",
      allergens: drink.allergens ?? "",
      imageLink: drink.imageLink ?? "",
      isAvailable: drink.isAvailable ?? true,
    });
    setMessage("");
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    let drink = {
      ...formData,
      price: Number(formData.price),
    };

    try {
      if (selectedImage) {
        setMessage("Uploading image...");
        const { imageLink } = await drinkRepo.uploadDrinkImage(selectedImage);
        drink = { ...drink, imageLink };
      }

      if (editingId) {
        await drinkRepo.updateDrink(editingId, drink);
        setDrinks((currentDrinks) =>
          currentDrinks.map((item) =>
            item._id === editingId ? { ...drink, _id: editingId } : item,
          ),
        );
        setMessage("Drink updated.");
      } else {
        const createdDrink = await drinkRepo.createDrink(drink);
        setDrinks((currentDrinks) => [...currentDrinks, createdDrink]);
        setDrinkSales((currentSales) => [
          ...currentSales,
          { ...createdDrink, quantitySold: 0 },
        ]);
        setMessage("Drink added.");
      }
      resetForm();
    } catch (error) {
      console.error("Unable to save drink:", error);
      setMessage(error.message || "Unable to save drink. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (drink) => {
    if (
      deletingId ||
      !window.confirm(`Delete "${drink.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    setDeletingId(drink._id);
    setDeleteMessage(null);

    try {
      await drinkRepo.deleteDrink(drink._id);
      setDrinks((currentDrinks) =>
        currentDrinks.filter((item) => item._id !== drink._id),
      );
      setDrinkSales((currentSales) =>
        currentSales.filter((item) => item._id !== drink._id),
      );
      setDeleteMessage({ text: "Drink deleted.", isError: false });
    } catch (error) {
      console.error("Unable to delete drink:", error);
      setDeleteMessage({
        text: error.message || "Unable to delete drink. Please try again.",
        isError: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (loadError) {
    return <Error error={loadError} />;
  }

  return (
    <div className={styles["admin-page"]}>
      <title>Berry Matcha | Admin</title>
      <SimpleBarChart data={drinkSales} />
      <header className={styles["admin-header"]}>
        <h1>Drink Admin</h1>
        <button
          ref={addDrinkButton}
          type="button"
          className={`${styles["admin-primary-button"]} ${styles["admin-add-button"]}`}
          onClick={startAdding}
        >
          + Add a new drink
        </button>
      </header>
      {deleteMessage && (
        <p
          className={`${styles["admin-action-message"]}${deleteMessage.isError ? ` ${styles["is-error"]}` : ""}`}
          role={deleteMessage.isError ? "alert" : "status"}
        >
          {deleteMessage.text}
        </p>
      )}

      {modalOpen && (
        <EditModal
          editingId={editingId}
          formData={formData}
          imagePreview={imagePreview}
          message={message}
          saving={saving}
          selectedImage={selectedImage}
          onClose={resetForm}
          onChange={handleChange}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
        />
      )}

      <AdminDrinkList
        drinks={drinks}
        drinkSales={drinkSales}
        deletingId={deletingId}
        onEdit={startEditing}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Admin;
