import { axiosClient } from "./axiosClient";

export type ThingType = "thermostat" | "lamp" | "motion";

export const GatewayApi = {
    async getThingPropertiesByType<T = any>(type: ThingType): Promise<T> {
        const res = await axiosClient.get(`/things/${type}/properties`);
        return res.data;
    },

    async getThingProperty<T = any>(type: ThingType, prop: string): Promise<T> {
        const res = await axiosClient.get(`/things/${type}/properties/${prop}`);
        return res.data;
    },

    async callThingAction<T = any>(
        type: ThingType,
        action: string,
        payload?: any
    ): Promise<T> {
        const res = await axiosClient.post(`/things/${type}/actions/${action}`, payload ?? {});
        return res.data;
    },

    async listThings<T = any>(): Promise<T> {
        const res = await axiosClient.get("/things");
        return res.data;
    },

    async listByType<T = any>(type: ThingType): Promise<T> {
        const res = await axiosClient.get(`/things/type/${type}`);
        return res.data;
    },
};
