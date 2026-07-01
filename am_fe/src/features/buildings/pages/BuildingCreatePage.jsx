import {useState} from "react";
import {createBuilding} from "../services/buildingApi.js";
import "../buildings.css";

const initialBuilding = {
    name: "",
    address: "",
    numberOfFloor: "",
    description: "",
};

function validateBuilding(building) {
    const errors = {};

    if (!building.name.trim()) {
        errors.name = "Tên toà nhà là bắt buộc";
    }

    if (!building.address.trim()) {
        errors.address = "Địa chỉ là bắt buộc";
    }

    const floor = Number(building.numberOfFloor);

    if (!building.numberOfFloor) {
        errors.numberOfFloor = "Số tầng là bắt buộc";
    } else if (!Number.isInteger(floor) || floor <= 0) {
        errors.numberOfFloor = "Số tầng phải là số nguyên lớn hơn 0";
    }

    return errors;
}


function BuildingCreatePage() {
    const [building, setBuilding] = useState(initialBuilding);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdBuilding, setCreatedBuilding] = useState(null);
    const [images, setImages] = useState([]);

    const handleChange = (e) => {
        const {name, value} = e.target;


        setBuilding((currentBuilding) => ({...currentBuilding, [name]: value}));

        setErrors((currentError) => ({...currentError, [name]: ""}));
        setSubmitError("");
    }

    const handleImagesChange = (e) => {
        const selectedImages = Array.from(e.target.files || []);
        setImages(selectedImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validate = validateBuilding(building);
        setErrors(validate);

        if (Object.keys(validate).length > 0) {
            return;
        }

        const payload = {
            name: building.name,
            address: building.address,
            numberOfFloor: Number(building.numberOfFloor),
            description: building.description,
        }

        setIsSubmitting(true);
        setSubmitError("");
        setCreatedBuilding(null);

        try {
            const result = await createBuilding(payload, images);
            setCreatedBuilding(result);
            setBuilding(initialBuilding);
            setImages([]);
        } catch (error) {
            const serverMessage =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Không thể tạo tòa nhà";

            setSubmitError(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="building-create-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Tạo tòa nhà</h1>
                </div>
            </header>

            <section className="section-card building-form-card">
                <div className="section-card-header building-form-header">
                    <div>
                        <h2 className="building-section-title">Thông tin tòa nhà</h2>
                    </div>
                </div>

                <div className="section-card-body">
                    {submitError && (
                        <p className="building-alert building-alert--danger">{submitError}</p>
                    )}

                    {createdBuilding && (
                        <div className="building-alert building-alert--success">
                            <p className="building-alert-title">Tạo tòa nhà thành công</p>
                            <p>ID: {createdBuilding.buildingId}</p>
                            <p>Tên: {createdBuilding.name}</p>
                        </div>
                    )}

                    <form className="building-form" onSubmit={handleSubmit}>
                        <div className="building-form-grid">
                            <div className="building-field">
                                <label className="building-label">Tên tòa nhà <span
                                    className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${errors.name ? "building-control--invalid" : ""}`}
                                    name="name"
                                    value={building.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên tòa nhà"/>
                                {errors.name && (
                                    <p className="building-error">{errors.name}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Địa chỉ <span
                                    className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${errors.address ? "building-control--invalid" : ""}`}
                                    name="address"
                                    value={building.address}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ"/>
                                {errors.address && (
                                    <p className="building-error">{errors.address}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số tầng <span
                                    className="required-mark">*</span></label>
                                <input
                                    className={`building-control ${errors.numberOfFloor ? "building-control--invalid" : ""}`}
                                    name="numberOfFloor"
                                    value={building.numberOfFloor}
                                    onChange={handleChange}
                                    type="number" placeholder="Nhập số tầng"/>
                                {errors.numberOfFloor && (
                                    <p className="building-error">{errors.numberOfFloor}</p>
                                )}
                            </div>

                            <div className="building-field building-field--full">
                                <label className="building-label">Mô tả</label>
                                <textarea
                                    className="building-control building-textarea"
                                    name="description"
                                    value={building.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả"
                                    rows={4}/>
                            </div>

                            <div className="building-field building-field--full">
                                <label className="building-label">Ảnh tòa nhà</label>
                                <label className="upload-zone building-upload-zone">
                                    <span className="building-upload-title">Chọn ảnh tòa nhà</span>
                                    <span
                                        className="building-upload-hint">Hỗ trợ chọn nhiều ảnh. Có thể bỏ trống.</span>
                                    <input
                                        className="building-file-input"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImagesChange}
                                    />
                                </label>
                            </div>

                            {images.length > 0 && (
                                <div className="building-selected-images building-field--full">
                                    <p className="building-selected-title">Ảnh đã chọn</p>

                                    {images.map((image) => (
                                        <p className="building-image-chip"
                                           key={`${image.name}-${image.lastModified}`}>{image.name}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="building-form-actions">
                            <button className="building-submit-button" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang gửi..." : "Gửi"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default BuildingCreatePage;
