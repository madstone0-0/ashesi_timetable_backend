import {
    Timetable,
    getAllLocations,
    getCoursesByLocation,
} from "../db/schema/timetable";
import { logger } from "../logging";
import { ServiceReturn } from "../types";
import { convertToUnix } from "../utils";
import { handleServerError } from "../utils/handleErrors";

class TimetableService {
    async GetAllLocations(): Promise<ServiceReturn> {
        try {
            const locationsObj = await getAllLocations();
            let locations: string[] = [];
            locationsObj.forEach((location) => {
                locations.push(location.location);
            });
            locations = locations.filter(
                (location) => location !== " - " && location !== "OT",
            );
            return {
                status: 200,
                data: locations,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/locations");
        }
    }

    async CoursesToday(location: string): Promise<ServiceReturn<Timetable[]>> {
        try {
            const coursesInLocation = await getCoursesByLocation(location);
            const today = new Date().toLocaleString("en-US", {
                weekday: "long",
            });
            logger.info(`Today is ${today}`);

            const coursesToday = coursesInLocation.filter(
                (course) => course.day === today,
            );

            return {
                status: 200,
                data: coursesToday,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses-today");
        }
    }

    async CoursesRightNow(location: string): Promise<ServiceReturn> {
        try {
            const coursesToday = (await this.CoursesToday(location)).data;
            const rightNow = new Date().getTime();
            logger.info(`Time is ${rightNow}`);
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

    async CoursesWithinNHours(
        location: string,
        hours: number,
    ): Promise<ServiceReturn> {
        try {
            const coursesToday = (await this.CoursesToday(location)).data;
            const rightNow = new Date().getTime();
            logger.info(`Time is ${rightNow}`);
            const hoursMS = hours * 60 * 60 * 1000;
            const rightNowUpper = rightNow + hoursMS;
            const rightNowLower = rightNow - hoursMS;
            const coursesWithinNHours = coursesToday.filter((course) => {
                const startTime = convertToUnix(course.startTime);
                const endTime = convertToUnix(course.endTime);
                return startTime >= rightNowLower && endTime <= rightNowUpper;
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
