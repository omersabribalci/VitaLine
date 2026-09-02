const {
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  getDay,
  differenceInCalendarDays,
  isWithinInterval,
  parseISO,
  parse,
  addMinutes,
  format,
  isToday,
} = require("date-fns");

/**
 * String tarih bilgisini ("2026-09-02") sunucunun yerel zaman diliminde 00:00 olarak parse eder.
 * UTC kayma hatalarını ve gün kaymalarını engeller.
 */
const parseLocalDate = (dateStr) => {
  return parse(dateStr, "yyyy-MM-dd", new Date());
};

// Geçmiş gün, booking window, çalışma günü ve doktor izni kurallarını denetler.
// Hata varsa hata mesajı string'i döner, her şey yolundaysa null döner.
const checkDateRules = (targetDate, policy, doctor) => {
  const today = startOfDay(new Date());

  // 1. Geçmiş bir gün mü?
  if (isBefore(targetDate, today)) {
    return "Appointment date must be in the future.";
  }

  // 2. Randevu penceresinin (bookingWindowDays) dışında mı?
  if (differenceInCalendarDays(targetDate, today) > policy.bookingWindowDays) {
    return `Appointments can only be booked up to ${policy.bookingWindowDays} days in advance.`;
  }

  // 3. Çalışma günü mü?
  if (!policy.workingDays.includes(getDay(targetDate))) {
    return "Appointments cannot be booked on non-working days.";
  }

  // 4. Doktor izinli mi?
  if (doctor.unavailableDates && doctor.unavailableDates.length > 0) {
    const isDoctorUnavailable = doctor.unavailableDates.some((range) =>
      isWithinInterval(targetDate, {
        start: startOfDay(new Date(range.start)),
        end: endOfDay(new Date(range.end)),
      }),
    );
    if (isDoctorUnavailable) {
      return "The selected doctor is not available on this date.";
    }
  }

  return null;
};

// Seçilen tarihin randevu alınabilir bir gün olup olmadığını kontrol eder.
const isDateAvailableForBooking = (targetDate, policy, doctor) => {
  const errorMsg = checkDateRules(targetDate, policy, doctor);
  return errorMsg === null; // Hata yoksa true, varsa false döner
};

// Mesai saatleri sınırları içinde mi denetler (taşma engelli)
const isWithinWorkingHours = (timeString, endTimeString, policy) => {
  return (
    timeString >= policy.workingTimeStart &&
    endTimeString <= policy.workingTimeEnd
  );
};

// Verilen randevu slotunun (başlangıç ve bitiş) öğle arasına denk gelip gelmediğini kontrol eder.
const isDuringLunchBreak = (timeString, slotEndTimeString, policy) => {
  const { lunchBreakStart, lunchBreakEnd } = policy;
  if (!lunchBreakStart || !lunchBreakEnd) return false;

  // Slot başlangıcı öğle bitişinden önce VE slot bitişi öğle başlangıcından sonra ise çakışır
  return timeString < lunchBreakEnd && slotEndTimeString > lunchBreakStart;
};

// Günün mesai saatleri içindeki tüm slotlarını üretir ve durumlarını belirler.
const generateSlotsForDay = (
  policy,
  targetDate,
  targetDateStr,
  existingAppointments,
) => {
  const startTime = parse(
    `${targetDateStr} ${policy.workingTimeStart}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );
  const endTime = parse(
    `${targetDateStr} ${policy.workingTimeEnd}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );

  const bookedTimes = new Set(
    existingAppointments.map((app) =>
      format(new Date(app.dateAndTime || app.date), "HH:mm"),
    ),
  );

  const now = new Date();
  const isTargetToday = isToday(targetDate);
  const slots = [];
  let currentSlot = startTime;

  while (isBefore(currentSlot, endTime)) {
    // Slotun bitiş zamanını hesapla
    const slotEnd = addMinutes(currentSlot, policy.appointmentDurationMinutes);

    // KURAL: Eğer randevunun bitiş saati mesai bitimini aşıyorsa bu slotu üretme ve dur!
    if (isAfter(slotEnd, endTime)) {
      break;
    }

    const timeString = format(currentSlot, "HH:mm");
    const slotEndTimeString = format(slotEnd, "HH:mm");

    // Öğle arası çakışma kontrolü
    if (!isDuringLunchBreak(timeString, slotEndTimeString, policy)) {
      const isBooked = bookedTimes.has(timeString);
      const isPast = isTargetToday && isBefore(currentSlot, now);

      slots.push({
        time: timeString,
        isAvailable: !isBooked && !isPast,
      });
    }

    currentSlot = slotEnd;
  }

  return slots;
};

module.exports = {
  parseLocalDate,
  checkDateRules,
  isDateAvailableForBooking,
  isWithinWorkingHours,
  isDuringLunchBreak,
  generateSlotsForDay,
};
