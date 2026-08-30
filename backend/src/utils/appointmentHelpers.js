const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const generateDaySlots = (policy) => {
  const { slotDurationMinutes, defaultStartHour, defaultEndHour, lunchBreakStart, lunchBreakEnd } = policy;
  const startMin = timeToMinutes(defaultStartHour);
  const endMin = timeToMinutes(defaultEndHour);
  const lunchStart = lunchBreakStart ? timeToMinutes(lunchBreakStart) : null;
  const lunchEnd = lunchBreakEnd ? timeToMinutes(lunchBreakEnd) : null;
  const slots = [];
  for (let min = startMin; min < endMin; min += slotDurationMinutes) {
    if (lunchStart !== null && lunchEnd !== null && min >= lunchStart && min < lunchEnd) continue;
    slots.push(minutesToTime(min));
  }
  return slots;
};

const toDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const toTimeString = (date) => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

module.exports = { timeToMinutes, minutesToTime, generateDaySlots, toDateString, toTimeString };
