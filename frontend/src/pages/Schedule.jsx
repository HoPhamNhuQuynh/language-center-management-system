import logo from "../assets/hero.png";
import ScheduleForm from "../components/ScheduleForm";
import "./Schedule.css";

function Schedule() {
  const weekLabel = "";

  const user = {
    name: "Le Minh Khoi",
    id: "123456789",
  };

  const scheduleData = [
    {
      day: "MONDAY",
      dateLabel: "17/03",
      className: "TANC1",
      time: "18:00 - 20:00",
      room: "A101",
      teacher: "GV: Thanh Lan",
    },
    {
      day: "WEDNESDAY",
      dateLabel: "19/03",
      className: "TANC1",
      time: "18:00 - 20:00",
      room: "A101",
      teacher: "GV: Thanh Lan",
    },
    {
      day: "FRIDAY",
      dateLabel: "21/03",
      className: "TANC1",
      time: "18:00 - 20:00",
      room: "A101",
      teacher: "GV: Thanh Lan",
    },
  ];

  return (
    <ScheduleForm
      logo={logo}
      user={user}
      weekLabel={weekLabel}
      scheduleData={scheduleData}
    />
  );
}

export default Schedule;