import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FileEarmarkImage } from 'react-bootstrap-icons';
import styles from './AttachmentGallery.module.css';

export default function AttachmentGallery({ images }) {
  const [previewImage, setPreviewImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4 text-muted border rounded border-dashed">
        <FileEarmarkImage size={24} className="mb-2 text-secondary" />
        <div style={{ fontSize: '13px' }}>Không có ảnh đính kèm nào.</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.contractImageGallery}>
        {images.map((img) => (
          <img
            key={img.imageId || img.imageUrl}
            src={img.imageUrl}
            alt="contract attachment"
            className={styles.contractImageThumb}
            onClick={() => setPreviewImage(img.imageUrl)}
          />
        ))}
      </div>

      <Modal show={!!previewImage} onHide={() => setPreviewImage(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết ảnh đính kèm</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={previewImage}
            alt="contract detail"
            style={{ maxWidth: '100%', maxHeight: '75vh' }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
