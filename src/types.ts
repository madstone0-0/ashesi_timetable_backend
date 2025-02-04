/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express";
import { Timetable } from "./db/schema/timetable";

export interface ServiceReturn<Data = any> {
    status: number;
    data: Data;
    extra?: any;
}

export type CustomRequest<Params = unknown, ReqBody = unknown> = Request<Params, unknown, ReqBody>;

export type CourseRequest = CustomRequest<unknown, { location: string }>;

export type PromiseReturn<Data = any> = Promise<ServiceReturn<Data>>;

export type Period = Pick<Timetable, "startTime"> & Pick<Timetable, "endTime">;

export type CourseSection = { course: string; section: string };

export enum Day {
    Sunday = "Sunday",
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday",
}
