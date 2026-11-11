import { useEffect, useRef } from "react";
import styles from "./Admin.module.css";

function EditModal({
  editingId,
  formData,
  imagePreview,
  message,
  saving,
  selectedImage,
  onClose,
  onChange,
  onImageChange,
  onSubmit,
}) {
  const drinkNameInput = useRef(null);

  useEffect(() => {
    drinkNameInput.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, saving]);

  return (
    <div
      className={styles["admin-modal-backdrop"]}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className={styles["admin-modal"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className={styles["admin-modal-heading"]}>
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
            className={styles["admin-modal-close"]}
            aria-label="Close dialog"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>
        <form className={styles["admin-drink-form"]} onSubmit={onSubmit}>
          <label>
            Drink name
            <input
              ref={drinkNameInput}
              name="name"
              value={formData.name}
              onChange={onChange}
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
              onChange={onChange}
              required
            />
          </label>
          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
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
              onChange={onImageChange}
              disabled={saving}
            />
            <span>PNG, JPG, WebP, or GIF; maximum 5 MB.</span>
            {(imagePreview || formData.imageLink) && (
              <img
                className={styles["admin-image-preview"]}
                src={imagePreview || formData.imageLink}
                alt="Drink preview"
              />
            )}
          </label>
          <label className={styles["admin-field-wide"]}>
            Description
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={onChange}
            />
          </label>
          <label className={styles["admin-field-wide"]}>
            Allergens
            <input
              name="allergens"
              value={formData.allergens}
              onChange={onChange}
            />
          </label>
          <label className={styles["admin-availability"]}>
            <input
              name="isAvailable"
              type="checkbox"
              checked={formData.isAvailable}
              onChange={onChange}
            />
            Available to order
          </label>
          <div
            className={`${styles["admin-form-actions"]} ${styles["admin-field-wide"]}`}
          >
            <button
              type="submit"
              className={styles["admin-primary-button"]}
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
                className={styles["admin-secondary-button"]}
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
          {message && (
            <p className={styles["admin-message"]} role="status">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default EditModal;
