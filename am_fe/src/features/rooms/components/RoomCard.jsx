import { Badge } from "react-bootstrap";

const STATUS_MAP = {
  AVAILABLE: {
    label: "Trống",
    className: "room-status-badge room-status-badge--vacant",
  },
  RENTED: {
    label: "Đang thuê",
    className: "room-status-badge room-status-badge--rented",
  },
  MAINTENANCE: {
    label: "Đang sửa",
    className: "room-status-badge room-status-badge--maintenance",
  },
};

function RoomCard({ room, onClick }) {
  const status = STATUS_MAP[room.status] || STATUS_MAP.AVAILABLE;

  const cardModifier =
    room.status === "AVAILABLE"
      ? "room-card--vacant"
      : room.status === "MAINTENANCE"
        ? "room-card--maintenance"
        : "room-card--rented";

  return (
    <div
      className={`room-card ${cardModifier}`}
      onClick={() => onClick?.(room)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.(room);
      }}
    >
      <div className="room-card-header">
        <h3 className="room-card-number">{room.roomName || `Phòng ${room.roomCode}`}</h3>
        <span className={status.className}>{status.label}</span>
      </div>
      <p className="room-card-tenant">
        {room.roomType.name} - {room.roomType.area} m² -{room.roomType.capacity}
      </p>
    </div>
  );
}

export default RoomCard;
