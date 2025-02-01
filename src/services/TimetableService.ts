import { Timetable, getAllLocations, getCoursesByLocation } from "../db/schema/timetable";
import { logger } from "../logging";
import { Day, PromiseReturn, ServiceReturn } from "../types";
import { convertToHuman, convertToUnix } from "../utils";
import { handleServerError } from "../utils/handleErrors";

class TimetableService {
    async GetAllLocations(): Promise<ServiceReturn<string[]>> {
        try {
            const locationsObj = await getAllLocations();
            let locations: string[] = [];
            locationsObj.forEach((location) => {
                locations.push(location.location);
            });
            locations = locations.filter((location) => location !== " - " && location !== "OT");
            return {
                status: 200,
                data: locations,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/locations");
        }
    }

    async CoursesDate(location: string, day: Day): PromiseReturn<Timetable[]> {
        try {
            const coursesInLocation = await getCoursesByLocation(location);
            const coursesDay = coursesInLocation.filter((course) => course.day == day.toString());
            return {
                status: 200,
                data: coursesDay,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses-day");
        }
    }

    async CoursesToday(location: string): Promise<ServiceReturn<Timetable[]>> {
        try {
            const coursesInLocation = await getCoursesByLocation(location);
            const today = new Date().toLocaleString("en-US", {
                weekday: "long",
            });
            // logger.info(`Today is ${today}`);

            const coursesToday = coursesInLocation.filter((course) => course.day === today);

            return {
                status: 200,
                data: coursesToday,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses-today");
        }
    }

    async CoursesRightNow(location: string): Promise<ServiceReturn<Timetable[]>> {
        try {
            const coursesToday = (await this.CoursesToday(location)).data;
            const rightNow = new Date().getTime();
            // logger.info(`Time now is ${convertToHuman(rightNow)}`);
            // logger.debug(`Unix time is ${rightNow}`);
            const coursesRightNow = coursesToday.filter((course) => {
                const startTime = convertToUnix(course.startTime);
                const endTime = convertToUnix(course.endTime);
                return rightNow >= startTime && rightNow <= endTime;
            });

            return {
                status: 200,
                data: coursesRightNow,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses-right-now");
        }
    }

    async AvailableRightNow(): Promise<ServiceReturn<string[]>> {
        try {
            const locations = (await this.GetAllLocations()).data;
            let availableRightNow: string[] = [];

            for (const location of locations) {
                const coursesRightNow = (await this.CoursesRightNow(location)).data;
                if (coursesRightNow.length === 0) {
                    availableRightNow.push(location);
                }
            }
            return {
                status: 200,
                data: availableRightNow,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/available-right-now");
        }
    }

    async AvailableAt(time: number, hours: number = 30 / 60): PromiseReturn<string[]> {
        try {
            const locations = (await this.GetAllLocations()).data;
            let availableAt: string[] = [];

            logger.info(`Checking at ${convertToHuman(time)} for ${hours} hours`);

            for (const location of locations) {
                const coursesAtWithin = (await this.CoursesWithinNHoursFrom(location, hours, time)).data;
                if (coursesAtWithin.length === 0) {
                    availableAt.push(location);
                }
            }

            return {
                status: 200,
                data: availableAt,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/available-at");
        }
    }

    async CoursesWithinNHoursFrom(
        location: string,
        hours: number,
        time: number = new Date().getTime(),
    ): Promise<ServiceReturn<Timetable[]>> {
        try {
            const coursesToday = (await this.CoursesToday(location)).data;
            const rightNow = time;

            // logger.info(`Time now is ${convertToHuman(rightNow)}`);
            // logger.debug(`Unix time is ${rightNow}`);

            const hoursMS = hours * 60 * 60 * 1000;
            const rightNowUpper = rightNow + hoursMS;
            // const rightNowLower = rightNow - hoursMS;
            const coursesWithinNHours = coursesToday.filter((course) => {
                // const startTime = convertToUnix(course.startTime);
                const endTime = convertToUnix(course.endTime);
                // return startTime >= rightNowLower && endTime <= rightNowUpper;
                return endTime <= rightNowUpper;
            });
            return {
                status: 200,
                data: coursesWithinNHours,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses-within");
        }
    }
}

export default new TimetableService();
