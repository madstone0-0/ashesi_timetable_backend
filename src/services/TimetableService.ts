import { Optional } from "express-validator/lib/context";
import {
    Timetable,
    getAllCoursesAndSections,
    getAllLocations,
    getCourseInfoByDayAndSection,
    getCoursesByLocation,
} from "../db/schema/timetable";
import { logger } from "../logging";
import { CourseSection, Day, Period, PromiseReturn, ServiceReturn } from "../types";
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
            const rightNowLower = rightNow - hoursMS;
            const coursesWithinNHours = coursesToday.filter((course) => {
                const startTime = convertToUnix(course.startTime);
                const endTime = convertToUnix(course.endTime);
                return startTime <= rightNowUpper && endTime >= rightNowLower;
            });
            return {
                status: 200,
                data: coursesWithinNHours,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses-within");
        }
    }

    async GetAllCourseSections(): PromiseReturn<{ course: string; sections: string[] }[]> {
        try {
            const courseSections = await getAllCoursesAndSections();
            const courseMap = new Map<string, string[]>();

            for (const courseSection of courseSections) {
                const { course, section } = courseSection;
                const sections = courseMap.get(course);
                if (!sections) courseMap.set(course, [section]);
                else sections.push(section);
            }

            const formattedCourses: { course: string; sections: string[] }[] = [];
            for (const kv of courseMap) {
                formattedCourses.push({
                    course: kv[0],
                    sections: kv[1].sort(),
                });
            }

            return {
                status: 200,
                data: formattedCourses,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/courses");
        }
    }

    private mergePeriods(periods: { startTime: number; endTime: number }[]) {
        let currPeriod = periods[0];
        const res = [];
        for (const period of periods.slice(1, periods.length)) {
            if (currPeriod.endTime >= period.startTime) {
                currPeriod.endTime = Math.max(currPeriod.endTime, period.endTime);
            } else {
                res.push(currPeriod);
                currPeriod = period;
            }
        }
        res.push(currPeriod);
        return res;
    }

    private findCommonFreeTime(periods: Period[]): Period[] {
        const uniqueKeys = new Set<string>();
        const distinctPeriods: Period[] = [];
        for (const period of periods) {
            const key = `${period.startTime}|${period.endTime}`;
            if (!uniqueKeys.has(key)) {
                distinctPeriods.push(period);
                uniqueKeys.add(key);
            }
        }

        const periodArray = this.mergePeriods(
            distinctPeriods
                .map((period) => {
                    return { startTime: convertToUnix(period.startTime), endTime: convertToUnix(period.endTime) };
                })
                .sort((a, b) => a.startTime - b.startTime),
        );

        const freePeriods: Period[] = [];
        for (let i = 1; i < periodArray.length; i++) {
            const prevEnd = periodArray[i - 1].endTime;
            const currStart = periodArray[i].startTime;
            if (prevEnd < currStart) {
                freePeriods.push({
                    startTime: convertToHuman(prevEnd),
                    endTime: convertToHuman(currStart),
                });
            }
        }
        return freePeriods;
    }

    async FindFreeTime(courseSections: CourseSection[], day: Day, minDuration?: number): PromiseReturn<Period[]> {
        try {
            const periods: Period[] = [];
            for (const courseSection of courseSections) {
                const { course, section } = courseSection;
                const info = await getCourseInfoByDayAndSection(course, day, section);
                info.map((i) => {
                    periods.push({
                        startTime: i.startTime,
                        endTime: i.endTime,
                    });
                });
            }

            let freePeriods = this.findCommonFreeTime(periods);
            // minDuration in minutes
            if (minDuration) {
                logger.info(`Minimum Duration: ${minDuration}`);
                freePeriods = freePeriods.filter((p) => {
                    const diff = convertToUnix(p.endTime) - convertToUnix(p.startTime);
                    logger.info(`Difference: ${diff}`);
                    return diff >= minDuration * 60 * 1000; // Convert to milliseconds
                });
            }

            return {
                status: 200,
                data: freePeriods,
            };
        } catch (e) {
            return handleServerError(e, "/timetable/common-free-time");
        }
    }
}

export default new TimetableService();
