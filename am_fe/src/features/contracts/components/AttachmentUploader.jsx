import { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import styles from './AttachmentUploader.module.css';

export default function AttachmentUploader({
  imagePreviews,
  onImagesChange,
  id = 'images-input',
  label = 'Chọn các ảnh scan hợp đồng giấy',
}) {
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);

    // Revoke previous object URLs
    imagePreviews.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    onImagesChange(files, newPreviews);
  };

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <Form.Control
          id={id}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
        />
      </Form.Group>

      {imagePreviews.length > 0 && (
        <div className={styles.contractImageGallery}>
          {imagePreviews.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="uploaded preview"
              className={styles.contractImageThumb}
            />
          ))}
        </div>
      )}
    </div>
  );
}
