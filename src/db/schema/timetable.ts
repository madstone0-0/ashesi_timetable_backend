import { pgTable, varchar, date } from "drizzle-orm/pg-core";
import { InferSelectModel, eq, sql } from "drizzle-orm";
import db from "../../db";

export const timetable = pgTable("timetable", {
    day: varchar("day").notNull(),
    periodName: varchar("period_name").notNull(),
    startTime: date("start_time").notNull(),
    endTime: date("end_time").notNull(),
    location: varchar("location").notNull(),
    courseCode: varchar("course_code").notNull(),
    section: varchar("section").notNull(),
});

export type Timetable = InferSelectModel<typeof timetable>;

const locations = db.selectDistinct({ location: timetable.location }).from(timetable).orderBy(timetable.location);

const coursesByLocation = db
    .select()
    .from(timetable)
    .where(eq(timetable.location, sql.placeholder("location")));

export const getAllLocations = async () => locations.execute();

export const getCoursesByLocation = async (location: string) => coursesByLocation.execute({ location });
