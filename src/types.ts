import type { Request } from "express";

export interface ServiceReturn<Data = any> {
    status: number;
    data: Data;
    extra?: any;
}

export type CustomRequest<Params = unknown, ReqBody = unknown> = Request<
    Params,
    unknown,
    ReqBody
>;
