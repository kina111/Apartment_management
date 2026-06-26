import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";
import RoomFilterBar from "../components/RoomFilterBar";
import FloorSection from "../components/FloorSection";
import {
  getRoomsByBuilding,
} from "../services/roomApi";
import "../rooms.css";
import { useNavigate } from "react-router-dom";

function RoomListPage({ buildings }) {
  const navigate = useNavigate();
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchValue, setSearchValue] = useState("");

  /* ── Chọn building đầu tiên khi buildings thay đổi ── */
  useEffect(() => {
    if (buildings?.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(buildings[0].buildingId);
    }
  }, [buildings]);

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
      const matchSearch = room.roomCode
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

  return (
    <div className="rooms-page">
      {/* ── Building selector ── */}
      {buildings?.length > 0 && (
        <div className="rooms-building-selector mb-3">
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
        </div>
      )}

      {/* ── Info alert ── */}
      <Alert
        variant="info"
        className="rooms-info-alert d-flex align-items-center gap-2 mb-3"
      >
        <InfoCircle size={18} className="text-primary flex-shrink-0" />
        <span>
          Quyền truy cập: <Alert.Link href="#">Quản lý</Alert.Link>. Bạn hiện
          đang ở chế độ <strong>CHỈ XEM</strong>. Một số thay đổi sẽ không thể
          thực hiện.
        </span>
      </Alert>

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
    </div>
  );
}

export default RoomListPage;
