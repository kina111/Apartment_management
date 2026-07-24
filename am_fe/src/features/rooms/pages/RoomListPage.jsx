import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import RoomFilterBar from "../components/RoomFilterBar";
import FloorSection from "../components/FloorSection";
import {
  createRoomType,
  getRoomsByBuilding,
  getRoomTypes,
  quickCreateRoom,
} from "../services/roomApi";
import "../rooms.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext.jsx";

const initialRoomForm = {
  roomName: "",
  floorNumber: "",
  roomTypeId: "",
};

const initialRoomTypeForm = {
  name: "",
  capacity: "",
  area: "",
  description: "",
};

function validateRoom(room) {
  const errors = {};

  if (!room.roomName.trim()) errors.roomName = "Tên phòng là bắt buộc";

  const floorNumber = Number(room.floorNumber);
  if (!room.floorNumber) {
    errors.floorNumber = "Tầng là bắt buộc";
  } else if (!Number.isInteger(floorNumber) || floorNumber <= 0) {
    errors.floorNumber = "Tầng phải là số nguyên lớn hơn 0";
  }

  if (!room.roomTypeId) errors.roomTypeId = "Loại phòng là bắt buộc";

  return errors;
}

function validateRoomType(roomType) {
  const errors = {};

  if (!roomType.name.trim()) errors.name = "Tên loại phòng là bắt buộc";

  const capacity = Number(roomType.capacity);
  if (!roomType.capacity) {
    errors.capacity = "Sức chứa là bắt buộc";
  } else if (!Number.isInteger(capacity) || capacity <= 0) {
    errors.capacity = "Sức chứa phải là số nguyên lớn hơn 0";
  }

  const area = Number(roomType.area);
  if (!roomType.area) {
    errors.area = "Diện tích là bắt buộc";
  } else if (!Number.isFinite(area) || area <= 0) {
    errors.area = "Diện tích phải lớn hơn 0";
  }

  return errors;
}

function RoomListPage({ buildings }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManageRooms = role !== "MANAGER";
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchValue, setSearchValue] = useState("");
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [roomErrors, setRoomErrors] = useState({});
  const [createRoomError, setCreateRoomError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState(initialRoomTypeForm);
  const [roomTypeErrors, setRoomTypeErrors] = useState({});
  const [roomTypeError, setRoomTypeError] = useState("");
  const [isCreatingRoomType, setIsCreatingRoomType] = useState(false);

  /* ── Chọn building đầu tiên khi buildings thay đổi ── */
  useEffect(() => {
    if (buildings?.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(buildings[0].buildingId);
    }
  }, [buildings]);

  useEffect(() => {
    if (!canManageRooms) return;

    const fetchRoomTypes = async () => {
      try {
        const data = await getRoomTypes();
        setRoomTypes(data);
      } catch (err) {
        console.error("Lỗi tải loại phòng:", err);
      }
    };

    fetchRoomTypes();
  }, [canManageRooms]);

  /* ── Load rooms theo building ── */
  useEffect(() => {
    if (!selectedBuildingId) return;
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const data = await getRoomsByBuilding(selectedBuildingId);
        setRooms(data);
      } catch (err) {
        console.error("Lỗi tải danh sách phòng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [selectedBuildingId]);

  /* ── Filter + search ── */
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchFilter =
        activeFilter === "ALL" || room.status === activeFilter;
      const searchableRoomName = room.roomName || room.roomCode;
      const matchSearch = searchableRoomName
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [rooms, activeFilter, searchValue]);

  /* ── Group by floor ── */
  const floorMap = useMemo(() => {
    const map = new Map();
    filteredRooms.forEach((room) => {
      const floor = room.floorNumber;
      if (!map.has(floor)) map.set(floor, []);
      map.get(floor).push(room);
    });
    return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
  }, [filteredRooms]);

  /* ── Handle room click ── */
  const handleRoomClick = (room) => {
    navigate(`/rooms/${room.roomCode}`, {
      state: { room },
    });
  };

  const openCreateRoomModal = () => {
    setRoomForm({
      ...initialRoomForm,
      roomTypeId: roomTypes[0]?.roomTypeId ? String(roomTypes[0].roomTypeId) : "",
    });
    setRoomErrors({});
    setCreateRoomError("");
    setShowCreateRoomModal(true);
  };

  const closeCreateRoomModal = () => {
    setShowCreateRoomModal(false);
    setRoomForm(initialRoomForm);
    setRoomErrors({});
    setCreateRoomError("");
  };

  const handleRoomFormChange = (event) => {
    const { name, value } = event.target;

    setRoomForm((current) => ({ ...current, [name]: value }));
    setRoomErrors((current) => ({ ...current, [name]: "" }));
    setCreateRoomError("");
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();

    if (!selectedBuildingId) {
      setCreateRoomError("Vui lòng chọn tòa nhà trước khi tạo phòng");
      return;
    }

    const validationErrors = validateRoom(roomForm);
    setRoomErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsCreatingRoom(true);
    setCreateRoomError("");

    try {
      const createdRoom = await quickCreateRoom(selectedBuildingId, {
        roomName: roomForm.roomName,
        floorNumber: Number(roomForm.floorNumber),
        roomTypeId: Number(roomForm.roomTypeId),
      });
      setRooms((current) => [...current, createdRoom]);
      closeCreateRoomModal();
    } catch (err) {
      setCreateRoomError("Không thể tạo phòng");
      console.error("Lỗi tạo phòng:", err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const openRoomTypeModal = () => {
    setRoomTypeForm(initialRoomTypeForm);
    setRoomTypeErrors({});
    setRoomTypeError("");
    setShowRoomTypeModal(true);
  };

  const closeRoomTypeModal = () => {
    setShowRoomTypeModal(false);
    setRoomTypeForm(initialRoomTypeForm);
    setRoomTypeErrors({});
    setRoomTypeError("");
  };

  const handleRoomTypeChange = (event) => {
    const { name, value } = event.target;

    setRoomTypeForm((current) => ({ ...current, [name]: value }));
    setRoomTypeErrors((current) => ({ ...current, [name]: "" }));
    setRoomTypeError("");
  };

  const handleCreateRoomType = async (event) => {
    event.preventDefault();

    const validationErrors = validateRoomType(roomTypeForm);
    setRoomTypeErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsCreatingRoomType(true);
    setRoomTypeError("");

    try {
      const createdRoomType = await createRoomType({
        name: roomTypeForm.name,
        capacity: Number(roomTypeForm.capacity),
        area: Number(roomTypeForm.area),
        description: roomTypeForm.description,
      });
      setRoomTypes((current) => [createdRoomType, ...current]);
      setRoomForm((current) => ({
        ...current,
        roomTypeId: String(createdRoomType.roomTypeId),
      }));
      closeRoomTypeModal();
    } catch (err) {
      setRoomTypeError("Không thể tạo loại phòng");
      console.error("Lỗi tạo loại phòng:", err);
    } finally {
      setIsCreatingRoomType(false);
    }
  };

  return (
    <div className="rooms-page">
      {/* ── Building selector ── */}
      {buildings?.length > 0 && (
        <div className="rooms-building-toolbar mb-3">
          <select
            className="rooms-building-select"
            value={selectedBuildingId || ""}
            onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
          >
            {buildings.map((building) => (
              <option key={building.buildingId} value={building.buildingId}>
                {building.name}
              </option>
            ))}
          </select>
          {canManageRooms && (
            <div className="rooms-building-actions">
              <Button type="button" variant="outline-primary" onClick={openRoomTypeModal}>
                Thêm loại phòng
              </Button>
              <Button type="button" onClick={openCreateRoomModal} disabled={!selectedBuildingId}>
                Thêm phòng
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Filter bar ── */}
      <RoomFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {/* ── Content: FloorSection + RoomCard ── */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : floorMap.size === 0 ? (
        <div className="rooms-empty">
          <div className="rooms-empty-icon">
            <InfoCircle size={24} />
          </div>
          <p className="mb-0">Không tìm thấy phòng nào.</p>
        </div>
      ) : (
        [...floorMap.entries()].map(([floorNumber, floorRooms]) => (
          <FloorSection
            key={floorNumber}
            floorNumber={floorNumber}
            rooms={floorRooms}
            onRoomClick={handleRoomClick}
          />
        ))
      )}

      <Modal show={showCreateRoomModal} onHide={closeCreateRoomModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm phòng</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleCreateRoom}>
          <Modal.Body>
            {createRoomError && <Alert variant="danger">{createRoomError}</Alert>}
            {roomTypes.length === 0 && (
              <Alert variant="warning">
                Chưa có loại phòng. Vui lòng thêm loại phòng trước khi tạo phòng.
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Tên phòng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="roomName"
                value={roomForm.roomName}
                onChange={handleRoomFormChange}
                isInvalid={Boolean(roomErrors.roomName)}
                placeholder="Ví dụ: Phòng 101"
              />
              <Form.Control.Feedback type="invalid">{roomErrors.roomName}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tầng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="floorNumber"
                type="number"
                min="1"
                value={roomForm.floorNumber}
                onChange={handleRoomFormChange}
                isInvalid={Boolean(roomErrors.floorNumber)}
                placeholder="Nhập số tầng"
              />
              <Form.Control.Feedback type="invalid">{roomErrors.floorNumber}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Loại phòng <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="roomTypeId"
                value={roomForm.roomTypeId}
                onChange={handleRoomFormChange}
                isInvalid={Boolean(roomErrors.roomTypeId)}
                disabled={roomTypes.length === 0}
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map((roomType) => (
                  <option value={roomType.roomTypeId} key={roomType.roomTypeId}>
                    {roomType.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{roomErrors.roomTypeId}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline-secondary" onClick={closeCreateRoomModal}>Hủy</Button>
            <Button type="submit" disabled={isCreatingRoom || roomTypes.length === 0}>
              {isCreatingRoom ? "Đang tạo..." : "Tạo phòng"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={showRoomTypeModal} onHide={closeRoomTypeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm loại phòng</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleCreateRoomType}>
          <Modal.Body>
            {roomTypeError && <Alert variant="danger">{roomTypeError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Tên loại phòng <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="name"
                value={roomTypeForm.name}
                onChange={handleRoomTypeChange}
                isInvalid={Boolean(roomTypeErrors.name)}
                placeholder="Ví dụ: Standard"
              />
              <Form.Control.Feedback type="invalid">{roomTypeErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sức chứa <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="capacity"
                type="number"
                min="1"
                value={roomTypeForm.capacity}
                onChange={handleRoomTypeChange}
                isInvalid={Boolean(roomTypeErrors.capacity)}
                placeholder="Số người"
              />
              <Form.Control.Feedback type="invalid">{roomTypeErrors.capacity}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Diện tích (m²) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                name="area"
                type="number"
                min="0"
                step="0.01"
                value={roomTypeForm.area}
                onChange={handleRoomTypeChange}
                isInvalid={Boolean(roomTypeErrors.area)}
                placeholder="Diện tích"
              />
              <Form.Control.Feedback type="invalid">{roomTypeErrors.area}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={roomTypeForm.description}
                onChange={handleRoomTypeChange}
                placeholder="Mô tả loại phòng"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" variant="outline-secondary" onClick={closeRoomTypeModal}>Hủy</Button>
            <Button type="submit" disabled={isCreatingRoomType}>
              {isCreatingRoomType ? "Đang lưu..." : "Thêm loại phòng"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default RoomListPage;
