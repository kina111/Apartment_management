import RoomCard from './RoomCard';

function FloorSection({ floorNumber, rooms, onRoomClick }) {
  return (
    <section className="rooms-floor-section">
      <h2 className="rooms-floor-title">Tầng {floorNumber}</h2>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <RoomCard key={room.roomCode} room={room} onClick={onRoomClick} />
        ))}
      </div>
    </section>
  );
}

export default FloorSection;
