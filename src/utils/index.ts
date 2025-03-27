function to24Hour(time: string): string {
    // Normalize input (trim, lowercase)
    const t = time.trim().toLowerCase();
    // Regex: matches "h:mm" or "hh:mm" optionally with ":ss" and "am"/"pm"
    const regex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/;
    const match = t.match(regex);
    if (!match) {
        throw new Error("Invalid time format");
    }
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const second = match[3] || "00";
    const period = match[4];

    if (period) {
        // If "pm" and not 12 pm, add 12.
        if (period === "pm" && hour < 12) {
            hour += 12;
        }
        // If "am" and hour is 12, convert to 0.
        if (period === "am" && hour === 12) {
            hour = 0;
        }
    }
    const hourStr = hour.toString().padStart(2, "0");
    return `${hourStr}:${minute}:${second}`;
}

export const convertToUnix = (time: string) => {
    const now = new Date().toISOString().split("T")[0];
    const time0100 = to24Hour(time);
    const newDate = new Date(`${now}T${time0100}`);
    return newDate.getTime();
};

export const convertToHuman = (time: number): string =>
    new Date(time).toLocaleTimeString("en-US", {
        hour12: false,
    });
