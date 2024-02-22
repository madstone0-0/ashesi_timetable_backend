export const convertToUnix = (time: string) =>
    new Date(new Date().toISOString().split("T")[0] + "T" + time).getTime();
