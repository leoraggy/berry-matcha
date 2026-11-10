import { useCallback, useEffect, useRef, useState } from "react";
import DrinkRepository from "../data/drinkRepository";
import Loading from "../components/Loading";
import Error from "../components/Error";
import "./styles/Admin.css";
import SimpleBarChart from "../components/SimpleBarChart";

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
  const drinkNameInput = useRef(null);
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

  const resetForm = () => {
    setFormData(emptyDrink);
    clearSelectedImage();
    setEditingId(null);
    setModalOpen(false);
    setMessage("");
    requestAnimationFrame(() => addDrinkButton.current?.focus());
  };

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

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }

    drinkNameInput.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        setFormData(emptyDrink);
        clearSelectedImage();
        setEditingId(null);
        setModalOpen(false);
        setMessage("");
        requestAnimationFrame(() => addDrinkButton.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen, saving, clearSelectedImage]);

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
    <div className="admin-page">
      <title>Berry Matcha | Admin</title>
      <SimpleBarChart data={drinkSales} />
      <header className="admin-header">
        <h1>Drink Admin</h1>
        <button
          ref={addDrinkButton}
          type="button"
          className="admin-primary-button admin-add-button"
          onClick={startAdding}
        >
          + Add a new drink
        </button>
      </header>
      {deleteMessage && (
        <p
          className={`admin-action-message${deleteMessage.isError ? " is-error" : ""}`}
          role={deleteMessage.isError ? "alert" : "status"}
        >
          {deleteMessage.text}
        </p>
      )}

      {modalOpen && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              resetForm();
            }
          }}
        >
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <div className="admin-modal-heading">
              <div>
                <h2 id="admin-modal-title">
                  {editingId ? "Edit drink" : "Add a new drink"}
                </h2>
                <p>
                  {editingId
                    ? "Update the drink details below."
                    : "Add a drink to the menu."}
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                aria-label="Close dialog"
                onClick={resetForm}
                disabled={saving}
              >
                ×
              </button>
            </div>
            <form className="admin-drink-form" onSubmit={handleSubmit}>
              <label>
                Drink name
                <input
                  ref={drinkNameInput}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Matcha">Matcha</option>
                  <option value="Tea">Tea</option>
                </select>
              </label>
              <label>
                Drink image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageChange}
                  disabled={saving}
                />
                <span>PNG, JPG, WebP, or GIF; maximum 5 MB.</span>
                {(imagePreview || formData.imageLink) && (
                  <img
                    className="admin-image-preview"
                    src={imagePreview || formData.imageLink}
                    alt="Drink preview"
                  />
                )}
              </label>
              <label className="admin-field-wide">
                Description
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>
              <label className="admin-field-wide">
                Allergens
                <input
                  name="allergens"
                  value={formData.allergens}
                  onChange={handleChange}
                />
              </label>
              <label className="admin-availability">
                <input
                  name="isAvailable"
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                Available to order
              </label>
              <div className="admin-form-actions admin-field-wide">
                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? selectedImage
                      ? "Uploading image and saving..."
                      : "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add drink"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
              {message && (
                <p className="admin-message" role="status">
                  {message}
                </p>
              )}
            </form>
          </section>
        </div>
      )}

      {[
        ...new Set(["Matcha", "Tea", ...drinks.map((drink) => drink.category)]),
      ].map((category) => {
        const categoryDrinks = drinks.filter(
          (drink) => drink.category === category,
        );
        return (
          <section className="admin-menu-section" key={category}>
            <div class="line-container">
              <span class="line-text">{category}</span>
            </div>
            {categoryDrinks.length > 0 ? (
              <div className="admin-drink-list">
                {categoryDrinks.map((drink) => (
                  <article
                    className={`admin-drink-card${drink.isAvailable === false ? " is-unavailable" : ""}`}
                    key={drink._id}
                  >
                    {drink.imageLink ? (
                      <img src={drink.imageLink} alt={drink.name} />
                    ) : (
                      <div className="admin-image-placeholder">
                        Berry Matcha
                      </div>
                    )}
                    <div className="admin-drink-card-content">
                      <div className="admin-drink-card-title">
                        <h3>{drink.name}</h3>
                        <span>${Number(drink.price).toFixed(2)}</span>
                      </div>
                      <p className="admin-drink-status">
                        {drink.isAvailable === false
                          ? "Unavailable"
                          : "Available"}
                      </p>
                      <p className="admin-drink-sales">
                        {drinkSales.find((sale) => sale._id === drink._id)
                          ?.quantitySold ?? 0}{" "}
                        sold
                      </p>

                      <div className="admin-button-panel">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() => startEditing(drink)}
                        >
                          Edit drink
                        </button>
                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => handleDelete(drink)}
                          disabled={deletingId !== null}
                        >
                          {deletingId === drink._id
                            ? "Deleting..."
                            : "Delete drink"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No drinks in this category yet.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default Admin;
