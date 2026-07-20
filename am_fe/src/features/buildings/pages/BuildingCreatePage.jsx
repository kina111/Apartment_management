import {useState} from "react";
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import {createBuilding} from "../services/buildingApi.js";
import "../buildings.css";

const initialBuilding = {
    name: "",
    address: "",
    numberOfFloor: "",
    area: "",
    numberOfBasement: "",
    totalRooms: "",
    yearBuilt: "",
    phoneNumber: "",
    email: "",
    description: "",
};

const currentYear = new Date().getFullYear();

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

    if (building.area) {
        const area = Number(building.area);
        if (!Number.isFinite(area) || area <= 0) {
            errors.area = "Diện tích phải lớn hơn 0";
        }
    }

    if (building.numberOfBasement) {
        const basement = Number(building.numberOfBasement);
        if (!Number.isInteger(basement) || basement < 0) {
            errors.numberOfBasement = "Số tầng hầm phải là số nguyên không âm";
        }
    }

    if (building.totalRooms) {
        const totalRooms = Number(building.totalRooms);
        if (!Number.isInteger(totalRooms) || totalRooms < 0) {
            errors.totalRooms = "Tổng số phòng phải là số nguyên không âm";
        }
    }

    if (building.yearBuilt) {
        const yearBuilt = Number(building.yearBuilt);
        if (!Number.isInteger(yearBuilt) || yearBuilt < 1800 || yearBuilt > currentYear) {
            errors.yearBuilt = `Năm xây dựng phải từ 1800 đến ${currentYear}`;
        }
    }

    if (building.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(building.email.trim())) {
        errors.email = "Email không hợp lệ";
    }

    return errors;
}

function optionalNumber(value) {
    return value === "" ? undefined : Number(value);
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
            area: optionalNumber(building.area),
            numberOfBasement: optionalNumber(building.numberOfBasement),
            totalRooms: optionalNumber(building.totalRooms),
            yearBuilt: optionalNumber(building.yearBuilt),
            phoneNumber: building.phoneNumber,
            email: building.email,
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

                            <div className="building-field">
                                <label className="building-label">Diện tích (m²)</label>
                                <input
                                    className={`building-control ${errors.area ? "building-control--invalid" : ""}`}
                                    name="area"
                                    value={building.area}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Nhập diện tích"/>
                                {errors.area && (
                                    <p className="building-error">{errors.area}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số tầng hầm</label>
                                <input
                                    className={`building-control ${errors.numberOfBasement ? "building-control--invalid" : ""}`}
                                    name="numberOfBasement"
                                    value={building.numberOfBasement}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    placeholder="Nhập số tầng hầm"/>
                                {errors.numberOfBasement && (
                                    <p className="building-error">{errors.numberOfBasement}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Tổng số phòng</label>
                                <input
                                    className={`building-control ${errors.totalRooms ? "building-control--invalid" : ""}`}
                                    name="totalRooms"
                                    value={building.totalRooms}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    placeholder="Nhập tổng số phòng"/>
                                {errors.totalRooms && (
                                    <p className="building-error">{errors.totalRooms}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Năm xây dựng</label>
                                <input
                                    className={`building-control ${errors.yearBuilt ? "building-control--invalid" : ""}`}
                                    name="yearBuilt"
                                    value={building.yearBuilt}
                                    onChange={handleChange}
                                    type="number"
                                    min="1800"
                                    max={currentYear}
                                    placeholder="Nhập năm xây dựng"/>
                                {errors.yearBuilt && (
                                    <p className="building-error">{errors.yearBuilt}</p>
                                )}
                            </div>

                            <div className="building-field">
                                <label className="building-label">Số điện thoại liên hệ</label>
                                <input
                                    className="building-control"
                                    name="phoneNumber"
                                    value={building.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"/>
                            </div>

                            <div className="building-field">
                                <label className="building-label">Email liên hệ</label>
                                <input
                                    className={`building-control ${errors.email ? "building-control--invalid" : ""}`}
                                    name="email"
                                    value={building.email}
                                    onChange={handleChange}
                                    type="email"
                                    placeholder="Nhập email liên hệ"/>
                                {errors.email && (
                                    <p className="building-error">{errors.email}</p>
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
                            <Button as={Link} variant="outline-secondary" to="/buildings">
                                Trở về
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang gửi..." : "Gửi"}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default BuildingCreatePage;
